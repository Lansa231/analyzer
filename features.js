/* features.js — add-on file for Class Analyzer. Upload next to index.html.
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
  if (rows.length) { addSummary(rows, body); addRanks(rows); }
  addWelcome(name, rows.length, body);
});

function addSummary(rows, body) {
  const { esc, grade, gCls } = window.CA;
  const avg = Math.round(rows.reduce((a, r) => a + r.pct, 0) / rows.length * 10) / 10;
  const sorted = rows.slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
  const last = sorted[sorted.length - 1], prev = sorted[sorted.length - 2];
  const diff = prev ? Math.round((last.pct - prev.pct) * 10) / 10 : null;
  const trend = diff == null ? '—' : diff > 0 ? `▲ +${diff}%` : diff < 0 ? `▼ ${diff}%` : '＝ no change';
  const tile = (label, value, sub) => `<div style="flex:1;min-width:150px;padding:12px;border:1px solid var(--line);border-radius:12px">
    <div class="sub" style="margin:0">${label}</div><div style="font-size:1.35rem;font-weight:800;margin:2px 0">${value}</div>
    <div class="sub" style="margin:0">${sub}</div></div>`;
  const card = document.createElement('div');
  card.className = 'card'; card.id = 'sumCard';
  card.innerHTML = `<h2>⭐ Your Summary</h2><div style="display:flex;gap:10px;flex-wrap:wrap">
    ${tile('Average', avg + '%', `<span class="pill ${gCls(avg)}">Grade ${grade(avg)}</span>`)}
    ${tile('Papers sat', rows.length, 'published so far')}
    ${tile('Latest paper', last.pct + '%', esc(last.title) + ' · ' + trend)}
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
  card.innerHTML = `<h2>🏅 Your ranks</h2><p class="sub" style="margin:0 0 8px">Shown for papers where you are in the top 100 across all centers.</p>
    ${list.map(x => `<div class="list-item"><span>${esc(x.title)}</span><span class="pill brand">Rank #${r[x.pid]}</span></div>`).join('')}`;
  sum.insertAdjacentElement('afterend', card);
}

function addWelcome(name, n, body) {
  const { esc } = window.CA;
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h2>👋 ${greet()}, ${esc(name)}!</h2>
    ${n ? '' : '<p class="sub" style="margin:6px 0 0">📌 No marks yet. When your teacher publishes a paper, your progress chart, summary and paper-by-paper marks will appear here automatically.</p>'}`;
  body.prepend(card);
}

/* ---- HOW TO ADD A NEW TEACHER TAB (example, remove the comment marks to try it) ----
window.CA.tabs.push({
  id: 'hello', label: '👋 Hello',
  render: ({ el, roster, papers, adm }) => {
    el.innerHTML = `<div class="card"><h2>Hello!</h2><p class="sub">${roster.length} students, ${papers.length} papers.</p></div>`;
  }
});
   Other things available in add-on files: window.CA.db, CA.fs (database functions), CA.profile, CA.user,
   CA.state, CA.go('#/...'), CA.busy(true/false), CA.refresh(), CA.myRanks(), and the events 'ca:view', 'ca:teacher-view', 'ca:student-marks'. */
