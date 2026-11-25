import './style.css';
import { photographer, series, allPhotos } from './data.js';

const $ = (s, el = document) => el.querySelector(s);
const el = (tag, props = {}, html = '') => {
  const n = document.createElement(tag);
  Object.assign(n, props);
  if (html) n.innerHTML = html;
  return n;
};
const pad = (n) => String(n).padStart(2, '0');

/* ---------- Static content ---------- */
$('#year').textContent = new Date().getFullYear();
$('#disciplines').textContent = photographer.disciplines.join(' · ');
$('#count').textContent = `${allPhotos.length} frames · ${series.length} series`;
$('#about-text').textContent = photographer.about;
const mail = $('#mail');
mail.href = `mailto:${photographer.email}`;
mail.textContent = photographer.email;
photographer.disciplines.forEach((d, i) =>
  $('#skills').appendChild(el('li', {}, `<span>${pad(i + 1)}</span>${d} photography`)),
);

/* ---------- Theme ---------- */
const root = document.documentElement;
$('#theme').addEventListener('click', () => {
  const dark =
    root.dataset.theme === 'dark' ||
    (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  const next = dark ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch {}
});

/* ---------- Header state ---------- */
const bar = $('#bar');
const onScroll = () => bar.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Hero film strip ---------- */
// Deterministic interleave so neighbouring frames come from different series
const mixed = [];
const maxLen = Math.max(...series.map((s) => s.photos.length));
for (let i = 0; i < maxLen; i++) series.forEach((s) => s.photos[i] && mixed.push(s.photos[i]));
const stripEl = $('#strip');
[...mixed, ...mixed].forEach((p, i) => {
  const f = el('div', { className: 'frame' });
  const img = el('img', { src: p.src, alt: '', width: p.w, height: p.h, decoding: 'async' });
  if (i < 6) img.fetchPriority = 'high';
  else img.loading = 'lazy';
  f.appendChild(img);
  f.appendChild(el('span', {}, pad((i % mixed.length) + 1)));
  stripEl.appendChild(f);
});

/* ---------- Index (series list) ---------- */
const indexEl = $('#index');
series.forEach((s, i) => {
  const li = el('li');
  const a = el(
    'a',
    { href: `#${s.id}`, className: 'row' },
    `<span class="r-num">${pad(i + 1)}</span>
     <span class="r-title">${s.title}</span>
     <span class="r-note">${s.note}</span>
     <span class="r-count">${s.photos.length} frames</span>
     <span class="r-arrow" aria-hidden="true">→</span>`,
  );
  a.dataset.id = s.id;
  a.addEventListener('click', (e) => {
    e.preventDefault();
    setFilter(s.id, true);
  });
  li.appendChild(a);
  indexEl.appendChild(li);
});

/* ---------- Hover preview following the cursor ---------- */
const peek = $('#peek');
const peekImg = $('img', peek);
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, active = false;
  const tick = () => {
    x += (tx - x) * 0.16;
    y += (ty - y) * 0.16;
    peek.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${(tx - x) * 0.04}deg)`;
    raf = active || Math.abs(tx - x) > 0.5 ? requestAnimationFrame(tick) : 0;
  };
  indexEl.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
  indexEl.addEventListener('pointerover', (e) => {
    const row = e.target.closest('.row');
    if (!row) return;
    const s = series.find((x) => x.id === row.dataset.id);
    const p = s.photos[0];
    peekImg.src = p.src;
    peek.style.setProperty('--r', p.w / p.h);
    tx = e.clientX; ty = e.clientY;
    if (!active) { x = tx; y = ty; }
    active = true;
    peek.classList.add('on');
    if (!raf) raf = requestAnimationFrame(tick);
  });
  indexEl.addEventListener('pointerleave', () => {
    active = false;
    peek.classList.remove('on');
  });
}

/* ---------- Galleries ---------- */
const galleries = $('#galleries');
const filters = $('#filters');
const sections = new Map();

const addFilter = (id, label) => {
  const b = el('button', { type: 'button', textContent: label });
  b.dataset.id = id;
  b.addEventListener('click', () => setFilter(id));
  filters.appendChild(b);
};
addFilter('all', 'All');

series.forEach((s, i) => {
  addFilter(s.id, s.title);
  const sec = el(
    'section',
    { id: s.id, className: 'series' },
    `<div class="s-head">
       <span class="s-num">${pad(i + 1)}</span>
       <h3>${s.title}</h3>
       <p>${s.note}</p>
     </div>`,
  );
  const grid = el('div', { className: 'grid' });
  s.photos.forEach((p, j) => {
    const b = el('button', { type: 'button', className: 'ph reveal' });
    b.style.setProperty('--r', p.w / p.h);
    b.style.transitionDelay = `${Math.min(j, 5) * 60}ms`;
    b.setAttribute('aria-label', `Open ${s.title} frame ${j + 1}`);
    b.innerHTML = `<img src="${p.src}" width="${p.w}" height="${p.h}" alt="${p.alt}" loading="lazy" decoding="async" /><span class="cap">${s.title} · ${pad(j + 1)}</span>`;
    b.addEventListener('click', () => openLightbox(s.photos, j, b));
    grid.appendChild(b);
  });
  sec.appendChild(grid);
  galleries.appendChild(sec);
  sections.set(s.id, sec);
});

const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }),
  { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
);
const observeReveals = () =>
  document.querySelectorAll('.reveal:not(.in)').forEach((n) => io.observe(n));

function setFilter(id, scroll = false) {
  if (id !== 'all' && !sections.has(id)) id = 'all';
  sections.forEach((sec, key) => (sec.hidden = !(id === 'all' || key === id)));
  [...filters.children].forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
  history.replaceState(null, '', id === 'all' ? location.pathname : `#${id}`);
  observeReveals();
  if (scroll) {
    const target = id === 'all' ? filters : sections.get(id);
    const y = target.getBoundingClientRect().top + scrollY - (id === 'all' ? 70 : 130);
    scrollTo({ top: y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
}
// Deep link, e.g. /#street
const initial = location.hash.slice(1);
setFilter(sections.has(initial) ? initial : 'all', sections.has(initial));

/* ---------- Lightbox ---------- */
const lb = $('#lb');
const lbImg = $('#lb-img');
const lbCap = $('#lb-cap');
const lbCount = $('#lb-count');
let list = [], idx = 0, opener = null;

const preload = (p) => { if (p) new Image().src = p.src; };
function renderLb() {
  const p = list[idx];
  lbImg.classList.remove('ready');
  lbImg.src = p.src;
  lbImg.alt = p.alt;
  lbImg.onload = () => lbImg.classList.add('ready');
  lbCap.textContent = `${p.seriesTitle} — ${pad(p.n)}`;
  lbCount.textContent = `${pad(idx + 1)} / ${pad(list.length)}`;
  preload(list[(idx + 1) % list.length]);
  preload(list[(idx - 1 + list.length) % list.length]);
}
function openLightbox(photos, i, from) {
  list = photos; idx = i; opener = from;
  renderLb();
  lb.hidden = false;
  requestAnimationFrame(() => lb.classList.add('on'));
  document.body.classList.add('locked');
  $('#lb-close').focus();
}
function closeLightbox() {
  lb.classList.remove('on');
  document.body.classList.remove('locked');
  setTimeout(() => { lb.hidden = true; }, 220);
  opener && opener.focus({ preventScroll: true });
}
const go = (d) => { idx = (idx + d + list.length) % list.length; renderLb(); };

$('#lb-close').addEventListener('click', closeLightbox);
$('#lb-prev').addEventListener('click', () => go(-1));
$('#lb-next').addEventListener('click', () => go(1));
lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lb-fig')) closeLightbox(); });
addEventListener('keydown', (e) => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowLeft') go(-1);
  else if (e.key === 'ArrowRight') go(1);
  else if (e.key === 'Tab') {
    // keep focus inside the dialog
    const f = [...lb.querySelectorAll('button')];
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
// Swipe
let sx = 0, sy = 0;
lb.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
lb.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeLightbox();
}, { passive: true });

/* ---------- Copy email ---------- */
const toast = $('#toast');
$('#copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(photographer.email);
    toast.textContent = 'Copied ✓';
  } catch {
    toast.textContent = 'Press Ctrl/⌘ + C to copy';
    const r = document.createRange(); r.selectNodeContents(mail);
    getSelection().removeAllRanges(); getSelection().addRange(r);
  }
  setTimeout(() => (toast.textContent = ''), 2200);
});
