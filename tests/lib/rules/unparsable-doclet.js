/**
 * @fileoverview A doclet is not parsable when added to the end of an object.
 * @author Torstein
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/unparsable-doclet"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("unparsable-doclet", rule, {

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "{ foo: 'bar' /** Some doclet */ }",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});
