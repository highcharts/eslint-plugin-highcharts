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
const TS = require("typescript");
const RuleContext_1 = require("../RuleContext");
/* *
 *
 *  Constants
 *
 * */
const optionsDefaults = {};
const optionsSchema = {
    'onlyKindOf': {
        'type': 'array'
    }
};
/* *
 *
 *  Functions
 *
 * */
function lint(context) {
    const onlyKindOf = context.options.onlyKindOf, sourceTree = context.sourceTree, sourceNodes = sourceTree.toArray();
    for (const sourceNode of sourceNodes) {
        if (onlyKindOf && !onlyKindOf.includes(sourceNode.kind)) {
            continue;
        }
        console.log(sourceNode.kind, TS.SyntaxKind[sourceNode.kind], sourceNode.text, sourceNode.types, sourceNode.doclet);
    }
}
module.exports = RuleContext_1.default.setupRuleExport('layout', optionsSchema, optionsDefaults, lint);
