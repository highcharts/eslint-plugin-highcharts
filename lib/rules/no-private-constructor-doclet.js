/*
 * @fileoverview The doclet of a constructor should not contain a `@private`
 * tag, as this will hide class properties after TypeScript processing.
 */
'use strict';

const message = 'Doclets of constructors should not have a private tag.';

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

            const regex = /@private[^\/]+\*\/[\n\r\s\t]+(?:private|protected|public)[\n\r\s\t]+constructor/;

            if (regex.test(code)) {

                const codeBefore = code.split(regex)[0];
                const linesBefore = codeBefore.split('\n');
                const loc = {
                    line: linesBefore.length,
                    column: linesBefore[linesBefore.length - 1].length
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
