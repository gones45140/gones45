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
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  try {
    await page.goto('http://localhost:' + port + '/' + PAGE);
    await page.waitForTimeout(3000);
    const r = await page.evaluate(async () => {
      const o = {};
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
