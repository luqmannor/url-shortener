const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'site/dist/index.html'), 'utf8');
let workerCode = fs.readFileSync(path.join(__dirname, 'worker/index.js'), 'utf8');

// Strip out any existing ADMIN_HTML / ADMIN_HTML_B64 definition at the bottom if present
const adminHtmlMarker = '\n// --- ADMIN_HTML START ---';
const markerIndex = workerCode.indexOf(adminHtmlMarker);
if (markerIndex !== -1) {
  workerCode = workerCode.substring(0, markerIndex);
}

// Convert HTML to base64
const base64Html = Buffer.from(html, 'utf8').toString('base64');
const updatedWorkerCode = `${workerCode}${adminHtmlMarker}\nconst ADMIN_HTML_B64 = "${base64Html}";\n`;

fs.writeFileSync(path.join(__dirname, 'worker/index.js'), updatedWorkerCode, 'utf8');
console.log('Worker updated with Base64 inlined HTML successfully!');
