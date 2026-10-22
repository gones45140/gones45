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
/* 20261022h : styles de jeu remplis à la main (données/styles_tennis.json, clé = nom en lettres seules) */
let STYLES = { atp: {}, wta: {} }; try { STYLES = JSON.parse(fs.readFileSync('données/styles_tennis.json', 'utf8')); } catch (e) {}
const cleNom = (n) => String(n || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');

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
          const o = J[lg][id] = J[lg][id] || { id, n: (x.athlete && x.athlete.displayName) || '', rk: 0, vu: 0, pays: (x.athlete && x.athlete.flag && x.athlete.flag.alt) || '' };
          o.vu++; const rk = x.curatedRank && x.curatedRank.current; if (rk > 0 && rk < 500) o.rk = rk;
        }));
      }));
    }
    log(lg + ' : ' + Object.keys(J[lg]).length + ' joueurs vus dans les scoreboards ' + AN);
  }
  /* 2. on garde les plus présents (classés d'abord), saisons AN + AN-1 */
  const pool = async (L, n, f) => { let i = 0; const R = []; await Promise.all(Array.from({ length: n }, async () => { while (i < L.length) { const k = i++; R[k] = await f(L[k]); } })); return R; };
  const H = {}, NOM = {}, RK = {}, NAT = {}, AGE = {};
  for (const lg of LG) {
    let L = Object.values(J[lg]).sort((a, b) => (a.rk || 999) - (b.rk || 999) || b.vu - a.vu).slice(0, PAR_LIGUE);
    let fait = 0;
    await pool(L, 3, async (p) => {
      let m = [];
      for (const an of [AN - 1, AN]) { try { m = m.concat(await window._g45TnSaison(lg, p.id, an) || []); } catch (e) {} }
      H[lg + ':' + p.id] = m; NOM[lg + ':' + p.id] = p.n; RK[lg + ':' + p.id] = p.rk || 0;
      /* 20261022f : critères de JP à tester — nationalité (code pays du drapeau ESPN, même table que les tournois) et âge */
      try { const P = window._g45TnPays(', ' + (p.pays || '')); NAT[lg + ':' + p.id] = (P && P.f) || ''; } catch (e) {}
      try { const pr = await window._g45TnProfil(p.id); if (pr && pr.age) AGE[lg + ':' + p.id] = pr.age; } catch (e) {}
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
      /* 20261022f : extras (JP) — loc : +1 si A joue chez lui (pas B), −1 l'inverse ; âges au jour du match ; bilan au même tour et en finale */
      const rdN = (x) => String(x || '').replace(/\s*-\s.*$/, '').trim();
      const tourBil = (L, r) => { const z = L.filter((x) => rdN(x.rd) === r); return [z.filter((x) => x.w).length, z.length]; };
      const r0 = rdN(m.rd), ans = (Date.now() - m.t) / (365.25 * 864e5);
      const lA = !!(NAT[cle] && NAT[cle] === m.pf), lB = !!(NAT[cB] && NAT[cB] === m.pf);
      const ex = { loc: (lA ? 1 : 0) - (lB ? 1 : 0), aA: AGE[cle] ? AGE[cle] - ans : null, aB: AGE[cB] ? AGE[cB] - ans : null, rd: r0,
        tA: tourBil(avant(H[cle]), r0), tB: tourBil(avant(H[cB]), r0), fA: tourBil(avant(H[cle]), 'Final'), fB: tourBil(avant(H[cB]), 'Final') };
      ex.nA = NOM[cle] || ''; ex.nB = NOM[cB] || m.an || '';
      ex.cp = NAT[cle] && NAT[cle] === NAT[cB] ? (lA ? 2 : 1) : 0;
      /* 20261023e : bilan dans la même « tournée » (surface + période, _g45TnPer) avant le match */
      const perK = window._g45TnPer(m.sf, m.t, m.ct), perB = (L) => { const z = L.filter((x) => window._g45TnPer(x.sf, x.t, x.ct) === perK); return [z.filter((x) => x.w).length, z.length]; };
      ex.qA = perB(avant(H[cle])); ex.qB = perB(avant(H[cB]));   /* 20261022y (Bruno) : duel de deux compatriotes (2 = chez eux) */
      rows.push({ lg, sf: m.sf, t: m.t, w: m.w ? 1 : 0, cat: m.cat, f, ex });
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
/* ── 20261022f : critères de JP (joueur local, âge, bilan au même tour, bilan en finale) ── */
const pc = (a, b) => b ? Math.round(a / b * 1000) / 10 : null;
const X = { per: [0, 0], loc: [0, 0], jeune: [0, 0], jeuneVsVieux: [0, 0], tour: [0, 0], finale: [0, 0], poly: [0, 0], acd: [0, 0] };
const exS = (r) => { const e = r.ex || {}, o = {};
  if (e.loc) o.loc = e.loc > 0 ? 0.65 : 0.35;
  if (e.aA != null && e.aB != null && Math.abs(e.aA - e.aB) >= 3) o.age = e.aA < e.aB ? 0.6 : 0.4;
  if (e.tA && e.tB && e.tA[1] >= 3 && e.tB[1] >= 3) o.tour = (e.tA[0] / e.tA[1] + 0.01) / (e.tA[0] / e.tA[1] + e.tB[0] / e.tB[1] + 0.02);
  if (e.qA && e.qB && e.qA[1] >= 5 && e.qB[1] >= 5) o.per = (e.qA[0] / e.qA[1] + 0.01) / (e.qA[0] / e.qA[1] + e.qB[0] / e.qB[1] + 0.02);   // 20261023e
  if (e.rd === 'Final' && e.fA && e.fB && e.fA[1] >= 2 && e.fB[1] >= 2) o.fin = (e.fA[0] / e.fA[1] + 0.01) / (e.fA[0] / e.fA[1] + e.fB[0] / e.fB[1] + 0.02);
  /* 20261022j : styles — poly = un seul des deux est « Polyvalent » ; acd = sur dur, attaquant contre contreur */
  const sA = ((STYLES[r.lg] || {})[cleNom(e.nA)] || [])[1], sB = ((STYLES[r.lg] || {})[cleNom(e.nB)] || [])[1];
  if (sA && sB && (sA === 'Polyvalent') !== (sB === 'Polyvalent')) o.poly = sA === 'Polyvalent' ? 0.6 : 0.4;
  if (r.sf === 'dur' && ((sA === 'Attaquant fond de court' && sB === 'Contreur / limeur') || (sB === 'Attaquant fond de court' && sA === 'Contreur / limeur'))) o.acd = sA === 'Attaquant fond de court' ? 0.6 : 0.4;
  return o; };
R.forEach((r) => { const e = r.ex || {};
  if (e.loc) { X.loc[1]++; if ((e.loc > 0) === !!r.w) X.loc[0]++; }
  if (e.aA != null && e.aB != null && Math.abs(e.aA - e.aB) >= 3) { X.jeune[1]++; if ((e.aA < e.aB) === !!r.w) X.jeune[0]++; }
  if (e.aA != null && e.aB != null && ((e.aA < 23 && e.aB > 30) || (e.aB < 23 && e.aA > 30))) { X.jeuneVsVieux[1]++; if ((e.aA < e.aB) === !!r.w) X.jeuneVsVieux[0]++; }
  const s = exS(r);
  if (s.tour != null && s.tour !== 0.5) { X.tour[1]++; if ((s.tour > 0.5) === !!r.w) X.tour[0]++; }
  if (s.fin != null && s.fin !== 0.5) { X.finale[1]++; if ((s.fin > 0.5) === !!r.w) X.finale[0]++; }
  if (s.per != null && s.per !== 0.5) { X.per[1]++; if ((s.per > 0.5) === !!r.w) X.per[0]++; }
  ['poly', 'acd'].forEach((k) => { if (s[k] != null) { X[k][1]++; if ((s[k] > 0.5) === !!r.w) X[k][0]++; } }); });
res.extras = { seul: Object.fromEntries(Object.entries(X).map(([k, v]) => [k, { p: pc(v[0], v[1]), n: v[1] }])), ajout: {} };
/* ajouté au standard : poids 1 à 6 (sur 20), précision sur la 2e moitié de l'année, comparée au standard seul */
const probX = (r, W, k, w) => { let a = 0, b = 0; for (const kk of K) { const x = r.f[kk]; if (!x || !W[kk]) continue; a += W[kk] * x[1] * x[0]; b += W[kk] * x[1]; }
  const s = exS(r)[k]; if (s != null && w) { a += w * s; b += w; } return b ? a / b : null; };
const scoreX = (L, k, w) => { let ok = 0, n = 0; for (const r of L) { const p = probX(r, STD, k, w); if (p == null || p === 0.5) continue; n++; if ((p > 0.5) === !!r.w) ok++; } return { p: n ? Math.round(ok / n * 1000) / 10 : null, n }; };
const TE = R.filter((r) => r.t >= MI), TR = R.filter((r) => r.t < MI);
for (const k of ['per', 'loc', 'age', 'tour', 'fin', 'poly', 'acd']) res.extras.ajout[k] = [0, 1, 2, 3, 4, 6].map((w) => ({ w, appr: scoreX(TR, k, w).p, verif: scoreX(TE, k, w).p }));
/* ── 20261022h : STYLES — pour chaque duel de styles différents : % de victoires du 1er style, comparé à ce que l'avis standard prévoyait
   (écart positif = le style apporte quelque chose que l'avis ne voit pas) ── */
const stDe = (lg, n) => { const x = (STYLES[lg] || {})[cleNom(n)]; return x ? x[1] : null; };
const DU = {};
R.forEach((r) => { const e = r.ex || {}, a = stDe(r.lg, e.nA), b = stDe(r.lg, e.nB); if (!a || !b || a === b) return;
  const p = prob(r, STD); if (p == null) return;
  const [s1, s2, w, pp] = a < b ? [a, b, r.w, p] : [b, a, 1 - r.w, 1 - p];
  for (const sf of ['toutes', r.sf]) { const k = s1 + ' contre ' + s2 + ' · ' + sf; const o = DU[k] = DU[k] || { n: 0, w: 0, pr: 0 }; o.n++; o.w += w; o.pr += pp; } });
res.styles = Object.entries(DU).filter(([k, o]) => o.n >= 15).map(([k, o]) => ({ duel: k, n: o.n, reel: Math.round(o.w / o.n * 1000) / 10, prevu: Math.round(o.pr / o.n * 1000) / 10, ecart: Math.round((o.w - o.pr) / o.n * 1000) / 10 }))
  .sort((x, y) => Math.abs(y.ecart) - Math.abs(x.ecart));
res.stylesCouverts = R.filter((r) => r.ex && stDe(r.lg, r.ex.nA) && stDe(r.lg, r.ex.nB)).length;
console.log('\n===== STYLES (' + res.stylesCouverts + ' matchs avec 2 styles connus) =====\n' + res.styles.map((x) => x.duel + ' : réel ' + x.reel + ' % / prévu ' + x.prevu + ' % (écart ' + x.ecart + ', ' + x.n + ' matchs)').join('\n'));
/* ── 20261022y (Bruno : « autre facteur important : le lieu, tout comme un duel de deux compatriotes ») : réel CONTRE ce que l'avis standard
   prévoyait (le 52 % brut du joueur local ne tenait pas compte du niveau : beaucoup d'invités locaux sont outsiders). Écart > 0 = l'avis
   sous-estime ce cas. Compatriotes : le FAVORI de l'avis gagne-t-il moins que prévu ? ── */
const LC = { local: { n: 0, w: 0, pr: 0 }, localFav: { n: 0, w: 0, pr: 0 }, localOut: { n: 0, w: 0, pr: 0 }, compat: { n: 0, w: 0, pr: 0 }, compatLocal: { n: 0, w: 0, pr: 0 } };
const ajLC = (o, w, pp) => { o.n++; o.w += w; o.pr += pp; };
R.forEach((r) => { const e = r.ex || {}, p = prob(r, STD); if (p == null) return;
  if (e.loc) { const w = e.loc > 0 ? r.w : 1 - r.w, pp = e.loc > 0 ? p : 1 - p; ajLC(LC.local, w, pp); ajLC(pp > 0.5 ? LC.localFav : LC.localOut, w, pp); }
  if (e.cp && p !== 0.5) { const fw = (p > 0.5) === !!r.w ? 1 : 0, pm = Math.max(p, 1 - p); ajLC(LC.compat, fw, pm); if (e.cp === 2) ajLC(LC.compatLocal, fw, pm); } });
res.lieuCompat = Object.fromEntries(Object.entries(LC).filter(([k, o]) => o.n).map(([k, o]) => [k, { n: o.n, reel: Math.round(o.w / o.n * 1000) / 10, prevu: Math.round(o.pr / o.n * 1000) / 10, ecart: Math.round((o.w - o.pr) / o.n * 1000) / 10 }]));
console.log('\n===== LIEU / COMPATRIOTES (réel / prévu par l\'avis) =====\n' + Object.entries(res.lieuCompat).map(([k, x]) => k + ' : réel ' + x.reel + ' % / prévu ' + x.prevu + ' % (écart ' + x.ecart + ', ' + x.n + ' matchs)').join('\n'));
/* ── 20261022l : CALIBRAGE — quand l'avis standard dit X % pour le favori, combien de fois le favori gagne-t-il vraiment ? (par tranche de 5 %) ── */
const CAL = {};
R.forEach((r) => { const p = prob(r, STD); if (p == null || p === 0.5) return; const pm = Math.max(p, 1 - p), fw = (p > 0.5) === !!r.w;
  const k = Math.min(90, Math.floor(pm * 100 / 5) * 5); const o = CAL[k] = CAL[k] || { n: 0, w: 0, s: 0 }; o.n++; o.s += pm; if (fw) o.w++; });
res.calib = Object.keys(CAL).sort((a, b) => a - b).map((k) => ({ tranche: k + (k == 90 ? '+' : '-' + (+k + 5)) + ' %', n: CAL[k].n, avis: Math.round(CAL[k].s / CAL[k].n * 1000) / 10, reel: Math.round(CAL[k].w / CAL[k].n * 1000) / 10 }));
console.log('\n===== CALIBRAGE =====\n' + res.calib.map((x) => x.tranche + ' : avis ' + x.avis + ' % → réel ' + x.reel + ' % (' + x.n + ')').join('\n'));
fs.mkdirSync('données', { recursive: true });
fs.writeFileSync(FICHIER, JSON.stringify(res, null, 1));
/* 20261023g (« même pour de la lecture gratuite pour tester, on aurait vite une réponse ») : l'avis BET45 de CHAQUE match (notre calcul,
   aucune cote dedans) → données/backtest_tennis_matchs.json ; croisé À PART avec les cotes 2025 téléchargées à la main par Antoine
   (tennis-data.co.uk, usage particulier) dans une session, jamais copiées dans le dépôt. [ligue, date AAAA-MM-JJ, joueur A, joueur B, p(A gagne), A a gagné, surface] */
fs.writeFileSync('données/backtest_tennis_matchs.json', JSON.stringify(R.map((r) => { const p = prob(r, STD); const e = r.ex || {};
  return [r.lg, new Date(r.t).toISOString().slice(0, 10), e.nA || '', e.nB || '', p == null ? null : Math.round(p * 1000) / 1000, r.w ? 1 : 0, r.sf]; })));
/* résumé lisible dans le journal */
const lib = { elo: 'Elo', rang: 'Classement', surf: 'Surface 2 mois', forme: 'Forme', prec: 'Tournoi préc.', h2h: 'Face-à-face', fat: 'Fatigue', aut: 'Niveau/tournoi/salle/pays' };
console.log('\n===== CRITÈRES DE JP =====\n' + JSON.stringify(res.extras.seul) + '\n' + Object.entries(res.extras.ajout).map(([k, v]) => k + ' : ' + v.map((x) => 'w' + x.w + ' ' + x.appr + '/' + x.verif).join(' · ')).join('\n'));
console.log('\n===== RÉSUMÉ (' + res.matchs + ' matchs ' + AN + ', ' + res.joueurs + ' joueurs) =====');
for (const [sf, o] of Object.entries(res.surfaces)) {
  console.log('\n## ' + sf.toUpperCase() + ' : ' + o.n + ' matchs (appris ' + o.appr + ' · vérifié ' + o.verif + ')');
  console.log('Standard : vérif ' + o.standard.verif.p + ' % (' + o.standard.verif.n + ') · année ' + o.standard.annee.p + ' %');
  console.log('Standard sans Elo ni classement : vérif ' + o.standardSansEloRang.verif.p + ' %');
  for (const nom of ['complet', 'sansEloRang']) console.log('Meilleur ' + nom + ' : appris ' + o[nom].appr.p + ' % · VÉRIF ' + o[nom].verif.p + ' % (' + o[nom].verif.n + ') · ' + K.map((k) => k + ' ' + o[nom].W[k]).join(', '));
  console.log('Seul : ' + K.map((k) => lib[k] + ' ' + o.seul[k].p + ' % (' + o.seul[k].n + ')').join(' · '));
}
