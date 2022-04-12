/**
 * @author Sophie Bremer
 */


'use strict';


/* *
 *
 *  Imports
 *
 * */


import * as TS from 'typescript';
import * as SP from './SourceParser';
import SourceNode from './SourceNode';
import SourceToken from './SourceToken';


/* *
 *
 *  Class
 *
 * */


export class SourceTree {


    /* *
     *
     *  Constructor
     *
     * */


    public constructor (
        fileName: string,
        sourceCode: string
    ) {
        this.fileName = fileName;
        this.nodes = [];
        this.parse(sourceCode);
    }


    /* *
     *
     *  Properties
     *
     * */


    public readonly fileName: string;


    public readonly nodes: Array<SourceNode>;


    /* *
     *
     *  Functions
     *
     * */


    public parse (
        sourceCode: string,
        replace = false
    ) {
        const nodes = this.nodes;

        if (replace) {
            nodes.length = 0;
        }

        if (!sourceCode) {
            return;
        }

        const tsSourceFile = TS.createSourceFile(
                '',
                sourceCode,
                TS.ScriptTarget.Latest
            ),
            roots = SP.parseChildren(tsSourceFile, tsSourceFile.getChildren());

        if (roots) {
            for (let i = 0, iEnd = roots.length; i < iEnd; ++i) {
                nodes.push(roots[i]);
            }
        }
    }


    public toArray (): Array<SourceNode> {
        const nodes = this.nodes,
            result: Array<SourceNode> = [];

        for (
            let i = 0,
                iEnd = nodes.length,
                nodesChildren: Array<SourceNode>;
            i < iEnd;
            ++i
        ) {
            nodesChildren = nodes[i].toArray();

            for (
                let j = 0,
                jEnd = nodesChildren.length;
                j < jEnd;
                ++j
            ) {
                result.push(nodesChildren[j]);
            }
        }

        return result;
    }


    public toString (): string {
        const nodes = this.nodes;

        let text = '';

        for (let i = 0, iEnd = nodes.length; i < iEnd; ++i) {
            text += nodes[i].toString();
        }

        return text;
    }
}


/* *
 *
 *  Default Export
 *
 * */


export default SourceTree;
