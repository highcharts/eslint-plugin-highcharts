/**
 * @author Sophie Bremer
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleContext = void 0;
const FS = require("fs");
const Path = require("path");
const TS = require("typescript");
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
    constructor(esLintContext, fixFunction) {
        this.cwd = esLintContext.getCwd();
        this.esLintContext = esLintContext;
        this.fixes = [];
        this.options = (esLintContext.options[1] || {});
        this.settings = ((esLintContext.settings || {}).highcharts || {});
        this.fixFunction = fixFunction;
        const filePath = Path.relative(this.cwd, esLintContext.getFilename());
        this.sourceFile = TS.createSourceFile(filePath, FS.readFileSync(filePath).toString(), TS.ScriptTarget.Latest, true, TS.ScriptKind.Unknown);
    }
    /* *
     *
     *  Static Properties
     *
     * */
    static setupRuleExport(ruleType, ruleOptionsSchema, lintProgram, fixProgram) {
        return {
            meta: {
                fixable: fixProgram ? 'code' : void 0,
                type: ruleType,
            },
            create: (esLintRuleContext) => ({
                Program: () => {
                    const context = new RuleContext(esLintRuleContext, fixProgram);
                    return lintProgram(context);
                }
            })
        };
    }
    /* *
     *
     *  Functions
     *
     * */
    fix(transformer) {
        const factory = (transformationContext) => (sourceFile) => {
            const internalVisitor = (node) => {
                const visitedNode = transformer(transformationContext, node);
                if (!visitedNode) {
                    return;
                }
                if (visitedNode === node) {
                    const subNodes = visitedNode.getChildren(), visitedSubNodes = TS.visitNodes(transformationContext.factory.createNodeArray(visitedNode.getChildren()), internalVisitor);
                    // @todo replacements not working :(
                    subNodes.splice(0, subNodes.length, ...visitedSubNodes);
                }
                return visitedNode;
            };
            internalVisitor(sourceFile);
            return sourceFile;
        };
        const sourceFile = TS
            .transform(this.sourceFile, [factory], Object.assign(Object.assign({}, TS.getDefaultCompilerOptions()), { removeComments: false, target: TS.ScriptTarget.ES2021 }))
            .transformed[0];
        this.fixes.push({
            range: [sourceFile.pos, sourceFile.end],
            text: sourceFile.text
        });
    }
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
    replace(node, replacement) {
        const sourceFile = this.sourceFile, text = sourceFile.getFullText(), leadingText = text.substr(0, node.pos), trailingText = text.substr(node.end);
        sourceFile.text = leadingText + replacement + trailingText;
    }
}
exports.RuleContext = RuleContext;
/* *
 *
 *  Default Export
 *
 * */
exports.default = RuleContext;
