/**
 * @fileoverview Explicitly type imports are not necessary because TypeScript
 * will automatically remove type-only used imports during transpilation.
 * @author Sophie Bremer
 */


'use strict';


/* *
 *
 *  Imports
 *
 * */


import * as ESLint from 'eslint';
import * as TS from 'typescript';
import RuleContext from '../RuleContext';
import RuleOptions from '../RuleOptions';
import SourceLine from '../SourceLine';
import SourceToken from '../SourceToken';


/* *
 *
 *  Declarations
 *
 * */


type NoImportTypeTypeContext = RuleContext<RuleOptions>;


/* *
 *
 *  Constants
 *
 * */


const message = [
    'Explicitly type imports are not necessary.',
    'Instead write the generic Array<...> to improve readability.'
].join(' ');

const optionsDefaults: RuleOptions = {};

const optionsSchema = {};


/* *
 *
 *  Functions
 *
 * */


function createFixer(
    context: NoImportTypeTypeContext,
    linesToFix: Array<SourceLine>
): ESLint.Rule.ReportFixer {
    return (): ESLint.Rule.Fix => {
        const code = context.sourceCode,
            fix: Array<string> = [],
            range: ESLint.AST.Range = [ 0, code.raw.length + 256 ],
            lines = code.lines;

        let firstToken: SourceToken,
            secondToken: SourceToken,
            thirdToken: SourceToken,
            tokens: Array<SourceToken>;

        for (const l of lines) {

            if (linesToFix.includes(l)) {
                tokens = l.tokens;

                for (let i = 0, iEnd = tokens.length - 2; i < iEnd; ++i) {
                    firstToken = tokens[i];
                    secondToken = tokens[i+1];
                    thirdToken = tokens[i+2];

                    if (
                        firstToken.kind === TS.SyntaxKind.ImportKeyword &&
                        secondToken.kind === TS.SyntaxKind.WhitespaceTrivia &&
                        thirdToken.kind === TS.SyntaxKind.TypeKeyword
                    ) {
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

function lint (
    context: NoImportTypeTypeContext
): void {
    const code = context.sourceCode,
        lines = code.lines,
        linesToFix: Array<SourceLine> = [];

    let firstToken: SourceToken,
        secondToken: SourceToken,
        tokens: Array<SourceToken>;

    for (const line of lines) {
        tokens = line.getEssentialTokens();

        for (let i = 0, iEnd = tokens.length - 1; i < iEnd; ++i) {
            firstToken = tokens[i];
            secondToken = tokens[i+1];

            if (
                firstToken.kind === TS.SyntaxKind.ImportKeyword &&
                secondToken.kind === TS.SyntaxKind.TypeKeyword
            ) {
                const firstPosition = code.getTokenPosition(line, firstToken),
                    secondPosition = code.getTokenPosition(line, secondToken);

                if (firstPosition && secondPosition) {
                    context.prepareReport(
                        secondPosition,
                        message
                    );
                    linesToFix.push(line);
                }
            }
        }
    }

    context.sendReports(createFixer(context, linesToFix));
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
    lint,
    true
);
