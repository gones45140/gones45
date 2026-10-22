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
const M = [];
for (const lg of ['uefa.champions', 'uefa.europa', 'uefa.europa.conf']) {
  for (const y of [2023, 2024, 2025]) {
    for (let mo = 0; mo < 11; mo++) {
      const d0 = new Date(Date.UTC(y, 6 + mo, 1)), d1 = new Date(Date.UTC(y, 7 + mo, 0)), f = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');
      let B = {}; try { B = JSON.parse(await curl('https://site.api.espn.com/apis/site/v2/sports/soccer/' + lg + '/scoreboard?limit=500&dates=' + f(d0) + '-' + f(d1))); } catch (e) {}
      (B.events || []).forEach((e) => { const c = (e.competitions || [])[0] || {}; if (!((c.status || {}).type || {}).completed) return;
        const h = (c.competitors || []).find((q) => q.homeAway === 'home'), a = (c.competitors || []).find((q) => q.homeAway === 'away'); if (!h || !a) return;
        M.push({ lg, y, h: h.team.displayName, a: a.team.displayName, sh: +h.score, sa: +a.score }); });
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
  L.push({ lg: m.lg, ratio, ratio2, dom: grosDom, gG, gP }); });
console.log('matchs ESPN : ' + M.length + ' · avec les deux coefficients : ' + L.length + ' · sans : ' + sansCoef);
const tranche = (r) => (r < 1.5 ? '1 · moins de 1,5 fois' : (r < 2.5 ? '2 · 1,5 à 2,5 fois' : (r < 4 ? '3 · 2,5 à 4 fois' : (r < 7 ? '4 · 4 à 7 fois' : '5 · 7 fois et plus'))));
const stat = (X) => { const n = X.length || 1, p = (f) => Math.round(X.filter(f).length / n * 1000) / 10;
  return { n: X.length, grosGagne: p((x) => x.gG > x.gP), nul: p((x) => x.gG === x.gP), petitGagne: p((x) => x.gG < x.gP), butsMoy: Math.round(X.reduce((s, x) => s + x.gG + x.gP, 0) / n * 100) / 100,
    plus25: p((x) => x.gG + x.gP > 2.5), moins35: p((x) => x.gG + x.gP < 3.5), btts: p((x) => x.gG > 0 && x.gP > 0), grosSansEncaisser: p((x) => x.gP === 0), grosPar2: p((x) => x.gG - x.gP >= 2) }; };
const T = {}; L.forEach((x) => { (T[tranche(x.ratio)] = T[tranche(x.ratio)] || []).push(x); });
const T2 = {}; L.forEach((x) => { (T2[tranche(x.ratio2)] = T2[tranche(x.ratio2)] || []).push(x); });
res.tableau = Object.keys(T).sort().map((k) => Object.assign({ tranche: k }, stat(T[k])));
res.tableau2saisons = Object.keys(T2).sort().map((k) => Object.assign({ tranche: k }, stat(T2[k])));
res.parCoupe = ['uefa.champions', 'uefa.europa', 'uefa.europa.conf'].map((lg) => ({ lg, tableau: Object.keys(T).sort().map((k) => Object.assign({ tranche: k }, stat(T[k].filter((x) => x.lg === lg)))) }));
console.log('\n===== ÉCART 5 SAISONS =====\n' + res.tableau.map((x) => JSON.stringify(x)).join('\n'));
console.log('\n===== ÉCART 2 DERNIÈRES SAISONS =====\n' + res.tableau2saisons.map((x) => JSON.stringify(x)).join('\n'));
fs.writeFileSync('données/coupes_europe.json', JSON.stringify(res));
