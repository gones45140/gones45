/* 20261022e — SONDE : les fichiers de Jeff Sackmann (Tennis Abstract) sur GitHub sont-ils à jour ? (« Style de jeu, Abstract le donne pas ? »)
   Lecture seule, rien n'est écrit. Affiche : taille, nombre de lignes, en-tête, dernière date de tournoi. */
import { execFileSync } from 'node:child_process';
const B = 'https://raw.githubusercontent.com/JeffSackmann/';
/* 1er passage (22/10) : tennis_atp et tennis_wta = 404 (dépôts retirés) ; Match Charting = 200. 2e passage : dates du Match Charting. */
const F = ['tennis_MatchChartingProject/master/charting-m-matches.csv', 'tennis_MatchChartingProject/master/charting-w-matches.csv'];
for (const f of F) {
  let t = '';
  try { t = execFileSync('curl', ['-sS', '-L', '--max-time', '60', '-w', '\n%{http_code}', B + f], { maxBuffer: 256 * 1024 * 1024 }).toString(); } catch (e) { console.log(f + ' : erreur ' + e.message); continue; }
  const i = t.lastIndexOf('\n'), code = t.slice(i + 1), body = t.slice(0, i), L = body.split('\n').filter(Boolean);
  console.log('\n=== ' + f + ' : HTTP ' + code + ' · ' + L.length + ' lignes · ' + body.length + ' octets');
  if (code !== '200') continue;
  console.log('en-tête : ' + (L[0] || '').slice(0, 400));
  const h = (L[0] || '').split(','), col = h.indexOf('Date');
  if (col >= 0) { let mx = '', n25 = 0, n26 = 0; L.slice(1).forEach((l) => { const v = l.split(',')[col] || ''; if (v > mx && /^20\d{6}$/.test(v)) mx = v; if (v.startsWith('2025')) n25++; if (v.startsWith('2026')) n26++; }); console.log('dernière date : ' + mx + ' · matchs 2025 : ' + n25 + ' · 2026 : ' + n26); }
  console.log('dernière ligne : ' + (L[L.length - 1] || '').slice(0, 300));
}
