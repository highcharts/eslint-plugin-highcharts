/**
 * @fileoverview Array types should always be written in generic syntax to avoid
 * any confusion with array assignments, array indexer, or type selectors.
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


type GenericArrayTypeContext = RuleContext<RuleOptions>;


/* *
 *
 *  Constants
 *
 * */


const message = [
    'Do not use the [] shortcut for the array type.',
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
    position: SourcePosition,
    identifierToken: SourceToken,
    openBracketToken: SourceToken,
    closeBracketToken: SourceToken
): ESLint.Rule.ReportFixer {
    return (): (ESLint.Rule.Fix|null) => {
        const range: ESLint.AST.Range = [
                position.start,
                (
                    position.start
                    + identifierToken.text.length
                    + openBracketToken.text.length
                    + closeBracketToken.text.length
                )
            ],
            text = `Array<${identifierToken}>`;

        return { range, text };
    };
}

function lint (
    context: GenericArrayTypeContext
): void {
    const code = context.sourceCode,
        lines = code.lines;

    let firstToken: SourceToken,
        secondToken: SourceToken,
        thirdToken: SourceToken,
        tokens: Array<SourceToken>;

    for (const line of lines) {
        tokens = line.tokens;

        for (let i = 0, iEnd = tokens.length - 2; i < iEnd; ++i) {
            firstToken = tokens[i];
            secondToken = tokens[i+1];
            thirdToken = tokens[i+2];

            if (
                firstToken.kind === TS.SyntaxKind.Identifier &&
                secondToken.kind === TS.SyntaxKind.OpenBracketToken &&
                thirdToken.kind === TS.SyntaxKind.CloseBracketToken
            ) {
                const position = code.getTokenPosition(line, secondToken);

                if (position) {
                    context.report(
                        position,
                        message,
                        createFixer(
                            position,
                            firstToken,
                            secondToken,
                            thirdToken
                        )
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
