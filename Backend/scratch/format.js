const fs = require('fs');
const path = require('path');
const apiDocs = JSON.parse(fs.readFileSync(path.join(__dirname, 'api_docs.json'), 'utf8'));

let markdown = '# Mozhibu API Documentation\n\n';
markdown += 'This document outlines all the APIs implemented in the project, categorized by their domain/purpose. Each endpoint includes its HTTP method, route, description, and possible response messages (status codes and body format).\n\n';

for (const [domain, routes] of Object.entries(apiDocs)) {
  markdown += `## ${domain.charAt(0).toUpperCase() + domain.slice(1)} APIs\n\n`;
  
  // Filter out the duplicate short routes if a long route exists
  const uniqueRoutes = [];
  const seenPaths = new Set();
  
  // Prefer routes that start with /api/
  const sortedRoutes = routes.sort((a, b) => {
    if (a.route.includes('/api/') && !b.route.includes('/api/')) return -1;
    if (!a.route.includes('/api/') && b.route.includes('/api/')) return 1;
    return 0;
  });

  for (const r of sortedRoutes) {
    let method = r.route.split(' ')[0];
    let endpoint = r.route.split(' ')[1] || '';
    
    // Normalize endpoint to remove /api/domain if it exists, to match duplicates, or just use the long one
    let baseEndpoint = endpoint.replace('/api/' + domain, '');
    if (baseEndpoint === '') baseEndpoint = '/';
    
    let key = method + ' ' + baseEndpoint;
    
    if (!seenPaths.has(key)) {
      seenPaths.add(key);
      
      // Ensure endpoint starts with /api/domain
      if (!endpoint.startsWith('/api/')) {
         let prefix = '/api/' + domain;
         endpoint = prefix + (endpoint === '/' ? '' : endpoint);
      }
      
      uniqueRoutes.push({
        method: method,
        endpoint: endpoint,
        desc: r.desc || 'No description provided.',
        responses: r.responses.length > 0 ? r.responses : ['JSON response']
      });
    }
  }

  for (const r of uniqueRoutes) {
    markdown += `### ${r.method} ${r.endpoint}\n`;
    markdown += `**Purpose:** ${r.desc}\n\n`;
    markdown += `**Response Messages:**\n`;
    
    const resSet = new Set(r.responses);
    if (resSet.has('JSON response')) {
      markdown += `- \`200/201 OK\`: Returns JSON data.\n`;
    }
    if (resSet.has('400 status')) {
      markdown += `- \`400 Bad Request\`: Invalid input or missing parameters.\n`;
    }
    if (resSet.has('401 status') || resSet.has('403 status')) {
      markdown += `- \`401/403 Unauthorized/Forbidden\`: Missing or invalid authentication token, or lack of permissions.\n`;
    }
    if (resSet.has('404 status')) {
      markdown += `- \`404 Not Found\`: The requested resource does not exist.\n`;
    }
    if (resSet.has('500 status')) {
      markdown += `- \`500 Server Error\`: Internal server error.\n`;
    }
    
    markdown += `\n\`\`\`json\n`;
    markdown += JSON.stringify({
      method: r.method,
      endpoint: r.endpoint,
      description: r.desc,
      responses: Array.from(resSet)
    }, null, 2);
    markdown += `\n\`\`\`\n\n`;
  }
}

fs.writeFileSync(path.join(__dirname, 'api_documentation.md'), markdown);
console.log('Markdown generated.');
