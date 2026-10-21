/* ═══════════════════════════════════════════════════════════════════════════
   GONES45 — 🧪 TEST DE L'AVIS TENNIS SUR LA SAISON PASSÉE (20261021p)
   ───────────────────────────────────────────────────────────────────────────
   Bruno (groupe « Bets 4 us ») : « faire des essais en variant ces coefficients, étudier les résultats pour trouver le bon équilibre »,
   « chaque surface risque d'avoir un réglage différent » ; Antoine : « TEST SAISON passée on peut le faire ici ? » → « OUI ».

   1. ouvre le VRAI site dans Chromium (ESPN servi par curl, comme tendances.mjs) ;
   2. choisit ~90 joueurs ATP + ~90 WTA de 2025 (scoreboards ESPN 2025 + adversaires les plus fréquents) ;
   3. lit leurs saisons 2024 + 2025 avec les fonctions de l'appli (_g45TnSaison) ;
   4. pour chaque match 2025 entre deux de ces joueurs, recalcule chaque facteur de l'avis (_g45TnCalc / _g45TnAvis) avec SEULEMENT les
      matchs joués AVANT ce match ;
   5. hors du navigateur : précision du réglage standard, puis recherche du meilleur réglage par surface sur janvier-juin 2025, vérifié
      sur juillet-décembre 2025 (un réglage qui ne gagne que sur ce qu'il a appris ne compte pas).
   LIMITE : Elo et classement = ceux d'AUJOURD'HUI (trop favorables sur 2025) → aussi une version « sans Elo ni classement ».
   Écrit données/backtest_tennis.json (commit par le workflow). Rien ne change dans l'appli.
   ═══════════════════════════════════════════════════════════════════════════ */
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright';

const SITE = process.env.SITE || 'https://gones45140.github.io/gones45/';
const AN = Number(process.env.AN || 2025);
const PAR_LIGUE = Number(process.env.PAR_LIGUE || 90);
const FICHIER = 'données/backtest_tennis.json';

function curl(url) {
  return new Promise((ok) => {
    execFile('curl', ['-sS', '-L', '--max-time', '25', '-w', '\n%{http_code}', url], { maxBuffer: 32 * 1024 * 1024 }, (err, out) => {
      if (err && !out) return ok({ status: 502, body: '{}' });
      const i = out.lastIndexOf('\n');
      ok({ status: Number(out.slice(i + 1)) || 502, body: out.slice(0, i) });
    });
  });
}
const ESPN_HOTES = /^https:\/\/(site\.api\.espn\.com|sports\.core\.api\.espn\.com|site\.web\.api\.espn\.com)\//;

