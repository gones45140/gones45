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
  if (iP < 0 || iE < 0) return {};
  const out = {};
  rows.forEach((r) => {
    if (r === head || !r[iP] || num(r[iE]) == null) return;
    out[norm(r[iP])] = [r[iP], num(r[iE]), iH >= 0 ? num(r[iH]) : null, iC >= 0 ? num(r[iC]) : null, iG >= 0 ? num(r[iG]) : null];
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
if (process.argv[1] && process.argv[1].endsWith('elo.mjs')) {
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
