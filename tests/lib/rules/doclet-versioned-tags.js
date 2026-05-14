/**
 * @fileoverview Doclet tags `@since` and `@deprecated` needs to have a semver
 * version number or `next` as the value. Allowed exception is single line
 * internal doclet with just the `@deprecated` tag or a doclet with `@internal`.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/doclet-versioned-tags"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const message = rule.meta.docs.description;
const ruleTester = new RuleTester();
ruleTester.run("doclet-versioned-tags", rule, {

    valid: [{
        // Allowed exceptions - internal usage
        code: `
            /**
             * @internal
             * @deprecated
             */
            
            /** @deprecated */`,
        errors: []
    }, {
        // Correct usage examples
        code: `
            /**
             * Some doclet.
             *
             * @since next
             */
            
            /**
             * @since 2.0
             * @deprecated 3.2.1
             */`,
        errors: []
    }],

    invalid: [{
        code: `
            /**
             * @since {next}
             */`,
        errors: [{
            message
        }]
    }, {
        code: `
            /**
             * Some doclet.
             *
             * @deprecated
             */`,
        errors: [{
            message
        }]
    }]
});
