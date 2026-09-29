(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // Theme (saved in localStorage; ignored silently if unavailable)
  const root = document.documentElement;
  try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch (e) {}
  $('#theme')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next; try { localStorage.setItem('theme', next); } catch (e) {}
  });
  // Mobile menu
  const burger = $('.burger'), menu = $('#menu');
  burger?.addEventListener('click', () => {
    const open = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', open);
  });
  $$('#menu a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));
  // Sticky header + back-to-top
  const header = $('.site-header'), top = $('#top');
  const onScroll = () => { header.classList.toggle('scrolled', scrollY > 20); top.classList.toggle('show', scrollY > 500); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  // Scroll reveal
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));
  // Counters (numbers come from the resume only)
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const end = +e.target.dataset.count; let n = 0;
    const step = () => { n += Math.max(1, end / 30); e.target.textContent = Math.min(end, Math.round(n)); if (n < end) requestAnimationFrame(step); };
    step();
  }));
  $$('[data-count]').forEach(el => cio.observe(el));
  // Skill filter
  $$('.chip').forEach(c => c.addEventListener('click', () => {
    $$('.chip').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-pressed', false); });
    c.classList.add('active'); c.setAttribute('aria-pressed', true);
    $$('.skill').forEach(s => s.classList.toggle('hide', c.dataset.f !== 'all' && s.dataset.cat !== c.dataset.f));
    $$('.project[data-cats]').forEach(p => p.classList.toggle('hide', c.dataset.f !== 'all' && !p.dataset.cats.split(' ').includes(c.dataset.f)));
  }));
  // Hero glow follows pointer (subtle)
  const hero = $('.hero');
  hero?.addEventListener('pointermove', e => {
    hero.style.setProperty('--mx', (e.clientX / innerWidth - .5) * 40 + 'px');
    hero.style.setProperty('--my', (e.clientY / innerHeight - .5) * 40 + 'px');
  });
})();

// ===== Contact form validation (frontend only; nothing is sent) =====
(() => {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  const rules = {
    name: v => v.trim().length >= 2 || 'Enter your name (at least 2 characters).',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email address, like name@example.com.',
    subject: v => v.trim().length >= 3 || 'Enter a subject (at least 3 characters).',
    message: v => v.trim().length >= 10 || 'Write a message of at least 10 characters.'
  };
  const check = f => {
    const r = rules[f.name](f.value), ok = r === true;
    f.setAttribute('aria-invalid', !ok);
    document.getElementById(f.id + '-err').textContent = ok ? '' : r;
    return ok;
  };
  const fields = [...form.querySelectorAll('input,textarea')];
  fields.forEach(f => f.addEventListener('blur', () => check(f)));
  fields.forEach(f => f.addEventListener('input', () => f.getAttribute('aria-invalid') === 'true' && check(f)));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const results = fields.map(check);
    const box = document.querySelector('#form-note');
    if (results.includes(false)) { fields[results.indexOf(false)].focus(); box.classList.remove('show'); return; }
    const d = Object.fromEntries(fields.map(f => [f.name, f.value.trim()]));
    const body = encodeURIComponent(`${d.message}\n\nFrom: ${d.name} (${d.email})`);
    const href = `mailto:sufeeyanmohamed@gmail.com?subject=${encodeURIComponent(d.subject)}&body=${body}`;
    box.innerHTML = `Your details look valid, but this form isn't connected to an email service yet, so nothing has been sent. <a href="${href}">Open in your email app to send it</a>.`;
    box.classList.add('show');
  });
})();
