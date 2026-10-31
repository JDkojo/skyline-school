const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = __dirname;
const PORT = 3081;
const FILE = path.join(ROOT, 'enquiries.json');
const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III'];
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.gif': 'image/gif'
};

function readEnquiries() {
  try {
    const rows = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return Array.isArray(rows) ? rows : [];
  } catch (e) {
    return [];
  }
}

function sendJson(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function safeFile(urlPath) {
  const rel = urlPath === '/' ? 'index.html' : decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  if (!rel || rel === 'enquiries.json' || rel.indexOf('..') !== -1) return '';
  const root = path.resolve(ROOT);
  const file = path.resolve(ROOT, rel);
  if (file !== root && file.indexOf(root + path.sep) !== 0) return '';
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return '';
  return file;
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url.split('?')[0] === '/api/enquiry') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 20000) req.destroy();
    });
    req.on('end', () => {
      let data;
      try { data = JSON.parse(body || '{}'); } catch (e) {
        sendJson(res, 400, { ok: false, message: 'Could not read that form.' });
        return;
      }
      const parentName = String(data.parentName || '').trim();
      const phone = String(data.phone || '').trim();
      const childName = String(data.childName || '').trim();
      const className = String(data.className || '').trim();
      const message = String(data.message || '').trim();
      if (!parentName || !phone || !childName || !message || CLASSES.indexOf(className) < 0) {
        sendJson(res, 400, { ok: false, message: 'Please fill in every field and choose a class.' });
        return;
      }
      const rows = readEnquiries();
      rows.push({
        at: new Date().toISOString(),
        parentName: parentName.slice(0, 80),
        phone: phone.slice(0, 30),
        childName: childName.slice(0, 80),
        className: className,
        message: message.slice(0, 1000)
      });
      fs.writeFileSync(FILE, JSON.stringify(rows, null, 2));
      sendJson(res, 200, { ok: true });
    });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method not allowed');
    return;
  }

  const file = safeFile(req.url);
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  if (req.method === 'HEAD') res.end();
  else fs.createReadStream(file).pipe(res);
});

const port = Number(process.env.PORT) || PORT;
const host = process.env.PORT ? '0.0.0.0' : '127.0.0.1';
server.listen(port, host, () => {
  console.log('Skyline School site at http://' + (host === '0.0.0.0' ? '127.0.0.1' : host) + ':' + port);
});
