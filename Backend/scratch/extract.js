
const fs = require('fs');
const path = require('path');
const routesDir = path.join(__dirname, '../src/routes');

const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
const apiDocs = {};

files.forEach(file => {
  const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
  const lines = content.split('\n');
  const routes = [];
  
  let currentRoute = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Match standard Express router definitions (router.get, router.post, etc.)
    const routerMatch = line.match(/router\.(get|post|put|delete|patch)\(['\u0022](.*?)['\u0022]/);
    
    // Also try to find comments describing the route before it
    let commentRoute = null;
    let commentDesc = '';
    
    if (line.startsWith('// @route')) {
      commentRoute = line.replace('// @route', '').trim();
    } else if (line.match(/^\/\/\s+(GET|POST|PUT|DELETE|PATCH)\s+\/api/)) {
      const parts = line.replace(/^\/\/\s+/, '').split('—');
      commentRoute = parts[0].trim();
      if (parts.length > 1) commentDesc = parts[1].trim();
    }
    
    if (commentRoute || routerMatch) {
      if (currentRoute) routes.push(currentRoute);
      let r = commentRoute || ((routerMatch[1].toUpperCase() + ' ') + routerMatch[2]);
      
      // If we only have routerMatch, let's see if there was a preceding comment
      if (!commentRoute && i > 0 && lines[i-1].trim().startsWith('//')) {
         commentDesc = lines[i-1].replace('//', '').trim();
         if (commentDesc.startsWith('@desc')) commentDesc = commentDesc.replace('@desc', '').trim();
      }
      
      currentRoute = { route: r, desc: commentDesc, responses: [] };
    } else if (line.startsWith('// @desc') && currentRoute && !currentRoute.desc) {
      currentRoute.desc = line.replace('// @desc', '').trim();
    } else if (currentRoute && line.includes('res.status(')) {
       const statusMatch = line.match(/res\.status\((\d+)\)/);
       if (statusMatch && !currentRoute.responses.includes(statusMatch[1] + ' status')) {
         currentRoute.responses.push(statusMatch[1] + ' status');
       }
    } else if (currentRoute && line.includes('res.json(') && !currentRoute.responses.includes('JSON response')) {
       currentRoute.responses.push('JSON response');
    }
  }
  if (currentRoute) routes.push(currentRoute);
  
  if (routes.length > 0) {
    apiDocs[file.replace('.js', '')] = routes;
  }
});

// Remove duplicates and clean up
Object.keys(apiDocs).forEach(key => {
  const uniqueRoutes = [];
  const seen = new Set();
  apiDocs[key].forEach(r => {
    // try to clean up
    let cleanRoute = r.route.split(' ')[1] || r.route;
    let method = r.route.split(' ')[0] || '';
    if (!seen.has(method + ' ' + cleanRoute)) {
      seen.add(method + ' ' + cleanRoute);
      uniqueRoutes.push(r);
    }
  });
  apiDocs[key] = uniqueRoutes;
});

fs.writeFileSync(path.join(__dirname, 'api_docs.json'), JSON.stringify(apiDocs, null, 2));
console.log('Done v2');

