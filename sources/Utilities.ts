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
 *  Functions
 *
 * */


export function breakText(
    text: string
): Array<string> {
    return text.split(/\r\n|\r|\n/g);
}


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


export function isExpressionNode<T extends TS.Node>(
    node: T
): node is (T&ExpressionNode) {
    return (
        typeof (node as unknown as ExpressionNode).expression === 'object'
    )
}


export function isNodeClass<T extends TS.Node>(
    node: T,
    nodeClass: ('Assignment'|'Declaration'|'Expression'|'Signature'|'Statement')
): boolean {
    const kindClass: (string|undefined) = TS.SyntaxKind[node.kind];
    return !!kindClass && kindClass.endsWith(nodeClass);
}


export function isNodeStatement<T extends TS.Node>(
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
