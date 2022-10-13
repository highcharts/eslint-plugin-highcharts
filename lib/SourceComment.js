/**
 * @author Sophie Bremer
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceComment = void 0;
/* *
 *
 *  Imports
 *
 * */
const TS = require("typescript");
const U = require("./Utilities");
const SourceLine_1 = require("./SourceLine");
/* *
 *
 *  Constants
 *
 * */
const starPattern = /^[ \t]+\*[ \t]?/u;
/* *
 *
 *  Class
 *
 * */
class SourceComment extends SourceLine_1.default {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(text, lineBreak = '\n', indent = 0) {
        super(lineBreak);
        this.indent = indent;
        this.kind = TS.SyntaxKind.MultiLineCommentTrivia;
        const lines = text.split(U.LINE_BREAKS), tokens = this.tokens;
        for (let i = 0, iEnd = lines.length; i < iEnd; ++i) {
            tokens.push({
                kind: TS.SyntaxKind.SingleLineCommentTrivia,
                text: (i ? lines[i].substr(indent) : lines[i])
            });
        }
    }
    /* *
     *
     *  Static Functions
     *
     * */
    static extractCommentLines(text, indent = 0) {
        let lines = text.split(U.LINE_BREAKS);
        if (lines.length === 1) {
            // remove /** and */
            return [text.substr(4, text.length - 7)];
        }
        // remove /**\n and \n*/
        lines = lines.slice(1, -1);
        for (let i = 0, iEnd = lines.length, line; i < iEnd; ++i) {
            line = lines[i];
            if (line.match(starPattern)) {
                // remove *
                lines[i] = line.replace(starPattern, '');
            }
            else if (indent) {
                // remove indent
                lines[i] = line.substr(indent);
            }
        }
        return lines;
    }
    get text() {
        return this.toString();
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
        const indent = this.indent, lines = [];
        if (maximalLength) {
            let line = '', words;
            for (const token of this.tokens) {
                words = token.text.split(' ');
                line = words.shift() || '';
                for (const word of words) {
                    if (line.length + 1 + word.length > maximalLength) {
                        lines.push(line.trimRight());
                        line = U.pad(indent, word);
                    }
                    else {
                        line += ` ${word}`;
                    }
                }
                lines.push(line.trimRight());
            }
        }
        else {
            for (const token of this.tokens) {
                lines.push(U.pad(indent, token.text));
            }
        }
        return lines.join(this.lineBreak).substr(indent);
    }
}
exports.SourceComment = SourceComment;
/* *
 *
 *  Default Export
 *
 * */
exports.default = SourceComment;
