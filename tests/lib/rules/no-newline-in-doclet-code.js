/**
 * @fileoverview No newlines are allowed inside backticks in doclets.
 * @author Torstein Honsi
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-newline-in-doclet-code"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("no-newline-in-doclet-code", rule, {

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "This is a `class-\nname`",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});
