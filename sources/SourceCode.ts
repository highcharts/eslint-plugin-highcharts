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
import SourceComment from './SourceComment';
import SourceDoc from './SourceDoc';
import SourceLine from './SourceLine';
import SourcePosition from './SourcePosition';
import SourceToken from './SourceToken';


/* *
 *
 *  Class
 *
 * */


export class SourceCode {


    /* *
     *
     *  Constructor
     *
     * */


    public constructor (
        fileName: string,
        sourceCode: string
    ) {
        this.fileName = fileName;
        this.lines = [];
        this.parse(sourceCode);
    }


    /* *
     *
     *  Properties
     *
     * */


    public readonly fileName: string;


    public readonly lines: Array<SourceLine>;


    /* *
     *
     *  Functions
     *
     * */


    public getLinePosition(
        line: SourceLine
    ): (SourcePosition|null) {
        const lines = this.lines,
            lineIndex = lines.indexOf(line),
            position: SourcePosition = {
                column: 1,
                end: 0,
                line: 1,
                start: 0
            };

        if (lineIndex < 0) {
            return null;
        }

        for (
            let i = 0,
                tokens: Array<SourceToken>,
                tokenLength: number,
                tokenText: string;
            i < lineIndex;
            ++i
        ) {
            tokens = lines[i].tokens;

            for (const token of tokens) {
                tokenText = token.text;

                if (
                    token.kind === TS.SyntaxKind.JSDocComment ||
                    token.kind === TS.SyntaxKind.MultiLineCommentTrivia
                ) {
                    tokenLength = U.breakText(tokenText).length;

                    if (tokenLength > 1) {
                        position.line += tokenLength - 1;
                    }
                }

                position.start += tokenText.length;
            }

            position.line += 1;
        }

        position.end = position.start + U.breakText(line.toString())[0].length;

        return position;
    }


    /**
     * Returns the token position relative to the code.
     */
    public getTokenPosition(
        line: SourceLine,
        token: SourceToken
    ): (SourcePosition|null) {

        const linePosition = this.getLinePosition(line),
            tokenPosition = line.getTokenPosition(token);

        if (!linePosition || !tokenPosition) {
            return null;
        }

        return {
            column: tokenPosition.column,
            end: linePosition.start + tokenPosition.end,
            line: linePosition.line + tokenPosition.line - 1,
            start: linePosition.start + tokenPosition.start
        }
    }


    public parse (
        sourceCode: string,
        replace = false
    ) {
        const lines = this.lines;

        if (replace) {
            lines.length = 0;
        }

        if (!sourceCode) {
            return;
        }

        const scanner = TS.createScanner(TS.ScriptTarget.Latest, false);

        let indent: number,
            kind: TS.SyntaxKind,
            line = new SourceLine(),
            text: string,
            token: SourceToken;

        scanner.setText(sourceCode);

        do {
            kind = scanner.scan();
            text = scanner.getTokenText();

            if (
                kind === TS.SyntaxKind.NewLineTrivia ||
                kind === TS.SyntaxKind.EndOfFileToken
            ) {
                lines.push(line);
                line = new SourceLine();
                continue;
            }

            if (kind === TS.SyntaxKind.MultiLineCommentTrivia) {
                indent = Math.floor(line.getIndent() / 2) * 2;

                if (SourceDoc.isSourceDoc(text)) {
                    token = new SourceDoc(text, indent);
                } else {
                    token = new SourceComment(text, indent);
                }
            } else {
                token = { kind, text };
            }

            line.tokens.push(token);

        } while (kind !== TS.SyntaxKind.EndOfFileToken)
    }


    public toString (): string {
        const lines = this.lines;

        let text = '';

        for (let i = 0, iEnd = lines.length; i < iEnd; ++i) {
            text += lines[i].toString();
        }

        return text;
    }


}


/* *
 *
 *  Default Export
 *
 * */


export default SourceCode;
