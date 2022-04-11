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


/* *
 *
 *  Declarations
 *
 * */


export interface DocumentedNode extends TS.Node {
    jsDoc: Array<TS.JSDoc>;
}


export type JSDocTagKind = (
    TS.SyntaxKind.JSDocAugmentsTag|
    TS.SyntaxKind.JSDocAuthorTag|
    TS.SyntaxKind.JSDocCallbackTag|
    TS.SyntaxKind.JSDocClassTag|
    TS.SyntaxKind.JSDocDeprecatedTag|
    TS.SyntaxKind.JSDocEnumTag|
    TS.SyntaxKind.JSDocImplementsTag|
    TS.SyntaxKind.JSDocOverrideTag|
    TS.SyntaxKind.JSDocParameterTag|
    TS.SyntaxKind.JSDocPrivateTag|
    TS.SyntaxKind.JSDocPropertyTag|
    TS.SyntaxKind.JSDocProtectedTag|
    TS.SyntaxKind.JSDocPublicTag|
    TS.SyntaxKind.JSDocReadonlyTag|
    TS.SyntaxKind.JSDocReturnTag|
    TS.SyntaxKind.JSDocSeeTag|
    TS.SyntaxKind.JSDocTag|
    TS.SyntaxKind.JSDocTemplateTag|
    TS.SyntaxKind.JSDocThisTag|
    TS.SyntaxKind.JSDocTypeTag|
    TS.SyntaxKind.JSDocTypedefTag
);


export type UnknownObject = Record<string, unknown>;


/* *
 *
 *  Functions
 *
 * */


/**
 * Returns a indented string, that fits into a specific width and spans over
 * several lines.
 *
 * @param text
 * The string to pad.
 *
 * @param linePrefix 
 * The prefix for each line.
 *
 * @param wrap 
 * The maximum width of the padded string.
 */
export function indent (
    text: string,
    linePrefix = '',
    wrap = 80
): string {
    const fragments = text.split(/\s/gmu);

    let newLine = true,
        line = '',
        paddedStr = '';

    fragments.forEach(fragment => {

        if (!newLine && fragment === '') {
            paddedStr += (
                line.trimRight() + '\n' +
                linePrefix.trimRight() + '\n'
            );
            newLine = true;
            return;
        }

        if (!newLine && line.length + fragment.length + 1 > wrap) {
            paddedStr += line.trimRight() + '\n';
            newLine = true;
        }

        if (newLine) {
            line = linePrefix + fragment;
            newLine = false;
        }
        else {
            line += ' ' + fragment;
        }
    });

    return (newLine ? paddedStr : paddedStr + line.trimRight() + '\n');
}


export function isDocumentedNode<T extends TS.Node>(
    node: T
): node is (T&DocumentedNode) {
    return (
        typeof (node as unknown as DocumentedNode).jsDoc === 'object'
    )
}


export function trimAll (
    text: string,
    keepParagraphs = false
): string {
    if (keepParagraphs) {
        const fragments = text.split(/\n\s*\n/gu),
            trimmed: Array<string> = [];

        for (let i = 0, iEnd = fragments.length; i < iEnd; ++i) {
            trimmed.push(trimAll(fragments[i]));
        }

        return trimmed.join('\n\n');
    }

    return text.replace(/\s+/gu, ' ').trim();
}
