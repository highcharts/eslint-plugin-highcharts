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
 *  Constants
 *
 * */


// eslint-disable-next-line max-len
const tagPattern = /^@(\w+)([ \t]+(?:true|false|[\d./]+|'[^'\r\n]+'|\{[^\}\s]+\}))?([ \t]+[\w\-./]+)?([\s\S]*)?$/u;


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

        const match = tag.text.match(tagPattern);

        if (match) {
            const {
                1: tagKind,
                2: tagType,
                3: tagName,
                4: tagText
            } = match;

            if (tagText) {
                tag.text = tagText.trimLeft();
            } else {
                tag.text = '';
            }

            if (!tag.tagName && tagName) {
                tag.tagName = tagName.replace(/^[ \t]/u, '');
            }

            if (!tag.tagType && tagType) {
                tag.tagType = tagType.replace(/^[ \t]/u, '');
            }

            if (!tag.tagKind && tagKind) {
                tag.tagKind = tagKind;
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
            part2: string,
            padded: string;

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
                lines.push(U.pad(indent, ` * ${U.trimBreaks(part2)}`));
                continue;
            }

            if (tag.tagType) {
                part1 += ` ${tag.tagType}`;
            }

            if (tag.tagName) {
                part1 += ` ${tag.tagName}`;
            }

            padded = U.pad(indent, ` * ${part1} ${part2}`.trimRight());

            if (
                padded.length <= maximalLength &&
                padded.trim().split(/\s/gu).length <= 3
            ) {
                lines.push(padded);
            } else {
                padded = U.pad(indent, ` * ${part1}`);

                if (padded.length <= maximalLength) {
                    lines.push(padded);
                } else {
                    lines.push(U.pad(indent, ` * ${U.trimAll(part1)}`));
                }

                if (part2) {
                    padded = ' * ';

                    if (
                        tag.tagType &&
                        tag.tagType[0] !== ' ' &&
                        tag.tagName &&
                        tag.tagName[0] !== ' '
                    ) {
                        padded += U.pad(tag.tagKind.length + 2);
                    }

                    lines.push(U.indent(
                        indent,
                        padded,
                        U.trimAll(part2),
                        maximalLength
                    ));
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
