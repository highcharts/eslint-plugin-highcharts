/**
 * @author Sophie Bremer
 */


'use strict';


/* *
 *
 *  Imports
 *
 * */


import type SourceToken from './SourceToken';

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


    public getLinePos(
        sourceLine: SourceLine
    ): number {
        const lines = this.lines,
            lineIndex = lines.indexOf(sourceLine);

        if (lineIndex === -1) {
            return -1;
        }

        let pos = 0;

        for (let i = 0, iEnd = lineIndex; i < iEnd; ++i) {
            pos += lines[i].getLength() + 1; // + line break
        }

        return pos;
    }


    public getTokenPos(
        sourceToken: SourceToken
    ): number {
        const lines = this.lines;

        let line: SourceLine,
            pos = 0,
            tokenIndex = -1;

        for (let i = 0, iEnd = lines.length; i < iEnd; ++i) {
            line = lines[i];
            tokenIndex = line.tokens.indexOf(sourceToken);

            if (tokenIndex >= 0) {
                const tokens = line.tokens;

                for (let j = 0, jEnd = tokenIndex; j < jEnd; ++j) {
                    pos += tokens[j].text.length;
                }

                break;
            }

            pos += lines[i].getLength() + 1; // + line break
        }

        if (tokenIndex === -1) {
            return -1;
        }

        return pos;
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
