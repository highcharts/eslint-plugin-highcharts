/**
 * @author Sophie Bremer
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceTree = void 0;
/* *
 *
 *  Imports
 *
 * */
const TS = require("typescript");
const SP = require("./SourceParser");
/* *
 *
 *  Class
 *
 * */
class SourceTree {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(fileName, sourceCode) {
        this.fileName = fileName;
        this.nodes = [];
        this.parse(sourceCode);
    }
    /* *
     *
     *  Functions
     *
     * */
    parse(sourceCode, replace = false) {
        const nodes = this.nodes;
        if (replace) {
            nodes.length = 0;
        }
        if (!sourceCode) {
            return;
        }
        const tsSourceFile = TS.createSourceFile('', sourceCode, TS.ScriptTarget.Latest), roots = SP.parseChildren(tsSourceFile, tsSourceFile.getChildren());
        if (roots) {
            for (let i = 0, iEnd = roots.length; i < iEnd; ++i) {
                nodes.push(roots[i]);
            }
        }
    }
    toArray() {
        const nodes = this.nodes, result = [];
        for (let i = 0, iEnd = nodes.length, nodesChildren; i < iEnd; ++i) {
            nodesChildren = nodes[i].toArray();
            for (let j = 0, jEnd = nodesChildren.length; j < jEnd; ++j) {
                result.push(nodesChildren[j]);
            }
        }
        return result;
    }
    toString() {
        const nodes = this.nodes;
        let text = '';
        for (let i = 0, iEnd = nodes.length; i < iEnd; ++i) {
            text += nodes[i].toString();
        }
        return text;
    }
}
exports.SourceTree = SourceTree;
/* *
 *
 *  Default Export
 *
 * */
exports.default = SourceTree;
