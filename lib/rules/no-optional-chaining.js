/*
 * @fileoverview The optional chaining should not be used, as it bloats
 * transpiled ES5 code. Instead make use of the `pick` function or make inline
 * chain with `&&` or `||`.
 */
'use strict';

const message = 'Do not use optional chaining.';

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

            const pattern = /\?\.[\w\[\(]/g;

            let match;

            while (match = pattern.exec(code)) {
                const codeBefore = code.substr(0, pattern.lastIndex - match[0].length);
                const linesBefore = codeBefore.split('\n');
                const line = linesBefore[linesBefore.length - 1];

                context.report({
                    node: node,
                    loc:  {
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
