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
        o.accueil = (nbT === 13 && v0 === 0 && vf.join() === 'Paris Saint-Germain,Lyon' && vn.join() === 'Penrith Panthers'
          && /\+10,00 €/.test(txt) && /-1,00 €/.test(txt) && !document.getElementById('g45-acc-auj')) || JSON.stringify({ nbT, v0, vf, vn, txt: txt.slice(0, 200) });
        /* tuile sans équipe : sport individuel → Résultats, sport d'équipe → Compétitions */
        if (o.accueil === true) {
          window.g45F1Open = function () { window._tF1 = 1; }; window.g45CompetSport = function (k) { window._tCp = k; };
          g45AccChoisir('🏎'); const f1 = window._tF1 === 1 && document.getElementById('t-resultats').style.display === 'block';
          g45AccChoisir('🏀'); const cp = window._tCp === 'basketball' && document.getElementById('t-compet').style.display === 'block';
          if (!(f1 && cp)) o.accueil = 'tuiles sans équipe : ' + JSON.stringify({ f1, cp });
          showTab('t-dash', null);
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
