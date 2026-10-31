/* ===== S.K. Wellala — motion layer: icons, click/hover effects, reveals, counters ===== */
(() => {
'use strict';
const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
const FINE = matchMedia('(pointer:fine)').matches;

/* ---------- Icon set (24px stroke icons) ---------- */
const P = {
leaf:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.6 5-7"/>',
dna:'<path d="M4 3c0 9 16 9 16 18M20 3c0 9-16 9-16 18M7.5 7h9M7.5 17h9"/>',
cap:'<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
trend:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
mobile:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
send:'<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/>',
pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
chat:'<path d="M21 12a8 8 0 0 1-11.7 7L3 21l2-5.5A8 8 0 1 1 21 12Z"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .6 3.2 2.3 3.5 5.2"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c.6-4 4-6 8-6s7.4 2 8 6"/>',
play:'<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4Z"/>',
clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
sparkle:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="M19 17v4M17 19h4"/>',
pencil:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
repeat:'<path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
medal:'<circle cx="12" cy="15" r="6"/><path d="m8.5 3 3.5 6 3.5-6M9 3h6"/>',
globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/>',
alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
hourglass:'<path d="M6 2h12M6 22h12M7 2c0 6 5 7 5 10s-5 4-5 10M17 2c0 6-5 7-5 10s5 4 5 10"/>',
wrench:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9Z"/>',
key:'<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M16 7l3 3"/>',
clipboard:'<rect x="5" y="3" width="14" height="19" rx="2"/><path d="M9 3h6v3H9ZM9 12h6M9 16h4"/>',
check:'<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
camera:'<path d="M3 8a2 2 0 0 1 2-2h2l2-3h6l2 3h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><circle cx="12" cy="13" r="4"/>',
image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
flask:'<path d="M9 2h6M10 2v6L4 20a1.5 1.5 0 0 0 1.3 2h13.4a1.5 1.5 0 0 0 1.3-2l-6-12V2M7 15h10"/>',
mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/>',
book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
chart:'<path d="M3 3v18h18"/><path d="M8 17v-6M13 17V7M18 17v-3"/>',
video:'<rect x="2" y="5" width="14" height="14" rx="2"/><path d="m22 8-6 4 6 4Z"/>',
inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
building:'<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 10h.01M15 10h.01"/>',
card:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
monitor:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'
};
const Z = (a, b) => String.fromCodePoint(a, 0x200D, b);
const M = {
'🌿':'leaf','🌱':'leaf','🍃':'leaf','🧬':'dna','🎓':'cap','📈':'trend','📄':'file','🔒':'lock','📱':'mobile',
'✈':'send','📍':'pin','📞':'phone','💬':'chat','✉':'mail','📘':'users','▶':'play','🕒':'clock','👋':'sparkle',
'✏':'pencil','🔁':'repeat','🔄':'repeat','🏆':'trophy','🥇':'rank:1','🥈':'rank:2','🥉':'rank:3',
'🏅':'medal','🌐':'globe','⚠':'alert','⏳':'hourglass','🔧':'wrench','🛠':'wrench','🔑':'key','📋':'clipboard',
'✅':'check','✔':'check','📅':'calendar','📷':'camera','🖼':'image','📝':'pencil','🔬':'flask','🎤':'mic',
'📚':'book','📊':'chart','📹':'video','📨':'inbox','⚙':'gear','🏫':'building','💳':'card','🎯':'target',
'☀':'sun','🌙':'moon','🔎':'search','📺':'monitor','📭':'inbox','🧑‍🏫':'user',
[Z(0x1F469,0x1F3EB)]:'user',[Z(0x1F9D1,0x1F3EB)]:'user',[Z(0x1F468,0x1F393)]:'users',[Z(0x1F468,0x2695)]:'heart'
};
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RE = new RegExp('(' + Object.keys(M).sort((a, b) => b.length - a.length).map(esc).join('|') + ')\\uFE0F?', 'gu');
const FB = /[\u{1F000}-\u{1FAFF}\uFE0F]/gu;   // any leftover emoji gets dropped
const GL = 'fill="#fff" fill-opacity=".3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const RANK = { 1:['#dc2626','g-gold','#5b3b00'], 2:['#3b5bdb','g-silver','#1f2937'], 3:['#0d9488','g-bronze','#4a2208'] };
const rank = k => { const r = RANK[k]; return `<span class="svgi free rank" aria-hidden="true"><svg viewBox="0 0 32 40"><path d="M8 0h7l5 15h-7zM24 0h-7l-5 15h7z" fill="${r[0]}"/><circle cx="16" cy="26" r="13" fill="url(#${r[1]})"/><circle cx="16" cy="26" r="9.6" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/><text x="16" y="31" text-anchor="middle" font-size="14" font-weight="800" fill="${r[2]}" font-family="Inter,sans-serif">${k}</text></svg></span>`; };
const nbadge = k => `<span class="svgi free rank" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="url(#g-green)"/><circle cx="16" cy="16" r="11" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/><text x="16" y="${k > 99 ? 19.5 : 21}" text-anchor="middle" font-size="${k > 99 ? 10 : k > 9 ? 12 : 14}" font-weight="800" fill="#fff" font-family="Inter,sans-serif">${k}</text></svg></span>`;
const CUP = '<span class="svgi free" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M18 6h28v16c0 9-6 15-14 15S18 31 18 22Z" fill="url(#g-gold)"/><path d="M18 12H8c0 9 4 14 11 15M46 12h10c0 9-4 14-11 15" fill="none" stroke="url(#g-gold)" stroke-width="4" stroke-linecap="round"/><path d="M28 36h8v10h-8z" fill="url(#g-gold)"/><path d="M20 50h24l3 8H17z" fill="url(#g-bronze)"/><path d="M23 10h5v12c0 5 2 8 4 10-6-1-9-6-9-12Z" fill="#fff" fill-opacity=".4"/></svg></span>';
const icon = (key, ctx) => {
  let [n, c] = key.split(':');
  if (n === 'rank') { if (ctx && ctx.closest('.marq-item')) return rank(+c); n = 'trophy'; }
  if (n === 'trophy' && ctx && ctx.closest('.ma-trophy')) return CUP;
  return `<span class="svgi n-${n}" aria-hidden="true"><svg viewBox="0 0 24 24" ${GL}>${P[n]}</svg></span>`;
};
const SKIP = /^(SCRIPT|STYLE|TEXTAREA|OPTION|SELECT|INPUT|TITLE|SVG|NOSCRIPT)$/;

function swap(node) {
  const s = node.nodeValue;
  RE.lastIndex = 0;
  if (!RE.test(s) && !(FB.lastIndex = 0, FB.test(s))) return;
  const frag = document.createDocumentFragment();
  let last = 0, m; RE.lastIndex = 0; FB.lastIndex = 0;
  const txt = t => document.createTextNode(t.replace(FB, ''));
  while ((m = RE.exec(s))) {
    if (m.index > last) frag.append(txt(s.slice(last, m.index)));
    const t = document.createElement('template'); t.innerHTML = icon(M[m[1]] || M[m[1].replace(/\uFE0F/g, '')], node.parentElement);
    frag.append(t.content); last = RE.lastIndex;
  }
  frag.append(txt(s.slice(last)));
  node.replaceWith(frag);
}
function icons(root) {
  if (root.nodeType === 3) { if (root.parentElement && !root.parentElement.closest('.svgi,.bgfx') && !SKIP.test(root.parentElement.tagName.toUpperCase())) swap(root); return; }
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => {
    const p = n.parentElement;
    return !p || SKIP.test(p.tagName.toUpperCase()) || p.closest('.svgi,.bgfx') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
  const list = []; while (w.nextNode()) list.push(w.currentNode);
  list.forEach(swap);
}

/* ---------- Reveal on scroll + count-up ---------- */
const RV = '.lp-trust,.lp .kicker,.lp h2.sec,.lp .sec-sub,.class-card,.tg-card,.feat,.c-item,.teacher-photo,.teacher-copy,.portal-banner,.foot-grid>*,#centers div[style*="box-shadow"]';
const CT = '.lp-hero-stats strong,.stat .num,.ma-best-mark';
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target; io.unobserve(el);
  if (el.classList.contains('rv')) { el.classList.add('in'); setTimeout(() => { el.classList.remove('rv', 'in'); el.style.transitionDelay = ''; }, 1100); }
  else count(el);
}), { threshold: .15 });
function count(el) {
  if (el.dataset.c) return; el.dataset.c = 1;
  const t = el.textContent.trim(), m = t.match(/^(\d+(?:\.\d+)?)(.*)$/); if (!m) return;
  const to = parseFloat(m[1]), dec = (m[1].split('.')[1] || '').length, t0 = performance.now();
  (function f(n) { const k = Math.min(1, (n - t0) / 1100), e = 1 - Math.pow(1 - k, 3);
    el.textContent = k < 1 ? (to * e).toFixed(dec) + m[2] : t; if (k < 1) requestAnimationFrame(f); })(t0);
}
const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting)
  document.querySelectorAll('.nav-link').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }),
  { rootMargin: '-40% 0px -55% 0px' });
