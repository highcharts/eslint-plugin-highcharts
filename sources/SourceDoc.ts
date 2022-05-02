/**
 * @author Sophie Bremer
 */


'use strict';


/* *
 *
 *  Imports
 *
 * */


import * as TS from 'typescript';
import * as U from './Utilities';
import SourceDocTag from './SourceDocTag';
import SourceLine from './SourceLine';
import SourceToken from './SourceToken';


/* *
 *
 *  Class
 *
 * */


export class SourceDoc extends SourceLine implements SourceToken {


    /* *
     *
     *  Static Functions
     *
     * */


    private static decorateTag(
        tag: SourceDocTag,
        lineBreak: string
    ): SourceDocTag {

        const match = tag.text.match(
            /^@(\w+)( +\{[\w.()<>]+\})?( +[^\[\]\s]+|\[[^\[\]\s]+\])?(.*)$/su
        );

        if (match) {
            tag.text = match[4] || '';

            if (match[1]) {
                tag.tagKind = match[1];
            }
            if (match[2]) {
                tag.tagType = match[2]
            }
            if (match[3]) {
                tag.tagName = match[3]
            }
        }

        if (tag.text.startsWith(lineBreak)) {
            tag.text = tag.text.substr(lineBreak.length);
        }

        return tag;
    }


    public static isSourceDoc(
        text: string
    ): boolean {
        return /^\/\*\*\s/.test(text);
    }


    /* *
     *
     *  Constructor
     *
     * */


    public constructor (
        text: string,
        lineBreak: string = '\n',
        indent: number = 0
    ) {
        super(lineBreak);

        this.kind = TS.SyntaxKind.JSDocComment;
        this.indent = indent;
        this.text = text;
        this.tokens = [];

        const tags = this.tokens,
            lines = text
                .substr(3, text.length - 5)
                .split(U.lineBreaks)
                .slice(1, -1);

        let line: string,
            tag: SourceDocTag = {
                kind: TS.SyntaxKind.JSDocTag,
                tagKind: 'description',
                text: ''
            };

        tags.push(tag);

        for (let i = 0, iEnd = lines.length; i < iEnd; ++i) {
            line = lines[i].substr(indent).replace(/^ \* ?/gu, '');

            if (!line && tags.length > 1) {
                tags.push({
                    kind: TS.SyntaxKind.WhitespaceTrivia,
                    tagKind: '',
                    text: ''
                });
            } else if (line.startsWith('@')) {
                if (!i) {
                    tags.pop(); // remove empty description
                }

                tag = {
                    kind: TS.SyntaxKind.JSDocTag,
                    tagKind: '',
                    text: line
                };

                tags.push(tag);
            } else {
                tag.text += lineBreak + line;
            }
        }

        for (const tag of tags) {
            SourceDoc.decorateTag(tag, lineBreak);
        }
    }


    /* *
     *
     *  Properties
     *
     * */


    public readonly kind: TS.SyntaxKind.JSDocComment;


    private readonly indent: number;


    public readonly text: string;


    public readonly tokens: Array<SourceDocTag>;


    /* *
     *
     *  Functions
     *
     * */


    public getIndent(): number {
        return this.indent;
    }


    public toString(
        maximalLength?: number
    ): string {

        if (!maximalLength) {
            return this.text;
        }

        const indent = this.indent,
            tags = this.tokens,
            firstTag = tags[0],
            lines: Array<string> = ['/**'];

        let part1: string,
            part2: string;

        if (
            firstTag &&
            firstTag.tagKind === 'description'
        ) {
            part2 = U.trimBreaks(firstTag.text);

            lines.push(U.indent(indent, ' * ', part2, maximalLength));
            tags.shift();
        }

        for (const tag of tags) {

            if (tag.tagKind === '') {
                lines.push(U.pad(indent, ' *'));
                continue;
            }

            part1 = `@${tag.tagKind}`;
            part2 = U.trimBreaks(tag.text);

            if (tag.tagKind === 'example') {
                lines.push(U.pad(indent, ` * ${part1}`));
                lines.push(U.indent(indent, ' * ', part2));
                continue;
            }

            if (tag.tagType) {
                part1 += ` ${tag.tagType}`;
            }

            if (tag.tagName) {
                part1 += ` ${tag.tagName}`;
            }

            if (
                part2 &&
                ! tag.tagType &&
                ! tag.tagName &&
                tag.text.split(U.lineBreaks).length === 1
            ) {
                lines.push(U.indent(
                    indent,
                    ' * ',
                    `${part1} ${part2}`.trimRight(),
                    maximalLength
                ));
            } else {
                lines.push(U.pad(indent, ` * ${part1}`));

                if (part2) {
                    lines.push(U.indent(indent, ' * ', part2, maximalLength));
                }
            }
        }

        lines.push(U.pad(indent, ' */'));

        return lines.join(this.lineBreak);
    }


}


/* *
 *
 *  Default Export
 *
 * */


export default SourceDoc;
