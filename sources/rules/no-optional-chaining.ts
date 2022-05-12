/**
 * @fileoverview Do not use optional chaining because it bloats transpiled code.
 * Instead use the `pick` function or `&&` conditions.
 * @author Sophie Bremer
 */


'use strict';


/* *
 *
 *  Imports
 *
 * */


import * as TS from 'typescript';
import RuleContext from '../RuleContext';
import RuleOptions from '../RuleOptions';
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
    'Do not use optional chaining.',
    'Instead use the `pick` function or `&&` conditions.'
].join(' ');

const optionsDefaults: RuleOptions = {};

const optionsSchema = {};


/* *
 *
 *  Functions
 *
 * */


function lint (
    context: GenericArrayTypeContext
): void {
    const code = context.sourceCode,
        lines = code.lines;

    let tokens: Array<SourceToken>;

    for (const line of lines) {
        tokens = line.tokens;

        for (
            let index = 0,
                indexEnd = tokens.length - 2,
                firstToken: SourceToken;
            index < indexEnd;
            ++index
        ) {
            firstToken = tokens[index];

            if (firstToken.kind === TS.SyntaxKind.QuestionDotToken) {
                const position = code.getTokenPosition(line, firstToken);

                if (position) {
                    context.report(position, message);
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
    false
);
