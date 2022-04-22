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
     *  Properties
     *
     * */


    public readonly tokens: Array<SourceToken> = [];


    /* *
     *
     *  Functions
     *
     * */


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
                position.line += U.breakText(tokenText).length - 1;
            }

            position.start += tokenText.length;
        }

        position.end = token.text.length;

        return position;
    }


    public getWrappedLines(): Array<string> {
        return U.breakText(this.toString());
    }


    public toString(
        maxLength?: number
    ): string {
        if (!maxLength) {
            let text = '';

            for (const token of this.tokens) {
                text += token.text;
            }

            return text;
        }

        const lines: Array<string> = [],
            tokens = this.tokens;

        if (!tokens.length) {
            return '';
        }

        let line = '',
            tokenText: string;

        for (const token of tokens) {
            tokenText = token.text;

            if ((line + tokenText).length > maxLength) {
                lines.push(line);
                line = '';
            }

            line += tokenText;
        }

        lines.push(line);

        return lines.join('\n');
    }


}


/* *
 *
 *  Default Export
 *
 * */


export default SourceLine;
