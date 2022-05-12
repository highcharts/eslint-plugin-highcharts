/**
 * @fileoverview Explicitly type imports are not necessary because TypeScript
 * will automatically remove type-only used imports during transpilation.
 * @author Sophie Bremer
 */
'use strict';
const TS = require("typescript");
const RuleContext_1 = require("../RuleContext");
/* *
 *
 *  Constants
 *
 * */
const message = [
    'Explicitly type imports are not necessary.',
    'Instead write the generic Array<...> to improve readability.'
].join(' ');
const optionsDefaults = {};
const optionsSchema = {};
/* *
 *
 *  Functions
 *
 * */
function createFixer(firstPosition, secondPosition) {
    return () => ({
        range: [firstPosition.end, secondPosition.end],
        text: ''
    });
}
function lint(context) {
    const code = context.sourceCode, lines = code.lines;
    let firstToken, secondToken, tokens;
    for (const line of lines) {
        tokens = line.getEssentialTokens();
        for (let i = 0, iEnd = tokens.length - 2; i < iEnd; ++i) {
            firstToken = tokens[i];
            secondToken = tokens[i + 1];
            if (firstToken.kind === TS.SyntaxKind.ImportKeyword &&
                secondToken.kind === TS.SyntaxKind.TypeKeyword) {
                const firstPosition = code.getTokenPosition(line, firstToken), secondPosition = code.getTokenPosition(line, secondToken);
                if (firstPosition && secondPosition) {
                    context.report(secondPosition, message, createFixer(firstPosition, secondPosition));
                }
            }
        }
    }
}
module.exports = RuleContext_1.default.setupRuleExport('layout', optionsSchema, optionsDefaults, lint, true);
