/**
 * @fileoverview Limit and autofix max length.
 * @author Sophie Bremer
 */
'use strict';
const RuleContext_1 = require("../RuleContext");
/* *
 *
 *  Constants
 *
 * */
const messageTemplate = 'Line exceeds limit of {0} characters.';
const optionsDefaults = {
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
/* *
 *
 *  Functions
 *
 * */
function createFixer(context, fixLines) {
    return () => {
        const code = context.sourceCode, fix = [], range = [0, code.raw.length + 256], lines = code.lines, { ignorePattern, maximalLength } = context.options, ignoreRegExp = (ignorePattern ? new RegExp(ignorePattern) : void 0);
        let text;
        for (const l of lines) {
            text = l.toString();
            if (fixLines.includes(l) &&
                (!ignoreRegExp ||
                    !ignoreRegExp.test(text))) {
                fix.push(l.toString(maximalLength));
            }
            else {
                fix.push(text);
            }
        }
        return { range, text: fix.join(code.lineBreak) };
    };
}
function lint(context) {
    const code = context.sourceCode, { ignorePattern, maximalLength } = context.options, ignoreRegExp = (ignorePattern ? new RegExp(ignorePattern) : void 0), lines = code.lines, fixLines = [], message = messageTemplate.replace('{0}', `${maximalLength}`);
    let maximalLineLength;
    for (const line of lines) {
        if (ignoreRegExp &&
            ignoreRegExp.test(line.toString())) {
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
                    if (wrappedLine.length > maximalLength &&
                        wrappedLine.split(/\s+/g).length > 1) {
                        context.prepareReport({
                            column: maximalLength + 1,
                            end: position.end,
                            line: position.line + lineIndex,
                            start: position.start
                        }, message + ` ${maximalLineLength}`);
                        fixLines.push(line);
                    }
                    ++lineIndex;
                }
            }
        }
    }
    context.sendReports(createFixer(context, fixLines));
}
module.exports = RuleContext_1.default.setupRuleExport('layout', optionsSchema, optionsDefaults, lint, true);
