/**
 * @fileoverview Array types should always be written in generic syntax to avoid
 * any confusion with array assignments, array indexer, or type selectors.
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
    'Do not use the [] shortcut for the array type.',
    'Instead write the generic Array<...> to improve readability.'
].join(' ');
const optionsDefaults = {};
const optionsSchema = {};
/* *
 *
 *  Functions
 *
 * */
function createFixer(position, identifierToken, openBracketToken, closeBracketToken) {
    return () => {
        const range = [
            position.start,
            (position.start
                + identifierToken.text.length
                + openBracketToken.text.length
                + closeBracketToken.text.length)
        ], text = `Array<${identifierToken}>`;
        return { range, text };
    };
}
function lint(context) {
    const code = context.sourceCode, lines = code.lines;
    let firstToken, secondToken, thirdToken, tokens;
    for (const line of lines) {
        tokens = line.tokens;
        for (let i = 0, iEnd = tokens.length - 2; i < iEnd; ++i) {
            firstToken = tokens[i];
            secondToken = tokens[i + 1];
            thirdToken = tokens[i + 2];
            if (firstToken.kind === TS.SyntaxKind.Identifier &&
                secondToken.kind === TS.SyntaxKind.OpenBracketToken &&
                thirdToken.kind === TS.SyntaxKind.CloseBracketToken) {
                const position = code.getTokenPosition(line, secondToken);
                if (position) {
                    context.report(position, message, createFixer(position, firstToken, secondToken, thirdToken));
                }
            }
        }
    }
}
module.exports = RuleContext_1.default.setupRuleExport('layout', optionsSchema, optionsDefaults, lint, true);
