"use strict";
/* *
 *
 *  Imports
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceNode = void 0;
/* *
 *
 *  Class
 *
 * */
class SourceNode {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(kind, text = '') {
        this.kind = kind;
        this.text = text;
    }
    /* *
     *
     *  Functions
     *
     * */
    toArray() {
        const children = this.children, parent = new SourceNode(this.kind, this.text), result = [parent];
        parent.doclet = this.doclet;
        parent.types = this.types;
        if (children) {
            for (let i = 0, iEnd = children.length, childrensChildren; i < iEnd; ++i) {
                childrensChildren = children[i].toArray();
                for (let j = 0, jEnd = childrensChildren.length; j < jEnd; ++j) {
                    result.push(childrensChildren[j]);
                }
            }
        }
        return result;
    }
    toString() {
        const children = this.children;
        let text = this.text;
        if (children) {
            for (let i = 0, iEnd = children.length; i < iEnd; ++i) {
                text += children.toString();
            }
        }
        return text;
    }
}
exports.SourceNode = SourceNode;
/* *
 *
 *  Default Export
 *
 * */
exports.default = SourceNode;
