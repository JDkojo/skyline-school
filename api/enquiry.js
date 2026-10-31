const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III'];
const hits = new Map();

function clean(value, max) {
  return String(value || '').replace(/[<>\u0000-\u001F]/g, '').trim().slice(0, max);
}

function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((time) => now - time < 10 * 60 * 1000);
  if (recent.length >= 5) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'Use the admissions form.' });
    return;
  }
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  if (limited(ip)) {
    res.status(429).json({ ok: false, message: 'Please wait a few minutes, or call the school.' });
    return;
  }
  const data = req.body && typeof req.body === 'object' ? req.body : {};
  if (clean(data.company, 80)) {
    res.status(200).json({ ok: true });
    return;
  }
  const parentName = clean(data.parentName, 80);
  const phone = clean(data.phone, 30);
  const childName = clean(data.childName, 80);
  const className = clean(data.className, 20);
  const message = clean(data.message, 1000);
  const phoneOk = /^[0-9+\s()-]{7,30}$/.test(phone);
  if (!parentName || !childName || !message || !phoneOk || CLASSES.indexOf(className) < 0) {
    res.status(400).json({ ok: false, message: 'Please fill in every field and choose a class.' });
    return;
  }
  console.log(JSON.stringify({ enquiry: 'accepted', className: className }));
  res.status(200).json({ ok: true, stored: 'log' });
};
