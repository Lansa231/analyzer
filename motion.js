/* ===== S.K. Wellala — motion layer: icons, click/hover effects, reveals, counters ===== */
(() => {
'use strict';
const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
const FINE = matchMedia('(pointer:fine)').matches;

/* ---------- Icon set (24px stroke icons) ---------- */
const P = {
leaf:'<path d="M6 26C4 14 12 5 27 4c1 14-6 23-17 23-1.5 0-3-.3-4-1Z" fill="#16a34a"/><path d="M6 26C4 14 12 5 27 4 20 12 13 19 6 26Z" fill="#4ade80"/><path d="M6 26 20 11" stroke="#dcfce7" stroke-width="1.6" stroke-linecap="round"/>',
dna:'<path d="M9 3c0 8 14 8 14 13S9 24 9 29" fill="none" stroke="#14b8a6" stroke-width="3" stroke-linecap="round"/><path d="M23 3c0 8-14 8-14 13s14 8 14 13" fill="none" stroke="#f472b6" stroke-width="3" stroke-linecap="round"/><path d="M12 8h8M10.5 16h11M12 24h8" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>',
cap:'<path d="M16 5 2 12l14 7 14-7Z" fill="#4f46e5"/><path d="M8 16v6c4 3.5 12 3.5 16 0v-6l-8 4Z" fill="#818cf8"/><path d="M28 13v8" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/><circle cx="28" cy="22.5" r="2" fill="#fbbf24"/>',
trend:'<rect x="4" y="19" width="5" height="9" rx="1.5" fill="#34d399"/><rect x="12" y="14" width="5" height="14" rx="1.5" fill="#10b981"/><rect x="20" y="9" width="5" height="19" rx="1.5" fill="#059669"/><path d="M4 12l7-6 5 4 10-7M21 3h5v5" fill="none" stroke="#f59e0b" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
chart:'<rect x="4" y="16" width="6" height="12" rx="2" fill="#38bdf8"/><rect x="13" y="6" width="6" height="22" rx="2" fill="#6366f1"/><rect x="22" y="12" width="6" height="16" rx="2" fill="#f472b6"/>',
file:'<path d="M8 3h11l7 7v17a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="#fff" stroke="#cbd5e1" stroke-width="1.2"/><path d="M19 3v7h7Z" fill="#fbbf24"/><path d="M10 15h12M10 19h12M10 23h7" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/>',
lock:'<path d="M10 14v-3a6 6 0 0 1 12 0v3" fill="none" stroke="#94a3b8" stroke-width="3.2" stroke-linecap="round"/><rect x="6" y="14" width="20" height="14" rx="3.5" fill="#f59e0b"/><circle cx="16" cy="21" r="2.4" fill="#92400e"/><path d="M16 22v3" stroke="#92400e" stroke-width="2" stroke-linecap="round"/>',
mobile:'<rect x="9" y="2" width="14" height="28" rx="3.5" fill="#334155"/><rect x="11" y="6" width="10" height="17" rx="1.5" fill="#38bdf8"/><path d="M11 18l4-4 3 3 3-5v11H11Z" fill="#22c55e"/><circle cx="16" cy="26.5" r="1.3" fill="#94a3b8"/>',
send:'<circle cx="16" cy="16" r="14" fill="#2aabee"/><path d="M7 15.5 23.5 9c.8-.3 1.5.2 1.2 1.4l-2.8 13c-.2.9-.8 1.1-1.5.7l-4.2-3.1-2 2c-.2.2-.4.4-.8.4l.3-4.4 8-7.2c.3-.3-.1-.5-.5-.2l-9.9 6.2-4.3-1.3c-.9-.3-.9-.9.2-1.4Z" fill="#fff"/>',
pin:'<path d="M16 30S6 19.5 6 12.5a10 10 0 0 1 20 0C26 19.5 16 30 16 30Z" fill="#ef4444"/><path d="M16 2.5a10 10 0 0 0-10 10c0 3 1.8 6.5 4.2 9.7C9 18.5 8 15.5 8.5 12.5A8.5 8.5 0 0 1 16 4Z" fill="#f87171"/><circle cx="16" cy="12.5" r="4" fill="#fff"/>',
phone:'<path d="M26 22.5v3.5a2.5 2.5 0 0 1-2.7 2.5C13.7 27.8 4.2 18.3 3.5 8.7A2.5 2.5 0 0 1 6 6h3.5l2 5-2.5 2c1.6 3 3.6 5 6.7 6.7l2-2.5 5 2Z" fill="#22c55e"/><path d="M19 6a7 7 0 0 1 7 7M19 10.5a2.7 2.7 0 0 1 2.7 2.7" fill="none" stroke="#86efac" stroke-width="2" stroke-linecap="round"/>',
chat:'<path d="M16 3C8.8 3 3 8.2 3 14.7c0 3 1.3 5.8 3.5 7.8L5 28l5.5-2.6c1.7.6 3.5.9 5.5.9 7.2 0 13-5.2 13-11.7S23.2 3 16 3Z" fill="#22c55e"/><circle cx="10.5" cy="14.5" r="1.8" fill="#fff"/><circle cx="16" cy="14.5" r="1.8" fill="#fff"/><circle cx="21.5" cy="14.5" r="1.8" fill="#fff"/>',
mail:'<rect x="3" y="7" width="26" height="19" rx="3.5" fill="#f43f5e"/><path d="m4 10 12 9 12-9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
users:'<circle cx="12" cy="11" r="5" fill="#60a5fa"/><path d="M2.5 27c0-5.5 4-8.5 9.5-8.5S21.5 21.5 21.5 27Z" fill="#3b82f6"/><circle cx="23" cy="12" r="4" fill="#a78bfa"/><path d="M22 19c4.5-.5 8 2 8 8h-7c0-3-.5-5.5-1-8Z" fill="#8b5cf6"/>',
user:'<circle cx="16" cy="10" r="6" fill="#818cf8"/><path d="M4 29c0-7 5.5-11 12-11s12 4 12 11Z" fill="#6366f1"/>',
play:'<circle cx="16" cy="16" r="14" fill="#ef4444"/><path d="M13 10.5v11l9-5.5Z" fill="#fff"/>',
clock:'<circle cx="16" cy="16" r="14" fill="#fbbf24"/><circle cx="16" cy="16" r="11" fill="#fff"/><path d="M16 9v7l5 3" fill="none" stroke="#d97706" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
sparkle:'<path d="M13 3l2.6 7.4L23 13l-7.4 2.6L13 23l-2.6-7.4L3 13l7.4-2.6Z" fill="#fbbf24"/><path d="M24 17l1.3 3.7L29 22l-3.7 1.3L24 27l-1.3-3.7L19 22l3.7-1.3Z" fill="#f472b6"/>',
pencil:'<path d="M5 27l1.5-6L21 6.5a3 3 0 0 1 4.2 0l.3.3a3 3 0 0 1 0 4.2L11 25.5Z" fill="#fbbf24"/><path d="M21 6.5a3 3 0 0 1 4.2 0l.3.3a3 3 0 0 1 0 4.2l-2.5-.5-1.5-2.5Z" fill="#f472b6"/><path d="m5 27 1.5-6 4.5 4.5Z" fill="#fde68a"/><path d="M5 27l1-3.5 2.5 2.5Z" fill="#334155"/>',
repeat:'<path d="M5 14v-2a6 6 0 0 1 6-6h10" fill="none" stroke="#06b6d4" stroke-width="3.2" stroke-linecap="round"/><path d="m20 2 6 4-6 4Z" fill="#06b6d4"/><path d="M27 18v2a6 6 0 0 1-6 6H11" fill="none" stroke="#6366f1" stroke-width="3.2" stroke-linecap="round"/><path d="m12 22-6 4 6 4Z" fill="#6366f1"/>',
trophy:'<path d="M9 6H4c0 5 2 8 6 9M23 6h5c0 5-2 8-6 9" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/><path d="M9 3h14v9c0 5-3 8-7 8s-7-3-7-8Z" fill="#fbbf24"/><path d="M11 5h3v7c0 3 1 5 2.5 6-4 0-5.5-3-5.5-6Z" fill="#fde68a"/><rect x="14" y="19" width="4" height="6" fill="#d97706"/><path d="M9 25h14l1.5 5h-17Z" fill="#92400e"/>',
medal:'<path d="M9 2h5l3 9h-5zM23 2h-5l-3 9h5z" fill="#ef4444"/><circle cx="16" cy="20" r="9" fill="#fbbf24"/><circle cx="16" cy="20" r="6" fill="#fde68a"/><path d="m16 15.5 1.3 2.7 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4Z" fill="#f59e0b"/>',
globe:'<circle cx="16" cy="16" r="14" fill="#3b82f6"/><path d="M9 7c3 0 5 2 4 5s-3 3-3 6-3 3-5-1C4 13 6 8 9 7ZM20 5c3 1 6 3 7 8-3 0-4 2-6 2s-3-3-1-5 1-3 0-5ZM18 21c3-1 5 1 5 4-2 2-4 3-6 3 1-2 0-5 1-7Z" fill="#4ade80"/>',
alert:'<path d="M16 3 30 27.5a1.5 1.5 0 0 1-1.3 2.2H3.3A1.5 1.5 0 0 1 2 27.5Z" fill="#fbbf24"/><path d="M16 12v8" stroke="#7c2d12" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="24.5" r="1.8" fill="#7c2d12"/>',
hourglass:'<path d="M8 3h16v3c0 5-6 7-6 10s6 5 6 10v3H8v-3c0-5 6-7 6-10S8 11 8 6Z" fill="#bae6fd" stroke="#64748b" stroke-width="1.5"/><path d="M11 6h10c-1 3-3.5 4-5 6-1.5-2-4-3-5-6Z" fill="#fbbf24"/><path d="M12 26c1-3 3-4 4-4s3 1 4 4Z" fill="#f59e0b"/><rect x="6" y="2" width="20" height="3" rx="1.5" fill="#64748b"/><rect x="6" y="27" width="20" height="3" rx="1.5" fill="#64748b"/>',
wrench:'<path d="M22 3a7 7 0 0 0-6.5 9.5L4 24a3 3 0 0 0 4 4l11.5-11.5A7 7 0 0 0 29 10l-5 5-4-1-1-4 5-5a7 7 0 0 0-2-2Z" fill="#94a3b8"/><circle cx="6.5" cy="25.5" r="1.2" fill="#475569"/>',
key:'<circle cx="10" cy="20" r="7" fill="#fbbf24"/><circle cx="10" cy="20" r="3" fill="#fff"/><path d="M15 15 27 3M22 8l4 4M25 5l3 3" stroke="#f59e0b" stroke-width="3.2" stroke-linecap="round" fill="none"/>',
clipboard:'<rect x="5" y="5" width="22" height="25" rx="3.5" fill="#a78bfa"/><rect x="8" y="9" width="16" height="18" rx="2" fill="#fff"/><rect x="11" y="2" width="10" height="6" rx="2.5" fill="#6d28d9"/><path d="M11 15h10M11 19h10M11 23h6" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round"/>',
check:'<circle cx="16" cy="16" r="14" fill="#22c55e"/><path d="m9 16.5 5 5 9-10" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>',
calendar:'<rect x="3" y="5" width="26" height="24" rx="4" fill="#fff" stroke="#e2e8f0" stroke-width="1.2"/><path d="M7 5h18a4 4 0 0 1 4 4v4H3V9a4 4 0 0 1 4-4Z" fill="#f43f5e"/><rect x="9" y="2" width="3" height="6" rx="1.5" fill="#9f1239"/><rect x="20" y="2" width="3" height="6" rx="1.5" fill="#9f1239"/><rect x="8" y="17" width="4" height="4" rx="1" fill="#60a5fa"/><rect x="14" y="17" width="4" height="4" rx="1" fill="#fbbf24"/><rect x="20" y="17" width="4" height="4" rx="1" fill="#4ade80"/><rect x="8" y="23" width="4" height="3" rx="1" fill="#a78bfa"/>',
camera:'<path d="M3 11a3 3 0 0 1 3-3h3l2-3h10l2 3h3a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z" fill="#475569"/><circle cx="16" cy="18" r="7" fill="#e2e8f0"/><circle cx="16" cy="18" r="4.5" fill="#38bdf8"/><circle cx="14.5" cy="16.5" r="1.4" fill="#fff"/><circle cx="25" cy="12" r="1.3" fill="#fbbf24"/>',
image:'<rect x="3" y="5" width="26" height="22" rx="4" fill="#38bdf8"/><circle cx="22" cy="12" r="3" fill="#fde047"/><path d="M3 24l8-9 6 6 4-4 8 8v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z" fill="#22c55e"/>',
flask:'<path d="M12 3h8v3h-1v7l8 13a2.5 2.5 0 0 1-2.2 4H7.2A2.5 2.5 0 0 1 5 26l8-13V6h-1Z" fill="#e0f2fe" stroke="#94a3b8" stroke-width="1.4"/><path d="M9.5 21h13l4.2 6.5a1.5 1.5 0 0 1-1.3 2.3H6.6a1.5 1.5 0 0 1-1.3-2.3Z" fill="#a855f7"/><circle cx="14" cy="24.5" r="1.4" fill="#e9d5ff"/><circle cx="19" cy="26" r="1" fill="#e9d5ff"/>',
mic:'<rect x="11" y="2" width="10" height="17" rx="5" fill="#f472b6"/><path d="M6 14a10 10 0 0 0 20 0M16 24v5M11 29h10" fill="none" stroke="#9d174d" stroke-width="2.6" stroke-linecap="round"/><path d="M13.5 6v6" stroke="#fbcfe8" stroke-width="1.8" stroke-linecap="round"/>',
book:'<path d="M3 6c5-2 10-1 13 2v21c-3-3-8-4-13-2Z" fill="#3b82f6"/><path d="M29 6c-5-2-10-1-13 2v21c3-3 8-4 13-2Z" fill="#60a5fa"/><path d="M6 10c3-.8 6 0 8 1.5M18 11.5c2-1.5 5-2.3 8-1.5" stroke="#dbeafe" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
video:'<rect x="2" y="7" width="19" height="18" rx="4" fill="#ef4444"/><path d="m22 14 8-5v14l-8-5Z" fill="#f87171"/>',
inbox:'<path d="M4 18 8 6h16l4 12v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" fill="#818cf8"/><path d="M4 18h8l1.5 3h5l1.5-3h8v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" fill="#4f46e5"/><path d="M11 11h10M12 14.5h8" stroke="#e0e7ff" stroke-width="2" stroke-linecap="round"/>',
gear:'<path d="M16 2l2.5 3.5 4.2-.9 1.2 4.1 4.1 1.2-.9 4.2L30 16l-3.5 2.5.9 4.2-4.1 1.2-1.2 4.1-4.2-.9L16 30l-2.5-3.5-4.2.9-1.2-4.1-4.1-1.2.9-4.2L2 16l3.5-2.5-.9-4.2 4.1-1.2 1.2-4.1 4.2.9Z" fill="#94a3b8"/><circle cx="16" cy="16" r="6" fill="#e2e8f0"/><circle cx="16" cy="16" r="3" fill="#64748b"/>',
building:'<path d="M16 2 3 9v3h26V9Z" fill="#ef4444"/><rect x="5" y="12" width="22" height="16" fill="#fde68a"/><rect x="8" y="15" width="3.5" height="9" fill="#60a5fa"/><rect x="14.25" y="15" width="3.5" height="9" fill="#60a5fa"/><rect x="20.5" y="15" width="3.5" height="9" fill="#60a5fa"/><rect x="3" y="27" width="26" height="3" rx="1" fill="#92400e"/>',
card:'<rect x="2" y="6" width="28" height="20" rx="4" fill="#14b8a6"/><rect x="2" y="11" width="28" height="4.5" fill="#134e4a"/><rect x="6" y="19" width="9" height="3" rx="1.5" fill="#99f6e4"/><rect x="22" y="19" width="4" height="3" rx="1.5" fill="#fbbf24"/>',
target:'<circle cx="16" cy="16" r="14" fill="#ef4444"/><circle cx="16" cy="16" r="10" fill="#fff"/><circle cx="16" cy="16" r="6.5" fill="#ef4444"/><circle cx="16" cy="16" r="3" fill="#fff"/>',
heart:'<path d="M16 29S2 20 2 11a7.5 7.5 0 0 1 14-3.5A7.5 7.5 0 0 1 30 11c0 9-14 18-14 18Z" fill="#f43f5e"/><path d="M7 8c2-2 6-1.5 7 1.5" stroke="#fda4af" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
sun:'<circle cx="16" cy="16" r="7" fill="#fbbf24"/><path d="M16 2v4M16 26v4M2 16h4M26 16h4M6 6l2.8 2.8M23.2 23.2 26 26M6 26l2.8-2.8M23.2 8.8 26 6" stroke="#f59e0b" stroke-width="2.8" stroke-linecap="round"/>',
moon:'<path d="M28 19A13 13 0 0 1 13 4a13 13 0 1 0 15 15Z" fill="#fbbf24"/><circle cx="20" cy="9" r="1.3" fill="#fde68a"/>',
search:'<circle cx="13" cy="13" r="9" fill="#bfdbfe" stroke="#3b82f6" stroke-width="3.2"/><path d="m20 20 8 8" stroke="#f59e0b" stroke-width="4.2" stroke-linecap="round"/><path d="M8.5 11a5 5 0 0 1 4-3.5" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
monitor:'<rect x="2" y="4" width="28" height="19" rx="3.5" fill="#475569"/><rect x="4.5" y="6.5" width="23" height="14" rx="1.5" fill="#38bdf8"/><path d="M4.5 17l7-6 5 4 4-3 7 5v3.5H4.5Z" fill="#22c55e" opacity=".85"/><path d="M11 29h10M16 23v6" stroke="#64748b" stroke-width="3" stroke-linecap="round"/>'
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
  return `<span class="svgi n-${n}" aria-hidden="true"><svg viewBox="0 0 32 32">${P[n]}</svg></span>`;
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
  if (root.nodeType === 3) { if (root.parentElement && !root.parentElement.closest('.svgi,.bgfx,.ma-trophy,div[style*="font-size:2.5rem"]') && !SKIP.test(root.parentElement.tagName.toUpperCase())) swap(root); return; }
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => {
    const p = n.parentElement;
    return !p || SKIP.test(p.tagName.toUpperCase()) || p.closest('.svgi,.bgfx,.ma-trophy,div[style*="font-size:2.5rem"]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
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
