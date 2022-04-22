/**
 * @fileoverview Limit and autofix max length.
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
import SourceComment from '../SourceComment';
import SourceDoc from '../SourceDoc';
import SourceLine from '../SourceLine';
import SourcePosition from '../SourcePosition';


/* *
 *
 *  Declarations
 *
 * */


type PrettyLengthContext = RuleContext<PrettyLengthOptions>;


interface PrettyLengthOptions extends RuleOptions {
    ignorePattern?: string;
    indentSize?: number;
    maximalLength: number;
}


/* *
 *
 *  Constants
 *
 * */


const messageTemplate = 'Line exceeds limit of {0} characters.';


const optionsDefaults: PrettyLengthOptions = {
    maximalLength: 80
};


const optionsSchema = {
    'ignorePattern': {
        'type': 'string'
    },
    'maximalLength': {
        'type': 'integer'
    }
}


/* *
 *
 *  Functions
 *
 * */


function createFixer (
    line: SourceLine,
    position: SourcePosition,
    maximalLength: number
): ESLint.Rule.ReportFixer {
    return (): ESLint.Rule.Fix => {
        const range: ESLint.AST.Range = [ position.start, position.end ],
            text: Array<string> = [],
            tokens = line.tokens;

        let indent: number,
            lineText = '',
            tokenText: string;

        for (const token of tokens) {
            if (token.kind === TS.SyntaxKind.NewLineTrivia) {
                continue;
            }

            if (
                token instanceof SourceComment ||
                token instanceof SourceDoc
            ) {
                indent = token.getIndent();
                tokenText = token.toString(maximalLength - indent);
                continue;
            }

            tokenText = token.text;

            if ((lineText.length + tokenText.length) > maximalLength) {
                text.push(lineText);
                lineText = '';
            }

            lineText += tokenText;
        }

        text.push(lineText);

        return { range, text: text.join('\n') };
    };
}


function lint (
    context: PrettyLengthContext
): void {
    const code = context.sourceCode,
        {
            ignorePattern,
            maximalLength
        } = context.options,
        ignoreRegExp = (ignorePattern ? new RegExp(ignorePattern) : void 0),
        lines = code.lines,
        message = messageTemplate.replace('{0}', `${maximalLength}`);

    let lineLength: number;

    for (const line of lines) {
        if (
            ignoreRegExp &&
            ignoreRegExp.test(line.toString())
        ) {
            continue;
        }

        lineLength = line.getMaximalLength();

        if (lineLength > maximalLength) {
            const position = code.getLinePosition(line);

            if (position) {
                console.log(position);
                context.report(
                    position,
                    message + ` ${lineLength}`,
                    createFixer(line, position, maximalLength)
                );
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
