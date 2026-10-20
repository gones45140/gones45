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

const curl = (url) => new Promise((ok) => execFile('curl', ['-sS', '-L', '--max-time', '40', '-A', 'Mozilla/5.0 (GONES45 robot hebdomadaire)', url], { maxBuffer: 16 * 1024 * 1024 }, (err, out) => ok(err ? '' : out)));
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

if (process.argv[1] && process.argv[1].endsWith('elo.mjs')) {
  if (J && J.maj && Date.now() - Date.parse(J.maj) < 6 * 864e5 && process.env.FORCE !== '1') { console.log('Elo tennis à jour (' + J.maj + ')'); process.exit(0); }
  const res = { maj: new Date().toISOString(), source: 'tennisabstract.com (Jeff Sackmann)' };
  for (const lg of ['atp', 'wta']) {
    const t = lireElo(await curl('https://tennisabstract.com/reports/' + lg + '_elo_ratings.html'));
    res[lg] = Object.keys(t).length >= 50 ? t : ((J && J[lg]) || {});
    console.log(lg + ' : ' + Object.keys(t).length + ' joueurs lus' + (Object.keys(t).length < 50 ? ' (ancien fichier gardé)' : ''));
  }
  if (!Object.keys(res.atp).length && !Object.keys(res.wta).length) { console.log('⚠️ rien lu : fichier inchangé'); process.exit(0); }
  fs.writeFileSync(FICHIER, JSON.stringify(res));
}
