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
import * as TS from 'typescript';
import RuleType from './RuleType';
import SourceCode from './SourceCode';
import SourceTree from './SourceTree';


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
        fixFunction?: FixFunction<T>
    ): ESLint.Rule.RuleModule {
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
            create: (esLintRuleContext: ESLint.Rule.RuleContext) => (
                {
                    Program: () => lintFunction(new RuleContext(
                        esLintRuleContext,
                        ruleOptionsDefault,
                        fixFunction
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
        ruleOptionsDefault: T,
        fixFunction?: FixFunction<T>
    ) {
        this.changes = [];
        this.cwd = esLintContext.getCwd();
        this.esLintContext = esLintContext;
        this.fixes = [];
        this.settings = ((esLintContext.settings || {}).highcharts || {});
        this.options = {
            ...ruleOptionsDefault,
            ...this.settings,
            ...(esLintContext.options[1] || {})
        };
        this.fixFunction = fixFunction;

        this.sourcePath = Path.relative(this.cwd, esLintContext.getFilename());
    }


    /* *
     *
     *  Properties
     *
     * */


    private _sourceCode?: SourceCode;


    private _sourceTree?: SourceTree;


    private changes: Array<TS.TextChangeRange>;


    private cwd: string;


    private esLintContext: ESLint.Rule.RuleContext;


    private fixes: Array<ESLint.Rule.Fix>;


    private fixFunction?: FixFunction<T>;


    public options: T;


    public settings: ESLint.Rule.RuleContext['settings'];


    public get sourceCode (): SourceCode {
        if (!this._sourceCode) {
            this._sourceCode = new SourceCode(
                this.sourcePath,
                FS.readFileSync(this.sourcePath).toString()
            );
        }

        return this._sourceCode;
    }


    public sourcePath: string;


    public get sourceTree (): SourceTree {
        if (!this._sourceTree) {
            this._sourceTree = new SourceTree(
                this.sourcePath,
                FS.readFileSync(this.sourcePath).toString()
            );
        }

        return this._sourceTree;
    }


    /* *
     *
     *  Functions
     *
     * */


    public report (
        line: number,
        column: number,
        message: string
    ): void {
        const report: ESLint.Rule.ReportDescriptor = {
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
            }
        }

        this.esLintContext.report(report);
    }


}


/* *
 *
 *  Default Export
 *
 * */


export default RuleContext;