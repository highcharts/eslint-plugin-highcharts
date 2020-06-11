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

            const regex2 = /Highcharts\.(?:[a-z])/;
            const regex3 = /^\s+(?:\/\/|\/\*|\*)/

            if (regex2.test(code)) {

                const codeBefore = code.split(regex2)[0];
                const linesBefore = codeBefore.split('\n');
                const line = linesBefore[linesBefore.length - 1];
                
                if (regex3.test(line)) {
                    return;
                }

                const loc = {
                    line: linesBefore.length,
                    column: line.length
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
