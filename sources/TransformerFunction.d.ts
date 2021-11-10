/**
 * @author Sophie Bremer
 */


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


export type TransformerFunction = (
    transformationContext: TS.TransformationContext,
    node: TS.Node
) => TS.Node;


/* *
 *
 *  Default Export
 *
 * */


export default TransformerFunction;
