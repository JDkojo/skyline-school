const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III'];

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'Use the admissions form.' });
    return;
  }
  const data = req.body && typeof req.body === 'object' ? req.body : {};
  const parentName = String(data.parentName || '').trim();
  const phone = String(data.phone || '').trim();
  const childName = String(data.childName || '').trim();
  const className = String(data.className || '').trim();
  const message = String(data.message || '').trim();
  if (!parentName || !phone || !childName || !message || CLASSES.indexOf(className) < 0) {
    res.status(400).json({ ok: false, message: 'Please fill in every field and choose a class.' });
    return;
  }
  const row = {
    at: new Date().toISOString(),
    parentName: parentName.slice(0, 80),
    phone: phone.slice(0, 30),
    childName: childName.slice(0, 80),
    className: className,
    message: message.slice(0, 1000)
  };
  console.log(JSON.stringify({ enquiry: row }));
  res.status(200).json({ ok: true, stored: 'log' });
};