const nav = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await nav.newPage({ viewport: { width: 412, height: 900 } });
page.on('pageerror', (e) => console.log('Erreur JS :', e.message));
page.on('console', (m) => { const t = m.text(); if (/^\[bt\]/.test(t)) console.log(t); });
let nEspn = 0, nKo = 0;
await page.route('**/*', async (route) => {
  const u = route.request().url();
  let cible = null;
  if (ESPN_HOTES.test(u)) cible = u;
  else {
    const m = /^https:\/\/fd-proxy\.[^/]+\/?\?host=espn(web)?&path=([^&]+)/.exec(u);
    if (m) cible = 'https://' + (m[1] ? 'site.web.api.espn.com' : 'site.api.espn.com') + decodeURIComponent(m[2]);
  }
  if (!cible) return route.continue();
  const r = await curl(cible); nEspn++; if (r.status !== 200) nKo++;
  return route.fulfill({ status: r.status, body: r.body, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });
});
await page.addInitScript(() => { try { localStorage.setItem('g45_guide_vu', '1'); } catch (e) {} });
await page.goto(SITE + '?robot=' + Date.now(), { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(6000);

const out = await page.evaluate(async ({ AN, PAR_LIGUE }) => {
  const log = (t) => console.log('[bt] ' + t);
  const getJ = async (u) => { try { const r = await fetch(u); return r.ok ? await r.json() : null; } catch (e) { return null; } };
  try { await window._g45TnEloCharger(); } catch (e) {}
  const LG = ['atp', 'wta'], J = { atp: {}, wta: {} };
  /* 1. joueurs vus dans les scoreboards ESPN de l'année (un jour tous les 9 jours) */
  for (const lg of LG) {
    for (let d = new Date(AN, 0, 6); d.getFullYear() === AN; d.setDate(d.getDate() + 9)) {
      const ds = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
      const j = await getJ('https://site.api.espn.com/apis/site/v2/sports/tennis/' + lg + '/scoreboard?dates=' + ds);
      ((j && j.events) || []).forEach((e) => (e.groupings || []).forEach((g) => {
        if (!/singles/i.test((g.grouping && g.grouping.displayName) || '')) return;
        (g.competitions || []).forEach((c) => (c.competitors || []).forEach((x) => {
          const id = String(x.id || ''); if (!id) return;
          const o = J[lg][id] = J[lg][id] || { id, n: (x.athlete && x.athlete.displayName) || '', rk: 0, vu: 0 };
          o.vu++; const rk = x.curatedRank && x.curatedRank.current; if (rk > 0 && rk < 500) o.rk = rk;
        }));
      }));
    }
    log(lg + ' : ' + Object.keys(J[lg]).length + ' joueurs vus dans les scoreboards ' + AN);
  }
  /* 2. on garde les plus présents (classés d'abord), saisons AN + AN-1 */
  const pool = async (L, n, f) => { let i = 0; const R = []; await Promise.all(Array.from({ length: n }, async () => { while (i < L.length) { const k = i++; R[k] = await f(L[k]); } })); return R; };
  const H = {}, NOM = {}, RK = {};
  for (const lg of LG) {
    let L = Object.values(J[lg]).sort((a, b) => (a.rk || 999) - (b.rk || 999) || b.vu - a.vu).slice(0, PAR_LIGUE);
    let fait = 0;
    await pool(L, 3, async (p) => {
      let m = [];
      for (const an of [AN - 1, AN]) { try { m = m.concat(await window._g45TnSaison(lg, p.id, an) || []); } catch (e) {} }
      H[lg + ':' + p.id] = m; NOM[lg + ':' + p.id] = p.n; RK[lg + ':' + p.id] = p.rk || 0;
      if (++fait % 10 === 0) log(lg + ' : ' + fait + ' / ' + L.length + ' joueurs lus');
    });
  }
  /* 3. matchs AN entre deux joueurs lus → facteurs connus AVANT le match */
  const K = ['elo', 'rang', 'surf', 'forme', 'prec', 'h2h', 'fat', 'aut'], rows = [], vu = {};
  const un = (k) => { const W = {}; K.forEach((x) => { W[x] = x === k ? 10 : 0; }); return W; };
  for (const cle of Object.keys(H)) {
    const lg = cle.split(':')[0];
    H[cle].forEach((m) => {
      if (new Date(m.t).getFullYear() !== AN || !m.id || vu[m.id]) return;
      const cB = lg + ':' + m.adv; if (!H[cB]) return; vu[m.id] = 1;
      const avant = (L) => L.filter((x) => x.t < m.t);
      const ctxA = { sf: m.sf, ind: m.ind, cat: m.cat, ek: m.ek, adv: m.adv, py: m.py, now: m.t - 60e3 };
      const ctxB = Object.assign({}, ctxA, { adv: cle.split(':')[1] });
      const A = window._g45TnCalc(avant(H[cle]), ctxA), B = window._g45TnCalc(avant(H[cB]), ctxB);
      A.elo = window._g45TnEloDe(lg, NOM[cle] || '', m.sf); B.elo = window._g45TnEloDe(lg, NOM[cB] || m.an || '', m.sf);
      const f = {};
      K.forEach((k) => { const V = window._g45TnAvis(A, B, RK[cle], RK[cB], un(k)); if (V) f[k] = [Math.round(V.p * 1e4) / 1e4, V.n]; });
      rows.push({ lg, sf: m.sf, t: m.t, w: m.w ? 1 : 0, cat: m.cat, f });
    });
  }
  log(rows.length + ' matchs ' + AN + ' entre joueurs lus');
  return { rows, nJ: Object.keys(H).length };
}, { AN, PAR_LIGUE });
await nav.close();
console.log('ESPN : ' + nEspn + ' lectures, ' + nKo + ' en échec');

/* ── 4. analyse ── */
const K = ['elo', 'rang', 'surf', 'forme', 'prec', 'h2h', 'fat', 'aut'];
const STD = { elo: 7, rang: 2, surf: 5, forme: 4, prec: 2, h2h: 2, fat: 0, aut: 1 };
const MI = Date.UTC(AN, 6, 1);
const prob = (r, W) => { let a = 0, b = 0; for (const k of K) { const x = r.f[k]; if (!x || !W[k]) continue; a += W[k] * x[1] * x[0]; b += W[k] * x[1]; } return b ? a / b : null; };
const score = (R, W) => { let ok = 0, n = 0, br = 0; for (const r of R) { const p = prob(r, W); if (p == null || p === 0.5) continue; n++; if ((p > 0.5) === !!r.w) ok++; br += (p - r.w) ** 2; } return { p: n ? Math.round(ok / n * 1000) / 10 : null, n, br: n ? br / n : 1 }; };
const meilleur = (R, bloque) => {
  const ok = (W) => { bloque.forEach((k) => { W[k] = 0; }); return W; };
  const val = (W) => { const s = score(R, W); return s.n < 20 ? -1 : s.p - s.br; };
  let best = ok(Object.assign({}, STD)), bv = val(best);
  for (let i = 0; i < 2500; i++) { const W = ok(Object.fromEntries(K.map((k) => [k, Math.floor(Math.random() * 11)]))); const v = val(W); if (v > bv) { bv = v; best = W; } }
  for (let tour = 0; tour < 3; tour++) for (const k of K) { if (bloque.includes(k)) continue; for (let x = 0; x <= 10; x++) { const W = Object.assign({}, best, { [k]: x }); const v = val(W); if (v > bv) { bv = v; best = W; } } }
  return best;
};
const R = out.rows, res = { date: new Date().toISOString(), an: AN, joueurs: out.nJ, matchs: R.length, surfaces: {} };
for (const sf of ['toutes', 'dur', 'salle', 'terre', 'gazon']) {
  const L = R.filter((r) => sf === 'toutes' || r.sf === sf), tr = L.filter((r) => r.t < MI), te = L.filter((r) => r.t >= MI);
  const o = { n: L.length, appr: tr.length, verif: te.length, seul: {} };
  K.forEach((k) => { o.seul[k] = score(L, { [k]: 1 }); });   // chaque facteur tout seul, sur toute l'année
  o.standard = { appr: score(tr, STD), verif: score(te, STD), annee: score(L, STD) };
  for (const [nom, bl] of [['complet', []], ['sansEloRang', ['elo', 'rang']]]) {
    const W = meilleur(tr, bl);
    o[nom] = { W, appr: score(tr, W), verif: score(te, W) };
  }
  o.standardSansEloRang = { verif: score(te, Object.assign({}, STD, { elo: 0, rang: 0 })) };
  res.surfaces[sf] = o;
}
fs.mkdirSync('données', { recursive: true });
fs.writeFileSync(FICHIER, JSON.stringify(res, null, 1));
/* résumé lisible dans le journal */
const lib = { elo: 'Elo', rang: 'Classement', surf: 'Surface 2 mois', forme: 'Forme', prec: 'Tournoi préc.', h2h: 'Face-à-face', fat: 'Fatigue', aut: 'Niveau/tournoi/salle/pays' };
console.log('\n===== RÉSUMÉ (' + res.matchs + ' matchs ' + AN + ', ' + res.joueurs + ' joueurs) =====');
for (const [sf, o] of Object.entries(res.surfaces)) {
  console.log('\n## ' + sf.toUpperCase() + ' : ' + o.n + ' matchs (appris ' + o.appr + ' · vérifié ' + o.verif + ')');
  console.log('Standard : vérif ' + o.standard.verif.p + ' % (' + o.standard.verif.n + ') · année ' + o.standard.annee.p + ' %');
  console.log('Standard sans Elo ni classement : vérif ' + o.standardSansEloRang.verif.p + ' %');
  for (const nom of ['complet', 'sansEloRang']) console.log('Meilleur ' + nom + ' : appris ' + o[nom].appr.p + ' % · VÉRIF ' + o[nom].verif.p + ' % (' + o[nom].verif.n + ') · ' + K.map((k) => k + ' ' + o[nom].W[k]).join(', '));
  console.log('Seul : ' + K.map((k) => lib[k] + ' ' + o.seul[k].p + ' % (' + o.seul[k].n + ')').join(' · '));
}
