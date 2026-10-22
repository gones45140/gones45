/* GONES45 — CALAGE de l'estimation « Service / retour » (20261023k : Collignon – Lehecka annoncé 25,6 jeux et 53 % de tie-break, réel 6-4 6-2).
   Rejoue la simulation de l'appli (_g45TnSvSim, copiée depuis app.js) sur les matchs des 52 dernières semaines de Tennis Abstract (mêmes fichiers
   que elo.mjs), compare au vrai score (jeux, tie-break, set de l'outsider) et cherche le réglage qui colle le mieux :
   tenue = tenue estimée − d (d de 0 à 0,10), écart entre les deux joueurs × k. Écrit données/calibrage_service.json. Rien ne change dans l'appli. */
import fs from 'node:fs';
import { execFile } from 'node:child_process';
import { lireService } from './elo.mjs';
const curl = (url) => new Promise((ok) => execFile('curl', ['-sS', '-L', '--max-time', '60', '-A', 'Mozilla/5.0 (GONES45 calage)', url], { maxBuffer: 64 * 1024 * 1024 }, (e, out) => ok(e ? '' : out)));
const app = fs.readFileSync('app.js', 'utf8'), a = app.indexOf('window._g45TnSvSim = function'), b = app.indexOf('window._g45TnSvHtml = function');
const window = {}; eval(app.slice(a, b));
const depuis = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10).replace(/-/g, '');
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
const res = { date: new Date().toISOString() };
for (const [lg, files, moyBr] of [['atp', ['leadersource.js', 'leadersource51.js', 'leadersource_chall.js'], 0.21], ['wta', ['leadersource_wta.js', 'leadersource51_wta.js'], 0.32]]) {
  const S = {}, M = [], vu = new Set();
  for (const f of files) {
    let js = ''; for (const base of ['https://www.tennisabstract.com', 'http://www.tennisabstract.com']) { js = await curl(base + '/jsmatches/' + f); if (js.length > 1000) break; }
    const x = lireService(js, depuis); Object.keys(x).forEach((k) => { if (!S[k]) S[k] = x[k]; });
    const mm = js.match(/var\s+matchmx\s*=\s*(\[[\s\S]*?\]\s*\]);/); if (!mm) { console.log(lg + ' ' + f + ' : rien'); continue; }
    JSON.parse(mm[1]).forEach((r) => {
      if (String(r[0]) < depuis || !r[10] || /RET|W\/O|DEF/i.test(r[10])) return;
      const k = r[0] + '|' + [norm(r[5]), norm(r[12])].sort().join('|'); if (vu.has(k)) return; vu.add(k);
      const sets = String(r[10]).split(' ').filter((x2) => /^\d+-\d+/.test(x2)); if (!sets.length) return;
      M.push({ a: norm(r[5]), b: norm(r[12]), sf: r[2], bo: +r[11] === 5 ? 3 : 2, aw: r[4] === 'W', jx: sets.reduce((s2, x2) => { const g = x2.match(/^(\d+)-(\d+)/); return s2 + (+g[1]) + (+g[2]); }, 0),
        tb: sets.some((x2) => /^(7-6|6-7)/.test(x2)) ? 1 : 0, sets: sets.map((x2) => { const g = x2.match(/^(\d+)-(\d+)/); return +g[1] > +g[2]; }) });
    });
  }
  const st = (k, sf) => { const o = S[k]; if (!o) return null; const x = o[sf] && o[sf].n >= 5 ? o[sf] : o.t; return x && x.n >= 5 ? x : null; };
  const L = M.map((m) => ({ m, A: st(m.a, m.sf), B: st(m.b, m.sf) })).filter((x) => x.A && x.B);
  console.log(lg + ' : ' + M.length + ' matchs, ' + L.length + ' avec les stats des deux joueurs');
  const eval1 = (d, k) => {
    let e = { n: 0, jxP: 0, jxR: 0, br20: 0, br22: 0, brTb: 0, brSet: 0, tbP: 0, tbR: 0, o22P: 0, o22R: 0 };
    for (const { m, A, B } of L) {
      const cl = (x) => Math.max(0.4, Math.min(0.97, x));
      let hA = A.tg / 100 - (B.br / 100 - moyBr), hB = B.tg / 100 - (A.br / 100 - moyBr); const mo = (hA + hB) / 2;
      hA = cl(mo + (hA - mo) * k - d); hB = cl(mo + (hB - mo) * k - d);
      const R = window._g45TnSvSim(hA, hB, m.bo);
      // vainqueur du match = « a » si m.aw ; score du vainqueur → sets gagnés par a = sets où le vainqueur gagne si a a gagné
      const setsA = m.sets.filter((w) => (m.aw ? w : !w)).length, setsB = m.sets.length - setsA, favA = hA >= hB;
      e.n++; e.jxP += R.jx; e.jxR += m.jx; e.tbP += R.tb; e.tbR += m.tb; e.o22P += R.o22; e.o22R += m.jx > 22.5 ? 1 : 0;
      e.br20 += (R.o20 - (m.jx > 20.5 ? 1 : 0)) ** 2; e.br22 += (R.o22 - (m.jx > 22.5 ? 1 : 0)) ** 2; e.brTb += (R.tb - m.tb) ** 2;
      const pOut = favA ? R.setB : R.setA, rOut = (favA ? setsB : setsA) > 0 ? 1 : 0; e.brSet += (pOut - rOut) ** 2;
    }
    const n = e.n || 1;
    return { d, k, n: e.n, jxPrevu: +(e.jxP / n).toFixed(2), jxReel: +(e.jxR / n).toFixed(2), tbPrevu: +(e.tbP / n).toFixed(3), tbReel: +(e.tbR / n).toFixed(3),
      o22Prevu: +(e.o22P / n).toFixed(3), o22Reel: +(e.o22R / n).toFixed(3), brier: +((e.br20 + e.br22 + e.brTb + e.brSet) / 4 / n).toFixed(4) };
  };
  const grille = [];
  for (const d of [0, 0.02, 0.04, 0.06, 0.08, 0.1]) for (const k of [0.6, 0.8, 1, 1.2, 1.5]) grille.push(eval1(d, k));
  grille.sort((x, y) => x.brier - y.brier);
  res[lg] = { actuel: eval1(0, 1), meilleur: grille[0], top5: grille.slice(0, 5) };
  console.log(lg + ' ACTUEL : ' + JSON.stringify(res[lg].actuel) + '\n' + lg + ' MEILLEUR : ' + JSON.stringify(res[lg].meilleur));
}
fs.writeFileSync('données/calibrage_service.json', JSON.stringify(res, null, 1));
