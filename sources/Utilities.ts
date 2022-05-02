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


export interface ExpressionNode extends TS.Node {
    expression: TS.Expression;
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


export type StatementKind = (
    TS.SyntaxKind.BreakStatement|
    TS.SyntaxKind.ContinueStatement|
    TS.SyntaxKind.DebuggerStatement|
    TS.SyntaxKind.DoStatement|
    TS.SyntaxKind.EmptyStatement|
    TS.SyntaxKind.ExpressionStatement|
    TS.SyntaxKind.ForStatement|
    TS.SyntaxKind.ForInStatement|
    TS.SyntaxKind.ForOfStatement|
    TS.SyntaxKind.IfStatement|
    TS.SyntaxKind.LabeledStatement|
    TS.SyntaxKind.ReturnStatement|
    TS.SyntaxKind.SwitchStatement|
    TS.SyntaxKind.ThrowStatement|
    TS.SyntaxKind.TryStatement|
    TS.SyntaxKind.VariableStatement|
    TS.SyntaxKind.WhileStatement
);


export type UnknownObject = Record<string, unknown>;


/* *
 *
 *  Constants
 *
 * */


export const lineBreaks = /\r\n|\r|\n/gu;


export const paragraph = new RegExp(`${lineBreaks.source}{2,}`, 'gu');


/* *
 *
 *  Functions
 *
 * */


export function extractTypes(
    tsSourceFile: TS.SourceFile,
    tsNode: TS.Node
): Array<string> {
    const tsChildren = tsNode.getChildren(tsSourceFile),
        types: Array<string> = [];

    for (const tsChild of tsChildren) {
        if (TS.isTypeReferenceNode(tsChild)) {
            types.push(tsChild.getText(tsSourceFile));
        }
    }

    return types;
}


export function extractFirstLine(
    text: string
): string {
    return text.split(lineBreaks)[0];
}


export function extractLastLine(
    text: string
): string {
    const lines = text.split(lineBreaks);
    return lines[lines.length-1];
}


export function detectLineBreak(
    text: string
): (string|undefined) {
    return text.match(new RegExp(lineBreaks.source, 'u'))?.[0]
}


/**
 * Returns a indented string, that fits into a specific width and spans over
 * several lines.
 *
 * @param text
 * The string to pad.
 *
 * @param indent 
 * The prefix for each line.
 *
 * @param wrap 
 * The maximum width of the padded string.
 */
export function indent (
    indent: number,
    prefix: string,
    text: string,
    wrap?: number
): string {
    const lb = detectLineBreak(text);

    prefix = pad(indent, prefix);

    if (!wrap) {
        return prefix + text.replace(lineBreaks, `${lb}${prefix}`);
    }

    const fragments = text
        .replace(paragraph, ' \x00 ') // paragraphs
        .replace(lineBreaks, ' \x05 ') // single break
        .split(/\s/gmu);

    let codeBlock = false,
        line = prefix,
        paddedStr = '';

    for (const fragment of fragments) {

        if (fragment === '\x00') {
            paddedStr += line.trimRight() + lb + prefix.trimRight() + lb;
            line = prefix;
            continue;
        }

        if (fragment === '\x05') {
            if (codeBlock) {
                paddedStr += line.trimRight() + lb;
                line = prefix;
            }
            continue;
        }

        if (fragment.startsWith('```')) {
            codeBlock = !codeBlock;
            if (line !== prefix) {
                paddedStr += line.trimRight() + lb;
            }
            line = prefix + fragment;
            continue;
        }

        if (!codeBlock && line.length + 1 + fragment.length > wrap) {
            paddedStr += line.trimRight() + lb;
            line = prefix + fragment;
        } else if (line === prefix) {
            line += (fragment || ' ');
        } else {
            line += ' ' + fragment;
        }
    }

    return (line === prefix ? paddedStr : paddedStr + line.trimRight());
}


export function isDocumentedNode<T extends TS.Node> (
    node: T
): node is (T&DocumentedNode) {
    return (
        typeof (node as unknown as DocumentedNode).jsDoc === 'object'
    )
}


export function isExpressionNode<T extends TS.Node> (
    node: T
): node is (T&ExpressionNode) {
    return (
        typeof (node as unknown as ExpressionNode).expression === 'object'
    )
}


export function isNodeClass<T extends TS.Node> (
    node: T,
    nodeClass: ('Assignment'|'Declaration'|'Expression'|'Signature'|'Statement')
): boolean {
    const kindClass: (string|undefined) = TS.SyntaxKind[node.kind];
    return !!kindClass && kindClass.endsWith(nodeClass);
}


export function isNodeStatement<T extends TS.Node> (
    node: T
): node is (T&StatementKind) {
    return (
        TS.isBreakOrContinueStatement(node) ||
        TS.isDebuggerStatement(node) ||
        TS.isDoStatement(node) ||
        TS.isEmptyStatement(node) ||
        TS.isExpressionStatement(node) ||
        TS.isForInStatement(node) ||
        TS.isForOfStatement(node) ||
        TS.isForStatement(node) ||
        TS.isIfStatement(node) ||
        TS.isLabeledStatement(node) ||
        TS.isReturnStatement(node) ||
        TS.isSwitchStatement(node) ||
        TS.isThrowStatement(node) ||
        TS.isTryStatement(node) ||
        TS.isVariableStatement(node) ||
        TS.isWhileStatement(node)
    );
}


export function pad(indent: number, suffix: string = ''): string {
    if (indent > 0) {
        return ' '.repeat(indent) + suffix;
    }

    return suffix;
}


export function removeBreaks (
    text: string
): string {
    return text.replace(lineBreaks, ' ').trim();
}

export function trimAll (
    text: string,
    keepParagraphs = false
): string {
    const lb = detectLineBreak(text) || '\n';

    if (keepParagraphs) {
        return text
            .replace(paragraph, ' \x00 ')
            .replace(/\s+/gu, ' ')
            .trim()
            .replace(/ ?\x00 ?/, `${lb}${lb}`);
    }

    return text.replace(/\s+/gu, ' ').trim();
}


export function trimBreaks (
    text: string
): string {
    return text.replace(/^\s+|\s+$/gu, '')
}
