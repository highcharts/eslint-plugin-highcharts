/**
 * @author Sophie Bremer
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimAll = exports.isDocumentedNode = exports.indent = exports.getJSDocs = void 0;
/* *
 *
 *  Imports
 *
 * */
const TS = require("typescript");
/* *
 *
 *  Functions
 *
 * */
function getJSDocs(sourceLine) {
    const code = sourceLine.tokens
        .filter(token => token.kind === TS.SyntaxKind.MultiLineCommentTrivia)
        .map(token => token.text)
        .join('');
    if (!code.length) {
        return [];
    }
    const source = TS.createSourceFile('', code, TS.ScriptTarget.Latest), jsDocs = [], extract = (node) => {
        if (isDocumentedNode(node)) {
            const jsDoc = node.jsDoc;
            for (let i = 0, iEnd = jsDoc.length; i < iEnd; ++i) {
                if (!jsDocs.includes(jsDoc[i])) {
                    jsDocs.push(jsDoc[i]);
                }
            }
        }
        node.getChildren(source).forEach(extract);
    };
    extract(source);
    return jsDocs;
}
exports.getJSDocs = getJSDocs;
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
function indent(text, linePrefix = '', wrap = 80) {
    const fragments = text.split(/\s/gmu);
    let newLine = true, line = '', paddedStr = '';
    fragments.forEach(fragment => {
        if (!newLine && fragment === '') {
            paddedStr += (line.trimRight() + '\n' +
                linePrefix.trimRight() + '\n');
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
exports.indent = indent;
function isDocumentedNode(node) {
    return (typeof node.jsDoc === 'object');
}
exports.isDocumentedNode = isDocumentedNode;
function trimAll(text, keepParagraphs = false) {
    if (keepParagraphs) {
        const fragments = text.split(/\n\s*\n/gu), trimmed = [];
        for (let i = 0, iEnd = fragments.length; i < iEnd; ++i) {
            trimmed.push(trimAll(fragments[i]));
        }
        return trimmed.join('\n\n');
    }
    return text.replace(/\s+/gu, ' ').trim();
}
exports.trimAll = trimAll;
