(function () {
  const setText = (key, value) => {
    document.querySelectorAll('[data-field="' + key + '"]').forEach((el) => { el.textContent = value; });
  };

  const page = document.body.dataset.page || '';
  document.title = page ? page + ' · ' + SCHOOL.name : SCHOOL.name;
  setText('name', SCHOOL.name);
  setText('address', SCHOOL.address);
  setText('year', SCHOOL.academicYear);
  setText('principal', SCHOOL.principal);
  setText('hours', SCHOOL.hours);
  document.querySelectorAll('[data-year-now]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  document.querySelectorAll('[data-phone]').forEach((el) => {
    el.textContent = SCHOOL.phone;
    if (el.tagName === 'A') el.href = 'tel:' + SCHOOL.phone.replace(/\s+/g, '');
  });
  document.querySelectorAll('[data-email]').forEach((el) => {
    el.textContent = SCHOOL.email;
    if (el.tagName === 'A') el.href = 'mailto:' + SCHOOL.email;
  });
  const onThisComputer = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  document.querySelectorAll('[data-portal]').forEach((el) => {
    if (onThisComputer) el.href = SCHOOL.portalUrl;
    else el.remove();
  });

  const slot = document.querySelector('[data-logo-slot]');
  if (slot && SCHOOL.logo) {
    const img = document.createElement('img');
    img.src = SCHOOL.logo;
    img.alt = '';
    slot.textContent = '';
    slot.appendChild(img);
  } else if (slot && !slot.querySelector('svg')) {
    slot.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 26V16l6-6 6 6v10M16 26V12l6-6 6 6v14" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 26v-4h3v4M20 26v-5h3v5" stroke="#f0c14a" stroke-width="1.6"/></svg>';
  }

  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav a[href]').forEach((link) => {
    const href = (link.getAttribute('href') || '').split('/').pop().toLowerCase();
    if (href && href === here) link.setAttribute('aria-current', 'page');
  });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const markScrolled = () => { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); };
  markScrolled();
  window.addEventListener('scroll', markScrolled, { passive: true });

  document.querySelectorAll('.cards, .posts, .prices, .stages, .facts, .footer-grid, .audience, .day, .photo-row, .board, .flow, .path ol, .papers').forEach((group) => {
    Array.prototype.forEach.call(group.children, (child, i) => {
      child.classList.add('reveal');
      child.style.setProperty('--d', (i * 80) + 'ms');
    });
  });
  document.querySelectorAll('.section-head, .page-copy, .banner .container, .cta .container, .form-card, .map-slot, .scene-wide, .split > div:not(.facts)').forEach((el) => {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
  });
  const revealed = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    revealed.forEach((el) => el.classList.add('in'));
  } else {
    const watcher = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        watcher.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -32px 0px' });
    revealed.forEach((el) => watcher.observe(el));
  }

  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const form = document.querySelector('#enquiry');
  const status = document.querySelector('#form-status');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = {
      parentName: form.parentName.value,
      phone: form.phone.value,
      childName: form.childName.value,
      className: form.className.value,
      message: form.message.value
    };
    status.className = 'form-status';
    status.textContent = 'Sending…';
    form.querySelector('.submit').disabled = true;
    fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then((res) => res.json().then((body) => ({ ok: res.ok, body: body })))
      .then((result) => {
        if (!result.ok || !result.body.ok) throw new Error((result.body && result.body.message) || 'Could not send.');
        form.reset();
        status.className = 'form-status ok';
        status.textContent = 'Sent. The school has your message and will call you.';
      })
      .catch((err) => {
        status.className = 'form-status err';
        status.textContent = err.message || 'The form could not be sent. Please call the school.';
      })
      .then(() => { form.querySelector('.submit').disabled = false; });
  });
})();
