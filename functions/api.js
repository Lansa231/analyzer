/* Class Analyzer API — Cloudflare Pages Function (same address as the website, at /api) + D1.
   Firebase still handles logins; this Worker checks the Firebase login token and applies the same
   permission rules the site used in Firestore. Bindings needed: DB (D1 database), FIREBASE_PROJECT_ID (text). */

class Deny extends Error {}
class Missing extends Error {}
const deny = m => { throw new Deny(m); };
const COLS = ['admins','teachers','students','changeRequests','nics','barcodes','pending','papers','marks','fileLists','settings'];
const ONLINE_RE = /online/i;   // a center whose name contains "online" is the Online paper center (left out of all-center ranks)
const skeyOf = s => String((s && (s.skey || s.nic)) || '').toUpperCase();

/* ---------- Firebase login token check ---------- */
let keyCache = { t: 0, keys: null };
async function getKeys() {
  if (keyCache.keys && Date.now() - keyCache.t < 3600e3) return keyCache.keys;
  const r = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
  keyCache = { t: Date.now(), keys: (await r.json()).keys };
  return keyCache.keys;
}
const b64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), c => c.charCodeAt(0));
async function verify(tok, pid) {
  const [h, p, s] = String(tok).split('.');
  if (!s) throw new Error('bad token');
  const head = JSON.parse(new TextDecoder().decode(b64u(h))), pay = JSON.parse(new TextDecoder().decode(b64u(p)));
  if (head.alg !== 'RS256') throw new Error('alg');
  const jwk = (await getKeys()).find(k => k.kid === head.kid);
  if (!jwk) throw new Error('kid');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u(s), new TextEncoder().encode(h + '.' + p));
  if (!ok || pay.aud !== pid || pay.iss !== 'https://securetoken.google.com/' + pid || pay.exp < Date.now() / 1000 || !pay.sub) throw new Error('invalid');
  return pay.sub;
}

/* ---------- database helpers ---------- */
const row = async (env, col, id) => { const r = await env.DB.prepare('SELECT data FROM docs WHERE col=?1 AND id=?2').bind(col, id).first(); return r ? JSON.parse(r.data) : null; };
const put = (env, col, id, data) => env.DB.prepare('INSERT INTO docs(col,id,data) VALUES(?1,?2,?3) ON CONFLICT(col,id) DO UPDATE SET data=excluded.data').bind(col, id, JSON.stringify(data)).run();

function ctxOf(env, uid) {
  const c = { env, uid, m: {}, signedIn: !!uid };
  c.get = async (col, id) => { const k = col + '/' + id; if (!(k in c.m)) c.m[k] = await row(env, col, id); return c.m[k]; };
  c.isAdmin = async () => !!uid && !!(await c.get('admins', uid));
  c.teacher = async () => uid ? c.get('teachers', uid) : null;
  c.isTeacher = async () => { if (await c.isAdmin()) return true; const t = await c.teacher(); return !!t && t.verified === true; };
  c.sameCenter = async cn => { if (await c.isAdmin()) return true; if (!(await c.isTeacher())) return false; return ((await c.teacher()).center || '') === (cn || ''); };
  return c;
}

/* ---------- who may read what ---------- */
async function canRead(c, col, id, d) {
  switch (col) {
    case 'nics': case 'barcodes': case 'pending': case 'settings': return true;
    case 'admins': case 'teachers': case 'changeRequests': return c.signedIn && (c.uid === id || await c.isAdmin());
    case 'students':
      if (!c.signedIn) return false; if (c.uid === id) return true;
      return d ? await c.sameCenter(d.center) : await c.isTeacher();
    case 'papers': if (await c.isTeacher()) return true; return c.signedIn && (!d || d.published === true);
    case 'marks': {
      if (await c.isTeacher()) return true; if (!c.signedIn) return false; if (!d) return true;
      const s = await c.get('students', c.uid); if (!s || d.nic !== skeyOf(s)) return false;
      const p = await c.get('papers', d.pid); return !!p && p.published === true;
    }
    case 'fileLists': {
      if (await c.isTeacher()) return true; if (!c.signedIn) return false;
      const s = await c.get('students', c.uid); return !!s && String(s.batch || '').split(' ')[0] === id;
    }
  }
  return false;
}

/* ---------- who may write what ---------- */
async function canWrite(c, col, id, ex, patch, final) {
  const isNew = !ex, adm = await c.isAdmin(), s = c.signedIn;
  const changed = Object.keys(patch).filter(k => JSON.stringify(patch[k]) !== JSON.stringify(ex && ex[k]));
  switch (col) {
    case 'admins': case 'fileLists': case 'settings': return adm;
    case 'teachers':
      if (adm) return true; if (!s || c.uid !== id) return false;
      if (isNew) { if (final.verified !== false) return false; const reg = await c.get('settings', 'registration'); return !(reg && reg.teacherSignupOpen === false); }
      return (final.verified ?? false) === (ex.verified ?? false) && (final.nickname ?? '') === (ex.nickname ?? '');
    case 'students':
      if (adm) return true;
      if (isNew) return s && c.uid === id && final.verified === false;
      if (s && c.uid === id && changed.every(k => ['mobile', 'whatsapp', 'school', 'payMethod'].includes(k))) return true;
      return (await c.sameCenter(ex.center)) && (final.verified ?? false) === (ex.verified ?? false);
    case 'changeRequests': return adm || (s && c.uid === id && final.uid === c.uid && final.status === 'pending');
    case 'nics': case 'barcodes': return isNew && s && final.uid === c.uid;
    case 'pending': return await c.sameCenter(final.center || '');
    case 'papers': if (adm) return true; return !isNew && (await c.isTeacher()) && changed.every(k => k === 'published');
    case 'marks': return id === final.pid + '_' + final.nic && await c.sameCenter(final.center || '');
  }
  return false;
}
async function canDelete(c, col, id, ex) {
  const adm = await c.isAdmin();
  switch (col) {
    case 'admins': return adm && !(ex && ex.owner === true) && c.uid !== id;
    case 'students': return ex ? await c.sameCenter(ex.center) : false;
    case 'changeRequests': case 'papers': case 'fileLists': case 'settings': return adm;
    case 'nics': case 'barcodes': return await c.isTeacher();
    case 'pending': return c.signedIn;
    case 'marks': return ex ? await c.sameCenter(ex.center) : c.signedIn;
  }
  return false;
}

