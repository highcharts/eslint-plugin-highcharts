/*
 * @fileoverview The global Highcharts namespace should not be used, as it makes
 * type modifications difficult. Instead write declarations in `.d.ts` files
 * and make use of `declare module...` in `.ts` files for further extension.
 */
'use strict';

const message = 'Do not use the global Highcharts namespace for declarations.';

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

            const regex = /namespace Highcharts/g;

            let match;

            while (match = regex.exec(code)) {
                const codeBefore = code.substr(0, regex.lastIndex - match[0].length);
                const linesBefore = codeBefore.split('\n');
                const line = linesBefore[linesBefore.length - 1];

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
