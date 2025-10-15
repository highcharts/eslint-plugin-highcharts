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
    context: GenericArrayTypeContext,
    linesToFix: Array<SourceLine>
): ESLint.Rule.ReportFixer {
    return (): (ESLint.Rule.Fix|null) => {
        const code = context.sourceCode,
            fix: Array<string> = [],
            range: ESLint.AST.Range = [ 0, code.raw.length + 256 ],
            lines = code.lines;

        let firstToken: SourceToken,
            secondToken: SourceToken,
            thirdToken: SourceToken,
            tokenReplacements: Array<SourceToken>,
            tokens: Array<SourceToken>;

        for (const l of lines) {

            if (linesToFix.includes(l)) {
                tokens = l.tokens;

                for (let i = 0, iEnd = tokens.length - 2; i < iEnd; ++i) {
                    firstToken = tokens[i];
                    secondToken = tokens[i+1];
                    thirdToken = tokens[i+2];

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


function isMatch(
    firstToken: SourceToken,
    secondToken: SourceToken,
    thirdToken: SourceToken
): boolean {
    return (
        secondToken.kind === TS.SyntaxKind.OpenBracketToken &&
        thirdToken.kind === TS.SyntaxKind.CloseBracketToken &&
        (
            firstToken.kind === TS.SyntaxKind.AnyKeyword ||
            firstToken.kind === TS.SyntaxKind.BooleanKeyword ||
            firstToken.kind === TS.SyntaxKind.BigIntKeyword ||
            firstToken.kind === TS.SyntaxKind.CloseBracketToken ||
            firstToken.kind === TS.SyntaxKind.CloseParenToken ||
            firstToken.kind === TS.SyntaxKind.GreaterThanToken ||
            firstToken.kind === TS.SyntaxKind.NullKeyword ||
            firstToken.kind === TS.SyntaxKind.NumberKeyword ||
            firstToken.kind === TS.SyntaxKind.ObjectKeyword ||
            firstToken.kind === TS.SyntaxKind.StringKeyword ||
            firstToken.kind === TS.SyntaxKind.SymbolKeyword ||
            firstToken.kind === TS.SyntaxKind.UndefinedKeyword ||
            firstToken.kind === TS.SyntaxKind.UnknownKeyword ||
            firstToken.kind === TS.SyntaxKind.VoidKeyword
        )
    );
}



function lint (
    context: GenericArrayTypeContext
): void {
    const code = context.sourceCode,
        lines = code.lines,
        linesToFix: Array<SourceLine> = [];

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

            if (isMatch(firstToken, secondToken, thirdToken)) {
                const position = code.getTokenPosition(line, secondToken);

                if (position) {
                    context.prepareReport(
                        position,
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
