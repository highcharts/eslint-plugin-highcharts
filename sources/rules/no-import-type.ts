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
    range: ESLint.AST.Range
): ESLint.Rule.ReportFixer {
    return (): ESLint.Rule.Fix => ({ range, text: '' });
}

function lint (
    context: NoImportTypeTypeContext
): void {
    const code = context.sourceCode,
        lines = code.lines;

    let tokens: Array<SourceToken>;

    for (const line of lines) {
        tokens = line.getEssentialTokens();

        for (
            let index = 0,
                indexEnd = tokens.length - 2,
                firstToken: SourceToken,
                secondToken: SourceToken;
            index < indexEnd;
            ++index
        ) {
            firstToken = tokens[index];
            secondToken = tokens[index+1];

            if (
                firstToken.kind === TS.SyntaxKind.ImportKeyword &&
                secondToken.kind === TS.SyntaxKind.TypeKeyword
            ) {
                const firstPosition = code.getTokenPosition(line, firstToken),
                    secondPosition = code.getTokenPosition(line, secondToken);

                if (firstPosition && secondPosition) {
                    const range: ESLint.AST.Range = [
                        firstPosition.end,
                        secondPosition.end
                    ];

                    context.report(
                        secondPosition,
                        message,
                        createFixer(range)
                    );
                }
            }

        }
    }
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
