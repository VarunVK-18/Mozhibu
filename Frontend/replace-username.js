const fs = require('fs');
const execSync = require('child_process').execSync;

const files = execSync('npx ripgrep "\\\\.username" src/app -l', { encoding: 'utf8' }).split('\n').filter(Boolean);

files.forEach(file => {
  if (file.includes('node_modules')) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace x?.username with (x?.penName || x?.username)
  content = content.replace(/(\w+(?:\(\))?)\?\.username/g, '($1?.penName || $1?.username)');
  
  // Replace x.username with (x.penName || x.username)
  // Be careful with property declarations or imports, so we only match variable.username
  content = content.replace(/(\w+(?:\(\))?)\.username(?!\s*:|\s*=|\s*\()/g, '($1.penName || $1.username)');
  
  fs.writeFileSync(file, content);
});
console.log('Replaced in ' + files.length + ' files.');
