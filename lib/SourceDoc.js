/**
 * @author Sophie Bremer
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceDoc = void 0;
/* *
 *
 *  Imports
 *
 * */
const TS = require("typescript");
const U = require("./Utilities");
const SourceComment_1 = require("./SourceComment");
const SourceLine_1 = require("./SourceLine");
/* *
 *
 *  Constants
 *
 * */
// eslint-disable-next-line max-len
const tagPattern = /^@(\S+)([ \t]+\{[^\}\s]+\})?([ \t]+\S+)?(\s[\s\S]*)?$/u;
/* *
 *
 *  Class
 *
 * */
class SourceDoc extends SourceLine_1.default {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(text, lineBreak = '\n', indent = 0) {
        super(lineBreak);
        this.kind = TS.SyntaxKind.JSDocComment;
        this.indent = indent;
        this.text = text;
        this.tokens = [];
        const tags = this.tokens, lines = SourceComment_1.default.extractCommentLines(text);
        // leading text without tag is @description:
        let tag = {
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
            }
            else if (line.startsWith('@')) {
                if (tags.length === 1) {
                    if (!tag.text) {
                        // remove empty initial description
                        tags.pop();
                    }
                    else {
                        // add trailing new lines as tokens
                        const trail = tag.text.match(new RegExp(`(?:${U.LINE_BREAKS.source})+$`, 'su')) || [''];
                        for (let i = 1, iEnd = trail[0].split(U.LINE_BREAKS).length; i < iEnd; ++i) {
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
            }
            else {
                tag.text += lineBreak + line;
            }
        }
        for (const tag of tags) {
            SourceDoc.decorateTag(tag);
        }
    }
    /* *
     *
     *  Static Functions
     *
     * */
    static decorateTag(tag) {
        const match = tag.text.match(tagPattern);
        if (match) {
            const { 1: tagKind, 2: tagType, 3: tagArgument, 4: tagText } = match;
            if (tagText) {
                tag.text = U.trimBreaks(tagText).trim();
            }
            else {
                tag.text = '';
            }
            if (!tag.tagArgument && tagArgument) {
                if (!tagText || tagText.match(/^[\r\n]/u)) {
                    tag.tagArgument = tagArgument.replace(/^[ \t]/u, '');
                }
                else {
                    tag.text = `${tagArgument} ${tag.text}`.trimLeft();
                }
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
    static isSourceDoc(text) {
        return /^\/\*\*\s/.test(text);
    }
    /* *
     *
     *  Functions
     *
     * */
    getIndent() {
        return this.indent;
    }
    toString(maximalLength) {
        if (!maximalLength) {
            return this.text;
        }
        const indent = this.indent, tags = this.tokens, firstTag = tags[0], lines = ['/**'];
        let part1, part2, padded;
        if (firstTag &&
            firstTag.tagKind === 'description') {
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
            if (tag.tagType && tag.tagArgument) {
                part1 = `${part1} ${tag.tagType} ${tag.tagArgument}`.trim();
            }
            else if (tag.tagType) {
                part1 += ` ${tag.tagType}`;
            }
            else if (tag.tagArgument) {
                part1 += ` ${tag.tagArgument}`;
            }
            if ((!part2 && tag.tagType && tag.tagArgument) ||
                !(part2 && tag.tagType && tag.tagArgument)) {
                padded = U.pad(indent, ` * ${part1} ${part2}`.trimRight());
                // test for one line style
                if (padded.length <= maximalLength) {
                    lines.push(padded);
                    continue;
                }
            }
            padded = U.pad(indent, ` * ${part1}`);
            // test for spaced style
            if (padded.length <= maximalLength) {
                lines.push(padded);
            }
            else {
                lines.push(U.pad(indent, ` * ${U.trimAll(part1)}`));
            }
            if (part2) {
                padded = ' * ';
                // extra indent for @param etc
                if (tag.tagArgument &&
                    tag.tagArgument[0] !== ' ') {
                    padded += U.pad(tag.tagKind.length + 2);
                }
                lines.push(U.indent(indent, padded, U.trimAll(part2), maximalLength));
            }
        }
        lines.push(U.pad(indent, ' */'));
        return lines.join(this.lineBreak);
    }
}
exports.SourceDoc = SourceDoc;
/* *
 *
 *  Default Export
 *
 * */
exports.default = SourceDoc;
