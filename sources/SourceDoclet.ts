/**
 * @author Sophie Bremer
 */


'use strict';


/* *
 *
 *  Imports
 *
 * */


import type SourceDocletTag from './SourceDocletTag';
import type SourceToken from './SourceToken';

import * as TS from 'typescript';
import * as U from './Utilities';
import SourceLine from './SourceLine';


/* *
 *
 *  Class
 *
 * */


export class SourceDoclet extends SourceLine implements SourceToken {


    /* *
     *
     *  Static Properties
     *
     * */


    public static parse (
        sourceToken: SourceToken
    ): (SourceDoclet|null) {
        if (
            sourceToken.kind === TS.SyntaxKind.MultiLineCommentTrivia &&
            sourceToken.text.startsWith('/**')
        ) {
            return new SourceDoclet(sourceToken);
        }

        return null;
    }


    /* *
     *
     *  Constructor
     *
     * */


    private constructor (
        sourceToken: SourceToken
    ) {
        super();

        this.comment = '';
        this.text = sourceToken.text;
        this.tokens = [];

        this.parseDoclet(sourceToken);
    }


    /* *
     *
     *  Properties
     *
     * */


    public comment: string;


    public readonly kind = TS.SyntaxKind.JSDocComment;


    public readonly text: string;


    public tokens: Array<SourceDocletTag>;


    /* *
     *
     *  Functions
     *
     * */

    private parseDoclet(
        sourceToken: SourceToken
    ): Array<TS.JSDoc> {
        const jsDocs: Array<TS.JSDoc> = [];

        if (
            sourceToken.kind === TS.SyntaxKind.MultiLineCommentTrivia &&
            sourceToken.text.startsWith('/**')
        ) {
            return jsDocs;
        }

        const source = TS.createSourceFile(
                '',
                sourceToken.text,
                TS.ScriptTarget.Latest
            );
        //     jsDocs: Array<TS.JSDoc> = [],
        //     extractDoclet = (node: TS.Node) => {
        //         if (U.isDocumentedNode(node)) {
        //             const jsDoc = node.jsDoc;

        //             for (let i = 0, iEnd = jsDoc.length; i < iEnd; ++i) {
        //                 if (!jsDocs.includes(jsDoc[i])) {
        //                     jsDocs.push(jsDoc[i]);
        //                 }
        //             }
        //         }

        //         node.getChildren(source).forEach(extractDoclet);
        //     };

        // extractDoclet(source);

        const sourceNodes = source.getChildren();

        console.log(sourceNodes);

        const tags = (jsDocs[0].tags || []).map(tag => tag),
            tokens = this.tokens;

        for (
            let i = 0,
                iEnd = tags.length,
                tag: TS.JSDocTag,
                token: SourceDocletTag;
            i < iEnd;
            ++i
        ) {
            tag = tags[i];

            if (TS.isJSDocSignature(tag)) {
                const parameterTags = tag.parameters;

                for (let i = 0, iEnd = parameterTags.length; i < iEnd; ++i) {
                    const parameterTag = parameterTags[i],
                        parameterToken: SourceDocletTag = {
                            comment: TS.getTextOfJSDocComment(parameterTag.comment),
                            kind: parameterTag.kind,
                            paramName: parameterTag.name.getText(),
                            tagName: parameterTag.tagName.text,
                            text: parameterTag.getText()
                        };

                    if (parameterTag.typeExpression) {
                        parameterToken.tagType = parameterTag.typeExpression.getText();
                    }

                    tokens.push(parameterToken);
                }

                if (tag.type) {
                    const returnTag = tag.type,
                        returnToken: SourceDocletTag = {
                            comment: TS.getTextOfJSDocComment(returnTag.comment),
                            kind: returnTag.kind,
                            tagName: returnTag.tagName.text,
                            text: returnTag.getText()
                        };

                    if (returnTag.typeExpression) {
                        returnToken.tagType = returnTag.typeExpression.getText();
                    }

                    tokens.push(returnToken);
                }

                continue;
            }

            token = {
                comment: TS.getTextOfJSDocComment(tag.comment),
                kind: tag.kind,
                tagName: tag.tagName.text,
                text: tag.getText()
            };

            if (TS.isJSDocFunctionType(tag)) {
                token.tagType = tag.type?.getText();
            }

            if (TS.isJSDocParameterTag(tag)) {
                token.paramName = tag.name.getText();

                if (tag.typeExpression) {
                    token.tagType = tag.typeExpression.getText();
                }
            }

            tokens.push(token);
        }

        return jsDocs;
    }

}


/* *
 *
 *  Default Export
 *
 * */


export default SourceDoclet;
