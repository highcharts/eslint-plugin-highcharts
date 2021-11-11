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
        this.lines = [];
        this.parse(sourceCode);
    }
    /* *
     *
     *  Functions
     *
     * */
    parse(sourceCode, replace = false) {
        const lines = this.lines;
        if (replace) {
            lines.length = 0;
        }
        if (!sourceCode) {
            return;
        }
        const scanner = TS.createScanner(TS.ScriptTarget.Latest, false);
        let kind, line = new SourceLine_1.default(), text;
        scanner.setText(sourceCode);
        do {
            kind = scanner.scan();
            text = scanner.getTokenText();
            line.tokens.push({
                kind,
                text
            });
            if (kind === TS.SyntaxKind.NewLineTrivia ||
                kind === TS.SyntaxKind.EndOfFileToken) {
                lines.push(line);
                line = new SourceLine_1.default();
            }
        } while (kind !== TS.SyntaxKind.EndOfFileToken);
    }
    toString() {
        const lines = this.lines;
        let text = '';
        for (let i = 0, iEnd = lines.length; i < iEnd; ++i) {
            text += lines[i].toString();
        }
        return text;
    }
}
exports.SourceCode = SourceCode;
/* *
 *
 *  Default Export
 *
 * */
exports.default = SourceCode;
