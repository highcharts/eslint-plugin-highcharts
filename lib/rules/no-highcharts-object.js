/*
 * @fileoverview The global Highcharts object should not be used, as it breaks
 * in module mode. Instead make use of import of the Globals file as an H
 * object.
 */
'use strict';

const message = 'Do not use global Highcharts object to access utility functions.';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: message,
            category: 'Docs',
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

            const regex1 = /import Highcharts from/;

            if (regex1.test(code)) {
                return;
            }

            const regex2 = /Highcharts\.(?:[a-z])/g;
            const regex3 = /^\s+(?:\/\/|\/\*|\*)/;
            const regex4 = /\: |as |[\|\<'"]$/;

            while (regex2.exec(code, regex2.lastIndex)) {

                const codeBefore = code.substr(0, regex2.lastIndex - 1);
                const linesBefore = codeBefore.split('\n');
                const line = linesBefore[linesBefore.length - 1];

                if (
                    regex3.test(line) ||
                    regex4.test(line)
                ) {
                    continue;
                }

                const loc = {
                    line: linesBefore.length,
                    column: line.length - 11
                };

                context.report({
                    node: node,
                    loc: loc,
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
