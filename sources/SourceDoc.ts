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


    private static isTagWithName<T extends TS.JSDocTag>(
        tag: T
    ): tag is (T&{name:TS.EntityName}) {
        return typeof (tag as {name?:TS.EntityName}).name !== 'undefined';
    }


    private static isTagWithType<T extends TS.JSDocTag>(
        tag: T
    ): tag is (T&{typeExpression:TS.JSDocTypeExpression}) {
        return typeof (tag as {typeExpression?:TS.JSDocTypeExpression}).typeExpression !== 'undefined';
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
                    tagKind: 'description',
                    text: U.trimBreaks('' + tsJSDoc.comment)
                });
            }

            if (tsJSDoc.tags) {
                let tag: SourceDocTag;

                for (const tsTag of tsJSDoc.tags) {
                    tag = {
                        kind: tsTag.kind,
                        tagKind: tsTag.tagName.text,
                        text: ''
                    };

                    if (tsTag.comment) {
                        if (typeof tsTag.comment === 'string') {
                            tag.text = tsTag.comment
                        } else {
                            tag.text = tsTag.comment
                                .map(tsNode => tsNode.getText(tsSource))
                                .join('\n');
                        }
                    }

                    if (SourceDoc.isTagWithName(tsTag)) {
                        tag.tagName = tsTag.name.getText(tsSource);
                    }

                    if (SourceDoc.isTagWithType(tsTag)) {
                        tag.tagType = tsTag.typeExpression.getText(tsSource)
                    }

                    tags.push(tag);
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
            firstTag.tagKind === 'description'
        ) {
            text.push(U.indent(firstTag.text, ' * ', maximalLength));
            tags.shift();

            if (tags.length) {
                text.push(' *');
            }
        }

        let part1: string,
            part2: string;

        for (const tag of tags) {

            if (tag.tagKind === 'example') {
                text.push(' * @example');
                text.push(U.indent(tag.text, ' * '));
                continue;
            }

            part1 = `@${tag.tagKind}`;
            part2 = tag.text;

            if (tag.tagType) {
                part1 += ` {${tag.tagType}}`;
            }

            if (tag.tagName) {
                part1 += ` ${tag.tagName}`;
            }

            if (
                part2 &&
                ! tag.tagType &&
                ! tag.tagName &&
                U.breakText(part2).length === 1
            ) {
                text.push(U.indent(`${part1} ${U.removeBreaks(part2)}`.trimRight(), ' * ', maximalLength));
            } else {
                text.push(` * ${part1}`);

                if (part2) {
                    text.push(U.indent(part2, ' * ', maximalLength));
                }
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
