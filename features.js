/* features.js \u2014 add-on file for Class Analyzer. Upload next to index.html.
   index.html announces events; this file listens and adds things to the page. */

const greet = () => { const h = new Date().getHours(); return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night'; };

let rankCache = { t: 0, v: null };
async function getRanks() {
  if (rankCache.v && Date.now() - rankCache.t < 60000) return rankCache.v;
  try { rankCache = { t: Date.now(), v: await window.CA.myRanks() }; } catch (e) { rankCache = { t: Date.now(), v: {} }; }
  return rankCache.v;
}

/* ---- Student dashboard: greeting, summary and own ranks ---- */
document.addEventListener('ca:student-marks', e => {
  const { rows, name } = e.detail, body = document.getElementById('stuBody');
  if (!body) return;
  if (rows.length) { addSummary(rows, body); }
  addWelcome(name, rows.length, body);
});

function addSummary(rows, body) {
  const { esc, grade, gCls } = window.CA;
  const avg = Math.round(rows.reduce((a, r) => a + r.pct, 0) / rows.length * 10) / 10;
  const sorted = rows.slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
  const last = sorted[sorted.length - 1], prev = sorted[sorted.length - 2];
  const diff = prev ? Math.round((last.pct - prev.pct) * 10) / 10 : null;
  const trend = diff == null ? '\u2014' : diff > 0 ? `\u25b2 +${diff}%` : diff < 0 ? `\u25bc ${diff}%` : '\uff1d no change';
  const tile = (label, value, sub) => `<div style="flex:1;min-width:150px;padding:12px;border:1px solid var(--line);border-radius:12px">
    <div class="sub" style="margin:0">${label}</div><div style="font-size:1.35rem;font-weight:800;margin:2px 0">${value}</div>
    <div class="sub" style="margin:0">${sub}</div></div>`;
  const card = document.createElement('div');
  card.className = 'card'; card.id = 'sumCard';
  card.innerHTML = `<h2>\u2b50 Your Summary</h2><div style="display:flex;gap:10px;flex-wrap:wrap">
    ${tile('Average', avg + '%', `<span class="pill ${gCls(avg)}">Grade ${grade(avg)}</span>`)}
    ${tile('Papers sat', rows.length, 'published so far')}
    ${tile('Latest paper', last.pct + '%', esc(last.title) + ' \u00b7 ' + trend)}
  </div>`;
  body.prepend(card);
}

/* a student sees only their own rank, and only when they are in the top 100 of that paper (Online center students are not ranked) */
async function addRanks(rows) {
  const r = await getRanks(), { esc } = window.CA;
  const list = rows.filter(x => r[x.pid]);
  document.getElementById('ranksCard')?.remove();
  const sum = document.getElementById('sumCard');
  if (!list.length || !sum) return;
  const card = document.createElement('div');
  card.className = 'card'; card.id = 'ranksCard';
  card.innerHTML = `<h2>\ud83c\udfc5 Your ranks</h2><p class="sub" style="margin:0 0 8px">Shown for papers where you are in the top 100 across all centers.</p>
    ${list.map(x => `<div class="list-item"><span>${esc(x.title)}</span><span class="pill brand">Rank #${r[x.pid]}</span></div>`).join('')}`;
  sum.insertAdjacentElement('afterend', card);
}

function addWelcome(name, n, body) {
  const { esc } = window.CA;
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h2>\ud83d\udc4b ${greet()}, ${esc(name)}!</h2>
    ${n ? '' : '<p class="sub" style="margin:6px 0 0">\ud83d\udccc No marks yet. When your teacher publishes a paper, your progress chart, summary and paper-by-paper marks will appear here automatically.</p>'}`;
  body.prepend(card);
}

/* ---- HOW TO ADD A NEW TEACHER TAB (example. window.CA exists only after the page is ready, so wrap it like this) ----
document.addEventListener('DOMContentLoaded', () => window.CA.tabs.push({
  id: 'hello', label: '\ud83d\udc4b Hello',
  render: ({ el, roster, papers, adm }) => {
    el.innerHTML = `<div class="card"><h2>Hello!</h2><p class="sub">${roster.length} students, ${papers.length} papers.</p></div>`;
  }
});
   Other things available in add-on files: window.CA.db, CA.fs (database functions), CA.profile, CA.user,
   CA.state, CA.go('#/...'), CA.busy(true/false), CA.refresh(), CA.myRanks(), and the events 'ca:view', 'ca:teacher-view', 'ca:student-marks'. */

/* ---- Blue and white theme (delete this block to go back to the green theme) ---- */
{
  const blue = document.createElement('style');
  blue.textContent = `
:root[data-theme="light"]{--bg:#f3f8fd;--ink:#0f2438;--muted:#5b7186;--line:#dde8f3;--brand:#1d4ed8;--brand2:#0ea5e9;--brand-soft:#e6f0fd;--brand-bg:#e6f0fd;--shadow:0 8px 28px rgba(30,70,140,.10)}
[data-theme="dark"]{--bg:#09121f;--card:#101e33;--ink:#e6eef8;--muted:#8fa6c0;--line:#1d3350;--brand:#60a5fa;--brand2:#38bdf8;--brand-soft:#17325a;--brand-bg:#17325a}
.hero.photo{background:linear-gradient(rgba(8,30,70,var(--tint-a)),rgba(8,30,70,var(--tint-b))),url('hero-photo.jpg') center/cover no-repeat,linear-gradient(135deg,#1d4ed8,#0ea5e9)}
.side{background:linear-gradient(rgba(8,30,70,var(--tint-a)),rgba(8,30,70,var(--tint-b))),url('signup-photo.jpg') center/cover no-repeat,linear-gradient(135deg,#1d4ed8,#0ea5e9)}`;
  document.head.appendChild(blue);
}

/* ---- remove student verification (buttons and labels); teacher verification stays ---- */
{
  const hide = document.createElement('style');
  hide.textContent = '[data-ver],#svVer{display:none!important}';
  document.head.appendChild(hide);
  const clean = () => {
    document.querySelectorAll('button').forEach(b => {
      const t = b.textContent.trim();
      if ((t === 'Verify' || t === 'Unverify') && !b.hasAttribute('data-tv')) b.remove();
    });
    document.querySelectorAll('span').forEach(el => {
      const t = el.textContent.trim();
      if (t === '\u00b7 not verified' || t === '\u00b7 pending verification') { el.remove(); return; }
      if (!el.classList.contains('vbadge')) return;
      const inStudentRow = el.closest('td')?.querySelector('a.nl');
      const del = document.getElementById('svDel');
      const prev = el.previousElementSibling;
      const ownHeader = prev && prev.classList.contains('pill') && /Student/.test(prev.textContent);
      if (inStudentRow || ownHeader || (del && el.closest('.card')?.contains(del))) el.remove();
    });
  };
  let queued = false;
  new MutationObserver(() => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; clean(); }); })
    .observe(document.documentElement, { childList: true, subtree: true });
  clean();
}

/* ---- Teacher / developer sidebar, Profile page and custom loading animation ---- */
{
  /* styles */
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
@media (max-width:900px){
  .dash-layout{display:block}
  .sidebar{position:static;margin-bottom:14px;padding:10px}
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

  /* the Profile page */
  const profileTab = {
    id: 'profile', label: '\ud83d\udc64 Profile',
    render: ({ el }) => {
      const { esc } = window.CA, p = window.CA.profile || {};
      const row = (k, v) => '<div style="padding:10px 0;border-bottom:1px solid var(--line)"><div class="sub" style="margin:0">' + k + '</div><b>' + esc(v || '-') + '</b></div>';
      const show = () => {
        el.innerHTML = '<div class="card" style="max-width:640px"><div style="display:flex;gap:14px;align-items:center;margin-bottom:8px">' +
          '<div class="side-user" style="border:0;padding:0;margin:0;cursor:default"><div class="av" style="width:64px;height:64px;font-size:1.6rem">' + esc((p.fullName || '?').trim().charAt(0).toUpperCase()) + '</div></div>' +
          '<div><h2 style="margin:0">' + esc(p.fullName || '') + '</h2><span class="pill brand">' + (p.isAdmin ? 'Developer' : 'Teacher') + '</span>' +
          (p.nickname ? ' <span class="sub" style="display:inline">"' + esc(p.nickname) + '"</span>' : '') + '</div></div>' +
          row('Email', p.email) + row('Gender', p.gender) + row('Phone', p.phone) + row('Institute / School', p.institute) +
          row('Attended Class', p.className) + row('Exam center', p.center) +
          '<button class="btn btn-primary" id="pfEdit" style="width:auto;margin-top:14px">Edit details</button></div>';
        document.getElementById('pfEdit').onclick = edit;
      };
      const edit = () => {
        el.innerHTML = '<div class="card" style="max-width:640px"><h2>Edit my details</h2>' +
          '<label>Full name</label><input id="pf_n" value="' + esc(p.fullName || '') + '">' +
          '<label>Phone number</label><input id="pf_p" type="tel" value="' + esc(p.phone || '') + '">' +
          '<label>Institute / School</label><input id="pf_i" value="' + esc(p.institute || '') + '">' +
          '<label>Attended Class</label><input id="pf_c" value="' + esc(p.className || '') + '">' +
          '<div class="row" style="margin-top:14px"><button class="btn btn-primary" id="pf_s" style="width:auto">Save</button><button class="btn btn-ghost" id="pf_x" style="width:auto">Cancel</button></div><div id="pf_m"></div></div>';
        document.getElementById('pf_x').onclick = show;
        document.getElementById('pf_s').onclick = async () => {
          const d = { fullName: document.getElementById('pf_n').value.trim(), phone: document.getElementById('pf_p').value.trim(),
                      institute: document.getElementById('pf_i').value.trim(), className: document.getElementById('pf_c').value.trim() };
          if (d.fullName.length < 3) { document.getElementById('pf_m').innerHTML = '<div class="err">Please enter your full name.</div>'; return; }
          window.CA.busy(true);
          try { await window.CA.fs.updateDoc(window.CA.fs.doc(window.CA.db, 'teachers', window.CA.user.uid), d); Object.assign(p, d); window.CA.busy(false); show(); }
          catch (e) { window.CA.busy(false); document.getElementById('pf_m').innerHTML = '<div class="err">' + esc(window.CA.friendly(e)) + '</div>'; }
        };
      };
      show();
    }
  };

  /* a small watcher that runs 3 times a second, so it works for every account no matter when the page is drawn */
  const watch = () => {
    try {
      /* loader */
      const L = document.getElementById('loading');
      if (L && !L.querySelector('.dna')) L.insertAdjacentHTML('beforeend', '<div class="ld-box"><div class="dna">' +
        Array.from({ length: 12 }, (_, i) => '<i style="--i:' + i + '"></i>').join('') + '</div><div class="ld-txt">LOADING</div></div>');

      const CA = window.CA; if (!CA || !CA.tabs) return;
      /* profile tab (added once; if the dashboard is already on screen, redraw it so the button appears) */
      if (!CA.tabs.some(t => t.id === 'profile')) { CA.tabs.push(profileTab); if (document.getElementById('tabBody') && CA.refresh) CA.refresh(); return; }

      const app = document.getElementById('app'); if (!app) return;
      const first = document.getElementById('tabBody') && app.querySelector('[data-tab]');
      if (!first) { app.classList.remove('wide'); return; }
      const nav = first.parentElement;
      if (nav.closest('.dash-layout')) { app.classList.add('wide'); return; }

      const p = CA.profile || {}, esc = CA.esc;
      const layout = document.createElement('div'); layout.className = 'dash-layout';
      const aside = document.createElement('aside'); aside.className = 'sidebar';
      const main = document.createElement('div'); main.className = 'dash-main';
      Array.from(app.children).forEach(c => { if (c !== nav) main.appendChild(c); });
      const who = document.createElement('div'); who.className = 'side-user';
      who.innerHTML = '<div class="av">' + esc((p.fullName || '?').trim().charAt(0).toUpperCase()) + '</div><div><b>' + esc(p.fullName || '') + '</b><small>' + (p.isAdmin ? 'Developer' : 'Teacher') + (p.center ? ' \u00b7 ' + esc(p.center) : '') + '</small></div>';
      const prof = nav.querySelector('[data-tab="x_profile"]');
      who.onclick = () => { if (prof) prof.click(); };
      if (prof) nav.prepend(prof);
      aside.append(who, nav); layout.append(aside, main); app.appendChild(layout); app.classList.add('wide');
      console.log('[sidebar] built for', p.isAdmin ? 'developer' : 'teacher');
    } catch (e) { console.error('[sidebar] failed:', e); }
  };
  setInterval(watch, 300);
}

/* ---- Marks tab: choose a paper from a list, and search students to add marks quickly ---- */
{
  const watchMarks = () => {
    try {
      const pane = document.getElementById('marksPane'), body = document.getElementById('tabBody');
      if (!pane || !body) return;

      /* 1) "Choose paper" list at the top of the Marks tab */
      const rows = Array.from(body.querySelectorAll('.paper-row'));
      if (rows.length && !document.getElementById('paperPick')) {
        const opts = rows.map(r => {
          const btn = r.querySelector('[data-open]'); if (!btn) return '';
          const name = (r.querySelector('b') || {}).textContent || 'Paper', sub = (r.querySelector('.sub') || {}).textContent || '';
          const d = (sub.split('\u00b7')[0] || '').trim();
          return '<option value="' + btn.dataset.open + '">' + name.replace(/</g, '&lt;') + (d ? '  (' + d.replace(/</g, '&lt;') + ')' : '') + '</option>';
        }).join('');
        const card = document.createElement('div');
        card.className = 'card'; card.id = 'paperPickCard';
        card.innerHTML = '<label style="margin-top:0">Choose paper to enter marks</label><select id="paperPick"><option value="">- Select a paper -</option>' + opts + '</select>';
        body.prepend(card);
        const pick = document.getElementById('paperPick');
        if (window.CA && window.CA.state && window.CA.state.selPaper) pick.value = window.CA.state.selPaper;
        pick.onchange = () => { const b = body.querySelector('[data-open="' + pick.value + '"]'); if (b) b.click(); else pane.innerHTML = ''; };
      }

      /* 2) search box above the marks table */
      const wrap = pane.querySelector('.tbl-wrap');
      if (wrap && !document.getElementById('mkSearch')) {
        const bar = document.createElement('div');
        bar.style.cssText = 'display:flex;gap:10px;align-items:center;margin:4px 0 12px;flex-wrap:wrap';
        bar.innerHTML = '<input id="mkSearch" placeholder="Search by name, NIC or barcode - press Enter to type the mark" style="flex:1;min-width:220px" autocomplete="off"><span id="mkCount" class="sub" style="margin:0"></span>';
        wrap.parentNode.insertBefore(bar, wrap);
        const input = document.getElementById('mkSearch'), count = document.getElementById('mkCount');
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
        /* after typing a mark, Enter saves it and jumps back to the search box for the next student */
        trs().forEach(tr => {
          const m = tr.querySelector('[data-mk]');
          if (!m || m.dataset.ent) return; m.dataset.ent = '1';
          m.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            e.preventDefault(); m.blur(); input.value = ''; filter(); input.focus();
          });
        });
        input.focus();
      }
    } catch (e) { console.error('[marks] helper failed:', e); }
  };
  setInterval(watchMarks, 300);
}
/* ================================================================
   Marks Analyze UI — gradient chart + My Best + grade bars
   Works on: student dashboard (ca:student-marks)
             teacher/dev student page (ca:student-view-marks)
   ================================================================ */
{
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

  const GCOL = { A:'#16a34a', B:'#2563eb', C:'#d97706', S:'#ca8a04', F:'#dc2626' };
  const gradeOf = p => p>=75?'A':p>=65?'B':p>=55?'C':p>=35?'S':'F';
  const charts = {};

  function buildAnalyze(rows, anchor, prefix){
    const { esc } = window.CA;
    document.getElementById(prefix+'MaCard')?.remove();
    document.getElementById(prefix+'GbCard')?.remove();

    const sorted = rows.slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
    const best = sorted.reduce((a,b)=>(b.pct>a.pct?b:a), sorted[0]);
    const avg = Math.round(rows.reduce((s,r)=>s+r.pct,0)/rows.length*10)/10;
    const latest = sorted[sorted.length-1], prev = sorted[sorted.length-2];
    const diff = prev ? Math.round((latest.pct-prev.pct)*10)/10 : null;
    const trend = diff==null?'—':diff>0?`▲ +${diff}%`:diff<0?`▼ ${Math.abs(diff)}%`:'＝';

    /* chart + My Best card */
    const ma = document.createElement('div');
    ma.className='card'; ma.id = prefix+'MaCard';
    ma.innerHTML = `<div class="ma-grid">
      <div><h2>📊 Paper Marks Analyze</h2><canvas id="${prefix}Chart"></canvas>
        <p class="sub" style="margin:8px 0 0">A 75+ · B 65–74 · C 55–64 · S 35–54 · F below 35</p></div>
      <div class="ma-best">
        <div class="ma-trophy">🏆</div>
        <div class="ma-best-title">${esc(best.title)}</div>
        <div class="sub" style="margin:0">${esc(best.date||'')}</div>
        <div class="ma-best-mark">${best.mark} <span style="color:var(--muted);font-size:1rem">/ ${best.max}</span></div>
        <span class="pill ${window.CA.gCls(best.pct)}">${best.pct}% · Grade ${gradeOf(best.pct)}</span>
        <div class="ma-mini">
          <div><div class="n">${avg}%</div><div class="l">Average</div></div>
          <div><div class="n">${latest.pct}%</div><div class="l">Latest</div></div>
          <div><div class="n" style="color:${diff>0?'var(--good)':diff<0?'var(--bad)':'inherit'}">${trend}</div><div class="l">Trend</div></div>
        </div></div></div>`;
    anchor.insertAdjacentElement('afterend', ma);

    charts[prefix]?.destroy?.();
    const LINE = '#3e8df3';
    charts[prefix] = new Chart(document.getElementById(prefix+'Chart'), {
      type:'line',
      data:{ labels:sorted.map(r=>r.title),
        datasets:[{ label:'Total', data:sorted.map(r=>r.pct),
          borderColor:LINE, borderWidth:2.5, tension:.4,
          pointRadius:4, pointHoverRadius:6, pointBackgroundColor:LINE,
          pointBorderColor:'#fff', pointBorderWidth:1.5, fill:true,
          backgroundColor:(ctx)=>{ const {chart}=ctx, {ctx:c,chartArea}=chart;
            if(!chartArea) return 'rgba(62,141,243,.15)';
            const g=c.createLinearGradient(0,chartArea.top,0,chartArea.bottom);
            g.addColorStop(0,'rgba(62,141,243,.35)'); g.addColorStop(1,'rgba(62,141,243,.02)');
            return g; } }]},
      options:{ responsive:true,
        scales:{ y:{min:0,max:100,title:{display:true,text:'Percentage'}},
                 x:{ticks:{font:{size:10},maxRotation:45,autoSkip:false}} },
        plugins:{ legend:{display:true,labels:{usePointStyle:true}},
          tooltip:{callbacks:{label:(t)=>{ const r=sorted[t.dataIndex];
            return ` ${r.mark}/${r.max} — ${r.pct}% (Grade ${gradeOf(r.pct)})`; }}}}}
    });

    /* grade-colored bars card */
    const gb = document.createElement('div');
    gb.className='card'; gb.id = prefix+'GbCard';
    gb.innerHTML = `<h2>📊 Marks by Paper</h2>
      <p class="sub" style="margin:0 0 4px">Bar color = grade:
        <b style="color:#16a34a">A</b> · <b style="color:#2563eb">B</b> ·
        <b style="color:#d97706">C</b> · <b style="color:#ca8a04">S</b> ·
        <b style="color:#dc2626">F</b></p>`
      + sorted.map(r=>{ const g=gradeOf(r.pct), col=GCOL[g];
          return `<div class="gb-row">
            <div class="gb-head"><span class="gb-title">${esc(r.title)}</span><span class="gb-date">${esc(r.date||'')}</span></div>
            <div class="gb-track"><div class="gb-fill" data-w="${r.pct}" style="background:${col}"></div></div>
            <div class="gb-foot"><span>${r.mark} / ${r.max}</span><b style="color:${col}">${r.pct}% · Grade ${g}</b></div>
          </div>`; }).join('');
    ma.insertAdjacentElement('afterend', gb);

    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      gb.querySelectorAll('.gb-fill').forEach(f=>f.style.width=f.dataset.w+'%');
    }));
  }

  /* student's own dashboard */
  document.addEventListener('ca:student-marks', e=>{
    const body = document.getElementById('stuBody');
    if(!body || !e.detail.rows.length) return;
    body.querySelectorAll('.card').forEach(c=>{ if(c.querySelector('#c1')) c.remove(); });
    const anchor = document.getElementById('sumCard') || body.firstElementChild;
    if (anchor) buildAnalyze(e.detail.rows, anchor, 'ma');
  });

  /* teacher / developer student page (#/student/NIC) */
  document.addEventListener('ca:student-view-marks', e=>{
    const app = document.getElementById('app');
    if(!app || !e.detail.rows.length) return;
    const c = document.getElementById('svC');
    const oldChartCard = c && c.closest('.card');
    const anchor = oldChartCard || app.querySelector('.card');
    if (!anchor) return;
    buildAnalyze(e.detail.rows, anchor, 'sv');
    oldChartCard?.remove();   // drop the old plain chart
  });
}
