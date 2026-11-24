/* features.js - add-on file for Class Analyzer. Upload next to index.html.
   index.html announces events; this file listens and adds things to the page.
   Everything lives inside one function so names cannot clash with index.html. */
(function () { 
  'use strict';
  if (window.__featuresLoaded) return;
  window.__featuresLoaded = true;

  /* ---------- helpers ---------- */
  const $ = id => document.getElementById(id);
  const safe = (name, fn) => { try { fn(); } catch (e) { console.error('[features] ' + name + ' failed:', e); } };
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const escHtml = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const greet = () => { const h = new Date().getHours(); return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night'; };

  /* one shared timer; every watcher runs inside try/catch */
  const watchers = [];
  const addWatcher = (name, fn) => watchers.push([name, fn]);
  setInterval(() => watchers.forEach(([n, f]) => safe(n, f)), 350);

  /* ---------- YouTube: id extraction + in-app player ---------- */
  function extractYtId(u) {
    const s = String(u || '');
    const m = s.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/|img\.youtube\.com\/vi\/|i\.ytimg\.com\/vi(?:_webp)?\/|i\d?\.ytimg\.com\/vi(?:_webp)?\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    return /^[A-Za-z0-9_-]{11}$/.test(s.trim()) ? s.trim() : '';
  }
  window.extractYtId = extractYtId;

  safe('yt-player', () => {
    const css = document.createElement('style');
    css.textContent = `
.yt-modal{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center}
.yt-modal.open{display:flex}
.yt-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.7)}
.yt-dialog{position:relative;width:min(900px,94vw);background:var(--card,#fff);color:var(--ink,#111);border-radius:14px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.yt-head{display:flex;align-items:center;gap:12px;padding:10px 14px}
.yt-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.yt-ext{font-size:.8rem;white-space:nowrap}
.yt-close{border:0;background:transparent;color:inherit;cursor:pointer;display:grid;place-items:center;padding:4px}
.yt-frame-wrap{position:relative;width:100%;aspect-ratio:16/9;background:#000}
.yt-frame,.yt-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
body.yt-locked{overflow:hidden}
#stuVideos .pdfcard,#stuVideos .pdfcard *,#stuVideos [data-yt-id],#stuVideos [data-yt-id] *{cursor:pointer;-webkit-tap-highlight-color:transparent}`;
    document.head.appendChild(css);

    let modal = null;
    function ensureModal() {
      if (modal && document.body.contains(modal)) return modal;
      modal = document.createElement('div');
      modal.id = 'ytModal';
      modal.className = 'yt-modal';
      modal.innerHTML =
        '<div class="yt-backdrop" data-yt-close></div>' +
        '<div class="yt-dialog" role="dialog" aria-modal="true" aria-label="Video player">' +
        '<div class="yt-head"><b class="yt-title"></b>' +
        '<a class="yt-ext" href="#" target="_blank" rel="noopener">Open in YouTube \u2197</a>' +
        '<button type="button" class="yt-close" data-yt-close aria-label="Close">' +
        '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button></div><div class="yt-frame-wrap"><div class="yt-frame"></div></div></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if (e.target.closest('[data-yt-close]')) close(); });
      return modal;
    }
    function close() {
      if (!modal) return;
      modal.classList.remove('open');
      document.body.classList.remove('yt-locked');
      const f = modal.querySelector('.yt-frame');
      if (f) f.innerHTML = '';
    }
    function open(id, title) {
      const vid = String(id || '').trim();
      if (!/^[A-Za-z0-9_-]{11}$/.test(vid)) return;
      ensureModal();
      const label = (title || 'Video').trim();
      modal.querySelector('.yt-title').textContent = label;
      modal.querySelector('.yt-ext').href = 'https://www.youtube.com/watch?v=' + vid;
      modal.querySelector('.yt-frame').innerHTML =
        '<iframe src="https://www.youtube.com/embed/' + vid + '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="' + escHtml(label) + '" ' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
        'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
      modal.classList.add('open');
      document.body.classList.add('yt-locked');
    }
    window.openYtPlayer = open;
    window.closeYtPlayer = close;

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal && modal.classList.contains('open')) close();
    });

    document.addEventListener('click', e => {
      const t = e.target instanceof Element ? e.target : null;
      if (!t || t.closest('#ytModal')) return;
      /* every YouTube id that a node (or anything inside it) points to */
      const idsIn = node => {
        const set = new Set();
        [node].concat(Array.from(node.querySelectorAll('*'))).forEach(x => {
          const d = x.dataset || {};
          [d.ytId, d.videoId, extractYtId(x.getAttribute('href') || ''), extractYtId(x.getAttribute('src') || ''),
           extractYtId(x.getAttribute('onclick') || '')].forEach(v => { if (v) set.add(v); });
        });
        return set;
      };

      /* Walk up from the exact spot that was touched (image, title, text, padding)
         until we reach the smallest box that holds exactly one video: that box is the card. */
      let card = null, id = '';
      const scope = t.closest('#stuVideos, #stuPane');
      const marked = t.closest('[data-yt-id], [data-video-id]');
      if (marked) { card = marked; id = marked.dataset.ytId || marked.dataset.videoId; }
      else if (scope) {
        for (let n = t; n && n !== scope.parentElement; n = n.parentElement) {
          const s = idsIn(n);
          if (s.size === 1) { card = n; id = Array.from(s)[0]; break; }
          if (s.size > 1) {
            /* Flat layout: thumbnails and text are siblings with no wrapper per video.
               Pick the video box nearest to the spot that was touched. */
            let best = null, bd = Infinity;
            Array.from(n.children).filter(c => idsIn(c).size === 1).forEach(c => {
              const r = c.getBoundingClientRect();
              const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
              const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
              const d = Math.hypot(dx, dy);
              if (d < bd) { bd = d; best = c; }
            });
            if (best && bd < 160) { card = best; id = Array.from(idsIn(best))[0]; }
            break;
          }
        }
        /* if the touch landed on a whole-card link that held one video, climb to the card wrapper for the title */
        if (card) card = card.closest('.pdfcard') || card;
      }
      if (!card || !id) return;

      e.preventDefault();
      const title = (card.dataset.title || (card.querySelector('.pt, .title, b, strong') || {}).textContent ||
        (t.closest('.pt, .title, b, strong') || {}).textContent || card.getAttribute('title') || 'Video').trim();
      if (typeof window.openYtWatch === 'function') window.openYtWatch(id, title); else open(id, title);
    }, true);
  });

  /* ---------- Harden video cards: strip hrefs so mobile cannot navigate ---------- */
  safe('harden', () => {
    const cardTitle = el => ((el.querySelector('.pt, .title, b, strong') || {}).textContent || '').trim();

    function elevate(el, id, title) {
      const card = el.closest('.pdfcard') || el;
      if (!card.dataset.ytId) card.dataset.ytId = id;
      if (title && !card.dataset.title) card.dataset.title = title;
      card.style.cursor = 'pointer';
      if (el !== card) {
        if (!el.dataset.ytId) el.dataset.ytId = id;
        if (title && !el.dataset.title) el.dataset.title = title;
      }
    }

    function harden(root) {
      root.querySelectorAll('a[href]').forEach(a => {
        const id = extractYtId(a.getAttribute('href') || '');
        if (!id) return;
        elevate(a, id, cardTitle(a));
        a.removeAttribute('href'); a.removeAttribute('target'); a.removeAttribute('rel');
        a.style.cursor = 'pointer';
      });
      root.querySelectorAll('[onclick]').forEach(el => {
        const m = (el.getAttribute('onclick') || '').match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([A-Za-z0-9_-]{11})/);
        if (!m) return;
        elevate(el, m[1], cardTitle(el));
        el.removeAttribute('onclick');
      });
      root.querySelectorAll('.pdfcard').forEach(card => {
        if (card.dataset.ytId) return;
        const img = card.querySelector('img[src*="youtube"], img[src*="ytimg"]');
        const id = img ? extractYtId(img.getAttribute('src') || '') : '';
        if (!id) return;
        card.dataset.ytId = id;
        card.dataset.title = cardTitle(card) || 'Video';
        card.style.cursor = 'pointer';
      });
    }

    addWatcher('harden', () => {
      const v = $('stuVideos');
      if (v && v.querySelector('a[href*="youtu"], [onclick*="youtu"], .pdfcard:not([data-yt-id])')) harden(v);
    });
  });

  /* ---------- Rank cache ---------- */
  let rankCache = { t: 0, v: null };
  async function getRanks() {
    if (rankCache.v && Date.now() - rankCache.t < 60000) return rankCache.v;
    try { rankCache = { t: Date.now(), v: await window.CA.myRanks() }; }
    catch (e) { rankCache = { t: Date.now(), v: {} }; }
    return rankCache.v;
  }

  /* ---------- Student dashboard: greeting, summary, ranks ---------- */
  document.addEventListener('ca:student-marks', e => {
    const { rows, name } = e.detail, body = $('stuBody');
    if (!body) return;
    if (rows.length) {
      safe('summary', () => addSummary(rows, body));
      addRankWidget(rows).catch(err => console.error('[features] rank widget:', err));
      addRankColumn(rows).catch(err => console.error('[features] rank column:', err));
    }
    safe('welcome', () => addWelcome(name, rows.length, body));
  });

  function addSummary(rows, body) {
    const { esc, grade, gCls } = window.CA;
    const avg = Math.round(rows.reduce((a, r) => a + r.pct, 0) / rows.length * 10) / 10;
    const sorted = rows.slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
    const last = sorted[sorted.length - 1], prev = sorted[sorted.length - 2];
    const diff = prev ? Math.round((last.pct - prev.pct) * 10) / 10 : null;
    const trend = diff == null ? '\u2014' : diff > 0 ? '\u25b2 +' + diff + '%' : diff < 0 ? '\u25bc ' + diff + '%' : '\uff1d no change';
    const tile = (label, value, sub) =>
      '<div style="flex:1;min-width:150px;padding:12px;border:1px solid var(--line);border-radius:12px">' +
      '<div class="sub" style="margin:0">' + label + '</div><div style="font-size:1.35rem;font-weight:800;margin:2px 0">' + value + '</div>' +
      '<div class="sub" style="margin:0">' + sub + '</div></div>';
    $('sumCard')?.remove();
    const card = document.createElement('div');
    card.className = 'card'; card.id = 'sumCard';
    card.innerHTML = '<h2>\u2b50 Your Summary</h2><div style="display:flex;gap:10px;flex-wrap:wrap">' +
      tile('Average', avg + '%', '<span class="pill ' + gCls(avg) + '">Grade ' + grade(avg) + '</span>') +
      tile('Papers sat', rows.length, 'published so far') +
      tile('Latest paper', last.pct + '%', esc(last.title) + ' \u00b7 ' + trend) + '</div>';
    body.prepend(card);
  }

  function addWelcome(name, n, body) {
    const { esc } = window.CA;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = '<h2>\ud83d\udc4b ' + greet() + ', ' + esc(name) + '!</h2>' +
      (n ? '' : '<p class="sub" style="margin:6px 0 0">\ud83d\udccc No marks yet. When your teacher publishes a paper, your progress chart, summary and paper-by-paper marks will appear here automatically.</p>');
    body.prepend(card);
  }

  /* rank of the latest paper whose ranks were released (top 100 only) */
  async function addRankWidget(rows) {
    const r = await getRanks(), { esc } = window.CA;
    $('rankWidget')?.remove();
    const released = rows.filter(x => has(r, x.pid)).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
    const latest = released[released.length - 1];
    if (!latest || !r[latest.pid]) return;
    const sum = $('sumCard'); if (!sum) return;
    const w = document.createElement('div');
    w.id = 'rankWidget'; w.className = 'card';
    w.style.cssText = 'background:linear-gradient(135deg,var(--brand),var(--brand2));color:#fff;border:0;display:flex;align-items:center;gap:18px;flex-wrap:wrap';
    w.innerHTML = '<div style="font-size:3rem;line-height:1">\ud83c\udfc5</div><div style="flex:1;min-width:180px"><div style="opacity:.9;font-size:.85rem">Your rank - ' + esc(latest.title) +
      '</div><div style="font-size:2.2rem;font-weight:800;line-height:1.1">#' + r[latest.pid] + '</div><div style="opacity:.9;font-size:.82rem">You are in the top 150 across all centers</div></div>';
    sum.insertAdjacentElement('afterend', w);
  }

  /* Rank column in the Paper-by-Paper table and under each bar */
  async function addRankColumn(rows) {
    const r = await getRanks();
    if (!rows.some(x => has(r, x.pid))) return;
    const body = $('stuBody'); if (!body) return;
    const rk = x => (has(r, x.pid) && r[x.pid]) ? '<span class="pill brand">#' + r[x.pid] + '</span>' : '<span class="sub" style="margin:0">-</span>';
    const card = Array.from(body.querySelectorAll('.card')).find(c => /Paper-by-Paper/i.test((c.querySelector('h2') || {}).textContent || ''));
    const table = card && card.querySelector('table');
    if (table && !table.dataset.rk) {
      table.dataset.rk = '1';
      const trs = Array.from(table.querySelectorAll('tr')), head = trs[0];
      const hasRankTh = head && Array.from(head.children).some(th => /rank/i.test(th.textContent || ''));
      if (!hasRankTh) {
        if (head) head.insertAdjacentHTML('beforeend', '<th>Rank</th>');
        trs.slice(1).forEach((tr, i) => { if (rows[i]) tr.insertAdjacentHTML('beforeend', '<td>' + rk(rows[i]) + '</td>'); });
      }
    }
    body.querySelectorAll('.gb-row').forEach((row, i) => {
      const foot = row.querySelector('.gb-foot span');
      if (foot && rows[i] && !foot.dataset.rk && r[rows[i].pid]) { foot.dataset.rk = '1'; foot.insertAdjacentHTML('beforeend', ' &middot; Rank #' + r[rows[i].pid]); }
    });
  }

  /* ---------- Blue and white theme (delete this block to go back to green) ---------- */
  safe('theme', () => {
    const blue = document.createElement('style');
    blue.textContent = `
:root[data-theme="light"]{--bg:#f3f8fd;--ink:#0f2438;--muted:#5b7186;--line:#dde8f3;--brand:#1d4ed8;--brand2:#0ea5e9;--brand-soft:#e6f0fd;--brand-bg:#e6f0fd;--shadow:0 8px 28px rgba(30,70,140,.10)}
[data-theme="dark"]{--bg:#09121f;--card:#101e33;--ink:#e6eef8;--muted:#8fa6c0;--line:#1d3350;--brand:#60a5fa;--brand2:#38bdf8;--brand-soft:#17325a;--brand-bg:#17325a}
.hero.photo{background:linear-gradient(rgba(8,30,70,var(--tint-a)),rgba(8,30,70,var(--tint-b))),url('hero-photo.jpg') center/cover no-repeat,linear-gradient(135deg,#1d4ed8,#0ea5e9)}
.side{background:linear-gradient(rgba(8,30,70,var(--tint-a)),rgba(8,30,70,var(--tint-b))),url('signup-photo.jpg') center/cover no-repeat,linear-gradient(135deg,#1d4ed8,#0ea5e9)}`;
    document.head.appendChild(blue);
  });

  /* ---------- Remove student verification (teacher verification stays) ---------- */
  safe('verification', () => {
    const hide = document.createElement('style');
    hide.textContent = '[data-ver],#svVer{display:none!important}';
    document.head.appendChild(hide);
    const clean = () => {
      document.querySelectorAll('button').forEach(b => {
        const t = b.textContent.trim();
        if ((t === 'Verify' || t === 'Unverify') && !b.hasAttribute('data-tv') && !b.hasAttribute('data-etv') && !b.hasAttribute('data-atv')) b.remove();
      });
      document.querySelectorAll('span').forEach(el => {
        const t = el.textContent.trim();
        if (t === '\u00b7 not verified' || t === '\u00b7 pending verification') { el.remove(); return; }
        if (!el.classList.contains('vbadge')) return;
        const inStudentRow = el.closest('td')?.querySelector('a.nl');
        const del = $('svDel');
        const prev = el.previousElementSibling;
        const ownHeader = prev && prev.classList.contains('pill') && /Student/.test(prev.textContent);
        if (inStudentRow || ownHeader || (del && el.closest('.card')?.contains(del))) el.remove();
      });
    };
    let queued = false;
    new MutationObserver(() => {
      if (queued) return; queued = true;
      requestAnimationFrame(() => { queued = false; safe('verification-clean', clean); });
    }).observe(document.documentElement, { childList: true, subtree: true });
    clean();
  });

  /* ---------- Teacher / developer sidebar, Profile page, loading animation ---------- */
  safe('sidebar', () => {
    const st = document.createElement('style');
    st.textContent = `
main#app.wide{max-width:1280px}
.dash-layout{display:grid;grid-template-columns:250px minmax(0,1fr);gap:20px;align-items:start}
.sidebar{position:sticky;top:84px;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:14px}
.sidebar .tabs{flex-direction:column;flex-wrap:nowrap;margin:0;gap:4px}
.sidebar .tabs button{border:0;background:transparent;border-radius:12px;text-align:left;padding:11px 14px;width:100%}
.sidebar .tabs button:hover{background:var(--brand-soft);color:var(--brand)}
.sidebar .tabs button.active{background:var(--brand);color:#fff}
.side-user{display:flex;gap:10px;align-items:center;padding:6px 6px 14px;margin-bottom:10px;border-bottom:1px solid var(--line);cursor:pointer}
.side-user .av{width:42px;height:42px;border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center;font-weight:800;font-size:1.1rem;flex:none}
.side-user b{display:block;font-size:.9rem;line-height:1.2}.side-user small{color:var(--muted);font-size:.74rem}
.dash-main{min-width:0}
.sidebar{max-height:calc(100vh - 104px);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain}
.sidebar,.sidebar .tabs{scrollbar-width:thin;scrollbar-color:transparent transparent;transition:scrollbar-color .3s}
.sidebar.is-scrolling,.sidebar .tabs.is-scrolling{scrollbar-color:rgba(100,130,170,.6) transparent}
.sidebar::-webkit-scrollbar,.sidebar .tabs::-webkit-scrollbar{width:6px;height:6px}
.sidebar::-webkit-scrollbar-track,.sidebar .tabs::-webkit-scrollbar-track{background:transparent}
.sidebar::-webkit-scrollbar-thumb,.sidebar .tabs::-webkit-scrollbar-thumb{background:transparent;border-radius:999px}
.sidebar.is-scrolling::-webkit-scrollbar-thumb,.sidebar .tabs.is-scrolling::-webkit-scrollbar-thumb{background:rgba(100,130,170,.6)}
@media (max-width:900px){
  .dash-layout{display:block}
  .sidebar{position:static;max-height:none;overflow:visible;margin-bottom:14px;padding:10px}
  .sidebar .tabs{flex-direction:row;overflow-x:auto;padding-bottom:4px}
  .sidebar .tabs button{width:auto;white-space:nowrap;border:1.5px solid var(--line);border-radius:999px;padding:8px 16px}
  .side-user{display:none}
}
#loading{background:rgba(8,30,70,.55)}
#loading .spinner{display:none}
.ld-box{display:flex;flex-direction:column;align-items:center;gap:14px}
.dna{display:flex;gap:7px;height:70px;align-items:stretch}
.dna i{position:relative;width:10px}
.dna i::before,.dna i::after{content:'';position:absolute;left:0;width:10px;height:10px;border-radius:50%;animation:helixA 1.3s ease-in-out infinite}
.dna i::before{top:0;background:#38bdf8;animation-delay:calc(var(--i)*-.13s)}
.dna i::after{bottom:0;background:#fff;animation-name:helixB;animation-delay:calc(var(--i)*-.13s)}
@keyframes helixA{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(60px) scale(.55)}}
@keyframes helixB{0%,100%{transform:translateY(0) scale(.55)}50%{transform:translateY(-60px) scale(1)}}
.ld-txt{color:#fff;font-weight:700;letter-spacing:.12em;font-size:.8rem;animation:ldpulse 1.3s ease-in-out infinite}
@keyframes ldpulse{50%{opacity:.45}}`;
    document.head.appendChild(st);

    /* show the sidebar scrollbar only while it is being scrolled */
    document.addEventListener('scroll', e => {
      const el = e.target;
      if (!(el instanceof Element) || !(el.matches('.sidebar, .sidebar .tabs'))) return;
      el.classList.add('is-scrolling');
      clearTimeout(el.__sbTimer);
      el.__sbTimer = setTimeout(() => el.classList.remove('is-scrolling'), 800);
    }, true);

    const profileTab = {
      id: 'profile', label: '\ud83d\udc64 Profile',
      render: ({ el }) => {
        const CA = window.CA, esc = CA.esc, p = CA.profile || {};
        const row = (k, v) => '<div style="padding:10px 0;border-bottom:1px solid var(--line)"><div class="sub" style="margin:0">' + k + '</div><b>' + esc(v || '-') + '</b></div>';
        const show = () => {
          el.innerHTML = '<div class="card" style="max-width:640px"><div style="display:flex;gap:14px;align-items:center;margin-bottom:8px">' +
            '<div class="side-user" style="border:0;padding:0;margin:0;cursor:default"><div class="av" style="width:64px;height:64px;font-size:1.6rem">' + esc((p.fullName || '?').trim().charAt(0).toUpperCase()) + '</div></div>' +
            '<div><h2 style="margin:0">' + esc(p.fullName || '') + '</h2><span class="pill brand">' + (p.isAdmin ? 'Developer' : 'Teacher') + '</span>' +
            (p.nickname ? ' <span class="sub" style="display:inline">"' + esc(p.nickname) + '"</span>' : '') + '</div></div>' +
            row('Email', p.email) + row('Gender', p.gender) + row('Phone', p.phone) + row('Institute / School', p.institute) +
            row('Attended Class', p.className) + row('Exam center', p.center) +
            '<button class="btn btn-primary" id="pfEdit" style="width:auto;margin-top:14px">Edit details</button></div>';
          $('pfEdit').onclick = edit;
        };
        const edit = () => {
          el.innerHTML = '<div class="card" style="max-width:640px"><h2>Edit my details</h2>' +
            '<label>Full name</label><input id="pf_n" value="' + esc(p.fullName || '') + '">' +
            '<label>Phone number</label><input id="pf_p" type="tel" value="' + esc(p.phone || '') + '">' +
            '<label>Institute / School</label><input id="pf_i" value="' + esc(p.institute || '') + '">' +
            '<label>Attended Class</label><input id="pf_c" value="' + esc(p.className || '') + '">' +
            '<div class="row" style="margin-top:14px"><button class="btn btn-primary" id="pf_s" style="width:auto">Save</button><button class="btn btn-ghost" id="pf_x" style="width:auto">Cancel</button></div><div id="pf_m"></div></div>';
          $('pf_x').onclick = show;
          $('pf_s').onclick = async () => {
            const d = { fullName: $('pf_n').value.trim(), phone: $('pf_p').value.trim(), institute: $('pf_i').value.trim(), className: $('pf_c').value.trim() };
            if (d.fullName.length < 3) { $('pf_m').innerHTML = '<div class="err">Please enter your full name.</div>'; return; }
            CA.busy(true);
            try {
              await CA.fs.updateDoc(CA.fs.doc(CA.db, 'teachers', CA.user.uid), d);
              Object.assign(p, d); CA.busy(false); show();
            } catch (e) {
              CA.busy(false);
              $('pf_m').innerHTML = '<div class="err">' + esc(CA.friendly ? CA.friendly(e) : e.message) + '</div>';
            }
          };
        };
        show();
      }
    };

    addWatcher('sidebar', () => {
      /* custom loader */
      const L = $('loading');
      if (L && !L.querySelector('.dna')) {
        L.insertAdjacentHTML('beforeend', '<div class="ld-box"><div class="dna">' +
          Array.from({ length: 12 }, (_, i) => '<i style="--i:' + i + '"></i>').join('') + '</div><div class="ld-txt">LOADING</div></div>');
      }

      const CA = window.CA; if (!CA || !CA.tabs) return;

      /* add the Profile tab once; redraw if the dashboard is already on screen */
      if (!CA.tabs.some(t => t.id === 'profile')) {
        CA.tabs.push(profileTab);
        if ($('tabBody') && CA.refresh) CA.refresh();
        return;
      }

      const app = $('app'); if (!app) return;
      const first = $('tabBody') && app.querySelector('[data-tab]');
      if (!first) { app.classList.remove('wide'); return; }
      const nav = first.parentElement;
      if (nav.closest('.dash-layout')) { app.classList.add('wide'); return; }

      const p = CA.profile || {}, esc = CA.esc;
      const layout = document.createElement('div'); layout.className = 'dash-layout';
      const aside = document.createElement('aside'); aside.className = 'sidebar';
      const main = document.createElement('div'); main.className = 'dash-main';
      Array.from(app.children).forEach(c => { if (c !== nav) main.appendChild(c); });

      const who = document.createElement('div'); who.className = 'side-user';
      who.innerHTML = '<div class="av">' + esc((p.fullName || '?').trim().charAt(0).toUpperCase()) + '</div><div><b>' + esc(p.fullName || '') + '</b><small>' +
        (p.isAdmin ? 'Developer' : 'Teacher') + (p.center ? ' \u00b7 ' + esc(p.center) : '') + '</small></div>';

      /* find the profile button whether its data-tab is "profile" or "x_profile" */
      const prof = Array.from(nav.querySelectorAll('[data-tab]')).find(b => /(^|_)profile$/.test(b.getAttribute('data-tab')));
      who.onclick = () => { if (prof) prof.click(); };
      if (prof) nav.prepend(prof);

      aside.append(who, nav); layout.append(aside, main); app.appendChild(layout); app.classList.add('wide');
    });
  });

  /* ---------- Marks tab: paper picker + quick student search ---------- */
  safe('marks', () => {
    addWatcher('marks', () => {
      const pane = $('marksPane'), body = $('tabBody');
      if (!pane || !body) return;

      /* 1) "Choose paper" list at the top of the Marks tab */
      const rows = Array.from(body.querySelectorAll('.paper-row'));
      if (rows.length && !$('paperPick')) {
        const opts = rows.map(r => {
          const btn = r.querySelector('[data-open]'); if (!btn) return '';
          const name = (r.querySelector('b') || {}).textContent || 'Paper';
          const sub = (r.querySelector('.sub') || {}).textContent || '';
          const d = (sub.split('\u00b7')[0] || '').trim();
          return '<option value="' + escHtml(btn.dataset.open) + '">' + escHtml(name) + (d ? '  (' + escHtml(d) + ')' : '') + '</option>';
        }).join('');
        const card = document.createElement('div');
        card.className = 'card'; card.id = 'paperPickCard';
        card.innerHTML = '<label style="margin-top:0">Choose paper to enter marks</label><select id="paperPick"><option value="">- Select a paper -</option>' + opts + '</select>';
        body.prepend(card);
        const pick = $('paperPick');
        if (window.CA && window.CA.state && window.CA.state.selPaper) pick.value = window.CA.state.selPaper;
        pick.onchange = () => {
          const b = Array.from(body.querySelectorAll('[data-open]')).find(x => x.dataset.open === pick.value);
          if (b) b.click(); else pane.innerHTML = '';
        };
      }

      /* 2) search box above the marks table */
      const wrap = pane.querySelector('.tbl-wrap');
      if (wrap && !$('mkSearch')) {
        const bar = document.createElement('div');
        bar.style.cssText = 'display:flex;gap:10px;align-items:center;margin:4px 0 12px;flex-wrap:wrap';
        bar.innerHTML = '<input id="mkSearch" placeholder="Search by name, NIC or barcode - press Enter to type the mark" style="flex:1;min-width:220px" autocomplete="off"><span id="mkCount" class="sub" style="margin:0"></span>';
        wrap.parentNode.insertBefore(bar, wrap);
        const input = $('mkSearch'), count = $('mkCount');
        const trs = () => Array.from(pane.querySelectorAll('tr')).filter(tr => tr.querySelector('[data-mk]'));
        const filter = () => {
          const q = input.value.trim().toLowerCase(); let n = 0;
          trs().forEach(tr => { const show = !q || tr.textContent.toLowerCase().includes(q); tr.style.display = show ? '' : 'none'; if (show) n++; });
          count.textContent = q ? n + (n === 1 ? ' match' : ' matches') : '';
        };
        input.addEventListener('input', filter);
        input.addEventListener('keydown', e => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          const first = trs().find(tr => tr.style.display !== 'none');
          const m = first && first.querySelector('[data-mk]');
          if (m) { m.focus(); m.select(); }
        });
        /* Enter in a mark box saves it and jumps back to search */
        trs().forEach(tr => {
          const m = tr.querySelector('[data-mk]');
          if (!m || m.dataset.ent) return;
          m.dataset.ent = '1';
          m.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            e.preventDefault(); m.blur(); input.value = ''; filter(); input.focus();
          });
        });
        input.focus();
      }
    });
  });

  /* ---------- Marks Analyze UI: gradient chart + My Best + grade bars ---------- */
  safe('analyze', () => {
    const css = document.createElement('style');
    css.textContent = `
.ma-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:22px;align-items:stretch}
@media(max-width:820px){.ma-grid{grid-template-columns:1fr}}
.ma-best{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;padding:6px 0}
.ma-trophy{font-size:4.2rem;line-height:1;animation:maBounce 1.8s ease-in-out infinite;filter:drop-shadow(0 10px 18px rgba(255,190,0,.45))}
@keyframes maBounce{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-10px) scale(1.06)}}
@media (prefers-reduced-motion:reduce){.ma-trophy{animation:none}}
.ma-best-title{font-weight:800;font-size:1rem}
.ma-best-mark{font-size:1.7rem;font-weight:800;color:var(--brand)}
.ma-mini{display:flex;gap:10px;width:100%;margin-top:10px}
.ma-mini>div{flex:1;background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:10px 6px}
.ma-mini .n{font-weight:800;font-size:1.02rem}
.ma-mini .l{font-size:.7rem;color:var(--muted);margin-top:2px}
.gb-row{padding:12px 0;border-bottom:1px solid var(--line)}
.gb-row:last-child{border-bottom:none}
.gb-head{display:flex;justify-content:space-between;gap:10px;align-items:baseline;margin-bottom:6px}
.gb-title{font-weight:700;font-size:.9rem}
.gb-date{color:var(--muted);font-size:.74rem;white-space:nowrap}
.gb-track{height:14px;border-radius:999px;background:var(--bg);border:1px solid var(--line);overflow:hidden}
.gb-fill{height:100%;border-radius:999px;width:0;transition:width 1.1s cubic-bezier(.22,1,.36,1)}
.gb-foot{display:flex;justify-content:space-between;margin-top:5px;font-size:.76rem;color:var(--muted)}`;
    document.head.appendChild(css);

    const GCOL = { A: '#16a34a', B: '#2563eb', C: '#d97706', S: '#ca8a04', F: '#dc2626' };
    const gradeOf = p => p >= 75 ? 'A' : p >= 65 ? 'B' : p >= 55 ? 'C' : p >= 35 ? 'S' : 'F';
    const charts = {};

    function buildAnalyze(rows, anchor, prefix) {
      const { esc, gCls } = window.CA;
      $(prefix + 'MaCard')?.remove();
      $(prefix + 'GbCard')?.remove();

      const sorted = rows.slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
      const best = sorted.reduce((a, b) => (b.pct > a.pct ? b : a), sorted[0]);
      const avg = Math.round(rows.reduce((s, r) => s + r.pct, 0) / rows.length * 10) / 10;
      const latest = sorted[sorted.length - 1], prev = sorted[sorted.length - 2];
      const diff = prev ? Math.round((latest.pct - prev.pct) * 10) / 10 : null;
      const trend = diff == null ? '\u2014' : diff > 0 ? '\u25b2 +' + diff + '%' : diff < 0 ? '\u25bc ' + Math.abs(diff) + '%' : '\uff1d';

      const ma = document.createElement('div');
      ma.className = 'card'; ma.id = prefix + 'MaCard';
      ma.innerHTML = '<div class="ma-grid"><div><h2>\ud83d\udcca Paper Marks Analyze</h2><canvas id="' + prefix + 'Chart"></canvas>' +
        '<p class="sub" style="margin:8px 0 0">A 75+ \u00b7 B 65\u201374 \u00b7 C 55\u201364 \u00b7 S 35\u201354 \u00b7 F below 35</p></div>' +
        '<div class="ma-best"><div class="ma-trophy">\ud83c\udfc6</div>' +
        '<div class="ma-best-title">' + esc(best.title) + '</div>' +
        '<div class="sub" style="margin:0">' + esc(best.date || '') + '</div>' +
        '<div class="ma-best-mark">' + best.mark + ' <span style="color:var(--muted);font-size:1rem">/ ' + best.max + '</span></div>' +
        '<span class="pill ' + gCls(best.pct) + '">' + best.pct + '% \u00b7 Grade ' + gradeOf(best.pct) + '</span>' +
        '<div class="ma-mini"><div><div class="n">' + avg + '%</div><div class="l">Average</div></div>' +
        '<div><div class="n">' + latest.pct + '%</div><div class="l">Latest</div></div>' +
        '<div><div class="n" style="color:' + (diff > 0 ? 'var(--good)' : diff < 0 ? 'var(--bad)' : 'inherit') + '">' + trend + '</div><div class="l">Trend</div></div>' +
        '</div></div></div>';
      anchor.insertAdjacentElement('afterend', ma);

      /* chart only if Chart.js is loaded */
      if (typeof window.Chart === 'function') {
        if (charts[prefix] && charts[prefix].destroy) charts[prefix].destroy();
        const LINE = '#3e8df3';
        charts[prefix] = new window.Chart($(prefix + 'Chart'), {
          type: 'line',
          data: {
            labels: sorted.map(r => r.title),
            datasets: [{
              label: 'Total', data: sorted.map(r => r.pct),
              borderColor: LINE, borderWidth: 2.5, tension: .4,
              pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: LINE,
              pointBorderColor: '#fff', pointBorderWidth: 1.5, fill: true,
              backgroundColor: ctx => {
                const chart = ctx.chart, area = chart.chartArea;
                if (!area) return 'rgba(62,141,243,.15)';
                const g = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
                g.addColorStop(0, 'rgba(62,141,243,.35)'); g.addColorStop(1, 'rgba(62,141,243,.02)');
                return g;
              }
            }]
          },
          options: {
            responsive: true,
            scales: { y: { min: 0, max: 100, title: { display: true, text: 'Percentage' } },
                      x: { ticks: { font: { size: 10 }, maxRotation: 45, autoSkip: false } } },
            plugins: { legend: { display: true, labels: { usePointStyle: true } },
              tooltip: { callbacks: { label: t => { const r = sorted[t.dataIndex]; return ' ' + r.mark + '/' + r.max + ' \u2014 ' + r.pct + '% (Grade ' + gradeOf(r.pct) + ')'; } } } }
          }
        });
      } else {
        const cv = $(prefix + 'Chart');
        if (cv) cv.replaceWith(Object.assign(document.createElement('p'), { className: 'sub', textContent: 'Chart unavailable (Chart.js is not loaded).' }));
        console.warn('[features] Chart.js not found - add its <script> tag to index.html');
      }

      const gb = document.createElement('div');
      gb.className = 'card'; gb.id = prefix + 'GbCard';
      gb.innerHTML = '<h2>\ud83d\udcca Marks by Paper</h2>' +
        '<p class="sub" style="margin:0 0 4px">Bar color = grade: <b style="color:#16a34a">A</b> \u00b7 <b style="color:#2563eb">B</b> \u00b7 <b style="color:#d97706">C</b> \u00b7 <b style="color:#ca8a04">S</b> \u00b7 <b style="color:#dc2626">F</b></p>' +
        sorted.map(r => {
          const g = gradeOf(r.pct), col = GCOL[g];
          return '<div class="gb-row"><div class="gb-head"><span class="gb-title">' + esc(r.title) + '</span><span class="gb-date">' + esc(r.date || '') + '</span></div>' +
            '<div class="gb-track"><div class="gb-fill" data-w="' + r.pct + '" style="background:' + col + '"></div></div>' +
            '<div class="gb-foot"><span>' + r.mark + ' / ' + r.max + '</span><b style="color:' + col + '">' + r.pct + '% \u00b7 Grade ' + g + '</b></div></div>';
        }).join('');
      ma.insertAdjacentElement('afterend', gb);

      requestAnimationFrame(() => requestAnimationFrame(() => {
        gb.querySelectorAll('.gb-fill').forEach(f => { f.style.width = f.dataset.w + '%'; });
      }));
    }

    /* student's own dashboard */
    document.addEventListener('ca:student-marks', e => {
      safe('analyze-student', () => {
        const body = $('stuBody');
        if (!body || !e.detail.rows.length) return;
        body.querySelectorAll('.card').forEach(c => { if (c.querySelector('#c1')) c.remove(); });
        const anchor = $('sumCard') || body.firstElementChild;
        if (anchor) buildAnalyze(e.detail.rows, anchor, 'ma');
      });
    });

    /* teacher / developer student page (#/student/NIC) */
    document.addEventListener('ca:student-view-marks', e => {
      safe('analyze-teacher', () => {
        const app = $('app');
        if (!app || !e.detail.rows.length) return;
        const c = $('svC');
        const oldChartCard = c && c.closest('.card');
        const anchor = oldChartCard || app.querySelector('.card');
        if (!anchor) return;
        buildAnalyze(e.detail.rows, anchor, 'sv');
        if (oldChartCard) oldChartCard.remove();
      });
    });
  });
})();
