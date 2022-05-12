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
function createFixer(context, linesToFix) {
    return () => {
        const code = context.sourceCode, fix = [], range = [0, code.raw.length + 256], lines = code.lines;
        let firstToken, secondToken, thirdToken, tokens;
        for (const l of lines) {
            if (linesToFix.includes(l)) {
                tokens = l.tokens;
                for (let i = 0, iEnd = tokens.length - 2; i < iEnd; ++i) {
                    firstToken = tokens[i];
                    secondToken = tokens[i + 1];
                    thirdToken = tokens[i + 2];
                    if (firstToken.kind === TS.SyntaxKind.ImportKeyword &&
                        secondToken.kind === TS.SyntaxKind.WhitespaceTrivia &&
                        thirdToken.kind === TS.SyntaxKind.TypeKeyword) {
                        tokens.splice(i + 1, 2);
                        iEnd = tokens.length - 2;
                    }
                }
            }
            fix.push(l.toString());
        }
        return { range, text: fix.join(code.lineBreak) };
    };
}
function lint(context) {
    const code = context.sourceCode, lines = code.lines, linesToFix = [];
    let firstToken, secondToken, tokens;
    for (const line of lines) {
        tokens = line.getEssentialTokens();
        for (let i = 0, iEnd = tokens.length - 1; i < iEnd; ++i) {
            firstToken = tokens[i];
            secondToken = tokens[i + 1];
            if (firstToken.kind === TS.SyntaxKind.ImportKeyword &&
                secondToken.kind === TS.SyntaxKind.TypeKeyword) {
                const firstPosition = code.getTokenPosition(line, firstToken), secondPosition = code.getTokenPosition(line, secondToken);
                if (firstPosition && secondPosition) {
                    context.prepareReport(secondPosition, message);
                    linesToFix.push(line);
                }
            }
        }
    }
    context.sendReports(createFixer(context, linesToFix));
}
module.exports = RuleContext_1.default.setupRuleExport('layout', optionsSchema, optionsDefaults, lint, true);
