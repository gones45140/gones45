/* 20261022e — SONDE : les fichiers de Jeff Sackmann (Tennis Abstract) sur GitHub sont-ils à jour ? (« Style de jeu, Abstract le donne pas ? »)
   Lecture seule, rien n'est écrit. Affiche : taille, nombre de lignes, en-tête, dernière date de tournoi. */
import { execFileSync } from 'node:child_process';
const B = 'https://raw.githubusercontent.com/JeffSackmann/';
const F = ['tennis_atp/master/atp_matches_2026.csv', 'tennis_atp/master/atp_matches_2025.csv', 'tennis_wta/master/wta_matches_2026.csv',
  'tennis_wta/master/wta_matches_2025.csv', 'tennis_atp/master/atp_players.csv', 'tennis_atp/master/atp_rankings_current.csv',
  'tennis_MatchChartingProject/master/charting-m-matches.csv'];
for (const f of F) {
  let t = '';
  try { t = execFileSync('curl', ['-sS', '-L', '--max-time', '60', '-w', '\n%{http_code}', B + f], { maxBuffer: 256 * 1024 * 1024 }).toString(); } catch (e) { console.log(f + ' : erreur ' + e.message); continue; }
  const i = t.lastIndexOf('\n'), code = t.slice(i + 1), body = t.slice(0, i), L = body.split('\n').filter(Boolean);
  console.log('\n=== ' + f + ' : HTTP ' + code + ' · ' + L.length + ' lignes · ' + body.length + ' octets');
  if (code !== '200') continue;
  console.log('en-tête : ' + (L[0] || '').slice(0, 400));
  const h = (L[0] || '').split(','), id = h.indexOf('tourney_date'), ir = h.indexOf('ranking_date');
  const col = id >= 0 ? id : ir;
  if (col >= 0) { let mx = ''; L.slice(1).forEach((l) => { const v = l.split(',')[col]; if (v > mx) mx = v; }); console.log('dernière date : ' + mx); }
  console.log('dernière ligne : ' + (L[L.length - 1] || '').slice(0, 300));
}
