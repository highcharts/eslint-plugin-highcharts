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
import RuleContext from '../RuleContext';
import RuleOptions from '../RuleOptions';


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


const messageTemplate = 'Code line exceeds limit of {0} characters.';


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


const regExps = {
    breakSplit: /\n/gu,
    docletTag: /^(@[A-Za-z][\w-]+)\s+(?:(\{[^\}]+\})\s+)?([\s\S]*)$/u,
    docletTagSplit: /(?<=\s)(?=@[A-Za-z])/gu,
    docletTagTrim: /^\s*\*\s+/mu,
    spaceSplit: /\s+/gsu
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

    context.fix((transformationConext, node) => {
        if (TS.isJSDoc(node)) {
            process.stdout.write('.');
            return transformationConext.factory.createJSDocComment(
                (TS.getTextOfJSDocComment(node.comment) || '').toUpperCase(),
                node.tags
            );
        }
        return node;
    });

    FS.writeFileSync(
        context.sourceFile.fileName + '.json',
        JSON.stringify(docletASTs, ['comment', 'name', 'tags', 'text'], '  ')
    );
}


function lint (
    context: PrettyLengthContext
) {
    const sourceTextLines = context.sourceFile.getFullText().split(regExps.breakSplit),
        {
            ignorePattern,
            maximalLength
        } = setupOptions(context.options),
        ignoreRegExp = (ignorePattern && new RegExp(ignorePattern));

    console.log('Checking', context.sourceFile.fileName);

    for (
        let line = 0,
            lineEnd = sourceTextLines.length,
            sourceTextLength: number,
            sourceTextLine: string;
        line < lineEnd;
        ++line
    ) {
        sourceTextLine = sourceTextLines[line];
        sourceTextLength = sourceTextLine.length;

        if (
            ignoreRegExp &&
            ignoreRegExp.test(sourceTextLine)
        ) {
            continue;
        }

        if (sourceTextLength > maximalLength) {
            context.report(
                line,
                maximalLength - 1,
                messageTemplate.replace('{0}', `${maximalLength}`)
            );
        }
    }
}


function setupOptions(
    options: Partial<PrettyLengthOptions>
): PrettyLengthOptions {
    return {
        ignorePattern: options.ignorePattern || optionsDefaults.ignorePattern,
        indentSize: options.indentSize || optionsDefaults.indentSize,
        maximalLength: (
            options.maximalLength ||
            optionsDefaults.maximalLength
        )
    };
}


/* *
 *
 *  Default Export
 *
 * */


export = RuleContext.setupRuleExport(
    'layout',
    optionsSchema,
    lint,
    fix
);