const seen = new WeakSet();

function enhance(root) {
  if (root.nodeType !== 1) return;
  root.querySelectorAll('.face:not([data-i])').forEach(f => {            // initials instead of animal faces
    const b = f.parentElement.querySelector('b'), name = (b ? b.textContent : '').replace(/^\s*#\d+\s*/, '').trim();
    f.textContent = (name[0] || '?').toUpperCase(); f.dataset.i = 1; });
  root.querySelectorAll('.marq-item b:not([data-r])').forEach(b => {    // rank badges for #4, #5 ...
    b.dataset.r = 1; const t = b.firstChild;
    if (t && t.nodeType === 3) { const m = t.nodeValue.match(/^\s*#(\d+)\s*/);
      if (m) { const tp = document.createElement('template'); tp.innerHTML = nbadge(+m[1]); t.nodeValue = t.nodeValue.slice(m[0].length); b.prepend(tp.content); } } });
  if (RM) return;
  root.querySelectorAll(CT).forEach(el => { if (!seen.has(el)) { seen.add(el); io.observe(el); } });
  root.querySelectorAll(RV).forEach(el => {
    if (seen.has(el)) return; seen.add(el);
    const i = [...el.parentElement.children].indexOf(el);
    el.classList.add('rv'); el.style.transitionDelay = (i % 6) * 70 + 'ms'; io.observe(el); });
  root.querySelectorAll('.lp section[id]').forEach(s => { if (!seen.has(s)) { seen.add(s); spy.observe(s); } });
}

/* ---------- Watch the DOM (the app re-renders constantly) ---------- */
const queue = new Set(); let raf = 0;
const flush = () => { raf = 0; queue.forEach(n => { if (n.isConnected) { icons(n); enhance(n); } }); queue.clear(); };
new MutationObserver(ms => {
  ms.forEach(m => { m.addedNodes.forEach(n => queue.add(n)); if (m.type === 'characterData') queue.add(m.target); });
  if (!raf) raf = requestAnimationFrame(flush);
}).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
const stops = c => c.map((x, i) => `<stop offset="${[0, .5, 1][i]}" stop-color="${x}"/>`).join('');
document.body.insertAdjacentHTML('beforeend', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
  [['g-gold', ['#fff1b8', '#e2bd5c', '#b8861f']], ['g-silver', ['#ffffff', '#cbd5e1', '#8392a5']], ['g-bronze', ['#ffd9b0', '#d98b4a', '#9a5320']], ['g-green', ['#5eead4', '#14a37f', '#0b6b4a']]]
    .map(([id, c]) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${stops(c)}</linearGradient>`).join('') + '</defs></svg>');
queue.add(document.body); flush();

/* ---------- Hover spotlight that follows the cursor ---------- */
if (FINE && !RM) {
  const SPOT = '.card,.class-card,.feat,.c-item,.tg-card,.stat,.pdfcard'; let pend = null;
  document.addEventListener('pointermove', e => {
    const t = e.target.closest && e.target.closest(SPOT); if (!t) return;
    if (pend) return; pend = requestAnimationFrame(() => { pend = null; const r = t.getBoundingClientRect();
      t.style.setProperty('--mx', e.clientX - r.left + 'px'); t.style.setProperty('--my', e.clientY - r.top + 'px'); });
  }, { passive: true });
}

/* ---------- Header shadow on scroll ---------- */
addEventListener('scroll', () => { const h = document.querySelector('header'); if (h) h.classList.toggle('scrolled', scrollY > 8); }, { passive: true });
})();
