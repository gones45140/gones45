/* GONES45 — COUPES D'EUROPE : ÉCART DE COEFFICIENT UEFA → RÉSULTATS RÉELS (20261023m)
   Antoine : « les stats foot qu'on sort, c'est surtout en championnat, très peu en coupe d'Europe » ; Barça – Viking « on rigole sur les stats » ;
   « mieux prendre le coeff du club directement, global et 2 dernières saisons » ; « on doit pouvoir trouver de combien est l'écart et en tirer
   une conclusion ». SONDÉ par Antoine : kassiesa.net/uefa/data/method5/trank2026.html = « # | | club | pays | 21/22 … 25/26 | Total | Part »
   (uefa.com interdit la lecture automatique : kassiesa recalcule les mêmes coefficients). Saison qui commence l'année Y → classement trankY.
   Matchs : ESPN scoreboard des 3 coupes, saisons 2023-24 → 2025-26 (mois par mois). Écrit données/coupes_europe.json :
   { maj, clubs: { annee: { nomNorm: [nom, pays, total 5 saisons, 2 dernières saisons, part du pays] } }, tableau: [...par tranche d'écart] }.
   Rien ne change dans l'appli. */
import fs from 'node:fs';
import { execFile } from 'node:child_process';
const curl = (url) => new Promise((ok) => execFile('curl', ['-sS', '-L', '--max-time', '40', '-A', 'Mozilla/5.0 (GONES45 coupes)', url], { maxBuffer: 32 * 1024 * 1024 }, (e, out) => ok(e ? '' : out)));
const txt = (h) => String(h || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
const GEN = new Set(['fc', 'afc', 'cf', 'sc', 'ac', 'as', 'sk', 'fk', 'nk', 'ss', 'us', 'sv', 'vfb', 'vfl', 'tsg', 'club', 'de', 'cd', 'rc', 'rcd', 'ud', 'sl', 'sad', 'calcio', 'football', 'futbol', 'clube', 'the', 'bk', 'if', 'ik', 'aik', 'jk', 'ks', 'pfc', 'fcsb', 'rb', '1', '1899', '1909', '05', '04']);
const ALIAS = { munchen: 'munich', munich: 'munich', internazionale: 'inter', milano: 'milan', 'paris': 'paris', psv: 'psv', sporting: 'sporting', lisboa: 'lisbon', lisbon: 'lisbon', koln: 'cologne', praha: 'prague', beograd: 'belgrade', crvena: 'red', zvezda: 'star', sankt: 'st' };
const toks = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((t) => t && !GEN.has(t)).map((t) => ALIAS[t] || t);
function lireClubs(html) {
  const out = {}, rows = String(html).split(/<tr[\s>]/i).slice(1).map((r) => (r.match(/<t[dh][^>]*>[\s\S]*?(?=<t[dh][\s>]|<\/tr>|$)/gi) || []).map(txt));
  rows.forEach((r) => {
    if (r.length < 9 || !/^\d+$/.test(r[0])) return;
    const iN = r.findIndex((c, i) => i > 0 && /[a-z]/i.test(c) && c.length > 2), pays = r[iN + 1], nums = r.slice(iN + 2).map((c) => parseFloat(c));
    if (iN < 0 || nums.length < 7) return;
    const s = nums.slice(0, 5).map((x) => (isNaN(x) ? 0 : x)), tot = nums[5], part = nums[6];
    out[toks(r[iN]).join(' ')] = [r[iN], pays, isNaN(tot) ? 0 : tot, s[3] + s[4], isNaN(part) ? 0 : part];
  });
  return out;
}
const res = { maj: new Date().toISOString(), source: 'kassiesa.net (coefficients UEFA recalculés) + ESPN (scores)', clubs: {} };
for (const y of [2023, 2024, 2025, 2026, 2027]) {
  let c = {}; for (const b of ['https://kassiesa.net', 'http://kassiesa.net', 'https://www.kassiesa.net']) { c = lireClubs(await curl(b + '/uefa/data/method5/trank' + y + '.html')); if (Object.keys(c).length > 50) break; }
  res.clubs[y] = c; console.log('coefficients clubs ' + y + ' : ' + Object.keys(c).length);
}
const trouver = (annee, nom) => {
  const C = res.clubs[annee] || {}, t = toks(nom); if (!t.length) return null;
  let best = null, bs = 0;
  for (const k of Object.keys(C)) { const u = k.split(' '); const com = t.filter((x) => u.includes(x)).length; const sc = com / Math.max(t.length, u.length); if (sc > bs) { bs = sc; best = C[k]; } }
  return bs >= 0.5 ? best : null;
};
const M = []; let dbg = 0;
/* ESPN : même appel que tendances.mjs (sans en-tête navigateur) */
const curlEspn = (url) => new Promise((ok) => execFile('curl', ['-sS', '-L', '--compressed', '--max-time', '40', url], { maxBuffer: 32 * 1024 * 1024 }, (e, out) => ok(e ? 'ERREUR ' + String(e.message).slice(0, 150) : out)));
for (const lg of ['uefa.champions', 'uefa.europa', 'uefa.europa.conf']) {
  for (const y of [2023, 2024, 2025]) {
    /* SONDÉ par le robot : ?dates=AAAAMMJJ-AAAAMMJJ → 400 « Failed to get events endpoint » → un appel PAR JOUR, seulement mardi / mercredi /
       jeudi (jours de coupe d'Europe, tours préliminaires compris), de juillet à juin, 6 appels en parallèle. */
    const jours = []; for (let t = Date.UTC(y, 6, 1); t < Date.UTC(y + 1, 5, 15); t += 864e5) { const d = new Date(t); if ([2, 3, 4].includes(d.getUTCDay())) jours.push(d.toISOString().slice(0, 10).replace(/-/g, '')); }
    for (let i = 0; i < jours.length; i += 6) {
      await Promise.all(jours.slice(i, i + 6).map(async (dd) => {
        const u = 'https://site.api.espn.com/apis/site/v2/sports/soccer/' + lg + '/scoreboard?dates=' + dd;
        let B = {}, brut = await curlEspn(u); try { B = JSON.parse(brut); } catch (e) {}
        if (!dbg++) console.log('ESPN essai : ' + u + ' → ' + String(brut).length + ' octets');
        (B.events || []).forEach((e) => { const c = (e.competitions || [])[0] || {}; if (!((c.status || {}).type || {}).completed) return;
          const h = (c.competitors || []).find((q) => q.homeAway === 'home'), a = (c.competitors || []).find((q) => q.homeAway === 'away'); if (!h || !a) return;
          M.push({ lg, y, h: h.team.displayName, a: a.team.displayName, hi: String(h.team.id), ai: String(a.team.id), d: e.date, sh: +h.score, sa: +a.score }); });
      }));
    }
  }
}
const vu = new Set(), L = [];
let sansCoef = 0;
M.forEach((m) => { const k = m.lg + m.h + m.a + m.y + m.sh + m.sa; if (vu.has(k) || isNaN(m.sh) || isNaN(m.sa)) return; vu.add(k);
  const H = trouver(m.y, m.h), A = trouver(m.y, m.a); if (!H || !A) { sansCoef++; return; }
  const vH = Math.max(H[2], H[4], 1), vA = Math.max(A[2], A[4], 1), r2H = Math.max(H[3], 0.5), r2A = Math.max(A[3], 0.5);
  const grosDom = vH >= vA, ratio = grosDom ? vH / vA : vA / vH, ratio2 = grosDom ? r2H / r2A : r2A / r2H;
  const gG = grosDom ? m.sh : m.sa, gP = grosDom ? m.sa : m.sh;
  L.push({ lg: m.lg, ratio, ratio2, dom: grosDom, gG, gP, m }); });
console.log('mois lus : ' + dbg + ' · matchs ESPN : ' + M.length + ' · avec les deux coefficients : ' + L.length + ' · sans : ' + sansCoef);
const tranche = (r) => (r < 1.5 ? '1 · moins de 1,5 fois' : (r < 2.5 ? '2 · 1,5 à 2,5 fois' : (r < 4 ? '3 · 2,5 à 4 fois' : (r < 7 ? '4 · 4 à 7 fois' : '5 · 7 fois et plus'))));
const stat = (X) => { const n = X.length || 1, p = (f) => Math.round(X.filter(f).length / n * 1000) / 10;
  return { n: X.length, grosGagne: p((x) => x.gG > x.gP), nul: p((x) => x.gG === x.gP), petitGagne: p((x) => x.gG < x.gP), butsMoy: Math.round(X.reduce((s, x) => s + x.gG + x.gP, 0) / n * 100) / 100,
    plus25: p((x) => x.gG + x.gP > 2.5), moins35: p((x) => x.gG + x.gP < 3.5), btts: p((x) => x.gG > 0 && x.gP > 0), grosSansEncaisser: p((x) => x.gP === 0), grosPar2: p((x) => x.gG - x.gP >= 2),
    /* 20261023o (« gros club contre plus petit : est-ce que la stat du gros club passe ? ») */
    gros2buts: p((x) => x.gG >= 2), gros3buts: p((x) => x.gG >= 3), petitMarque: p((x) => x.gP >= 1), plus15: p((x) => x.gG + x.gP > 1.5), moins25: p((x) => x.gG + x.gP < 2.5),
    grosGagneDom: (() => { const D = X.filter((x) => x.dom); return D.length ? Math.round(D.filter((x) => x.gG > x.gP).length / D.length * 1000) / 10 : null; })(),
    grosGagneExt: (() => { const D = X.filter((x) => !x.dom); return D.length ? Math.round(D.filter((x) => x.gG > x.gP).length / D.length * 1000) / 10 : null; })() }; };
const T = {}; L.forEach((x) => { (T[tranche(x.ratio)] = T[tranche(x.ratio)] || []).push(x); });
const T2 = {}; L.forEach((x) => { (T2[tranche(x.ratio2)] = T2[tranche(x.ratio2)] || []).push(x); });
res.tableau = Object.keys(T).sort().map((k) => Object.assign({ tranche: k }, stat(T[k])));
res.tableau2saisons = Object.keys(T2).sort().map((k) => Object.assign({ tranche: k }, stat(T2[k])));
res.parCoupe = ['uefa.champions', 'uefa.europa', 'uefa.europa.conf'].map((lg) => ({ lg, tableau: Object.keys(T).sort().map((k) => Object.assign({ tranche: k }, stat(T[k].filter((x) => x.lg === lg)))) }));
console.log('\n===== ÉCART 5 SAISONS =====\n' + res.tableau.map((x) => JSON.stringify(x)).join('\n'));
console.log('\n===== ÉCART 2 DERNIÈRES SAISONS =====\n' + res.tableau2saisons.map((x) => JSON.stringify(x)).join('\n'));
/* ── 20261023q (« gros club contre plus petit : en prenant juste la stat du gros club, est-ce que ça passe ? » → « go ») ──
   Pour chaque match de coupe d'Europe : la stat de CHAMPIONNAT de chaque club juste AVANT le match, comme celle des tendances
   (7 derniers matchs à domicile pour le club qui reçoit, 7 derniers à l'extérieur pour l'autre ; − de 3,5 / + de 2,5 / + de 1,5 buts,
   les deux marquent), puis : la stat du GROS club seule, du PETIT seule, la MOYENNE des deux (≈ aujourd'hui) → laquelle prédit le mieux ?
   Calendrier ESPN des clubs : adresses ESSAYÉES (journal) — soccer/all/teams/<id>/schedule?season=, sinon la ligue par défaut du club. */
const CAL = {}; let essai = 0;
const jsonDe = async (u) => { try { return JSON.parse(await curlEspn(u)); } catch (e) { return null; } };
const calDe = async (id, saison) => {
  const k = id + '|' + saison; if (CAL[k]) return CAL[k];
  let ev = [];
  for (const u of ['https://site.api.espn.com/apis/site/v2/sports/soccer/all/teams/' + id + '/schedule?season=' + saison]) {
    const B = await jsonDe(u); ev = (B && B.events) || []; if (essai++ < 2) console.log('calendrier essai ' + u + ' → ' + ev.length + ' matchs');
    if (ev.length) break;
  }
  if (!ev.length) {
    const T = await jsonDe('https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/teams/' + id), dl = T && T.team && T.team.defaultLeague, slug = dl && (dl.slug || dl.abbreviation);
    if (essai++ < 4) console.log('ligue par défaut ' + id + ' → ' + JSON.stringify(dl || null).slice(0, 200));
    if (slug && !/^uefa/.test(slug)) { const B = await jsonDe('https://site.api.espn.com/apis/site/v2/sports/soccer/' + slug + '/teams/' + id + '/schedule?season=' + saison); ev = (B && B.events) || []; }
  }
  const out = [];
  ev.forEach((e) => { const c = (e.competitions || [])[0] || {}, lgS = String((e.league && e.league.slug) || (c.league && c.league.slug) || ((e.season || {}).slug) || '');
    if (/uefa|cup|coupe|copa|pokal|fa\.|friendly|club\.friendly/i.test(lgS + ' ' + ((e.league && e.league.name) || ''))) return;
    if (!((c.status || {}).type || {}).completed) return;
    const me = (c.competitors || []).find((q) => String((q.team || {}).id) === id), op = (c.competitors || []).find((q) => String((q.team || {}).id) !== id); if (!me || !op) return;
    const sc = (q) => { const v = q.score; return typeof v === 'object' && v ? +(v.value != null ? v.value : v.displayValue) : +v; };
    const g1 = sc(me), g2 = sc(op); if (isNaN(g1) || isNaN(g2)) return;
    out.push({ t: Date.parse(e.date), dom: me.homeAway === 'home', bm: g1, be: g2 }); });
  out.sort((a, b) => b.t - a.t); CAL[k] = out; return out;
};
const MARCHES = { u35: (b, c) => b + c < 3.5, o25: (b, c) => b + c > 2.5, o15: (b, c) => b + c > 1.5, btts: (b, c) => b > 0 && c > 0 };
const R2 = []; let lus = 0;
for (let i = 0; i < L.length; i += 6) {
  await Promise.all(L.slice(i, i + 6).map(async (x) => {
    const m = x.m, t = Date.parse(m.d); if (!m.hi || !t) return;
    const saison = new Date(t).getUTCMonth() >= 6 ? new Date(t).getUTCFullYear() : new Date(t).getUTCFullYear() - 1;
    const cH = (await calDe(m.hi, saison)).concat(await calDe(m.hi, saison - 1)), cA = (await calDe(m.ai, saison)).concat(await calDe(m.ai, saison - 1));
    const dH = cH.filter((z) => z.t < t - 36e5 && z.dom).slice(0, 7), dA = cA.filter((z) => z.t < t - 36e5 && !z.dom).slice(0, 7);
    if (dH.length < 5 || dA.length < 5) return; lus++;
    const o = { gros: x.dom ? 'h' : 'a', ratio: x.ratio };
    for (const [mk, f] of Object.entries(MARCHES)) o[mk] = { h: dH.filter((z) => f(z.bm, z.be)).length / dH.length, a: dA.filter((z) => f(z.bm, z.be)).length / dA.length, r: f(m.sh, m.sa) ? 1 : 0 };
    R2.push(o);
  }));
}
console.log('matchs avec les stats de championnat des deux clubs : ' + lus);
const evalM = (mk, filtre) => {
  const X = R2.filter(filtre || (() => true)), n = X.length; if (n < 20) return { n };
  const br = (f) => Math.round(X.reduce((s2, o) => s2 + (f(o) - o[mk].r) ** 2, 0) / n * 10000) / 10000;
  const gros = (o) => (o.gros === 'h' ? o[mk].h : o[mk].a), petit = (o) => (o.gros === 'h' ? o[mk].a : o[mk].h), moy = (o) => (o[mk].h + o[mk].a) / 2;
  const reel = Math.round(X.reduce((s2, o) => s2 + o[mk].r, 0) / n * 1000) / 10;
  const qd = (f, seuil) => { const Y = X.filter((o) => f(o) >= seuil); return { n: Y.length, reussite: Y.length ? Math.round(Y.reduce((s2, o) => s2 + o[mk].r, 0) / Y.length * 1000) / 10 : null }; };
  return { n, reel, brierGros: br(gros), brierPetit: br(petit), brierMoyenne: br(moy), brierConstant: br(() => reel / 100),
    gros70: qd(gros, 0.7), petit70: qd(petit, 0.7), moyenne70: qd(moy, 0.7), lesDeux70: (() => { const Y = X.filter((o) => gros(o) >= 0.7 && petit(o) >= 0.7); return { n: Y.length, reussite: Y.length ? Math.round(Y.reduce((s2, o) => s2 + o[mk].r, 0) / Y.length * 1000) / 10 : null }; })() };
};
res.statGrosClub = {};
for (const mk of Object.keys(MARCHES)) res.statGrosClub[mk] = { tous: evalM(mk), grosEcart: evalM(mk, (o) => o.ratio >= 2.5), memeNiveau: evalM(mk, (o) => o.ratio < 2.5) };
console.log('\n===== STAT DU GROS CLUB SEULE ? =====\n' + JSON.stringify(res.statGrosClub, null, 1));
L.forEach((x) => { delete x.m; });
fs.writeFileSync('données/coupes_europe.json', JSON.stringify(res));
