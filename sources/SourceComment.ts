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
import SourceLine from './SourceLine';
import SourceToken from './SourceToken';


/* *
 *
 *  Constants
 *
 * */


const starPattern = /^[ \t]+\*[ \t]?/u


/* *
 *
 *  Class
 *
 * */


export class SourceComment extends SourceLine implements SourceToken {


    /* *
     *
     *  Static Functions
     *
     * */


    public static extractCommentLines(
        text: string,
        indent: number = 0
    ): Array<string> {
        let lines = text.split(U.LINE_BREAKS);

        if (lines.length === 1) {
            // remove /** and */
            return [ text.substr(4, text.length - 7) ];
        }

        // remove /**\n and \n*/
        lines = lines.slice(1, -1);

        for (let i = 0, iEnd = lines.length, line: string; i < iEnd; ++i) {
            line = lines[i];

            if (line.match(starPattern)) {
                // remove *
                lines[i] = line.replace(starPattern, '');
            } else if (indent) {
                // remove indent
                lines[i] = line.substr(indent);
            }
        }

        return lines;
    }


    /* *
     *
     *  Constructor
     *
     * */


    public constructor (
        text: string,
        lineBreak: string = '\n',
        indent: number = 0
    ) {
        super(lineBreak);

        this.indent = indent;
        this.kind = TS.SyntaxKind.MultiLineCommentTrivia;

        const lines = text.split(U.LINE_BREAKS),
            tokens = this.tokens;

        for (let i = 0, iEnd = lines.length; i < iEnd; ++i) {
            tokens.push({
                kind: TS.SyntaxKind.SingleLineCommentTrivia,
                text: (i ? lines[i].substr(indent) : lines[i])
            });
        }
    }


    /* *
     *
     *  Properties
     *
     * */


    private readonly indent: number;


    public readonly kind: TS.SyntaxKind.MultiLineCommentTrivia;


    public get text (): string {
        return this.toString();
    }


    /* *
     *
     *  Functions
     *
     * */


    public getIndent(): number {
        return this.indent;
    }


    public toString(
        maximalLength?: number
    ): string {
        const lines: Array<string> = [];

        if (maximalLength) {
            let line: string = '',
                match: (RegExpMatchArray|null),
                words: Array<string>;

            for (const token of this.tokens) {

                words = token.text.split(' ');
                line = words.shift() || '';

                for (const word of words) {

                    if (line.length + 1 + word.length > maximalLength) {
                        lines.push(line.trimRight());

                        match = line.match(/^\s*\*+\s*/);

                        if (match && match.groups) {
                            line = match[0] + word;
                        } else {
                            line = word;
                        }
                    } else {
                        line += ` ${word}`;
                    }
                }

                lines.push(line.trimRight());
            }
        } else {
            for (const token of this.tokens) {
                lines.push(token.text);
            }
        }

        return lines.join(this.lineBreak);
    }


}


/* *
 *
 *  Default Export
 *
 * */


export default SourceComment;
