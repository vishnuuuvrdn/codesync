const src = require('fs').readFileSync('./node_modules/react-resizable-panels/dist/react-resizable-panels.js', 'utf8');

// Find the Group component and its props
const groupIdx = src.indexOf('Xt.displayName = "Group"');
console.log('=== Group component (backwards) ===');
console.log(src.substring(groupIdx - 2000, groupIdx + 100));
