/* *
 *
 *  Imports
 *
 * */


import * as TS from 'typescript';
import SourceToken from './SourceToken';


/* *
 *
 *  Class
 *
 * */


export class SourceNode implements SourceToken {


    /* *
     *
     *  Static Properties
     *
     * */


    public static parse (
        sourceFile: TS.SourceFile,
        node: TS.Node
    ): SourceNode {
        const nodeChildren = node.getChildren(sourceFile),
            sourceNode = new SourceNode(node.kind);

        if (nodeChildren.length) {
            const sourceChildren: Array<SourceNode> = sourceNode.children = [];

            for (
                let i = 0,
                    iEnd = nodeChildren.length,
                    sourceChild: SourceNode;
                i < iEnd;
                ++i
            ) {
                sourceChild = SourceNode.parse(sourceFile, nodeChildren[i]);
                sourceChild.parent = sourceNode;
                sourceChildren.push(sourceChild);
            }
        } else {
            sourceNode.text = node.getText(sourceFile);
        }

        return sourceNode;
    }


    /* *
     *
     *  Constructor
     *
     * */

    public constructor(
        kind: TS.SyntaxKind,
        text: string = ''
    ) {
        this.kind = kind;
        this.text = text;
    }

    /* *
     *
     *  Properties
     *
     * */


    public children?: Array<SourceNode>;


    public kind: TS.SyntaxKind;


    public parent?: SourceNode;


    public text: string;


    /* *
     *
     *  Functions
     *
     * */


    public toString(): string {
        const children = this.children;

        let text = this.text;

        if (children) {
            for (let i = 0, iEnd = children.length; i < iEnd; ++i) {
                text += children.toString();
            }
        }

        return text;
    }


    public toTokens(): Array<SourceToken> {
        const children = this.children,
            tokens: Array<SourceToken> = [this];

        if (children) {
            for (
                let i = 0,
                    iEnd = children.length,
                    childrensChildren: Array<SourceToken>;
                i < iEnd;
                ++i
            ) {
                childrensChildren = children[i].toTokens();

                for (
                    let j = 0,
                    jEnd = childrensChildren.length;
                    j < jEnd;
                    ++j
                ) {
                    tokens.push(childrensChildren[j]);
                }
            }
        }

        return tokens;
    }


}


/* *
 *
 *  Default Export
 *
 * */


export default SourceNode;
