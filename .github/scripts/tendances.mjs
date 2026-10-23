/* ═══════════════════════════════════════════════════════════════════════════
   GONES45 — TENDANCES OFFICIELLES (GitHub Actions, chaque jour à 10 h, Paris)
   ───────────────────────────────────────────────────────────────────────────
   20261015i (« si je veux publier les bilans tendances sur X il faut que tout
   le monde ait la même », « oui go solution 2 à 10 h ») :
   UN SEUL historique, le même pour tout le monde, noté AVANT les matchs et
   daté par GitHub (vérifiable : rien n'est retouché après coup).

   CE QUE FAIT LE SCRIPT
     1. ouvre le VRAI site (gones45140.github.io/gones45) dans Chromium ;
     2. règle Tendances sur les réglages OFFICIELS (cote mini 1,50, proba mini
        50 %, aujourd'hui, groupes par défaut) et lance l'analyse de chaque
        onglet : ⚽ foot, 🏒 NHL, 🏀 NBA, 🏈 NFL ;
     3. récupère EXACTEMENT les tendances que l'écran affiche (celles que
        l'appli passe à _g45TrSuivNoter) : rien n'est trié à la main ;
     4. juge les tendances dont le match est fini (score final ESPN) avec la
        règle de l'appli (_g45TrSuivJuge) ;
     5. écrit données/tendances_officielles.json (le commit est fait par le
        workflow). L'appli le lit sur raw.githubusercontent.com.

   ESPN : Akamai renvoie 403 à un NAVIGATEUR sur une IP de datacenter, mais
   200 à curl (vérifié le 06/08 pour le relais, voir relay.mjs). Toutes les
   lectures ESPN de la page (directes ou via ?host=espn du worker) sont donc
   interceptées et servies par curl.
   ═══════════════════════════════════════════════════════════════════════════ */
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright';

const FICHIER = 'données/tendances_officielles.json';
const SITE = process.env.SITE || 'https://gones45140.github.io/gones45/';
/* Essai hors GitHub seulement : faux ESPN (module) et script injecté dans la page. */
const FAUX_ESPN = process.env.FAUX_ESPN ? (await import(process.env.FAUX_ESPN)).default : null;
const FAUX_INIT = process.env.FAUX_INIT ? fs.readFileSync(process.env.FAUX_INIT, 'utf8') : null;
/* 20261018k (capture d'Antoine, filtres Cote 1,50-2,19 + Proba 60 % et + + Avis « D'accord » : « la demande de 10 h doit être celle-là ») :
   proba mini 60 %, cote CONNUE ≥ 1,50 (sans cote = pas noté), stats et bookmakers d'accord (désaccord = pas noté). */
const REGLAGES = { min: 1.5, pmin: 0.6, coteConnue: true, accord: true };
/* 20261022b (nuit du 21 au 22/10 : 1 seul gagné sur 5 en NBA, saison reprise 2 jours avant — stats surtout de la saison PASSÉE ; les
   « moins de X points » ont sauté ; Antoine : « NBA mets juste pas les pts ») : du 1er octobre au 14 novembre (≈ 8 matchs joués par équipe),
   la NBA reste dans la sélection officielle SANS les marchés de points (+ / - de X points) ; vainqueur et handicap gardés. */
/* 20261023y — 📊 BILANS EN ATTENTE (« si on peut faire une sélection de tel pari alors c'est le top, mais dispo que sur gones pour mettre en
   ligne » ; abonnement Claude fini avant le 15/11) : données/robot_reglages.json, écrit par l'appli gones (interrupteurs, clé GitHub
   d'Antoine) : { pause: { nba_pts, nhl_buts, nfl_pts, + 20261023z : f_buts, f_btts, f_vq, ce_buts, ce_vq, nhl_vq, nba_vq, nfl_vq, tn_vq } (true = en pause), officiel: { tn_tv, ce_hors } (true = test passé en officiel) }.
   Absent ou illisible → valeurs ci-dessous. */
