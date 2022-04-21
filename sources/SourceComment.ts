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
import SourceCommentTag from './SourceCommentTag';
import SourceLine from './SourceLine';
import SourceToken from './SourceToken';


/* *
 *
 *  Class
 *
 * */


export class SourceComment extends SourceLine implements SourceToken {


    /* *
     *
     *  Static Functions
     *
     * */


    private static isNodeWithJSDoc<T extends TS.Node>(
        node: T
    ): node is (T&{jsDoc:Array<TS.JSDoc>}) {
        return typeof (node as {jsDoc?:TS.JSDoc}).jsDoc !== 'undefined';
    }


    /* *
     *
     *  Constructor
     *
     * */


    public constructor (
        kind: (
            TS.SyntaxKind.MultiLineCommentTrivia |
            TS.SyntaxKind.SingleLineCommentTrivia
        ),
        text: string
    ) {
        super();

        this.kind = kind;
        this.tokens = [];

        const tokens = this.tokens;

        if (kind === TS.SyntaxKind.SingleLineCommentTrivia) {
            const words = text.split(/\s+/g);

            for (const word of words) {
                tokens.push({
                    kind: TS.SyntaxKind.Unknown,
                    text: word
                });
            }
        } else if (/^\/\*\*\s/.test(text) && this.parseJSDoc(text)) {
            this.kind = TS.SyntaxKind.JSDocComment;
            console.log(this.tokens);
        } else {
            const lines = text.split(/\n|\r|\r\n/g);

            for (const line of lines) {
                tokens.push(new SourceComment(TS.SyntaxKind.SingleLineCommentTrivia, line));
            }
        }
    }


    /* *
     *
     *  Properties
     *
     * */


    public readonly kind: (
        TS.SyntaxKind.JSDocComment |
        TS.SyntaxKind.MultiLineCommentTrivia |
        TS.SyntaxKind.SingleLineCommentTrivia
    );


    public get text (): string {
        return this.toString();
    }

    public tokens: Array<(SourceToken|SourceCommentTag)>;

    /* *
     *
     *  Functions
     *
     * */


    private parseJSDoc(text: string): boolean {
        const tokens = this.tokens,
            tsSource = TS.createSourceFile('', text, TS.ScriptTarget.Latest, true, TS.ScriptKind.JS),
            tsChildren = tsSource.getChildren(tsSource);

        let success = false;

        for (const tsChild of tsChildren) {
            if (!SourceComment.isNodeWithJSDoc(tsChild)) {
                continue;
            }

            const tsJSDocs = tsChild.jsDoc;

            for (const tsJSDoc of tsJSDocs) {
                if (tsJSDoc.comment) {
                    tokens.push({
                        kind: TS.SyntaxKind.JSDocText,
                        text: '' + tsJSDoc.comment
                    });
                }
                if (tsJSDoc.tags) {
                    let kind: TS.SyntaxKind,
                        tagName: string,
                        text: string;
                    for (const tsTag of tsJSDoc.tags) {
                        kind = tsTag.kind;
                        tagName = tsTag.tagName.getText(tsSource);

                        if (tsTag.comment) {
                            if (typeof tsTag.comment === 'string') {
                                text = tsTag.comment
                            } else {
                                text = tsTag.comment
                                    .map(tsNode => tsNode.getText(tsSource))
                                    .join('\n');
                            }
                        } else {
                            text = '';
                        }

                        if (TS.isJSDocParameterTag(tsTag)) {
                            tokens.push({
                                kind,
                                paramName: tsTag.name.getText(tsSource),
                                tagName,
                                tagType: (tsTag.typeExpression?.type.getText(tsSource) || '*'),
                                text
                            });
                        } else {
                            tokens.push({ kind, tagName, text });
                        }
                    }
                }
            }

            success = true;

            break;
        }

        return success;
    }


}


/* *
 *
 *  Default Export
 *
 * */


export default SourceComment;
