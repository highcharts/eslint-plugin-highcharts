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
import * as FS from 'fs';
import * as TS from 'typescript';
import RuleContext from '../RuleContext';
import RuleOptions from '../RuleOptions';
import SourceLine from '../SourceLine';
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
    const sourceLines = context.sourceCode.lines;

    for (
        let line = 0,
            lineEnd = sourceLines.length,
            sourceLine: SourceLine,
            sourceLineTokens: Array<SourceToken>;
        line < lineEnd;
        ++line
    ) {
        sourceLine = sourceLines[line];
        sourceLineTokens = sourceLine.tokens;

        for (
            let index = 0,
                indexEnd = sourceLineTokens.length - 2,
                identifierToken: SourceToken,
                openBracketToken: SourceToken,
                closeBracketToken: SourceToken;
            index < indexEnd;
            ++index
        ) {
            identifierToken = sourceLineTokens[index];
            openBracketToken = sourceLineTokens[index+1];
            closeBracketToken = sourceLineTokens[index+2];

            if (
                identifierToken.kind === TS.SyntaxKind.Identifier &&
                openBracketToken.kind === TS.SyntaxKind.OpenBracketToken &&
                closeBracketToken.kind === TS.SyntaxKind.CloseBracketToken
            ) {
                const position = sourceLine.getPosition(
                    context.sourceCode,
                    openBracketToken
                );

                if (position) {
                    context.report(
                        position,
                        message,
                        createFixer(
                            position,
                            identifierToken,
                            openBracketToken,
                            closeBracketToken
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
