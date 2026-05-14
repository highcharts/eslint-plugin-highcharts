/*
 * @fileoverview Doclet tags `@since` and `@deprecated` needs to have a semver
 * version number or `next` as the value. Allowed exception is single line
 * internal doclet with just the `@deprecated` tag or a doclet with `@internal`.
 */
'use strict';

const message = 'Since and deprecated tag needs a semver version number or ' +
    '`next` as the value.';

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
        const sourceCode = context.getSourceCode(),
            // Semver (format: 1 or 1.2 or 1.2.3) or `next` are allowed
            valid = /^(next|\d+(?:\.\d+){0,2})$/;

        return {
            Program() {
                const comments = sourceCode.getAllComments();

                comments.forEach(comment => {
                    if (
                        // Check only block comments
                        comment.type !== 'Block' ||
                        // Check only jsdoc comments
                        !comment.value.startsWith('*') ||
                        // Ignore internal doclet
                        comment.value.includes('* @internal') ||
                        // Ignore doclet with just deprecated tag (as internal)
                        comment.value === '* @deprecated '
                    ) {
                        return;
                    }

                    comment.value.split('\n').forEach((line, i) => {
                        // No tag, no need to check
                        const tagMatch = line.match(/@(since|deprecated)/)
                        if (!tagMatch) {
                            return;
                        }

                        const match = line.match(/@(since|deprecated)\s+(.+)/);

                        // No match when there is no value or check the value
                        if (!match || !valid.test(match[2].trim())) {
                            const column = line.indexOf(`@${tagMatch[1]}`);

                            context.report({
                                loc: {
                                    start: {
                                        line: comment.loc.start.line + i,
                                        column
                                    },
                                    end: {
                                        line: comment.loc.start.line + i,
                                        column: column + (
                                            match?.[0].length ||
                                            tagMatch[1].length
                                        ) + 1
                                    }
                                },
                                message
                            });
                        }
                    });
                });
            }
        };
    }
};
