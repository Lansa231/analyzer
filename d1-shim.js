/* d1-shim.js — lets the site keep using its Firestore-style calls, but sends them to your Cloudflare Worker (D1 database).
   Firebase Authentication is still used for logins. EDIT API_URL below. */
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export const API_URL = "/api";   // same address as the website (needs functions/api.js). To use a separate Worker instead, put its full address here.

const TS = { __ts: true };
export const serverTimestamp = () => TS;
export const getFirestore = () => ({ d1: true });
export const collection = (db, col) => ({ type: 'col', col, wheres: [] });
export const doc = (db, col, id) => ({ type: 'doc', col, id });
export const where = (f, op, v) => ({ f, op, v });
export const query = (c, ...w) => ({ type: 'col', col: c.col, wheres: [...c.wheres, ...w] });

async function call(body) {
  const u = getAuth().currentUser, h = { 'Content-Type': 'application/json' };
  if (u) h.Authorization = 'Bearer ' + await u.getIdToken();
  if (API_URL.includes('YOUR-WORKER')) throw new Error('API_URL in d1-shim.js is still the placeholder. Put your Worker address there.');
  const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 20000);
  let r; try { r = await fetch(API_URL, { method: 'POST', headers: h, body: JSON.stringify(body), signal: ctl.signal }); }
  catch (e) { throw new Error(e.name === 'AbortError' ? 'The server did not answer within 20 seconds.' : 'Could not connect to the server (' + e.message + '). Check API_URL in d1-shim.js.'); }
  finally { clearTimeout(tm); }
  const j = await r.json().catch(() => ({ error: 'The server sent an unreadable reply (HTTP ' + r.status + ').' }));
  if (!r.ok) { const e = new Error(j.error || 'Request failed'); e.code = j.code || 'unavailable'; throw e; }
  return j;
}
const snap = (col, id, data) => ({ id, ref: { type: 'doc', col, id }, exists: () => data != null, data: () => data });

export const getDoc = async d => { const j = await call({ op: 'get', col: d.col, id: d.id }); return snap(d.col, d.id, j.data); };
export const getDocs = async q => {
  const j = await call({ op: 'list', col: q.col, where: q.wheres });
  const docs = j.docs.map(x => snap(q.col, x.id, x.data));
  return { docs, size: docs.length, empty: !docs.length, forEach: f => docs.forEach(f) };
};
export const setDoc = async (d, data, opt) => { await call({ op: 'set', col: d.col, id: d.id, data, merge: !!(opt && opt.merge) }); };
export const updateDoc = async (d, data) => { await call({ op: 'update', col: d.col, id: d.id, data }); };
export const deleteDoc = async d => { await call({ op: 'delete', col: d.col, id: d.id }); };
export const addDoc = async (c, data) => { const j = await call({ op: 'add', col: c.col, data }); return { id: j.id, ref: { type: 'doc', col: c.col, id: j.id } }; };

/* "live" updates: checks every 90 seconds (only while the tab is visible) and calls back when something changed */
export const onSnapshot = (q, cb, err) => {
  let last = null, stop = false;
  const tick = async () => {
    if (stop || document.visibilityState !== 'visible') return;
    try { const s = await getDocs(q), sig = JSON.stringify(s.docs.map(d => [d.id, d.data()])); if (last !== null && sig !== last) cb(s); last = sig; }
    catch (e) { if (err) err(e); }
  };
  const iv = setInterval(tick, 90000); tick();
  return () => { stop = true; clearInterval(iv); };
};

/* the student's own rank per paper (only if in the top 100 across all centers) */
export const myRanks = async () => (await call({ op: 'myranks' })).ranks || {};
export const deleteAuthUser = uid => call({ op: 'deleteuser', uid });
