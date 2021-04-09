/*
 * @fileoverview Use classes instead of mixin modifications.
 */
'use strict';

const message = 'Do not use mixins.';

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

            const regex = /(?:import|from)\s+\'[^']*\/(Mixins\/)/g;

            let match;

            while (match = regex.exec(code)) {
                const codeBefore = code.substr(0, regex.lastIndex - match[1].length);
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
