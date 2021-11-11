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


import * as FS from 'fs';
import * as TS from 'typescript';
import * as U from '../Utilities';
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


function fix(
    context: PrettyLengthContext
): void {
    const docletASTs: Array<TS.JSDoc> = [];

    context.sourceCode.lines.forEach(
        sourceLine => docletASTs.push(...U.getJSDocs(sourceLine))
    );

    FS.writeFileSync(
        context.sourceCode.fileName + '.json',
        JSON.stringify(
            docletASTs,
            [
                'name',
                'comment',
                'text',
                'tags',
                'kind',
                'flags',
                'modifierFlagsCache',
                'transformFlags',
                'end',
                'pos',
            ],
            '  '
        )
    );
}


function fixJSDoc(
    context: PrettyLengthContext
): void {
    // @todo
}


function lint (
    context: PrettyLengthContext
) {
    const sourceLines = context.sourceCode.lines,
        {
            ignorePattern,
            maximalLength
        } = context.options,
        ignoreRegExp = (ignorePattern && new RegExp(ignorePattern));

    console.log('Checking', context.sourceCode.fileName);

    for (
        let line = 0,
            lineEnd = sourceLines.length,
            sourceLine: SourceLine,
            sourceLineLength: number;
        line < lineEnd;
        ++line
    ) {
        sourceLine = sourceLines[line];

        if (
            ignoreRegExp &&
            ignoreRegExp.test(sourceLine.toString())
        ) {
            continue;
        }

        sourceLineLength = sourceLine.getLength();

        if (sourceLineLength > maximalLength) {
            context.report(
                line,
                maximalLength - 1,
                messageTemplate.replace('{0}', `${maximalLength}`)
            );
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
    fix
);
