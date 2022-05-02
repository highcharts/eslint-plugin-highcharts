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
import * as U from './Utilities';
import SourceDocTag from './SourceDocTag';
import SourceLine from './SourceLine';
import SourceToken from './SourceToken';


/* *
 *
 *  Declarations
 *
 * */


interface NamedTag extends TS.JSDocTag {
    name: TS.EntityName;
}


interface TypedTag extends TS.JSDocTag {
    typeExpression: TS.JSDocTypeExpression;
}


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


    private static decorateTag(
        tag: SourceDocTag,
        tsSource: TS.SourceFile,
        tsNode: (TS.JSDoc|TS.JSDocTag)
    ): SourceDocTag {

        if (tsNode.comment) {
            if (typeof tsNode.comment === 'string') {
                tag.text = tsNode.comment
            } else {
                tag.text = tsNode.comment
                    .map(tsComment => tsComment.getText(tsSource))
                    .join('\n');
            }
        }

        if (typeof (tsNode as NamedTag).name !== 'undefined') {
            tag.tagName = (tsNode as NamedTag).name.getText(tsSource);
        } else {
            const match = tag.text.match(
                /^{[\w.()<>]+} +([^\[\]\s]+|\[[^\[\]\s]+\])(?:\r\n|\r|\n)/
            );

            if (match) {
                tag.tagName = match[1];
                tag.text = tag.text.substr(match[0].length);
            }
        }

        if (typeof (tsNode as TypedTag).typeExpression !== 'undefined') {
            tag.tagType = (tsNode as TypedTag).typeExpression.getText(tsSource);
        } else {
            const match = tag.text.match(/^({[\w.()<>]+}) /);

            if (match) {
                tag.tagType = match[1];
                tag.text = tag.text.substr(match[0].length);
            }
        }

        return tag;
    }


    public static isSourceDoc(
        text: string
    ): boolean {
        return /^\/\*\*\s/.test(text);
    }


    private static isNodeWithJSDoc<T extends TS.Node>(
        tsNode: T
    ): tsNode is (T&{jsDoc:Array<TS.JSDoc>}) {
        return typeof (tsNode as {jsDoc?:TS.JSDoc}).jsDoc !== 'undefined';
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

        let tag: SourceDocTag;

        for (const tsChild of tsChildren) {
            if (SourceDoc.isNodeWithJSDoc(tsChild)) {
                tsJSDocs.push(...tsChild.jsDoc);
            }
        }

        for (const tsJSDoc of tsJSDocs) {

            if (tsJSDoc.comment) {
                tag = {
                    kind: TS.SyntaxKind.JSDocText,
                    tagKind: 'description',
                    text: ''
                };

                SourceDoc.decorateTag(tag, tsSource, tsJSDoc);

                tags.push(tag);
            }

            if (tsJSDoc.tags) {
                for (const tsTag of tsJSDoc.tags) {
                    tag = {
                        kind: tsTag.kind,
                        tagKind: tsTag.tagName.text,
                        text: ''
                    };

                    SourceDoc.decorateTag(tag, tsSource, tsTag);

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

        const indent = this.indent,
            tags = this.tokens,
            firstTag = tags[0],
            lines: Array<string> = ['/**'];

        let part1: string,
            part2: string;

        if (
            firstTag &&
            firstTag.tagKind === 'description'
        ) {
            part2 = U.trimBreaks(firstTag.text);

            lines.push(U.indent(indent, ' * ', part2, maximalLength));
            tags.shift();

            if (tags.length) {
                lines.push(U.pad(indent, ' *'));
            }
        }

        for (const tag of tags) {

            part1 = `@${tag.tagKind}`;
            part2 = U.trimBreaks(tag.text);

            if (tag.tagKind === 'example') {
                lines.push(U.pad(indent, ` * ${part1}`));
                lines.push(U.indent(indent, ' * ', part2));
                continue;
            }

            if (tag.tagType) {
                part1 += ` ${tag.tagType}`;
            }

            if (tag.tagName) {
                part1 += ` ${tag.tagName}`;
            }

            if (
                part2 &&
                ! tag.tagType &&
                ! tag.tagName &&
                U.breakText(tag.text).length === 1
            ) {
                lines.push(U.indent(
                    indent,
                    ' * ',
                    `${part1} ${part2}`.trimRight(),
                    maximalLength
                ));
            } else {
                lines.push(U.pad(indent, ` * ${part1}`));

                if (part2) {
                    lines.push(U.indent(indent, ' * ', part2, maximalLength));
                }
            }
        }

        lines.push(U.pad(indent, ' */'));

        return lines.join('\n');
    }


}


/* *
 *
 *  Default Export
 *
 * */


export default SourceDoc;
