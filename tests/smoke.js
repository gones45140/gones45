/* ═══ CONTRÔLE AVANT LIVRAISON (27/09/2026, accord d'Antoine : « 7 ok ») ═══
   À lancer AVANT chaque envoi, depuis la racine du dépôt :
     node tests/smoke.js            (gones45 : index.html)
     node tests/smoke.js chemin/vers/fenotte45 indexfenotte.html   (optionnel)
   Ouvre l'appli dans Chromium (Playwright) avec TOUT l'extérieur simulé : aucune
   requête ne sort, aucun quota consommé. Vérifie que l'appli démarre sans
   erreur JavaScript, que le mur, un pari simple, une montante, la fenêtre de
   match, Outils et quelques fonctions pures répondent. Code de sortie 1 au
   moindre échec : NE PAS LIVRER dans ce cas.
   Prérequis : Playwright installé (npm i -g playwright) et un Chromium ;
   variable CHROMIUM pour forcer son chemin (sinon /opt/pw-browsers/chromium). */
const http = require('http'), fs = require('fs'), path = require('path');
let pw;
try { pw = require('playwright'); } catch (e) { pw = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); }

const RACINE = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const PAGE = process.argv[3] || 'index.html';
const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon' };

const serveur = http.createServer((req, res) => {
  const f = path.join(RACINE, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(RACINE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

const resultats = [];
const ok = (nom, cond, detail) => { resultats.push([!!cond, nom, detail || '']); };

serveur.listen(0, async () => {
  const port = serveur.address().port;
  const navig = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' });
  const page = await navig.newPage({ viewport: { width: 412, height: 900 } });
  const erreurs = [];
  page.on('pageerror', e => erreurs.push(e.message));
  /* Tout l'extérieur est simulé : réponses vides et valides. */
  await page.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, r => {
    const u = r.request().url();
    if (/\.(png|jpe?g|svg|webp|gif)(\?|$)/i.test(u)) return r.fulfill({ status: 404, body: '' });
    /* 20261016s : relais TheSportsDB du worker (Refus = 403 → l'appli doit appeler TheSportsDB en direct) */
    if (/host=tsdb/.test(u) && /Trop/.test(u)) return r.fulfill({ status: 429, body: 'trop' });
    if (/host=tsdb/.test(u)) return /Refus/.test(u) ? r.fulfill({ status: 403, body: 'non' }) : r.fulfill({ status: 200, contentType: 'application/json', body: /json%2F123%2F/.test(u) ? '{"via":"worker"}' : '{"via":"cle3"}' });   // 20261023u : clé 123
    if (/thesportsdb\.com\/api/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: /json\/123\//.test(u) ? '{"via":"direct"}' : '{"via":"cle3"}' });
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  try {
    await page.goto('http://localhost:' + port + '/' + PAGE);
    await page.waitForTimeout(3000);
    const r = await page.evaluate(async () => {
      const o = {};
      /* 20261021g : critères et curseurs FERMÉS à l'arrivée → contrôle de l'état fermé, puis tout ouvert pour les autres contrôles */
      try {
        const hf = _g45CursHtml([], null, null, 'Ferme FC'), hc = window._g45CrHtml('Ferme FC'), ch = _g45Chargeur('Chargement test');
        o.ferme = (/Curseurs de la saison/.test(hf) && /Ouvrir/.test(hf) && !/Nombre de buts/.test(hf) && /Ouvrir/.test(hc) && !/Lieu/.test(hc) && /BET<span/.test(ch) && /Chargement test/.test(ch)) || hf.slice(0, 200);
      } catch (e) { o.ferme = 'erreur : ' + e.message; }
      window._g45CursToujours = true; window._g45Cr.ovTous = true;
      /* 20261021p : Sélection du jour — après minuit (avant 15 h), celle de la veille reste affichée */
      try {
        const O = window._g45TrOff || (window._g45TrOff = {}), sv = O.j, st = O.t, hier = new Date(Date.now() - 864e5); hier.setHours(10, 0, 0, 0);
        try { localStorage.removeItem('g45tr_sel_ferme'); } catch (e) {}
        const nuit = new Date(); nuit.setHours(3, 0, 0, 0);   // 20261023s : match de la nuit (la sélection = matchs joués de 8 h à 8 h)
        O.j = { t: [{ id: '77', sl: 'nba', t: nuit.getTime(), n: hier.toISOString(), h: 'Wizards', a: 'Bucks', m: '- de 239,5 points', k: 'U239.5', p: .71, c: 1.81, d: 0, r: null }] }; O.t = Date.now();
        const HS = window._g45TrSelHtml();
        O.j = sv; O.t = st;
        o.selHier = (new Date().getHours() < 15 ? (/Wizards/.test(HS) && /Choisie hier/.test(HS) && /g45sel-m/.test(HS) && /WIZ|BUC/.test(HS)) : !/Wizards/.test(HS)) || HS.replace(/<[^>]+>/g, ' ').slice(0, 300);
      } catch (e) { o.selHier = 'erreur : ' + e.message; }
      /* 20261022b : tournois en salle reconnus, contrecoup hors avis standard */
      try { o.salle = (window._g45TnSurf('Swiss Indoors Basel', false) === 'salle' && window._g45TnSurf('Rolex Paris Masters', false) === 'salle' && window._g45TnSurf('Rolex Shanghai Masters', false) === 'dur'
        && window._g45TnSurf('Porsche Tennis Grand Prix', true) === 'terre' && window._G45_TN_STD.prec === 0) || 'surfaces : ' + window._g45TnSurf('Swiss Indoors Basel', false); } catch (e) { o.salle = 'erreur : ' + e.message; }
      /* 20261022g : tour du match déduit + bilan à ce tour ; âge et tour dans l'avis standard */
      try { const n = Date.now(), M = (j, ek, rd, w) => ({ id: ek + rd + j, t: n - j * 864e5, ek, rd, w, sf: 'dur', cat: 'a250', tr: 'X', adv: '9' });
        const C = _g45TnCalc([M(1, 'e1', 'Round 1 - Court 2', true), M(30, 'e0', 'Round 2', true), M(60, 'e9', 'Round 2', false), M(90, 'e8', 'Round 2 - Centre', true)], { sf: 'dur', ek: 'e1' });
        const C2 = _g45TnCalc([M(30, 'e0', 'Semifinal', true)], { sf: 'dur', ek: 'e5', rd: 'Semifinal' });
        o.tnTour = (C.rdCour === 'Round 2' && C.tourBil[0] === 2 && C.tourBil[1] === 3 && C2.rdCour === 'Semifinal' && C2.tourBil[1] === 1 && _G45_TN_STD.age === 3 && _G45_TN_STD.tour === 2) || JSON.stringify([C.rdCour, C.tourBil, C2.rdCour]); } catch (e) { o.tnTour = 'erreur : ' + e.message; }
      try { const sj = window._g45TnStyleJ; window._g45TnStyleJ = { atp: { carlosalcaraz: ['Carlos Alcaraz', 'Polyvalent'] }, wta: {} };
        o.tnStyle = (window._g45TnStyleDe('atp', 'Carlos Alcaraz') === 'Polyvalent' && window._g45TnStyleDe('wta', 'Carlos Alcaraz') === null && _G45_TN_STD.sty === 3) || 'style'; window._g45TnStyleJ = sj; } catch (e) { o.tnStyle = 'erreur : ' + e.message; }
      try { var K = window._g45TnBk(0.58, 1.43, 2.65), K2 = window._g45TnBk(0.42, 2.65, 1.43), L = window._g45TnBkLigne(K, 'Brandon Nakashima', 'Kyrian Jacquet');
        o.tnBk = (K.ec === -7 && K.mg === 8 && K2.vG === 11 && K.vX === 11 && !window._g45TnBkVal(K) && /Le book y croit plus/.test(L) && !/Value/.test(L) && /Value Y 2,00 \(\+16 %, à confirmer\)/.test(window._g45TnBkLigne(window._g45TnBk(0.42, 1.5, 2.0), 'X', 'Y'))
          && /pas encore de cote/.test(window._g45TnBkLigne(null)) && window._g45TnBk(0.6, 1, 2) === null) || JSON.stringify([K, K2]); } catch (e) { o.tnBk = 'erreur : ' + e.message; }
      try { var PP = []; for (var q = 0; q <= 200; q++) PP.push({ km: q * 0.45, alt: 40 + (q % 20 < 2 ? 60 : 0), sl: 0 });
        var ST = _g45RcProfStats(PP), SV = _g45RcSVG2(PP, []);
        o.rcProf = (/Étape plate/.test(ST.ty[0]) && ST.hm === 100 && />600 m</.test(SV) && />0 m</.test(SV) && /g45RcProfDoigt/.test(SV)) || JSON.stringify(ST); } catch (e) { o.rcProf = 'erreur : ' + e.message; }
      try { o.tnReel = (window._g45TnReel(60) === 60 && window._g45TnReel(60, true) > 60) || [window._g45TnReel(60), window._g45TnReel(60, true)].join('/'); } catch (e) { o.tnReel = 'erreur : ' + e.message; }
      try { var PR = window._g45TnPer, tj = function (m, j) { return new Date(2025, m, j).getTime(); };
        var Bi = window._g45TnPerBilan([{ sf: 'dur', t: tj(0, 20), ct: 'Océanie', w: true }, { sf: 'dur', t: tj(0, 22), ct: 'Océanie', w: false }, { sf: 'terre', t: tj(4, 2), ct: 'Europe', w: true }]);
        o.tnPer = (PR('terre', tj(4, 1), 'Europe') === 'Terre · Europe' && PR('terre', tj(1, 10), 'Amérique du Sud') === 'Terre · Amérique du Sud' && PR('gazon', tj(5, 20), 'Europe') === 'Gazon'
          && /australienne|Australie/.test(PR('dur', tj(0, 15), 'Océanie')) && /printemps/.test(PR('dur', tj(2, 15), 'Amérique du Nord')) && /été/.test(PR('dur', tj(8, 5), 'Amérique du Nord'))
          && /automne/.test(PR('salle', tj(9, 23), 'Europe')) && Bi['Terre · Europe'].w === 1 && Bi[PR('dur', tj(0, 1), '')].n === 2) || 'per'; } catch (e) { o.tnPer = 'erreur : ' + e.message; }
      try { var VJ = window._g45TnVitJ; window._g45TnVitJ = { atp: { montpellier: ['Montpellier', 1.49, 'Hard', '2026-02-02'], miamimasters: ['Miami Masters', 1.18, 'Hard', ''], montecarlomasters: ['Monte Carlo Masters', 0.7, 'Clay', ''] } };
        var VD = window._g45TnVitDe;
        o.tnVit = (VD('atp', 'Open Occitanie', 'Montpellier, France') === 1.49 && VD('atp', 'Miami Open presented by Itau', '') === 1.18 && VD('atp', 'Rolex Monte-Carlo Masters', '') === 0.7
          && VD('atp', 'Inconnu', '') === null && VD('wta', 'Open Occitanie', 'Montpellier') === null && window._g45TnVitCl(1.49) === '⚡ Rapide' && window._g45TnVitCl(0.7) === '🐢 Lent' && window._g45TnVitCl(1) === '⚖️ Moyen') || 'vit';
        window._g45TnVitJ = VJ; } catch (e) { o.tnVit = 'erreur : ' + e.message; }
      try { var EJ = window._g45TnEloJ; window._g45TnEloJ = { atp: { novakdjokovic: ['Novak Djokovic', 2062, 2015, 1961, 1939, 4, 12, -1.1], flaviocobolli: ['Flavio Cobolli', 1873, 1789, 1840, 1766, 27, 6, null], tommypaul: ['Tommy Paul', 1948, 1885, 1885, 1797, 15, 15, 0] } };
        var e2 = function (t) { return t; }, H1 = window._g45TnEloRangHtml('atp', 'Novak Djokovic', e2), H2 = window._g45TnEloRangHtml('atp', 'Flavio Cobolli', e2);
        o.tnRang = (/meilleur que son classement ATP/.test(H1) && /flatteur/.test(H2) && window._g45TnEloRang('atp', 'Flavio Cobolli').ld === 1.5 && window._g45TnEloRangHtml('atp', 'Tommy Paul', e2) === '' && window._g45TnEloRang('atp', 'Inconnu') === null) || 'rang';
        window._g45TnEloJ = EJ; } catch (e) { o.tnRang = 'erreur : ' + e.message; }
      try { var R1 = window._g45TnSvSim(0.8, 0.8, 2), R2 = window._g45TnSvSim(0.92, 0.9, 2), R3 = window._g45TnSvSim(0.85, 0.65, 2);
        var SJ = window._g45TnSvJ; window._g45TnSvJ = { atp: { a: { nom: 'A', t: { n: 20, tg: 88, br: 20 }, Hard: { n: 3, tg: 90, br: 15 } } } };
        var SD = window._g45TnSvDe('atp', 'A', 'dur'); window._g45TnSvJ = SJ;
        o.tnSv = (R2.tb > R1.tb && R1.tb > R3.tb && R2.jx > R3.jx && Math.abs(R1.setA - R1.setB) < 1e-6 && R3.setA > R3.setB && SD.s.n === 20 && !SD.sfOk
          && window._g45TnBkVal({ vG: 10, cG: 2.0, vX: 0, cX: 1.8 }) && !window._g45TnBkVal({ vG: 10, cG: 3.2, vX: 0, cX: 1.3 })) || JSON.stringify([R1, R2, R3]); } catch (e) { o.tnSv = 'erreur : ' + e.message; }
      try { var TV = window._g45TnTvHtml({ tv: [{ t: Date.now() - 864e5, h: 'A', a: 'B', n: 'A', c: 2, r: 1 }, { t: Date.now() - 2 * 864e5, h: 'C', a: 'D', n: 'D', c: 1.8, r: 0 }, { t: Date.now(), h: 'E', a: 'F', n: 'E', c: 1.6 }] });
        o.tnTv = (/2 jugés · 1 gagnés/.test(TV) && /\+0,00 €/.test(TV) && /1 en attente/.test(TV) && window._g45TnTvHtml({ tv: [] }) === '') || TV.slice(0, 300); } catch (e) { o.tnTv = 'erreur : ' + e.message; }
      /* 20261022i : critères 4 saisons, onglet 👤 Joueurs des sports US (index g45_jou_v2_, présence, rôle, combien) */
      try { const C = window._g45Cr, ctx = { sp: 'football', lg: 'nfl', id: '14' };
        C.data['Rams T'] = { t: Date.now(), lg: 'nfl', ligue: 'NFL', saisons: [{ an: 2025, ms: [['2025-09-07', 1, 24, 10, 0, 0, 'e1'], ['2025-09-14', 0, 20, 27, 0, 0, 'e2'], ['2025-09-21', 1, 30, 7, 0, 0, 'e3']] }] };
        localStorage.setItem('g45_jou_v2_football_nfl_14_2025', JSON.stringify({ joueurs: { p1: { nom: 'Puka Nacua', tot: { td: 2 } } }, parMatch: { e1: { td: { p1: 1 } }, e2: {}, e3: { td: { p1: 2 } } }, pres: { e1: ['p1'], e2: ['p1'] }, n: 3 }));
        try { localStorage.setItem('g45_cr_tab', 'jou'); } catch (e) {}
        window._g45CrHtml('Rams T', ctx); const cb = C.combos[C.a]; cb.jo = 'p1'; cb.jn = 'Puka Nacua'; cb.jm = 'td'; cb.res = '';
        const H1 = window._g45CrHtml('Rams T', ctx).replace(/<[^>]+>/g, ' ');
        localStorage.removeItem('g45_jou_v2_football_nfl_14_2025'); delete C.data['Rams T']; C.nom = '';
        o.crUs = (/Puka Nacua touchdown/.test(H1) && /Combien/.test(H1) && /1\/2/.test(H1)) || H1.slice(0, 600); } catch (e) { o.crUs = 'erreur : ' + e.message; }
      /* 20261022r : curseurs sports US — onglets ⏱️ Quart-temps et 🔁 Contexte */
      try { const P = (a, b, c, d) => [{ p: 1, v: a }, { p: 2, v: b }, { p: 3, v: c }, { p: 4, v: d }], n = Date.now();
        const L = [{ t: n - 20 * 864e5, dom: true, pour: 24, contre: 10, lp: P(7, 7, 3, 7), lc: P(0, 3, 7, 0) }, { t: n - 13 * 864e5, dom: false, pour: 17, contre: 20, lp: P(0, 10, 0, 7), lc: P(7, 3, 7, 3) },
          { t: n - 2 * 864e5, dom: true, pour: 30, contre: 27, lp: P(3, 7, 10, 10), lc: P(10, 7, 3, 7) }];
        const sv = localStorage.getItem('g45_sgc_tab'), CT = window._g45CursToujours; window._g45CursToujours = true;
        localStorage.setItem('g45_sgc_tab', 'qt'); const Hq = window._g45SgCursHtml(L, 'football', 'Rams').replace(/<[^>]+>/g, ' ');
        localStorage.setItem('g45_sgc_tab', 'ctx'); const Hc = window._g45SgCursHtml(L, 'football', 'Rams').replace(/<[^>]+>/g, ' ');
        if (sv == null) localStorage.removeItem('g45_sgc_tab'); else localStorage.setItem('g45_sgc_tab', sv); window._g45CursToujours = CT;
        o.sgQt = (/1er quart-temps/.test(Hq) && /Rams gagne le 1er quart-temps\s+1\/3/.test(Hq) && /remontée\)\s+1\/1/.test(Hq) && /Après une victoire\s+0\/1/.test(Hc) && /Après une défaite\s+1\/1/.test(Hc)) || (Hq + ' || ' + Hc).slice(0, 700); } catch (e) { o.sgQt = 'erreur : ' + e.message; }
      /* 20261022s : 🎯 TD / FG NFL (feuille ESPN scoringPlays → mémoire par match) */
      try { const F = window._g45TdFeuille({ header: { competitions: [{ competitors: [{ homeAway: 'home', team: { abbreviation: 'LAR' } }, { homeAway: 'away', team: { abbreviation: 'SF' } }] }] },
          scoringPlays: [{ type: { abbreviation: 'FG' }, team: { abbreviation: 'SF' } }, { type: { abbreviation: 'TD' }, team: { abbreviation: 'LAR' } }, { type: { abbreviation: 'TD' }, team: { abbreviation: 'SF' } }] });
        localStorage.setItem('g45nfltd1_td1', JSON.stringify(F)); localStorage.setItem('g45nfltd1_td2', JSON.stringify([3, 1, 2, 0, 'h', 'TD']));
        const n = Date.now(), L = [{ id: 'td1', t: n - 9 * 864e5, dom: true, pour: 7, contre: 10 }, { id: 'td2', t: n - 2 * 864e5, dom: false, pour: 13, contre: 27 }];
        const sv = localStorage.getItem('g45_sgc_tab'), CT = window._g45CursToujours; window._g45CursToujours = true; localStorage.setItem('g45_sgc_tab', 'td');
        const Ht = window._g45SgCursHtml(L, 'football', 'Rams').replace(/<[^>]+>/g, ' ');
        if (sv == null) localStorage.removeItem('g45_sgc_tab'); else localStorage.setItem('g45_sgc_tab', sv); window._g45CursToujours = CT; localStorage.removeItem('g45nfltd1_td1'); localStorage.removeItem('g45nfltd1_td2');
        o.sgTd = (JSON.stringify(F) === '[1,1,0,1,"a","FG"]' && /Touchdowns · 2 matchs/.test(Ht) && /Rams marque en premier\s+0\/2/.test(Ht) && /1er score = field goal\s+1\/2/.test(Ht)) || (JSON.stringify(F) + ' ' + Ht).slice(0, 600); } catch (e) { o.sgTd = 'erreur : ' + e.message; }
      /* 20261022c : octobre 2026 = période de test (hors totaux) */
      try { const to = Date.parse('2026-10-15T12:00:00Z'), tn = Date.parse('2026-11-15T12:00:00Z');
        const c1 = _g45TrOffCalc([{ t: to, r: 1, c: 2 }, { t: tn, r: 1, c: 2 }]); window._g45TrTestOk = true; const c2 = _g45TrOffCalc([{ t: to, r: 1, c: 2 }]); window._g45TrTestOk = false;
        o.trTest = (c1.n === 1 && c2.n === 1 && _g45TrEnTest(to) && !_g45TrEnTest(tn) && _g45TrTestVoit() === true) || JSON.stringify({ a: c1.n, b: c2.n }); } catch (e) { o.trTest = 'erreur : ' + e.message; }
      /* 20261022d : Bilans par mois */
      try { const O = window._g45TrOff, sv = O.j, st = O.t, sm = O.mois, sj = O.jour, sb = O.bilOuv;
        const T = (d, r, c) => ({ id: 'b' + d + r, sl: 'fra.1', t: Date.parse(d + 'T18:00:00Z'), h: 'A', a: 'B', m: 'Victoire A', k: '1', p: .6, c, d: 0, r });
        O.j = { t: [T('2026-10-10', 1, 2), T('2026-11-03', 1, 2), T('2026-11-04', 0, 1.8), T('2026-12-02', 1, 1.6)] }; O.t = Date.now(); O.mois = '2026-11'; O.jour = null; O.bilOuv = true;
        const HB = window._g45TrOffHtml().replace(/<[^>]+>/g, ' ');
        O.j = sv; O.t = st; O.mois = sm; O.jour = sj; O.bilOuv = sb;
        o.bilMois = (/Bilans par mois/.test(HB) && /Novembre/.test(HB) && /Décembre/.test(HB) && /Période de test/.test(HB) && /2 \/ 3 jugées/.test(HB)) || HB.slice(0, 500); } catch (e) { o.bilMois = 'erreur : ' + e.message; }
      o.state = typeof state !== 'undefined' && !!state;
      o.mur = !!document.querySelector('#t-dash, #dash, .g45-murcard, [id^="t-"]');
      /* Pari simple puis montante, sur un bookmaker approvisionné. */
      try {
        window.alert = () => {}; window.confirm = () => true; window.prompt = () => '';
        const bk = document.getElementById('n-book'); const b = bk && bk.options.length ? bk.value : 'piwi';
        state.b = state.b || {}; state.b[b] = 1000;
        const avant = (state.h || []).length;
        document.getElementById('n-team').value = 'Test FC'; document.getElementById('n-analysis').value = 'Essai';
        document.getElementById('n-mise').value = '1'; document.getElementById('n-cote').value = '1.5';
        document.getElementById('n-joueur').value = 'Joueur Test';
        pari(false);
        o.pariSimple = state.h.length === avant + 1 && state.h[0].joueur === 'Joueur Test';
        if (o.pariSimple) state.h.shift();
      } catch (e) { o.pariSimple = 'erreur : ' + e.message; }
      try {
        state.u = state.u && state.u.length ? state.u : [{ n: 'Test FC', l: 1 }];
        const cu = document.getElementById('c-unit'); if (cu && cu.tagName === 'SELECT' && !cu.options.length) cu.innerHTML = '<option>' + state.u[0].n + '</option>';
        cu.value = state.u[0].n;
        const cb = document.getElementById('c-book'); state.b[cb.value] = 1000;
        document.getElementById('c-mise').value = '1';
        const avant = state.h.length; pari(true);
        o.montante = state.h.length === avant + 1;
        if (o.montante) state.h.shift();
      } catch (e) { o.montante = 'erreur : ' + e.message; }
      try { render(); o.render = true; } catch (e) { o.render = 'erreur : ' + e.message; }
      /* Fenêtre de match hors foot, sur un résumé ESPN minimal. */
      try {
        const w = document.createElement('div'); document.body.appendChild(w);
        await _renderGenericDetail(w, 'basketball', 'nba', '1');
        o.fenetre = w.innerHTML.length > 0;
      } catch (e) { o.fenetre = 'erreur : ' + e.message; }
      try { o.outils = !!document.getElementById('t-outils'); if (typeof _g45SanteAfficher === 'function') { _g45SanteAfficher(); o.sante = !!document.getElementById('g45-sante'); } } catch (e) { o.outils = 'erreur : ' + e.message; }
      /* Fonctions pures : règlement semi-automatique (règles du Worker). */
      try {
        o.verdict = [_g45AvPari('Victoire', true, 2, 1) === true, _g45AvPari('Over 2.5', null, 1, 0) === false,
                     _g45AvPari('Buteur', true, 2, 1) === null, _g45AvPari('Victoire', null, 2, 1) === null].every(Boolean);
      } catch (e) { o.verdict = 'erreur : ' + e.message; }
      /* Avis IA (29/09/2026) : bloc « Accord des IA » et mise en forme d'un avis. */
      try {
        const av = (p) => ({ lbl: 'X', col: '#fff', txt: '🎯 PRONOSTIC : ' + p + ' — 2-1\n💎 VALEUR : BTS Oui' });
        const acc = _g45IaAccord([av('1 (Real)'), av('1 (Real Madrid)'), av('X (nul)')]);
        o.avisIa = /1 \(Real\) : 2 IA/.test(acc.replace(/<[^>]+>/g, '')) && /Majorité/.test(acc)
          && /<b[^>]*>🎯 PRONOSTIC :<\/b>/.test(_g45IaTexteHtml('🎯 PRONOSTIC : 1')) && typeof _g45IaFaitsEcran === 'function' && typeof _g45IaFaitsGen === 'function';
      } catch (e) { o.avisIa = 'erreur : ' + e.message; }
      /* Radars (30/09/2026) : VS équipes (moyennes + radar SVG) et radar joueur par 90 min. */
      try {
        const L = [{ id: 'a', t: 1, h: '1', a: '2', hg: 2, ag: 1, sh: [12, 5, 6, 55, 10], sa: [8, 3, 4, 45, 12], f: 1, b: [['1', 10], ['2', 30], ['1', 60]], mh: 1, ma: 1 },
                   { id: 'b', t: 2, h: '3', a: '1', hg: 0, ag: 0, sh: [9, 2, 3, 50, 11], sa: [10, 4, 5, 50, 9], f: 1, b: [], mh: 0, ma: 0 }];
        const g = _g45VsAgg(_g45VsSiens(L, '1'), '1');
        const svg = _g45VsRadar(g, _g45VsAgg(_g45VsSiens(L, '3'), '3'), _g45VsBornes([L]));
        const S = { minutes: 180, totalGoals: 2, shotsOnTarget: 3, _tirs: 6, touches: 60, accuratePasses: 40, passPct: 0.8, duelsWon: 6, duels: 10 };
        const v = _g45RadVals(S, 'att');
        o.radars = g.n === 2 && g.bm === 1 && g.ti === 11 && g.pos === 52.5 && g.prem === 50 && (svg.match(/<polygon/g) || []).length === 2
          && !/NaN/.test(svg) && v[0] === 1 && v[1] === 3 && /<polygon/.test(_g45RadSvg('att', v, null)) && typeof g45RadOuvrir === 'function'
          && _g45VjVals({ points: 700, gamesPlayed: 70, _gp: 70, totalRebounds: 350, 'pitching.ERA': 3 }, 'nba')[0] === 10 && _g45VjVals({ 'pitching.ERA': 3.1, _gp: 20 }, 'mlbL')[0] === 3.1
          && _g45VjGabPoste('hockey', 'G') === 'nhlG' && _g45VjGabPoste('football', 'WR') === 'nflWR' && typeof g45VsBascule === 'function'
          && _g45VeVals({ 'offensive.avgPoints': 113.4, _gp: 71, _R: { j: 71, v: 52, bp: 8150, bc: 7550 } }, 'basketball')[0] === 113.4 && typeof g45VeEquipe === 'function' && typeof _g45VsAfficher === 'function'
          && (function () { var D = _g45AmCalc([{ equipe: '1', xg: 0.4, but: true, min: "23'", periode: 1, qui: 'A' }, { equipe: '2', xg: 0.2, min: "50'", periode: 2, qui: 'B' }], { header: { competitions: [{ status: { type: { state: 'post' } }, competitors: [{ homeAway: 'home', score: '1', team: { id: '1' } }, { homeAway: 'away', score: '0', team: { id: '2' } }] }] } }); return D.xh === 0.4 && D.buts.length === 1 && /<svg/.test(_g45AmHtml(D, 'x')); })()
          && /Balle 1/.test(_g45LiveMlbHtml({ header: { competitions: [{ status: { type: { state: 'in', shortDetail: 'Bot 6th' } }, competitors: [] }] }, situation: { balls: 1, strikes: 0, outs: 0, lastPlay: { id: 'z' } }, plays: [{ id: 'z', text: 'Pitch 1 : Ball 1' }] }))
          && _g45RadDevine({}, 'G') === 'gk' && _g45RadDevine({ saves: 3 }, '') === 'gk' && _g45RadDevine({}, 'CB') === 'def'
          && (function () { var v = _g45RadVals({ minutes: 360, appearances: 4, saves: 13, goalsConceded: 2, cleanSheet: 2, passPct: 0.89 }, 'gk'); return Math.round(v[1]) === 87 && v[2] === 0.5 && v[3] === 50 && !/NaN/.test(_g45RadSvg('gk', v, null)); })()
          && _g45T14Slug('Stade Toulousain') === 'toulouse' && _g45T14Slug('RC Toulon') === 'toulon' && _g45T14Slug('Racing 92') === 'racing-92' && _g45T14Slug('Leinster') === null
          && (function () { var P = _g45T14Lire('<a class="player-block"><img class="player-block__player-img" src="https://cdn.lnr.fr/j/photoFull.ab"><img class="player-block__country" alt="France" src="f.svg"><div class="player-block__name">A B</div><div class="player-block__position">Arrière</div><div class="player-block__statistics">3 matches joués 240 minutes jouées 27 points marqués</div></a>'); return P.length === 1 && P[0].m === 3 && P[0].mi === 240 && P[0].pt === 27 && P[0].pays === 'France'; })()
          && G45_SPORTS.filter(function (x) { return x.key === 'rugby'; })[0].groups[0].leagues.some(function (l) { return l.slug === 'prod2'; }) && typeof loadCompetTab._g45Pd2 !== 'undefined'
          && (function () { var C = _g45Pd2Classement('<div class="ranking ranking--full"><div class="table-line table-line--ranking-fixed"> 1 </div><div class="table-line table-line--ranking-scrollable"><div>Oyonnax</div><div>23</div><div>5</div><div>5</div><div>0</div><div>0</div><div>3</div><div>205</div><div>115</div><div>+90</div><div>V V V V V</div><div>x</div></div></div>');
              var J = _g45Pd2Journee('<div class="match-calendar-line"><div class="club-line"><a class="club-line__name">A</a></div><div class="match-line__score-wrapper">41 - 26</div><div class="club-line"><a class="club-line__name">B</a></div></div>');
              return C && C[0].r === 1 && C[0].p === '23' && C[0].fo === 'VVVVV' && J && J[0].sh === 41 && J[0].a.n === 'B'; })()
          && (function () { var D = _g45Pd2Feuille('<header-timeline :game-facts=\'[{"type":"Point","subtype":"Essai","club":"home","period":1,"minute":13,"score":[7,0],"player":{"firstName":"Yanis","lastName":"Charcosset"}}]\'></header-timeline>', '<players-ranking :ranking=\'[{"player":{"name":"V. A"},"nbPoints":"5"}]\'></players-ranking>');
              return D && D.F[0].j === 'Y. Charcosset' && D.F[0].sc[0] === 7 && D.J[0][0].pt === '5'; })()
          && (function () { var E = _g45Pd2Equipes([{ h: { n: 'Brive' }, a: { n: 'Dax' }, sh: 24, sa: 21 }, { h: { n: 'Oyo' }, a: { n: 'Brive' }, sh: 30, sa: 10 }], 'g', 0);
              var d = E.filter(function (e) { return e.n === 'Dax'; })[0], o = E.filter(function (e) { return e.n === 'Oyo'; })[0];
              return d.bd === 1 && o.v12 === 1 && _g45Pd2Val(o, 'pts', 0) === 30 && _g45Pd2Val(d, 'pv', 0) === 0; })()
          && _g45LiveType('Take On') === 'Dribble'
          && (function () { var e = function (c, s) { return { club: { code: c, name: c }, score: s, partials: {} }; };
              var g = [{ gameCode: 1, round: 1, phaseType: { code: 'RS' }, played: true, utcDate: '2026-10-01T18:00:00Z', local: e('A', 80), road: e('B', 70) }].map(_g45ElCompact);
              var L = _g45ElClassement(g); return L.length === 2 && L[0].n === 'A' && L[0].v === 1 && L[1].d === 1 && /Journée 1/.test(_g45ElJourneesHtml(g)); })()
          && (function () { var B = _g45ButsSeq([{ t: '1', ty: 'Goal Kick', x: 3, y: 50, x2: 20, y2: 40, nm: 'A Gardien', c: "10'" }, { t: '1', ty: 'Pass', x: 20, y: 40, x2: 90, y2: 50, nm: 'B Milieu', c: "10'" },
              { t: '1', ty: 'Goal', x: 90, y: 50, x2: 100, y2: 50, nm: 'C Buteur', c: "10'", sc: 1, tx: 'Goal! X 1, Y 0. C Buteur (X) right footed shot.' }, { t: '1', ty: 'Assist', x: null, nm: 'B Milieu', c: "10'", as: 1 }], '1', '2');
              return B.length === 1 && B[0].seq.length === 3 && B[0].nom === 'C Buteur' && B[0].pas === 'B Milieu' && B[0].sH === 1; })()
          && (function () { var c = _g45ChCanvas([{ x: 38, y: 80 }, { x: 38, y: 80 }]); if (!c) return false; var px = c.getContext('2d').getImageData(120, 41, 1, 1).data; return px[0] > 230 && px[1] < 120; })()
          && /59,4 %/.test(_g45WpBloc({ header: { competitions: [{ status: { type: { state: 'post' } } }] }, winprobability: [{ homeWinPercentage: 0.5, playId: 'a' }, { homeWinPercentage: 0.594, playId: 'b' }] }, 'sm', 'A', 'B', 'baseball', 'mlb'));
      } catch (e) { o.radars = 'erreur : ' + e.message; }
      /* 20261001s — KBO (mykbostats) : lecture des pages (formes SONDÉES par Antoine) + rendu du classement. */
      try {
        const W = _g45KboSemaine('<section class="ds-schedule-day"><a id="game-line-1" href="/games/1-NC-vs-Doosan-20260930" data-game-datetime="2026-09-30T09:30:00Z"><div><div><div><img src="/assets/images/team-logos-alt/nc.png"><span>NC<span> Dinos</span></span><span>5</span></div><div><img src="/assets/images/team-logos-alt/doosan.png"><span>Doosan<span> Bears</span></span><span>6</span></div></div><div><div><span>Final</span></div></div></div></a></section><a href="/schedule/week_of/2026-09-22">p</a><a href="/schedule/week_of/2026-10-06">n</a>');
        const sb = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '', 'R', 'H', 'E', 'B'].map(x => '<div class="header">' + x + '</div>').join('')
          + '<div class="team">NC Dinos</div>' + ['0', '0', '0', '0', '3', '0', '0', '1', '1', '', '5', '15', '1', '3'].map(x => '<div>' + x + '</div>').join('')
          + '<div class="team">Doosan Bears</div>' + ['0', '1', '0', '0', '0', '2', '0', '0', '3', '', '6', '9', '0', '2'].map(x => '<div>' + x + '</div>').join('');
        const F = _g45KboFeuille('<p>September 30, 2026 6:30pm · Jamsil Baseball Stadium</p><span>62–72–2 · 6th</span><div class="scoreboard">' + sb + '</div>'
          + '<table><tr><th></th><th>NC</th><th>Pos</th><th>BA</th><th>AB</th><th>R</th><th>H</th><th>HR</th><th>RBI</th><th>BB</th><th>SO</th><th>HBP</th></tr><tr><td>1</td><td>Kim Ju-won #7</td><td>SS</td><td>.288</td><td>4</td><td>0</td><td>2</td><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td></tr></table>'
          + '<table><tr><th>NC</th><th>ERA</th><th>IP</th><th>NP</th><th>R</th><th>ER</th><th>H</th><th>HR</th><th>SO</th><th>BB</th><th>HB</th><th>GS</th></tr><tr><td>Thompson #3</td><td>3.00</td><td>6</td><td>98</td><td>2</td><td>2</td><td>7</td><td>1</td><td>5</td><td>2</td><td>0</td><td>53</td></tr></table>'
          + '<table><tr><td>Deciding Hit</td><td>Kang Seung-ho (9th inning)</td></tr></table>');
        const C = _g45KboClassement('<table><tr><th>Rank / Team</th><th>W</th><th>L</th><th>D</th><th>PCT</th><th>GB</th><th>STRK</th><th>L10</th></tr><tr><td>1</td><td><a href="/teams/22-KT-Wiz"><img src="/assets/images/team-logos-alt/kt.png">KT<span>Wiz</span></a></td><td>83</td><td>49</td><td>4</td><td>.629</td><td>0.0</td><td>3W</td><td>7W 0D 3L</td></tr></table>');
        const L = _g45KboLeaders('<table><tr><th>Rank / Player</th><th>Team</th><th>HR</th><th>HR/G</th></tr><tr><td>1</td><td>Kim Do-yeong</td><td>Kia Tigers</td><td>41</td><td>0.33</td></tr></table>');
        const E = _g45KboEquipe('<table><tr><th>Pitchers</th><th>ERA</th><th>WHIP</th><th>IP</th><th>SO</th><th>BB</th><th>K/BB</th><th>Age / DOB</th></tr><tr><td><a href="/players/950"><img data-player-photo src="/photos/player/950/1.jpg"></a><a href="/players/950">Logan Allen</a> <span>#43 · SP · LHP</span></td><td>3.93</td><td>1.46</td><td>84 ⅔</td><td>69</td><td>27</td><td>0.39</td><td>29</td><td>1997-05-23</td></tr></table>');
        localStorage.setItem('g45kbo1_cls', JSON.stringify({ d: C, x: Date.now() + 6e5 }));
        const z = document.createElement('div'); document.body.appendChild(z);
        _g45Kbo.vue = 'c'; await _g45KboRendre(z);
        o.kbo = W && W.M.length === 1 && W.M[0].a.n === 'NC Dinos' && W.M[0].h.s === 6 && _g45KboEtat(W.M[0]) === 'fin' && W.prev === '/schedule/week_of/2026-09-22' && W.next === '/schedule/week_of/2026-10-06'
          && F && F.ls.r.length === 2 && F.ls.r[0][11] === '5' && F.bat[0].r[0].n === 'Kim Ju-won #7' && F.bat[0].r[0].v.H === '2' && F.pit[0].r[0].v.SO === '5' && F.no.length === 1 && F.st === 'Jamsil Baseball Stadium' && F.rec[0].rg === 6
          && C && C[0].n === 'KT Wiz' && C[0].w === '83' && C[0].se === '3 V' && C[0].l10 === '7 V 0 N 3 D' && /mykbostats\.com\/assets/.test(C[0].l)
          && L && L.k === 'HR' && L.r[0].x === '41' && L.r[0].eq === 'Kia Tigers' && E && E.p[0].n === 'Logan Allen' && E.p[0].po === 'SP' && E.p[0].v.ERA === '3.93' && /mykbostats\.com\/photos\/player\/950/.test(E.p[0].ph) && /Logan Allen/.test(E.p[0].n)
          && String(_g45KboAnsLire('<select id="stats_year"><option value="2024">2024</option><option value="2026">2026</option></select>')) === '2026,2024'
          && (function () { var P = _g45KboClsDepuisSplits([{ n: 'Kia Tigers', v: { W: '87', L: '55', D: '2', 'W%': '.613' } }, { n: 'Samsung Lions', v: { W: '78', L: '64', D: '2' } }], C); return P[0].n === 'Kia Tigers' && P[1].gb === '9.0' && P[1].pct === '.549'; })()
          && /KT Wiz/.test(z.innerHTML) && /83/.test(z.innerHTML) && !/NaN|undefined/.test(z.innerHTML)
          && G45_SPORTS.filter(function (x) { return x.key === 'baseball'; })[0].groups[0].leagues.some(function (l) { return l.slug === 'kbo'; }) && loadCompetTab._g45Kbo === true && loadCompetTab._g45Pd2 === true
          || JSON.stringify({ W: W && W.M[0], prev: W && W.prev, F: F && { ls: F.ls, b: F.bat[0], st: F.st, rec: F.rec }, C, L, E }).slice(0, 900);
        z.remove(); localStorage.removeItem('g45kbo1_cls');
        /* 20261001y — équipes Euroleague / Pro A du mur : reconnaissance du nom + branchements du panneau Saisons */
        if (o.kbo === true && !(_g45EbCorrespond('ASVEL', ['LDLC ASVEL Villeurbanne', 'ASVEL']) && _g45EbCorrespond('ldlc asvel', ['ASVEL', 'LDLC ASVEL'])
          && !_g45EbCorrespond('Real Madrid', ['AS Monaco', 'Monaco']) && !_g45EbCorrespond('', ['x'])
          && (function () { var F = _g45ElFeuilleLire({ local: { coach: { name: 'POUPET, PIERRE' }, players: [{ player: { person: { name: 'DE COLO, NANDO' } }, stats: { timePlayed: 1500, points: 14, startFive: true, fieldGoalsMade3: 2, fieldGoalsAttempted3: 5 } }], total: {} }, road: { players: [], total: { points: 70 } } });
              return F && F.h.P[0].n === 'Nando De Colo' && F.h.P[0].mi === 25 && F.h.P[0].d5 && F.h.T.m3 === 2 && F.h.T.a3 === 5 && F.h.co === 'Pierre Poupet'; })()
          && typeof g45ElFiche === 'function'
          && loadTeamSaisons._g45Eb === true && _g45CompetMatchs._g45Eb === true && _g45SgMatch._g45Eb === true)) o.kbo = 'équipes Euroleague / Pro A : reconnaissance ou branchement KO';
        /* 20261001v — stats Euroleague : noms, lecture des 3 réponses SONDÉES par Antoine, % */
        const esL = _g45EsLeadersLire({ points: [{ details: { name: 'SHORTS, TJ', imageUrl: 'p.png', team: { code: 'PAM', name: 'Valencia Basket' } }, gamesPlayed: 1, average: 26 }], pir: [] });
        const esP = _g45EsJoueursLire({ players: [{ player: { name: 'DE COLO, NANDO', team: { code: 'ASV', name: 'LDLC ASVEL' } }, pointsScored: 12.5, pir: 14 }] });
        const esT = _g45EsEquipesLire({ teams: [{ team: { code: 'PRS', name: 'Paris Basketball' }, pointsScored: 88.5, threePointersPercentage: '38%' }] });
        o.kbo = o.kbo === true && _g45EsNom('SHORTS, TJ') === 'TJ Shorts' && _g45EsNom('DE COLO, NANDO') === 'Nando De Colo' && esL.points[0].n === 'TJ Shorts' && esL.points[0].x === 26 && !esL.pir
          && esP[0].pt === 12.5 && esP[0].tc === 'ASV' && esT[0].p3 === '38%' && _g45EsAff('38%', true) === '38 %' && _g45EsAff(0.667, true) === '66,7 %' && _g45EsAff(26) === '26,0' || (o.kbo === true ? 'stats Euroleague : ' + JSON.stringify({ L: esL, P: esP, T: esT }).slice(0, 300) : o.kbo);
        /* 20261003r — Pro A via be-basketball : morceaux Next.js recollés, match lu, tableau des équipes lu, branchements */
        if (o.kbo === true) {
          const pay = '0:' + JSON.stringify({ x: [{ id: '01a07aba-95a3-7504-bf60-ea1b66bd2672', datetime: { atom: '2026-10-02T18:00:00+00:00' }, mode: 'regular', number: '2', marking: 'finished',
            teams: { home: { name: 'Roanne', abbreviation: 'ROA', image: { src: 'r.jpg' } }, away: { name: 'Nanterre', abbreviation: 'JSF' } }, statTeams: { home: { points: 93 }, away: { points: 83 } } }] });
          const ht = '<script>self.__next_f.push([1,' + JSON.stringify(pay.slice(0, 50)) + '])</script><script>self.__next_f.push([1,' + JSON.stringify(pay.slice(50)) + '])</script>';
          const bm = _g45BbMatchsLire(_g45BbFlight(ht)).map(_g45BbCompact)[0];
          const bt = _g45BbTableEquipes('<table><thead><tr><th>Team</th><th>Games</th><th>ORtgOffensive Rating</th><th>DRtg</th><th>NRtg</th><th>PTSPoints</th><th>M</th><th>A</th><th>%</th></tr></thead><tbody><tr><td><img alt="Saint-Quentin" src="/_next/image?url=https%3A%2F%2Fcdn.bebasket.fr%2Fx.jpg&w=32"></td><td>1</td><td>120.3</td><td>116.9</td><td>3.4</td><td>106.0</td><td>24</td><td>48</td><td>50.0%</td></tr></tbody></table>');
          o.kbo = bm && bm.h.n === 'Roanne' && bm.h.s === 93 && bm.a.c === 'JSF' && bm.p && bm.r === 2 && bt && bt[0].n === 'Saint-Quentin' && bt[0].or === 120.3 && bt[0].p2 === 50 && bt[0].l === 'https://cdn.bebasket.fr/x.jpg'
            && _g45ProaMatchs._g45Bb === true && _g45PsHtml === _g45BbStatsHtml && (_g45BbLeadersLire('{"leaders":[{"games":2,"total":40,"average":20,"rank":1,"player":{"firstname":"A","lastname":"B","image":{"src":"x"}}}]}') || [])[0].n === 'A B' && /data-g45bbph/.test(_g45BbAvatar('Zz Inconnu', 40)) && (function () { var F = _g45ElFeuilleLire(_g45BbStatsVersEl({ home: [{ player: { firstname: 'Carlos', lastname: 'Stewart', slug: 'cs' }, timePlayed: 1860, points: 29, isStarter: true, threePointersMade: 5, threePointersAttempted: 9, rebounds: 4 }, { player: { firstname: 'Ludjan', lastname: 'Monrazel' }, timePlayed: 0, points: 0 }], away: [{ player: { firstname: 'A', lastname: 'B' }, timePlayed: 1200, points: 10 }] })); return F.h.P.length === 1 && F.h.P[0].n === 'Carlos Stewart' && F.h.P[0].mi === 31 && F.h.P[0].d5 && F.h.T.m3 === 5 && F.a.P[0].mi === 20; })() && _g45ElMatchHtml._g45Bb === true && g45ElFiche._g45Bb === true && _g45ProaCachee() === false || 'Pro A be-basketball : ' + JSON.stringify({ bm, bt }).slice(0, 300);
        }
        /* 20261003w — Pro A : onglet Équipes (bouton ➕ Mur) + effectif construit depuis les feuilles de match */
        if (o.kbo === true) {
          const aL = _g45ElLigue, aC = _g45ElClub, aV = _g45ElClubVue;
          _g45ElLigue = 'proa';
          const gP = [{ id: 1, u: 'u-1', r: 1, ph: 'RS', t: Date.now() - 864e5, p: true, h: { c: 'ROA', n: 'Roanne', l: '', s: 93, q: [], ot: [] }, a: { c: 'JSF', n: 'Nanterre', l: '', s: 83, q: [], ot: [] }, v: '', ar: [] }];
          localStorage.setItem('g45bbf1_u-1', JSON.stringify({ fini: true, F: { h: { co: '', P: [{ n: 'Carlos Stewart', no: '3', d5: true, mi: 31, pt: 29, rb: 4, as: 5 }], T: {} }, a: { co: '', P: [], T: {} } } }));
          const zb = document.createElement('div'); document.body.appendChild(zb);
          _g45ElClub = ''; _g45ElEquipesRendre(zb, gP, 2026);
          const liste = zb.innerHTML;
          _g45ElClub = 'ROA'; _g45ElClubVue = 'e'; _g45ElEquipesRendre(zb, gP, 2026);
          await new Promise(r => setTimeout(r, 300));
          const eff = (document.getElementById('g45-el-club') || {}).innerHTML || '';
          o.kbo = /➕ Mur/.test(liste) && /Roanne/.test(liste) && /Carlos Stewart/.test(eff) && /29/.test(eff) && !/NaN|undefined/.test(eff) || 'Pro A équipes : ' + (liste.slice(0, 150) + ' || ' + eff.slice(0, 200));
          zb.remove(); localStorage.removeItem('g45bbf1_u-1'); _g45ElLigue = aL; _g45ElClub = aC; _g45ElClubVue = aV;
        }
        /* 20261002k — onglet 👥 Équipes Euroleague : liste, fiche (Résultats / Stats), pastilles */
        if (o.kbo === true) {
          const eq = function (c, n, s) { return { c: c, n: n, l: 'x.png', s: s, q: [], ot: [] }; };
          const gE = [{ id: 1, r: 1, ph: 'RS', t: 1, p: true, h: eq('ASV', 'ASVEL', 80), a: eq('PAM', 'Valencia', 75), ar: [] },
                      { id: 2, r: 2, ph: 'RS', t: 2, p: true, h: eq('MAD', 'Real', 90), a: eq('ASV', 'ASVEL', 70), ar: [] },
                      { id: 3, r: 3, ph: 'RS', t: Date.now() + 864e5, p: false, h: eq('ASV', 'ASVEL'), a: eq('MAD', 'Real'), ar: [] }];
          const zE = document.createElement('div'); document.body.appendChild(zE);
          _g45ElClub = ''; _g45ElEquipesRendre(zE, gE, 2026);
          const lst = zE.innerHTML;
          _g45ElClub = 'ASV'; _g45ElClubVue = 'r'; _g45ElEquipesRendre(zE, gE, 2026);
          const res = zE.innerHTML;
          _g45ElClubVue = 's'; _g45ElEquipesRendre(zE, gE, 2026);
          const sta = zE.innerHTML;
          _g45ElClub = ''; _g45ElClubVue = 'r'; zE.remove();
          o.kbo = (/ASVEL/.test(lst) && /Real/.test(lst) && /Valencia/.test(lst) && /2e · 1V 1D|1er · 1V 0D/.test(lst) && /g45SuiviEqToggle/.test(lst)
            && /À venir/.test(res) && /V 80–75/.test(res) && /D 70–90/.test(res)
            && /1 V · 1 D/.test(sta) && /5 derniers/.test(sta) && !/NaN|undefined/.test(lst + res + sta)
            && /rgba\(255,255,255,\.85\)/.test(_g45ElLogo({ l: 'x.png' }, 24))) || ('équipes Euroleague : ' + (lst + ' || ' + res + ' || ' + sta).slice(0, 600));
        }
      } catch (e) { o.kbo = 'erreur : ' + e.message; }
      /* 20261006y — NHL avant le match : joueurs disponibles, tri par buts, absents */
      try {
        const pbp = { homeTeam: { id: 2, abbrev: 'NYI', commonName: { default: 'Islanders' } }, awayTeam: { id: 16, abbrev: 'CHI', commonName: { default: 'Blackhawks' } },
          rosterSpots: [{ teamId: 16, playerId: 1, firstName: { default: 'Anton' }, lastName: { default: 'Frondell' }, sweaterNumber: 16, positionCode: 'C' },
            { teamId: 16, playerId: 2, firstName: { default: 'Teuvo' }, lastName: { default: 'Teravainen' }, sweaterNumber: 86, positionCode: 'C' },
            { teamId: 16, playerId: 3, firstName: { default: 'Spencer' }, lastName: { default: 'Knight' }, sweaterNumber: 30, positionCode: 'G' },
            { teamId: 2, playerId: 4, firstName: { default: 'Bo' }, lastName: { default: 'Horvat' }, sweaterNumber: 14, positionCode: 'C' }] };
        const land = { matchup: { skaterSeasonStats: { skaters: [{ playerId: 1, teamId: 16, goals: 1, assists: 3, points: 4, gamesPlayed: 4 },
            { playerId: 2, teamId: 16, goals: 0, assists: 2, points: 2, gamesPlayed: 3 }, { playerId: 9, teamId: 16, name: { default: 'C. Bedard' } }] },
          goalieSeasonStats: { goalies: [{ playerId: 3, teamId: 16, gamesPlayed: 3, wins: 1, losses: 2, otLosses: 0, savePctg: 0.89011 }] } } };
        const T = _g45NhlAvLire(pbp, land);
        _g45NhlAv.SMK = { T, sel: 1, t: Date.now() };
        const hv = _g45NhlAvInterieur('SMK');
        o.nhlAv = (T[1].F[0].nom === 'Frondell' && T[1].abs[0].nom === 'C. Bedard' && /1-2 · 89,0 %/.test(hv) && /1B · 3A/.test(hv)
          && /Absents \(1\)/.test(hv) && !/NaN|undefined/.test(hv)) || hv.slice(0, 400);
        /* 20261006z — lignes probables : 2 défenseurs ensemble = 1 paire, 3 attaquants ensemble = 1 ligne */
        const shf = [1, 2, 3, 4, 5].map(id => ({ playerId: id, teamId: 7, period: 1, startTime: '00:00', endTime: '00:45', duration: '00:45', lastName: 'J' + id }));
        const Rk = { 1: { positionCode: 'D' }, 2: { positionCode: 'D' }, 3: { positionCode: 'L' }, 4: { positionCode: 'C' }, 5: { positionCode: 'R' } };
        const Lg = _g45NhlAvLignes(shf, 7, Rk, {});
        if (o.nhlAv === true && !(Lg && Lg.D.length === 1 && Lg.F.length === 1 && Lg.F[0].ids.join() === '3,4,5')) o.nhlAv = 'lignes : ' + JSON.stringify(Lg && { D: Lg.D, F: Lg.F });
        delete _g45NhlAv.SMK;
      } catch (e) { o.nhlAv = 'erreur : ' + e.message; }
      /* 20261013i — Tendances hockey : taux par côté, marchés, onglets ⚽ / 🏒 */
      try {
        const ms = [{ h: '1', a: '2', hg: 4, ag: 3, t: 3, ox: 1 }, { h: '1', a: '3', hg: 2, ag: 1, t: 2, ox: 0 }, { h: '4', a: '2', hg: 1, ag: 5, t: 1, ox: 0 }];
        const H = _g45TrHkCote(ms, '1', true, 40), A = _g45TrHkCote(ms, '2', false, 40);
        const M = _g45TrHkBuild(H, A, 'Avalanche', 'Jets', null);
        const v1 = M.filter(m => m.m === 'Vainqueur Avalanche')[0], o55 = M.filter(m => m.m === '+ de 5,5 buts')[0];
        const pur = H.n === 2 && H.w === 2 && H.ot === 1 && A.l === 1 && A.o55 === 2 && Math.abs(v1.p - 0.75) < 1e-9 && Math.abs(o55.p - 0.75) < 1e-9
          && /prolongation ou TAB à domicile lors de 1 de ses 2/.test(v1.faits.join('|'));
        const sp0 = _G45_TR.sp, r0 = _G45_TR.res, mi0 = _G45_TR.min; _G45_TR.min = 0;
        try { localStorage.setItem('g45tr_vue', 'perso'); } catch (e) {}   /* 20261020c : écran « Tendances perso » */
        g45TrSport('hockey');
        M.forEach(m => { m.n = 20; });
        _G45_TR.res = M.map(m => ({ m, hN: 'Avalanche', aN: 'Jets', when: '02:00', slug: 'nhl', id: 'x1', deco: {}, d: new Date().toISOString() }));
        loadTendancesTab();
        const th = document.getElementById('t-tend').innerHTML;
        g45TrSport('foot');
        const tf = document.getElementById('t-tend').innerHTML;
        const prem = _g45AccesPremium() === true;
        o.trHockey = (pur && (!prem || (/🏒 NHL/.test(th) && /Vainqueur Avalanche/.test(th) && /g45tr-onglets/.test(th) && !/Grands championnats/.test(th)
          && /g45tr-onglets/.test(tf) && /Grands championnats|Coupes d/.test(tf)))) || JSON.stringify({ pur, prem, a: /🏒 NHL/.test(th), b: /Vainqueur Avalanche/.test(th), c: /Grands championnats/.test(th), d: /g45tr-onglets/.test(tf), e: /Grands championnats|Coupes d/.test(tf) });
        try { localStorage.setItem('g45tr_sp', sp0 || 'foot'); } catch (e) {}
        _G45_TR.sp = sp0; _G45_TR.res = r0; _G45_TR.res_hockey = null; _G45_TR.min = mi0;
        try { localStorage.setItem('g45suivtend1', JSON.stringify(_g45TrSuivLire().filter(x => x.id !== 'x1'))); } catch (e) {}
      } catch (e) { o.trHockey = 'erreur : ' + e.message; }
      /* 20261013u — paris En cours en cartes */
      try {
        const h0 = state.h; state.h = [{ id: 'xe1', n: 'SIMPLE', target: 'A vs B', b: 'betclic', m: 10, cote: 2, isS: false, type: 'Buteur', joueur: 'Joueur X', date: '2026-10-13', heure: '21:00' },
          { id: 'xe2', n: 'Test FC', target: 'vs C', b: 'betclic', m: 5, cote: 1.8, isS: true, type: 'Victoire', date: '2026-10-13', heure: '21:00' }];
        render(); await new Promise(r => setTimeout(r, 300));
        const n = document.querySelectorAll('#live-norm [data-g45ec]').length, st = document.querySelectorAll('#live-strat [data-g45ec]').length;
        const t = document.getElementById('live-norm').textContent;
        o.enCours = (n === 1 && st === 1 && /Joueur X/.test(t) && /Gain possible 20/.test(t) && /@2,00/.test(t) && !!document.querySelector('#live-norm button.sbtn.sw[data-id="xe1"]')) || JSON.stringify({ n, st, t: t.slice(0, 160) });
        state.h = h0; render();
      } catch (e) { o.enCours = 'erreur : ' + e.message; }
      try {
        /* 20261014a : bloc « Tes critères sur 4 saisons » (données injectées, aucune requête). */
        (window._g45Cr.ovTous = true);
        state.u.push({ n: 'Club Test CR', sport: '⚽', note: '🏠 victoire+over 2.5 OU victoire+over 3.5 et ✈️ victoire+under 4.5 si cote inférieure à 1.5' });
        const S = window._g45Cr; S.nom = ''; window._statFilter = 'ext';
        S.data['Club Test CR'] = { t: Date.now(), lg: 'eng.1', ligue: 'Premier League', saisons: [
          { an: 2026, ms: [['2026-08-20', 0, 2, 0], ['2026-09-01', 0, 1, 1]] },
          { an: 2025, ms: [['2025-09-01', 0, 0, 1], ['2025-10-01', 0, 0, 2], ['2025-11-01', 0, 3, 1], ['2025-12-01', 1, 5, 0]] },
          { an: 2024, ms: [] }, { an: 2023, ms: null } ] };
        const z = document.createElement('div'); z.innerHTML = window._g45CrHtml('Club Test CR'); document.body.appendChild(z);
        window.g45CrNote();
        const t = document.getElementById('g45cr').innerText;
        z.remove(); state.u = state.u.filter(u => u.n !== 'Club Test CR');
        o.cr = (S.combos.length === 2 && S.combos[1].ou === 'un' && S.combos[1].L === 4.5 && /Total : 2\/5/.test(t) && /2 défaites de suite/.test(t) && /3 paliers/.test(t)) || JSON.stringify({ c: S.combos, t: t.slice(-400) });
      } catch (e) { o.cr = 'erreur : ' + e.message; }
      try {
        /* 20261014g : même bloc en NHL — victoire = temps réglementaire (prolongation / TAB = nul), vainqueur = score final. */
        (window._g45Cr.ovTous = true); window._statFilter = 'global';
        const S = window._g45Cr;
        S.data['Club Hockey CR'] = { t: Date.now(), lg: 'nhl', ligue: 'NHL', saisons: [
          { an: 2027, ms: [['2026-10-10', 1, 4, 3, 1], ['2026-10-12', 0, 3, 1, 0], ['2026-10-14', 1, 2, 3, 2]] },
          { an: 2026, ms: [] }, { an: 2025, ms: [] }, { an: 2024, ms: [] } ] };
        const z = document.createElement('div'); z.innerHTML = window._g45CrHtml('Club Hockey CR', { sp: 'hockey', lg: 'nhl', id: '7' }); document.body.appendChild(z);
        const t1 = document.getElementById('g45cr').innerText;
        window.g45CrSet('res', 'vqr'); const t2 = document.getElementById('g45cr').innerText;
        z.remove();
        o.crh = (/Total : 1\/3/.test(t1) && /Total : 2\/3/.test(t2) && /2026-27/.test(t1) && !/Les deux marquent/.test(t1)) || JSON.stringify({ t1: t1.slice(-300), t2: t2.slice(-200) });
      } catch (e) { o.crh = 'erreur : ' + e.message; }
      try {
        /* 20261014h : NFL — vainqueur sur le score final, total de points (ligne 44.5 par défaut), saison « 2026 ». */
        const S = window._g45Cr;
        S.data['Club Nfl CR'] = { t: Date.now(), lg: 'nfl', ligue: 'NFL', saisons: [
          { an: 2026, ms: [['2026-09-13', 1, 27, 20, 0], ['2026-09-20', 0, 17, 24, 0], ['2026-09-27', 1, 30, 27, 0]] },
          { an: 2025, ms: [] }, { an: 2024, ms: [] }, { an: 2023, ms: [] } ] };
        localStorage.setItem('g45_cr_tab', 'buts');   /* 20261021f : onglets — les lignes de points sont dans l'onglet Buts */
        const z = document.createElement('div'); z.innerHTML = window._g45CrHtml('Club Nfl CR', { sp: 'football', lg: 'nfl', id: '2' }); document.body.appendChild(z);
        const t1 = document.getElementById('g45cr').innerText;
        window.g45CrSet('L', '50.5'); const t2 = document.getElementById('g45cr').innerText;
        z.remove();
        o.crn = (/Total : 2\/3/.test(t1) && /Total : 1\/3/.test(t2) && /Over 50\.5/.test(t2) && /\b2026\b/.test(t1) && !/Nul/.test(t1) && /Points du match/.test(t1)) || JSON.stringify({ t1: t1.slice(-300), t2: t2.slice(-200) });
      } catch (e) { o.crn = 'erreur : ' + e.message; }
      try {
        /* 20261014i : buts / points de l'équipe et de l'adversaire (NHL : temps réglementaire). */
        localStorage.setItem('g45_cr_tab', 'buts');
        const z = document.createElement('div'); z.innerHTML = window._g45CrHtml('Club Hockey CR', { sp: 'hockey', lg: 'nhl', id: '7' }); document.body.appendChild(z);
        window.g45CrSet('res', ''); window.g45CrSet('TL', '2.5'); const t1 = document.getElementById('g45cr').innerText;
        window.g45CrSet('te', ''); window.g45CrSet('AL', '1.5'); window.g45CrSet('ad', 'un'); const t2 = document.getElementById('g45cr').innerText;
        z.remove();
        o.cre = (/Total : 2\/3/.test(t1) && /Buts équipe Over 2.5/.test(t1) && /Total : 1\/3/.test(t2) && /Buts adversaire Under 1.5/.test(t2) && /Buts de l'adversaire/.test(t2)) || JSON.stringify({ t1: t1.slice(-300), t2: t2.slice(-300) });
      } catch (e) { o.cre = 'erreur : ' + e.message; }
      try {
        /* 20261014j : rugby (Top 14) — Victoire / Nul / Défaite sur le score final, points du match, saison 2026-27. */
        const S = window._g45Cr;
        S.data['Club Rugby CR'] = { t: Date.now(), lg: '270559', ligue: 'saison régulière', saisons: [
          { an: 2026, ms: [['2026-09-06', 1, 27, 20], ['2026-09-13', 0, 17, 17], ['2026-09-20', 1, 30, 35]] },
          { an: 2025, ms: [] }, { an: 2024, ms: [] }, { an: 2023, ms: [] } ] };
        localStorage.setItem('g45_cr_tab', 'buts');
        const z = document.createElement('div'); z.innerHTML = window._g45CrHtml('Club Rugby CR', { sp: 'rugby', lg: '270559', id: '9' }); document.body.appendChild(z);
        const t1 = document.getElementById('g45cr').innerText;
        window.g45CrSet('res', 'nul'); const t2 = document.getElementById('g45cr').innerText;
        z.remove();
        o.crr = (/Total : 1\/3/.test(t1) && /Total : 1\/3/.test(t2) && /2026-27/.test(t1) && /Points du match/.test(t1) && /Points de l'adversaire/.test(t1) && /Ton combiné : Nul/.test(t2)) || JSON.stringify({ t1: t1.slice(0, 400), t2: t2.slice(-200) });
      } catch (e) { o.crr = 'erreur : ' + e.message; }
      localStorage.removeItem('g45_cr_tab');
      try {
        /* 20261014k : prochains matchs d'un club de Top 14 + coupes d'Europe. */
        const t0 = Date.now() + 864e5;
        _g45CompetAVenir['rugby|270559|2026'] = [{ id: '1', t: t0, h: '9', a: '8', hn: 'Club R', an: 'Perpignan' }];
        _g45CompetAVenir['rugby|271937|2026'] = [{ id: '2', t: t0 + 864e5, h: '7', a: '9', hn: 'Leinster', an: 'Club R' }, { id: '3', t: t0, h: '5', a: '6', hn: 'X', an: 'Y' }];
        const ph = _g45ProchainsHtml('rugby', '270559', 2026, '9', 'Club R', 6);
        o.rgpv = (/Perpignan/.test(ph) && /Leinster/.test(ph) && /Champions Cup/.test(ph) && /Top 14/.test(ph) && !/>Y</.test(ph)) || ph.slice(0, 300);
      } catch (e) { o.rgpv = 'erreur : ' + e.message; }
      try {
        /* 20261014l : ligue reçue = uefa.champions → le championnat du club (fra.1) est quand même lu. */
        const vu = [], old = window._g45TrEspn;
        window._g45TrEspn = async (p) => { vu.push(p); return { events: [] }; };
        await _g45AVenirLigue('uefa.champions', '160', 'Paris Saint-Germain');
        window._g45TrEspn = old;
        o.avl = vu.some(p => /soccer\/fra\.1\/scoreboard/.test(p)) && vu.some(p => /fra\.1\/teams\/160\/schedule/.test(p)) || vu.slice(0, 5).join(' | ');
      } catch (e) { o.avl = 'erreur : ' + e.message; }
      try {
        /* 20261014o : Agenda — logos des deux équipes en filigrane « VS ». */
        const zA = document.getElementById('cal-content'), z = zA || document.createElement('div'); if (!zA) { z.id = 'cal-content'; document.body.appendChild(z); }
        const u0 = state.u, ecs = window.espnClubSchedule;
        state.u = [{ n: 'Real Madrid', sport: '⚽', note: '' }];
        window.espnClubSchedule = async () => ({ team: { id: '86', name: 'Real Madrid' }, matches: [{ id: 'm1', date: new Date(Date.now() + 864e5).toISOString(),
          completed: false, homeTeam: 'AS Roma', awayTeam: 'Real Madrid', homeId: '104', awayId: '86', homeLogo: 'https://x/roma.png', awayLogo: '', competition: 'uefa.champions', competitionName: 'Champions L.' }] });
        await loadCalendrier();
        const v = [...z.querySelectorAll('.g45ag-vs')].find(x => x.querySelector('img')), im = v ? [...v.querySelectorAll('img')].map(i => i.getAttribute('src')) : [];
        const zt = z.textContent.slice(0, 300);
        state.u = u0; window.espnClubSchedule = ecs; if (!zA) z.remove(); else z.innerHTML = '';
        o.agvs = (im.length === 2 && /soccer\/500\/86\.png/.test(im[0]) && /roma/.test(im[1]) && /VS/.test(v.textContent)) || JSON.stringify(im) + ' ' + zt;
      } catch (e) { o.agvs = 'erreur : ' + e.message; }
      try {
        /* 20261016h : Agenda — joueur NHL du mur (photo, nom, club vs adversaire) */
        const zA = document.getElementById('cal-content'), z = zA || document.createElement('div'); if (!zA) { z.id = 'cal-content'; document.body.appendChild(z); }
        const u0 = state.u, f0 = window.fetch, ecs = window.espnClubSchedule;
        state.u = [{ n: 'MCDAVID CONNOR', type: 'joueur', sport: '🏒', note: 'Edmonton Oilers', logoUrl: 'https://assets.nhle.com/mugs/x.png' }];
        window.espnClubSchedule = async () => null;
        window.fetch = async (u) => { const p = decodeURIComponent(String(u)); if (/club-schedule-season\/EDM\/now/.test(p)) return { ok: true, status: 200, json: async () => ({ games: [{ startTimeUTC: new Date(Date.now() + 864e5).toISOString(), gameType: 2, gameState: 'FUT', homeTeam: { abbrev: 'EDM' }, awayTeam: { abbrev: 'UTA' } }] }) }; return f0(u); };
        await loadCalendrier();
        const zt = z.textContent, img = [...z.querySelectorAll('img')].map(i => i.getAttribute('src'));
        state.u = u0; window.fetch = f0; window.espnClubSchedule = ecs; if (!zA) z.remove(); else z.innerHTML = '';
        o.agj = (/MCDAVID CONNOR/.test(zt) && /Edmonton Oilers vs/.test(zt) && img.some(x => /mugs\/x\.png/.test(x))) || zt.slice(0, 300) + ' ' + JSON.stringify(img);
      } catch (e) { o.agj = 'erreur : ' + e.message; }
      try {
        /* 20261016i : carte JOUEUR du mur → aucune recherche d'équipe TheSportsDB */
        const u0 = state.u, f0 = window.fetch; let n = 0;
        state.u = [{ n: 'Connor McDavid', type: 'joueur', sport: '🏒', note: 'Edmonton Oilers' }];
        window.fetch = async (u) => { if (/searchteams/.test(String(u))) n++; return { ok: false, status: 404, json: async () => ({}) }; };
        localStorage.removeItem('g45bgclub1_' + _g45SgNorm('Connor McDavid'));
        const a = await _g45FanChercher('Connor McDavid', 'hockey'), b = await _g45BgChercher('Connor McDavid'); const c = await g45SdbClub('Connor McDavid', '🏒');
        state.u = u0; window.fetch = f0;
        o.tsdbj = (n === 0 && !a && b && !b.u && !c) || JSON.stringify({ n, a, b, c });
      } catch (e) { o.tsdbj = 'erreur : ' + e.message; }
      try {
        /* 20261016p : panne TheSportsDB → pas de boucle (2e passage = rien à faire) */
        const f0 = window.fetch; let n = 0;
        window.fetch = async (u) => { if (/thesportsdb/.test(String(u))) { n++; throw new TypeError('Failed to fetch'); } return f0(u); };
        localStorage.removeItem('g45_fanart2_' + _g45SgNorm('Zzz Testeurs FC'));
        await _g45FanCompleter([{ nom: 'Zzz Testeurs FC', sp: 'hockey' }]); const n1 = n;
        const m2 = await _g45FanCompleter([{ nom: 'Zzz Testeurs FC', sp: 'hockey' }]);
        window.fetch = f0;
        o.fanp = (n1 > 0 && n === n1 && m2 === false && _g45FanLire('Zzz Testeurs FC') === '') || JSON.stringify({ n1, n, m2 });
      } catch (e) { o.fanp = 'erreur : ' + e.message; }
      try {
        /* 20261016s : TheSportsDB passe par le worker (host=tsdb) ; worker 403 → appel direct */
        const via = async (t) => { try { return (await (await fetch('https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=' + t)).json()).via; } catch (e) { return 'erreur'; } };
        const a = await via('Arsenal'), b = await via('Refus'), c = await via('Trop');
        o.tsdbw = (a === 'worker' && b === 'direct' && c === 'direct') || JSON.stringify({ a, b, c });
      } catch (e) { o.tsdbw = 'erreur : ' + e.message; }
      try {
        /* 20261023y / A : 📊 Bilans (gones) — par sport, sélecteur Officiel / Test / Pause, mise en ligne GitHub, bloc testeurs */
        const B = window._g45Bil; const sv = { j: B.j, rr: B.rr, t: B.t, loc: B.loc };
        const L = []; for (let i = 0; i < 22; i++) L.push({ id: 'p' + i, sl: 'nhl', k: 'u6.5', c: 1.8, r: i < 14 ? 1 : 0, pz: 'nhl_buts', st: 'pause' });
        L.push({ id: 'q', sl: 'nba', k: '1', c: 1.9, r: 1, pz: 'nba_vq', st: 'test', h: 'Spurs', a: 'Suns', m: 'Vainqueur Spurs' });
        B.j = { t: [{ id: 'a', sl: 'fra.1', k: 'o2.5', c: 1.6, r: 1 }, { id: 'b', sl: 'nhl', k: 'u6.5', c: 1.76, r: 0 }, { id: 'c', sl: 'nhl', k: '2', c: 2, r: 1 }], pz: L, ce: [], tv: [], dz: [] };
        B.rr = { etat: { nhl_buts: 'pause', nba_vq: 'test' } }; B.t = Date.now(); B.loc = null; B.msg = '';
        const H1 = window._g45BilHtml().replace(/<[^>]+>/g, ' ');
        const ok1 = /🏒 NHL/.test(H1) && /14\/23/.test(H1) && /Peut revenir/.test(H1) && /1\/1 · \+0,60 €/.test(H1) && /Pas assez/.test(H1) && /Rien à mettre en ligne/.test(H1) && /Officiel/.test(H1) && /en test/.test(H1);
        const div = document.createElement('div'); div.innerHTML = window._g45BilHtml(); document.body.appendChild(div);
        window.g45BilEtat('nhl_buts', 'off');
        const H2 = document.getElementById('g45bil').textContent, ok2 = /Mettre en ligne \(/.test(H2) && B.loc && B.loc.nhl_buts === 'off';
        window.g45BilEtat('nhl_buts', 'pause'); const ok3 = B.loc === null;
        window.g45BilEtat('tn_tv', 'off');
        const f0 = window.fetch, c0 = window.confirm; let put = null; const t0 = localStorage.getItem('gones45_github_token');
        localStorage.setItem('gones45_github_token', 'faux');
        window.confirm = () => true;
        window.fetch = async (u, o2) => { if (/api\.github\.com/.test(String(u))) { if (o2 && o2.method === 'PUT') { put = JSON.parse(decodeURIComponent(escape(atob(JSON.parse(o2.body).content)))); return new Response('{}', { status: 201 }); } return new Response('{}', { status: 404 }); } return f0(u, o2); };
        await window.g45BilEnLigne();
        window.fetch = f0; window.confirm = c0; if (t0 == null) localStorage.removeItem('gones45_github_token'); else localStorage.setItem('gones45_github_token', t0);
        const ok4 = put && put.etat.tn_tv === 'off' && put.etat.nhl_buts === 'pause' && put.etat.nfl_pts === 'pause' && put.etat.nba_vq === 'test' && put.etat.f_buts === 'off' && /En ligne/.test(B.msg);
        const T = window._g45TrTeHtml(B.j), ok5 = /Paris en test/.test(T) && /Spurs/.test(T) && !/p0/.test(T);
        div.remove(); Object.assign(B, sv); B.msg = '';
        o.bil = (ok1 && ok2 && ok3 && ok4 && ok5) || JSON.stringify({ ok1, ok2, ok3, ok4, ok5, H1: H1.slice(0, 400) });
      } catch (e) { o.bil = 'erreur : ' + e.message; }
      try {
        /* 20261024f : Cockpit — la mise suit le palier affiché (compétition + lieu), sauf mise tapée / lue sur un ticket */
        const us = state.u, sk = Object.keys(STRATS)[0], sel = document.getElementById('c-unit'), mi = document.getElementById('c-mise'), co = document.getElementById('c-comp'), li = document.getElementById('c-lieu');
        const k = _g45PalKey('NHL', 'dom'), U = { n: 'ZzMontante', s: sk, l: 3, lc: {} }; U.lc[k] = 1;
        state.u = (us || []).concat([U]);
        const opt = document.createElement('option'); opt.value = 'ZzMontante'; opt.text = 'ZzMontante'; sel.appendChild(opt); sel.value = 'ZzMontante';
        const sv = { co: co && co.value, li: li && li.value };
        if (co) co.value = ''; if (li) li.value = 'dom';
        updMise(); const m0 = mi.value;
        co.value = 'NHL'; renderCrash(); const m1 = mi.value;
        mi.value = '5'; mi.dispatchEvent(new Event('input', { bubbles: true })); renderCrash(); const m2 = mi.value;
        updMise(); co.value = 'NHL'; renderCrash(); const m3 = mi.value;
        const P1 = String(STRATS[sk][0]), P3 = String(STRATS[sk][2]);
        o.miseCk = (m1 === P1 && m2 === '5' && m3 === P1 && P1 !== P3) || JSON.stringify({ m0, m1, m2, m3, P1, P3, k });
        /* 20261024t : avertissement « mise ≠ palier » sous la mise du Cockpit */
        mi.value = String(Number(P1) + 1); mi.dispatchEvent(new Event('input', { bubbles: true }));
        const av1 = document.getElementById('g45-mise-av'), t1 = av1 ? av1.textContent : '';
        mi.value = P1; mi.dispatchEvent(new Event('input', { bubbles: true }));
        const av2 = document.getElementById('g45-mise-av');
        if (o.miseCk === true && !(/≠ palier P1/.test(t1) && !av2)) o.miseCk = 'avertissement : ' + JSON.stringify({ t1, reste: !!av2 });
        /* 20261024g : changer le lieu (Match trouvé → OK) garde bookmaker, adversaire, mise tapée */
        const bk = document.getElementById('c-book'), tg = document.getElementById('c-target');
        let lcOk = true, lcDet = '';
        if (bk && bk.options && bk.options.length > 1) {
          sel.value = 'ZzMontante'; bk.value = bk.options[bk.options.length - 1].value; const bv = bk.value; if (tg) tg.value = 'Tampa Bay Lightning';
          mi.value = '5'; mi.dispatchEvent(new Event('input', { bubbles: true })); li.value = 'ext'; g45LieuChange();
          const b2 = document.getElementById('c-book').value, t2 = document.getElementById('c-target') ? document.getElementById('c-target').value : 'Tampa Bay Lightning', m4 = document.getElementById('c-mise').value;
          lcOk = b2 === bv && t2 === 'Tampa Bay Lightning' && m4 === '5' && document.getElementById('c-lieu').value === 'ext'; lcDet = JSON.stringify({ bv, b2, t2, m4 });
        }
        if (o.miseCk === true && !lcOk) o.miseCk = 'lieu : ' + lcDet; o.lcDet = lcDet || 'pas teste';
        opt.remove(); state.u = us; if (co) co.value = sv.co || ''; if (li) li.value = sv.li || '';
      } catch (e) { o.miseCk = 'erreur : ' + e.message; }
      try {
        /* 20261024e : règlement ½✅ / ↩️ / ½❌ — capital au centime (mise 10 € retirée au placement, cote 1,83) */
        const sv = { h: state.h, a: state.a, b: state.b, fb: state.fb }, sv2 = JSON.stringify({ h: state.h, a: state.a, b: state.b, fb: state.fb });
        state.b = { TestBook: '100.00' }; state.fb = {}; state.a = [];
        state.h = [{ id: 'x1', b: 'TestBook', m: 10, cote: 1.83, n: 'A' }, { id: 'x2', b: 'TestBook', m: 10, cote: 1.83, n: 'B' }, { id: 'x3', b: 'TestBook', m: 10, cote: 1.83, n: 'C' }];
        const r1 = g45BetRegler('x1', 'hw', ''), b1 = state.b.TestBook, r2 = g45BetRegler('x2', 'v', ''), b2 = state.b.TestBook, r3 = g45BetRegler('x3', 'hl', ''), b3 = state.b.TestBook;
        const A = state.a, okA = A.length === 3 && !state.h.length && A[2].ar === 'hw' && A[2].win === true && A[1].ar === 'v' && A[0].ar === 'hl' && A[0].win === false && A[0].mO === 10 && /Moitié perdu/.test(A[0].debrief);
        const eff = A.map((x) => _g45BetEffetTotal(x, 'a').b).map((v) => v.toFixed(2)).join('|');
        o.betAr = (r1 && r2 && r3 && b1 === '114.15' && b2 === '124.15' && b3 === '129.15' && okA && eff === '-5.00|0.00|4.15') || JSON.stringify({ b1, b2, b3, eff, okA });
        state.h = sv.h; state.a = sv.a; state.b = sv.b; state.fb = sv.fb;
        if (JSON.stringify({ h: state.h, a: state.a, b: state.b, fb: state.fb }) !== sv2) o.betAr = 'état non restauré';
      } catch (e) { o.betAr = 'erreur : ' + e.message; }
      try {
        /* 20261014t : Fusionner une sauvegarde — ajoute les paris réglés absents, doublons ignorés, capital inchangé. */
        const a0 = state.a, h0 = state.h, b0 = JSON.stringify(state.b);
        state.a = [{ id: 'f1', date: '2026-10-10', n: 'Lyon', cote: 2, m: 5, win: true }]; state.h = [{ id: 'f9', date: '2026-10-14', n: 'Lens', cote: 1.8, m: 3 }];
        const R = _g45FusionnerEtat({ a: [{ id: 'f1', date: '2026-10-10', n: 'Lyon', cote: 2, m: 5 }, { id: 'x2', date: '2026-10-10', n: 'lyon ', cote: 2, m: 5 },
          { id: 'x3', date: '2026-09-01', n: 'PSG', cote: 1.5, m: 10, win: false }], h: [{ id: 'x4', date: '2026-10-15', n: 'OM', cote: 2, m: 2 }, { id: 'f9' }] });
        const ok = R && R.ajoutes === 1 && R.doublons === 2 && R.enCours === 1 && state.a.length === 2 && state.a[1].id === 'x3' && JSON.stringify(state.b) === b0
          && !document.getElementById('g45-btn-fusion') && typeof g45FusionnerData === 'function';
        o.fus = ok || JSON.stringify({ R, n: state.a.length, btn: !!document.getElementById('g45-btn-fusion') });
        state.a = a0; state.h = h0;
      } catch (e) { o.fus = 'erreur : ' + e.message; }
      try {
        /* 20261014v : lifting Outils — sections, tableau des paliers, classement des blocs. */
        const ids = _G45_OUTILS_SEC.map(x => x.id).join(',');
        renderPaliers();
        const tab = !!document.querySelector('#palier-grids table.g45ol-pal input[type=number]');
        const pp = document.getElementById('palier-panel'), cat = pp ? _g45OutilsClasser(pp, '💰 Mises par palier') : '';
        o.olift = (ids === 'app,look,notif,mont,eq,donnees,cles' && tab && cat === 'mont') || JSON.stringify({ ids, tab, cat });
      } catch (e) { o.olift = 'erreur : ' + e.message; }
      try {
        /* 20261014z : mur limité à 15 sur bet45 (simulé par window._g45User), sans limite sur gones. */
        const u0 = state.u, U0 = window._g45User;
        state.u = Array.from({ length: 15 }, (_, i) => ({ n: 'Eq' + i, sport: '⚽' }));
        const gonesLibre = !_g45MurPlein();
        window._g45User = { id: 't' };
        document.getElementById('u-name').value = 'Nouvelle';
        addUnit();
        const bloque = state.u.length === 15 && !!document.getElementById('g45-mur-plein');
        const m = document.getElementById('g45-mur-plein'); if (m) m.remove();
        state.u.pop(); addUnit();
        const passe = state.u.length === 15 && state.u.some(u => u.n === 'Nouvelle');
        o.mur = (gonesLibre && bloque && passe) || JSON.stringify({ gonesLibre, bloque, passe, n: state.u.length });
        state.u = u0; if (U0 === undefined) delete window._g45User; else window._g45User = U0;
      } catch (e) { o.mur = 'erreur : ' + e.message; }
      try {
        /* 20261014z2 : mur de départ bet45 (compte neuf remplacé, compte existant complété sport par sport). */
        const neuf = { a: [], h: [], u: PRESETS.map(p => ({ n: p.n, sport: p.sport, preset: true })) };
        const R1 = _g45Mur2Appliquer(neuf, {});
        const n1 = neuf.u.map(u => u.n);
        const okNeuf = R1.mode === 'neuf' && neuf.u.length === 11 && !n1.includes('Lyon') && n1.includes('Arsenal') && n1.includes('Penrith Panthers');
        const ex = { a: [{ id: 1 }], h: [], u: [{ n: 'Lyon', sport: '⚽' }, { n: 'Boston Celtics', sport: '🏀' }, { n: 'LA Dodgers', sport: '⚾' }] };
        const R2 = _g45Mur2Appliquer(ex, { 'Kansas City Chiefs': 1 });
        const n2 = ex.u.map(u => u.n);
        const okEx = R2.mode === 'existant' && n2.includes('Lyon') && !n2.includes('Los Angeles Lakers') && !n2.includes('Kansas City Chiefs')
          && n2.includes('Colorado Avalanche') && n2.includes('Stade Toulousain') && n2.includes('Penrith Panthers') && !n2.includes('Arsenal') && ex.u.length === 6;
        const plein = { a: [{ id: 1 }], h: [], u: Array.from({ length: 15 }, (_, i) => ({ n: 'E' + i, sport: '⚽' })) };
        const okPlein = _g45Mur2Appliquer(plein, {}).ajout.length === 0;
        o.mur2 = (okNeuf && okEx && okPlein) || JSON.stringify({ n1, n2, okPlein });
      } catch (e) { o.mur2 = 'erreur : ' + e.message; }
      try {
        /* 20261015c : logo de la compétition sur les lignes de pari larges (PC). */
        state.a.push({ id: 'cl1', n: 'SIMPLE', target: 'A vs B', comp: 'NHL', cote: 2, m: 1, win: true, date: '2026-10-14' });
        const large = document.createElement('div'); large.setAttribute('data-aid', 'cl1'); large.setAttribute('onclick', 'openBetEdit(this.dataset.aid)'); large.style.width = '1000px';
        const etroit = document.createElement('div'); etroit.setAttribute('data-aid', 'cl1'); etroit.setAttribute('onclick', 'openBetEdit(this.dataset.aid)'); etroit.style.width = '380px';
        document.body.append(large, etroit);
        let src = '';
        new MutationObserver(() => { const i = large.querySelector('img.g45-cl-fil'); if (i) src = i.src; }).observe(large, { childList: true });
        await new Promise(r => setTimeout(r, 600));
        const img = src ? { src } : null;   /* l'image n'est pas servie dans le test → retirée par onerror : on garde l'adresse posée */
        o.clogo = (!!img && /leagues\/500\/nhl\.png/.test(img.src) && large.getAttribute('data-g45cl') === '1' && !etroit.getAttribute('data-g45cl') && _g45ClLogo('Liga Portugal') === '' && _g45ClLogo('Ligue des Champions') === ''
          && /nba\.png/.test(_g45ClLogo('NBA'))) || JSON.stringify({ img: img && img.src, et: !!etroit.querySelector('img.g45-cl-fil') });
        large.remove(); etroit.remove(); state.a = state.a.filter(x => x.id !== 'cl1');
      } catch (e) { o.clogo = 'erreur : ' + e.message; }
      try {
        /* 20261015d : cotes en direct (règles du marché + texte) sur l'exemple Roma 3-1 Real (Roma reçoit). */
        const C = { state: 'in', hN: ['AS Roma', 'Roma'], aN: ['Real Madrid', 'Madrid'], h: 1.07, a: 51, d: null, L: 4.5, ov: 1.71, un: 2.1 };
        const m1 = _g45CdMarche({ type: 'Victoire AS Roma @1.95', cote: 3.6 }, C, null);
        const m2 = _g45CdMarche({ type: 'Défaite', cote: 2 }, C, true);
        const m3 = _g45CdMarche({ type: 'Plus de 2,5 buts', cote: 1.7 }, C, null);
        const m4 = _g45CdMarche({ type: 'Victoire', isCombi: true }, C, true);
        const m5 = _g45CdMarche({ type: 'Les deux équipes marquent' }, C, true);
        const t1 = _g45CdTexte({ cote: 3.6 }, C, m1), t3 = _g45CdTexte({ cote: 1.7 }, C, m3), t6 = _g45CdTexte({ cote: 2 }, Object.assign({}, C, { h: 'off' }), { cle: 'h' });
        o.cdir = (m1 && m1.cle === 'h' && m2 && m2.cle === 'a' && m3 && m3.cle === 'ov' && m3.L === 2.5 && !m4 && !m5
          && /1,07/.test(t1) && /bien joué/.test(t1) && /plus proposée/.test(t3) && /4,5 buts à 1,71/.test(t3) && /suspendue/.test(t6)
          && typeof _g45CdLire === 'function') || JSON.stringify({ m1, m2, m3, m4, m5, t1, t3, t6 });
      } catch (e) { o.cdir = 'erreur : ' + e.message; }
      /* 20261020q — 🏀 cotes NBA en direct : scoreboard (état, équipes) + core odds provider 200 « DraftKings - Live Odds » */
      try {
        const sf = window.fetch;
        const SBn = { events: [{ id: '401', competitions: [{ status: { type: { state: 'in' }, displayClock: '5:12' }, competitors: [
          { homeAway: 'home', score: '99', team: { displayName: 'Detroit Pistons', name: 'Pistons' } }, { homeAway: 'away', score: '96', team: { displayName: 'Boston Celtics', name: 'Celtics' } }] }] }] };
        const OD = { items: [{ provider: { id: '100', name: 'DraftKings' }, overUnder: 220.5 },
          { provider: { id: '200', name: 'DraftKings - Live Odds' }, overUnder: 224.5, homeTeamOdds: { moneyLine: 425, current: { moneyLine: { decimal: 5.25 } } },
            awayTeamOdds: { moneyLine: -600, current: { moneyLine: { decimal: 1.16 } } }, current: { over: { decimal: 1.91 }, under: { american: '-110' } } }] };
        window.fetch = async (u) => ({ ok: true, json: async () => (/core\.api.*\/odds/.test(String(u)) ? OD : /basketball\/nba\/scoreboard/.test(String(u)) ? SBn : {}) });
        const C = await _g45CdLire('basketball', 'nba', '401', ['20261020']);
        window.fetch = sf;
        const m = _g45CdMarche({ type: 'Victoire Boston Celtics', cote: 1.8 }, C, null), mo = _g45CdMarche({ type: 'Plus de 220,5 points', cote: 1.9 }, C, null);
        const tx = _g45CdTexte({ cote: 1.8 }, C, m), to = _g45CdTexte({ cote: 1.9 }, C, mo);
        o.cdNba = (C && C.h === 5.25 && C.a === 1.16 && C.L === 224.5 && C.ov === 1.91 && Math.abs(C.un - 1.909) < 0.01 && C.d == null && C.u === 'points'
          && m && m.cle === 'a' && /1,16/.test(tx) && /bien joué/.test(tx) && /224,5 points/.test(to)) || JSON.stringify({ C, m, tx, to });
      } catch (e) { o.cdNba = 'erreur : ' + e.message; }
      /* 20261024p — ⚾ MLB / 🏒 NHL : même core odds provider 200 ; NHL = pas de ligne pour une « Victoire » (temps réglementaire) */
      try {
        const sf = window.fetch;
        const SB = (sp) => ({ events: [{ id: '402', competitions: [{ status: { type: { state: 'in' }, displayClock: '' }, competitors: [
          { homeAway: 'home', score: '2', team: { displayName: 'Colorado Avalanche', name: 'Avalanche' } }, { homeAway: 'away', score: '1', team: { displayName: 'Dallas Stars', name: 'Stars' } }] }] }] });
        const OD = { items: [{ provider: { id: '200', name: 'DraftKings - Live Odds' }, overUnder: 6.5, homeTeamOdds: { current: { moneyLine: { decimal: 1.17 } } },
          awayTeamOdds: { current: { moneyLine: { decimal: 4.8 } } }, current: { over: { decimal: 1.9 }, under: { decimal: 1.83 } } }] };
        window.fetch = async (u) => ({ ok: true, json: async () => (/core\.api.*\/odds/.test(String(u)) ? OD : /scoreboard/.test(String(u)) ? SB() : {}) });
        const H = await _g45CdLire('hockey', 'nhl', '402', ['20261024']), B = await _g45CdLire('baseball', 'mlb', '402', ['20261024']);
        window.fetch = sf;
        const mv = _g45CdMarche({ type: 'Victoire Colorado Avalanche', cote: 1.8 }, H, null), mq = _g45CdMarche({ type: 'Vainqueur Colorado Avalanche', cote: 1.6 }, H, null);
        const mb = _g45CdMarche({ type: 'Victoire Colorado Avalanche', cote: 1.5 }, B, null), mr = _g45CdMarche({ type: 'Plus de 6,5 runs', cote: 1.9 }, B, null);
        o.cdUs = (H && H.h === 1.17 && H.u === 'buts' && B && B.u === 'runs' && B.L === 6.5 && !mv && mq && mq.cle === 'h' && mb && mb.cle === 'h' && mr && mr.cle === 'ov'
          && /1,17/.test(_g45CdTexte({ cote: 1.6 }, H, mq)) && /1,90/.test(_g45CdTexte({ cote: 1.9 }, B, mr))) || JSON.stringify({ H, B, mv, mq, mb, mr });
      } catch (e) { o.cdUs = 'erreur : ' + e.message; }
      try {
        /* 20261015e : onglet Bank — banques à part, tri par solde, ligne Paris. */
        const b0 = state.b, a0 = state.a;
        state.b = { winamax: '100', 'boursorama antoine': '50', betclic: '300' };
        state.a = [{ id: 'k1', b: 'winamax', m: 10, cote: 2, win: true }, { id: 'k2', b: 'winamax', m: 10, cote: 2, win: false }];
        _g45BkGrille();
        const noms = [...document.querySelectorAll('#books-grid .g45bk')].map(c => c.textContent);
        const bq = [...document.querySelectorAll('#g45-bk-banques .g45bk')].map(c => c.textContent);
        const P = _g45BkParis('Winamax'), N = _g45BkNom('PMU LAURA');
        o.bank = (noms.length === 2 && /Betclic/i.test(noms[0]) && bq.length === 1 && /Boursorama/i.test(bq[0]) && !/Freebet/.test(bq[0])
          && P.n === 2 && P.net === 0 && N.who === 'Laura' && _g45BkEstBanque('revolut') && !_g45BkEstBanque('winamax') && /unibet\.fr/.test(bkFavicon('unibet laura')) && /boursobank/.test(bkFavicon('boursorama antoine')) && /pinnacle\.com/.test(bkFavicon('pinnacle'))) || JSON.stringify({ noms, bq, P, N });
        state.b = b0; state.a = a0; _g45BkGrille();
      } catch (e) { o.bank = 'erreur : ' + e.message; }
      /* 20261015j — cote mini : la cote du MARCHÉ compte quand elle est connue (1,20 écartée même à 62 %) */
      try {
        const sv = { res: _G45_TR.res, min: _G45_TR.min, sp: _G45_TR.sp }, pris = [], orig = window._g45TrSuivNoter;
        window._g45TrSuivNoter = (l) => { (l || []).forEach((x) => pris.push(x.hN)); };
        _G45_TR.min = 1.5;
        _G45_TR.res = [{ m: { m: 'Victoire Aaa', p: 0.62, cote: 1.2, n: 10 }, hN: 'Aaa', aN: 'Bbb', id: '1', slug: 'fra.1', deco: {} },
                       { m: { m: 'Victoire Ccc', p: 0.62, n: 10 }, hN: 'Ccc', aN: 'Ddd', id: '2', slug: 'fra.1', deco: {} },
                       { m: { m: 'Pas de nul', p: 0.66, n: 10, fair: 0.77, accord: 0.77 }, hN: 'Eee', aN: 'Fff', id: '3', slug: 'uefa.europa', deco: {} }];
        _g45TrRender();
        window._g45TrSuivNoter = orig; Object.assign(_G45_TR, sv);
        o.trMin = (pris.indexOf('Aaa') < 0 && pris.indexOf('Eee') < 0 && pris.indexOf('Ccc') >= 0) || JSON.stringify(pris);
      } catch (e) { o.trMin = 'erreur : ' + e.message; }
      /* 20261015m — quota des cotes : BET45 = son compteur seulement, GONES45 = tout le monde */
      try {
        const a = _g45QtResume({ moi: { u: 2, max: 8 } }), b = _g45QtResume({ jour: { u: 9, max: 20 }, mois: { u: 88, max: 400 } }), c = _g45QtResume({ remaining: 3 });
        o.qt = (a.r === 6 && /te reste/.test(a.qui) && b.r === 11 && /tout le monde/.test(b.txt) && c === null) || JSON.stringify([a, b, c]);
      } catch (e) { o.qt = 'erreur : ' + e.message; }
      /* 20261015r — CLV : relevé gardé en mémoire (pas de nouvel appel The Odds API avant l'intervalle) + carte refaite */
      try {
        const sv = { u: state.u, esp: window._g45TrEspn, oa: window._g45TrOddsApi }, ls = {};
        ['g45clv_cfg', 'g45clv_snaps', 'g45clv_der'].forEach((k) => { ls[k] = localStorage.getItem(k); });
        state.u = [];
        localStorage.setItem('g45clv_cfg', JSON.stringify([{ n: 'Bayern', sl: 'ger.1', side: 'over', line: 2.5, al: ['bayern', 'bayernmunich'] }]));
        localStorage.removeItem('g45clv_snaps'); localStorage.removeItem('g45clv_der');
        const ko = new Date(Date.now() + 72 * 3600e3).toISOString();
        let nOa = 0;
        window._g45TrEspn = async () => ({ events: [{ id: '777', date: ko, competitions: [{ status: { type: { completed: false } }, competitors: [
          { homeAway: 'home', team: { displayName: 'Bayern Munich', logo: 'x.png' } }, { homeAway: 'away', team: { displayName: 'RB Leipzig' } }] }] }] });
        window._g45TrOddsApi = async () => { nOa++; return [{ home_team: 'Bayern Munich', away_team: 'RB Leipzig', commence_time: ko, bookmakers: [{ markets: [
          { key: 'h2h', outcomes: [{ name: 'Bayern Munich', price: 1.3 }, { name: 'RB Leipzig', price: 7 }, { name: 'Draw', price: 5 }] },
          { key: 'totals', outcomes: [{ name: 'Over', point: 2.5, price: 1.2 }, { name: 'Under', point: 2.5, price: 4 }] }] }] }]; };
        const n1 = await _g45ClvReleve(null, true);
        const n2 = await _g45ClvReleve(null, false), s2 = Object.assign({}, window._g45ClvStat);
        localStorage.removeItem('g45clv_der');
        const n3 = await _g45ClvReleve(null, false), s3 = Object.assign({}, window._g45ClvStat);
        await g45ClvView();
        const t = document.getElementById('t-tend').innerHTML;
        o.clv = (n1 === 1 && nOa === 1 && n2 === 0 && s2.saut === 1 && n3 === 0 && s3.garde === 1 && /Relever maintenant/.test(t) && /RB Leipzig/.test(t) && /il faut ajouter le total/.test(t)) || JSON.stringify({ n1, nOa, n2, s2, n3, s3 });
        state.u = sv.u; window._g45TrEspn = sv.esp; window._g45TrOddsApi = sv.oa;
        Object.keys(ls).forEach((k) => { if (ls[k] == null) localStorage.removeItem(k); else localStorage.setItem(k, ls[k]); });
      } catch (e) { o.clv = 'erreur : ' + e.message; }
      /* 20261015t — fiche d'un joueur NHL du mur (faux serveur NHL : effectif, journal, calendrier) */
      try {
        const f0 = window.fetch, u0 = state.u, ct = window._currentTeam;
        ['g45nhlj1_eq_EDM_' + (_g45NhlJSaison()), 'g45nhlj1_log_8478402_' + (_g45NhlJSaison())].forEach((k) => localStorage.removeItem(k));
        const T = Date.now() + 30 * 3600e3;
        window.fetch = async (u) => {
          const p = decodeURIComponent(String(u));
          const rep = (o) => ({ ok: true, status: 200, json: async () => o });
          if (/club-stats\/EDM/.test(p)) return rep({ skaters: [{ playerId: 8478402, firstName: { default: 'Connor' }, lastName: { default: 'McDavid' }, positionCode: 'C', gamesPlayed: 3, goals: 2, assists: 3, points: 5, headshot: 'https://assets.nhle.com/x/8478402.png' },
            { playerId: 1, firstName: { default: 'Leon' }, lastName: { default: 'Draisaitl' }, positionCode: 'C', gamesPlayed: 3, goals: 1, assists: 1, points: 2 }], goalies: [] });
          if (/game-log/.test(p)) return rep({ gameLog: [{ gameDate: '2026-10-13', goals: 0, assists: 2, points: 2, homeRoadFlag: 'H', opponentAbbrev: 'VAN' },
            { gameDate: '2026-10-11', goals: 2, assists: 1, points: 3, homeRoadFlag: 'R', opponentAbbrev: 'CGY' }, { gameDate: '2026-10-09', goals: 0, assists: 0, points: 0, homeRoadFlag: 'H', opponentAbbrev: 'COL' }] });
          if (/club-schedule-season\/EDM\/now/.test(p)) return rep({ games: [{ startTimeUTC: new Date(T).toISOString(), gameState: 'FUT', homeTeam: { abbrev: 'SJS' }, awayTeam: { abbrev: 'EDM' } }] });
          return { ok: false, status: 404, json: async () => ({}) };
        };
        state.u = (u0 || []).concat([{ n: 'MCDAVID CONNOR', type: 'joueur', sport: '🏒', note: 'Edmonton Oilers' }]);
        window._currentTeam = 'MCDAVID CONNOR'; try { _currentTeam = 'MCDAVID CONNOR'; } catch (e) {}
        let el = document.getElementById('ip-joueur'), cree = false;
        if (!el) { el = document.createElement('div'); el.id = 'ip-joueur'; document.body.appendChild(el); cree = true; }
        await g45MurJoueurPanel();
        const t = el.innerHTML, lg = (state.u[state.u.length - 1] || {}).logoUrl;
        const jv = _g45JoueurVisLire('MCDAVID CONNOR');
        const lgSj = _g45JoueurClubLogo({ n: 'Macklin Celebrini', type: 'joueur', sport: '🏒', note: 'San Jose Sharks' });
        state.u.push({ n: 'Vancouver Canucks', sport: '🏒' }); const lgVan = g45LogoUrlDe('Vancouver Canucks');
        window.fetch = f0; state.u = u0; window._currentTeam = ct; try { _currentTeam = ct; } catch (e) {}
        if (cree) el.remove(); else el.innerHTML = '';
        o.nhlj = (/Connor McDavid/.test(t) && /Oilers/.test(t) && /33 %/.test(t) && /Canucks/.test(t) && /Prochain match/.test(t) && /Sharks/.test(t) && /8478402\.png/.test(lg || '') && jv && /8478402\.png/.test(jv.thumb || '') && !!lgSj && /VAN_dark/.test(lgVan || '')) || t.replace(/<[^>]+>/g, ' ').slice(0, 300);
      } catch (e) { o.nhlj = 'erreur : ' + e.message; }
      /* 20261015y — fiche joueur foot : onglets par compétition + chance de marquer */
      try {
        const st = (g, app) => ({ g: g, pg: 1, app: app, st: app, min: 90 * app, sh: 40, sot: 24, head: 0 });
        window._g45MjD = { nom: 'X', id: { pname: 'Kylian Mbappé', tname: 'Real Madrid', aid: 1 }, an: 2026, ph: '', lgSel: null,
          blocs: [{ st: st(7, 8), t: '🏆 Liga', c: '#f5c542', lgs: 'esp.1' }, { st: st(2, 2), t: '⭐ C1', c: '#8aa0ff', lgs: 'uefa.champions' }] };
        window._g45MjSel = 0;
        const a = _g45MjHtml();
        window._g45MjSel = 1; const b = _g45MjHtml(); window._g45MjSel = 0;
        o.mj = (/Kylian Mbappé/.test(a) && /⭐ C1/.test(a) && /53 %/.test(a) && /Voir ses matchs/.test(a) && /buts \/ m/.test(b) && /1,00/.test(b)) || a.replace(/<[^>]+>/g, ' ').slice(0, 300);
      } catch (e) { o.mj = 'erreur : ' + e.message; }
      /* 20261016b — ticket d'un pari JOUEUR en Cockpit : la carte du joueur au mur est choisie */
      try {
        const un = document.getElementById('c-unit'), u0 = state.u, a0 = window.alert; let alerte = '';
        window.alert = (m) => { alerte = m; };
        const op = document.createElement('option'); op.value = 'MCDAVID CONNOR'; op.text = 'MCDAVID CONNOR'; un.appendChild(op);
        state.u = (u0 || []).concat([{ n: 'MCDAVID CONNOR', type: 'joueur', sport: '🏒', note: 'Edmonton Oilers', s: 'a' }]);
        _g45TicketRemplirCockpit({ joueur: 'Connor McDavid', equipe: 'Edmonton Oilers', type: 'Passes 1+', cote: '1.40', mise: '5' });
        try { updMise(); } catch (x) {}
        const v = un.value, ce = (document.getElementById('c-equipe') || {}).value;
        /* 20261020p : ticket lu à l'envers (club du joueur = adversaire) → inversé, lieu Extérieur */
        const op2 = document.createElement('option'); op2.value = 'Macklin Celebrini'; op2.text = 'Macklin Celebrini'; un.appendChild(op2);
        state.u = state.u.concat([{ n: 'Macklin Celebrini', type: 'joueur', sport: '🏒', note: 'San Jose Sharks', s: 'a' }]);
        _g45TicketRemplirCockpit({ joueur: 'Macklin Celebrini', equipe: 'Montreal Canadiens', adversaire: 'San Jose Sharks', domicile: true, type: 'Buteur', cote: '2.1', mise: '5' });
        const v2 = un.value, ce2 = (document.getElementById('c-equipe') || {}).value, ct2 = (document.getElementById('c-target') || {}).value, li2 = (document.getElementById('c-lieu') || {}).value;
        op.remove(); op2.remove(); state.u = u0; window.alert = a0;
        o.tkj = (v === 'MCDAVID CONNOR' && !alerte && ce === 'Edmonton Oilers' && v2 === 'Macklin Celebrini' && ce2 === 'San Jose Sharks' && ct2 === 'Montreal Canadiens' && li2 === 'ext')
          || JSON.stringify({ v, alerte, ce, v2, ce2, ct2, li2 });
      } catch (e) { o.tkj = 'erreur : ' + e.message; }
      /* 20261016g — séries individuelles : seuil 2 ou plus */
      try {
        const S = _g45RegCalc([{ points: 0 }, { points: 2 }, { points: 1 }, { points: 3 }, { points: 2 }].reverse(), 'points', true);
        const S2 = _g45RegSeuilS(S, 2);
        _g45Reg.mem['TEST'] = [{ id: 1, nom: 'Test Joueur', eq: 'EDM', s: S }]; const k0 = _g45RegK; _g45RegK = () => 'TEST'; _g45Reg.seuil = 2;
        const H = _g45RegHtml(); _g45RegK = k0; _g45Reg.seuil = 1; delete _g45Reg.mem['TEST'];
        o.regs = (S.pct === 80 && S2.pct === 60 && S2.pire === 1 && S2.best === 2 && S2.cours === 0 && /2 ou plus/.test(H) && /% 2\+|\(2\+\)/.test(H)) || JSON.stringify({ S, S2 });
      } catch (e) { o.regs = 'erreur : ' + e.message; }
      /* 20261016f — équipe du ticket absente du mur, ADVERSAIRE au mur → pari contre lui */
      try {
        const un = document.getElementById('c-unit'), u0 = state.u, a0 = window.alert; let alerte = '';
        window.alert = (m) => { alerte = m; };
        const op = document.createElement('option'); op.value = 'Vancouver Canucks'; op.text = 'Vancouver Canucks'; un.appendChild(op);
        state.u = (u0 || []).concat([{ n: 'Vancouver Canucks', sport: '🏒', s: 'a' }]);
        _g45TicketRemplirCockpit({ equipe: 'Florida Panthers', adversaire: 'Vancouver Canucks', domicile: true, type: 'Résultat', cote: '1.52', mise: '5' });
        const v = un.value, t = document.getElementById('c-target').value, l = (document.getElementById('c-lieu') || {}).value, ty = (mmRows[0] || {}).type;
        op.remove(); state.u = u0; window.alert = a0;
        o.tkc = (v === 'Vancouver Canucks' && t === 'Florida Panthers' && l === 'ext' && ty === 'Défaite' && !alerte) || JSON.stringify({ v, t, l, ty, alerte });
      } catch (e) { o.tkc = 'erreur : ' + e.message; }
      /* 20261024w — nouveau ticket sans joueur : le buteur du ticket précédent est effacé (Cockpit) */
      try {
        const a0 = window.alert; window.alert = () => {};
        _g45TicketRemplirCockpit({ joueur: 'Erling Haaland', equipe: 'Manchester City', adversaire: 'Aston Villa', type: 'Buteur', cote: '1.6', mise: '3' });
        const j1 = document.getElementById('c-joueur').value;
        _g45TicketRemplirCockpit({ equipe: 'Atletico Madrid', adversaire: 'Deportivo', type: 'Victoire', cote: '2.05', mise: '5' });
        const j2 = document.getElementById('c-joueur').value; window.alert = a0;
        o.tkJ = (j1 === 'Erling Haaland' && j2 === '') || JSON.stringify({ j1, j2 });
      } catch (e) { o.tkJ = 'erreur : ' + e.message; }
      /* 20261024z — F1 direct : meilleurs secteurs (p.bs) + carte 10 min après la fin d'une séance vue en cours */
      try {
        const mk = (st) => ({ t: Date.now(), sess: { libelle: 'Qualifying', type: 'Qualifying', debut: 'T1', statut: st, lieu: 'Austin' }, tour: {}, piste: { s: '1' }, meteo: {}, rc: [],
          pilotes: [{ n: '12', tla: 'ANT', pos: 1, meilleur: '1:34.035', s: [['', 0, [2, 2]], ['26.1', 1, []], ['', 0, []]], bs: [['25.401', 1], ['33.200', 3], ['35.950', 7]] }] });
        const H1 = _g45F1OffHtml(mk('Started'));
        const a1 = _g45F1OffActif(mk('Started')), a2 = _g45F1OffActif(mk('Finished')), H2 = _g45F1OffHtml(mk('Finished'));
        const jamais = _g45F1OffActif({ sess: { debut: 'T9', libelle: 'Race', statut: 'Finished' } });
        o.f1bs = (/#b57bff;">25\.401/.test(H1) && /#1ed760;">33\.200/.test(H1) && /#fff;">35\.950/.test(H1) && /26\.1/.test(H1)
          && a1 && a2 && /carte encore 10 min/.test(H2) && !jamais) || JSON.stringify({ a1, a2, jamais, h: H1.slice(0, 200) });
      } catch (e) { o.f1bs = 'erreur : ' + e.message; }
      /* 20261027z — 3 paris indépendants 🌍 / 🏠 / ✈️ (remplace l'interrupteur « Même pari partout » de 20261025b) + paliers par montante */
      try {
        const n = _g45UfCompose('', 'forme', 'victoire + under 4.5', 'les deux marquent', 'victoire');
        const D = _g45UfDecoupe(n), D0 = _g45UfDecoupe('🏠/✈️ victoire');
        const cD = _g45AgConsigne('🌍 victoire ✈️ les deux marquent', true), cE = _g45AgConsigne('🌍 victoire ✈️ les deux marquent', false), cG = _g45AgConsigne('🌍 victoire', false);
        const P = _g45UlPaliers({ l: 2, lc: { 'ligue1': 3, 'ligue1|dom': 1, 'ligue1|ext': 2 } }), P0 = _g45UlPaliers({ l: 2 });
        const vis = (document.getElementById('g45uf-tout-u') || {}).style;
        o.ufTout = (n === 'forme 🌍 victoire 🏠 victoire + under 4.5 ✈️ les deux marquent' && D.glob === 'victoire' && D.dom === 'victoire + under 4.5' && D.ext === 'les deux marquent' && D.avant === 'forme'
          && D0.dom === 'victoire' && !D0.glob && /victoire/.test(cD.txt) && /deux marquent/.test(cE.txt) && /victoire/.test(cG.txt)
          && /🌍 Palier 3/.test(P) && /🏠 Palier 1/.test(P) && /✈️ Palier 2/.test(P) && /Palier 2/.test(P0) && !/🌍/.test(P0) && (!vis || vis.display !== 'none'))
          || JSON.stringify({ n, D, D0, cD, cE, cG, P, P0 });
      } catch (e) { o.ufTout = 'erreur : ' + e.message; }
      /* 20261025c — ticket d'une équipe absente du mur → carte JOUEUR de ce club */
      try {
        const un = document.getElementById('c-unit'), u0 = state.u, a0 = window.alert; let alerte = '';
        window.alert = (m) => { alerte = m; };
        const op = document.createElement('option'); op.value = 'Ryan Nugent-Hopkins'; op.text = 'Ryan Nugent-Hopkins'; un.appendChild(op);
        state.u = (u0 || []).concat([{ n: 'Ryan Nugent-Hopkins', sport: '🏒', type: 'joueur', club: 'Edmonton Oilers', s: 'a' }]);
        _g45TicketRemplirCockpit({ equipe: 'Edmonton Oilers', adversaire: 'Toronto Maple Leafs', domicile: true, type: 'Victoire Edmonton + Nugent-Hopkins 1 point', cote: '1.98', mise: '5' });
        const v = un.value, j = document.getElementById('c-joueur').value;
        op.remove(); state.u = u0; window.alert = a0;
        o.tkClub = (v === 'Ryan Nugent-Hopkins' && j === 'Ryan Nugent-Hopkins' && !alerte) || JSON.stringify({ v, j, alerte });
      } catch (e) { o.tkClub = 'erreur : ' + e.message; }
      /* 20261025f — bénéfice du mois en cours (3e case du mur) */
      try {
        const d = new Date(2026, 9, 25), R = _g45MoisCalc([{ date: '2026-10-03', m: 10, cote: 2, win: true }, { date: '2026-10-20', m: 5, cote: 1.8, win: false },
          { date: '2026-09-30', m: 50, cote: 2, win: true }, { date: '2026-10-21', m: 4, cote: 2, win: true, isPending: true }], d);
        render(); const box = document.getElementById('g45-mois-kpi');
        o.mois = (R.mois === 'OCTOBRE' && R.ben === 5 && R.n === 2 && R.pc === 50 && !!box && /€/.test(box.textContent)) || JSON.stringify({ R, box: box && box.textContent });
      } catch (e) { o.mois = 'erreur : ' + e.message; }
      /* 20261025g — Surebet : ligne LAY (−) → cote normale 1 + (1 − k)/(L − 1), mise lay = risque / (L − 1) ; OrbitX en 1er */
      try {
        const eq = sbCote({ c: 2.2, k: 2, lay: true }), sv = JSON.stringify(sbRows);
        sbRows = [{ c: 2.1, d: true, k: 0 }, { c: 2.2, d: true, k: 0, lay: true }];
        buildSbRows();
        const z = document.body.textContent, b = Object.keys(state.b);
        sbRows = JSON.parse(sv); buildSbRows();
        o.sbLay = (Math.abs(eq - (1 + 0.98 / 1.2)) < 1e-9 && /Mise 2 LAY/.test(z) && /risque/.test(z) && /= 1,83/.test(z) && b[0] === 'orbitx') || JSON.stringify({ eq, b0: b[0], z: z.slice(0, 120) });
      } catch (e) { o.sbLay = 'erreur : ' + e.message; }
      /* 20261025j — Mes équipes rangées par sport (bandes repliables) */
      try {
        const u0 = state.u; window.Chart = window.Chart || function () { return { destroy() {}, update() {} }; };
        state.u = [{ n: 'Lyon', sport: '⚽', s: 5, l: 1, color: '#ff0' }, { n: 'Carolina Hurricanes', sport: '🏒', s: 5, l: 1, color: '#f00' }, { n: 'PSG', sport: '⚽', s: 5, l: 1, color: '#00f' }, { n: 'Ryan Nugent-Hopkins', sport: '🏒', type: 'joueur', s: 1, l: 1, color: '#0ff' }];
        try { render(); } catch (e) {}
        const ul = document.getElementById('ulist'), H = [...ul.querySelectorAll('.g45-mur-sp')].map((h) => h.textContent);
        const nFoot = ul.querySelectorAll('.g45-mur-sp')[0].nextElementSibling.querySelectorAll('.urow').length;
        g45MurPlier('foot'); const plie = ul.querySelectorAll('.g45-mur-sp')[0].nextElementSibling.style.display === 'none';
        const hk = ul.querySelectorAll('.g45-mur-sp')[1].nextElementSibling.textContent, sousT = /👥 Équipes \(1\)/.test(hk) && /👤 Joueurs \(1\)/.test(hk);   /* 20261028b */
        g45MurPlier('foot'); state.u = u0; try { render(); } catch (e) {}
        o.murSp = (H.length === 2 && /Football/.test(H[0]) && /2 équipes/.test(H[0]) && /Hockey/.test(H[1]) && nFoot === 2 && plie && sousT) || JSON.stringify({ H, nFoot, plie, sousT });
      } catch (e) { o.murSp = 'erreur : ' + e.message; }
      /* 20261025n — NFL drive en cours (données de la sonde Steelers @ Saints) */
      try {
        const cp = { situation: { down: 3, distance: 4, yardLine: 53, possession: '23', possessionText: 'PIT 47', lastPlay: { type: { text: 'Pass Reception' }, statYardage: 1, start: { yardLine: 54 }, end: { yardLine: 53 } } },
          competitors: [{ homeAway: 'home', team: { id: '18', abbreviation: 'NO', shortDisplayName: 'Saints' } }, { homeAway: 'away', team: { id: '23', abbreviation: 'PIT', shortDisplayName: 'Steelers' } }] };
        const H = _g45NflDriveHtml(cp);
        o.nflDr = (/3e &amp; 4 à PIT 47/.test(H) && /passe complétée, \+1 yard/.test(H) && /left:47\.48%;">🏈/.test(H) && /#ffd400;left:50\.84%/.test(H)) || H.slice(0, 300);
      } catch (e) { o.nflDr = 'erreur : ' + e.message; }
      /* 20261025t — 💳 abonnements : prélèvement du jour, pas de doublon, mois suivants, fusion d'un autre appareil */
      try {
        const sb = JSON.stringify(state.b), sa = state.abo, sh = state.aboH, p0 = window._g45PushBetsGithub; window._g45PushBetsGithub = () => {};
        state.b = Object.assign({}, state.b, { 'test banque': '100.00' });
        state.abo = [{ id: 'abT', n: 'Windscribe', m: 3, j: 27, b: 'test banque', on: true, cree: '2026-10-27' }]; state.aboH = [];
        const n1 = _g45AboTraiter('2026-10-27'), n2 = _g45AboTraiter('2026-10-27'), b1 = state.b['test banque'];
        const n3 = _g45AboTraiter('2026-12-28'), b2 = state.b['test banque'];
        const rem = { h: [], a: [], abo: state.abo, aboH: [{ id: 'abT|2027-01', a: 'abT', n: 'Windscribe', m: 3, b: 'test banque', d: '2027-01-27' }] };
        _g45BetsFusion(rem); const b3 = state.b['test banque'], nh = state.aboH.length;
        _g45BetsFusion(rem); const b4 = state.b['test banque'];
        state.b = JSON.parse(sb); state.abo = sa; state.aboH = sh; window._g45PushBetsGithub = p0;
        o.abo = (n1 === 1 && n2 === 0 && b1 === '97.00' && n3 === 2 && b2 === '91.00' && b3 === '88.00' && b4 === '88.00' && nh === 4) || JSON.stringify({ n1, n2, b1, n3, b2, b3, b4, nh });
      } catch (e) { o.abo = 'erreur : ' + e.message; }
      /* 20261027b — historique des mouvements : dépôt / retrait via « Modifier » + prélèvements */
      try {
        const sb = JSON.stringify(state.b), sm = state.mvt, sh = state.aboH, pr = window.prompt, p0 = window._g45PushBetsGithub; window._g45PushBetsGithub = () => {};
        window.Chart = window.Chart || function () { return { destroy() {}, update() {} }; };
        state.b = Object.assign({}, state.b, { 'test bk': '120' }); state.mvt = []; state.aboH = [{ id: 'x|2026-10', a: 'x', n: 'Windscribe', m: 3, b: 'test bk', d: '2026-10-27' }];
        window.prompt = () => '170'; editBook('test bk'); window.prompt = () => '140'; editBook('test bk'); window.prompt = () => null; editBook('test bk');
        const L = _g45MvtLignes(), t = L.map((x) => x.t + ':' + x.v).join(',');
        _g45MvtRender(); const H = (document.getElementById('g45-mvt') || {}).textContent || '';
        window.prompt = pr; window._g45PushBetsGithub = p0; state.b = JSON.parse(sb); state.mvt = sm; state.aboH = sh;
        o.mvt = (L.length === 3 && /dep:50/.test(t) && /ret:-30/.test(t) && /abo:-3/.test(t) && /Dépôt/.test(H) && /Retrait/.test(H) && /Windscribe/.test(H)) || JSON.stringify({ t, H: H.slice(0, 200) });
      } catch (e) { o.mvt = 'erreur : ' + e.message; }
      /* 20261027c — une seule montante par championnat (Liga / La Liga / LaLiga…) */
      try {
        const su = state.u, sa = state.a, sh = state.h;
        state.u = [{ n: 'Real Test', l: 1, lc: { 'laliga|ext': 1, 'laliga|dom': 2, 'liga|dom': 1, 'liga|ext': 1 } }];
        state.a = [{ n: 'Real Test', comp: 'La Liga', domicile: 'dom', date: '2026-09-20', win: false }, { n: 'Real Test', comp: 'Liga', domicile: 'dom', date: '2026-10-19', win: true }]; state.h = [];
        _g45LcCanon(); const u = state.u[0], lc = JSON.stringify(u.lc), p1 = _g45Pal(u, 'La Liga', 'dom'), p2 = _g45Pal(u, 'Spanish LALIGA', 'dom');
        state.u = su; state.a = sa; state.h = sh;
        o.lcCanon = (lc === '{"liga|ext":1,"liga|dom":1}' && p1 === 1 && p2 === 1 && _g45CompNz('Liga Portugal') === 'ligaportugal') || JSON.stringify({ lc, p1, p2 });
      } catch (e) { o.lcCanon = 'erreur : ' + e.message; }
      /* 20261027d — F1 critères 4 saisons + Jouable en Cockpit */
      try {
        const R = (r, a, b, gA) => ({ r, c: 'cir' + r, x: [['ver', 'rb', a, 1, gA, 10, 'Max Verstappen'], ['per', 'rb', b, b < 20 ? 1 : 0, 5, 2, 'Sergio Perez'], ['nor', 'mc', 2, 1, 2, 18, 'Lando Norris']] });
        const D = { ans: [{ y: 2025, gp: [R(1, 1, 4, 1), R(2, 5, 3, 2), R(3, 6, 20, 4)], sp: [] }, { y: 2026, gp: [R(1, 7, 3, 9), R(2, 3, 9, 1)], sp: [] }], dn: { ver: 'Max Verstappen', per: 'Sergio Perez', nor: 'Lando Norris' }, next: { c: 'cir2', n: 'Test' } };
        const st = _g45F1CrStats(_g45F1CrSeq(D, 'ver', { k: 'po' }));
        const cq = _g45F1CrStats(_g45F1CrSeq(D, 'ver', { k: 'cq' }));
        const ci = _g45F1CrSeq(D, 'ver', { k: 'po', ci: 1 }).length, ap = _g45F1CrSeq(D, 'ver', { k: 'po', ap: 1 }).length;
        const pa = _g45F1CrPal(st.pire);
        const div = document.createElement('div'); div.id = 'g45-f1cr'; document.body.appendChild(div);
        _g45F1CrData(D); g45F1CrSet('d', 'ver'); const H = div.innerHTML; div.remove();
        const sai = document.createElement('div'); document.body.appendChild(sai); await loadF1Saisons(sai, 'Formule 1'); await new Promise(r => setTimeout(r, 50));
        const HS = sai.innerHTML; sai.remove();
        const nAn = _g45F1CrSeq(D, 'ver', { k: 'po', an: 2026 }).length, nCir = _g45F1CrSeq(D, 'ver', { k: 'po', cir: 'cir1' }).length, nApAn = _g45F1CrSeq(D, 'ver', { k: 'po', ap: 1, an: 2026 }).length;
        const d2 = document.createElement('div'); d2.id = 'g45-f1cr'; document.body.appendChild(d2); _g45F1CrMonter(d2); g45F1CrSet('an', '2026'); g45F1CrSet('cir', 'cir2');
        const H2 = d2.innerHTML; g45F1CrSet('an', '0'); g45F1CrSet('cir', ''); d2.remove();
        const anOk = nAn === 2 && nCir === 2 && nApAn === 0 && /📅 Saisons/.test(H2) && /Tous les circuits/.test(H2) && /⭐ cir2 \(prochain GP\)/.test(H2) && /1\/1 · 100 %/.test(H2) && !/>2025</.test(H2.split('Pire série de ratés')[1] || '');
        o.f1cr = (st.n === 5 && st.ok === 2 && st.pire === 3 && st.meil === 1 && st.cours === 1 && st.coursOk && cq.ok === 3 && ci === 2 && ap === 1
          && pa.p === 4 && pa.mise === STRATS['1'][3] && /il fallait 4 paliers/.test(H) && /Jouable en Cockpit/.test(H) && /Lando Norris/.test(H) && /il fallait 4 paliers/.test(HS) && /Classement pilotes/.test(HS) && anOk) || JSON.stringify({ st, cq, ci, ap, pa, nAn, nCir, nApAn });
      } catch (e) { o.f1cr = 'erreur : ' + e.message; }
      /* 20261027g — Séries individuelles NHL : 🔍 Pépites (50 joueurs, top 10 grisé, colonne Paliers) */
      try {
        const sv = Object.assign({}, _g45Reg);
        Object.assign(_g45Reg, { an: 2027, an0: 2027, cat: 'a', eq: '', lg: '', pep: 1, tri: 'pire', seuil: 1, lieu: '' });
        const k = _g45RegK(), S = (v) => _g45RegCalc(v.map((x, i) => ({ gameDate: '2026-10-' + (10 + i), assists: x })).reverse(), 'assists');
        _g45Reg.mem[k] = [{ id: 1, nom: 'Top Dix', eq: 'EDM', t10: 1, s: S([1, 1, 0, 1]) }, { id: 2, nom: 'Petit Fox', eq: 'NYR', s: S([1, 0, 0, 0, 1]) }];
        const H = _g45RegHtml(); delete _g45Reg.mem[k]; _g45Reg.pep = 0; const k0 = _g45RegK();
        Object.keys(_g45Reg).forEach(q => { if (!(q in sv)) delete _g45Reg[q]; }); Object.assign(_g45Reg, sv);
        o.pep = (/k|pep$/.test(k) && /\+pep$/.test(k) && !/pep/.test(k0) && /💎 Petit Fox/.test(H) && !/💎 Top Dix/.test(H) && /opacity:\.55/.test(H) && />Paliers<| paliers?<\/b>/.test(H) && /<b>4( paliers)?<\/b> ✅/.test(H) && /Pépites \(50 joueurs\)/.test(H)) || H.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 400);
      } catch (e) { o.pep = 'erreur : ' + e.message; }
      /* 20261027h — critères 4 saisons : 🏁 Jouable en Cockpit ? (classement de la ligue, combiné actif) */
      try {
        const S = window._g45CrS, sv = { nom: S.nom, ctx: S.ctx, combos: S.combos, a: S.a, lieu: S.lieu };
        const mk = (res) => ({ t: Date.now(), lg: 'nhl', saisons: [{ an: 2027, ms: res.map((r, i) => ['2026-10-' + (10 + i), 1, r[0], r[1], 0, 0, 'e' + i]) }] });
        const DA = mk([[3, 1], [2, 1], [1, 2], [4, 2], [3, 0], [2, 1]]), DB = mk([[1, 2], [0, 3], [1, 4], [3, 1], [2, 1], [1, 2]]);
        const st = _g45CrClsStat(DB, { res: 'vqr', ou: '', L: 5.5 }), stO = _g45CrClsStat(DA, { res: 'vqr', ou: 'un', L: 4.5, jo: 'x', jn: 'X' });
        S.nom = 'Test Avs'; S.ctx = { sp: 'hockey', lg: 'nhl', id: '1' }; S.combos = [{ res: 'vqr', ou: 'un', L: 4.5 }]; S.a = 0; S.lieu = 'tout';
        S.data['Test Avs'] = DA; S.cls['hockey|nhl'] = { etat: 2, eq: [{ id: '2', nom: 'Test Bruins' }, { id: '1', nom: 'Test Avs' }], D: { '1': DA, '2': DB } };
        const H = _g45CrHtml('Test Avs', S.ctx);
        delete S.data['Test Avs']; delete S.cls['hockey|nhl']; Object.assign(S, sv);
        const iA = H.indexOf('>Test Avs<'), iB = H.indexOf('>Test Bruins<');
        o.crCls = (st.pire === 3 && st.ok === 2 && stO.n === 6 && stO.ok === 4 && stO.pire === 2 && /Jouable en Cockpit/.test(H) && iA > 0 && iB > iA && /g45CompetOuvrir\('Test Bruins','2','nhl','hockey',true\)/.test(H)) || JSON.stringify({ st, stO, iA, iB, h: H.slice(-600) });
      } catch (e) { o.crCls = 'erreur : ' + e.message; }
      /* 20261028e — 📌 Garder sur la carte */
      try {
        const H = _g45UlPsHtml({ ps: { sig: 'dom|Passeur', lib: 'Jack Eichel passeur', k: 'dom', ans: ['2026-27', '2025-26', '2024-25', '2023-24'], p: [2, 3, 4, 3], tot: 4, at: Date.now() } });
        const S = window._g45CrS, sv = { ctx: S.ctx, lieu: S.lieu };
        S.ctx = { sp: 'hockey', lg: 'nhl', id: '1' }; S.lieu = 'tout';
        const D = { lg: 'nhl', saisons: [{ an: 2027, ms: [['2026-10-01', 1, 3, 1, 0, 0, 'a'], ['2026-10-03', 1, 1, 2, 0, 0, 'b']] }, { an: 2026, ms: [['2026-03-01', 1, 1, 2, 0, 0, 'c'], ['2026-03-03', 1, 1, 3, 0, 0, 'd'], ['2026-03-05', 1, 2, 1, 0, 0, 'e']] }] };
        const G = _g45CrGarderCalc({ res: 'vqr', ou: '', L: 5.5 }, D); Object.assign(S, sv);
        o.garde = (/🏠 Jack Eichel passeur/.test(H) && /5 paliers/.test(H) && /2026-27 → 2023-24/.test(H) && G.p.join() === '1,2' && G.ans.length === 2) || JSON.stringify({ G, H: H.slice(0, 200) });
      } catch (e) { o.garde = 'erreur : ' + e.message; }
      /* 20261028h — 🔄 Calculer mes séries (Outils → Équipes) */
      try {
        const f0 = window.fetch, cx0 = window._g45CompoCtx;
        window._g45CompoCtx = async () => ({ sp: 'hockey', lg: 'nhl', ref: 'T99', via: 'perso' });
        const ev = (d, h, a) => ({ date: d + 'T00:00Z', seasonType: { type: 2 }, competitions: [{ status: { type: { completed: true, detail: 'Final' } }, competitors: [{ homeAway: 'home', team: { id: 'T99' }, score: { value: h } }, { homeAway: 'away', team: { id: '5' }, score: { value: a } }] }] });
        window.fetch = async (u) => /teams\/T99\/schedule/.test(String(u)) ? { ok: true, json: async () => ({ events: [ev('2026-10-01', 3, 1), ev('2026-10-03', 1, 2), ev('2026-10-05', 2, 3), ev('2026-10-07', 4, 2)] }) } : f0(u);
        const u = { n: 'Test Avs', sport: '🏒', note: '🌍 vainqueur + under 5.5 🏠 victoire ✈️ buteur Eichel' };
        const P = _g45SerParis(u).map(x => x.k).join();
        await _g45SerEquipe(u);
        window.fetch = f0; window._g45CompoCtx = cx0;
        Object.keys(localStorage).filter(k => /T99/.test(k)).forEach(k => localStorage.removeItem(k));
        const L = u.psL || {}, H = _g45UlPsLHtml(u), bar = !!document.getElementById('g45-ser-bar');
        o.serie = (P === 'glob,dom,ext' && L.glob && L.glob.p.join() === '3,3,3,3' && L.glob.tot === 3 && L.dom.p.join() === '2,2,2,2' && /club NHL introuvable/.test(L.ext.err)
          && /🏠 pire série/.test(H) && /g45SerUne\('Test Avs'/.test(H) && typeof g45SerUne === 'function' && /4 paliers/.test(H) && /3 paliers/.test(H) && bar && _g45SerCombo('victoire ou nul') === 'Victoire' && _g45SerCombo('buteur') === null && /Vainqueur.*équipe Over 2\.5/.test(_g45SerCombo('vainqueur + buts de Dallas plus de 2,5', { sp: 'hockey', lg: 'nhl', id: '1' }, 'Dallas Stars'))
          && /adversaire Under 3\.5/.test(_g45SerCombo('buts de Chicago moins de 3,5', { sp: 'hockey', lg: 'nhl', id: '1' }, 'Dallas Stars'))) || JSON.stringify({ P, L, bar, H: H.replace(/<[^>]+>/g, ' '), d: _g45SerCombo('vainqueur + buts de Dallas plus de 2,5', { sp: 'hockey', lg: 'nhl', id: '1' }, 'Dallas Stars') });
      } catch (e) { o.serie = 'erreur : ' + e.message; }
      /* 20261028k — 🔄 Calculer mes séries : joueurs (NHL + foot) */
      try {
        const lg1 = _g45SerLegsJ('Passeur'), lg2 = _g45SerLegsJ('Victoire Edmonton + Nugent-Hopkins 1 point ou plus'), lg3 = _g45SerLegsJ('Victoire + Over 2.5 + buteur'), lg4 = _g45SerLegsJ('2 tirs cadrés');
        const log = [{ gameDate: '2026-10-10', goals: 0, assists: 1, h: 1 }, { gameDate: '2026-10-12', goals: 0, assists: 0, h: 1 }, { gameDate: '2026-10-14', goals: 1, assists: 0, h: 0 },
          { gameDate: '2026-10-16', goals: 0, assists: 0, h: 1 }, { gameDate: '2025-03-01', goals: 0, assists: 0, h: 1 }, { gameDate: '2025-03-03', goals: 0, assists: 2, h: 0 }];
        const A = _g45SerStatJ(lg1, log, [], 'glob', true, false), Dm = _g45SerStatJ(lg1, log, [], 'dom', true, false);
        const ms = [['2026-10-11', 1, 4, 2, 0], ['2026-10-12', 1, 3, 1, 0], ['2026-10-14', 0, 2, 3, 0], ['2026-10-16', 1, 3, 2, 1]];
        const V = _g45SerStatJ(lg2, log, ms, 'glob', true, false);
        const u0 = state.u, f0 = window.fetch; const uJ = { n: 'Jack Eichel', type: 'joueur', sport: '🏒', note: 'Vegas Golden Knights · 🏠 Passeur ✈️ Buteur' };
        localStorage.removeItem('g45ser_ro_VGK');
        window.fetch = async (u) => { const x = decodeURIComponent(String(u)); if (/roster\/VGK/.test(x)) return { ok: true, json: async () => ({ forwards: [{ id: 8478403, firstName: { default: 'Jack' }, lastName: { default: 'Eichel' } }] }) };
          if (/player\/8478403\/game-log\/20262027/.test(x)) return { ok: true, json: async () => ({ gameLog: [{ gameDate: '2026-10-12', goals: 1, assists: 0, points: 1, homeRoadFlag: 'R' }, { gameDate: '2026-10-10', goals: 0, assists: 1, points: 1, homeRoadFlag: 'H' }] }) };
          return { ok: false, json: async () => ({}) }; };
        Object.keys(localStorage).filter(k => /8478403/.test(k)).forEach(k => localStorage.removeItem(k));
        await _g45SerJoueur(uJ); window.fetch = f0; state.u = u0;
        Object.keys(localStorage).filter(k => /8478403|g45ser_ro_VGK/.test(k)).forEach(k => localStorage.removeItem(k));
        const J = uJ.psL || {};
        o.serJ = (lg1.pj === 'a' && lg2.res === 'vic' && lg2.pj === 'p' && lg3.ou === 'ov' && lg3.pj === 'g' && lg4 === null
          && A.p.join() === '3,1' && A.tot === 3 && A.ans.join() === '2026-27,2024-25' && Dm.p.join() === '2,1' && V.p.join() === '3' && V.ans.length === 1 && /Victoire \(temps régl\.\) \+ 1 point/.test(V.lib)
          && J.dom && J.dom.p.join() === '0' && J.ext && J.ext.p.join() === '0' && J.dom.lib === 'Passeur') || JSON.stringify({ lg1, lg2, A, Dm, V, J });
      } catch (e) { o.serJ = 'erreur : ' + e.message; }
      /* 20261028m — joueur nommé dans un pari d'équipe (« Victoire + Over 2.5 + Harry Kane buteur ») */
      try {
        const n1 = _g45SerNomJ('Victoire + Over 2.5 + Harry Kane buteur'), n2 = _g45SerNomJ('Victoire Edmonton + Nugent-Hopkins 1 point ou plus');
        const f0 = window.fetch, cx0 = window._g45CompoCtx;
        window._g45CompoCtx = async () => ({ sp: 'hockey', lg: 'nhl', ref: 'T98', via: 'perso' });
        const ev = (d, h, a2) => ({ date: d + 'T00:00Z', seasonType: { type: 2 }, competitions: [{ status: { type: { completed: true, detail: 'Final' } }, competitors: [{ homeAway: 'home', team: { id: 'T98' }, score: { value: h } }, { homeAway: 'away', team: { id: '5' }, score: { value: a2 } }] }] });
        localStorage.removeItem('g45ser_ro_VGK');
        window.fetch = async (u) => { const x = decodeURIComponent(String(u));
          if (/teams\/T98\/schedule/.test(x)) return { ok: true, json: async () => ({ events: /season=2027/.test(x) ? [ev('2026-10-02', 3, 1), ev('2026-10-04', 4, 2), ev('2026-10-06', 1, 2)] : [] }) };
          if (/roster\/VGK/.test(x)) return { ok: true, json: async () => ({ forwards: [{ id: 8478403, firstName: { default: 'Jack' }, lastName: { default: 'Eichel' } }] }) };
          if (/player\/8478403\/game-log\/20262027/.test(x)) return { ok: true, json: async () => ({ gameLog: [{ gameDate: '2026-10-06', goals: 1, assists: 0, points: 1, homeRoadFlag: 'H' }, { gameDate: '2026-10-04', goals: 0, assists: 0, points: 0, homeRoadFlag: 'H' }, { gameDate: '2026-10-02', goals: 1, assists: 0, points: 1, homeRoadFlag: 'H' }] }) };
          return { ok: false, json: async () => ({}) }; };
        const u = { n: 'Vegas Golden Knights', sport: '🏒', note: '🏠 Vainqueur + Jack Eichel buteur' };
        Object.keys(_g45RegLogs).filter(k => /8478403/.test(k)).forEach(k => delete _g45RegLogs[k]);
        await _g45SerEquipe(u);
        window.fetch = f0; window._g45CompoCtx = cx0;
        Object.keys(localStorage).filter(k => /T98|8478403|g45ser_ro_VGK/.test(k)).forEach(k => localStorage.removeItem(k));
        const R = (u.psL || {}).dom || {};
        o.serJE = (n1 === 'Harry Kane' && n2 === 'Nugent-Hopkins' && R.p && R.p.join() === '2' && /Jack Eichel Buteur/.test(R.lib)) || JSON.stringify({ n1, n2, R });
      } catch (e) { o.serJE = 'erreur : ' + e.message; }
      /* 20261028o — 🔄 Calculer sur une carte avec pari mais jamais calculée */
      try {
        const u0 = state.u; state.u = [{ n: 'Test Yamal', type: 'joueur', sport: '⚽', note: 'Barcelona 🏠 Passeur', s: 4, l: 1 }, { n: 'Test Vide', sport: '⚽', note: 'Barcelona', s: 1, l: 1 }];
        render(); await new Promise(r => setTimeout(r, 50)); if (window._g45UlistHabiller) _g45UlistHabiller();
        const H = (document.getElementById('ulist') || {}).innerHTML || '';
        state.u = u0; render();
        o.serUne = (/g45SerUne\('Test Yamal'/.test(H) && !/g45SerUne\('Test Vide'/.test(H)) || (Z => Z.slice(Math.max(0, Z.indexOf('Test Yamal') - 200), Z.indexOf('Test Yamal') + 900))(H.replace(/style="[^"]*"/g, ''));
      } catch (e) { o.serUne = 'erreur : ' + e.message; }
      /* 20261028p — 🏁 Cockpit BET45 (Tendances) : cartes du mur qui jouent aujourd'hui / cette nuit */
      try {
        const u0 = state.u, v0 = localStorage.getItem('g45tr_vue'), a0 = localStorage.getItem('g45ck_ag'), at = Date.now(), d = new Date();
        state.u = [{ n: 'Test Stars', sport: '🏒', s: 5, l: 1, lc: { 'nhl|dom': 2 }, note: '🏠 vainqueur + buts de Dallas plus de 2,5', psL: { dom: { t: 'vainqueur + buts de Dallas plus de 2,5', p: [2, 1, 2, 1], tot: 2, at } } },
          { n: 'Test Loin', sport: '⚽', s: 4, l: 1, note: '✈️ Victoire' }];
        window._g45CkAg = { j: d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(), L: [{ t: at + 3600e3, n: 'Test Stars', d: 1, adv: 'Canadiens', sp: 'hockey' }, { t: at + 3 * 86400e3, n: 'Test Loin', d: 0, adv: 'X', sp: 'soccer' }] };
        g45TrVue('ck'); await new Promise(r => setTimeout(r, 100));
        const H = (document.getElementById('t-tend') || {}).innerHTML || '', nav = /🏁 Cockpit BET45/.test(H);
        state.u = u0; window._g45CkAg = null; if (a0 == null) localStorage.removeItem('g45ck_ag'); else localStorage.setItem('g45ck_ag', a0);
        if (v0 == null) localStorage.removeItem('g45tr_vue'); else localStorage.setItem('g45tr_vue', v0);
        const T = H.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
        o.ck = (nav && /tes cartes qui jouent/.test(T) && /Test Stars 🏠 vs Canadiens/.test(T) && /Palier 2 · mise/.test(T) && /pire série 2 · 1 · 2 · 1 → 3 paliers ✅ · [\d,]+ €/.test(T) && window._g45PalCarte(2, { s: 5 }).mise === STRATS['5'][2] && window._g45PalCarte(9, { s: 5 }).ico === '❌' && /📌 🏠 vainqueur/.test(T) && !/Test Loin/.test(T)) || T.slice(0, 600);
      } catch (e) { o.ck = 'erreur : ' + e.message; }
      /* 20261029b — 🏁 Cockpit BET45 : 📅 Calendrier et 📈 Graphique (paris Cockpit isS déjà enregistrés) */
      try {
        const a0 = state.a, h0 = state.h, s0 = localStorage.getItem('g45ck_sous'), d = new Date(), j = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
        state.a = [{ id: '1', isS: true, win: true, n: 'Test Bayern', domicile: 'dom', l: 2, m: 10, cote: 2.15, date: j, target: 'Leverkusen', type: 'Victoire + Over 2.5' },
          { id: '2', isS: true, win: false, n: 'Test Eichel', domicile: 'ext', l: 1, m: 3, cote: 2.1, date: j },
          { id: '3', isS: false, win: true, n: 'SIMPLE', m: 50, cote: 3, date: j }];
        state.h = [{ id: '4', isS: true, n: 'Test Dallas', domicile: 'dom', l: 1, m: 5, cote: 1.9, date: j }];
        const P = _g45CkParis();
        g45TrVue('ck'); g45CkSous('c'); g45CkJour(j);
        const C = ((document.getElementById('g45ck') || {}).textContent || '').replace(/\s+/g, ' ');
        g45CkSous('g');
        const G = ((document.getElementById('g45ck') || {}).textContent || '').replace(/\s+/g, ' ');
        const u0 = state.u, dm = new Date(Date.now() + 864e5), jm = dm.getFullYear() + '-' + ('0' + (dm.getMonth() + 1)).slice(-2) + '-' + ('0' + dm.getDate()).slice(-2);
        state.u = [{ n: 'Test Bayern', sport: '⚽', s: 5, l: 1, note: '🏠 Victoire + Over 2.5' }];
        window._g45CkAg = { j: d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(), L: [{ t: dm.getTime(), n: 'Test Bayern', d: 1, adv: 'Leverkusen', sp: 'soccer' }] };
        g45CkSous('c'); g45CkJour(jm); if (dm.getMonth() !== d.getMonth()) g45CkMois(1), g45CkJour(jm);
        const F = ((document.getElementById('g45ck') || {}).textContent || '').replace(/\s/g, '');
        state.u = u0; window._g45CkAg = null; g45CkJour(jm); if (dm.getMonth() !== d.getMonth()) g45CkMois(-1);
        o.ckFut = (/📅1/.test(F) && /📅Prévu/.test(F) && /TestBayern🏠vsLeverkusen/.test(F) && /📌🏠Victoire\+Over2\.5/.test(F)) || F.slice(-400);
        g45CkJour(j); state.a = a0; state.h = h0; if (s0 == null) localStorage.removeItem('g45ck_sous'); else localStorage.setItem('g45ck_sous', s0); localStorage.removeItem('g45tr_vue');
        const c2 = C.replace(/\s/g, ''), g2 = G.replace(/\s/g, '');
        o.ckCal = (P.length === 3 && /📅Calendrier/.test(c2) && /\+8,5/.test(c2) && /✅TestBayern🏠vsLeverkusen·Victoire\+Over2\.5·palier2/.test(c2) && /❌TestEichel✈️/.test(c2) && /⏳TestDallas/.test(c2) && /\+8,50€/.test(c2) && !/SIMPLE/.test(c2)
          && /Bénéfice\+8,50€/.test(g2) && /50%·1\/2/.test(g2) && /P2\(TestBayern\)/.test(g2) && /TestBayern1\/1·\+11,50€/.test(g2)) || JSON.stringify({ n: P.length, C: C.slice(0, 500), G: G.slice(0, 400) });
      } catch (e) { o.ckCal = 'erreur : ' + e.message; }
      /* 20261029a — critères : redessin dans la zone VISIBLE quand une fiche cachée a aussi #g45cr */
      try {
        const S = window._g45CrS, sv = { nom: S.nom, ctx: S.ctx, lieu: S.lieu };
        const zc = document.createElement('div'); zc.style.display = 'none'; zc.innerHTML = '<div id="g45cr">cachée</div>';
        const zv = document.createElement('div'); zv.innerHTML = window._g45CrHtml('Test Vis FC');
        document.body.insertBefore(zc, document.body.firstChild); document.body.appendChild(zv);
        g45CrSet('lieu', 'ext');
        const okV = /✈️ à l'extérieur/.test(zv.textContent), okC = zc.textContent === 'cachée';
        zc.remove(); zv.remove(); Object.assign(S, sv);
        o.crVis = (okV && okC) || JSON.stringify({ okV, okC, t: zv.textContent.slice(0, 200) });
      } catch (e) { o.crVis = 'erreur : ' + e.message; }
      /* 20261028j — Séries individuelles : zone VISIBLE quand une fiche cachée a aussi sa zone */
      try {
        const zc = document.createElement('div'); zc.style.display = 'none'; zc.innerHTML = '<div id="g45-reg-box">cachée</div>';
        const zv = document.createElement('div'); zv.innerHTML = '<div id="g45-reg-box">visible</div>';
        document.body.insertBefore(zc, document.body.firstChild); document.body.appendChild(zv);
        const t = (_g45RegBoxVis() || {}).textContent; zc.remove(); zv.remove();
        o.regVis = t === 'visible' || t;
      } catch (e) { o.regVis = 'erreur : ' + e.message; }
      /* 20261028g — 📌 depuis les Séries individuelles */
      try {
        const Z = _g45RegSaisons({ dt: ['241010', '241012', '250310', '251015', '251020', '251025', '260105'], v: [0, 0, 1, 0, 1, 0, 0] }, '');
        const u0 = state.u; state.u = [{ n: 'Jack Eichel', type: 'joueur', s: 4, l: 1 }];
        const sv = Object.assign({}, _g45Reg); Object.assign(_g45Reg, { an: 2027, an0: 2027, cat: 'a', eq: '', lg: '', pep: 0, s4: 1, tri: 'pire', seuil: 1, lieu: 'd' });
        window._g45RegRows = { 77: { nom: 'Jack Eichel', s: { dt: ['251015', '251020'], v: [0, 1], pire: 1 }, lb: { btn: '🎯 Passeurs' }, se: 1, li: 'd' } };
        g45RegGarder('77'); const ps = state.u[0].ps; state.u = u0;
        Object.keys(_g45Reg).forEach(q => { if (!(q in sv)) delete _g45Reg[q]; }); Object.assign(_g45Reg, sv);
        o.regGarde = (Z.ans.join() === '2025-26,2024-25' && Z.p.join() === '2,2' && ps && ps.lib === 'Passeur' && ps.k === 'dom' && ps.p.join() === '1' && ps.tot === 1) || JSON.stringify({ Z, ps });
      } catch (e) { o.regGarde = 'erreur : ' + e.message; }
      /* 20261027j — Yards NFL, pépites NBA / NFL, outils Cockpit partagés */
      try {
        const J = { filters: [{ name: 'season', value: '2026' }], names: ['completions', 'passingYards', 'rushingYards'], events: { a: { gameDate: '2026-10-05T17:00Z' }, b: { gameDate: '2026-10-12T17:00Z' }, c: { gameDate: '2026-09-28T17:00Z' } },
          seasonTypes: [{ displayName: '2026 Regular Season', categories: [{ events: [{ eventId: 'a', stats: ['20', '1,204', '12'] }, { eventId: 'b', stats: ['18', '250', '3'] }] }, { events: [{ eventId: 'a', stats: ['20', '1204', '12'] }, { eventId: 'c', stats: ['22', '190', '0'] }] }] },
            { displayName: '2026 Preseason', categories: [{ events: [{ eventId: 'z', stats: ['1', '50', '1'] }] }] }] };
        const L = _g45NflYdLire(J, 2026), L0 = _g45NflYdLire(J, 2025);
        const pi = _g45MqPire([true, false, false, true, false]), ph = _g45MqPalHtml(3);
        const sv = Object.assign({}, _g45Reg); Object.assign(_g45Reg, { eq: '', lg: 'nfl', pep: 1 }); const pN = _g45RegPep(); _g45Reg.eq = 'x'; const pE = _g45RegPep();
        Object.keys(_g45Reg).forEach(q => { if (!(q in sv)) delete _g45Reg[q]; }); Object.assign(_g45Reg, sv);
        await g45MqSport('nfl'); const ong = !!document.getElementById('g45-nfl-onglets');
        await g45NflYd(); const HY = (document.getElementById('g45-mq-body') || {}).innerHTML || '';
        o.yards = (L.length === 3 && L[0][0].indexOf('2026-10-12') === 0 && L[0][1] === 250 && L[1][1] === 1204 && L[2][3] === 0 && L0 === null && pi === 2 && /4 paliers/.test(ph)
          && pN === true && pE === false && ong && /🏃 Course/.test(HY) && /Pépites \(50\)/.test(HY) && /Aucun classement NFL/.test(HY) && typeof g45NbaMqP === 'function') || JSON.stringify({ L, L0, pi, ph, pN, pE, ong, HY: HY.replace(/<[^>]+>/g, ' ').slice(0, 300) });
      } catch (e) { o.yards = 'erreur : ' + e.message; }
      /* 20261027k — Séries NHL sur 4 saisons + échelle de mises au choix */
      try {
        _g45RegLogs['20262027_77'] = Promise.resolve({ gameLog: [{ gameDate: '2026-10-20', goals: 1, assists: 0, points: 1, h: 1 }] });
        localStorage.setItem('g45reg4_20252026_77', JSON.stringify([['2026-04-10', 0, 1, 1, 0], ['2026-04-08', 2, 0, 2, 1]]));
        const G = await _g45RegLog4('77', '20262027'); localStorage.removeItem('g45reg4_20252026_77'); delete _g45RegLogs['20262027_77'];
        const sv = Object.assign({}, _g45Reg);
        Object.assign(_g45Reg, { an: 2027, an0: 2027, cat: 'g', eq: '', lg: '', pep: 0, s4: 1, tri: 'pire', seuil: 1, lieu: '' });
        const k = _g45RegK(); _g45Reg.mem[k] = [{ id: 1, nom: 'Quatre Saisons', eq: 'EDM', s: _g45RegCalc(G.gameLog, 'goals') }];
        const H = _g45RegHtml(); delete _g45Reg.mem[k];
        Object.keys(_g45Reg).forEach(q => { if (!(q in sv)) delete _g45Reg[q]; }); Object.assign(_g45Reg, sv);
        g45PalEtChoix('2'); const m2 = _g45F1CrPal(3).mise; g45PalEtChoix('1'); const m1 = _g45F1CrPal(3).mise;
        o.reg4 = (G.gameLog.length === 3 && G.gameLog[0].gameDate === '2026-10-20' && G.gameLog[2].goals === 2 && /\+s4$/.test(k) && /4 saisons \(2023 → 2027\)/.test(H) && /Mises :/.test(H) && />Paliers<| paliers?<\/b>/.test(H)
          && m2 === STRATS['2'][3] && m1 === STRATS['1'][3]) || JSON.stringify({ G, k, m1, m2, H: H.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300) });
      } catch (e) { o.reg4 = 'erreur : ' + e.message; }
      /* 20261027l — Séries NFL sur 4 saisons */
      try {
        _g45RegLogsN['2026_88'] = Promise.resolve({ gameLog: [{ d: '2026-10-19', goals: 1, assists: 0, points: 1, h: 1 }] });
        localStorage.setItem('g45reg4n_2025_88', JSON.stringify([['2025-12-28', 0, 0, 0], ['2025-12-21', 2, 0, 1]]));
        _g45RegLogsN['2024_88'] = Promise.resolve({ gameLog: null }); _g45RegLogsN['2023_88'] = Promise.resolve({ gameLog: [] });
        const G = await _g45RegLog4Nfl('88', 2026); localStorage.removeItem('g45reg4n_2025_88'); ['2026_88', '2024_88', '2023_88'].forEach(k => delete _g45RegLogsN[k]);
        const sv = Object.assign({}, _g45Reg); Object.assign(_g45Reg, { an: 2026, an0: 2026, cat: 'g', eq: '', lg: 'nfl', pep: 0, s4: 1, tri: 'pire', seuil: 1, lieu: '' });
        const k = _g45RegK(), S4 = _g45RegS4(); _g45Reg.mem[k] = [{ id: 1, nom: 'Td Quatre', eq: 'KC', ft: 1, s: _g45RegCalc(G.gameLog, 'goals') }];
        const H = _g45RegHtml(); delete _g45Reg.mem[k];
        Object.keys(_g45Reg).forEach(q => { if (!(q in sv)) delete _g45Reg[q]; }); Object.assign(_g45Reg, sv);
        o.reg4n = (G.gameLog.length === 3 && G.gameLog[0].d === '2026-10-19' && G.gameLog[2].goals === 2 && S4 && /\+s4$/.test(k) && /4 saisons \(2023 → 2026\)/.test(H) && />Paliers<| paliers?<\/b>/.test(H)) || JSON.stringify({ G, k, S4, H: H.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300) });
      } catch (e) { o.reg4n = 'erreur : ' + e.message; }
      /* 20261027v — Séries foot sur 4 saisons */
      try {
        _g45RegLogsF['fra.1_2026_99'] = Promise.resolve({ gameLog: [{ d: '2026-10-25', goals: 1, assists: 0, points: 1, h: 1 }] });
        localStorage.setItem('g45reg4f_fra.1_2025_99', JSON.stringify([['2026-05-10', 0, 1, 0], ['2026-05-03', 2, 0, 1]]));
        _g45RegLogsF['fra.1_2024_99'] = Promise.resolve({ gameLog: null }); _g45RegLogsF['fra.1_2023_99'] = Promise.resolve({ gameLog: [] });
        const G = await _g45RegLog4Foot('fra.1', '99', 2026); localStorage.removeItem('g45reg4f_fra.1_2025_99'); ['2026', '2024', '2023'].forEach(a => delete _g45RegLogsF['fra.1_' + a + '_99']);
        const sv = Object.assign({}, _g45Reg); Object.assign(_g45Reg, { an: 2027, an0: 2027, cat: 'g', eq: '', lg: 'fra.1', pep: 0, s4: 1, tri: 'pire', seuil: 1, lieu: '' });
        const k = _g45RegK(), S4 = _g45RegS4(); _g45Reg.mem[k] = [{ id: 1, nom: 'Foot Quatre', eq: 'PSG', ft: 1, s: _g45RegCalc(G.gameLog, 'goals') }];
        const H = _g45RegHtml(); delete _g45Reg.mem[k];
        Object.keys(_g45Reg).forEach(q => { if (!(q in sv)) delete _g45Reg[q]; }); Object.assign(_g45Reg, sv);
        o.reg4f = (G.gameLog.length === 3 && G.gameLog[2].goals === 2 && S4 && /\+s4$/.test(k) && /4 saisons \(2023-24 → 2026-27\)/.test(H) && />Paliers<| paliers?<\/b>/.test(H)) || JSON.stringify({ G, k, S4, H: H.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300) });
      } catch (e) { o.reg4f = 'erreur : ' + e.message; }
      /* 20261027m — dates de la pire série */
      try {
        const log = [['2026-01-01', 1], ['2026-01-03', 0], ['2026-01-05', 0], ['2026-01-07', 1], ['2026-01-09', 0], ['2026-01-11', 0], ['2026-01-13', 0], ['2026-01-15', 2]].map(x => ({ gameDate: x[0], goals: x[1] })).reverse();
        const R = _g45RegCalc(log, 'goals'), R2 = _g45RegSeuilS(R, 2);
        const sv = Object.assign({}, _g45Reg); Object.assign(_g45Reg, { an: 2027, an0: 2027, cat: 'g', eq: '', lg: '', pep: 0, s4: 0, tri: 'pire', seuil: 1, lieu: '' });
        const k = _g45RegK(); _g45Reg.mem[k] = [{ id: 1, nom: 'Date Test', eq: 'EDM', s: R }]; const H = _g45RegHtml(); delete _g45Reg.mem[k];
        Object.keys(_g45Reg).forEach(q => { if (!(q in sv)) delete _g45Reg[q]; }); Object.assign(_g45Reg, sv);
        o.pd = (R.pire === 3 && R.pd.join() === '260109,260113' && R2.pire === 7 && R2.pd.join() === '260101,260113' && /09\/01\/26 → 13\/01\/26/.test(H)) || JSON.stringify({ R, R2 });
      } catch (e) { o.pd = 'erreur : ' + e.message; }
      /* 20261027n — Strikeouts MLB, NBA 4 saisons, dates de pire série (Marqueurs) */
      try {
        const J = { filters: [{ name: 'season', value: '2026' }], names: ['innings', 'strikeouts'], events: { a: { gameDate: '2026-09-01T23:00Z' }, b: { gameDate: '2026-09-07T23:00Z' } },
          seasonTypes: [{ displayName: '2026 Regular Season', categories: [{ events: [{ eventId: 'a', stats: ['6.0', '7'] }, { eventId: 'b', stats: ['5.1', '4'] }] }] }, { displayName: '2026 Postseason', categories: [{ events: [{ eventId: 'p', stats: ['7', '9'] }] }] }] };
        const K = _g45MlbKLire(J, 2026), K0 = _g45MlbKLire(J, 2025);
        const pd = _g45MqPireD([{ ok: true, t: '2026-04-01' }, { ok: false, t: '2026-04-06' }, { ok: false, t: '2026-04-12' }, { ok: true, t: '2026-04-18' }]);
        const ph = _g45MqPalHtml(2, pd);
        await g45MqSport('mlb'); const ong = !!document.getElementById('g45-mlb-onglets');
        await g45MlbK(); const HK = (document.getElementById('g45-mlbk-box') || {}).innerHTML || '';
        g45MlbSim(); const cache = (document.getElementById('g45-mlbk-box') || {}).style.display;
        o.mlbK = (K.length === 2 && K[0][1] === 4 && K[1][1] === 7 && K0 === null && pd.join() === '06/04/26,12/04/26' && /06\/04\/26 → 12\/04\/26/.test(ph) && ong && /4 saisons/.test(HK) && /Pépites/.test(HK) && /Aucun classement MLB/.test(HK) && cache === 'none' && typeof g45NbaMqS4 === 'function')
          || JSON.stringify({ K, K0, pd, ong, cache, HK: HK.replace(/<[^>]+>/g, ' ').slice(0, 200) });
      } catch (e) { o.mlbK = 'erreur : ' + e.message; }
      /* 20261027o — Compétitions → NBA → 🎯 Séries individuelles (écran Marqueurs NBA dans l'onglet) */
      try {
        const d = document.createElement('div'); d.id = 'g45-nba-sr'; document.body.appendChild(d);
        window._g45NbaMqHote = 'g45-nba-sr'; await g45NbaMq(); const H = d.innerHTML; d.remove(); window._g45NbaMqHote = 'g45-mq-hote';
        o.nbaSr = (/4 saisons/.test(H) && /Pépites/.test(H) && /Points/.test(H)) || H.replace(/<[^>]+>/g, ' ').slice(0, 200);
      } catch (e) { o.nbaSr = 'erreur : ' + e.message; }
      /* 20261027u — Journées : blason retrouvé par le nom (liste des équipes de la compétition) */
      try {
        _g45CompetCache['g45compet3_soccer_tst.1_2026'] = [{ nom: 'Stade Brestois 29', court: 'Brest', logo: 'https://x.test/brest.png' }, { nom: 'OGC Nice', court: 'Nice', logo: 'https://x.test/nice.png' }];
        const d = document.createElement('div'); d.id = 'g45-nrl-liste'; document.body.appendChild(d);
        const sv = [_g45NrlMatchs, _g45NrlCtx, window._g45JrSel, window._g45JrSelCle];
        _g45NrlCtx = { sport: 'soccer', ligue: 'tst.1' }; _g45NrlMatchs = [{ id: 1, jr: 8, dom: 'Brest', ext: 'Nice', sDom: 1, sExt: 2, joue: true, date: '2026-10-23T18:45Z' }];
        g45NrlRender(); const H = d.innerHTML; d.remove(); delete _g45CompetCache['g45compet3_soccer_tst.1_2026'];
        _g45NrlMatchs = sv[0]; _g45NrlCtx = sv[1]; window._g45JrSel = sv[2]; window._g45JrSelCle = sv[3];
        o.jrLogo = (/brest\.png/.test(H) && /nice\.png/.test(H) && /Journée 8/.test(H)) || H.slice(0, 200);
      } catch (e) { o.jrLogo = 'erreur : ' + e.message; }
      try { o.ldFr = (_g45LdLibelle({ name: 'xx1', displayName: 'Points Per Game' }) === 'Points par match' && _g45LdLibelle({ name: 'xx2', displayName: 'Personal fouls per game' }) === 'Fautes par match' && _g45LdLibelle({ name: 'xx3', displayName: 'Inconnu Test' }) === 'Inconnu Test') || 'ldFr'; } catch (e) { o.ldFr = 'erreur : ' + e.message; }
      /* 20261015o — cote ≈ books FR = DraftKings − 6 %, DK gardée ; filtre cote mini sur la cote FR */
      try {
        const o2 = _g45TrCoteFr([{ m: 'X', p: 0.7, cote: 1.55, ev: 0.085 }, { m: 'Y', p: 0.6, cote: 0 }]);
        const sv = { res: _G45_TR.res, min: _G45_TR.min }, pris = [], orig = window._g45TrSuivNoter;
        window._g45TrSuivNoter = (l) => { (l || []).forEach((x) => pris.push(x.hN)); };
        _G45_TR.min = 1.5;
        _G45_TR.res = [{ m: { m: 'Victoire Aaa', p: 0.62, cote: 1.47, coteDk: 1.55, n: 10 }, hN: 'Aaa', aN: 'B', id: '1', slug: 'fra.1', deco: {} },
                       { m: { m: 'Victoire Ccc', p: 0.62, cote: 1.5, coteDk: 1.58, n: 10 }, hN: 'Ccc', aN: 'D', id: '2', slug: 'fra.1', deco: {} }];
        const H = _g45TrRender();
        window._g45TrSuivNoter = orig; Object.assign(_G45_TR, sv);
        o.trFr = (o2[0].cote === 1.46 && o2[0].coteDk === 1.55 && Math.abs(o2[0].ev - (0.7 * 1.46 - 1)) < 1e-9 && !o2[1].coteDk
          && pris.indexOf('Aaa') < 0 && pris.indexOf('Ccc') >= 0 && /BOOKS FR/.test(H) && /DK 1\.58/.test(H)) || JSON.stringify([o2, pris]);
      } catch (e) { o.trFr = 'erreur : ' + e.message; }
      /* 20261015k — tendances gardées jusqu'au match : matchs commencés retirés à la reprise */
      try {
        const n = Date.now(), F = _g45TrGardeFiltre([{ d: new Date(n + 3600e3).toISOString() }, { d: new Date(n - 60e3).toISOString() }, { d: null }], n);
        o.trGarde = (F.length === 2 && typeof _g45TrGardeSig === 'function') || JSON.stringify(F);
      } catch (e) { o.trGarde = 'erreur : ' + e.message; }
      /* 20261015i — historique OFFICIEL des Tendances : réussite sur toutes, gain à 1 € sur celles qui ont une cote */
      try {
        const C = _g45TrOffCalc([{ t: 1, r: 1, c: 2.1 }, { t: 2, r: 0, c: null }, { t: 3, r: 0, c: 1.5 }, { t: 4, r: 1, c: 1.58 }, { t: 5, r: null, c: 2 }]);
        _g45TrOff.j = { t: [{ id: '1', sl: 'nhl', t: 1, h: 'A', a: 'B', m: 'Vainqueur A', k: '1', p: .6, c: null, d: 0, r: 1 }] }; _g45TrOff.t = Date.now(); _g45TrOff.mois = '1970-01'; _g45TrOff.jour = null;
        const H = _g45TrFiabHtml();
        /* 20261017o : direct — en cours = « gagnant si ça reste », fini non jugé = « provisoire » */
        _g45TrOff.j.t.push({ id: '2', sl: 'fra.1', t: 1, h: 'C', a: 'D', m: 'Victoire C', k: '1', p: .6, c: 1.8, d: 0, r: null }, { id: '3', sl: 'fra.1', t: 1, h: 'E', a: 'F', m: 'C ou nul', k: '1N', p: .6, c: null, d: 0, r: null });
        _g45TrOff.lv = { '2': { st: 'in', h: 1, a: 0, s: '1-0', c: "67'" }, '3': { st: 'post', h: 0, a: 2, s: '0-2', c: '' } }; _g45TrOff.jour = (H.match(/g45TrOffJour\('(19[67]\d-\d\d-\d\d)/) || [])[1];
        const HL = _g45TrFiabHtml(); _g45TrOff.jour = null; _g45TrOff.lv = {}; _g45TrOff.j.t.splice(1);
        o.trLive = (/gagnant si ça reste/.test(HL) && /❌ provisoire/.test(HL) && /67'/.test(HL)) || 'direct absent';
        _g45TrOff.flt = { sp: 'ft' }; const H2 = _g45TrFiabHtml(); _g45TrOff.flt = { sp: 'hk', ty: 'vic' }; const H3 = _g45TrFiabHtml(); _g45TrOff.flt = {}; _g45TrOff.mois = null;
        o.trOff = (/g45TrOffFltOuvrir/.test(H) && /Aucune tendance avec ces filtres/.test(H2) && /2 actifs/.test(H3) && !/Aucune tendance avec ces filtres/.test(H3) && C.n === 4 && C.ok === 2 && C.nc === 3 && C.gain === 0.68 && /OFFICIEL/.test(H) && /pas de cote/.test(H) && /1 \/ 1/.test(H) && /g45TrOffJour\('19[67]\d-/.test(H) && /g45TrOffMois/.test(H) && /Courbe du gain/.test(H) && /Réussite du mois/.test(H) && /Annoncé contre réel/.test(H) && /Par type de pari/.test(H)) || JSON.stringify(C);
      } catch (e) { o.trOff = 'erreur : ' + e.message; }
      /* 20261018y — 📒 sélection du jour en haut de Tendances (notées aujourd'hui, direct, résultat) */
      try {
        const sv = _g45TrOff.j, svt = _g45TrOff.t, n = new Date().toISOString(), hier = new Date(Date.now() - 2 * 864e5).toISOString();
        _g45TrOff.j = { reglages: { min: 1.5, pmin: .6, accord: true }, t: [
          { id: '11', sl: 'ger.1', t: Date.now() - 3600e3, n: n, h: 'Bremen', a: 'Paderborn', m: 'Moins de 3,5 buts', k: 'u35', p: .672, f: .62, c: 1.56, r: null },
          { id: '12', sl: 'nhl', t: Date.now() + 3600e3, n: n, h: 'Panthers', a: 'Kraken', m: 'Moins de 6,5 buts', k: 'u65', p: .613, c: 1.69, r: null, fa: ['Panthers : moins de 6,5 buts lors de 7 de ses 10 derniers matchs (70%)'], nm: 20 },
          { id: '13', sl: 'fra.1', t: Date.now() - 864e5, n: hier, h: 'Vieux', a: 'Match', m: 'X', k: '1', p: .6, c: 1.6, r: 1 }] }; _g45TrOff.t = Date.now();
        _g45TrSel.lv = { '11': { st: 'in', h: 2, a: 1, s: '2-1', c: "67'" } };
        try { localStorage.removeItem('g45tr_sel_ferme'); } catch (e) {}
        const HS = _g45TrSelHtml();
        /* 20261021c : toucher une carte = grande carte (_g45TrCarte) avec les faits du robot, blasons / logo lus sur le scoreboard ESPN */
        const kSb = 'nhl|' + new Date(Date.now() + 3600e3 - 6 * 3600000).toISOString().slice(0, 10).replace(/-/g, '');
        _g45TrSel.ouv['12|u65'] = true; _g45TrSel.deco[kSb] = { '12': { ch: '#c8102e', ca: '#001628', lh: '', la: '', nh: 'Panthers', lgl: 'nhl.png' }, _lgl: 'nhl.png' };
        const HD = _g45TrSelHtml(); _g45TrSel.ouv = {}; _g45TrSel.deco = {};
        const dOk = /class="g45trc g45trc-av"/.test(HD) && /📈 Panthers : moins de 6,5 buts/.test(HD) && /sur 20 matchs étudiés/.test(HD) && /▴ refermer/.test(HD) && /@1.69/.test(HD) && /g45trc-lgl" src="nhl.png"/.test(HD);
        _g45TrOff.j = { t: [] }; const HV = _g45TrSelHtml();
        _g45TrOff.j = sv; _g45TrOff.t = svt; _g45TrSel.lv = {};
        o.trSel = (dOk && /Sélection du jour/.test(HS) && /2 paris/.test(HS) && /Bremen/.test(HS) && !/Vieux/.test(HS) && /gagnant si ça reste/.test(HS) && /67'/.test(HS)
          && /@1,56/.test(HS) && /📊 67 %/.test(HS) && /🏦 62 %/.test(HS) && /NHL/.test(HS) && /(arrive vers 8 h|Aucun pari)/.test(HV)) || HS.slice(0, 300);
      } catch (e) { o.trSel = 'erreur : ' + e.message; }
      /* 20261020c — Tendances en boutons : BET45 → Sélection par défaut, Historique, perso, barre toujours en tête */
      try {
        const v0 = localStorage.getItem('g45tr_vue'), s0 = localStorage.getItem('g45tr_sous'), r0 = _G45_TR.res, prem = _g45AccesPremium() === true;
        localStorage.removeItem('g45tr_vue'); localStorage.removeItem('g45tr_sous'); _G45_TR.res = null;
        const el = document.getElementById('t-tend');
        loadTendancesTab(); const a = el.getAttribute('data-g45v'), t1 = el.innerHTML, f1 = el.firstElementChild && el.firstElementChild.id;
        g45TrSous('his'); const b = el.getAttribute('data-g45v'), t2 = el.innerHTML;
        g45TrVue('perso'); await new Promise(r => setTimeout(r, 50)); const c = el.getAttribute('data-g45v'), t3 = el.innerHTML, f3 = el.firstElementChild && el.firstElementChild.id;
        const selCache = getComputedStyle(document.getElementById('g45tr-sel') || el).display === 'none' || !document.getElementById('g45tr-sel');
        if (v0 == null) localStorage.removeItem('g45tr_vue'); else localStorage.setItem('g45tr_vue', v0);
        if (s0 == null) localStorage.removeItem('g45tr_sous'); else localStorage.setItem('g45tr_sous', s0);
        _G45_TR.res = r0;
        o.trVues = (!prem || (a === 'bet-sel' && f1 === 'g45tr-nav' && /Sélection du jour/.test(t1) && /Tendances buteurs/.test(t1) && b === 'bet-his' && /📅 Historique BET45/.test(t2)
          && c === 'perso' && f3 === 'g45tr-nav' && /g45tr-onglets/.test(t3) && /g45tr-prow/.test(t3) && selCache)) || JSON.stringify({ prem, a, f1, b, c, f3, selCache, h2: /Historique BET45/.test(t2), p: /g45tr-prow/.test(t3) });
      } catch (e) { o.trVues = 'erreur : ' + e.message; }
      /* 20261020i — 🎾 Tennis dans Tendances perso + analyse (saisons simulées) */
      try {
        const v0 = localStorage.getItem('g45tr_vue'), prem = _g45AccesPremium() === true, sv = window._g45TnSaison;
        localStorage.setItem('g45tr_vue', 'perso'); localStorage.setItem('g45tr_tennis', '1');
        loadTendancesTab(); const el = document.getElementById('t-tend'), t1 = el.innerHTML;
        const now = Date.now();
        window._g45TnSaison = async (lg, id) => id === '1'
          ? [{ id: 'c1', t: now - 864e5, ek: '315-2026', tr: 'Rolex Shanghai Masters', sf: 'dur', ind: false, cat: 'm1000', adv: '2', an: 'Bob', w: true, sc: '6-4 6-4', rd: 'Round 1' }]
          : [{ id: 'c1', t: now - 864e5, ek: '315-2026', tr: 'Rolex Shanghai Masters', sf: 'dur', ind: false, cat: 'm1000', adv: '1', an: 'Alan', w: false, sc: '6-4 6-4', rd: 'Round 1' }];
        const bx = document.createElement('div'); bx.id = 'g45tn-smoke'; document.body.appendChild(bx);
        await g45TnAnalyser('g45tn-smoke', { lg: 'atp', a: { id: '1', n: 'Alan' }, b: { id: '2', n: 'Bob' }, tour: 'Rolex Shanghai Masters', ek: '' });
        await new Promise(r => setTimeout(r, 300));
        const t2 = bx.innerHTML; g45TnOnglet('g45tn-smoke', 'h2h'); const t3 = bx.innerHTML; g45TnOnglet('g45tn-smoke', 'bil'); const t4 = bx.innerHTML;
        /* 20261021o : ⚖️ Mes coefficients (+ 20261021n : surface 2 mois, tournoi précédent) */
        const c0 = localStorage.getItem('g45tn_coefs'); localStorage.removeItem('g45tn_coefs');
        g45TnOnglet('g45tn-smoke', 'cle'); g45TnCoefOuv('g45tn-smoke'); const t5 = bx.innerHTML;
        g45TnCoef('g45tn-smoke', 'dur', 'forme', 10); const t6 = bx.innerHTML, c6 = JSON.parse(localStorage.getItem('g45tn_coefs') || '{}');
        if (c0 == null) localStorage.removeItem('g45tn_coefs'); else localStorage.setItem('g45tn_coefs', c0);
        o.tnCoef = (/Mes coefficients/.test(t2) && /\(2 MOIS\)/.test(t2) && /TOURNOI PRÉCÉDENT/.test(t2) && /type="range"/.test(t5) && /BET45 standard/.test(t5)
          && /tes coefficients/.test(t6) && c6.on === true && c6.dur && c6.dur.forme === 10) || t6.replace(/<[^>]+>/g, ' ').slice(0, 400);
        bx.remove(); window._g45TnSaison = sv; localStorage.removeItem('g45tr_tennis');
        if (v0 == null) localStorage.removeItem('g45tr_vue'); else localStorage.setItem('g45tr_vue', v0);
        o.tennis = (!prem || (/g45tr-ong-tennis/.test(t1) && /g45tn-jour/.test(t1) && !/g45TrRun\(\)/.test(t1) && /g45TnLancer/.test(t1)))
          && /10 DERNIERS MATCHS/.test(t2) && /100 %/.test(t2) && /1 – 0/.test(t3) && /Alan mène/.test(t3) && /Dur/.test(t4) && /1\/0/.test(t4)
          || JSON.stringify({ prem, a: /g45tr-ong-tennis/.test(t1), b: /g45tn-jour/.test(t1), t2: t2.replace(/<[^>]+>/g,' ').slice(0, 400), t3: t3.replace(/<[^>]+>/g,' ').slice(0,300) });
      } catch (e) { o.tennis = 'erreur : ' + e.message; }
      /* 20261020l — 🤖 tennis officiel « combiné » : confiance forte + proba ≥ 60 % → noté sans cote ; scoreboard aplati pour le jugement */
      try {
        const sf = window.fetch, sv = window._g45TnSaison, t0 = new Date(Date.now() + 10 * 60e3);
        const mkC = (id, h, a, rh, ra) => ({ id, date: t0.toISOString(), status: { type: { state: 'pre' } }, competitors: [
          { id: h, homeAway: 'home', curatedRank: { current: rh }, athlete: { displayName: 'Joueur ' + h } }, { id: a, homeAway: 'away', curatedRank: { current: ra }, athlete: { displayName: 'Joueur ' + a } }] });
        const SB = { events: [{ id: '99-2026', name: 'Swiss Indoors Basel', groupings: [{ grouping: { displayName: "Men's Singles" }, competitions: [mkC('c1', 'p1', 'p2', 3, 90), mkC('c2', 'p3', 'p4', 40, 41)] }] }] };
        window.fetch = async (u) => ({ ok: true, json: async () => (/tennis\/atp\/scoreboard/.test(String(u)) ? SB : {}) });
        const now = Date.now(), M = (w, adv, j) => ({ id: 'x' + Math.random(), t: now - j * 864e5, ek: '1-2026', tr: 'Open', sf: 'dur', ind: false, cat: 'a250', adv, an: '?', w, sc: '6-4 6-4' });
        window._g45TnSaison = async (lg, id, an) => an < new Date().getFullYear() ? [] :
          id === 'p1' ? Array.from({ length: 12 }, (_, i) => M(i % 6 !== 0, 'z', i + 1)) : id === 'p2' ? Array.from({ length: 12 }, (_, i) => M(i % 3 === 0, 'z', i + 1))
          : Array.from({ length: 10 }, (_, i) => M(i % 2 === 0, 'z', i + 1));
        const N = await _g45TnRobot({ min: 1.5, pmin: 0.6 }, 10, 60000);
        /* 20261020m : cote TheRundown (worker /rundown) → c = moyenne × 0,94, cd = moyenne ; trop basse (< 1,50) → pas noté */
        let RD = { m: [{ h: 'Joueur p2', a: 'Joueur p1', ch: 2.6, ca: 1.7, n: 3 }] };
        window.fetch = async (u) => ({ ok: true, json: async () => (/\/rundown/.test(String(u)) ? RD : /tennis\/atp\/scoreboard/.test(String(u)) ? SB : {}) });
        _g45TnRdRaz(); const N2 = await _g45TnRobot({ min: 1.5, pmin: 0.6 }, 10, 60000);
        RD = { m: [{ h: 'Joueur p1', a: 'Joueur p2', ch: 1.3, ca: 3.5, n: 3 }] };
        _g45TnRdRaz(); const N3 = await _g45TnRobot({ min: 1.5, pmin: 0.6 }, 10, 60000);
        window.fetch = sf; window._g45TnSaison = sv;
        const P = _g45TnPlat({ events: [{ groupings: [{ competitions: [{ id: 'c9', status: { type: { completed: true } }, competitors: [
          { homeAway: 'home', winner: true, linescores: [{ value: 6 }, { value: 3 }, { value: 7 }] }, { homeAway: 'away', linescores: [{ value: 4 }, { value: 6 }, { value: 5 }] }] }] }] }] });
        const c9 = P.events[0].competitions[0].competitors;
        o.tnRobot = (N2.length === 1 && N2[0].cd === 1.7 && N2[0].c === 1.6 && N2[0].f > 0.5 && N3.length === 0 && N.length === 1 && N[0].id === 'c1' && N[0].k === '1' && N[0].sl === 'atp' && N[0].c === null && N[0].p >= 0.6 && /Joueur p1/.test(N[0].m)
          && P.events[0].id === 'c9' && c9[0].score === '2' && c9[1].score === '1') || JSON.stringify({ N, N2, N3, c9 });
      } catch (e) { o.tnRobot = 'erreur : ' + e.message; }
      /* 20261020o — « Analyser les matchs » tennis : 250 compris, 8 au plus sur BET45 (sans limite sur gones), gros tournois d'abord */
      try {
        const sf = window.fetch, sv = window._g45TnSaison, sa = window._g45SanteActive, t0 = Date.now() + 5 * 60e3;
        const comp = (id, k) => ({ id, date: new Date(t0 + k * 60e3).toISOString(), status: { type: { state: 'pre' } }, competitors: [
          { id: id + 'h', homeAway: 'home', curatedRank: { current: 5 }, athlete: { displayName: 'Fort ' + id } }, { id: id + 'a', homeAway: 'away', curatedRank: { current: 120 }, athlete: { displayName: 'Faible ' + id } }] });
        const ev = (nom, ids) => ({ id: nom, name: nom, groupings: [{ grouping: { displayName: "Men's Singles" }, competitions: ids.map((x, k) => comp(x, k)) }] });
        const SB = { events: [ev('Almaty Open', ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8']), ev('Swiss Indoors Basel', ['b1', 'b2']), ev('Davis Cup', ['d1'])] };
        window.fetch = async (u) => ({ ok: true, json: async () => (/tennis\/atp\/scoreboard/.test(String(u)) ? SB : {}) });
        const now = Date.now(), M = (w, j) => ({ id: 'y' + Math.random(), t: now - j * 864e5, ek: '1-2026', tr: 'Open', sf: 'dur', ind: false, cat: 'a250', adv: 'z', an: '?', w, sc: '6-4 6-4' });
        window._g45TnSaison = async (lg, id, an) => an < new Date().getFullYear() ? [] : Array.from({ length: 10 }, (_, i) => M(/h$/.test(id) ? i % 5 !== 0 : i % 3 === 0, i + 1));
        localStorage.setItem('g45tn_jour', '0'); localStorage.setItem('g45tn_pmin', '0.6'); localStorage.setItem('g45tn_conf', 'mf');
        window._g45SanteActive = () => false; await g45TnLancer(); const R1 = window._g45TnRun.res;
        window._g45SanteActive = () => true; await g45TnLancer(); const R2 = window._g45TnRun.res;
        window.fetch = sf; window._g45TnSaison = sv; window._g45SanteActive = sa;
        o.tnRun = (R1 && R1.r.length === 8 && R1.tot === 10 && R1.r[0].m.tn === 'Swiss Indoors Basel' && R1.r[1].m.tn === 'Swiss Indoors Basel'
          && R2 && R2.r.length === 10 && R1.r.every((x) => x.qui === 'a' && x.p >= 0.6)) || JSON.stringify({ n1: R1 && R1.r.length, t1: R1 && R1.tot, n2: R2 && R2.r.length, p: R1 && R1.r.map((x) => x.m.tn + ' ' + x.qui + ' ' + x.pc) });
      } catch (e) { o.tnRun = 'erreur : ' + e.message; }
      /* 20261020s — Compétitions → Tennis : en-tête niveau / surface, grand drapeau sans photo, doubles repliés, 4 filtres, 🔮 au toucher (8 / jour) */
      try {
        const sav = window._g45TnAvisMatch, sa = window._g45SanteActive, t0 = new Date(Date.now() + 10 * 60e3).toISOString();
        const fl = { href: 'https://a.espncdn.com/i/teamlogos/countries/500/sui.png', alt: 'Switzerland' };
        localStorage.setItem('g45tph1_stanwawrinka', JSON.stringify({ u: '', t: Date.now() })); localStorage.setItem('g45tph1_martinlandaluce', JSON.stringify({ u: '', t: Date.now() }));
        const pl = (id, nom, rk, ha) => ({ id, homeAway: ha, curatedRank: { current: rk }, athlete: { id, displayName: nom, shortName: nom, flag: fl } });
        window._g45TennisResData = [{ id: 'ev1', name: 'Swiss Indoors Basel', groupings: [
          { grouping: { displayName: "Men's Singles" }, competitions: [{ id: 'tr1', date: t0, venue: { indoor: true, fullName: 'Basel, Switzerland' }, status: { type: { state: 'pre' } }, competitors: [pl('1', 'Stan Wawrinka', 145, 'home'), pl('2', 'Martin Landaluce', 71, 'away')] }] },
          { grouping: { displayName: "Men's Doubles" }, competitions: [{ id: 'tr2', date: t0, status: { type: { state: 'pre' } }, competitors: [{ homeAway: 'home', roster: { displayName: 'A / B' } }, { homeAway: 'away', roster: { displayName: 'C / D' } }] }] }] }];
        window._g45TennisResOffset = 0; window._g45TennisResFilter = 'all'; window._g45TennisMajorFilter = 'all';
        let box = document.getElementById('g45-tennis-res'); if (!box) { box = document.createElement('div'); box.id = 'g45-tennis-res'; document.body.appendChild(box); }
        _g45RenderTennisRes();
        const h1 = box.innerHTML, txt = box.textContent;
        const chips = [...box.querySelectorAll('button[onclick^="g45TennisResFilter"]')].map((b) => b.textContent).join(',');
        const dblCache = box.querySelector('[onclick^="g45TnDblTgl"]'), dblDiv = dblCache && dblCache.nextElementSibling;
        const tav = box.querySelector('.g45-tav'), grandDrap = tav && tav.querySelector('img:not(.g45-tfl)'), coin = tav && tav.querySelector('.g45-tfl');
        window._g45SanteActive = () => false; localStorage.removeItem('g45tn_av8');
        window._g45TnAvisMatch = async (m) => ({ m, qui: 'a', p: 0.61, pc: 61, conf: 'moyenne' });
        await g45TnResAvis(box.querySelector('[data-g45av="tr1"]'));
        const b1 = box.querySelector('[data-g45av="tr1"]').textContent, q1 = JSON.parse(localStorage.getItem('g45tn_av8')).n;
        delete window._g45TnResAv.tr1; localStorage.setItem('g45tn_av8', JSON.stringify({ d: _g45ymd(new Date()), n: 8 }));
        _g45RenderTennisRes(); await g45TnResAvis(box.querySelector('[data-g45av="tr1"]'));
        const b2 = box.querySelector('[data-g45av="tr1"]').textContent;
        window._g45TnAvisMatch = sav; window._g45SanteActive = sa; delete window._g45TnResAv.tr1; localStorage.removeItem('g45tn_av8'); box.remove();
        o.tnRes = (chips === 'Tous,ATP,WTA,Doubles' && /ATP 500/.test(txt) && /Salle/.test(txt) && /🇨🇭/.test(txt) && /N°145/.test(txt) && !/Australian Open/.test(txt)
          && /1 match de double/.test(txt) && dblDiv && dblDiv.style.display === 'none' && grandDrap && /sui\.png/.test(grandDrap.src) && coin && coin.style.display === 'none'
          && /Wawrinka 61 %/.test(b1) && q1 === 1 && /8 avis/.test(b2)) || JSON.stringify({ chips, b1, b2, q1, g: !!grandDrap, t: txt.slice(0, 300) });
      } catch (e) { o.tnRes = 'erreur : ' + e.message; }
      /* 20261020t — Rechercher un joueur (tennis) : boutons top Elo, nom → id ESPN (search/v2), saison ESPN, plus de Tavily / IA */
      try {
        const sf = window.fetch, sv = window._g45TnSaison, sp = window._g45TnProfil, sj = window._g45TnEloJ, an = new Date().getFullYear(), now = Date.now();
        window._g45TnEloJ = { atp: { janniksinner: ['Jannik Sinner', 2290, 2230, 2180, 2100], arthurfils: ['Arthur Fils', 1900, 1890, 1850, 0] }, wta: { arynasabalenka: ['Aryna Sabalenka', 2200, 2205, 2150, 2080] } };
        localStorage.removeItem('g45tnid1_arthurfils');
        window.fetch = async (u) => ({ ok: true, json: async () => (/search\/v2/.test(String(u)) ? { results: [{ contents: [{ uid: 's:850~a:3', displayName: 'Arthur Fils', link: { web: 'https://www.espn.com/tennis/player/_/id/3' } }] }] }
          : /athletes\/3$/.test(String(u)) ? { displayName: 'Arthur Fils', flag: { href: 'https://x/fra.png' } } : {}) });
        window._g45TnProfil = async () => ({ age: 22, main: 'droitier' });
        const M = (w, j, s) => ({ id: 'q' + j, t: now - j * 864e5, tr: 'Open ' + j, sf: s, w, an: 'Adv ' + j, sc: '6-4 6-4' });
        window._g45TnSaison = async (lg, id) => id === '3' ? [M(true, 1, 'salle'), M(false, 2, 'dur'), M(true, 3, 'dur'), M(true, 4, 'terre'), M(true, 5, 'dur'), M(true, 6, 'dur'), M(false, 7, 'dur'), Object.assign(M(true, 8, 'dur'), { an: 'Bye' })] : [];
        const box = document.createElement('div'); document.body.appendChild(box);
        await loadTennisSaisons(box, 'TENNIS');
        const barre = box.textContent;
        /* 20261020u : classement par surface (Elo) sous la recherche */
        const Lt = _g45TcListe(window._g45TnEloJ, 'atp', 'terre'), Lg = _g45TcListe(window._g45TnEloJ, 'atp', 'gazon');
        const tc = box.querySelector('#g45tc-corps'); g45TcTgl(box.querySelector('[onclick^="g45TcTgl"]')); g45TcSet('sf', 'terre');
        const tcT = tc ? tc.textContent : '';
        const tcOk = tc && tc.style.display === 'block' && /Jannik Sinner/.test(tcT) && /général 1er/.test(tcT) && Lt.length === 2 && Lt[0].nom === 'Jannik Sinner' && Lt[0].e === 2180 && Lg.length === 1 && Lg[0].d === 0;
        await searchTennisPlayer('Arthur Fils');
        g45TjSf('dur'); const tSf = box.textContent; g45TjSf('tout');
        const t = box.textContent, id = JSON.parse(localStorage.getItem('g45tnid1_arthurfils') || '{}').id;
        const Cc = _g45TjCalc([M(true, 1, 'dur'), { t: new Date(an - 1, 5, 1).getTime(), w: false, sf: 'dur' }], an);
        window.fetch = sf; window._g45TnSaison = sv; window._g45TnProfil = sp; window._g45TnEloJ = sj; box.remove(); localStorage.removeItem('g45tnid1_arthurfils');
        o.tnJoueur = (tcOk && /Sinner/.test(barre) && /Sabalenka/.test(barre) && !/Paire/.test(barre) && id === '3' && /Arthur Fils/.test(t) && /22 ans/.test(t) && /N°2 Elo ATP/.test(t)
          && /5victoires/.test(t.replace(/\s/g, '')) && /71 %/.test(t) && /Salle/.test(t) && /bat Adv 1/.test(t) && /voir les 7 matchs/.test(t) && !/Tavily|Stats issues du web/.test(t)
          && !/Bye/.test(t) && /4-6 4-6/.test(t) && /Global/.test(t) && /Terre battue/.test(t) && /Derniers matchs · Dur/.test(tSf) && /3victoires2défaites60%/.test(tSf.replace(/\s/g, '')) && Cc.L.length === 1 && Cc.p === 100) || JSON.stringify({ tcOk, id, t: t.slice(0, 400), tSf: tSf.slice(-400) });
      } catch (e) { o.tnJoueur = 'erreur : ' + e.message; }
      /* 20261021a — score tennis ESPN avec tie-breaks « 6-7 (4-7) 7-6 (7-3) 7-5 » (sondé par Antoine) */
      try {
        const a = _g45TnScore('(21) Arthur Fils (FRA) bt Ignacio Buse (PER) 6-7 (4-7) 7-6 (7-3) 7-5'), b = _g45TnScore('(9) Arthur Fils (FRA) bt (5) Andrey Rublev (RUS) 6-2 7-6 (7-2)');
        const S = _g45TnSets(a, true);
        o.tnScore = (a === '6-7(4) 7-6(3) 7-5' && b === '6-2 7-6(2)' && S && S.length === 3 && S[0].tb && S[1].tb && !S[2].tb) || JSON.stringify({ a, b, S });
      } catch (e) { o.tnScore = 'erreur : ' + e.message; }
      /* 20261021b — Tendances → Tennis : score en direct « 🔴 6-4 3-2 · 2e set », meneur du set en gras */
      try {
        const m = { st: 'in', a: { n: 'Leylah Fernandez' }, b: { n: 'Aliaksandra Sasnovich' }, sa: [6, 3], sb: [4, 2] };
        const sc = _g45TnScoreLv(m).replace(/<[^>]+>/g, ''), nm = _g45TnNomsLv(m), sc0 = _g45TnScoreLv({ st: 'in', a: m.a, b: m.b, sa: [], sb: [] }).replace(/<[^>]+>/g, '');
        o.tnLv = (sc === '🔴 6-4 3-2 · 2e set' && /<b>Leylah Fernandez<\/b>/.test(nm) && sc0 === '🔴 en cours') || JSON.stringify({ sc, nm, sc0 });
      } catch (e) { o.tnLv = 'erreur : ' + e.message; }
      /* 20261021d — critères : doublé / duo-trio buteurs / double chance, match précédent, feuille de match (tirs, mi-temps, 1er but, cartons) */
      try {
        const S = window._g45CrS, P = window._g45CrPasse, sv = { nom: S.nom, ctx: S.ctx, jl: S.jl, fid: S.fid };
        S.nom = 'TestFC'; S.ctx = null; S.jl = { p1: { d: { '2026-09-01': { g: 2, a: 0 } } }, p2: { d: { '2026-09-01': { g: 1, a: 1 } } } }; S.fid = { TestFC: { '2026-09-01': 'E1' } };
        const F = _g45CrFeuille({ header: { competitions: [{ competitors: [{ id: '1', homeAway: 'home', linescores: [{ displayValue: '1' }, { displayValue: '0' }] }, { id: '2', homeAway: 'away', linescores: [{ displayValue: '0' }, { displayValue: '3' }] }] }] },
          boxscore: { teams: [{ team: { id: '2' }, statistics: [{ name: 'totalShots', displayValue: '18' }, { name: 'shotsOnTarget', displayValue: '7' }, { name: 'wonCorners', displayValue: '6' }, { name: 'yellowCards', displayValue: '0' }, { name: 'redCards', displayValue: '0' }] },
            { team: { id: '1' }, statistics: [{ name: 'totalShots', displayValue: '16' }, { name: 'shotsOnTarget', displayValue: '8' }, { name: 'wonCorners', displayValue: '3' }, { name: 'yellowCards', displayValue: '2' }, { name: 'redCards', displayValue: '0' }] }] },
          keyEvents: [{ scoringPlay: true, team: { id: '1' } }, { scoringPlay: true, team: { id: '2' } }] });
        localStorage.setItem('g45crf1_E1', JSON.stringify(F));
        const m = ['2026-09-01', 1, 3, 1]; m.pr = 'd'; const m2 = ['2026-09-01', 0, 3, 1]; m2.pr = 'v';
        const R = [P({ jo: 'p1', jm: 'dbl' }, m), !P({ jo: 'p1', jm: 'tri' }, m), P({ jo: 'p1', jo2: 'p2', jx: 'c25', jm: 'but' }, m), !P({ jo: 'p1', jo2: 'p2', jx: 'c35', jm: 'but' }, m),
          !P({ jo: 'p1', jo2: 'p2', jx: 'un', jm: 'tri' }, m), P({ jo: 'p1', jo2: 'p2', jx: 'cha', jm: 'but' }, m), P({ pm: 'd' }, m), !P({ pm: 'v' }, m),
          P({ fs: 'ov', FL: 30.5 }, m), !P({ ts: 'un', TSL: 15.5 }, m), P({ mt: 'mene' }, m), P({ mp: 'oui' }, m), P({ bo: 'cae', BL: 1.5 }, m), !P({ mp: 'oui' }, m2), P({ ts: 'ov', TSL: 17.5 }, m2)];
        /* 20261024b : buts par mi-temps (3-1, 1-0 à la pause → 1re MT 1 but, 2e MT 3 buts) ; ligne ronde égalée = remboursé (non compté) */
        const C = window._g45CrCalc;
        R.push(P({ m1: 'ov', M1L: 0.5 }, m), !P({ m1: 'ov', M1L: 1.5 }, m), P({ m1: 'un', M1L: 1.5 }, m), P({ m2: 'ov', M2L: 2.5 }, m), !P({ m2: 'un', M2L: 2.5 }, m),
          C({ m1: 'ov', M1L: 1 }, [m]).n === 0, C({ m1: 'ov', M1L: 0.5 }, [m]).ok === 1, C({ m2: 'ov', M2L: 3 }, [m]).n === 0, C({ m2: 'un', M2L: 3.5 }, [m]).ok === 1);
        /* 20261024c : lignes rondes partout — 3-1 : Over 4 seul = remboursé (non compté) ; Over 4 + Victoire = compté, gagné ; Over 4 + Défaite = perdu */
        const v1 = C({ ou: 'ov', L: 4 }, [m]), v2 = C({ ou: 'ov', L: 4, res: 'vic' }, [m]), v3 = C({ ou: 'ov', L: 4, res: 'def' }, [m]);
        R.push(v1.n === 0, v2.n === 1 && v2.ok === 1, v3.n === 1 && v3.ok === 0, C({ te: 'un', TL: 3 }, [m]).n === 0, C({ ad: 'ov', AL: 0.5 }, [m]).ok === 1, !P({ ou: 'un', L: 3 }, m));
        /* 20261024d : lignes asiatiques — 3-1 : Over 3,75 = ½ gagné (n 0,5 ok 0,5) ; Under 3,75 = ½ perdu ; Over 4,25 = ½ perdu ; Over 2,75 = gagné ;
           handicap −1,75 = ½ gagné ; −2,25 = ½ perdu ; nul 1-1 avec +0,25 = ½ gagné, avec −0,25 = ½ perdu */
        const q = (cc, mm) => { const r = C(cc, [mm]); return r.n + '|' + r.ok; }, mn = ['2026-09-01', 1, 1, 1];
        R.push(q({ ou: 'ov', L: 3.75 }, m) === '0.5|0.5', q({ ou: 'un', L: 3.75 }, m) === '0.5|0', q({ ou: 'ov', L: 4.25 }, m) === '0.5|0', q({ ou: 'ov', L: 2.75 }, m) === '1|1',
          q({ ha: 'on', HAL: -1.75 }, m) === '0.5|0.5', q({ ha: 'on', HAL: -2.25 }, m) === '0.5|0', q({ ha: 'on', HAL: 0.25 }, mn) === '0.5|0.5', q({ ha: 'on', HAL: -0.25 }, mn) === '0.5|0',
          q({ ha: 'on', HAL: 0 }, mn) === '0|0', q({ ha: 'on', HAL: 0.5 }, mn) === '1|1');
        localStorage.removeItem('g45crf1_E1'); Object.assign(S, sv);
        /* 20261021e — coupes d'Europe : Compétition = Coupe d'Europe / Les deux */
        const ouv = localStorage.getItem('g45_cr_open'); (window._g45Cr.ovTous = true);
        S.data.EuroFC = { t: Date.now(), lg: 'fra.1', tid: '1', ligue: 'Ligue 1', euEtat: 2, saisons: [{ an: 2026, ms: [['2026-08-01', 1, 1, 0]], eu: [['2026-09-17', 1, 2, 1, 0, 1, 'X', 'uefa.champions'], ['2026-10-01', 0, 0, 1, 0, 1, 'Y', 'uefa.champions']] }] };
        _g45CrHtml('EuroFC'); S.lieu = 'tout'; S.comp = 'E'; const HE = _g45CrHtml('EuroFC').replace(/<[^>]+>/g, ' '); S.comp = 'T'; const HT = _g45CrHtml('EuroFC').replace(/<[^>]+>/g, ' ');
        S.comp = 'L'; delete S.data.EuroFC; S.nom = ''; if (ouv == null) localStorage.removeItem('g45_cr_open'); else localStorage.setItem('g45_cr_open', ouv);
        R.push(/1\/2 · 50 %/.test(HE) && /coupes d'Europe/.test(HE), /2\/3 · 67 %/.test(HT));
        /* 20261021e : critères = premium (compte de plus de 30 jours sans soutien → verrou) */
        const uSv = window._g45User; window._g45User = { created_at: new Date(Date.now() - 60 * 864e5).toISOString() };
        (window._g45Cr.ovTous = true); const HP = _g45CrHtml('EuroFC'); window._g45User = uSv; if (ouv == null) localStorage.removeItem('g45_cr_open'); else localStorage.setItem('g45_cr_open', ouv); S.nom = '';
        R.push(/réservé premium/.test(HP) && !/Compétition/.test(HP));
        o.crPlus = (JSON.stringify(F) === JSON.stringify([16, 18, 8, 7, 1, 0, 'h', 3, 6, 2, 0]) && R.every(Boolean)) || JSON.stringify({ F, R });
      } catch (e) { o.crPlus = 'erreur : ' + e.message; }
      /* 20261021f — panneau Saison en onglets : 🎯 Tirs (feuille de match g45crf1_), Buts par défaut */
      try {
        const sv = localStorage.getItem('g45_curseurs');
        localStorage.setItem('g45crf1_C1', JSON.stringify([15, 9, 6, 3, 1, 0, 'h', 7, 2, 1, 3])); localStorage.setItem('g45crf1_C2', JSON.stringify([11, 14, 4, 5, 0, 0, '', 4, 6, 2, 2]));
        const M = (id, dom) => ({ espnId: id, homeTeam: { name: dom ? 'Lyon' : 'Nice' }, awayTeam: { name: dom ? 'Nice' : 'Lyon' }, score: { fullTime: { home: 1, away: 0 } }, competition: { code: 'fra.1' } });
        const nous = (t) => t && t.name === 'Lyon';
        const e = _g45CursEtat(); e.tab = 'buts'; _g45CursSauver(e); const HB = _g45CursHtml([M('C1', 1), M('C2', 0)], nous, null, 'Lyon');
        e.tab = 'ti'; e.ti = { w: 'E', i: 3, s: 'A', on: true }; _g45CursSauver(e); const HT = _g45CursHtml([M('C1', 1), M('C2', 0)], nous, null, 'Lyon').replace(/<[^>]+>/g, ' ');
        if (sv == null) localStorage.removeItem('g45_curseurs'); else localStorage.setItem('g45_curseurs', sv); localStorage.removeItem('g45crf1_C1'); localStorage.removeItem('g45crf1_C2');
        /* Lyon : 15 tirs à domicile, 14 à l'extérieur → plus de 12,5 = 2/2 */
        o.cursTi = (/Nombre de buts/.test(HB) && /g45c-tabs/.test(HB) && /🎯 Tirs/.test(HB) && /Lyon : tirs/.test(HT) && /2\/2/.test(HT) && /Plus de 12,5/.test(HT)) || HT.slice(0, 400);
      } catch (e) { o.cursTi = 'erreur : ' + e.message; }
      /* 20261021k — filtre joueur hors foot : seuil 2+ (« +1,5 pointeur ») et compteur du combiné */
      try {
        localStorage.setItem('g45_jou_test', JSON.stringify({ parMatch: { E1: { p: { 9: 2 } }, E2: { p: { 9: 1 } } }, joueurs: { 9: { nom: 'Aho', tot: { p: 3 } } } }));
        _g45JouF = { cle: 'g45_jou_test', role: 'p', id: '9', nom: 'Aho', min: 2 };
        const a = _g45JouOk('E1'), b = _g45JouOk('E2'), c = _g45JouOk('E3'); _g45JouF.min = 1; const d = _g45JouOk('E2');
        _g45JouF = null; localStorage.removeItem('g45_jou_test');
        o.jouMin = (a === true && b === false && c === null && d === true && _g45JouOk('E1') === null) || JSON.stringify({ a, b, c, d });
      } catch (e) { o.jouMin = 'erreur : ' + e.message; }
      /* 20261017q — 🏠 / ✈️ pari par lieu + club du joueur (formulaire du mur et « Modifier ») */
      try {
        const C1 = _g45UfCompose('Edmonton Oilers', 'en forme', 'buteur', '2 points'), C2 = _g45UfCompose('', '', 'victoire', 'Victoire');
        const D1 = _g45UfDecoupe(C1), D2 = _g45UfDecoupe('🏠/✈️ victoire'), D3 = _g45UfDecoupe('🏠 victoire+under 3.5');
        await new Promise(r => setTimeout(r, 1600));
        const n0 = state.u.length;
        document.getElementById('u-type-joueur').click(); await new Promise(r => setTimeout(r, 50));
        const vis = document.getElementById('g45uf-club-u').style.display !== 'none';
        document.getElementById('u-name').value = 'Testeur Joueur'; document.getElementById('u-club').value = 'Edmonton Oilers';
        document.getElementById('u-pdom').value = 'buteur'; document.getElementById('u-pext').value = 'buteur'; document.getElementById('u-note').value = '';
        addUnit();
        const nu = state.u[state.u.length - 1];
        const okAdd = state.u.length === n0 + 1 && nu.club === 'Edmonton Oilers' && nu.note === 'Edmonton Oilers 🏠/✈️ buteur' && _g45UClub(nu) === 'Edmonton Oilers';
        editUnit(state.u.length - 1);
        const okEd = document.getElementById('edit-unit-club').value === 'Edmonton Oilers' && document.getElementById('edit-unit-pdom').value === 'buteur' && document.getElementById('edit-unit-note').value === '';
        document.getElementById('edit-unit-pext').value = 'passe'; saveEditUnit();
        const okSv = nu.note === 'Edmonton Oilers 🏠 buteur ✈️ passe' && _g45UClub({ type: 'joueur', note: 'Tampa Bay Lightning · ok 🏠 x' }) === 'Tampa Bay Lightning';
        state.u.pop(); document.getElementById('u-type-club').click(); try { save(); } catch (e) {}
        o.ufLieu = (C1 === 'Edmonton Oilers · en forme 🏠 buteur ✈️ 2 points' && C2 === '🏠/✈️ victoire' && D1.dom === 'buteur' && D1.ext === '2 points' && D1.avant === 'Edmonton Oilers · en forme'
          && D2.dom === 'victoire' && D2.ext === 'victoire' && D3.dom === 'victoire+under 3.5' && D3.ext === '' && okAdd && okEd && okSv && vis) || JSON.stringify({ vis, C1, C2, D1, D2, D3, okAdd, okEd, okSv, note: nu && nu.note });
      } catch (e) { o.ufLieu = 'erreur : ' + e.message; }
      /* 20261017s — Agenda gardé jusqu'au prochain match : 2e ouverture sans relecture */
      try {
        const elc = document.getElementById('cal-content'); let nc = 0;
        const mo = new MutationObserver(() => { if (/Chargement du calendrier|Tes matchs arrivent/.test(elc.textContent)) nc++; }); mo.observe(elc, { childList: true, subtree: true });
        await loadCalendrier(); const n1 = nc; await loadCalendrier(); const n2 = nc; mo.disconnect();
        o.agCache = (!!loadCalendrier._g45Cache && n1 >= 1 && n2 === n1) || JSON.stringify({ w: !!loadCalendrier._g45Cache, n1, n2 });
      } catch (e) { o.agCache = 'erreur : ' + e.message; }
      /* 20261017y — secours ESPN posé */
      o.espSec = (typeof window._g45EspnSecoursLire === 'function') || 'absent';
      try {
        const st = { u: [{ n: 'PSG', sport: '⚽' }, { n: 'Arsenal', sport: '⚽' }] };
        const r1 = _g45FavAppliquer(st, { n: 'Paris Saint-Germain', sport: '⚽' }, false);
        const r2 = _g45FavAppliquer(st, { n: 'Portugal', sport: '⚽', logo: 'x.png' }, false);
        const r3 = _g45FavAppliquer({ u: [{ n: 'A' }] }, { n: 'Portugal' }, true);
        o.fav = (r1 === 'deja' && r2 === 'ajout' && r3 === 'plein' && st.u.length === 3 && st.u[0].n === 'Portugal' && st.u[1].n === 'PSG' && st.fav === 'Portugal' && typeof g45FavChoisir === 'function') || JSON.stringify({ r1, r2, r3, u: st.u.map(x => x.n), f: st.fav });
      } catch (e) { o.fav = 'erreur : ' + e.message; }
      try { o.agAtt = (/g45ag-gris/.test(window._g45AgAttenteHtml()) && /Tes matchs arrivent/.test(window._g45AgAttenteHtml())) || 'rendu'; } catch (e) { o.agAtt = 'erreur : ' + e.message; }
      /* 20261015g — menu « + » en PORTRAIT : il doit s'ouvrir avec une vraie hauteur (le calage paysage l'écrasait à 17 px). */
      try {
        const pm = document.getElementById('plus-menu');
        togglePlusMenu(); pm.style.display = 'block'; await new Promise(r => setTimeout(r, 100));
        const hpm = pm.getBoundingClientRect().height;
        o.plusp = (hpm > 100 && !pm.style.getPropertyValue('top')) || ('hauteur ' + hpm + ' top ' + pm.style.top);
        pm.style.display = 'none';
      } catch (e) { o.plusp = 'erreur : ' + e.message; }
      try {
        /* 20261014e : bouton vidéo de la méthode montante dans la barre du Cockpit. */
        window._g45VidCockpitPoser();
        const bv = document.querySelector('#sub-strat > details > summary .g45-vid-cp');
        let ok = !!bv;
        if (bv) { bv.click(); const v = document.querySelector('#g45-video video source'); ok = !!v && /bet45-cockpit\.mp4/.test(v.getAttribute('src')) && !document.querySelector('#sub-strat > details').open; g45VideoFermer(); }
        o.vidcp = ok || 'bouton absent ou mauvaise vidéo';
      } catch (e) { o.vidcp = 'erreur : ' + e.message; }
      o.tkBan = (!!document.querySelector('#pc-note') === !!document.querySelector('.g45-tk-ban')) || 'encadré absent';   /* 20261013t */
      /* 20261013s — Tendances : bloc « Stats et bookmakers en désaccord » + fiabilité à part */
      try {
        const sp0 = _G45_TR.sp, r0 = _G45_TR.res, mi0 = _G45_TR.min; _G45_TR.min = 0;
        try { localStorage.setItem('g45tr_vue', 'perso'); } catch (e) {}   /* 20261020c : écran « Tendances perso » */
        g45TrSport('foot');
        const d0 = new Date(Date.now() - 6 * 3600e3).toISOString();
        const mD = { m: 'Viking FK ou nul', p: 0.61, fair: 0.13, n: 20, faits: ['Viking FK invaincu'], desac: 1, gap: null, ev: null };
        const mS = { m: 'Les deux marquent', p: 0.65, n: 20, faits: ['Galatasaray marque'], gap: null, ev: null };
        _G45_TR.res = [{ m: mD, hN: 'Viking FK', aN: 'Bayern', when: '21:00', slug: 'uefa.champions', id: 'xd1', deco: {}, d: d0 },
                       { m: mS, hN: 'Galatasaray', aN: 'Barcelona', when: '21:00', slug: 'uefa.champions', id: 'xd2', deco: {}, d: d0 }];
        loadTendancesTab();
        const t = document.getElementById('t-tend').innerHTML, prem = _g45AccesPremium() === true;
        const iD = t.indexOf('EN DÉSACCORD'), iV = t.indexOf('Viking FK ou nul'), iG = t.indexOf('Les deux marquent');
        const L = _g45TrSuivLire(), eD = L.filter(x => x.id === 'xd1')[0];
        if (eD) eD.r = 1; localStorage.setItem('g45suivtend1', JSON.stringify(L));
        const fi = _g45TrFiabHtml();
        /* 20261014m : cases Stats / Bookmakers sur chaque carte (pas en double dans le bloc désaccord), « pas de cote » sans cote ; 14n : plus de « cote à vérifier » / « % estimée » en haut à droite */
        o.trCases = ((t.match(/g45tr-cases/g) || []).length === 1 && /pas de cote/.test(t.slice(0, iD)) && !/marge retirée\) :/.test(t) && !/cote à vérifier|estimée</.test(t)) || 'cases : ' + (t.match(/g45tr-cases/g) || []).length;
        o.trDesac = (iD > 0 && iV > iD && iG > 0 && iG < iD && /13%/.test(t.slice(iD)) && eD && eD.d === 1 && eD.f === 0.13 && /En désaccord/.test(fi) && /1 \/ 1/.test(fi))
          || JSON.stringify({ iD, iV, iG, eD, fi: fi.slice(0, 200) });
        _G45_TR.sp = sp0; _G45_TR.res = r0; _G45_TR.min = mi0;
        localStorage.setItem('g45suivtend1', JSON.stringify(_g45TrSuivLire().filter(x => !/^xd/.test(x.id))));
      } catch (e) { o.trDesac = 'erreur : ' + e.message; }
      /* 20261013j — NFL : lignes ESPN (details « JAX -3 », overUnder), marchés points / handicap, fiabilité */
      try {
        const ev = { competitions: [{ competitors: [{ homeAway: 'home', team: { abbreviation: 'JAX' } }, { homeAway: 'away', team: { abbreviation: 'HOU' } }],
          odds: [{ details: 'JAX -3', overUnder: 42.5 }] }] };
        const li = _g45TrUsLignes(ev);
        const HL = [{ p: 30, c: 20 }, { p: 17, c: 20 }, { p: 24, c: 23 }, { p: 35, c: 10 }], AL = [{ p: 10, c: 27 }, { p: 21, c: 24 }, { p: 28, c: 24 }];
        const M = _g45TrUsBuild(HL, AL, 'Jaguars', 'Texans', null, li);
        const g = n => M.filter(m => m.m === n)[0];
        const hc = g('Handicap Jaguars -3'), ov = g('+ de 42,5 points');
        o.trUs = (li.tot === 42.5 && li.fav === 'h' && li.hc === 3 && hc && Math.abs(hc.p - (2 / 4 + 1 / 3) / 2) < 1e-9
          && ov && Math.abs(ov.p - (3 / 4 + 2 / 3) / 2) < 1e-9 && _g45TrSuivType('Handicap Jaguars -3', 'Jaguars', 'Texans') === 'hc1:3'
          && _g45TrSuivJuge('hc1:3', 27, 20) === true && _g45TrSuivJuge('hc1:3', 23, 20) === false && _g45TrSuivType('- de 42,5 points', 'a', 'b') === 'un42.5'
          && _g45TrSuivJuge('un42.5', 20, 20) === true) || JSON.stringify({ li, M: M.map(m => m.m + ' ' + m.p) });
      } catch (e) { o.trUs = 'erreur : ' + e.message; }
      /* 20261013n — guide de bienvenue (5 écrans) + bloc pourboire sous « Mon compte » (bet45) */
      try {
        const U0 = window._g45User; window._g45User = { id: 't', created_at: new Date(Date.now() - 18 * 864e5).toISOString() };
        let ok5 = true; for (let i = 0; i < 5; i++) { g45GuideOuvrir(i); const t = (document.getElementById('g45-guide') || {}).innerText || ''; if (!t || /undefined|NaN/.test(t)) ok5 = false; }
        const fin = /Choisir mon club/.test(document.getElementById('g45-guide').innerText);
        g45GuideFermer(); const vu = localStorage.getItem('g45_guide_vu') === '1' && !document.getElementById('g45-guide');
        localStorage.removeItem('g45_guide_vu');
        const c = document.createElement('div'); c.id = 'g45-bloc-compte'; document.getElementById('t-outils').appendChild(c);
        const sa = window._g45SanteActive; window._g45SanteActive = () => false; _g45SanteActive = window._g45SanteActive;
        _g45GuideOutilsPoser(); const g = document.getElementById('g45-bloc-guide'), gt = g ? g.innerText : '';
        window._g45SanteActive = sa; _g45SanteActive = sa; if (g) g.remove(); c.remove();
        if (U0 === undefined) delete window._g45User; else window._g45User = U0;
        o.guide = (ok5 && fin && vu && /encore 12 jours/.test(gt) && /Laisser un pourboire/.test(gt) && /Comment ça marche/.test(gt)) || JSON.stringify({ ok5, fin, vu, gt: gt.slice(0, 200) });
      } catch (e) { o.guide = 'erreur : ' + e.message; }
      /* 20261008u : assistant du Bilan — faits calculés (profit, ROI, groupes) et volet posé sous la barre des filtres. */
      try {
        const L = [{ n: 'PSG', sport: '⚽', type: 'Victoire', cote: 1.5, m: 20, win: true, date: '2026-10-05', domicile: 'dom', b: 'x' },
          { n: 'PSG', sport: '⚽', type: 'Over 2.5', cote: 1.8, m: 10, win: false, date: '2026-10-02', domicile: 'ext', b: 'x' },
          { n: 'Avalanche', sport: '🏒', type: 'Vainqueur', cote: 2, m: 10, win: true, isFreebet: true, date: '2026-09-20', b: 'x' }];
        const F = _g45BilIaFaits(L);
        o.bilIa = /TOTAL \(paris réglés\) : 3 paris, 2 gagnés \(67 %\), profit \+10\.00 €, ROI 33\.3 %/.test(F) && /- over : 1 paris/.test(F) && /- domicile : 1 paris/.test(F)
          && typeof g45BilIaEnvoyer === 'function' && typeof g45BilIaBasculer === 'function' ? true : F.slice(0, 200);
      } catch (e) { o.bilIa = 'erreur : ' + e.message; }
      /* 20261002l — accueil par sport : tuiles, filtre, NRL séparée du rugby */
      try {
        const sU = state.u, sA = state.a;
        state.u = [{ n: 'Paris Saint-Germain', sport: '⚽' }, { n: 'Lyon', sport: '⚽' }, { n: 'HC Sotchi', sport: '🏒' }, { n: 'Stade Toulousain', sport: '🏉' }, { n: 'Penrith Panthers', sport: '🏉🇦🇺' }];
        state.a = [{ n: 'Paris Saint-Germain', win: true, m: 10, cote: 2 }, { n: 'HC Sotchi', win: false, m: 1, cote: 2 }];
        window.Chart = window.Chart || function () { return { destroy() {}, update() {}, data: { datasets: [] }, options: {} }; };
        g45AccChoisir(''); try { render(); } catch (e) {} _g45AccRegrouper();
        const nbT = document.querySelectorAll('#g45-acc-zone [data-k]').length;
        const vis = () => [...document.querySelectorAll('.g45-murcard')].filter(c => c.style.display !== 'none').map(c => c.dataset.nom);
        const v0 = vis().length, txt = (document.getElementById('g45-acc-zone') || {}).innerText || '';
        g45AccChoisir('⚽'); const vf = vis(); g45AccChoisir('🏉🇦🇺'); const vn = vis(); g45AccChoisir('');
        o.accueil = (nbT === 12 /* 20261027i : MotoGP retiré */ && v0 === 0 && vf.join() === 'Paris Saint-Germain,Lyon' && vn.join() === 'Penrith Panthers'
          && /\+10,00 €/.test(txt) && /-1,00 €/.test(txt) && !document.getElementById('g45-acc-auj')) || JSON.stringify({ nbT, v0, vf, vn, txt: txt.slice(0, 200) });
        /* tuile sans équipe : sport individuel → Résultats, sport d'équipe → Compétitions */
        if (o.accueil === true) {
          window.g45F1Open = function () { window._tF1 = 1; }; window.g45CompetSport = function (k) { window._tCp = k; };
          g45AccChoisir('🏎'); const f1 = window._tF1 === 1 && document.getElementById('t-resultats').style.display === 'block';
          g45AccChoisir('🏀'); const cp = window._tCp === 'basketball' && document.getElementById('t-compet').style.display === 'block';
          if (!(f1 && cp)) o.accueil = 'tuiles sans équipe : ' + JSON.stringify({ f1, cp });
          showTab('t-dash', null);
        }
        /* 20261011b — bet45 : sport sans vrai club (carte « RUGBY » seule) → « Choisis ton club » + fenêtre ; gones45 inchangé */
        if (o.accueil === true) {
          state.u = [{ n: 'RUGBY', sport: '🏉' }, { n: 'Lyon', sport: '⚽' }];
          const U0 = window._g45User; window._g45User = { id: 't' };
          try { render(); } catch (e) {} _g45AccRegrouper();
          const tR = document.querySelector('#g45-acc-zone [data-k="🏉"]'), tF = document.querySelector('#g45-acc-zone [data-k="⚽"]');
          const okR = tR && /Choisis ton club/.test(tR.innerText) && !tR.querySelector('img'), okF = tF && !/Choisis/.test(tF.innerText);
          g45AccClub('🏉'); const fen = document.getElementById('g45-acc-club'); const okW = fen && /Stade Toulousain/.test(fen.innerText); if (fen) fen.remove();
          if (U0 === undefined) delete window._g45User; else window._g45User = U0;
          _g45AccRegrouper(); const tG = document.querySelector('#g45-acc-zone [data-k="🏉"]'), okG = tG && !/Choisis/.test(tG.innerText);
          if (!(okR && okF && okW && okG)) o.accueil = 'choisis ton club : ' + JSON.stringify({ okR, okF, okW, okG });
        }
        state.u = sU; state.a = sA; try { render(); } catch (e) {}
      } catch (e) { o.accueil = 'erreur : ' + e.message; }
      return o;
    });
    ok('Appli chargée (state)', r.state === true);
    ok('Onglets présents', r.mur === true);
    ok('Pari simple enregistré (avec joueur)', r.pariSimple === true, r.pariSimple);
    ok('Montante enregistrée', r.montante === true, r.montante);
    ok('Rendu général (render)', r.render === true, r.render);
    ok('Fenêtre de match (hors foot)', r.fenetre === true, r.fenetre);
    ok('Outils + santé des sources', r.outils === true && r.sante !== false, r.outils);
    ok('Règles gagné/perdu', r.verdict === true, r.verdict);
    ok('Avis IA (accord + mise en forme)', r.avisIa === true, r.avisIa);
    ok('Radars (VS équipes + joueur)', r.radars === true, r.radars);
    ok('KBO + Euroleague (stats, équipes du mur)', r.kbo === true, r.kbo);
    ok('Accueil par sport (tuiles + filtre)', r.accueil === true, r.accueil);
    ok('NHL avant le match (joueurs + absents + lignes)', r.nhlAv === true, r.nhlAv);
    ok('Assistant du Bilan (faits calculés)', r.bilIa === true, r.bilIa);
    ok('Tendances hockey (onglets + marchés)', r.trHockey === true, r.trHockey);
    ok('Tendances NBA / NFL (lignes ESPN, handicap)', r.trUs === true, r.trUs);
    ok('Tendances : désaccord stats / bookmakers', r.trDesac === true, r.trDesac);
    ok('Pense-bête : encadré « colle ton ticket »', r.tkBan === true, r.tkBan);
    ok('Paris En cours en cartes (simple + montante)', r.enCours === true, r.enCours);
    ok('Guide de bienvenue + pourboire', r.guide === true, r.guide);
    ok('Saisons : critères sur 4 saisons', r.cr === true, r.cr);
    ok('Saisons NHL : critères (temps réglementaire)', r.crh === true, r.crh);
    ok('Saisons NFL / NBA / MLB : critères (vainqueur)', r.crn === true, r.crn);
    ok('Saisons : buts de l\'équipe / de l\'adversaire', r.cre === true, r.cre);
    ok('Saisons rugby / NRL : critères', r.crr === true, r.crr);
    ok('Tendances : cases Stats / Bookmakers sur chaque carte', r.trCases === true, r.trCases);
    ok('Rugby : prochains matchs + coupes d\'Europe', r.rgpv === true, r.rgpv);
    ok('Prochains matchs foot : championnat même si la ligue mémorisée est la LDC', r.avl === true, r.avl);
    ok('Agenda : logos des 2 équipes en filigrane', r.agvs === true, r.agvs);
    ok('Agenda : joueurs NHL du mur', r.agj === true, r.agj);
    ok('Panne TheSportsDB : pas de boucle', r.fanp === true, r.fanp);
    ok('Joueur du mur : pas de recherche d\'équipe TheSportsDB', r.tsdbj === true, r.tsdbj);
    ok('TheSportsDB par le worker (secours direct)', r.tsdbw === true, r.tsdbw);
    ok('Cockpit : mise = palier affiché, mise tapée gardée, changer le lieu garde les champs', r.miseCk === true, r.miseCk);
    ok('Paris : règlement ½ gagné / remboursé / ½ perdu (capital au centime)', r.betAr === true, r.betAr);
    ok('📊 Bilans : par sport, sélecteur Officiel / Test / Pause, mise en ligne, bloc testeurs', r.bil === true, r.bil);
    ok('Fusionner une sauvegarde (paris gardés, capital inchangé)', r.fus === true, r.fus);
    ok('Outils : nouvelles sections + tableau des paliers', r.olift === true, r.olift);
    ok('Mur limité à 15 sur bet45', r.mur === true, r.mur);
    ok('Mur de départ bet45', r.mur2 === true, r.mur2);
    ok('Logo de la compétition (PC)', r.clogo === true, r.clogo);
    ok('Cotes en direct (règles)', r.cdir === true, r.cdir);
    ok('Bank : bookmakers / banques', r.bank === true, r.bank);
    ok('Menu + en portrait', r.plusp === true, r.plusp);
    ok('Tendances : historique officiel', r.trOff === true, r.trOff);
    ok('Tendances : historique en direct', r.trLive === true, r.trLive);
    ok('Tendances : sélection du jour', r.trSel === true, r.trSel);
    ok('Tendances : boutons BET45 / perso / buteurs / CLV', r.trVues === true, r.trVues);
    ok('Tennis : bouton Tendances + analyse (forme, H2H, bilan)', r.tennis === true, r.tennis);
    ok('Tennis officiel : combiné (confiance forte, sans cote) + jugement', r.tnRobot === true, r.tnRobot);
    ok('Tennis : Analyser les matchs (8 sur BET45, gros tournois d\'abord)', r.tnRun === true, r.tnRun);
    ok('Compétitions → Tennis : niveau, surface, drapeau, doubles, 🔮', r.tnRes === true, r.tnRes);
    ok('Tennis : Rechercher un joueur (données ESPN + Elo)', r.tnJoueur === true, r.tnJoueur);
    ok('Tennis : score avec tie-breaks (ESPN)', r.tnScore === true, r.tnScore);
    ok('Tennis : score en direct (Tendances)', r.tnLv === true, r.tnLv);
    ok('Critères : joueurs, match précédent, feuille de match', r.crPlus === true, r.crPlus);
    ok('Saison : onglets + tirs (feuille de match)', r.cursTi === true, r.cursTi);
    ok('Panneaux fermés à l\'arrivée + chargement BET45', r.ferme === true, r.ferme);
    ok('Tennis : mes coefficients + surface 2 mois + tournoi précédent', r.tnCoef === true, r.tnCoef);
    ok('Sélection du jour : celle de la veille gardée après minuit', r.selHier === true, r.selHier);
    ok('Tennis : tournois en salle reconnus + contrecoup hors standard', r.salle === true, r.salle);
    ok('Tennis : âge + bilan au tour du match dans l\'avis', r.tnTour === true, r.tnTour);
    ok('Critères 4 saisons US : onglet Joueurs', r.crUs === true, r.crUs);
    ok('Tennis : style de jeu (bonus polyvalent)', r.tnStyle === true, r.tnStyle);
    ok('Tennis : BET45 face au book (écart, value, ligne)', r.tnBk === true, r.tnBk);
    ok('Cyclisme : profil d\'étape (échelle 600 m, type, D+)', r.rcProf === true, r.rcProf);
    ok('Tennis : correction « % réel » en pause (brut affiché, corrigé pour le suivi)', r.tnReel === true, r.tnReel);
    ok('Tennis : bilan par surface et période (8 tournées)', r.tnPer === true, r.tnPer);
    ok('Tennis : vitesse des courts (rapprochement ville / nom, classes)', r.tnVit === true, r.tnVit);
    ok('Tennis : rang Elo / rang ATP (classement flatteur ou non)', r.tnRang === true, r.tnRang);
    ok('Tennis : service / retour (simulation tie-break, jeux) + value 1,50-2,50', r.tnSv === true, r.tnSv);
    ok('Tennis : value en test (bloc testeurs, bilan à part)', r.tnTv === true, r.tnTv);
    ok('Curseurs US : onglets Quart-temps / Contexte', r.sgQt === true, r.sgQt);
    ok('Curseurs NFL : onglet TD / FG', r.sgTd === true, r.sgTd);
    ok('Tendances officielles : octobre = période de test, hors totaux', r.trTest === true, r.trTest);
    ok('Tendances officielles : bilans par mois + total de l\'année', r.bilMois === true, r.bilMois);
    ok('Filtre joueur : 2 ou plus + combiné', r.jouMin === true, r.jouMin);
    ok('Cotes en direct NBA (DraftKings - Live Odds)', r.cdNba === true, r.cdNba);
    ok('Cotes en direct MLB / NHL (DraftKings - Live Odds)', r.cdUs === true, r.cdUs);
    ok('Mur : pari par lieu + club du joueur', r.ufLieu === true, r.ufLieu);
    ok('Agenda gardé jusqu\'au prochain match', r.agCache === true, r.agCache);
    ok('Secours ESPN posé', r.espSec === true, r.espSec);
    ok('Agenda : page d\'attente', r.agAtt === true, r.agAtt);
    ok('Équipe préférée (sans doublon)', r.fav === true, r.fav);
    ok('Tendances : cote mini = cote du marché', r.trMin === true, r.trMin);
    ok('Tendances : gardées jusqu\'au match', r.trGarde === true, r.trGarde);
    ok('Quota des cotes (son quota / tout le monde)', r.qt === true, r.qt);
    ok('Tendances : cote ≈ books FR (DK − 6 %)', r.trFr === true, r.trFr);
    ok('Cockpit : bouton vidéo de la méthode', r.vidcp === true, r.vidcp);
    ok('CLV : cotes gardées en mémoire + cartes', r.clv === true, r.clv);
    ok('Joueur NHL du mur : fiche Stats', r.nhlj === true, r.nhlj);
    ok('Joueur foot du mur : fiche refaite', r.mj === true, r.mj);
    ok('Ticket Cockpit : pari joueur → carte du joueur', r.tkj === true, r.tkj);
    ok('Ticket Cockpit : adversaire au mur → pari contre', r.tkc === true, r.tkc);
    ok('Ticket Cockpit : joueur du ticket précédent effacé', r.tkJ === true, r.tkJ);
    ok('F1 direct : meilleurs secteurs + carte 10 min après la fin', r.f1bs === true, r.f1bs);
    ok('Mur : 3 paris 🌍 / 🏠 / ✈️ + paliers par montante', r.ufTout === true, r.ufTout);
    ok('Ticket : équipe absente du mur → carte joueur de ce club', r.tkClub === true, r.tkClub);
    ok('Mur : bénéfice du mois en cours', r.mois === true, r.mois);
    ok('Surebet : cote LAY (−) + OrbitX en 1er', r.sbLay === true, r.sbLay);
    ok('Mes équipes rangées par sport', r.murSp === true, r.murSp);
    ok('NFL : drive en cours (terrain)', r.nflDr === true, r.nflDr);
    ok('Bank : abonnements (prélèvement mensuel, sans doublon, synchro)', r.abo === true, r.abo);
    ok('Bank : historique des mouvements (dépôts / retraits)', r.mvt === true, r.mvt);
    ok('Montante : une seule échelle par championnat (Liga / La Liga…)', r.lcCanon === true, r.lcCanon);
    ok('F1 : critères 4 saisons + Jouable en Cockpit (page F1 + onglet Saisons)', r.f1cr === true, r.f1cr);
    ok('NHL Séries individuelles : 🔍 Pépites (50 joueurs)', r.pep === true, r.pep);
    ok('Critères 4 saisons : Jouable en Cockpit ? (classement de la ligue)', r.crCls === true, r.crCls);
    ok('Critères : 📌 Garder sur la carte', r.garde === true, r.garde);
    ok('Séries individuelles : 📌 sur la carte du joueur', r.regGarde === true, r.regGarde);
    ok('Outils → Équipes : 🔄 Calculer mes séries', r.serie === true, r.serie);
    ok('Séries individuelles : clic redessiné dans la zone visible', r.regVis === true, r.regVis);
    ok('🔄 Calculer mes séries : joueurs NHL / foot', r.serJ === true, r.serJ);
    ok('🔄 Calculer sur une carte jamais calculée', r.serUne === true, r.serUne);
    ok('🏁 Cockpit BET45 (Tendances)', r.ck === true, r.ck);
    ok('🏁 Cockpit BET45 : calendrier et graphique', r.ckCal === true, r.ckCal);
    ok('🏁 Cockpit BET45 : jours à venir (Agenda) dans le calendrier', r.ckFut === true, r.ckFut);
    ok('Critères : sélecteurs redessinés dans la zone visible', r.crVis === true, r.crVis);
    ok('🔄 Calculer mes séries : joueur dans un pari d\'équipe', r.serJE === true, r.serJE);
    ok('NFL Yards + pépites NBA / NFL (pire série → paliers)', r.yards === true, r.yards);
    ok('Séries NHL sur 4 saisons + mises au choix', r.reg4 === true, r.reg4);
    ok('Séries NFL sur 4 saisons', r.reg4n === true, r.reg4n);
    ok('Séries foot sur 4 saisons', r.reg4f === true, r.reg4f);
    ok('Séries : dates de la pire série', r.pd === true, r.pd);
    ok('MLB Strikeouts + NBA 4 saisons + dates (Marqueurs)', r.mlbK === true, r.mlbK);
    ok('Compétitions NBA : onglet Séries individuelles', r.nbaSr === true, r.nbaSr);
    ok('Classements → Joueurs : catégories traduites', r.ldFr === true, r.ldFr);
    ok('Journées : blasons retrouvés par le nom', r.jrLogo === true, r.jrLogo);
    ok('Séries individuelles : seuil 2 ou plus', r.regs === true, r.regs);
    /* Chart.js vient d'un CDN, simulé ici : son absence n'est pas une erreur de l'appli. */
    const vraies = erreurs.filter(m => !/Chart is not defined/.test(m));
    ok('Aucune erreur JavaScript', vraies.length === 0, vraies.slice(0, 3).join(' | '));
  } catch (e) {
    ok('Ouverture de la page', false, e.message);
  }
  await navig.close(); serveur.close();
  let echecs = 0;
  resultats.forEach(([v, n, d]) => { if (!v) echecs++; console.log((v ? '✅ ' : '❌ ') + n + (!v && d ? '  → ' + d : '')); });
  console.log(echecs ? '\n' + echecs + ' échec(s) : NE PAS LIVRER.' : '\nTout est bon (' + resultats.length + ' contrôles).');
  process.exit(echecs ? 1 : 0);
});
