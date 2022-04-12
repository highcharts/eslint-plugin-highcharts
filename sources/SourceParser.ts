/* *
 *
 *  Imports
 *
 * */


import * as TS from 'typescript';
import * as U from './Utilities';
import SourceDoclet from './SourceDoclet';
import SourceNode from './SourceNode';


/* *
 *
 *  Functions
 *
 * */


function ignoreChildrenOf(
    _tsSourceFile: TS.SourceFile,
    tsNode: TS.Node
): boolean {
    return (
        tsNode.kind === TS.SyntaxKind.FirstStatement ||
        TS.isExpressionStatement(tsNode) ||
        TS.isImportDeclaration(tsNode) ||
        TS.isPropertySignature(tsNode) ||
        TS.isReturnStatement(tsNode) ||
        TS.isVariableDeclarationList(tsNode)
    );
}


function joinNodeArray(
    tsSourceFile: TS.SourceFile,
    tsNodes: (
        Array<TS.Node>|
        TS.NodeArray<TS.Node>
    ),
    separator: string = ','
): string {
    const nodes: Array<string>  = [];

    for (const tsNode of tsNodes) {
        nodes.push(tsNode.getText(tsSourceFile));
    }

    return nodes.join(separator);
}


export function parse(
    tsSourceFile: TS.SourceFile,
    tsNode: TS.Node
): SourceNode {
    let sourceNode: SourceNode;

    if (TS.isForStatement(tsNode)) {
        sourceNode = parseFor(tsSourceFile, tsNode);
    } else if (TS.isFunctionDeclaration(tsNode)) {
        sourceNode = parseFunction(tsSourceFile, tsNode);
    } else if (TS.isIfStatement(tsNode)) {
        sourceNode = parseIf(tsSourceFile, tsNode);
    } else if (TS.isInterfaceDeclaration(tsNode)) {
        sourceNode = parseInterface(tsSourceFile, tsNode);
    } else if (TS.isModuleDeclaration(tsNode)) {
        sourceNode = parseModule(tsSourceFile, tsNode);
    } else if (ignoreChildrenOf(tsSourceFile, tsNode)) {
        sourceNode = new SourceNode(
            tsNode.kind,
            tsNode.getText(tsSourceFile)
        );
    } else {
        const tsNodeChildren = tsNode.getChildren(tsSourceFile);
        sourceNode = new SourceNode(tsNode.kind);

        if (tsNodeChildren.length) {
            sourceNode.children = parseChildren(tsSourceFile, tsNodeChildren);
        } else {
            sourceNode.text = tsNode.getText(tsSourceFile);
        }
    }

    if (U.isDocumentedNode(tsNode)) {
        const doclet = joinNodeArray(tsSourceFile, tsNode.jsDoc, '\n');

        if (doclet) {
            sourceNode.doclet = doclet;
        }
    }

    return sourceNode;
}


export function parseChildren(
    tsSourceFile: TS.SourceFile,
    tsNodeChildren: (Array<TS.Node>|TS.NodeArray<TS.Node>)
): Array<SourceNode> {
    const sourceChildren: Array<SourceNode> = [];

    for (const tsChild of tsNodeChildren) {
        if (tsChild.kind === TS.SyntaxKind.SyntaxList) {
            return parseChildren(
                tsSourceFile,
                tsChild.getChildren(tsSourceFile)
            );
        } else {
            sourceChildren.push(parse(tsSourceFile, tsChild));
        }
    }

    return sourceChildren;
}


function parseFor(
    tsSourceFile: TS.SourceFile,
    tsNode: TS.ForStatement
): SourceNode {
    const sourceNode = new SourceNode(tsNode.kind);

    sourceNode.children = parseChildren(
        tsSourceFile,
        tsNode.statement.getChildren(tsSourceFile)
    );

    if (tsNode.initializer) {
        sourceNode.text += `${tsNode.initializer.getText(tsSourceFile)};`
    }

    if (tsNode.condition) {
        sourceNode.text += `${tsNode.condition.getText(tsSourceFile)};`
    }

    if (tsNode.incrementor) {
        sourceNode.text += `${tsNode.incrementor.getText(tsSourceFile)};`
    }

    return sourceNode;
}


function parseFunction(
    tsSourceFile: TS.SourceFile,
    tsNode: TS.FunctionDeclaration
): SourceNode {
    const sourceNode = new SourceNode(
        tsNode.kind,
        tsNode.name ? tsNode.name.getText(tsSourceFile) : ''
    );

    if (tsNode.body) {
        sourceNode.children = parseChildren(
            tsSourceFile,
            tsNode.body.getChildren(tsSourceFile)
        );
    }

    return sourceNode;
}


function parseIf(
    tsSourceFile: TS.SourceFile,
    tsNode: TS.IfStatement
): SourceNode {
    const sourceNode = new SourceNode(
        tsNode.kind,
        tsNode.expression.getText(tsSourceFile)
    );

    sourceNode.children = parseChildren(
        tsSourceFile,
        tsNode.thenStatement.getChildren(tsSourceFile)
    );

    if (tsNode.elseStatement) {
        const firstChild = tsNode.elseStatement.getFirstToken(tsSourceFile);

        if (
            firstChild &&
            TS.isIfStatement(firstChild) &&
            tsNode.elseStatement.getChildCount(tsSourceFile) === 1
        ) {
            const elseIfSourceNode = parseIf(tsSourceFile, firstChild);

            elseIfSourceNode.text = `else ${elseIfSourceNode.text}`;

            sourceNode.children.push(elseIfSourceNode);
        } else {
            const elseSourceNode = new SourceNode(tsNode.kind, 'else');

            elseSourceNode.children = parseChildren(
                tsSourceFile,
                tsNode.elseStatement.getChildren(tsSourceFile)
            );

            sourceNode.children.push(elseSourceNode);
        }
    }

    return sourceNode;
}


function parseInterface(
    tsSourceFile: TS.SourceFile,
    tsNode: TS.InterfaceDeclaration
): SourceNode {
    const sourceNode = new SourceNode(
        tsNode.kind,
        tsNode.name.getText(tsSourceFile)
    );

    sourceNode.children = parseChildren(tsSourceFile, tsNode.members);

    if (tsNode.typeParameters) {
        sourceNode.text += `<${joinNodeArray(tsSourceFile, tsNode.typeParameters)}>`;
    }

    if (tsNode.heritageClauses) {
        sourceNode.type = joinNodeArray(tsSourceFile, tsNode.heritageClauses);
    }

    return sourceNode;
}


function parseModule(
    tsSourceFile: TS.SourceFile,
    tsNode: TS.ModuleDeclaration
): SourceNode {
    const sourceNode = new SourceNode(
        tsNode.kind,
        tsNode.name.getText(tsSourceFile)
    );

    if (tsNode.body) {
        sourceNode.children = parseChildren(
            tsSourceFile,
            tsNode.body.getChildren(tsSourceFile)
        );
    }

    return sourceNode;
}
