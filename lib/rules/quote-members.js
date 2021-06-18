/*
 * @fileoverview Some reserved keyword should not be used as a property name
 * because they break scripts in older browsers.
 */
'use strict';

const message = 'Put a regular member with a keyword-name in quotes.';
const keyword = ['catch', 'finally', 'in', 'try'];

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

            const regex = new RegExp(
                '(?:(?:private|protected|public|readonly|static)\\s+|\\.)' +
                `((?:${keyword.join('|')})[\\(\\:])`,
                'g'
            );

            let match;

            while (match = regex.exec(code)) {

                const codeBefore = code.substr(0, regex.lastIndex - match[1].length);
                const linesBefore = codeBefore.split('\n');
                const line = linesBefore[linesBefore.length - 1];

                if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) {
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
