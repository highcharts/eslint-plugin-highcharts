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
import RuleContext from '../RuleContext';
import RuleOptions from '../RuleOptions';
import SourceLine from '../SourceLine';


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
    context: PrettyLengthContext,
    fixLines: Array<SourceLine>
): ESLint.Rule.ReportFixer {
    return (): ESLint.Rule.Fix => {
        const code = context.sourceCode,
            fix: Array<string> = [],
            range: ESLint.AST.Range = [ 0, code.raw.length + 256 ],
            lines = code.lines,
            {
                ignorePattern,
                maximalLength
            } = context.options,
            ignoreRegExp = (ignorePattern ? new RegExp(ignorePattern) : void 0);

        let text: string;

        for (const l of lines) {
            text = l.toString();

            if (
                fixLines.includes(l) &&
                (
                    !ignoreRegExp ||
                    !ignoreRegExp.test(text)
                )
            ) {
                fix.push(l.toString(maximalLength));
            } else {
                fix.push(text);
            }
        }

        return { range, text: fix.join(code.lineBreak) };
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
        fixLines: Array<SourceLine> = [],
        message = messageTemplate.replace('{0}', `${maximalLength}`);

    let maximalLineLength: number;

    for (const line of lines) {

        if (
            ignoreRegExp &&
            ignoreRegExp.test(line.toString())
        ) {
            continue;
        }

        maximalLineLength = line.getMaximalLength();

        if (maximalLineLength > maximalLength) {
            const position = code.getLinePosition(line);

            if (position) {
                const wrappedLines = line.getWrappedLines();

                if (wrappedLines.length === 1) {
                    // only lines with multiline comments for now
                    continue;
                }

                let lineIndex = 0;

                for (const wrappedLine of wrappedLines) {

                    if (
                        wrappedLine.length > maximalLength &&
                        wrappedLine.split(/\s+/g).length > 1
                    ) {
                        context.prepareReport(
                            {
                                column: maximalLength + 1,
                                end: position.end,
                                line: position.line + lineIndex,
                                start: position.start
                            },
                            message + ` ${maximalLineLength}`
                        );
                    }

                    ++lineIndex;
                }

                fixLines.push(line);
            }
        }
    }

    context.sendReports(createFixer(context, fixLines));
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
