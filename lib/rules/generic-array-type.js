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
function createFixer(context, linesToFix) {
    return () => {
        const code = context.sourceCode, fix = [], range = [0, code.raw.length + 256], lines = code.lines;
        let firstToken, secondToken, thirdToken, tokenReplacements, tokens;
        for (const l of lines) {
            if (linesToFix.includes(l)) {
                tokens = l.tokens;
                for (let i = 0, iEnd = tokens.length - 2; i < iEnd; ++i) {
                    firstToken = tokens[i];
                    secondToken = tokens[i + 1];
                    thirdToken = tokens[i + 2];
                    if (isMatch(firstToken, secondToken, thirdToken)) {
                        tokenReplacements = [{
                                kind: TS.SyntaxKind.Identifier,
                                text: 'Array'
                            }, {
                                kind: TS.SyntaxKind.LessThanToken,
                                text: '<'
                            },
                            firstToken,
                            {
                                kind: TS.SyntaxKind.GreaterThanToken,
                                text: '>'
                            }];
                        tokens.splice(i, 3, ...tokenReplacements);
                        iEnd = tokens.length - 2;
                    }
                }
            }
            fix.push(l.toString());
        }
        return { range, text: fix.join(code.lineBreak) };
    };
}
function isMatch(firstToken, secondToken, thirdToken) {
    return (secondToken.kind === TS.SyntaxKind.OpenBracketToken &&
        thirdToken.kind === TS.SyntaxKind.CloseBracketToken &&
        (firstToken.kind === TS.SyntaxKind.AnyKeyword ||
            firstToken.kind === TS.SyntaxKind.BooleanKeyword ||
            firstToken.kind === TS.SyntaxKind.BigIntKeyword ||
            firstToken.kind === TS.SyntaxKind.CloseBracketToken ||
            firstToken.kind === TS.SyntaxKind.NullKeyword ||
            firstToken.kind === TS.SyntaxKind.NumberKeyword ||
            firstToken.kind === TS.SyntaxKind.ObjectKeyword ||
            firstToken.kind === TS.SyntaxKind.StringKeyword ||
            firstToken.kind === TS.SyntaxKind.SymbolKeyword ||
            firstToken.kind === TS.SyntaxKind.UndefinedKeyword ||
            firstToken.kind === TS.SyntaxKind.UnknownKeyword ||
            firstToken.kind === TS.SyntaxKind.VoidKeyword));
}
function lint(context) {
    const code = context.sourceCode, lines = code.lines, linesToFix = [];
    let firstToken, secondToken, thirdToken, tokens;
    for (const line of lines) {
        tokens = line.tokens;
        for (let i = 0, iEnd = tokens.length - 2; i < iEnd; ++i) {
            firstToken = tokens[i];
            secondToken = tokens[i + 1];
            thirdToken = tokens[i + 2];
            if (isMatch(firstToken, secondToken, thirdToken)) {
                const position = code.getTokenPosition(line, secondToken);
                if (position) {
                    context.prepareReport(position, message);
                    linesToFix.push(line);
                }
            }
        }
    }
    context.sendReports(createFixer(context, linesToFix));
}
module.exports = RuleContext_1.default.setupRuleExport('layout', optionsSchema, optionsDefaults, lint, true);
