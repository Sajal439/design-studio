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

const apps = ['./apps/web', './apps/admin'];
apps.forEach(app => {
  const files = walk(app);
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content.replace(/@\/components\/ui\//g, '@repo/ui/');
    if (newContent !== content) {
      fs.writeFileSync(file, newContent);
    }
  });
});
console.log("Replaced imports in apps successfully.");
