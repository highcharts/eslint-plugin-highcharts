/**
 * @author Sophie Bremer
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceLine = void 0;
/* *
 *
 *  Imports
 *
 * */
const TS = require("typescript");
const U = require("./Utilities");
/* *
 *
 *  Class
 *
 * */
class SourceLine {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(lineBreak = '\n') {
        this.lineBreak = lineBreak;
        this.tokens = [];
    }
    /* *
     *
     *  Functions
     *
     * */
    getEssentialTokens() {
        const essentials = [], tokens = this.tokens;
        for (const token of tokens) {
            switch (token.kind) {
                case TS.SyntaxKind.EndOfFileToken:
                case TS.SyntaxKind.NewLineTrivia:
                case TS.SyntaxKind.WhitespaceTrivia:
                    continue;
                default:
                    essentials.push(token);
            }
        }
        return essentials;
    }
    getIndent() {
        const firstToken = this.tokens[0];
        if (firstToken &&
            firstToken.kind === TS.SyntaxKind.WhitespaceTrivia) {
            return firstToken.text.length;
        }
        return 0;
    }
    getMaximalLength() {
        const lines = this.getWrappedLines();
        let lineLength, maximalLength = 0;
        for (const line of lines) {
            lineLength = line.length;
            if (lineLength > maximalLength) {
                maximalLength = lineLength;
            }
        }
        return maximalLength;
    }
    getTokenKinds(start, end) {
        const tokenKinds = [], tokens = this.tokens, tokensLength = tokens.length;
        if (start && start >= tokensLength) {
            return [];
        }
        for (let i = Math.max(start || 0, 0), iEnd = Math.min(end || tokensLength, tokensLength); i < iEnd; ++i) {
            tokenKinds.push(tokens[i].kind);
        }
        return tokenKinds;
    }
    /**
     * Returns the token position relative to the line.
     */
    getTokenPosition(token) {
        const tokens = this.tokens, tokenIndex = tokens.indexOf(token), position = {
            column: 1,
            end: 0,
            line: 1,
            start: 0
        };
        if (tokenIndex < 0) {
            return null;
        }
        for (let i = 0, tokenText; i < tokenIndex; ++i) {
            tokenText = tokens[i].text;
            if (token.kind === TS.SyntaxKind.JSDocComment ||
                token.kind === TS.SyntaxKind.MultiLineCommentTrivia) {
                position.line += tokenText.split(U.LINE_BREAKS).length - 1;
            }
            position.start += tokenText.length;
        }
        position.end = token.text.length;
        return position;
    }
    getWrappedLines() {
        return this.toString().split(U.LINE_BREAKS);
    }
    toString(maximalLength) {
        const lines = [], tokens = this.tokens;
        let line = '';
        if (!tokens.length) {
            return line;
        }
        if (maximalLength) {
            let tokenText;
            for (const token of tokens) {
                if (token instanceof SourceLine &&
                    token.tokens.length > 1) {
                    tokenText = token.toString(maximalLength);
                }
                else {
                    tokenText = token.text;
                }
                if ((U.extractLastLine(line) + U.extractFirstLine(tokenText)).length > maximalLength) {
                    lines.push(line);
                    line = '';
                }
                line += tokenText;
            }
            lines.push(line);
        }
        else {
            for (const token of tokens) {
                line += token.text;
            }
            lines.push(line);
        }
        return lines.join(this.lineBreak);
    }
}
exports.SourceLine = SourceLine;
/* *
 *
 *  Default Export
 *
 * */
exports.default = SourceLine;
