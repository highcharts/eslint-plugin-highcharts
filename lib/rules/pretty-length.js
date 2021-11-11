/**
 * @fileoverview Limit and autofix max length.
 * @author Sophie Bremer
 */
'use strict';
/* *
 *
 *  Imports
 *
 * */
const FS = require("fs");
const U = require("../Utilities");
const RuleContext_1 = require("../RuleContext");
/* *
 *
 *  Constants
 *
 * */
const messageTemplate = 'Line exceeds limit of {0} characters.';
const optionsDefaults = {
    maximalLength: 80
};
const optionsSchema = {
    'ignorePattern': {
        'type': 'string'
    },
    'maximalLength': {
        'type': 'integer'
    }
};
/* *
 *
 *  Functions
 *
 * */
function fix(context) {
    const docletASTs = [];
    context.sourceCode.lines.forEach(sourceLine => docletASTs.push(...U.getJSDocs(sourceLine)));
    FS.writeFileSync(context.sourceCode.fileName + '.json', JSON.stringify(docletASTs, [
        'name',
        'comment',
        'text',
        'tags',
        'kind',
        'flags',
        'modifierFlagsCache',
        'transformFlags',
        'end',
        'pos',
    ], '  '));
}
function fixJSDoc(context) {
    // @todo
}
function lint(context) {
    const sourceLines = context.sourceCode.lines, { ignorePattern, maximalLength } = context.options, ignoreRegExp = (ignorePattern && new RegExp(ignorePattern));
    console.log('Checking', context.sourceCode.fileName);
    for (let line = 0, lineEnd = sourceLines.length, sourceLine, sourceLineLength; line < lineEnd; ++line) {
        sourceLine = sourceLines[line];
        if (ignoreRegExp &&
            ignoreRegExp.test(sourceLine.toString())) {
            continue;
        }
        sourceLineLength = sourceLine.getLength();
        if (sourceLineLength > maximalLength) {
            context.report(line, maximalLength - 1, messageTemplate.replace('{0}', `${maximalLength}`));
        }
    }
}
module.exports = RuleContext_1.default.setupRuleExport('layout', optionsSchema, optionsDefaults, lint, fix);
