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
    tsNode: TS.Node
): boolean {
    return (
        TS.isExpressionStatement(tsNode) ||
        TS.isImportDeclaration(tsNode) ||
        TS.isPropertySignature(tsNode) ||
        TS.isReturnStatement(tsNode) ||
        TS.isVariableDeclaration(tsNode)
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
    } else if (TS.isVariableStatement(tsNode)) {
        sourceNode = parseVariables(tsSourceFile, tsNode);
    } else if (ignoreChildrenOf(tsNode)) {
        const types = U.extractTypes(tsSourceFile, tsNode);

        sourceNode = new SourceNode(
            tsNode.kind,
            tsNode.getText(tsSourceFile)
        );

        sourceNode.types = types;
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

    for (const tsNodeChild of tsNodeChildren) switch (tsNodeChild.kind) {
        case TS.SyntaxKind.CommaToken:
            continue;

        case TS.SyntaxKind.SyntaxList:
            return parseChildren(
                tsSourceFile,
                tsNodeChild.getChildren(tsSourceFile)
            );

        default:
            sourceChildren.push(parse(tsSourceFile, tsNodeChild));
            continue;
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
        const tsFirstChild = tsNode.elseStatement.getFirstToken(tsSourceFile);

        if (
            tsFirstChild &&
            TS.isIfStatement(tsFirstChild) &&
            tsNode.elseStatement.getChildCount(tsSourceFile) === 1
        ) {
            const elseIfSourceNode = parseIf(tsSourceFile, tsFirstChild);

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
        sourceNode.types = [
            joinNodeArray(tsSourceFile, tsNode.heritageClauses)
        ];
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


function parseVariables(
    tsSourceFile: TS.SourceFile,
    tsNode: TS.VariableStatement
): SourceNode {
    const tsFirstChild = tsNode.getFirstToken(tsSourceFile);

    if (!tsFirstChild) {
        return new SourceNode(tsNode.kind);
    }

    const sourceNode = new SourceNode(
        tsNode.declarationList.kind,
        tsFirstChild.getText(tsSourceFile)
    );

    sourceNode.children = parseChildren(
        tsSourceFile,
        tsNode.declarationList.getChildren(tsSourceFile)
    );

    return sourceNode;
}
