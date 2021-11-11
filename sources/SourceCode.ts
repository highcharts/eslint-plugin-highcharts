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
import SourceLine from './SourceLine';


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

        let kind: TS.SyntaxKind,
            line = new SourceLine(),
            text: string;

        scanner.setText(sourceCode);

        do {
            kind = scanner.scan();
            text = scanner.getTokenText();

            line.tokens.push({
                kind,
                text
            });

            if (
                kind === TS.SyntaxKind.NewLineTrivia ||
                kind === TS.SyntaxKind.EndOfFileToken
            ) {
                lines.push(line);
                line = new SourceLine();
            }

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
