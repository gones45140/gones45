// GONES45 — 📦 ARCHIVE DES COTES D'AVANT-MATCH (20261030y, Antoine : « c'est possible qu'on garde ces cotes après match ? quitte à créer un
// dossier spécial » → choix B). DraftKings (via l'API ESPN) efface les cotes joueurs après le match : ce robot les enregistre AVANT.
// Toutes les 2 h (cotes-archive.yml) : matchs des ligues ci-dessous qui commencent dans les 4 h → cotes principales (1N2, handicap,
// total : core …/odds fournisseur 100) + propBets utiles (joueurs, buts d'équipe, les deux marquent) + noms des joueurs (effectifs ESPN).
// Rangement (Antoine : « un dossier qui classe par championnat / équipes, et les matchs cotés ») : données/cotes/<ligue>/AAAA-MM.json
// (mois UTC du coup d'envoi) = { eid: fiche } (fiche : h / a = équipes {id, nom, ab, c}) ; une fiche est REMPLACÉE à chaque passage avant le
// match (dernière = la plus proche du coup d'envoi), jamais après. Lu par l'appli (fenêtre de match terminé, app.js 20261030y).
import fs from 'node:fs';

const LIGUES = [
  ['soccer', 'fra.1'], ['soccer', 'eng.1'], ['soccer', 'esp.1'], ['soccer', 'ita.1'], ['soccer', 'ger.1'],
  ['soccer', 'uefa.champions'], ['soccer', 'uefa.europa'], ['soccer', 'uefa.europa.conf'],
  ['hockey', 'nhl'], ['basketball', 'nba'], ['football', 'nfl']
];
// types propBets gardés (sondés par Antoine, 30/10) : joueurs + buts d'équipe + les deux marquent
const TYPES = new Set(['230', '39', '40', '219', '218', '232', '264', '31', '32', '33', '220', '221', '225', '226', '227', '327', '151', '253', '152']);
const FENETRE = 4 * 3600e3;

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function lire(u) {
  for (let i = 0; i < 3; i++) {
    try { const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 (GONES45 archive)' } }); if (r.ok) return await r.json(); if (r.status === 404) return null; } catch (e) {}
    await pause(800 * (i + 1));
  }
  return null;
}
const dec = (v) => {
  if (v && typeof v === 'object') v = v.decimal ?? v.american ?? v.value ?? v.odds;
  if (v == null) return 0; const m = parseFloat(String(v).trim().replace(/^\+/, '').replace(',', '.'));
  if (isNaN(m)) return 0; if (Math.abs(m) >= 100 && Math.abs(m) % 1 === 0) return Math.round((m > 0 ? m / 100 + 1 : 100 / Math.abs(m) + 1) * 100) / 100;
  return m > 1 ? m : 0;
};
const cotePb = (x) => { let d = dec((x.odds || {}).decimal); const ov = (x.current || {}).over || {}; if (!(d > 1)) d = dec(ov.decimal ?? ov.value); if (!(d > 1)) d = dec((x.odds || {}).american) || dec(ov.american); return d > 1 ? d : 0; };

const maintenant = Date.now(), fichiers = {};
let nEv = 0, nJ = 0;
for (const [sp, lg] of LIGUES) {
  const jours = [0, 1].map((k) => new Date(maintenant + k * 864e5).toISOString().slice(0, 10).replace(/-/g, ''));
  const vus = new Set();
  for (const j of jours) {
    const sb = await lire(`https://site.api.espn.com/apis/site/v2/sports/${sp}/${lg}/scoreboard?dates=${j}`);
    for (const e of (sb && sb.events) || []) {
      if (vus.has(e.id)) continue; vus.add(e.id);
      const t = Date.parse(e.date), st = ((e.status || {}).type || {});
      if (!(t > maintenant) || t - maintenant > FENETRE || st.completed || st.state === 'in') continue;
      const cp = (e.competitions || [])[0] || {}, eq = {};
      for (const c of cp.competitors || []) { const tm = c.team || {}; eq[c.homeAway === 'home' ? 'h' : 'a'] = { id: String(tm.id || ''), nom: tm.shortDisplayName || tm.displayName || '', ab: tm.abbreviation || '', c: tm.color ? '#' + tm.color : '' }; }
      const fiche = { lg, s: sp, t, n: e.name || '', h: eq.h || {}, a: eq.a || {}, at: maintenant };
      // cotes principales
      const od = await lire(`https://sports.core.api.espn.com/v2/sports/${sp}/leagues/${lg}/events/${e.id}/competitions/${e.id}/odds`);
      const o = ((od && od.items) || []).find((x) => String((x.provider || {}).id) === '100') || ((od && od.items) || [])[0];
      if (o) {
        const H = o.homeTeamOdds || {}, A = o.awayTeamOdds || {}, cu = (T, k) => (T.current || {})[k] || (T.close || {})[k] || (T.open || {})[k];
        fiche.ml = { h: dec(H.moneyLine) || dec(cu(H, 'moneyLine')), a: dec(A.moneyLine) || dec(cu(A, 'moneyLine')), d: dec((o.drawOdds || {}).moneyLine) || dec(cu(o.drawOdds || {}, 'moneyLine')) };
        const s = parseFloat(o.spread); fiche.hc = { L: isNaN(s) ? null : s, h: dec(H.spreadOdds) || dec(cu(H, 'pointSpread')) || dec(cu(H, 'spread')), a: dec(A.spreadOdds) || dec(cu(A, 'pointSpread')) || dec(cu(A, 'spread')) };
        const ou = parseFloat(o.overUnder); fiche.tot = { L: isNaN(ou) ? null : ou, o: dec(o.overOdds) || dec((o.current || {}).over), u: dec(o.underOdds) || dec((o.current || {}).under) };
      }
      // propBets + noms
      const pb = await lire(`https://sports.core.api.espn.com/v2/sports/${sp}/leagues/${lg}/events/${e.id}/competitions/${e.id}/odds/100/propBets?limit=500`);
      const items = ((pb && pb.items) || []).filter((x) => TYPES.has(String((x.type || {}).id)));
      if (items.length) {
        const noms = {};
        for (const k of ['h', 'a']) {
          if (!fiche[k].id) continue;
          const ro = await lire(`https://site.api.espn.com/apis/site/v2/sports/${sp}/${lg}/teams/${fiche[k].id}/roster`);
          let L = (ro && ro.athletes) || []; if (L.length && L[0] && L[0].items) L = L.flatMap((g) => g.items || []);
          for (const p of L) if (p && p.id) noms[String(p.id)] = [p.displayName || p.fullName || '', k];
        }
        const J = {}, T = { h: [], a: [] }, B = [];
        for (const x of items) {
          const ty = String(x.type.id), d = cotePb(x); if (!d) continue;
          const tg = parseFloat(((x.current || {}).target || {}).value), cible = isNaN(tg) ? null : tg;
          if (ty === '152') { B.push(d); continue; }
          if (ty === '151' || ty === '253') { const tm = String((x.team || {}).$ref || '').match(/teams\/(\d+)/); const k = tm && tm[1] === fiche.h.id ? 'h' : (tm && tm[1] === fiche.a.id ? 'a' : ''); if (k && cible != null) T[k].push([cible, d]); continue; }
          const a = String((x.athlete || {}).$ref || '').match(/athletes\/(\d+)/); if (!a) continue;
          const nm = noms[a[1]]; if (!nm || !nm[0]) continue;
          const jj = J[a[1]] || (J[a[1]] = { n: nm[0], k: nm[1], o: {} }); (jj.o[ty] = jj.o[ty] || []).push([cible, d]);
        }
        if (Object.keys(J).length) { fiche.j = J; nJ += Object.keys(J).length; }
        if (T.h.length || T.a.length) fiche.teq = T;
        if (B.length >= 2) fiche.bts = { o: B[0], n: B[1] };   // ordre reçu = oui puis non (comme la page ESPN)
      }
      const cle = lg + '/' + new Date(t).toISOString().slice(0, 7);
      (fichiers[cle] = fichiers[cle] || {})[String(e.id)] = fiche; nEv++;
      await pause(300);
    }
  }
}
for (const [cle, F] of Object.entries(fichiers)) {
  const p = `données/cotes/${cle}.json`;
  fs.mkdirSync(p.replace(/\/[^/]+$/, ''), { recursive: true });
  let old = {}; try { old = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) {}
  for (const [id, f] of Object.entries(F)) { if (!old[id] || !(old[id].t <= maintenant)) old[id] = f; }   // jamais après le coup d'envoi
  fs.writeFileSync(p, JSON.stringify(old));
}
// 20261030z (« ajoute les buteurs et passeurs, pointeurs, TD… en fait un max d'info ») : FEUILLE DE MATCH gardée avec le score. SONDÉ
// (robot sonde-resume, 29/10 : Bologna @ Milan, Lyon @ PSG, Flyers @ Capitals, Heat @ Hawks, Cowboys @ Eagles) :
//  foot   keyEvents[] {type.type 'goal', scoringPlay, clock.displayValue « 72' », team.id, participants[0] = buteur, [1] = passeur}
//         + rosters[].roster[] {athlete.id, starter, stats[] {name, value}} → f.bu = [[minute, idButeur, idPasseur, h|a, texte court]]
//  NHL    boxscore.players[].statistics forwards / defenses / skaters [G, A, SOG, PIM, +/-, TOI…] + goalies [GA, SA, SV…]
//  NBA    boxscore.players[].statistics (une catégorie) [MIN, PTS, FG, 3PT, FT, REB, AST, TO, STL, BLK…]
//  NFL    boxscore.players[].statistics passing / rushing / receiving / interceptions… (labels YDS, TD, REC, INT) + scoringPlays
// → f.st = { idEspn: { n, k (h|a), s: { stat: valeur ≠ 0 } } } (stats choisies par sport, valeurs nulles non gardées).
const FOOT_ST = { totalGoals: 'G', goalAssists: 'A', totalShots: 'T', shotsOnTarget: 'TC', yellowCards: 'J', redCards: 'R', foulsCommitted: 'F', offsides: 'HJ', saves: 'AR', ownGoals: 'CSC' };
const US_ST = {
  hockey: { G: 'G', A: 'A', SOG: 'TC', PIM: 'PIM', '+/-': 'PM', SV: 'AR', GA: 'BE', TOI: 'TOI' },
  basketball: { MIN: 'MIN', PTS: 'PTS', REB: 'REB', AST: 'AST', '3PT': '3PT', STL: 'INT', BLK: 'CTR', TO: 'BP' },
  football: { 'passing:YDS': 'pY', 'passing:TD': 'pTD', 'passing:INT': 'pINT', 'rushing:CAR': 'CAR', 'rushing:YDS': 'rY', 'rushing:TD': 'rTD', 'receiving:REC': 'REC', 'receiving:YDS': 'reY', 'receiving:TD': 'reTD', 'interceptions:INT': 'INT', 'defensive:SACKS': 'SACK', 'kicking:PTS': 'KPTS' }
};
function feuille(f, sm, sp) {
  const kDe = (tid) => (String(tid) === String(f.h.id) ? 'h' : (String(tid) === String(f.a.id) ? 'a' : ''));
  const st = {};
  const met = (id, n, k, cle, v) => { if (v == null || v === '' || +v === 0 || isNaN(+v) && cle !== 'TOI' && cle !== 'MIN') return; const o = st[id] || (st[id] = { n, k, s: {} }); o.s[cle] = isNaN(+v) ? v : +v; };
  if (sp === 'soccer') {
    f.bu = (sm.keyEvents || []).filter((x) => x.scoringPlay).map((x) => { const P = x.participants || []; return [String((x.clock || {}).displayValue || ''), String(((P[0] || {}).athlete || {}).id || ''), String(((P[1] || {}).athlete || {}).id || ''), kDe((x.team || {}).id), String(x.shortText || '').slice(0, 60)]; });
    for (const ro of sm.rosters || []) { const k = kDe((ro.team || {}).id); for (const p of ro.roster || []) { const a = p.athlete || {}; if (!a.id) continue; if (p.starter) met(a.id, a.displayName, k, 'TIT', 1); for (const x of p.stats || []) if (FOOT_ST[x.name]) met(a.id, a.displayName, k, FOOT_ST[x.name], x.value); } }
  } else {
    const M = US_ST[sp] || {};
    for (const eq of (sm.boxscore || {}).players || []) {
      const k = kDe((eq.team || {}).id);
      for (const cat of eq.statistics || []) {
        const lab = cat.labels || [];
        for (const a of cat.athletes || []) {
          const at = a.athlete || {}; if (!at.id || a.didNotPlay) continue;
          lab.forEach((L, i) => { const c = M[(cat.name ? cat.name + ':' : '') + L] || (sp !== 'football' ? M[L] : null); if (!c) return; let v = (a.stats || [])[i]; if (c === '3PT') v = parseInt(String(v || '').split('-')[0], 10); met(String(at.id), at.displayName, k, c, v); });
        }
      }
    }
    if (sp === 'football') f.bu = (sm.scoringPlays || []).map((x) => [String(((x.period || {}).number || '')) + 'QT ' + String((x.clock || {}).displayValue || ''), '', '', kDe((x.team || {}).id), String(x.text || '').slice(0, 70)]);
  }
  if (Object.keys(st).length) f.st = st;
}
// 20261030z : score final des matchs gardés (onglet « 📦 Cotes gardées » : carte verte / jaune / rouge) — mois en cours et précédent,
// matchs commencés depuis plus de 3 h sans score → summary ESPN (header.competitions[0].competitors[].score, match fini seulement).
let nSc = 0;
const moisL = [0, -1].map((k) => { const d = new Date(maintenant); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + k); return d.toISOString().slice(0, 7); });
for (const [sp, lg] of LIGUES) {
  for (const mo of moisL) {
    const p = `données/cotes/${lg}/${mo}.json`; let F; try { F = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { continue; }
    let maj = false;
    for (const [id, f] of Object.entries(F)) {
      if (f.f || !(f.t < maintenant - 3 * 3600e3) || f.t < maintenant - 10 * 864e5) continue;
      const sm = await lire(`https://site.api.espn.com/apis/site/v2/sports/${sp}/${lg}/summary?event=${id}`);
      const cp = ((((sm || {}).header || {}).competitions) || [])[0] || {}, st = ((cp.status || {}).type || {});
      if (!st.completed) continue;
      const sc = {}; for (const c of cp.competitors || []) sc[c.homeAway === 'home' ? 'h' : 'a'] = parseInt(c.score, 10);
      if (!isNaN(sc.h) && !isNaN(sc.a)) { f.f = sc; maj = true; nSc++; }
      try { feuille(f, sm, sp); } catch (e) { console.log('feuille ' + id + ' : ' + e.message); }
      await pause(200);
    }
    if (maj) fs.writeFileSync(p, JSON.stringify(F));
  }
}
console.log(`📦 scores ajoutés : ${nSc}`);
console.log(`📦 cotes gardées : ${nEv} match(s), ${nJ} joueur(s) avec cote, fichiers ${Object.keys(fichiers).join(', ') || 'aucun'}`);
