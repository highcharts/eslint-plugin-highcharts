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
import SourceDocTag from './SourceDocTag';
import SourceLine from './SourceLine';
import SourceToken from './SourceToken';
import * as U from './Utilities';


/* *
 *
 *  Class
 *
 * */


export class SourceDoc extends SourceLine implements SourceToken {


    /* *
     *
     *  Static Functions
     *
     * */


    public static isDocComment(
        text: string
    ): boolean {
        return /^\/\*\*\s/.test(text);
    }


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
        text: string,
        indent: number = 0
    ) {
        super();

        this.kind = TS.SyntaxKind.JSDocComment;
        this.indent = indent;
        this.text = text;
        this.tokens = [];

        const tags = this.tokens,
            tsSource = TS.createSourceFile('', text, TS.ScriptTarget.Latest, void 0, TS.ScriptKind.JS),
            tsJSDocs: Array<TS.JSDoc> = [],
            tsChildren = tsSource.getChildren(tsSource);

        for (const tsChild of tsChildren) {
            if (SourceDoc.isNodeWithJSDoc(tsChild)) {
                tsJSDocs.push(...tsChild.jsDoc);
            }
        }

        for (const tsJSDoc of tsJSDocs) {

            if (tsJSDoc.comment) {
                tags.push({
                    kind: TS.SyntaxKind.JSDocText,
                    tagName: 'description',
                    text: U.trimBreaks('' + tsJSDoc.comment)
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

                    text = U.trimBreaks(text);

                    if (TS.isJSDocParameterTag(tsTag)) {
                        tags.push({
                            kind,
                            paramName: tsTag.name.getText(tsSource),
                            tagName,
                            tagType: (tsTag.typeExpression?.type.getText(tsSource) || '*'),
                            text
                        });
                    } else {
                        tags.push({ kind, tagName, text });
                    }
                }
            }
        }
    }


    /* *
     *
     *  Properties
     *
     * */


    public readonly kind: TS.SyntaxKind.JSDocComment;


    private readonly indent: number;


    public readonly text: string;


    public readonly tokens: Array<SourceDocTag>;


    /* *
     *
     *  Functions
     *
     * */


    public getIndent(): number {
        return this.indent;
    }


    public toString(
        maximalLength?: number
    ): string {
        if (!maximalLength) {
            return this.text;
        }

        const tags = this.tokens,
            firstTag = tags[0],
            text: Array<string> = [];

        if (
            firstTag &&
            firstTag.tagName === 'description'
        ) {
            text.push(U.indent(firstTag.text, ' * ', maximalLength));
            tags.shift();

            if (tags.length) {
                text.push(' *');
            }
        }

        for (const tag of tags) {
            if (tag.kind === TS.SyntaxKind.JSDocParameterTag) {
                text.push(` * @${tag.tagName} {${tag.tagType}} ${tag.paramName}`);
                if (tag.text) {
                    text.push(U.indent(tag.text, ' * ', maximalLength));
                }
            } else if (tag.tagName === 'example') {
                text.push(` * @${tag.tagName}`);
                text.push(tag.text);
            } else if (U.breakText(tag.text).length > 1) {
                text.push(` * @${tag.tagName}`);
                if (tag.text) {
                    text.push(U.indent(tag.text, ' * ', maximalLength));
                }
            } else {
                text.push(` * @${tag.tagName} ${tag.text}`.trimRight());
            }
        }

        return `/**\n${text.join('\n')}\n */`;
    }


}


/* *
 *
 *  Default Export
 *
 * */


export default SourceDoc;
