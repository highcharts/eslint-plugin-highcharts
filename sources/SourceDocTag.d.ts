/* *
 *
 *  Imports
 *
 * */


import type * as U from './Utilities';
import type SourceToken from './SourceToken';


/* *
 *
 *  Declarations
 *
 * */


export interface SourceDocTag extends SourceToken {
    paramName?: string;
    tagName: string;
    tagType?: string;
}


/* *
 *
 *  Default Export
 *
 * */


export default SourceDocTag;
