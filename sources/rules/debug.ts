/**
 * @fileoverview Debugs TypeScript tokens.
 * @author Sophie Bremer
 */


'use strict';


/* *
 *
 *  Imports
 *
 * */


import * as TS from 'typescript';
import RuleContext from '../RuleContext';
import RuleOptions from '../RuleOptions';
import SourceToken from '../SourceToken';


/* *
 *
 *  Declarations
 *
 * */


type DebugContext = RuleContext<DebugOptions>;


interface DebugOptions extends RuleOptions {
    onlyKindOf?: Array<number|string>;
}


/* *
 *
 *  Constants
 *
 * */


const optionsDefaults: RuleOptions = {}


const optionsSchema = {
    'onlyKindOf': {
        'type': 'array'
    }
}


/* *
 *
 *  Functions
 *
 * */


function lint (
    context: DebugContext
) {
    const onlyKindOf = context.options.onlyKindOf,
        sourceTree = context.sourceTree,
        sourceNodes = sourceTree.toArray();

    for (const sourceNode of sourceNodes) {

        if (onlyKindOf && !onlyKindOf.includes(sourceNode.kind)) {
            continue;
        }

        console.log(
            sourceNode.kind,
            TS.SyntaxKind[sourceNode.kind],
            sourceNode.text,
            sourceNode.type,
            sourceNode.doclet
        );
    }
}


/* *
 *
 *  Default Export
 *
 * */


export = RuleContext.setupRuleExport(
    'layout',
    optionsSchema,
    optionsDefaults,
    lint
);
