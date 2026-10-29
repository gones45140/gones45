// Sonde jetable (20261030z) : forme des résumés ESPN d'un match TERMINÉ par sport (buteurs, passeurs, stats joueurs) pour l'archive des cotes.
const L = [['soccer', 'ita.1'], ['soccer', 'fra.1'], ['hockey', 'nhl'], ['basketball', 'nba'], ['football', 'nfl']];
const lire = async (u) => { try { const r = await fetch(u); return r.ok ? await r.json() : null; } catch (e) { return null; } };
const court = (o, n) => JSON.stringify(o).replace(/"(\$ref|href|links|logo|logos|uid|guid)":("[^"]*"|\[[^\]]*\])/g, '').slice(0, n || 600);
for (const [sp, lg] of L) {
  let ev = null;
  for (let k = 1; k <= 8 && !ev; k++) {
    const d = new Date(Date.now() - k * 864e5).toISOString().slice(0, 10).replace(/-/g, '');
    const sb = await lire(`https://site.api.espn.com/apis/site/v2/sports/${sp}/${lg}/scoreboard?dates=${d}`);
    ev = ((sb && sb.events) || []).find((e) => e.status && e.status.type && e.status.type.completed);
  }
  if (!ev) { console.log(`#### ${lg} : aucun match fini`); continue; }
  const s = await lire(`https://site.api.espn.com/apis/site/v2/sports/${sp}/${lg}/summary?event=${ev.id}`);
  console.log(`#### ${lg} ${ev.id} ${ev.name} | clés : ${Object.keys(s || {}).join(',')}`);
  if (!s) continue;
  if (s.keyEvents) console.log(`keyEvents (${s.keyEvents.length}) ex : ` + court(s.keyEvents.filter((x) => /goal/i.test(JSON.stringify(x.type || {}))).slice(0, 2), 900));
  if (s.scoringPlays) console.log(`scoringPlays (${s.scoringPlays.length}) ex : ` + court(s.scoringPlays.slice(0, 2), 900));
  if (s.rosters) console.log(`rosters ex : ` + court(((s.rosters[0] || {}).roster || []).slice(0, 2), 900));
  const bp = (s.boxscore || {}).players || [];
  if (bp.length) { const st = (bp[0].statistics || []); console.log(`boxscore.players : ${bp.length} équipes, catégories ${st.map((c) => (c.name || c.type || '?') + '[' + (c.labels || []).join('/') + ']').join(' ; ').slice(0, 700)}`); console.log('ex joueur : ' + court(((st[0] || {}).athletes || [])[0], 400)); }
}
