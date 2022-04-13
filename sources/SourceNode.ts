/* *
 *
 *  Imports
 *
 * */


import * as TS from 'typescript';
import SourceDoclet from './SourceDoclet';
import SourceToken from './SourceToken';


/* *
 *
 *  Class
 *
 * */


export class SourceNode implements SourceToken {


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


    public doclet?: string;


    public kind: TS.SyntaxKind;


    public text: string;


    public types?: Array<string>;


    /* *
     *
     *  Functions
     *
     * */


    public toArray(): Array<SourceNode> {
        const children = this.children,
            parent = new SourceNode(this.kind, this.text),
            result: Array<SourceNode> = [parent];

        parent.doclet = this.doclet;
        parent.types = this.types;

        if (children) {
            for (
                let i = 0,
                    iEnd = children.length,
                    childrensChildren: Array<SourceNode>;
                i < iEnd;
                ++i
            ) {
                childrensChildren = children[i].toArray();

                for (
                    let j = 0,
                    jEnd = childrensChildren.length;
                    j < jEnd;
                    ++j
                ) {
                    result.push(childrensChildren[j]);
                }
            }
        }

        return result;
    }


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


}


/* *
 *
 *  Default Export
 *
 * */


export default SourceNode;
