/**
 * @author Sophie Bremer
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleContext = void 0;
const FS = require("fs");
const Path = require("path");
const SourceCode_1 = require("./SourceCode");
const SourceTree_1 = require("./SourceTree");
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
    constructor(esLintContext, ruleOptionsDefault) {
        this.cwd = esLintContext.getCwd();
        this.esLintContext = esLintContext;
        this.settings = ((esLintContext.settings || {}).highcharts || {});
        this.options = Object.assign(Object.assign(Object.assign({}, ruleOptionsDefault), this.settings), (esLintContext.options[1] || {}));
        this.preparedReports = [];
        this.sourcePath = Path.relative(this.cwd, esLintContext.getFilename());
    }
    /* *
     *
     *  Static Properties
     *
     * */
    static setupRuleExport(ruleType, ruleOptionsSchema, ruleOptionsDefault, lintFunction, reportWithFix) {
        return {
            meta: {
                fixable: reportWithFix ? 'code' : void 0,
                schema: [{
                        additionalProperties: false,
                        properties: ruleOptionsSchema,
                        type: 'object'
                    }],
                type: ruleType
            },
            create: (esLintRuleContext) => ({
                Program: () => lintFunction(new RuleContext(esLintRuleContext, ruleOptionsDefault))
            })
        };
    }
    get sourceCode() {
        if (!this._sourceCode) {
            const sourcePath = this.sourcePath;
            this._sourceCode = new SourceCode_1.default(sourcePath, FS.readFileSync(sourcePath).toString());
        }
        return this._sourceCode;
    }
    get sourceTree() {
        if (!this._sourceTree) {
            const sourcePath = this.sourcePath;
            this._sourceTree = new SourceTree_1.default(sourcePath, FS.readFileSync(sourcePath).toString());
        }
        return this._sourceTree;
    }
    /* *
     *
     *  Functions
     *
     * */
    prepareReport(position, message) {
        this.preparedReports.push({
            loc: {
                // ESLint needs column zero-based:
                column: position.column - 1,
                line: position.line
            },
            message
        });
    }
    sendReports(finalFix) {
        const esLintContext = this.esLintContext, reports = this.preparedReports.splice(0);
        if (finalFix) {
            for (let i = 0, iEnd = reports.length - 1, report; i <= iEnd; ++i) {
                report = reports[i];
                if (i === iEnd) {
                    report.fix = finalFix;
                }
                else {
                    report.fix = () => null;
                }
                esLintContext.report(report);
            }
        }
        else {
            for (const report of reports) {
                esLintContext.report(report);
            }
        }
    }
}
exports.RuleContext = RuleContext;
/* *
 *
 *  Default Export
 *
 * */
exports.default = RuleContext;
