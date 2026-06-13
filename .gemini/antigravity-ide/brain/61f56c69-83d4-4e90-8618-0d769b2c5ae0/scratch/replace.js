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

const files = walk('./apps/admin');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\/admin\/designs/g, '/designs');
  content = content.replace(/\/admin\/pricing/g, '/pricing');
  content = content.replace(/\/admin\/login/g, '/login');
  content = content.replace(/\/api\/admin\//g, '/api/');
  content = content.replace(/"\/admin"/g, '"/"');
  content = content.replace(/'\/admin'/g, "'/'");
  content = content.replace(/`\/admin`/g, "`\/`");
  fs.writeFileSync(file, content);
});
console.log("Replaced strings successfully.");
