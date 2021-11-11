/**
 * @author Sophie Bremer
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceLine = void 0;
/* *
 *
 *  Class
 *
 * */
class SourceLine {
    constructor() {
        /* *
         *
         *  Properties
         *
         * */
        this.tokens = [];
    }
    /* *
     *
     *  Functions
     *
     * */
    getLength() {
        const tokens = this.tokens;
        let length = 0;
        for (let i = 0, iEnd = tokens.length; i < iEnd; ++i) {
            length += tokens[i].text.length;
        }
        return length;
    }
    toString() {
        const tokens = this.tokens;
        let text = '';
        for (let i = 0, iEnd = tokens.length; i < iEnd; ++i) {
            text += tokens[i].text;
        }
        return text;
    }
}
exports.SourceLine = SourceLine;
/* *
 *
 *  Default Export
 *
 * */
exports.default = SourceLine;
