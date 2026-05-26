const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'site/dist/index.html'), 'utf8');
let workerCode = fs.readFileSync(path.join(__dirname, 'worker/index.js'), 'utf8');

// Strip out any existing ADMIN_HTML definition at the bottom if present
const adminHtmlMarker = '\n// --- ADMIN_HTML START ---';
const markerIndex = workerCode.indexOf(adminHtmlMarker);
if (markerIndex !== -1) {
  workerCode = workerCode.substring(0, markerIndex);
}

// Append the new ADMIN_HTML (escaping backticks and dollar-sign interpolations)
const escapedHtml = html.replace(/`/g, '\\`').replace(/\${/g, '\\${');
const updatedWorkerCode = `${workerCode}${adminHtmlMarker}\nconst ADMIN_HTML = \`${escapedHtml}\`;\n`;

fs.writeFileSync(path.join(__dirname, 'worker/index.js'), updatedWorkerCode, 'utf8');
console.log('Worker updated with inlined HTML successfully!');
