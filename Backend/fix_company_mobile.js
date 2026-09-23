const fs = require('fs');
const path = require('path');

const dir = 'c:/projects/Mozhibu - Story/Frontend/src/app/features/company';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

const mobileCSS = `
      /* Universal Mobile Fixes injected automatically */
      @media (max-width: 768px) {
        .hero { padding: 40px 16px !important; }
        .hero h1 { font-size: 28px !important; line-height: 1.2 !important; }
        .hero p { font-size: 16px !important; }
        
        .content-section, .wrap { padding: 24px 16px !important; }
        
        .policy-block h2, .section h2 { font-size: 22px !important; margin-top: 24px !important; margin-bottom: 16px !important; }
        .policy-block h3, .section h3 { font-size: 18px !important; }
        
        p, li, .right-item, .contact-details div { font-size: 15px !important; line-height: 1.6 !important; }
        
        .partner-grid, .rights-grid, .values-grid, .features-grid, .grid { 
          grid-template-columns: 1fr !important; 
          gap: 16px !important; 
        }
        
        .icon, .feature-icon, .value-icon {
          width: 40px !important;
          height: 40px !important;
        }
        .icon svg, .feature-icon svg, .value-icon svg {
          width: 20px !important;
          height: 20px !important;
        }
        
        .partner-card, .value-card, .feature-card {
          padding: 20px !important;
        }
        
        .table-row {
          flex-direction: column !important;
        }
        .col-type, .col-desc {
          width: 100% !important;
          padding: 12px !important;
        }
        .col-type {
          border-right: none !important;
          border-bottom: 1px dashed var(--border-soft) !important;
          background: var(--paper-warm) !important;
        }
      }
`;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('Universal Mobile Fixes')) {
    // Find the last backtick before the end of the file
    const lastBacktickIndex = content.lastIndexOf('\`');
    if (lastBacktickIndex !== -1) {
      const before = content.substring(0, lastBacktickIndex);
      const after = content.substring(lastBacktickIndex);
      content = before + mobileCSS + after;
      fs.writeFileSync(filePath, content);
      console.log('Fixed:', file);
    }
  } else {
    console.log('Already fixed:', file);
  }
}
