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
import type TransformerFunction from './TransformerFunction';

import * as FS from 'fs';
import * as Path from 'path';
import * as TS from 'typescript';
import RuleType from './RuleType';


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
        lintProgram: LintFunction<T>,
        fixProgram?: FixFunction<T>
    ): ESLint.Rule.RuleModule {
        return {
            meta: {
                fixable: fixProgram ? 'code' : void 0,
                type: ruleType,
            },
            create: (esLintRuleContext: ESLint.Rule.RuleContext) => (
                {
                    Program: () => {
                        const context = new RuleContext(
                            esLintRuleContext,
                            fixProgram
                        );

                        return lintProgram(context);
                    }
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
        fixFunction?: FixFunction<T>
    ) {
        this.cwd = esLintContext.getCwd();
        this.esLintContext = esLintContext;
        this.fixes = [];
        this.options = (esLintContext.options[1] || {});
        this.settings = ((esLintContext.settings || {}).highcharts || {});
        this.fixFunction = fixFunction;

        const filePath = Path.relative(this.cwd, esLintContext.getFilename())

        this.sourceFile = TS.createSourceFile(
            filePath,
            FS.readFileSync(filePath).toString(),
            TS.ScriptTarget.Latest,
            true,
            TS.ScriptKind.Unknown
        );
    }


    /* *
     *
     *  Properties
     *
     * */


    private cwd: string;


    private esLintContext: ESLint.Rule.RuleContext;


    private fixes: Array<ESLint.Rule.Fix>;


    private fixFunction?: FixFunction<T>;


    public options: Partial<T>;


    public settings: ESLint.Rule.RuleContext['settings'];


    public sourceFile: TS.SourceFile;


    /* *
     *
     *  Functions
     *
     * */


    public fix (
        transformer: TransformerFunction
    ) {
        const factory: TS.TransformerFactory<TS.SourceFile> = (
            transformationContext: TS.TransformationContext
        ) => (
            sourceFile: TS.SourceFile
        ) => {
            const internalVisitor: TS.Visitor = (node) => {
                const visitedNode = transformer(transformationContext, node);

                if (!visitedNode) {
                    return;
                }

                if (visitedNode === node) {
                    const subNodes = visitedNode.getChildren(),
                        visitedSubNodes = TS.visitNodes(
                            transformationContext.factory.createNodeArray(
                                visitedNode.getChildren()
                            ),
                            internalVisitor
                        );
                    // @todo replacements not working :(
                    subNodes.splice(0, subNodes.length, ...visitedSubNodes);
                }

                return visitedNode;
            };

            internalVisitor(sourceFile);

            return sourceFile;
        };

        const sourceFile = TS
            .transform(
                this.sourceFile,
                [factory],
                {
                    ...TS.getDefaultCompilerOptions(),
                    removeComments: false,
                    target: TS.ScriptTarget.ES2021
                }
            )
            .transformed[0];

        this.fixes.push({
            range: [sourceFile.pos, sourceFile.end],
            text: sourceFile.text
        });
    }


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


    public replace (
        node: TS.Node,
        replacement: string
    ) {
        const sourceFile = this.sourceFile,
            text = sourceFile.getFullText(),
            leadingText = text.substr(0, node.pos),
            trailingText = text.substr(node.end);

        sourceFile.text = leadingText + replacement + trailingText;
    }


}


/* *
 *
 *  Default Export
 *
 * */


export default RuleContext;
