"use strict";
/* *
 *
 *  Imports
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseChildren = exports.parse = void 0;
const TS = require("typescript");
const U = require("./Utilities");
const SourceNode_1 = require("./SourceNode");
/* *
 *
 *  Functions
 *
 * */
function ignoreChildrenOf(tsNode) {
    return (TS.isExpressionStatement(tsNode) ||
        TS.isImportDeclaration(tsNode) ||
        TS.isPropertySignature(tsNode) ||
        TS.isReturnStatement(tsNode) ||
        TS.isVariableDeclaration(tsNode));
}
function joinNodeArray(tsSourceFile, tsNodes, separator = ',') {
    const nodes = [];
    for (const tsNode of tsNodes) {
        nodes.push(tsNode.getText(tsSourceFile));
    }
    return nodes.join(separator);
}
function parse(tsSourceFile, tsNode) {
    let sourceNode;
    if (TS.isForStatement(tsNode)) {
        sourceNode = parseFor(tsSourceFile, tsNode);
    }
    else if (TS.isFunctionDeclaration(tsNode)) {
        sourceNode = parseFunction(tsSourceFile, tsNode);
    }
    else if (TS.isIfStatement(tsNode)) {
        sourceNode = parseIf(tsSourceFile, tsNode);
    }
    else if (TS.isInterfaceDeclaration(tsNode)) {
        sourceNode = parseInterface(tsSourceFile, tsNode);
    }
    else if (TS.isModuleDeclaration(tsNode)) {
        sourceNode = parseModule(tsSourceFile, tsNode);
    }
    else if (TS.isVariableStatement(tsNode)) {
        sourceNode = parseVariables(tsSourceFile, tsNode);
    }
    else if (ignoreChildrenOf(tsNode)) {
        const types = U.extractTypes(tsSourceFile, tsNode);
        sourceNode = new SourceNode_1.default(tsNode.kind, tsNode.getText(tsSourceFile));
        sourceNode.types = types;
    }
    else {
        const tsNodeChildren = tsNode.getChildren(tsSourceFile);
        sourceNode = new SourceNode_1.default(tsNode.kind);
        if (tsNodeChildren.length) {
            sourceNode.children = parseChildren(tsSourceFile, tsNodeChildren);
        }
        else {
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
exports.parse = parse;
function parseChildren(tsSourceFile, tsNodeChildren) {
    const sourceChildren = [];
    for (const tsNodeChild of tsNodeChildren)
        switch (tsNodeChild.kind) {
            case TS.SyntaxKind.CommaToken:
                continue;
            case TS.SyntaxKind.SyntaxList:
                return parseChildren(tsSourceFile, tsNodeChild.getChildren(tsSourceFile));
            default:
                sourceChildren.push(parse(tsSourceFile, tsNodeChild));
                continue;
        }
    return sourceChildren;
}
exports.parseChildren = parseChildren;
function parseFor(tsSourceFile, tsNode) {
    const sourceNode = new SourceNode_1.default(tsNode.kind);
    sourceNode.children = parseChildren(tsSourceFile, tsNode.statement.getChildren(tsSourceFile));
    if (tsNode.initializer) {
        sourceNode.text += `${tsNode.initializer.getText(tsSourceFile)};`;
    }
    if (tsNode.condition) {
        sourceNode.text += `${tsNode.condition.getText(tsSourceFile)};`;
    }
    if (tsNode.incrementor) {
        sourceNode.text += `${tsNode.incrementor.getText(tsSourceFile)};`;
    }
    return sourceNode;
}
function parseFunction(tsSourceFile, tsNode) {
    const sourceNode = new SourceNode_1.default(tsNode.kind, tsNode.name ? tsNode.name.getText(tsSourceFile) : '');
    if (tsNode.body) {
        sourceNode.children = parseChildren(tsSourceFile, tsNode.body.getChildren(tsSourceFile));
    }
    return sourceNode;
}
function parseIf(tsSourceFile, tsNode) {
    const sourceNode = new SourceNode_1.default(tsNode.kind, tsNode.expression.getText(tsSourceFile));
    sourceNode.children = parseChildren(tsSourceFile, tsNode.thenStatement.getChildren(tsSourceFile));
    if (tsNode.elseStatement) {
        const tsFirstChild = tsNode.elseStatement.getFirstToken(tsSourceFile);
        if (tsFirstChild &&
            TS.isIfStatement(tsFirstChild) &&
            tsNode.elseStatement.getChildCount(tsSourceFile) === 1) {
            const elseIfSourceNode = parseIf(tsSourceFile, tsFirstChild);
            elseIfSourceNode.text = `else ${elseIfSourceNode.text}`;
            sourceNode.children.push(elseIfSourceNode);
        }
        else {
            const elseSourceNode = new SourceNode_1.default(tsNode.kind, 'else');
            elseSourceNode.children = parseChildren(tsSourceFile, tsNode.elseStatement.getChildren(tsSourceFile));
            sourceNode.children.push(elseSourceNode);
        }
    }
    return sourceNode;
}
function parseInterface(tsSourceFile, tsNode) {
    const sourceNode = new SourceNode_1.default(tsNode.kind, tsNode.name.getText(tsSourceFile));
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
function parseModule(tsSourceFile, tsNode) {
    const sourceNode = new SourceNode_1.default(tsNode.kind, tsNode.name.getText(tsSourceFile));
    if (tsNode.body) {
        sourceNode.children = parseChildren(tsSourceFile, tsNode.body.getChildren(tsSourceFile));
    }
    return sourceNode;
}
function parseVariables(tsSourceFile, tsNode) {
    const tsFirstChild = tsNode.getFirstToken(tsSourceFile);
    if (!tsFirstChild) {
        return new SourceNode_1.default(tsNode.kind);
    }
    const sourceNode = new SourceNode_1.default(tsNode.declarationList.kind, tsFirstChild.getText(tsSourceFile));
    sourceNode.children = parseChildren(tsSourceFile, tsNode.declarationList.getChildren(tsSourceFile));
    return sourceNode;
}