let RR = {}; try { RR = JSON.parse(fs.readFileSync('données/robot_reglages.json', 'utf8')) || {}; } catch (e) {}
const RRp = (k, def) => (RR.pause && typeof RR.pause[k] === 'boolean' ? RR.pause[k] : def);
const RRo = (k) => !!(RR.officiel && RR.officiel[k] === true);
/* 20261024a (« un bouton marche / pause et un bouton test / officiel à chaque » → sélecteur à 3 cases, « tu peux coder et mettre en ligne ») :
   RR.etat[clé] = 'off' (officiel) | 'test' | 'pause' ; l'ancienne forme (pause / officiel) reste lue. Défauts : points NBA (jusqu'au 14/11),
   buts NHL, total NFL en pause ; value tennis et coupes d'Europe hors règle en test ; le reste officiel. */
const ETATS = { off: 1, test: 1, pause: 1 };
const nbaDef = (() => { const d = new Date(), m = d.getUTCMonth() + 1; return m === 10 || (m === 11 && d.getUTCDate() < 15); })();
const DEF_ETAT = { nba_pts: nbaDef ? 'pause' : 'off', nhl_buts: 'pause', nfl_pts: 'pause', tn_tv: 'test', ce_hors: 'test' };
const etat = (k) => {
  if (RR.etat && ETATS[RR.etat[k]]) return RR.etat[k];
  if (RR.pause && typeof RR.pause[k] === 'boolean') return RR.pause[k] ? 'pause' : 'off';
  if (RR.officiel && RR.officiel[k] === true) return 'off';
  return DEF_ETAT[k] || 'off';
};
if (RR.maj) console.log('réglages d\'Antoine (' + RR.maj + ') : ' + JSON.stringify({ pause: RR.pause, officiel: RR.officiel }));
const NBA_PAUSE = etat('nba_pts') !== 'off';   // 20261024a : pause OU test → marqué ici, rangé plus bas selon l'état
const SPORTS = ['foot', 'hockey', 'nba', 'nfl'];
if (NBA_PAUSE) console.log('NBA : pas de marchés de points (début de saison) jusqu\'au 15/11.');
/* 20261023w (bilan officiel au 23/10 : NHL 3/12, −6,8 u ; buts 2/8 ; « les over NHL pas top, les victoires d'équipe il y a de quoi faire ») :
   plus de marchés de BUTS NHL (+ / − de N,5 buts) dans la sélection officielle. Les victoires / handicaps NHL restent. À revoir le 15/11. */
const NHL_BUTS_PAUSE = etat('nhl_buts') !== 'off';
if (NHL_BUTS_PAUSE) console.log('NHL : pas de marchés de buts dans la sélection officielle (pause, bilan 15/11).');
/* 20261023x (« NFL pareil pour les over / under, bon très peu de matchs » ; NFL − de N,5 points 0/2) : plus de total de points NFL dans la
   sélection officielle ; vainqueur / handicap gardés. À revoir le 15/11. */
const NFL_PTS_PAUSE = etat('nfl_pts') !== 'off';
if (NFL_PTS_PAUSE) console.log('NFL : pas de total de points dans la sélection officielle (pause, bilan 15/11).');
const FORCE = process.env.FORCE === '1';

const parisH = () => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).find((x) => x.type === 'hour').value);
const parisJour = () => new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());   // AAAA-MM-JJ

let J = { maj: null, dernier: null, reglages: REGLAGES, t: [] };
try { J = Object.assign(J, JSON.parse(fs.readFileSync(FICHIER, 'utf8'))); } catch (e) {}

/* Deux crons (8 h et 9 h UTC) couvrent l'heure d'été et l'heure d'hiver : on ne
   travaille qu'à partir de 10 h à Paris, et une seule fois par jour. */
/* 17/10 (« au pire on met 8h ? ») : à partir de 8 h à Paris (avant : 10 h). */
if (!FORCE && (parisH() < 8 || J.dernier === parisJour())) {
  console.log('Rien à faire (' + parisH() + ' h à Paris, dernier passage ' + J.dernier + ').');
  process.exit(0);
}

