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


    public getLength(): number {
        const tokens = this.tokens;

        let length = 0;

        for (let i = 0, iEnd = tokens.length; i < iEnd; ++i) {
            length += tokens[i].text.length;
        }

        return length;
    }


    public toString(): string {
        const tokens = this.tokens;

        let text = '';

        for (let i = 0, iEnd = tokens.length; i < iEnd; ++i) {
            text += tokens[i].text;
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
