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
 *  Class
 *
 * */


export class SourceComment extends SourceLine implements SourceToken {


    /* *
     *
     *  Constructor
     *
     * */


    public constructor (
        text: string,
        indent: number = 0
    ) {
        super();

        this.indent = indent;
        this.kind = TS.SyntaxKind.MultiLineCommentTrivia;

        const lines = U.breakText(text),
            lineBreak = text.includes('\r\n') ? '\r\n' : '\n',
            tokens = this.tokens;

        for (let i = 0, iEnd = lines.length; i < iEnd; ++i) {
            tokens.push({
                kind: TS.SyntaxKind.SingleLineCommentTrivia,
                text: (i ? lines[i].substr(indent) : lines[i])
            }, {
                kind: TS.SyntaxKind.NewLineTrivia,
                text: lineBreak
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


}


/* *
 *
 *  Default Export
 *
 * */


export default SourceComment;
