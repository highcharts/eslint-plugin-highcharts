/**
 * @fileoverview Limit and autofix max length.
 * @author Sophie Bremer
 */
'use strict';
const FS = require("fs");
const Path = require("path");
/* *
 *
 *  Constants
 *
 * */
const messageTemplate = 'Code line exceeds limit of {0} characters.';
const optionsDefault = {
    maximalLength: 80
};
const optionsSchema = {
    'ignorePattern': {
        'type': 'string'
    },
    'maximalLength': {
        'type': 'integer'
    }
};
const regExps = {
    breakSplit: /\n/gu,
    docletTag: /^(@[A-Za-z][\w-]+)\s+(?:(\{[^\}]+\})\s+)?([\s\S]*)$/u,
    docletTagSplit: /(?<=\s)(?=@[A-Za-z])/gu,
    docletTagTrim: /^\s*\*\s+/mu,
    spaceSplit: /\s+/gsu
};
/* *
 *
 *  Functions
 *
 * */
function create(ruleContext) {
    const cwd = ruleContext.getCwd(), filePath = Path.relative(cwd, ruleContext.getFilename()), options = createOptions(ruleContext.options), message = messageTemplate.replace('{0}', `${options.maximalLength}`), sourceCode = ruleContext.getSourceCode(), 
    // Read source file as sourceCode.getText is build from flawed AST
    sourceText = FS.readFileSync(filePath).toString(), sourceTextLines = sourceCode.getText().split(regExps.breakSplit);
    return {
        Program: (node) => {
            const context = {
                cwd,
                filePath,
                node,
                options,
                ruleContext,
                sourceCode,
                sourceText,
                sourceTextLines,
                report: (line, column) => {
                    ruleContext.report({
                        fix: (fixer) => programFix(context, fixer),
                        loc: {
                            column,
                            line
                        },
                        message,
                        node
                    });
                }
            };
            return program(context);
        }
    };
}
function createOptions(ruleOptions) {
    const [options] = ruleOptions;
    return {
        ignorePattern: options.ignorePattern || optionsDefault.ignorePattern,
        indentSize: options.indentSize || optionsDefault.indentSize,
        maximalLength: (options.maximalLength ||
            optionsDefault.maximalLength)
    };
}
/**
 *
 * @return {Array<DocletAST>}
 */
function extractDoclets(context) {
    const comments = context.sourceCode.getAllComments(), doclets = [], indentSize = context.options.indentSize || 4;
    for (let i = 0, iEnd = comments.length, comment; i < iEnd; ++i) {
        comment = comments[i];
        if (!comment.loc ||
            !comment.range ||
            comment.type !== 'Block' ||
            comment.value[0] !== '*') {
            continue;
        }
        doclets.push({
            indentLevel: Math.floor((comment.loc.start.column || 0) / indentSize),
            loc: comment.loc,
            range: comment.range,
            tags: extractDocletTags(comment.value)
        });
    }
    return doclets;
}
function extractDocletTags(doclet) {
    const segments = doclet.split(regExps.docletTagSplit), tags = [];
    for (let i = 0, iEnd = segments.length, segment; i < iEnd; ++i) {
        segment = segments[i];
        const tag = segment.match(regExps.docletTag) || [], name = tag[1], meta = (tag[2] || '').trim() || void 0;
        let param, value = tag[3] || tag[0] || segment;
        if (name === '@param') {
            param = value.split(regExps.spaceSplit)[0];
            value = value.substr(param.length).trim();
        }
        if (name !== '@example') {
            value = value.replace(regExps.docletTagTrim, '');
        }
        tags.push({
            meta,
            name,
            param,
            value
        });
    }
    return tags;
}
function program(context) {
    const sourceTextLines = context.sourceTextLines, { ignorePattern, maximalLength } = context.options, ignoreRegExp = (ignorePattern && new RegExp(ignorePattern));
    console.log('Checking', context.filePath);
    for (let line = 0, lineEnd = sourceTextLines.length, sourceTextLength, sourceTextLine; line < lineEnd; ++line) {
        sourceTextLine = sourceTextLines[line];
        sourceTextLength = sourceTextLine.length;
        if (ignoreRegExp &&
            ignoreRegExp.test(sourceTextLine)) {
            continue;
        }
        if (sourceTextLength > maximalLength) {
            context.report(line, maximalLength - 1);
        }
    }
}
function programFix(context, fixer) {
    const docletASTs = extractDoclets(context), fixes = [];
    for (let i = 0, iEnd = docletASTs.length; i < iEnd; ++i) {
        fixes.push(fixer.replaceTextRange(docletASTs[i].range, '/**\n' +
            docletASTs[i].tags
                .map(tag => ((tag.name ?
                ` ${tag.name} ` :
                '') +
                (tag.meta ?
                    `${tag.meta} ` :
                    '') +
                tag.value))
                .join('\n *') +
            ' */'));
    }
    FS.writeFileSync(context.filePath + '.json', 
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    JSON.stringify(docletASTs, void 0, '  '));
    return fixes;
}
module.exports = {
    meta: {
        'type': 'layout',
        'fixable': 'code',
        'schema': [{
                'type': 'object',
                'properties': optionsSchema,
                'additionalProperties': false
            }]
    },
    create
};
