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


export interface SourceToken<T extends TS.SyntaxKind = TS.SyntaxKind> {
    kind: T;
    text: string;
}


/* *
 *
 *  Default Export
 *
 * */


export default SourceToken;
