import * as U from '../../lib/Utilities';

const loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
const loremIpsumWithBreaks = loremIpsum.replace(/\. /g, '.\n\n');

console.log(U.indent(4, ' * ', loremIpsum, 60));
console.log(U.indent(4, ' * ', loremIpsumWithBreaks, 60));
