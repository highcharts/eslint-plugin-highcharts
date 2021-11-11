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
import SourceLine from './SourceLine';


/* *
 *
 *  Declarations
 *
 * */


export interface DocumentedNode extends TS.Node {
    jsDoc: Array<TS.JSDoc>;
}


/* *
 *
 *  Functions
 *
 * */


export function getJSDocs(
    sourceLine: SourceLine
): Array<TS.JSDoc> {
    const code = sourceLine.tokens
        .filter(token => token.kind === TS.SyntaxKind.MultiLineCommentTrivia)
        .map(token => token.text)
        .join('');

    if (!code.length) {
        return [];
    }

    const source = TS.createSourceFile('', code, TS.ScriptTarget.Latest),
        jsDocs: Array<TS.JSDoc> = [],
        extract = (node: TS.Node) => {
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
        typeof (node as unknown as Record<string, unknown>).jsDoc === 'object'
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
