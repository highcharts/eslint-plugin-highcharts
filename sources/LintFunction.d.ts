/**
 * @author Sophie Bremer
 */


/* *
 *
 *  Imports
 *
 * */


import type RuleContext from './RuleContext';
import type RuleOptions from './RuleOptions';


/* *
 *
 *  Declarations
 *
 * */


export interface LintFunction<T extends RuleOptions = RuleOptions> {
    (ruleContext: RuleContext<T>): void;
}


/* *
 *
 *  Default Export
 *
 * */


export default LintFunction;
