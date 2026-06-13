const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./packages/ui/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/@\/lib\/utils/g, './utils');
  fs.writeFileSync(file, content);
});
console.log("Replaced utils import in packages/ui/src.");
