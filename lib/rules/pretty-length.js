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
const TS = require("typescript");
const RuleContext_1 = require("../RuleContext");
/* *
 *
 *  Constants
 *
 * */
const messageTemplate = 'Code line exceeds limit of {0} characters.';
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
const regExps = {
    breakSplit: /\n/gu,
    docletTag: /^(@[A-Za-z][\w-]+)\s+(?:(\{[^\}]+\})\s+)?([\s\S]*)$/u,
    docletTagSplit: /(?<=\s)(?=@[A-Za-z])/gu,
    docletTagTrim: /^\s*\*\s+/mu,
    spaceSplit: /\s+/gsu
};
/* *
 *
 *  Functions
 *
 * */
function fix(context) {
    const docletASTs = [];
    context.fix((transformationConext, node) => {
        if (TS.isJSDoc(node)) {
            process.stdout.write('.');
            return transformationConext.factory.createJSDocComment((TS.getTextOfJSDocComment(node.comment) || '').toUpperCase(), node.tags);
        }
        return node;
    });
    FS.writeFileSync(context.sourceFile.fileName + '.json', JSON.stringify(docletASTs, ['comment', 'name', 'tags', 'text'], '  '));
}
function lint(context) {
    const sourceTextLines = context.sourceFile.getFullText().split(regExps.breakSplit), { ignorePattern, maximalLength } = setupOptions(context.options), ignoreRegExp = (ignorePattern && new RegExp(ignorePattern));
    console.log('Checking', context.sourceFile.fileName);
    for (let line = 0, lineEnd = sourceTextLines.length, sourceTextLength, sourceTextLine; line < lineEnd; ++line) {
        sourceTextLine = sourceTextLines[line];
        sourceTextLength = sourceTextLine.length;
        if (ignoreRegExp &&
            ignoreRegExp.test(sourceTextLine)) {
            continue;
        }
        if (sourceTextLength > maximalLength) {
            context.report(line, maximalLength - 1, messageTemplate.replace('{0}', `${maximalLength}`));
        }
    }
}
function setupOptions(options) {
    return {
        ignorePattern: options.ignorePattern || optionsDefaults.ignorePattern,
        indentSize: options.indentSize || optionsDefaults.indentSize,
        maximalLength: (options.maximalLength ||
            optionsDefaults.maximalLength)
    };
}
module.exports = RuleContext_1.default.setupRuleExport('layout', optionsSchema, lint, fix);
