/**
 * @author Sophie Bremer
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceCode = void 0;
/* *
 *
 *  Imports
 *
 * */
const TS = require("typescript");
const U = require("./Utilities");
const SourceComment_1 = require("./SourceComment");
const SourceDoc_1 = require("./SourceDoc");
const SourceLine_1 = require("./SourceLine");
/* *
 *
 *  Class
 *
 * */
class SourceCode {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(fileName, sourceCode) {
        this.fileName = fileName;
        this.lineBreak = U.detectLineBreak(sourceCode) || '\n';
        this.lines = [];
        this.raw = sourceCode;
        this.parse(sourceCode);
    }
    /* *
     *
     *  Functions
     *
     * */
    getLinePosition(line) {
        const lines = this.lines, lineIndex = lines.indexOf(line), position = {
            column: 1,
            end: 0,
            line: 1,
            start: 0
        };
        if (lineIndex < 0) {
            return null;
        }
        for (let i = 0, tokens, tokenLength, tokenText; i < lineIndex; ++i) {
            tokens = lines[i].tokens;
            for (const token of tokens) {
                tokenText = token.text;
                if (token.kind === TS.SyntaxKind.JSDocComment ||
                    token.kind === TS.SyntaxKind.MultiLineCommentTrivia) {
                    tokenLength = tokenText.split(U.LINE_BREAKS).length;
                    if (tokenLength > 1) {
                        position.line += tokenLength - 1;
                    }
                }
                position.start += tokenText.length;
            }
            position.line += 1;
            position.start += 1; // line break
        }
        position.end = position.start + line.toString().length;
        return position;
    }
    /**
     * Returns the token position relative to the code.
     */
    getTokenPosition(line, token) {
        const linePosition = this.getLinePosition(line), tokenPosition = line.getTokenPosition(token);
        if (!linePosition || !tokenPosition) {
            return null;
        }
        return {
            column: tokenPosition.column,
            end: linePosition.start + tokenPosition.end,
            line: linePosition.line + tokenPosition.line - 1,
            start: linePosition.start + tokenPosition.start
        };
    }
    parse(sourceCode, replace = false) {
        const lineBreak = this.lineBreak, lines = this.lines;
        if (replace) {
            lines.length = 0;
        }
        if (!sourceCode) {
            return;
        }
        const scanner = TS.createScanner(TS.ScriptTarget.Latest, false);
        let indent, kind, line = new SourceLine_1.default(lineBreak), text, token;
        scanner.setText(sourceCode);
        do {
            kind = scanner.scan();
            text = scanner.getTokenText();
            if (kind === TS.SyntaxKind.NewLineTrivia ||
                kind === TS.SyntaxKind.EndOfFileToken) {
                lines.push(line);
                line = new SourceLine_1.default(lineBreak);
                continue;
            }
            if (kind === TS.SyntaxKind.MultiLineCommentTrivia) {
                indent = Math.floor(line.getIndent() / 2) * 2;
                if (SourceDoc_1.default.isSourceDoc(text)) {
                    token = new SourceDoc_1.default(text, lineBreak, indent);
                }
                else {
                    token = new SourceComment_1.default(text, lineBreak, indent);
                }
            }
            else {
                token = { kind, text };
            }
            line.tokens.push(token);
        } while (kind !== TS.SyntaxKind.EndOfFileToken);
    }
    toString(maximalLength) {
        const lines = this.lines, strings = [];
        for (const line of lines) {
            strings.push(line.toString(maximalLength));
        }
        return strings.join(this.lineBreak);
    }
}
exports.SourceCode = SourceCode;
/* *
 *
 *  Default Export
 *
 * */
exports.default = SourceCode;