function curl(url) {
  if (FAUX_ESPN) return Promise.resolve(FAUX_ESPN(url));
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
page.on('console', (m) => { const t = m.text(); if (/ : \d+ affichées| : erreur /.test(t)) console.log('[page] ' + t); });
let nEspn = 0, nKo = 0;
await page.route('**/*', async (route) => {
  const u = route.request().url();
  let cible = null;
  if (ESPN_HOTES.test(u)) cible = u;
  else {
    const m = /^https:\/\/fd-proxy\.[^/]+\/?\?host=espn(web)?&path=([^&]+)/.exec(u);
    if (m) cible = 'https://' + (m[1] ? 'site.web.api.espn.com' : 'site.api.espn.com') + decodeURIComponent(m[2]);
  }
  if (!cible) return FAUX_ESPN && !/^http:\/\/localhost/.test(u) ? route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }) : route.continue();
  const r = await curl(cible); nEspn++; if (r.status !== 200) nKo++;
  return route.fulfill({ status: r.status, body: r.body, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });
});

/* Réglages officiels AVANT le chargement : toutes les compétitions des groupes par défaut. */
await page.addInitScript((R) => {
  try {
    localStorage.setItem('g45tr_pmin', String(R.pmin));
    localStorage.removeItem('g45tr_lsoff');
    localStorage.setItem('g45_guide_vu', '1');
    localStorage.setItem('g45tr_vue', 'perso');   // 21/10 : voir plus bas (Tendances en boutons)
  } catch (e) {}
}, REGLAGES);
if (FAUX_INIT) await page.addInitScript(FAUX_INIT);
await page.goto(SITE + '?robot=' + Date.now(), { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(6000);

const nouvelles = await page.evaluate(async ({ R, SPORTS, NBA_PAUSE, NHL_BUTS_PAUSE, NFL_PTS_PAUSE }) => {
  const pris = [];
  const orig = window._g45TrSuivNoter;
  window._g45TrSuivNoter = function (liste) { (liste || []).forEach((x) => pris.push(x)); try { return orig.apply(this, arguments); } catch (e) {} };
  /* 21/10 (Sélection du jour VIDE, capture d'Antoine ; « foot : 0 affichées » partout) : depuis 20261020c (Tendances en boutons), l'écran
     s'ouvre sur « BET45 → Sélection du jour » ; la liste perso n'est plus dessinée, donc _g45TrSuivNoter n'est jamais appelé et le robot
     ne voit rien. Le robot se met sur la vue « perso », comme avant. */
  try { localStorage.setItem('g45tr_vue', 'perso'); } catch (e) {}
  try { showTab('t-tend'); } catch (e) {}
  const sortie = [];
  for (const sp of SPORTS) {
    try {
      _G45_TR.res_foot = _G45_TR.res_hockey = _G45_TR.res_nba = _G45_TR.res_nfl = null;
      _G45_TR.sp = sp; _G45_TR.res = null; _G45_TR.day = 0; _G45_TR.min = R.min; _G45_TR.pmin = R.pmin;
      try { loadTendancesTab(); } catch (e) {}
      pris.length = 0;
      await g45TrRun();
      for (let i = 0; i < 300 && _G45_TR.run; i++) await new Promise((r) => setTimeout(r, 1000));
      try { loadTendancesTab(); } catch (e) {}
      const vu = {};
      pris.forEach((x) => {
        if (!x || !x.m || !x.id || !x.d) return;
        if (R.coteConnue && !(x.m.cote >= R.min)) return;   // 20261018k : sans cote = pas noté
        if (R.accord && x.m.desac) return;                   // 20261018k : désaccord stats / bookmakers = pas noté
        let pz = '';   // 20261023y : marché en pause = suivi en coulisse (J.pz), plus jeté
        if (sp === 'nba' && NBA_PAUSE && /de [\d,.]+ points/i.test(String(x.m.m || ''))) pz = 'nba_pts';   // 20261022b : NBA sans points en début de saison
        if (sp === 'hockey' && NHL_BUTS_PAUSE && /de [\d,.]+ buts/i.test(String(x.m.m || ''))) pz = 'nhl_buts';   // 20261023w : NHL sans buts (bilan 2/8)
        if (sp === 'nfl' && NFL_PTS_PAUSE && /de [\d,.]+ points/i.test(String(x.m.m || ''))) pz = 'nfl_pts';   // 20261023x : NFL sans total de points
        const k = _g45TrSuivType(x.m.m, x.hN, x.aN); if (!k) return;
        const cle = x.id + '|' + k; if (vu[cle]) return; vu[cle] = 1;
        const t = Date.parse(x.d); if (isNaN(t) || t < Date.now()) return;   // match déjà commencé : pas noté
        sortie.push({ id: String(x.id), sl: x.slug, t: t, h: x.hN, a: x.aN, m: x.m.m, k: k,
          p: Math.round(x.m.p * 1000) / 1000,
          c: x.m.cote > 1 ? Math.round(x.m.cote * 100) / 100 : null,
          cd: x.m.coteDk > 1 ? Math.round(x.m.coteDk * 100) / 100 : null,   // 20261015o : cote DraftKings d'origine ; c = ≈ books FR (− 5 %)
          f: x.m.fair > 0 ? Math.round(x.m.fair * 1000) / 1000 : null,
          d: x.m.desac ? 1 : 0, r: null,
          // 20261017n : les faits de la carte (« Man City : +2,5 buts à domicile lors de 2 de ses 5 derniers… ») et le nombre de matchs
          fa: Array.isArray(x.m.faits) && x.m.faits.length ? x.m.faits.slice(0, 4).map((f) => String(f).replace(/<[^>]*>/g, '').slice(0, 160)) : undefined,
          nm: x.m.n > 0 ? x.m.n : undefined, pz: pz || undefined });
      });
      console.log(sp + ' : ' + pris.length + ' affichées');
    } catch (e) { console.log(sp + ' : erreur ' + (e && e.message)); }
  }
  return sortie;
}, { R: REGLAGES, SPORTS, NBA_PAUSE, NHL_BUTS_PAUSE, NFL_PTS_PAUSE });

/* 20261020l — 🎾 TENNIS OFFICIEL (« OK combiné ») : _g45TnRobot (app.js) choisit les simples ATP / WTA du jour où l'avis BET45 est en
   confiance FORTE et proba ≥ 60 % ; cote The Odds API seulement en Grand Chelem (mêmes filtres que les autres sports si elle existe),
   sinon noté SANS COTE. ESPN n'a aucune cote tennis (sondé le 20/10). 24 matchs et 15 min au plus (beaucoup de lectures ESPN par joueur). */
try {
  const tennis = await page.evaluate(async (R) => (typeof window._g45TnRobot === 'function' ? window._g45TnRobot(R, 24, 15 * 60000) : []), REGLAGES);
  console.log('tennis : ' + tennis.length + ' notées');
  tennis.forEach((x) => nouvelles.push(x));
} catch (e) { console.log('tennis : erreur ' + (e && e.message)); }
/* 20261022y — SUIVI tennis BET45 / book (20261023c : TOUS les matchs avec cote, ec = écart en points ; avant : ≥ 10 points seulement) : liste à part J.dz (pas affichée comme tendance), un match noté une
   fois, jugé plus bas avec les tendances (r = 1 si le joueur choisi par BET45 a gagné). Bilan à faire vers le 22/11. */
J.dz = J.dz || [];
try {
  const dz = await page.evaluate(() => window._g45TnDz || []);
  const vuDz = new Set(J.dz.map((x) => x.id));
  dz.forEach((x) => { if (vuDz.has(x.id)) return; vuDz.add(x.id); x.n = new Date().toISOString(); J.dz.push(x); });
  console.log('tennis désaccords BET45 / book : ' + dz.length + ' vus · ' + J.dz.length + ' suivis');
} catch (e) { console.log('désaccords : erreur ' + (e && e.message)); }

/* Ajout : une tendance (match + pari) n'est notée qu'UNE fois — la NFL lit 7 jours d'avance. */
/* 20/10 (capture Bears–Patriots : « - de 48,5 », « - de 49,5 », « - de 50,5 » = « doublon voir triple dose ») : la ligne ESPN bouge d'un jour à
   l'autre → même pari noté chaque matin avec un autre chiffre. FAMILLE = type sans le chiffre de la ligne (un48.5 → un, hc1:7.5 → hc1:) :
   une famille déjà notée un JOUR PRÉCÉDENT pour ce match n'est plus reprise ; les doublons déjà présents sont retirés (le 1er noté reste). */
const fam = (k) => String(k || '').replace(/[\d.]+$/, '');
const nFam = {};
J.t.forEach((x) => { const f = x.id + '|' + fam(x.k); if (!nFam[f] || x.n < nFam[f]) nFam[f] = x.n; });
const avant = J.t.length;
J.t = J.t.filter((x) => x.n === nFam[x.id + '|' + fam(x.k)]);
if (J.t.length < avant) console.log('doublons de ligne retirés : ' + (avant - J.t.length));
const deja = new Set(J.t.map((x) => x.id + '|' + x.k));
const dejaFam = new Set(J.t.map((x) => x.id + '|' + fam(x.k)));
const note = new Date().toISOString();
let ajout = 0;
/* 20261023m — COUPES D'EUROPE (Antoine : « les stats foot qu'on sort c'est surtout en championnat » ; « prendre le coeff du club directement,
   global et 2 dernières saisons » ; « trouver de combien est l'écart et en tirer une conclusion » → tableau « oui ») : pour un match uefa.*,
   les stats de championnat sont remplacées par les RÉSULTATS RÉELS des coupes d'Europe (données/coupes_europe.json, robot coupes_europe.mjs :
   719 matchs C1 / C3 / C4 sur 3 saisons, rangés par écart de coefficient UEFA des clubs sur les 2 dernières saisons, kassiesa.net).
   La tendance reste OFFICIELLE seulement si cote × % européen ≥ 1,05 ; sinon, ou marché / club inconnu → J.ce (🧪 test, testeurs, hors bilan).
   Ex. « − de 3,5 buts » ≈ 62 % en coupe d'Europe → il faut une cote ≥ 1,70. */
J.ce = J.ce || [];
let CE = null; try { CE = JSON.parse(fs.readFileSync('données/coupes_europe.json', 'utf8')); } catch (e) {}
const ceToks = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/)
  .filter((t) => t && !/^(fc|afc|cf|sc|ac|as|sk|fk|nk|ss|us|sv|vfb|vfl|tsg|club|de|cd|rc|rcd|ud|sl|sad|calcio|football|futbol|clube|the|bk|if|ik|jk|ks|pfc|rb|1|1899|1909|05|04)$/.test(t))
  .map((t) => ({ munchen: 'munich', internazionale: 'inter', milano: 'milan', lisboa: 'lisbon', koln: 'cologne', praha: 'prague', beograd: 'belgrade', crvena: 'red', zvezda: 'star', sankt: 'st' }[t] || t));
const ceClub = (nom, t) => {
  /* 20261023q : kassiesa trank{Y} = clubs de la saison (Y-1)/Y → un match d'octobre 2026 se lit dans 2027 (Palace, Bournemouth, Hoffenheim
     n'étaient pas dans 2026 : « club inconnu » à tort), puis les années d'avant pour un club absent cette saison. */
  const d = new Date(t), y = d.getUTCMonth() >= 6 ? d.getUTCFullYear() : d.getUTCFullYear() - 1, tk = ceToks(nom);
  for (const yy of [y + 1, y, y - 1]) {
    const C = (CE && CE.clubs && CE.clubs[yy]) || {};
    let best = null, bs = 0; for (const k of Object.keys(C)) { const u = k.split(' '), sc = tk.filter((x) => u.includes(x)).length / Math.max(tk.length, u.length); if (sc > bs) { bs = sc; best = C[k]; } }
    if (bs >= 0.5) return best;
  }
  return null;
};
/* Essai sur les matchs du 22/10 : beaucoup de clubs absents ou mal reconnus (Lyon = « Olympique Lyonnais », Bournemouth jamais en coupe
   d'Europe → pas de coefficient) et, pour le VAINQUEUR, la tranche d'écart est trop grossière (Bayern – Bruges : 48 %). Or le tableau montre
   que l'écart ne change presque rien aux BUTS → marchés de buts : taux RÉEL de toutes les coupes d'Europe (pondéré, 719 matchs), sans
   rapprocher les noms ; marchés de résultat (1, 2, 1N, 2N) et autres (o15…) : 🧪 test en attendant mieux. */
const ceAvis = (x) => {
  const T = (CE && CE.tableau2saisons) || []; const n = T.reduce((s2, z) => s2 + z.n, 0); if (n < 300) return null;
  const moy = (f) => T.reduce((s2, z) => s2 + z[f] * z.n, 0) / n / 100;
  const H = ceClub(x.h, x.t), A = ceClub(x.a, x.t);
  /* 20261023n (Antoine : « Barça – PSG ou Arsenal – Bayern, il n'y a pas lieu d'enlever ; Lille – Gala, c'est quasi le même niveau ») :
     MÊME STANDING = écart de coefficient 5 saisons < 2,5 fois (coefficient = max(total du club, part du pays), règle UEFA) → les paris sur le
     VAINQUEUR restent soumis aux règles habituelles (stats + books). Barça – PSG 1,2 · Arsenal – Bayern 1,2 · Lille – Galatasaray 1,3. */
  const v = (c) => Math.max(c[2], c[4], 1), ratio = H && A ? Math.max(v(H) / v(A), v(A) / v(H)) : null;
  const res = { ratio: ratio ? Math.round(ratio * 10) / 10 : null, n };
  if (/^(1|2|1N|2N)$/.test(x.k)) return ratio != null && ratio < 2.5 ? Object.assign(res, { p: null, meme: true }) : null;
  const p = { u35: moy('moins35'), o25: moy('plus25'), btts: moy('btts') }[x.k];
  if (p == null) return null;
  /* 20261023q — STAT DU GROS CLUB (Antoine : « gros club contre plus petit, est-ce que la stat du gros club passe ? » ; tableau 515 matchs :
     stat du gros club ≥ 70 % → − de 3,5 buts 68 % (petit club 62 %), + de 2,5 buts 64 %, les 2 marquent 59 % ; « oui ») : un marché de buts
     n'est OFFICIEL que si le club au plus gros coefficient UEFA (5 saisons) est reconnu, que SA stat de championnat (fait de la carte,
     « Club : … (NN%) », à domicile ou à l'extérieur selon son côté) est ≥ 70 % et que la cote atteint le minimum juste pour ce taux réel :
     − de 3,5 buts 1,55 · + de 2,5 buts 1,65 · les 2 marquent 1,80. Sinon → 🧪 test (J.ce). */
  if (!(H && A)) return Object.assign(res, { p, gros: null });
  const grosDom = v(H) >= v(A), fa = Array.isArray(x.fa) ? x.fa : [];
  const fGros = fa.find((f) => (grosDom ? /à domicile/ : /à l'extérieur/).test(f));
  const m = fGros && /\((\d{1,3})\s*%\)/.exec(fGros), sg = m ? +m[1] / 100 : null;
  const mini = { u35: 1.55, o25: 1.60, btts: 1.80 }[x.k];   // 20261023r : o25 1,65 → 1,60 (Antoine : « 1,6, voir ce que ça donne »)
  return Object.assign(res, { p, gros: grosDom ? 'h' : 'a', sg, ok: sg != null && sg >= 0.7 && x.c >= mini });
};
let nCe = 0, nPz = 0;
/* 20261023z (« pourquoi certains ont des boutons pause, d'autres stop, d'autres rien » → « oui » : un interrupteur sur CHAQUE ligne de
   📊 Bilans) : chaque pari est rangé comme dans l'appli (_g45Bil, LIGNES) ; ligne mise en PAUSE par Antoine → suivi en coulisse (J.pz). */
const pzCle = (x) => {
  const sl = String(x.sl || ''), k = String(x.k || ''), buts = /^(o|u)\d/i.test(k), pts = /^(un|ov)/i.test(k);
  if (sl === 'nhl') return buts ? 'nhl_buts' : 'nhl_vq';
  if (sl === 'nba') return pts ? 'nba_pts' : 'nba_vq';
  if (sl === 'nfl') return pts ? 'nfl_pts' : 'nfl_vq';
  if (sl === 'atp' || sl === 'wta') return 'tn_vq';
  if (/^uefa/.test(sl)) return buts || k === 'btts' ? 'ce_buts' : 'ce_vq';
  return buts ? 'f_buts' : (k === 'btts' ? 'f_btts' : 'f_vq');
};
J.pz = J.pz || [];   // 20261023y : marchés EN PAUSE suivis en coulisse (jamais dans le bilan officiel ; bilan dans l'écran 📊 Bilans de gones)
nouvelles.forEach((x) => {
  if (deja.has(x.id + '|' + x.k) || dejaFam.has(x.id + '|' + fam(x.k))) return;
  { const c = x.pz || pzCle(x), st = etat(c);   /* 20261024a : test ou pause → J.pz (x.st), jamais officiel */
    if (st !== 'off') { x.pz = c; x.st = st; deja.add(x.id + '|' + x.k); if (!J.pz.some((y) => y.id === x.id && y.k === x.k)) { x.n = note; J.pz.push(x); nPz++; } return; }
    delete x.pz; }
  if (/^uefa\./.test(x.sl)) {
    const av = ceAvis(x); x.pe = av ? Math.round(av.p * 1000) / 1000 : null; x.ecu = av ? av.ratio : null; x.sg = av && av.sg != null ? av.sg : undefined;
    const eh = etat('ce_hors');   /* 20261024a : hors règle → officiel (src 'ce'), test (J.ce) ou pause (J.pz) */
    if (!(av && (av.meme || av.ok))) {
      if (eh === 'off') x.src = 'ce';
      else { deja.add(x.id + '|' + x.k); x.n = note;
        if (eh === 'pause') { if (!J.pz.some((y) => y.id === x.id && y.k === x.k)) { x.pz = 'ce_hors'; x.st = 'pause'; J.pz.push(x); nPz++; } }
        else if (!J.ce.some((y) => y.id === x.id && y.k === x.k)) { J.ce.push(x); nCe++; }
        return; }
    }
  }
  deja.add(x.id + '|' + x.k); x.n = note; J.t.push(x); ajout++;
});
console.log('en pause, suivies en coulisse : ' + nPz + ' · total ' + J.pz.length);
console.log('coupes d\'Europe → test (stat du gros club < 70 %, cote trop basse ou club inconnu) : ' + nCe + ' · suivies ' + J.ce.length);

/* Vérification des matchs finis (score final), par ligue et par jour.
   20261017i (« avec des logos de club ou championnat ») : le même scoreboard donne aussi les logos → x.hl / x.al (clubs) et
   J.lg[sl] (championnat) ; une tendance encore sans logo (anciennes comprises) est relue une fois ('' = essayé, rien trouvé). */
J.lg = J.lg || {};
/* 20261023i — 🧪 VALUE TENNIS EN TEST (cote book 1,50 – 2,50) : liste à part J.tv (testeurs seulement dans l'appli, jamais dans le bilan), un match + côté noté une fois */
J.tv = J.tv || [];
try {
  const tv = await page.evaluate(() => window._g45TnTv || []), vuTv = new Set(J.tv.map((x) => x.id + '|' + x.k));
  /* 20261023y : tn_tv = Antoine a passé la value tennis en officiel → dans J.t (bilan), sinon J.tv (test) */
  const vuT = new Set(J.t.map((x) => x.id + '|' + x.k));
  tv.forEach((x) => { if (vuTv.has(x.id + '|' + x.k) || vuT.has(x.id + '|' + x.k)) return; vuTv.add(x.id + '|' + x.k); x.n2 = new Date().toISOString();
    const et = etat('tn_tv');   /* 20261024a : officiel (J.t, src 'tv'), test (J.tv) ou pause (J.pz) */
    if (et === 'off' && x.c > 1) { x.n = x.n2; x.r = null; x.src = 'tv'; J.t.push(x); }
    else if (et === 'pause') { x.n = x.n2; x.pz = 'tn_tv'; x.st = 'pause'; if (!J.pz.some((y) => y.id === x.id && y.k === x.k)) J.pz.push(x); }
    else J.tv.push(x); });
  console.log('tennis value en test : ' + tv.length + ' vues · ' + J.tv.length + ' suivies');
} catch (e) { console.log('value test : erreur ' + (e && e.message)); }
const TJ = J.t.concat(J.dz || [], J.tv, J.ce, J.pz);   // 20261023y : + J.pz (pauses suivies en coulisse) · 20261022y : désaccords + 20261023i : value en test, jugés avec les tendances
const att = TJ.filter((x) => x.r == null && x.t < Date.now() - 3 * 3600e3);
const sansLogo = J.t.filter((x) => x.r !== -1 && x.hl === undefined);
const grp = {};
att.forEach((x) => { if (Date.now() - x.t > 10 * 864e5) x.r = -1; });   // 10 jours sans score : abandonné
TJ.filter((x) => (x.r == null && x.t < Date.now() - 3 * 3600e3) || (x.r !== -1 && x.hl === undefined)).forEach((x) => {
  const d = new Date(x.t), ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
  (grp[x.sl + '|' + ymd] = grp[x.sl + '|' + ymd] || []).push(x);
});
const logoLigue = (lg) => { const lo = (lg && lg.logos) || []; const d = lo.find((l) => (l.rel || []).indexOf('dark') >= 0); return ((d || lo[0]) || {}).href || ''; };
let juge = 0;
for (const g of Object.keys(grp)) {
  const [sl, ymd] = g.split('|');
  const tn = sl === 'atp' || sl === 'wta';   // 20261020l : tennis (events = tournois → un « event » par match)
  const sp = tn ? 'tennis' : ({ nhl: 'hockey', nba: 'basketball', nfl: 'football' }[sl] || 'soccer');
  const tous = [];
  for (const dd of [ymd, ymdDecale(ymd, -1)]) {   // ESPN range les matchs par jour AMÉRICAIN : un match du soir peut être la veille
    const r = await curl('https://site.api.espn.com/apis/site/v2/sports/' + sp + '/' + sl + '/scoreboard?dates=' + dd);
    try {
      let B = JSON.parse(r.body); if (!J.lg[sl]) { const u = logoLigue(B.leagues && B.leagues[0]); if (u) J.lg[sl] = u; }
      if (tn) B = await page.evaluate((b) => (window._g45TnPlat ? window._g45TnPlat(b) : b), B);
      (B.events || []).forEach((e) => tous.push(e));
    } catch (e) {}
  }
  for (const x of grp[g]) {
    const e = tous.find((ev) => String(ev.id) === x.id);
    if (x.hl === undefined) {
      const cc = (e && e.competitions && e.competitions[0]) || {}, eq = (q) => ((cc.competitors || []).find((z) => z.homeAway === q) || {}).team || {};
      x.hl = eq('home').logo || ''; x.al = eq('away').logo || '';
    }
    if (!e || x.r != null || x.t >= Date.now() - 3 * 3600e3) continue;
    const c = (e.competitions && e.competitions[0]) || {}, st = (c.status && c.status.type) || {};
    if (!st.completed) { if (/postpon|cancel|abandon/i.test(st.name || st.description || '')) x.r = -1; continue; }
    const ho = (c.competitors || []).find((q) => q.homeAway === 'home'), aw = (c.competitors || []).find((q) => q.homeAway === 'away');
    const sh = parseInt(ho && ho.score, 10), sa = parseInt(aw && aw.score, 10);
    if (isNaN(sh) || isNaN(sa)) continue;
    if (tn) {   // tennis : le VAINQUEUR d'ESPN (abandon compris), le score = sets gagnés
      const g = (c.competitors || []).find((q) => q.winner === true); if (!g) continue;
      x.r = (g.homeAway === 'home') === (x.k === '1') ? 1 : 0; x.s = sh + '-' + sa; juge++; continue;
    }
    const v = await page.evaluate(([k, h, w]) => _g45TrSuivJuge(k, h, w), [x.k, sh, sa]);
    if (v == null) continue;
    x.r = v ? 1 : 0; x.s = sh + '-' + sa; juge++;
  }
}
function ymdDecale(ymd, n) {
  const d = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8)) + n * 864e5);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}
await nav.close();

if (nEspn && nKo === nEspn) { console.log('⚠️ ESPN a TOUT refusé depuis GitHub : rien n\'est enregistré.'); process.exit(1); }
J.t.sort((a, b) => a.t - b.t);
J.maj = note; J.dernier = parisJour(); J.reglages = REGLAGES;
fs.writeFileSync(FICHIER, JSON.stringify(J));
console.log('ESPN : ' + nEspn + ' lectures (' + nKo + ' refusées) · ' + ajout + ' nouvelles tendances · ' + juge + ' jugées · total ' + J.t.length);
