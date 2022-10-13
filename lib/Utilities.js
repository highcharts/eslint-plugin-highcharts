/**
 * @author Sophie Bremer
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimBreaks = exports.trimAll = exports.removeBreaks = exports.pad = exports.isNodeStatement = exports.isNodeClass = exports.isExpressionNode = exports.isDocumentedNode = exports.indent = exports.detectLineBreak = exports.extractLastLine = exports.extractFirstLine = exports.extractTypes = exports.SPACES = exports.PARAGRAPHS = exports.LINE_BREAKS = void 0;
/* *
 *
 *  Imports
 *
 * */
const TS = require("typescript");
/* *
 *
 *  Constants
 *
 * */
exports.LINE_BREAKS = /\r\n|\r|\n/gu;
exports.PARAGRAPHS = new RegExp(`(?:${exports.LINE_BREAKS.source}){2,2}`, 'gu');
exports.SPACES = /[ \t]/gu;
/* *
 *
 *  Functions
 *
 * */
function extractTypes(tsSourceFile, tsNode) {
    const tsChildren = tsNode.getChildren(tsSourceFile), types = [];
    for (const tsChild of tsChildren) {
        if (TS.isTypeReferenceNode(tsChild)) {
            types.push(tsChild.getText(tsSourceFile));
        }
    }
    return types;
}
exports.extractTypes = extractTypes;
function extractFirstLine(text) {
    return text.split(exports.LINE_BREAKS)[0];
}
exports.extractFirstLine = extractFirstLine;
function extractLastLine(text) {
    const lines = text.split(exports.LINE_BREAKS);
    return lines[lines.length - 1];
}
exports.extractLastLine = extractLastLine;
function detectLineBreak(text) {
    var _a;
    return (_a = text.match(new RegExp(exports.LINE_BREAKS.source, 'u'))) === null || _a === void 0 ? void 0 : _a[0];
}
exports.detectLineBreak = detectLineBreak;
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
function indent(indent, prefix, text, wrap) {
    const lb = detectLineBreak(text) || '\n';
    prefix = pad(indent, prefix);
    if (!wrap) {
        return prefix + text.replace(exports.LINE_BREAKS, `${lb}${prefix}`);
    }
    const fragments = text
        .replace(exports.PARAGRAPHS, ' \x00 ') // paragraphs
        .replace(exports.LINE_BREAKS, ' \x05 ') // single break
        .trim()
        .split(exports.SPACES);
    let codeBlock = false, newLine = true, line = prefix, newParagraph = false, paddedStr = '';
    for (const fragment of fragments) {
        if (fragment === '\x00') {
            newLine = true;
            newParagraph = true;
            paddedStr += line.trimRight() + lb + prefix.trimRight() + lb;
            continue;
        }
        if (fragment === '\x05') {
            if (codeBlock) {
                newLine = true;
                paddedStr += line.trimRight() + lb;
            }
            else if (newParagraph) {
                newLine = true;
                paddedStr += prefix.trimRight() + lb;
            }
            continue;
        }
        if (fragment.startsWith('```')) {
            codeBlock = !codeBlock;
            if (!newLine) {
                newLine = true;
                paddedStr += line.trimRight() + lb;
            }
        }
        if (!codeBlock &&
            !newLine &&
            line.trimRight().length + 1 + fragment.length > wrap) {
            newLine = true;
            paddedStr += line.trimRight() + lb;
        }
        if (newLine) {
            newLine = false;
            line = prefix + fragment;
        }
        else {
            line += ' ' + fragment;
        }
        if (fragment && newParagraph) {
            newParagraph = false;
        }
    }
    return newLine ? paddedStr : paddedStr + line.trimRight();
}
exports.indent = indent;
function isDocumentedNode(node) {
    return (typeof node.jsDoc === 'object');
}
exports.isDocumentedNode = isDocumentedNode;
function isExpressionNode(node) {
    return (typeof node.expression === 'object');
}
exports.isExpressionNode = isExpressionNode;
function isNodeClass(node, nodeClass) {
    const kindClass = TS.SyntaxKind[node.kind];
    return !!kindClass && kindClass.endsWith(nodeClass);
}
exports.isNodeClass = isNodeClass;
function isNodeStatement(node) {
    return (TS.isBreakOrContinueStatement(node) ||
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
        TS.isWhileStatement(node));
}
exports.isNodeStatement = isNodeStatement;
function pad(indent, suffix = '') {
    return ' '.repeat(indent) + suffix;
}
exports.pad = pad;
function removeBreaks(text) {
    return text.replace(exports.LINE_BREAKS, ' ').trim();
}
exports.removeBreaks = removeBreaks;
function trimAll(text, keepParagraphs = false) {
    const lb = detectLineBreak(text) || '\n';
    if (keepParagraphs) {
        return text
            .replace(exports.PARAGRAPHS, ' \x00 ')
            .replace(/\s+/gu, ' ')
            .trim()
            .replace(/ ?\x00 ?/, `${lb}${lb}`);
    }
    return text.replace(/\s+/gu, ' ').trim();
}
exports.trimAll = trimAll;
function trimBreaks(text) {
    return text.replace(new RegExp(`^(?:${exports.LINE_BREAKS.source}){1,}|(?:${exports.LINE_BREAKS.source}){1,}$`, 'gu'), '');
}
exports.trimBreaks = trimBreaks;
