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
import SourcePosition from '../SourcePosition';
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
    firstPosition: SourcePosition,
    secondPosition: SourcePosition
): ESLint.Rule.ReportFixer {
    return (): ESLint.Rule.Fix => ({
        range: [firstPosition.end, secondPosition.end],
        text: ''
    });
}

function lint (
    context: NoImportTypeTypeContext
): void {
    const code = context.sourceCode,
        lines = code.lines;

    let firstToken: SourceToken,
        secondToken: SourceToken,
        tokens: Array<SourceToken>;

    for (const line of lines) {
        tokens = line.getEssentialTokens();

        for (let i = 0, iEnd = tokens.length - 2; i < iEnd; ++i) {
            firstToken = tokens[i];
            secondToken = tokens[i+1];

            if (
                firstToken.kind === TS.SyntaxKind.ImportKeyword &&
                secondToken.kind === TS.SyntaxKind.TypeKeyword
            ) {
                const firstPosition = code.getTokenPosition(line, firstToken),
                    secondPosition = code.getTokenPosition(line, secondToken);

                if (firstPosition && secondPosition) {
                    context.report(
                        secondPosition,
                        message,
                        createFixer(firstPosition, secondPosition)
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
