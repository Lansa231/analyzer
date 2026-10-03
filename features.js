/* features.js — add-on file for Class Analyzer. Upload next to index.html.
   index.html announces events; this file listens and adds things to the page.
   Events: 'ca:view' (detail.name = screen name) and 'ca:student-marks' (detail.rows = student's marks).
   Helpers available on window.CA: esc, pct, grade, gCls, SUBJECTS, app */

/* ---- Student dashboard: summary tiles above the chart ---- */
document.addEventListener('ca:student-marks', e => {
  const { rows, name, nic, email } = e.detail, body = document.getElementById('stuBody');
  if (!body) return;
  if (rows.length) addSummary(rows, body);
  addWelcome(name, nic, email, rows.length, body);
});

function addSummary(rows, body) {
  const { esc, grade, gCls } = window.CA;

  const avg = Math.round(rows.reduce((a, r) => a + r.pct, 0) / rows.length * 10) / 10;

  const bySub = {};
  rows.forEach(r => (bySub[r.subject] ||= []).push(r.pct));
  const best = Object.entries(bySub)
    .map(([s, v]) => [s, v.reduce((a, b) => a + b, 0) / v.length])
    .sort((a, b) => b[1] - a[1])[0];

  const sorted = rows.slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
  const last = sorted[sorted.length - 1], prev = sorted[sorted.length - 2];
  const diff = prev ? Math.round((last.pct - prev.pct) * 10) / 10 : null;
  const trend = diff == null ? '—' : diff > 0 ? `▲ +${diff}%` : diff < 0 ? `▼ ${diff}%` : '＝ no change';

  const tile = (label, value, sub) => `<div style="flex:1;min-width:150px;padding:12px;border:1px solid var(--line);border-radius:12px">
    <div class="sub" style="margin:0">${label}</div><div style="font-size:1.35rem;font-weight:800;margin:2px 0">${value}</div>
    <div class="sub" style="margin:0">${sub}</div></div>`;

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h2>⭐ Your Summary</h2><div style="display:flex;gap:10px;flex-wrap:wrap">
    ${tile('Average', avg + '%', `<span class="pill ${gCls(avg)}">Grade ${grade(avg)}</span>`)}
    ${tile('Strongest subject', esc(best[0]), Math.round(best[1] * 10) / 10 + '% average')}
    ${tile('Latest paper', last.pct + '%', esc(last.title) + ' · ' + trend)}
  </div>`;
  body.prepend(card);
}

function addWelcome(name, nic, email, n, body) {
  const { esc } = window.CA, first = esc(String(name || '').split(' ')[0]);
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h2>👋 Welcome, ${first}!</h2>
    <p class="sub" style="margin:0 0 8px">Your account is ready. Your details:</p>
    <div style="display:flex;gap:18px;flex-wrap:wrap">
      <div><span class="sub">Name</span><br><b>${esc(name)}</b></div>
      <div><span class="sub">NIC</span><br><b>${esc(nic)}</b></div>
      <div><span class="sub">Email</span><br><b>${esc(email)}</b></div></div>
    ${n ? '' : '<p class="sub" style="margin:12px 0 0">📌 No marks yet. When your teacher publishes a paper, your progress chart, summary and paper-by-paper marks will appear here automatically.</p>'}`;
  body.prepend(card);
}
