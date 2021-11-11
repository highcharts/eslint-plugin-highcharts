/* *
 *
 *  Imports
 *
 * */


import type * as TS from 'typescript';


/* *
 *
 *  Declarations
 *
 * */


export interface SourceToken {
    kind: TS.SyntaxKind;
    text: string;
}


/* *
 *
 *  Default Export
 *
 * */


export default SourceToken;
