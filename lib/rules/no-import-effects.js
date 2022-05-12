/**
 * @fileoverview Imports should not be anonymous. Move desired side effects into
 * compose functions and call these instead.
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
const messageTemplate = [
    'Imports should not be anonymous.',
    'Create and call a composer for side effects.'
].join(' ');
const optionsDefaults = {};
const optionsSchema = {};
/* *
 *
 *  Functions
 *
 * */
function lint(context) {
    const code = context.sourceCode, importsToCheck = [], tokensToCheck = [];
    let firstToken, secondToken, tokens;
    for (const line of code.lines) {
        if (line.getIndent() !== 0) {
            continue;
        }
        tokens = line.getEssentialTokens();
        for (let i = 0, iEnd = tokens.length; i < iEnd; ++i) {
            firstToken = tokens[i];
            if (firstToken.kind === TS.SyntaxKind.DeleteKeyword) {
                const identifierIndex = line
                    .getTokenKinds(i)
                    .indexOf(TS.SyntaxKind.Identifier) + i;
                if (identifierIndex >= 0) {
                    tokensToCheck.push([line, line.tokens[identifierIndex]]);
                }
            }
            else if (firstToken.kind === TS.SyntaxKind.EqualsToken) {
                const identifierIndex = line
                    .getTokenKinds(0, i)
                    .indexOf(TS.SyntaxKind.Identifier);
                if (identifierIndex >= 0) {
                    tokensToCheck.push([line, line.tokens[identifierIndex]]);
                }
            }
            secondToken = tokens[i + 1];
            if (!secondToken) {
                continue;
            }
            if (firstToken.kind === TS.SyntaxKind.ImportKeyword &&
                secondToken.kind === TS.SyntaxKind.Identifier) {
                importsToCheck.push(secondToken.text);
            }
            else if (firstToken.kind === TS.SyntaxKind.ImportKeyword &&
                secondToken.kind === TS.SyntaxKind.OpenBraceToken) {
                let previousToken;
                for (const thisToken of tokens.slice(i + 2)) {
                    if (previousToken &&
                        previousToken.kind === TS.SyntaxKind.Identifier &&
                        (thisToken.kind === TS.SyntaxKind.CommaToken ||
                            thisToken.kind === TS.SyntaxKind.CloseBraceToken ||
                            thisToken.kind === TS.SyntaxKind.CloseBracketToken)) {
                        importsToCheck.push(previousToken.text);
                    }
                    previousToken = thisToken;
                }
            }
        }
    }
    for (const token of tokensToCheck) {
        if (importsToCheck.includes(token[1].text)) {
            const position = code.getTokenPosition(token[0], token[1]);
            if (position) {
                context.prepareReport(position, messageTemplate);
            }
        }
    }
    context.sendReports();
}
module.exports = RuleContext_1.default.setupRuleExport('problem', optionsSchema, optionsDefaults, lint, false);
