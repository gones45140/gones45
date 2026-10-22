/* ═══════════════════════════════════════════════════════════════════════════
   GONES45 — ELO TENNIS PAR SURFACE (20261020r, « tennisabstract.com peut pas nous aider malgré leur bordel ? »)
   ───────────────────────────────────────────────────────────────────────────
   SONDÉ PAR ANTOINE (console sur tennisabstract.com/reports/atp_elo_ratings.html, 20/10) : plus grand tableau = 560 lignes,
   colonnes « Elo Rank | Player | Age | Elo | | hElo Rank | hElo | cElo Rank | cElo | gElo Rank | gElo | | Peak Elo | Peak Month | |
   ATP Rank | Log diff » (Sinner 2296.9 / dur 2234.3 / terre 2186.8 / gazon 2100.5). Page WTA : wta_elo_ratings.html (même forme supposée).
   Lu par le ROBOT seulement (curl, côté GitHub), au plus une fois tous les 6 jours → données/elo_tennis.json
   { maj, atp: { nomNormalisé: [nom, elo, dur, terre, gazon] }, wta: {…} }. L'appli lit ce fichier (raw.githubusercontent), JAMAIS le site.
   Données de Jeff Sackmann (Tennis Abstract) : usage non commercial — à revoir le jour d'un abonnement payant.
   ═══════════════════════════════════════════════════════════════════════════ */
import { execFile } from 'node:child_process';
import fs from 'node:fs';

const FICHIER = 'données/elo_tennis.json';
let J = null; try { J = JSON.parse(fs.readFileSync(FICHIER, 'utf8')); } catch (e) {}

const curl = (url) => new Promise((ok) => execFile('curl', ['-sS', '-L', '--max-time', '40', '-A', 'Mozilla/5.0 (GONES45 robot hebdomadaire)', url], { maxBuffer: 16 * 1024 * 1024 }, (err, out) => {
  if (err) console.log('  ' + url + ' → ' + String((err && err.message) || err).split('\n').slice(-2).join(' ').slice(0, 200));
  ok(err ? '' : out);
}));
/* 21/10 (1er passage : « atp : 0 joueurs lus » en 70 ms = curl en échec immédiat sur tennisabstract.com sans www) : plusieurs adresses
   essayées dans l'ordre, l'erreur de curl est écrite dans le journal du robot. */
