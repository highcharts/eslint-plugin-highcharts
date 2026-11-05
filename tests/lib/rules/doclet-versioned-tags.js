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

    valid: [
        ...["1", "1.2.3-rc.1", "1.2.3+build.42",
            "99.0.0-rc.1+review.1", "1.2.3-0+build-42",
            "1.2.3-rc.1+build.001"].map(version => ({
            code: `/** @since ${version} */\n/** @deprecated ${version} */`
        })), {
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

    invalid: [
        ...["1.2-rc.1", "1.2.3-01", "1.2.3-rc..1",
            "1.2.3+build..1", "1.2.3-", "1.2.3+"].map(version => ({
            code: `/** @since ${version} */\n/** @deprecated ${version} */`,
            errors: [{ message }, { message }]
        })), {
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
