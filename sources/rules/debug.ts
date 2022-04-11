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
        sourceTokens = sourceTree.toTokens();

    for (
        let i = 0,
            iEnd = sourceTokens.length,
            sourcePosition: number = 0,
            sourceToken: SourceToken;
        i < iEnd;
        ++i
    ) {
        sourceToken = sourceTokens[i];

        if (onlyKindOf && !onlyKindOf.includes(sourceToken.kind)) {
            continue;
        }

        context.report(
            0,
            0,
            `SyntaxKind: ${sourceToken.kind} ${TS.SyntaxKind[sourceToken.kind]} @ ${sourcePosition}`
        );

        sourcePosition += sourceToken.text.length;
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
