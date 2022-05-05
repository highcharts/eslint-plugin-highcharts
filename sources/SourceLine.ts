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
import SourcePosition from './SourcePosition';
import SourceToken from './SourceToken';


/* *
 *
 *  Class
 *
 * */


export class SourceLine {


    /* *
     *
     *  Constructor
     *
     * */


    public constructor(
        lineBreak: string = '\n'
    ) {
        this.lineBreak = lineBreak;
        this.tokens = [];
    }


    /* *
     *
     *  Properties
     *
     * */


    public readonly lineBreak: string;


    public readonly tokens: Array<SourceToken>;


    /* *
     *
     *  Functions
     *
     * */


    public getEssentialTokens(): Array<SourceToken> {
        const essentials: Array<SourceToken> = [],
            tokens = this.tokens;

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


    public getIndent(): number {
        const firstToken = this.tokens[0];

        if (
            firstToken &&
            firstToken.kind === TS.SyntaxKind.WhitespaceTrivia
        ) {
            return firstToken.text.length;
        }

        return 0;
    }


    public getMaximalLength(): number {
        const lines = this.getWrappedLines();

        let lineLength: number,
            maximalLength = 0;

        for (const line of lines) {
            lineLength = line.length;
            if (lineLength > maximalLength) {
                maximalLength = lineLength;
            }
        }

        return maximalLength;
    }


    /**
     * Returns the token position relative to the line.
     */
    public getTokenPosition(
        token: SourceToken
    ): (SourcePosition|null) {
        const tokens = this.tokens,
            tokenIndex = tokens.indexOf(token),
            position = {
                column: 1,
                end: 0,
                line: 1,
                start: 0
            };

        if (tokenIndex < 0) {
            return null;
        }

        for (let i = 0, tokenText: string; i < tokenIndex; ++i) {
            tokenText = tokens[i].text;
 
            if (
                token.kind === TS.SyntaxKind.JSDocComment ||
                token.kind === TS.SyntaxKind.MultiLineCommentTrivia
            ) {
                position.line += tokenText.split(U.LINE_BREAKS).length - 1;
            }

            position.start += tokenText.length;
        }

        position.end = token.text.length;

        return position;
    }


    public getWrappedLines(): Array<string> {
        return this.toString().split(U.LINE_BREAKS);
    }


    public toString(
        maximalLength?: number
    ): string {
        const lines: Array<string> = [],
            tokens = this.tokens;

        let line: string = '';

        if (!tokens.length) {
            return line;
        }

        if (maximalLength) {
            let tokenText: string;

            for (const token of tokens) {

                if (
                    token instanceof SourceLine &&
                    token.tokens.length > 1
                ) {
                    tokenText = token.toString(maximalLength);
                } else {
                    tokenText = token.text;
                }

                if ((U.extractLastLine(line) + U.extractFirstLine(tokenText)).length > maximalLength) {
                    lines.push(line);
                    line = '';
                }

                line += tokenText;
            }

            lines.push(line);
        } else {

            for (const token of tokens) {
                line += token.text;
            }

            lines.push(line);
        }

        return lines.join(this.lineBreak);
    }


}


/* *
 *
 *  Default Export
 *
 * */


export default SourceLine;
