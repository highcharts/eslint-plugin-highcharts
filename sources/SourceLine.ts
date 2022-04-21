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
import SourceCode from './SourceCode';
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

        if (firstToken.kind === TS.SyntaxKind.WhitespaceTrivia) {
            return firstToken.text.length;
        }

        return 0;
    }


    public getLength(): number {
        const tokens = this.tokens;

        let length = 0;

        for (let i = 0, iEnd = tokens.length; i < iEnd; ++i) {
            length += tokens[i].text.length;
        }

        return length;
    }


    public getPosition(
        sourceCode: SourceCode,
        token?: SourceToken
    ): (SourcePosition|null) {
        const lines = sourceCode.lines,
            lineIndex = lines.indexOf(this),
            position: SourcePosition = {
                column: 1,
                end: 0,
                line: 1,
                start: 0
            };

        if (lineIndex === -1) {
            return null;
        }

        let tokens: Array<SourceToken>;

        for (let i = 0, iLast = lineIndex, match: (RegExpMatchArray|null); i <= iLast; ++i) {

            position.column = 1;
            tokens = lines[i].tokens;

            for (const lineToken of tokens) {

                if (i === iLast) {
                    if (!token) {
                        return position;
                    } else if (lineToken === token) {
                        position.end = position.start + lineToken.text.length;
                        return position;
                    }
                }

                if (lineToken.kind === TS.SyntaxKind.MultiLineCommentTrivia) {
                    match = lineToken.text.match(/\n|\r|\r\n/g);

                    if (match) {
                        position.line += match.length;
                    }
                }

                position.column += lineToken.text.length;
                position.start += lineToken.text.length;
            }

            position.line += 1;
        }

        return null;
    }


    public toString(): string {
        let text = '';

        for (const token of this.tokens) {
            text += token.text;
        }

        return text;
    }


}


/* *
 *
 *  Default Export
 *
 * */


export default SourceLine;
