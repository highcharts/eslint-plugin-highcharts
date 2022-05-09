/**
 * @author Sophie Bremer
 */


'use strict';


/* *
 *
 *  Imports
 *
 * */


import type * as ESLint from 'eslint';
import type * as JSONSchema from 'json-schema';
import type FixFunction from './FixFunction';
import type LintFunction from './LintFunction';
import type RuleOptions from './RuleOptions';

import * as FS from 'fs';
import * as Path from 'path';
import RuleType from './RuleType';
import SourceCode from './SourceCode';
import SourcePosition from './SourcePosition';
import SourceTree from './SourceTree';


/* *
 *
 *  Constants
 *
 * */


const sourceCodeCache: Record<string, SourceCode> = {};


const sourceTreeCache: Record<string, SourceTree> = {};


/* *
 *
 *  Class
 *
 * */


export class RuleContext<T extends RuleOptions = RuleOptions> {


    /* *
     *
     *  Static Properties
     *
     * */


    public static setupRuleExport<T extends RuleOptions = RuleOptions> (
        ruleType: RuleType,
        ruleOptionsSchema: JSONSchema.JSONSchema4,
        ruleOptionsDefault: T,
        lintFunction: LintFunction<T>,
        reportWithFix?: boolean
    ): ESLint.Rule.RuleModule {
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
            create: (esLintRuleContext: ESLint.Rule.RuleContext) => (
                {
                    Program: () => lintFunction(new RuleContext(
                        esLintRuleContext,
                        ruleOptionsDefault
                    ))
                }
            )
        };
    }


    /* *
     *
     *  Constructor
     *
     * */


    private constructor (
        esLintContext: ESLint.Rule.RuleContext,
        ruleOptionsDefault: T
    ) {
        this.cwd = esLintContext.getCwd();
        this.esLintContext = esLintContext;
        this.settings = ((esLintContext.settings || {}).highcharts || {});
        this.options = {
            ...ruleOptionsDefault,
            ...this.settings,
            ...(esLintContext.options[1] || {})
        };
        this.preparedReports = [];
        this.sourcePath = Path.relative(this.cwd, esLintContext.getFilename());
    }


    /* *
     *
     *  Properties
     *
     * */


    private _sourceCode?: SourceCode;


    private _sourceTree?: SourceTree;


    private cwd: string;


    private esLintContext: ESLint.Rule.RuleContext;


    public options: T;


    public readonly preparedReports: Array<ESLint.Rule.ReportDescriptor>;


    public settings: ESLint.Rule.RuleContext['settings'];


    public get sourceCode (): SourceCode {

        if (!this._sourceCode) {
            const sourcePath = this.sourcePath;

            if (sourceCodeCache[sourcePath]) {
                this._sourceCode = sourceCodeCache[sourcePath];
            } else {
                this._sourceCode = new SourceCode(
                    sourcePath,
                    FS.readFileSync(sourcePath).toString()
                );
                sourceCodeCache[sourcePath] = this._sourceCode;
            }
        }

        return this._sourceCode;
    }


    public sourcePath: string;


    public get sourceTree (): SourceTree {

        if (!this._sourceTree) {
            const sourcePath = this.sourcePath;

            if (sourceTreeCache[sourcePath]) {
                this._sourceTree = sourceTreeCache[sourcePath];
            } else {
                this._sourceTree = new SourceTree(
                    sourcePath,
                    FS.readFileSync(sourcePath).toString()
                );
                sourceTreeCache[sourcePath] = this._sourceTree;
            }
        }

        return this._sourceTree;
    }


    /* *
     *
     *  Functions
     *
     * */


    public prepareReport(
        position: SourcePosition,
        message: string,
        fix?: ESLint.Rule.ReportFixer
    ): void {
        this.preparedReports.push({
            fix,
            loc: {
                // ESLint needs column zero-based:
                column: position.column - 1,
                line: position.line
            },
            message
        });
    }

    public report (
        position: SourcePosition,
        message: string,
        fix?: ESLint.Rule.ReportFixer
    ): void {
        this.esLintContext.report({
            fix,
            loc: {
                // ESLint needs column zero-based:
                column: position.column - 1,
                line: position.line
            },
            message
        });
    }


    public sendReports(
        finalFix?: ESLint.Rule.ReportFixer
    ): void {
        const esLintContext = this.esLintContext,
            reports = this.preparedReports.splice(0);

        if (finalFix) {
            for (let i = 0, iEnd = reports.length - 1, report: ESLint.Rule.ReportDescriptor; i <= iEnd; ++i) {
                report = reports[i];

                if (i === iEnd) {
                    report.fix = finalFix;
                } else {
                    report.fix = () => null;
                }

                esLintContext.report(report);
            }
        } else {
            for (const report of reports) {
                esLintContext.report(report);
            }
        }
    }


}


/* *
 *
 *  Default Export
 *
 * */


export default RuleContext;
