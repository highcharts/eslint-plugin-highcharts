/**
 * @author Sophie Bremer
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleContext = void 0;
const FS = require("fs");
const Path = require("path");
const SourceCode_1 = require("./SourceCode");
/* *
 *
 *  Class
 *
 * */
class RuleContext {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(esLintContext, ruleOptionsDefault, fixFunction) {
        this.changes = [];
        this.cwd = esLintContext.getCwd();
        this.esLintContext = esLintContext;
        this.fixes = [];
        this.settings = ((esLintContext.settings || {}).highcharts || {});
        this.options = Object.assign(Object.assign(Object.assign({}, ruleOptionsDefault), this.settings), (esLintContext.options[1] || {}));
        this.fixFunction = fixFunction;
        this.sourcePath = Path.relative(this.cwd, esLintContext.getFilename()),
            this.sourceCode = new SourceCode_1.default(this.sourcePath, FS.readFileSync(this.sourcePath).toString());
    }
    /* *
     *
     *  Static Properties
     *
     * */
    static setupRuleExport(ruleType, ruleOptionsSchema, ruleOptionsDefault, lintFunction, fixFunction) {
        return {
            meta: {
                fixable: fixFunction ? 'code' : void 0,
                schema: [{
                        additionalProperties: false,
                        properties: ruleOptionsSchema,
                        type: 'object'
                    }],
                type: ruleType
            },
            create: (esLintRuleContext) => ({
                Program: () => lintFunction(new RuleContext(esLintRuleContext, ruleOptionsDefault, fixFunction))
            })
        };
    }
    /* *
     *
     *  Functions
     *
     * */
    report(line, column, message) {
        const report = {
            loc: {
                column,
                line
            },
            message
        };
        if (this.fixFunction) {
            const fixFunction = this.fixFunction;
            report.fix = () => {
                fixFunction(this);
                return this.fixes.splice(0, this.fixes.length);
            };
        }
        this.esLintContext.report(report);
    }
}
exports.RuleContext = RuleContext;
/* *
 *
 *  Default Export
 *
 * */
exports.default = RuleContext;