const clean = d => { const o = {}; for (const [k, v] of Object.entries(d || {})) o[k] = (v && typeof v === 'object' && v.__ts) ? Date.now() : v; return o; };

/* ---------- request handler ---------- */
async function handle(b, uid, env) {
  const c = ctxOf(env, uid), { op, col } = b; let id = b.id;
  if (op !== 'myranks' && !COLS.includes(col)) deny('Unknown collection');
  if (op === 'get') {
    const d = await c.get(col, String(id));
    if (!(await canRead(c, col, String(id), d))) deny();
    return { data: d };
  }
  if (op === 'myranks') {
    /* each student sees only their OWN rank, and only if they are in the top 100 of that paper across all centers (Online center ignored) */
    if (!c.signedIn) deny();
    const s = await c.get('students', c.uid); if (!s) deny();
    const key = skeyOf(s), batch = s.batch || '2027 A/L', ranks = {};
    const papers = (await env.DB.prepare("SELECT id,data FROM docs WHERE col='papers'").all()).results || [];
    for (const r of papers) {
      const p = JSON.parse(r.data);
      if (p.published !== true || (p.batch || '2027 A/L') !== batch) continue;
      const rows = ((await env.DB.prepare("SELECT data FROM docs WHERE col='marks' AND COALESCE(json_extract(data,'$.pid'),'')=?1").bind(r.id).all()).results || []).map(x => JSON.parse(x.data));
      const mine = rows.find(x => x.nic === key);
      if (!mine || ONLINE_RE.test(s.center || '')) { ranks[r.id] = null; continue; }
      const rank = 1 + rows.filter(x => !ONLINE_RE.test(x.center || '') && x.mark > mine.mark).length;
      ranks[r.id] = rank <= 100 ? rank : null;
    }
    return { ranks };
  }
  if (op === 'list') {
    let wh = (b.where || []).filter(w => w.op === '==' && /^\w+$/.test(w.f));
    const only = (f, v) => { wh = [...wh.filter(w => w.f !== f), { f, op: '==', v }]; };
    if (col === 'students' || col === 'pending') {
      if (!(await c.isAdmin())) { if (!(await c.isTeacher())) deny(); only('center', (await c.teacher()).center || ''); }
    } else if (col === 'papers') { if (!(await c.isTeacher())) { if (!c.signedIn) deny(); only('published', true); } }
    else if (col === 'marks' || col === 'fileLists') { if (!(await c.isTeacher())) deny(); }
    else if (['admins', 'teachers', 'changeRequests', 'nics', 'barcodes'].includes(col)) { if (!(await c.isAdmin())) deny(); }
    else deny();
    const params = [col]; let sql = 'SELECT id,data FROM docs WHERE col=?1';
    wh.forEach(w => { params.push(w.v === true ? 1 : w.v === false ? 0 : w.v); sql += ` AND COALESCE(json_extract(data,'$.${w.f}'),'')=?${params.length}`; });
    const r = await env.DB.prepare(sql).bind(...params).all();
    return { docs: (r.results || []).map(x => ({ id: x.id, data: JSON.parse(x.data) })) };
  }
  if (op === 'set' || op === 'update' || op === 'add') {
    if (op === 'add') id = crypto.randomUUID().replace(/-/g, '').slice(0, 20);
    id = String(id);
    const ex = await c.get(col, id), patch = clean(b.data);
    if (op === 'update' && !ex) throw new Missing('No such record.');
    const final = (op === 'update' || (op === 'set' && b.merge)) ? { ...(ex || {}), ...patch } : patch;
    if (JSON.stringify(final).length > 200000) deny('Record too large.');
    if (!(await canWrite(c, col, id, ex, patch, final))) deny();
    await put(env, col, id, final);
    return { id };
  }
  if (op === 'delete') {
    id = String(id);
    const ex = await c.get(col, id);
    if (!(await canDelete(c, col, id, ex))) deny();
    await env.DB.prepare('DELETE FROM docs WHERE col=?1 AND id=?2').bind(col, id).run();
    return { ok: true };
  }
  deny('Unknown operation');
}

const worker = {
  async fetch(req, env) {
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
    const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
    let b; try { b = await req.json(); } catch { return json({ error: 'Bad request' }, 400); }
    let uid = null; const a = req.headers.get('Authorization') || '';
    if (a.startsWith('Bearer ')) { try { uid = await verify(a.slice(7), env.FIREBASE_PROJECT_ID); } catch { return json({ error: 'Please log in again.', code: 'unauthenticated' }, 401); } }
    try { return json(await handle(b, uid, env)); }
    catch (e) {
      if (e instanceof Deny) return json({ error: e.message || 'You do not have permission to do that.', code: 'permission-denied' }, 403);
      if (e instanceof Missing) return json({ error: e.message, code: 'not-found' }, 404);
      return json({ error: 'Server error', code: 'internal' }, 500);
    }
  }
};

export const onRequest = ({ request, env }) => worker.fetch(request, env);
