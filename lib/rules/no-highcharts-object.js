/*
 * @fileoverview The global Highcharts object should not be used, as it breaks
 * in module mode. Instead make use of import of the `Core/Globals` file as an H
 * object.
 */
'use strict';

const message = 'Do not use the global Highcharts object, import Globals instead.';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: message,
            category: 'Migration',
            recommended: false
        },
        fixable: null,  // or "code" or "whitespace"
        schema: [
            // fill in your schema
        ]
    },

    create: function (context) {

        // variables should be defined here
        const code = context.getSourceCode().lines.join('\n');

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------
        const program = (node) => {

            if (/import Highcharts from/.test(code)) {
                return;
            }

            const regex = /Highcharts([,)\]]|\.[a-z]|\.\w+\()/g;

            let match;

            while (match = regex.exec(code)) {

                const codeBefore = code.substr(0, regex.lastIndex - match[0].length);
                const linesBefore = codeBefore.split('\n');
                const line = linesBefore[linesBefore.length - 1];

                if (
                    (line.match(/['"]/g) || []).length % 2 === 1 ||
                    /^\s*(?:\/\/|\/\*|\*)/.test(line) ||
                    /\: |as |[\|\<'"]$/.test(line)
                ) {
                    continue;
                }

                context.report({
                    node: node,
                    loc: {
                        line: linesBefore.length,
                        column: line.length
                    },
                    message: message
                });
            }
        };

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {

            Program: program

        };
    }
};
