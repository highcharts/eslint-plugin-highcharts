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
        tag: SourceDocTag
    ): SourceDocTag {

        const match = tag.text.match(
            /^@(\w+)(\s+\{[\w.()<>]+\})?(\s+[^\[\]\s]+|\[[^\[\]\s]+\])?(.*)$/su
        );

        if (match) {
            const {
                1: tagKind,
                4: tagText
            } = match;

            let {
                2: tagType,
                3: tagName
            } = match;

            if (tagText[0] === ' ') {
                tag.text = tagText.substr(1);
            } else {
                tag.text = tagText;
            }

            if (tagName) {
                tagName = tagName.replace(/^ /u, '');

                if (tag.tagName) {
                    tag.text = `${tagName} ${tag.text}`;
                } else {
                    tag.tagName = tagName;
                }
            }

            if (tagType) {
                tagType = tagType.replace(/^ /u, '');

                if (tag.tagType) {
                    tag.text = `${tagType} ${tag.text}`;
                } else {
                    tag.tagType = tagType;
                }
            }

            if (tagKind) {
                if (tag.tagKind) {
                    tag.text = `${tagKind} ${tag.text}`;
                } else {
                    tag.tagKind = tagKind;
                }
            }
        }

        return tag;
    }


    public static isSourceDoc(
        text: string
    ): boolean {
        return /^\/\*\*\s/.test(text);
    }


    public static extractCommentLines(
        text: string
    ): Array<string> {
        let lines = text.split(U.LINE_BREAKS);

        if (lines.length === 1) {
            // remove /** and */
            return [ text.substr(4, text.length - 7) ];
        }

        // remove /**\n and \n*/
        lines = lines.slice(1, -1);

        for (let i = 0, iEnd = lines.length; i < iEnd; ++i) {
            lines[i] = lines[i].replace(/^\s+\*\s?/u, '');
        }

        return lines;
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
            lines = SourceDoc.extractCommentLines(text);

        // leading text without tag is @description:
        let tag: SourceDocTag = {
            kind: TS.SyntaxKind.JSDocTag,
            tagKind: 'description',
            text: ''
        };

        tags.push(tag);

        for (const line of lines) {
            if (!line && tags.length > 1) {
                tags.push({
                    kind: TS.SyntaxKind.NewLineTrivia,
                    tagKind: '',
                    text: ''
                });
            } else if (line.startsWith('@')) {

                if (tags.length === 1) {
                    if (!tag.text) {
                        // remove empty initial description
                        tags.pop();
                    } else {
                        // add trailing new lines as tokens
                        const trail = tag.text.match(new RegExp(
                            `(?:${U.LINE_BREAKS.source})+$`,
                            'su'
                        )) || [''];

                        for (
                            let i = 1,
                                iEnd = trail[0].split(U.LINE_BREAKS).length;
                            i < iEnd;
                            ++i
                        ) {
                            tags.push({
                                kind: TS.SyntaxKind.NewLineTrivia,
                                tagKind: '',
                                text: ''
                            });
                        }
                    }
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
            SourceDoc.decorateTag(tag);
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
            lines.push(U.indent(indent, ' * ', firstTag.text, maximalLength));
            tags.shift();
        }

        for (const tag of tags) {

            if (tag.tagKind === '') {
                lines.push(U.pad(indent, ' *'));
                continue;
            }

            part1 = `@${tag.tagKind}`;
            part2 = tag.text;

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

            if (part2 && part2.trim().split(/\s/g).length > 1) {
                lines.push(U.pad(indent, ` * ${part1}`));
                lines.push(U.indent(
                    indent,
                    ' * ',
                    U.trimAll(part2),
                    maximalLength
                ));
            } else {
                lines.push(U.pad(indent, ` * ${part1} ${part2}`.trimRight()));
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