const ADR = (lg) => ['https://www.tennisabstract.com', 'http://www.tennisabstract.com', 'https://tennisabstract.com', 'http://tennisabstract.com'].map((b) => b + '/reports/' + lg + '_elo_ratings.html');
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
const txt = (h) => String(h || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
const num = (s) => { const n = parseFloat(String(s).replace(',', '.')); return isNaN(n) ? null : Math.round(n * 10) / 10; };

/* plus grand tableau → lignes → colonnes repérées par l'EN-TÊTE (Player, Elo, hElo, cElo, gElo) */
export function lireElo(html) {
  const tabs = String(html).split(/<table[\s>]/i).slice(1).map((t) => t.split(/<\/table>/i)[0]);
  if (!tabs.length) return {};
  const t = tabs.sort((a, b) => (b.match(/<tr/gi) || []).length - (a.match(/<tr/gi) || []).length)[0];
  const rows = t.split(/<tr[\s>]/i).slice(1).map((r) => (r.match(/<t[dh][^>]*>[\s\S]*?(?=<t[dh][\s>]|<\/tr>|$)/gi) || []).map(txt));
  const head = rows.find((r) => r.some((c) => /^player$/i.test(c))) || [];
  const col = (n) => head.findIndex((c) => c.toLowerCase() === n.toLowerCase());
  const iP = col('Player'), iE = col('Elo'), iH = col('hElo'), iC = col('cElo'), iG = col('gElo');
  /* 20261023g (capture d'Antoine : « c'est quoi la différence de logarithme ? on y voit le classement ATP » → « oui ») : + rang Elo, rang ATP / WTA,
     Log diff (= ln(rang Elo) − ln(rang ATP) : > 0 classement ATP flatteur, < 0 joueur meilleur que son classement) → r[5], r[6], r[7]. */
  const iER = col('Elo Rank'), iTR = head.findIndex((c) => /^(atp|wta) rank$/i.test(c)), iLD = head.findIndex((c) => /log diff/i.test(c));
  const ent = (x) => { const n = parseInt(String(x).replace(/[^\d]/g, ''), 10); return isNaN(n) ? null : n; };
  const ld = (x) => { const n = parseFloat(String(x).replace(',', '.').replace('−', '-')); return isNaN(n) ? null : Math.round(n * 100) / 100; };
  if (iP < 0 || iE < 0) return {};
  const out = {};
  rows.forEach((r) => {
    if (r === head || !r[iP] || num(r[iE]) == null) return;
    out[norm(r[iP])] = [r[iP], num(r[iE]), iH >= 0 ? num(r[iH]) : null, iC >= 0 ? num(r[iC]) : null, iG >= 0 ? num(r[iG]) : null,
      iER >= 0 ? ent(r[iER]) : null, iTR >= 0 ? ent(r[iTR]) : null, iLD >= 0 ? ld(r[iLD]) : null];
  });
  return out;
}

/* 20261023f — VITESSE DES COURTS (lien d'Antoine tennisabstract.com/reports/atp_surface_speed.html ; SONDÉ par Antoine en console :
   tableau 6 = 63 lignes « Date ; Tournament ; Surface ; Ace% ; Surface Speed », ex. « 2026-02-02 ; Montpellier ; Hard ; 19.8% ; 1.49 » ;
   52 dernières semaines, > 1 = plus rapide que la moyenne, d'après le taux d'aces). Page WTA wta_surface_speed.html supposée de même forme.
   → données/vitesse_tennis.json { maj, atp: { nomNormalisé: [nom, vitesse, surface, date] }, wta: {…} } (le plus récent par tournoi). */
export function lireVitesse(html) {
  const tabs = String(html).split(/<table[\s>]/i).slice(1).map((t) => t.split(/<\/table>/i)[0]);
  const out = {};
  for (const t of tabs) {
    const rows = t.split(/<tr[\s>]/i).slice(1).map((r) => (r.match(/<t[dh][^>]*>[\s\S]*?(?=<t[dh][\s>]|<\/tr>|$)/gi) || []).map(txt));
    const head = rows.find((r) => r.some((c) => /surface speed/i.test(c))); if (!head) continue;
    const col = (re) => head.findIndex((c) => re.test(c));
    const iD = col(/^date$/i), iT = col(/^tournament$/i), iS = col(/^surface$/i), iV = col(/surface speed/i);
    if (iT < 0 || iV < 0) continue;
    rows.forEach((r) => {
      if (r === head) return; const v = parseFloat(r[iV]); if (!r[iT] || isNaN(v)) return;
      const k = norm(r[iT]), d = iD >= 0 ? r[iD] : '';
      if (!out[k] || d > out[k][3]) out[k] = [r[iT], Math.round(v * 100) / 100, iS >= 0 ? r[iS] : '', d];
    });
  }
  return out;
}
/* 20261023h (capture d'Antoine mcp_leaders_tactics_men_last52.html, « ok » pour contrôler les styles faits à la main) : Match Charting Project,
   tableau « Player | Matches | SnV Freq | … | RallyAgg | ReturnAgg » (titres lus par l'en-tête) → données/tactique_tennis.json
   { atp / wta : { nomNorm: [nom, matchs, rallyAgg, returnAgg, snvFreq %, net %] } }. Sert à CONTRÔLER styles_tennis.json, pas dans l'avis. */
export function lireTactique(html) {
  const tabs = String(html).split(/<table[\s>]/i).slice(1).map((t) => t.split(/<\/table>/i)[0]);
  const out = {};
  for (const t of tabs) {
    const rows = t.split(/<tr[\s>]/i).slice(1).map((r) => (r.match(/<t[dh][^>]*>[\s\S]*?(?=<t[dh][\s>]|<\/tr>|$)/gi) || []).map(txt));
    const head = rows.find((r) => r.some((c) => /rally ?agg/i.test(c))); if (!head) continue;
    const col = (re) => head.findIndex((c) => re.test(c));
    const iP = col(/^player$/i), iM = col(/^match/i), iR = col(/rally ?agg/i), iT = col(/return ?agg/i), iS = col(/snv ?freq/i), iN = col(/net ?freq/i);
    if (iP < 0 || iR < 0) continue;
    const f = (x) => { const n = parseFloat(String(x).replace('%', '').replace(',', '.')); return isNaN(n) ? null : n; };
    rows.forEach((r) => { if (r === head || !r[iP] || f(r[iR]) == null) return;
      out[norm(r[iP])] = [r[iP], iM >= 0 ? f(r[iM]) : null, f(r[iR]), iT >= 0 ? f(r[iT]) : null, iS >= 0 ? f(r[iS]) : null, iN >= 0 ? f(r[iN]) : null]; });
  }
  return out;
}
/* 20261023i (« moi peu, Bruno et JP adorent » les jeux / tie-breaks) : STATS DE SERVICE match par match. SONDÉ par Antoine en console :
   leaders.cgi charge jsmatches/leadersource.js (2,6 Mo), variables ychoices, tchoices, cchoices, rchoices, ochoices, matchmx ; matchmx = lignes
   du point de vue d'un joueur : [0 date AAAAMMJJ, 1 tournoi, 2 surface Hard / Clay / Grass, 3 niveau, 4 W / L, 5 joueur, …, 10 score (du
   vainqueur), 11 sets max, 12 adversaire, …, 26 minutes, 27 aces, 28 DF, 29 pts de service, 30 1res in, 31 1res gagnées, 32 2es gagnées,
   33 jeux de service, 34 BP sauvées, 35 BP subies, puis l'adversaire 36 aces … 44 BP subies] (format Jeff Sackmann). 52 dernières semaines,
   par joueur et par surface → données/service_tennis.json { atp / wta : { nomNorm: { nom, t: {…}, Hard: {…}, Clay, Grass } } } avec
   n matchs, tg % jeux de service gagnés, br % jeux de retour gagnés, ac % aces, df % doubles fautes, sp % pts gagnés au service,
   rp % pts gagnés au retour, tb tie-breaks par match, jx jeux par set. WTA : nom de fichier supposé (leadersource_wta.js), essayé. */
export function lireService(js, depuis) {
  const m = String(js).match(/var\s+matchmx\s*=\s*(\[[\s\S]*?\]\s*\]);/); if (!m) return {};
  let L = []; try { L = JSON.parse(m[1]); } catch (e) { return {}; }
  const out = {}, N = (x) => { const n = parseInt(x, 10); return isNaN(n) ? null : n; };
  L.forEach((r) => {
    if (!Array.isArray(r) || r.length < 45 || String(r[0]) < depuis) return;
    const v = r.slice(26, 45).map(N); if (v.slice(1).some((x) => x == null) || !(v[3] > 0) || !(v[7] > 0) || !(v[12] > 0) || !(v[16] > 0)) return;
    const sets = String(r[10] || '').split(' ').filter((x) => /^\d+-\d+/.test(x)); if (!sets.length || /RET|W\/O|DEF/i.test(r[10])) return;
    const tb = sets.filter((x) => /^(7-6|6-7)/.test(x)).length, jx = sets.reduce((s2, x) => { const g = x.match(/^(\d+)-(\d+)/); return s2 + (+g[1]) + (+g[2]); }, 0);
    const k = norm(r[5]), o = out[k] = out[k] || { nom: r[5] };
    for (const sf of ['t', r[2]]) {
      const a = o[sf] = o[sf] || { n: 0, sg: 0, br: 0, rg: 0, rb: 0, ac: 0, df: 0, sp: 0, sw: 0, rp: 0, rw: 0, tb: 0, st: 0, jx: 0 };
      a.n++; a.sg += v[7]; a.br += v[9] - v[8]; a.rg += v[16]; a.rb += v[18] - v[17]; a.ac += v[1]; a.df += v[2]; a.sp += v[3]; a.sw += v[5] + v[6];
      a.rp += v[12]; a.rw += v[12] - v[14] - v[15]; a.tb += tb; a.st += sets.length; a.jx += jx;
    }
  });
  const pc = (x, y) => (y ? Math.round(x / y * 1000) / 10 : null);
  Object.values(out).forEach((o) => Object.keys(o).forEach((sf) => { if (sf === 'nom') return; const a = o[sf];
    o[sf] = { n: a.n, tg: pc(a.sg - a.br, a.sg), br: pc(a.rb, a.rg), ac: pc(a.ac, a.sp), df: pc(a.df, a.sp), sp: pc(a.sw, a.sp), rp: pc(a.rw, a.rp),
      tb: Math.round(a.tb / a.n * 100) / 100, jx: Math.round(a.jx / a.st * 10) / 10 }; }));
  return out;
}
if (process.argv[1] && process.argv[1].endsWith('elo.mjs')) {
  try {
    const FS = 'données/service_tennis.json'; let S0 = null; try { S0 = JSON.parse(fs.readFileSync(FS, 'utf8')); } catch (e) {}
    if (!(S0 && S0.maj && Date.now() - Date.parse(S0.maj) < 6 * 864e5) || process.env.FORCE === '1') {
      const depuis = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10).replace(/-/g, '');
      const rs = { maj: new Date().toISOString(), depuis, source: 'tennisabstract.com leadersource (Jeff Sackmann), 52 semaines' };
      /* 22/10 soir : top 50 = leadersource.js (50 joueurs), Challengers = leadersource_chall.js (SONDÉ) ; 51-100 et WTA : noms supposés, essayés
         (le journal dit lesquels existent). Fusion : le grand circuit d'abord, Challengers seulement pour les joueurs absents (marqués c: 1). */
      for (const [lg, fs2] of [['atp', ['leadersource.js', 'leadersource_51.js', 'leadersource_51100.js', 'leadersource_51-100.js', 'leadersource2.js', 'leadersource_chall.js']],
        ['wta', ['leadersource_wta.js', 'leadersourcewta.js', 'wleadersource.js', 'leadersource_wta51.js', 'leadersource_wta_51.js', 'leadersource_wta51100.js', 'wleadersource_51.js']]]) {
        const t = {};
        for (const f of fs2) {
          const x = lireService(await curl('https://www.tennisabstract.com/jsmatches/' + f), depuis), n = Object.keys(x).length;
          if (!n) continue; console.log('  service ' + lg + ' : ' + f + ' → ' + n + ' joueurs');
          Object.keys(x).forEach((k) => { if (!t[k]) { t[k] = x[k]; if (/chall/.test(f)) t[k].c = 1; } });
        }
        rs[lg] = Object.keys(t).length >= 20 ? t : ((S0 && S0[lg]) || {});
        console.log('service ' + lg + ' : ' + Object.keys(t).length + ' joueurs');
      }
      if (Object.keys(rs.atp).length || Object.keys(rs.wta).length) fs.writeFileSync(FS, JSON.stringify(rs));
    }
  } catch (e) { console.log('service : erreur ' + (e && e.message)); }
  try {
    const FT = 'données/tactique_tennis.json'; let T0 = null; try { T0 = JSON.parse(fs.readFileSync(FT, 'utf8')); } catch (e) {}
    if (!(T0 && T0.maj && Date.now() - Date.parse(T0.maj) < 6 * 864e5) || process.env.FORCE === '1') {
      const rt = { maj: new Date().toISOString(), source: 'tennisabstract.com Match Charting Project (Jeff Sackmann), 52 semaines' };
      for (const [lg, g] of [['atp', 'men'], ['wta', 'women']]) {
        let t = {};
        for (const b of ['https://www.tennisabstract.com', 'https://tennisabstract.com']) { t = lireTactique(await curl(b + '/reports/mcp_leaders_tactics_' + g + '_last52.html')); if (Object.keys(t).length >= 10) break; }
        rt[lg] = Object.keys(t).length >= 10 ? t : ((T0 && T0[lg]) || {});
        console.log('tactique ' + lg + ' : ' + Object.keys(t).length + ' joueurs lus');
      }
      if (Object.keys(rt.atp).length || Object.keys(rt.wta).length) fs.writeFileSync(FT, JSON.stringify(rt));
    }
  } catch (e) { console.log('tactique : erreur ' + (e && e.message)); }
  try {
    const FV = 'données/vitesse_tennis.json'; let V0 = null; try { V0 = JSON.parse(fs.readFileSync(FV, 'utf8')); } catch (e) {}
    if (!(V0 && V0.maj && Date.now() - Date.parse(V0.maj) < 6 * 864e5) || process.env.FORCE === '1') {
      const rv = { maj: new Date().toISOString(), source: 'tennisabstract.com surface speed (Jeff Sackmann)' };
      for (const lg of ['atp', 'wta']) {
        let t = {};
        for (const b of ['https://www.tennisabstract.com', 'https://tennisabstract.com', 'http://www.tennisabstract.com']) { t = lireVitesse(await curl(b + '/reports/' + lg + '_surface_speed.html')); if (Object.keys(t).length >= 10) break; }
        rv[lg] = Object.keys(t).length >= 10 ? t : ((V0 && V0[lg]) || {});
        console.log('vitesse ' + lg + ' : ' + Object.keys(t).length + ' tournois lus');
      }
      if (Object.keys(rv.atp).length || Object.keys(rv.wta).length) fs.writeFileSync(FV, JSON.stringify(rv));
    } else console.log('Vitesse des courts à jour (' + V0.maj + ')');
  } catch (e) { console.log('vitesse : erreur ' + (e && e.message)); }
  if (J && J.maj && Date.now() - Date.parse(J.maj) < 6 * 864e5 && process.env.FORCE !== '1') { console.log('Elo tennis à jour (' + J.maj + ')'); process.exit(0); }
  const res = { maj: new Date().toISOString(), source: 'tennisabstract.com (Jeff Sackmann)' };
  for (const lg of ['atp', 'wta']) {
    let t = {};
    for (const u of ADR(lg)) { t = lireElo(await curl(u)); if (Object.keys(t).length >= 50) { console.log('  lu sur ' + u); break; } }
    res[lg] = Object.keys(t).length >= 50 ? t : ((J && J[lg]) || {});
    console.log(lg + ' : ' + Object.keys(t).length + ' joueurs lus' + (Object.keys(t).length < 50 ? ' (ancien fichier gardé)' : ''));
  }
  if (!Object.keys(res.atp).length && !Object.keys(res.wta).length) { console.log('⚠️ rien lu : fichier inchangé'); process.exit(0); }
  fs.writeFileSync(FICHIER, JSON.stringify(res));
}
