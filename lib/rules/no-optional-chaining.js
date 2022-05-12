/**
 * @fileoverview Do not use optional chaining because it bloats transpiled code.
 * Instead use the `pick` function or `&&` conditions.
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
const message = [
    'Do not use optional chaining.',
    'Instead use the `pick` function or `&&` conditions.'
].join(' ');
const optionsDefaults = {};
const optionsSchema = {};
/* *
 *
 *  Functions
 *
 * */
function lint(context) {
    const code = context.sourceCode, lines = code.lines;
    let tokens;
    for (const line of lines) {
        tokens = line.tokens;
        for (let index = 0, indexEnd = tokens.length - 2, firstToken; index < indexEnd; ++index) {
            firstToken = tokens[index];
            if (firstToken.kind === TS.SyntaxKind.QuestionDotToken) {
                const position = code.getTokenPosition(line, firstToken);
                if (position) {
                    context.prepareReport(position, message);
                }
            }
        }
    }
    context.sendReports();
}
module.exports = RuleContext_1.default.setupRuleExport('problem', optionsSchema, optionsDefaults, lint, false);
