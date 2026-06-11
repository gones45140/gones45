var TEAM_IDS = {
    'Bayern Munich':5,'Bayern München':5,'FC Bayern':5,
    'Borussia Dortmund':4,'BVB':4,
    'Real Madrid':86,'Real Madrid CF':86,
    'FC Barcelona':81,'Barcelona':81,'Barça':81,
    'Manchester City':65,'Man City':65,
    'Manchester United':66,'Man United':66,
    'Liverpool':64,'Liverpool FC':64,
    'Arsenal':57,'Arsenal FC':57,
    'Chelsea':61,'Chelsea FC':61,
    'Tottenham':73,'Spurs':73,
    'PSG':524,'Paris Saint-Germain':524,'Paris SG':524,
    'Juventus':109,'Juve':109,
    'Inter Milan':108,'Inter':108,'Internazionale':108,
    'AC Milan':98,'Milan':98,
    'Atletico Madrid':78,'Atletico':78,
    'Bayer Leverkusen':3,'Leverkusen':3,
    'RB Leipzig':721,'Leipzig':721,
    'Napoli':113,'SSC Napoli':113,
    'Roma':100,'AS Roma':100,
    'Lazio':110,'SS Lazio':110,
    'Sevilla':559,'FC Sevilla':559,
    'Villarreal':533,'Villarreal CF':533,
    'Benfica':1903,'SL Benfica':1903,
    'Porto':503,'FC Porto':503,
    'Ajax':678,'AFC Ajax':678,
    'PSV':674,'PSV Eindhoven':674,
    'Palmeiras':1957,'SE Palmeiras':1957,
    'Lyon':523,'Olympique Lyonnais':523,'OL':523,
    'Marseille':516,'Olympique de Marseille':516,'OM':516,
    'Monaco':548,'AS Monaco':548,
    'Lens':546,'RC Lens':546,
    'Nice':522,'OGC Nice':522,
    'Rennes':518,'Stade Rennais':518,
    'Lille':521,'LOSC':521,
    'Borussia Mönchengladbach':18,
    'Eintracht Frankfurt':19,
    'Freiburg':17,'SC Freiburg':17,
    'Wolfsburg':11,'VfL Wolfsburg':11,
    'Stuttgart':10,'VfB Stuttgart':10,
  };
var _currentUnitNom = "";
var _unitType = "club";

/* ── SAISONS ── */
var _currentSaison = localStorage.getItem('g45_saison_active') || '2526';
var SAISONS = [{id:'2526',label:'2025/26'},{id:'2627',label:'2026/27'}];

function setSaison(id) {
  if(_currentSaison === id) return;
  _currentSaison = id;
  localStorage.setItem('g45_saison_active', id);
  if(typeof loadTeamCompo === 'function') loadTeamCompo();
}

function saisonKey(base) {
  return _currentSaison + '_' + base;
}

// Migration : clés sans préfixe → 2526_
(function migrateSaisonKeys() {
  if(localStorage.getItem('g45_saison_migrated')) return;
  var toMigrate = [];
  for(var i=0;i<localStorage.length;i++){
    var k = localStorage.key(i);
    if(k && (k.startsWith('manual_stats_') || k.startsWith('squad_lastJ_')) && k.indexOf('2526_')<0 && k.indexOf('2627_')<0) {
      toMigrate.push(k);
    }
  }
  toMigrate.forEach(function(k){
    var val = localStorage.getItem(k);
    var parts = k.split('_');
    // manual_stats_{teamId}_{playerId} → manual_stats_2526_{teamId}_{playerId}
    // squad_lastJ_{teamId} → squad_lastJ_2526_{teamId}
    var newKey;
    if(k.startsWith('manual_stats_')) newKey = 'manual_stats_2526_'+k.slice('manual_stats_'.length);
    else newKey = 'squad_lastJ_2526_'+k.slice('squad_lastJ_'.length);
    localStorage.setItem(newKey, val);
    localStorage.removeItem(k);
  });
  if(toMigrate.length > 0) console.log('Migration saison: '+toMigrate.length+' clés → 2526_');
  localStorage.setItem('g45_saison_migrated', '1');
})();
var _CP_TYPES = ['Victoire','Nul','Défaite','Over 2.5','Under 2.5','BTS Oui','BTS Non','HC -1','HC +1','Mi-temps','1er buteur'];
var _chatParams = { equipe:'', lieu:'domicile', types:['Victoire','Over 2.5','BTS Oui'], champOnly:false };

var BK={
  "winamax":    {n:"Winamax",    c:"#ff2040", d:"winamax.fr"},
  "betclic":    {n:"Betclic",    c:"#00c87a", d:"betclic.fr"},
  "unibet":     {n:"Unibet",     c:"#4ebe48", d:"unibet.fr"},
  "pmu antoine":{n:"PMU Antoine",c:"#3a6fd8", d:"pmu.fr"},
  "pmu laura":  {n:"PMU Laura",  c:"#3a6fd8", d:"pmu.fr"},
  "piwi":       {n:"Piwi",       c:"#a855f7", d:""},
  "betsson":    {n:"Betsson",    c:"#f0b020", d:"betsson.com"},
  "betify":     {n:"Betify",     c:"#22d3ee", d:"betify.com"},
  "bet365":     {n:"Bet365",     c:"#d4b006", d:"bet365.com"}
};
function bkFavicon(k,sz){
  var b=bki(k);
  sz=sz||20;
  if(b.d){
    return '<img src="https://www.google.com/s2/favicons?domain='+b.d+'&sz=32" '
      +'style="width:'+sz+'px;height:'+sz+'px;border-radius:4px;object-fit:contain;" '
      +'onerror="logoErr(this)" loading="lazy">';
  }
  return '<span style="width:'+sz+'px;height:'+sz+'px;border-radius:4px;background:'+b.c+'22;display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;color:'+b.c+';">'+b.n.substring(0,2)+'</span>';
}
var DEF_BK=Object.keys(BK);
function bki(k){var lk=(k||'').toLowerCase();var cc=state.bkColors&&state.bkColors[lk];var base=BK[lk]||{n:(k||'').toUpperCase()||'—',c:'#4f5d88'};if(cc)base=Object.assign({},base,{c:cc});return base;}
function bbadge(k){
  var b=bki(k);
  var ico=b.d?'<img src="https://www.google.com/s2/favicons?domain='+b.d+'&sz=32" style="width:12px;height:12px;border-radius:2px;object-fit:contain;vertical-align:middle;margin-right:3px;" onerror="logoErr(this)" loading="lazy">':'';
  return '<span class="bbadge" style="color:'+b.c+';border-color:'+b.c+'33;background:'+b.c+'14;">'+ico+b.n+'</span>';
}

/* ── LOGOS (api-sports CDN) ── */
var LOGOS={
  "Bayern Munich":"https://media.api-sports.io/football/teams/157.png",
  "Boca Juniors": "https://media.api-sports.io/football/teams/405.png",
  "France":       "https://media.api-sports.io/football/teams/2.png",
  "Inter Milan":  "https://media.api-sports.io/football/teams/505.png",
  "Lyon":         "https://media.api-sports.io/football/teams/80.png",
  "Palmeiras":    "https://media.api-sports.io/football/teams/121.png",
  "PSG":          "https://media.api-sports.io/football/teams/85.png",
  "PSV":          "https://media.api-sports.io/football/teams/674.png",
  "Real Madrid":  "https://media.api-sports.io/football/teams/541.png",
  "Carolina Hurricanes":"https://media.api-sports.io/hockey/teams/7.png",
  "Colorado Avalanche": "https://media.api-sports.io/hockey/teams/9.png",
  "LA Dodgers":   "https://media.api-sports.io/baseball/teams/19.png"
};
var FAV_LINKS={
  "Bayern Munich":"https://www.flashscore.fr/equipe/bayern/nVp0wiqd/",
  "Boca Juniors":"https://www.flashscore.fr/equipe/boca-juniors/hMrWAFH0/",
  "France":"https://www.flashscore.fr/equipe/france/QkGeVG1n/",
  "Inter Milan":"https://www.flashscore.fr/equipe/inter/Iw7eKK25/",
  "Lyon":"https://www.flashscore.fr/equipe/lyon/2akflumR/",
  "Palmeiras":"https://www.flashscore.fr/equipe/palmeiras/hMn9FTbH/",
  "PSG":"https://www.flashscore.fr/equipe/psg/CjhkPw0k/",
  "PSV":"https://www.flashscore.fr/equipe/psv/M9UEHJWi/",
  "Real Madrid":"https://www.flashscore.fr/equipe/real-madrid/W8mj7MDD/",
  "Carolina Hurricanes":"https://www.flashscore.fr/equipe/carolina-hurricanes/Sx0gl0tm/",
  "Colorado Avalanche":"https://www.flashscore.fr/equipe/colorado-avalanche/hACAnvBa/",
  "LA Dodgers":"https://www.flashscore.fr/equipe/los-angeles-dodgers/nwPDBpVc/",
  "Marseille":"https://www.flashscore.fr/equipe/marseille/GRk7WQET/",
  "Monaco":"https://www.flashscore.fr/equipe/monaco/dOUzNP1B/",
  "Lille":"https://www.flashscore.fr/equipe/lille/fOHJ2dlA/",
  "Arsenal":"https://www.flashscore.fr/equipe/arsenal/G0g5WGBD/",
  "Liverpool":"https://www.flashscore.fr/equipe/liverpool/Ij4aLvSF/",
  "Manchester City":"https://www.flashscore.fr/equipe/manchester-city/E8Ysm0MO/",
  "Chelsea":"https://www.flashscore.fr/equipe/chelsea/hRsAdPdH/",
  "Juventus":"https://www.flashscore.fr/equipe/juventus/lB7mkbhH/",
  "AC Milan":"https://www.flashscore.fr/equipe/ac-milan/jqbDiOIS/",
  "Napoli":"https://www.flashscore.fr/equipe/napoli/KXqvBHpA/",
  "FC Barcelone":"https://www.flashscore.fr/equipe/barcelone/GOLd4Ilf/",
  "Atletico Madrid":"https://www.flashscore.fr/equipe/atletico-madrid/GlEGerKH/",
  "Flamengo":"https://www.flashscore.fr/equipe/flamengo/pNAWLFBl/",
  "River Plate":"https://www.flashscore.fr/equipe/river-plate/nUQlTZNq/"
};

function logoErr(img){
  img.style.display='none';
  var s=img.nextSibling;
  if(s)s.style.display='flex';
}
var _statFilter = 'global';
var _nhlFilter = 'global';
var _advCompFilter = 'all';
var _nhlTypeFilter = 'all'; // 'all', 'reg', 'playoffs'
var _mlbFilter = 'global';
var _nbaFilter = 'global';
var _standingsCache = {};


/* ══ DETAIL MATCH ══ */
var _matchDetailCache = {};

var _usMatchCache = {};


async function ouvrirYouTubeAvecScore(titre, date, comp) {
  // Chercher le match via football-data pour avoir le score exact
  var query = titre + ' ' + (date||'') + ' highlights';
  try {
    var teamKey = Object.keys(TEAM_IDS).find(function(k){ return titre.toLowerCase().indexOf(k.toLowerCase())>=0; });
    if(teamKey) {
      var teamId = TEAM_IDS[teamKey];
      var d = new Date(date||'');
      var ds = d.toISOString().split('T')[0];
      var data = await fdFetch('/v4/teams/'+teamId+'/matches?dateFrom='+ds+'&dateTo='+ds+'&status=FINISHED');
      if(data&&data.matches&&data.matches.length) {
        var m = data.matches[0];
        var hg = m.score&&m.score.fullTime ? m.score.fullTime.home : '?';
        var ag = m.score&&m.score.fullTime ? m.score.fullTime.away : '?';
        var home = m.homeTeam&&m.homeTeam.name||'';
        var away = m.awayTeam&&m.awayTeam.name||'';
        query = home+' '+away+' '+hg+'-'+ag+' highlights '+(comp||'');
      }
    }
  } catch(e) {}
  window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(query), '_blank');
}


function setAdvComp(ckey) {
  _advCompFilter = ckey ? (_usMatchCache[ckey]||'all') : 'all';
  var cx = window._advCtx;
  if(cx) chargerFicheAdversaire(cx.matchId, cx.advId, cx.advNom);
}

function _callUS(k){var m=_usMatchCache[k];if(m)ouvrirDetailMatchUS(m.sport,m.h,m.a,m.hs,m.as,m.d);}
function ouvrirDetailMatchUS(sport, homeTeam, awayTeam, homeScore, awayScore, date) {
  var modal = document.getElementById('match-detail-modal');
  if(!modal) {
    modal = document.createElement('div');
    modal.id = 'match-detail-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  modal.onclick = function(e){ if(e.target===modal) modal.style.display='none'; };

  var total = (homeScore||0) + (awayScore||0);
  var rc = homeScore>awayScore ? '#1ed760' : homeScore<awayScore ? '#ff4545' : '#f0b020';

  var overChecks = [];
  if(sport==='🏒') overChecks = [{l:'O5.5',ok:total>5.5,c:'#1ed760'},{l:'O6.5',ok:total>6.5,c:'#f0b020'},{l:'O7.5',ok:total>7.5,c:'#ff7b54'}];
  else if(sport==='⚾') overChecks = [{l:'O7',ok:total>7,c:'#1ed760'},{l:'O8',ok:total>8,c:'#f0b020'},{l:'O9',ok:total>9,c:'#ff7b54'}];
  else if(sport==='🏀') overChecks = [{l:'O210',ok:total>210,c:'#1ed760'},{l:'O220',ok:total>220,c:'#f0b020'},{l:'O230',ok:total>230,c:'#ff7b54'}];

  var d2 = new Date(date||'');
  var dateStr = isNaN(d2.getTime()) ? (date||'') : d2.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  var ytUrl = 'https://www.youtube.com/results?search_query='+encodeURIComponent(homeTeam+' '+awayTeam+' highlights résumé');
  var sofaQ = 'https://www.google.com/search?q='+encodeURIComponent(homeTeam+' '+awayTeam+' sofascore');
  var googleQ = 'https://www.google.com/search?q='+encodeURIComponent(homeTeam+' '+awayTeam+' '+dateStr+' résumé');

  var html = '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:16px;padding:20px;max-width:420px;width:100%;">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">';
  html += '<div style="font-size:14px;">'+sport+' <span style="font-size:10px;color:var(--t3);">'+dateStr+'</span></div>';
  html += '<button onclick="document.getElementById(\'match-detail-modal\').style.display=\'none\'" style="background:rgba(255,255,255,.06);border:1px solid var(--b2);border-radius:6px;color:var(--t2);font-size:11px;padding:4px 10px;cursor:pointer;">✕</button>';
  html += '</div>';

  html += '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:14px;">';
  html += '<div style="text-align:center;font-size:12px;font-weight:700;color:var(--t1);">'+homeTeam+'</div>';
  html += '<div style="text-align:center;font-size:36px;font-weight:900;color:'+rc+';">'+homeScore+' - '+awayScore+'</div>';
  html += '<div style="text-align:center;font-size:12px;font-weight:700;color:var(--t1);">'+awayTeam+'</div>';
  html += '</div>';

  html += '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">';
  html += '<div style="background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;"><div style="font-size:11px;font-weight:700;color:#f0b020;">'+total+' pts</div></div>';
  overChecks.forEach(function(o){
    html += '<div style="background:rgba(255,255,255,.04);border-radius:8px;padding:6px 10px;"><div style="font-size:11px;font-weight:700;color:'+(o.ok?o.c:'#4f5d88')+';">'+o.l+(o.ok?' ✅':'')+'</div></div>';
  });
  html += '</div>';

  html += '<div style="display:flex;gap:8px;margin-bottom:8px;">';
  html += '<a href="'+sofaQ+'" target="_blank" style="flex:1;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(255,107,54,.15);border:1px solid rgba(255,107,54,.3);border-radius:10px;text-decoration:none;color:#ff7b54;font-size:12px;font-weight:700;">⚡ Sofascore</a>';
  html += '<a href="'+googleQ+'" target="_blank" style="flex:1;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(77,132,255,.15);border:1px solid rgba(77,132,255,.3);border-radius:10px;text-decoration:none;color:#4d84ff;font-size:12px;font-weight:700;">🔍 Résumé</a>';
  html += '</div>';
  html += '<a href="'+ytUrl+'" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;background:rgba(255,0,0,.15);border:1px solid rgba(255,0,0,.3);border-radius:10px;text-decoration:none;color:#ff4545;font-size:12px;font-weight:700;">▶️ Voir sur YouTube</a>';
  html += '</div>';
  modal.innerHTML = html;
}



async function ouvrirDetailMatch(matchId) {
  if(!matchId) return;

  // Afficher modal de chargement
  var modal = document.getElementById('match-detail-modal');
  if(!modal) {
    modal = document.createElement('div');
    modal.id = 'match-detail-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
    document.body.appendChild(modal);
  }
  modal.innerHTML = '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:16px;padding:24px;max-width:420px;width:100%;text-align:center;"><div style="font-size:24px;margin-bottom:8px;">⏳</div><div style="color:var(--t3);font-size:12px;">Chargement du match...</div></div>';
  modal.style.display = 'flex';
  modal.onclick = function(e){ if(e.target===modal) modal.style.display='none'; };

  try {
    var data;
    if(_matchDetailCache[matchId]) {
      data = _matchDetailCache[matchId];
    } else {
      var resp = await fdFetch('/v4/matches/'+matchId);
      if(!resp || !resp.homeTeam) { modal.innerHTML = '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:16px;padding:24px;max-width:420px;width:100%;text-align:center;"><div style="color:#ff4545;">❌ Match non disponible</div><button onclick="document.getElementById(\'match-detail-modal\').style.display=\'none\'" style="margin-top:12px;padding:8px 16px;background:rgba(255,255,255,.06);border:1px solid var(--b2);border-radius:8px;color:var(--t2);cursor:pointer;">Fermer</button></div>'; return; }
      _matchDetailCache[matchId] = resp;
      data = resp;
    }

    renderDetailMatch(modal, data, matchId);
  } catch(e) {
    modal.innerHTML = '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:16px;padding:24px;max-width:420px;width:100%;text-align:center;"><div style="color:#ff4545;">❌ Erreur : '+e.message+'</div><button onclick="document.getElementById(\'match-detail-modal\').style.display=\'none\'" style="margin-top:12px;padding:8px 16px;background:rgba(255,255,255,.06);border:1px solid var(--b2);border-radius:8px;color:var(--t2);cursor:pointer;">Fermer</button></div>';
  }
}


/* ══ STATS MATCH API-SPORTS ══ */
var _apiMatchCache = {};

async function chargerStatsMatchApiSports(fdMatchId, homeTeamName) {
  var zone = document.getElementById('match-player-stats-'+fdMatchId);
  if(!zone) return;
  if(zone.innerHTML && zone.innerHTML.length > 10) { zone.innerHTML=''; return; }
  zone.innerHTML = '<div style="text-align:center;padding:12px;color:var(--t3);font-size:11px;">⏳ Chargement stats joueurs...</div>';

  try {
    // Trouver l'ID api-sports du match via la date et les équipes
    if(_apiMatchCache[fdMatchId]) {
      renderApiSportsStats(zone, _apiMatchCache[fdMatchId]);
      return;
    }

    // Chercher le match par équipe et date dans api-sports
    var cached = _matchDetailCache[fdMatchId];
    if(!cached) { zone.innerHTML='<div style="color:#ff4545;font-size:10px;text-align:center;">Match non chargé</div>'; return; }

    var d = new Date(cached.utcDate);
    var dateStr = d.toISOString().split('T')[0];
    
    // Chercher l'ID api-sports — essayer home ET away
    var homeNom2 = cached.homeTeam&&cached.homeTeam.name||'';
    var awayNom2 = cached.awayTeam&&cached.awayTeam.name||'';
    var teamId = API_SPORTS_IDS[homeNom2] || API_SPORTS_IDS[awayNom2] || await findApiSportsTeamId(homeNom2) || await findApiSportsTeamId(awayNom2);

    if(!teamId) { zone.innerHTML='<div style="color:var(--t3);font-size:10px;text-align:center;">Équipe non trouvée sur api-sports</div>'; return; }

    // Chercher les fixtures de cette date pour cette équipe
    var data = await apiSportsFetch('/fixtures?team='+teamId+'&date='+dateStr);
    var fixtures = data&&data.response||[];

    if(!fixtures.length) {
      zone.innerHTML='<div style="color:var(--t3);font-size:10px;text-align:center;">Match non trouvé sur api-sports</div>';
      return;
    }

    // Prendre le bon match
    var fix = fixtures[0];
    var fixtureId = fix.fixture&&fix.fixture.id;

    // Récupérer les stats joueurs ET les events ET les stats de match en parallèle
    var [playersData, statsData, eventsData] = await Promise.all([
      apiSportsFetch('/fixtures/players?fixture='+fixtureId),
      apiSportsFetch('/fixtures/statistics?fixture='+fixtureId),
      apiSportsFetch('/fixtures/events?fixture='+fixtureId)
    ]);

    _apiMatchCache[fdMatchId] = {fix:fix, players:playersData, stats:statsData, events:eventsData};
    renderApiSportsStats(zone, _apiMatchCache[fdMatchId]);

  } catch(e) {
    zone.innerHTML = '<div style="color:#ff4545;font-size:10px;text-align:center;">Erreur : '+e.message+'</div>';
  }
}

function renderApiSportsStats(zone, data) {
  var fix = data.fix||{};
  var teams = fix.teams||{};
  var homeId = teams.home&&teams.home.id;
  var awayId = teams.away&&teams.away.id;
  var homeNom = teams.home&&teams.home.name||'Dom';
  var awayNom = teams.away&&teams.away.name||'Ext';

  var html = '<div style="margin-top:10px;">';

  // Stats de match (xG, possession etc.)
  var statsResp = data.stats&&data.stats.response||[];
  if(statsResp.length) {
    var homeSt = statsResp.find(function(s){return s.team&&s.team.id===homeId;})||statsResp[0];
    var awaySt = statsResp.find(function(s){return s.team&&s.team.id===awayId;})||statsResp[1];

    if(homeSt&&awaySt) {
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">📊 Stats du match</div>';
      html += '<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:10px;">';

      var SHOW_STATS = ['Ball Possession','Expected Goals','Total Shots','Shots on Goal','Corner Kicks','Fouls','Yellow Cards'];
      SHOW_STATS.forEach(function(sn){
        var hs = (homeSt.statistics||[]).find(function(x){return x.type===sn;});
        var as2 = (awaySt.statistics||[]).find(function(x){return x.type===sn;});
        if(!hs||!as2) return;
        var hv = hs.value||0, av = as2.value||0;
        var label = sn.replace('Ball Possession','Possession').replace('Expected Goals','xG')
          .replace('Total Shots','Tirs total').replace('Shots on Goal','Tirs cadrés')
          .replace('Corner Kicks','Corners').replace('Yellow Cards','Cartons jaunes');
        var isPercent = sn==='Ball Possession';
        var hNum = parseFloat(hv)||0, aNum = parseFloat(av)||0;
        var total = hNum+aNum||1;
        var hPct = Math.round(hNum/total*100);
        html += '<div style="display:flex;align-items:center;gap:6px;padding:3px 0;">';
        html += '<div style="font-size:10px;font-weight:700;color:var(--t1);width:30px;text-align:center;">'+hv+'</div>';
        html += '<div style="flex:1;">';
        html += '<div style="font-size:8px;color:var(--t3);text-align:center;margin-bottom:2px;">'+label+'</div>';
        html += '<div style="height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden;display:flex;">';
        html += '<div style="width:'+hPct+'%;background:#4d84ff;border-radius:3px 0 0 3px;"></div>';
        html += '<div style="width:'+(100-hPct)+'%;background:#a78bfa;border-radius:0 3px 3px 0;"></div>';
        html += '</div></div>';
        html += '<div style="font-size:10px;font-weight:700;color:var(--t1);width:30px;text-align:center;">'+av+'</div>';
        html += '</tr>';
      });
      html += '</tbody></table>';
      html += '</div>';
    }
  }

  // Stats joueurs
  var playersResp = data.players&&data.players.response||[];
  if(playersResp.length) {
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">👤 Top joueurs</div>';

    // Trouver les meilleurs joueurs (par note)
    var allPlayers = [];
    playersResp.forEach(function(teamData){
      (teamData.players||[]).forEach(function(p){
        var stats = p.statistics&&p.statistics[0]||{};
        var rating = parseFloat(stats.games&&stats.games.rating||0);
        if(rating>0) allPlayers.push({
          name:p.player&&p.player.name||'?',
          photo:p.player&&p.player.photo||'',
          teamId:teamData.team&&teamData.team.id,
          rating:rating,
          goals:stats.goals&&stats.goals.total||0,
          assists:stats.goals&&stats.goals.assists||0,
          shots:stats.shots&&stats.shots.total||0,
          shotsOn:stats.shots&&stats.shots.on||0,
          minutes:stats.games&&stats.games.minutes||0,
          yellowCard:stats.cards&&stats.cards.yellow||0,
          redCard:stats.cards&&stats.cards.red||0,
        });
      });
    });

    allPlayers.sort(function(a,b){return b.rating-a.rating;});

    html += '<div style="display:flex;flex-direction:column;gap:4px;">';
    allPlayers.slice(0,8).forEach(function(p){
      var isHome = p.teamId===homeId;
      var ratingColor = p.rating>=8?'#1ed760':p.rating>=7?'#f0b020':'#ff7b54';
      html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:rgba(255,255,255,.03);border-radius:6px;border-left:2px solid '+(isHome?'#4d84ff':'#a78bfa')+'">';
      if(p.photo) html += '<img src="'+p.photo+'" style="width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0;" loading="lazy">';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-size:10px;font-weight:700;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.name+'</div>';
      html += '<div style="font-size:9px;color:var(--t3);">'+(isHome?homeNom:awayNom)+(p.minutes?' · '+p.minutes+"'":'')+' '+(p.yellowCard?'🟨':'')+(p.redCard?'🟥':'')+'</div>';
      html += '</div>';
      html += '<div style="display:flex;gap:8px;align-items:center;flex-shrink:0;">';
      if(p.goals) html += '<div style="text-align:center;"><div style="font-size:12px;font-weight:800;color:#1ed760;">'+p.goals+'</div><div style="font-size:7px;color:var(--t3);">⚽</div></div>';
      if(p.assists) html += '<div style="text-align:center;"><div style="font-size:12px;font-weight:800;color:#4d84ff;">'+p.assists+'</div><div style="font-size:7px;color:var(--t3);">🅰️</div></div>';
      if(p.shotsOn) html += '<div style="text-align:center;"><div style="font-size:11px;font-weight:700;color:var(--t3);">'+p.shotsOn+'/'+p.shots+'</div><div style="font-size:7px;color:var(--t3);">tirs</div></div>';
      html += '<div style="text-align:center;"><div style="font-size:13px;font-weight:900;color:'+ratingColor+';">'+p.rating.toFixed(1)+'</div><div style="font-size:7px;color:var(--t3);">note</div></div>';
      html += '</div></div>';
    });
    html += '</div>';
  }

  if(!statsResp.length && !playersResp.length) {
    html += '<div style="color:var(--t3);font-size:10px;text-align:center;padding:8px;">Stats non disponibles pour ce match</div>';
  }

  html += '</div>';
  zone.innerHTML = html;
}

function renderDetailMatch(modal, m, matchId) {
  // Utiliser regularTime si dispo (exclut TAB), sinon fullTime
  var hg = m.score&&m.score.regularTime ? (m.score.regularTime.home||0) : ((m.score&&m.score.regularTime?m.score.regularTime.home:m.score&&m.score.fullTime?m.score.fullTime.home:0)||0);
  var ag = m.score&&m.score.regularTime ? (m.score.regularTime.away||0) : ((m.score&&m.score.regularTime?m.score.regularTime.away:m.score&&m.score.fullTime?m.score.fullTime.away:0)||0);
  var hgHT = m.score&&m.score.halfTime ? (m.score.halfTime.home||0) : null;
  var agHT = m.score&&m.score.halfTime ? (m.score.halfTime.away||0) : null;
  // Détecter tirs aux buts
  var hasPenalties = m.score&&m.score.penalties&&(m.score.penalties.home!==null);
  var penHome = hasPenalties ? m.score.penalties.home : null;
  var penAway = hasPenalties ? m.score.penalties.away : null;
  var homeName = m.homeTeam&&m.homeTeam.name||'?';
  var awayName = m.awayTeam&&m.awayTeam.name||'?';
  var homeCrest = m.homeTeam&&m.homeTeam.crest||'';
  var awayCrest = m.awayTeam&&m.awayTeam.crest||'';
  var won = hg>ag, draw = hg===ag;
  var rc = won?'#1ed760':draw?'#f0b020':'#ff4545';
  var d = new Date(m.utcDate);
  var dateStr = d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  var comp = m.competition&&m.competition.name||'';
  var journee = m.matchday ? 'J'+m.matchday : '';
  var stade = m.venue||'';
  var arbitre = m.referees&&m.referees.length ? m.referees[0].name : '';
  var goals = (m.goals||[]).sort(function(a,b){return (a.minute||0)-(b.minute||0);});
  var bookings = (m.bookings||[]).sort(function(a,b){return (a.minute||0)-(b.minute||0);});

  var html = '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:16px;padding:20px;max-width:440px;width:100%;max-height:85vh;overflow-y:auto;">';

  // Header fermer
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">';
  html += '<div style="font-size:10px;color:var(--t3);">'+getCompIcon(comp)+' '+comp+(journee?' · '+journee:'')+'</div>';
  html += '<button onclick="document.getElementById(\'match-detail-modal\').style.display=\'none\'" style="background:rgba(255,255,255,.06);border:1px solid var(--b2);border-radius:6px;color:var(--t2);font-size:11px;padding:4px 10px;cursor:pointer;">✕</button>';
  html += '</div>';

  // Score principal
  html += '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:8px;">';
  // Dom
  html += '<div style="text-align:center;">';
  if(homeCrest) html += '<img src="'+homeCrest+'" style="width:40px;height:40px;object-fit:contain;margin-bottom:4px;" loading="lazy">';
  html += '<div style="font-size:11px;font-weight:700;color:var(--t1);">'+homeName+'</div></div>';
  // Score
  html += '<div style="text-align:center;">';
  html += '<div style="font-size:36px;font-weight:900;color:'+rc+';">'+hg+' - '+ag+'</div>';
  if(hasPenalties) html += '<div style="font-size:11px;font-weight:700;color:var(--gold);margin-top:2px;">TAB: '+penHome+' - '+penAway+'</div>';
  if(hgHT!==null) html += '<div style="font-size:10px;color:var(--t3);">(MT: '+hgHT+' - '+agHT+')</div>';
  html += '<div style="font-size:9px;color:var(--t3);margin-top:2px;">'+dateStr+'</div>';
  if(stade) html += '<div style="font-size:9px;color:var(--t3);margin-top:2px;">🏟️ '+stade+'</div>';
  if(arbitre) html += '<div style="font-size:9px;color:var(--t3);margin-top:2px;">⚽ Arbitre : '+arbitre+'</div>';
  html += '</div>';
  // Ext
  html += '<div style="text-align:center;">';
  if(awayCrest) html += '<img src="'+awayCrest+'" style="width:40px;height:40px;object-fit:contain;margin-bottom:4px;" loading="lazy">';
  html += '<div style="font-size:11px;font-weight:700;color:var(--t1);">'+awayName+'</div></div>';
  html += '</div>';

  // Buts
  if(!goals.length && !bookings.length) {
    html += '<div style="background:rgba(255,255,255,.03);border-radius:10px;padding:12px;margin-bottom:8px;text-align:center;color:var(--t3);font-size:11px;">Détail des buts non disponible sur ce plan</div>';
  }
  if(goals.length) {
    html += '<div style="background:rgba(255,255,255,.03);border-radius:10px;padding:12px;margin-bottom:8px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">⚽ Buts</div>';
    goals.forEach(function(g){
      var isHome = g.team&&g.team.id===m.homeTeam.id;
      var scorer = g.scorer&&g.scorer.name||'?';
      var assist = g.assist&&g.assist.name||'';
      var min = g.minute||'?';
      var type = g.type||'REGULAR';
      var typeIco = type==='PENALTY'?'🎯':type==='OWN_GOAL'?'🙈':'⚽';
      html += '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);">';
      if(isHome) {
        html += '<div style="flex:1;text-align:right;"><div style="font-size:11px;font-weight:700;color:var(--t1);">'+scorer+'</div>';
        if(assist) html += '<div style="font-size:9px;color:var(--t3);">p. '+assist+'</div>';
        html += '</div>';
        html += '<div style="font-size:11px;font-weight:800;color:#f0b020;min-width:32px;text-align:center;">'+min+"'</div>";
        html += '<div style="font-size:14px;min-width:20px;">'+typeIco+'</div>';
        html += '<div style="flex:1;"></div>';
      } else {
        html += '<div style="flex:1;"></div>';
        html += '<div style="font-size:14px;min-width:20px;">'+typeIco+'</div>';
        html += '<div style="font-size:11px;font-weight:800;color:#f0b020;min-width:32px;text-align:center;">'+min+"'</div>";
        html += '<div style="flex:1;"><div style="font-size:11px;font-weight:700;color:var(--t1);">'+scorer+'</div>';
        if(assist) html += '<div style="font-size:9px;color:var(--t3);">p. '+assist+'</div>';
        html += '</div>';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  // Cartons
  if(bookings.length) {
    html += '<div style="background:rgba(255,255,255,.03);border-radius:10px;padding:12px;margin-bottom:8px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">🟨 Cartons</div>';
    bookings.forEach(function(b){
      var isHome = b.team&&b.team.id===m.homeTeam.id;
      var player = b.player&&b.player.name||'?';
      var min = b.minute||'?';
      var card = b.card||'YELLOW';
      var cardIco = card==='RED'?'🟥':card==='YELLOW_RED'?'🟥🟨':'🟨';
      html += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;">';
      if(isHome) {
        html += '<div style="flex:1;text-align:right;font-size:11px;font-weight:700;color:var(--t1);">'+player+'</div>';
        html += '<div style="font-size:10px;color:var(--t3);min-width:32px;text-align:center;">'+min+"'</div>";
        html += '<div style="font-size:14px;">'+cardIco+'</div><div style="flex:1;"></div>';
      } else {
        html += '<div style="flex:1;"></div>';
        html += '<div style="font-size:14px;">'+cardIco+'</div>';
        html += '<div style="font-size:10px;color:var(--t3);min-width:32px;text-align:center;">'+min+"'</div>";
        html += '<div style="flex:1;font-size:11px;font-weight:700;color:var(--t1);">'+player+'</div>';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  // Stats rapides
  var total = hg+ag;
  html += '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">';
  [{l:'Total buts',v:total,c:'#f0b020'},{l:'MT '+hgHT+'-'+agHT,v:'',c:'#4d84ff'},{l:total>2.5?'O2.5 ✅':'U2.5',v:'',c:total>2.5?'#1ed760':'#22d3ee'},{l:hg>0&&ag>0?'BTS ✅':'No BTS',v:'',c:hg>0&&ag>0?'#a78bfa':'#4f5d88'}].forEach(function(s){
    if(s.v===''&&s.l.indexOf('null')>=0) return;
    html += '<div style="background:rgba(255,255,255,.04);border-radius:8px;padding:6px 10px;text-align:center;"><div style="font-size:11px;font-weight:700;color:'+s.c+';">'+(s.v!==''?s.v:'')+s.l+'</div></div>';
  });
  html += '</div>';

  // Boutons résumé externe
  var d2 = new Date(m.utcDate);
  var dateQuery = d2.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
  var query = encodeURIComponent(homeName+' '+awayName+' '+dateQuery+' résumé');
  var sofaQuery = encodeURIComponent(homeName+' '+awayName+' sofascore');
  var googleUrl = 'https://www.google.com/search?q='+query;
  var sofaUrl2  = 'https://www.google.com/search?q='+sofaQuery;

  var ytMatchUrl = 'https://www.youtube.com/results?search_query='+encodeURIComponent(homeName+' '+awayName+' '+d2.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})+' buts résumé highlights');

  html += '<div style="display:flex;gap:8px;margin-top:12px;">';
  html += '<a href="'+sofaUrl2+'" target="_blank" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;background:rgba(255,107,54,.15);border:1px solid rgba(255,107,54,.3);border-radius:10px;text-decoration:none;color:#ff7b54;font-size:12px;font-weight:700;">⚡ Sofascore</a>';
  html += '<a href="'+googleUrl+'" target="_blank" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;background:rgba(77,132,255,.15);border:1px solid rgba(77,132,255,.3);border-radius:10px;text-decoration:none;color:#4d84ff;font-size:12px;font-weight:700;">🔍 Résumé</a>';
  html += '</div>';
  html += '<div style="margin-top:8px;">';
  html += '<a href="'+ytMatchUrl+'" target="_blank" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;background:rgba(255,0,0,.15);border:1px solid rgba(255,0,0,.3);border-radius:10px;text-decoration:none;color:#ff4545;font-size:12px;font-weight:700;box-sizing:border-box;">▶️ Voir les buts sur YouTube</a>';

  // Bouton stats joueurs si api-sports disponible
  if(getApiSportsKey()) {
    html += '<button onclick="chargerStatsMatchApiSports(\''+matchId+'\',\''+homeName.replace(/'/g,"\\'")+'\')" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;background:rgba(30,215,96,.1);border:1px solid rgba(30,215,96,.25);border-radius:10px;color:#1ed760;font-size:12px;font-weight:700;cursor:pointer;margin-top:8px;box-sizing:border-box;">👤 Stats joueurs & xG</button>';
    html += '<div id="match-player-stats-'+matchId+'"></div>';
  }
  html += '</div>';

  html += '</div>';
  modal.innerHTML = html;
}

function toggleQuickStat(btn) {
  var stat = btn.dataset.qs;
  if(!window._quickStats) window._quickStats = ['O2.5','BTS'];
  var i = window._quickStats.indexOf(stat);
  if(i>=0) window._quickStats.splice(i,1);
  else window._quickStats.push(stat);
  loadTeamSaisons();
}


function renderScorersList(scorers, teamId, title, highlightTeam) {
  if(!scorers||!scorers.length) return '<div style="color:var(--t3);font-size:10px;text-align:center;padding:8px;">Aucune donnée</div>';
  var html = title ? '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">'+title+'</div>' : '';
  html += '<div style="display:flex;flex-direction:column;gap:3px;">';
  scorers.slice(0,20).forEach(function(sc,i){
    var p = sc.player;
    var goals = sc.goals||0;
    var assists = sc.assists||0;
    var nat = p&&p.nationality||'';
    var natCode = FLAG_CDN[nat]||null;
    var clubCrest = sc.team&&sc.team.crest||'';
    var isOur = highlightTeam && sc.team && sc.team.id===teamId;
    html += '<div style="display:flex;align-items:center;gap:7px;padding:7px 10px;background:'+(isOur?'rgba(77,132,255,.1)':'rgba(255,255,255,.02)')+';border-radius:8px;border:1px solid '+(isOur?'rgba(77,132,255,.3)':'rgba(255,255,255,.05)')+'">';
    // Rang
    html += '<div style="font-size:10px;font-weight:700;color:'+(i===0?'#f0b020':i===1?'#aaa':i===2?'#cd7f32':'#4f5d88')+';width:16px;text-align:center;flex-shrink:0;">'+(i+1)+'</div>';
    // Drapeau nationalité
    if(natCode) html += '<img src="https://flagcdn.com/w20/'+natCode+'.png" style="width:18px;height:12px;object-fit:cover;border-radius:2px;flex-shrink:0;" loading="lazy" title="'+nat+'">';
    else html += '<div style="width:18px;height:12px;flex-shrink:0;"></div>';
    // Nom + club
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="font-size:11px;font-weight:'+(isOur?'800':'600')+';color:'+(isOur?'#4d84ff':'var(--t1)')+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(p&&p.name||'?')+'</div>';
    if(sc.team) {
      html += '<div style="display:flex;align-items:center;gap:4px;margin-top:1px;">';
      if(clubCrest) html += '<img src="'+clubCrest+'" style="width:12px;height:12px;object-fit:contain;" loading="lazy">';
      html += '<div style="font-size:9px;color:var(--t3);">'+sc.team.shortName+'</div>';
      html += '</div>';
    }
    html += '</div>';
    // Stats
    html += '<div style="display:flex;gap:8px;align-items:center;flex-shrink:0;">';
    html += '<div style="text-align:center;min-width:26px;"><div style="font-size:14px;font-weight:900;color:#1ed760;">'+goals+'</div><div style="font-size:8px;color:var(--t3);">⚽</div></div>';
    if(assists>0) html += '<div style="text-align:center;min-width:26px;"><div style="font-size:14px;font-weight:900;color:#4d84ff;">'+assists+'</div><div style="font-size:8px;color:var(--t3);">🅰️</div></div>';
    html += '</div></div>';
  });
  html += '</div>';
  return html;
}

async function _loadScorers(el) {
  var nom = el.dataset.nom;
  var s = el.dataset.saison;
  el.innerHTML = '<div style="color:var(--t3);font-size:11px;text-align:center;padding:12px;">⏳ Chargement buteurs...</div>';

  var teamId = null;
  for(var k in TEAM_IDS){ if(k.toLowerCase()===nom.toLowerCase()||(nom.toLowerCase().indexOf(k.toLowerCase())>=0)){teamId=TEAM_IDS[k];break;} }
  if(!teamId){ el.innerHTML='<div style="color:var(--t3);font-size:10px;text-align:center;">Équipe non reconnue</div>'; return; }

  var cached = _saisonsCache && _saisonsCache[teamId] && _saisonsCache[teamId][s];
  var leagueCode = null;
  var euCodes = [];
  if(cached) {
    var LEAGUE_CODES = ['PL','PD','BL1','SA','FL1','PPL'];
    var EU_CODES = ['CL','EL','ECL'];
    for(var i=0;i<cached.length;i++){
      var c = cached[i].competition && cached[i].competition.code;
      if(c && LEAGUE_CODES.indexOf(c)>=0 && !leagueCode) leagueCode=c;
      if(c && EU_CODES.indexOf(c)>=0 && euCodes.indexOf(c)<0) euCodes.push(c);
    }
  }
  if(!leagueCode){ el.innerHTML='<div style="color:var(--t3);font-size:10px;text-align:center;">Ligue non disponible</div>'; return; }

  try {
    // 1 seule requête — top scorers du championnat
    var data = await fdFetch('/v4/competitions/'+leagueCode+'/scorers?season='+s+'&limit=50');
    if(!data||!data.scorers){ el.innerHTML='<div style="color:var(--t3);font-size:10px;text-align:center;">Données non disponibles</div>'; return; }

    var allScorers = data.scorers;
    var teamScorers = allScorers.filter(function(sc){ return sc.team && sc.team.id===teamId; });
    var compName = data.competition&&data.competition.name||'Championnat';

    var html = '<div style="display:flex;flex-direction:column;gap:10px;">';

    // Section 1 — Buteurs du club
    if(teamScorers.length) {
      html += '<div class="cwrap">';
      html += renderScorersList(teamScorers, teamId, '⚽ '+nom+' — Buteurs & passeurs', false);
      html += '</div>';
    }

    // Section 2 — Top 20 championnat
    html += '<div class="cwrap">';
    html += '<div id="champ-scorers-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;">🏆 Top buteurs — '+compName+'</div>';
    html += '</div>';
    html += renderScorersList(allScorers, teamId, '', true);
    html += '</div>';

    // Section 3 — Coupe d'Europe (requête séparée si disponible)
    if(euCodes.length) {
      html += '<div class="cwrap" id="eu-scorers-section">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">⭐ Coupe d\'Europe</div>';
      html += '<div id="eu-scorers-content" style="font-size:10px;color:var(--t3);text-align:center;padding:8px;cursor:pointer;background:rgba(255,255,255,.03);border-radius:6px;" onclick="_loadEuScorers(this,\''+euCodes[0]+'\',\''+s+'\','+teamId+')">⭐ Charger top buteurs Coupe d\'Europe →</div>';
      html += '</div>';
    }

    html += '</div>';
    el.outerHTML = html;

  } catch(e) {
    el.innerHTML = '<div style="color:var(--t3);font-size:10px;text-align:center;">Erreur : '+e.message+'</div>';
  }
}

async function _loadEuScorers(el, code, saison, teamId) {
  el.innerHTML = '⏳ Chargement...';
  try {
    var data = await fdFetch('/v4/competitions/'+code+'/scorers?season='+saison+'&limit=30');
    if(!data||!data.scorers){ el.innerHTML='<div style="color:var(--t3);font-size:10px;text-align:center;">Non disponible</div>'; return; }
    el.outerHTML = renderScorersList(data.scorers, teamId, '', true);
  } catch(e) {
    el.innerHTML = '<div style="color:var(--t3);font-size:10px;">Erreur</div>';
  }
}

async function _loadStd(el) {
  var nom = el.dataset.nom;
  var teamId = parseInt(el.dataset.tid);
  var saison = el.dataset.saison;
  el.innerHTML = '⏳ Chargement...';
  // Récupérer les matchs depuis le cache saison
  var matches = (_saisonsCache && _saisonsCache[teamId] && _saisonsCache[teamId][saison]) || [];
  var data = await loadStandings(nom, teamId, matches);
  if(data) {
    _standingsCache[nom+'_'+saison] = data;
    el.outerHTML = renderStandingsTable(data, teamId);
  } else {
    el.innerHTML = '<div style="color:var(--t3);font-size:10px;text-align:center;">Non disponible</div>';
  }
}

var FLAG_CDN={
  'France':'fr','Espagne':'es','Allemagne':'de','Angleterre':'gb-eng',
  'Italie':'it','Portugal':'pt','Brésil':'br','Argentine':'ar',
  'Pays-Bas':'nl','Belgique':'be','Croatie':'hr','Maroc':'ma',
  'Sénégal':'sn','Colombie':'co','Uruguay':'uy','Japon':'jp',
  'Suisse':'ch','Norvège':'no','Danemark':'dk','Mexique':'mx',
  'Canada':'ca','États-Unis':'us','Australie':'au','Iran':'ir',
  'Corée du Sud':'kr','Équateur':'ec','Autriche':'at','Algérie':'dz',
  'Égypte':'eg','Qatar':'qa','Tunisie':'tn','Ghana':'gh',
  'Arabie saoudite':'sa','Arabie Saoudite':'sa','Jordanie':'jo',
  'Nouvelle-Zélande':'nz','Panama':'pa','Suède':'se','Ukraine':'ua',
  'Turquie':'tr','Irak':'iq','Bolivie':'bo','Suriname':'sr',
  'Écosse':'gb-sct','Paraguay':'py','Haïti':'ht','Afrique du Sud':'za',
  'Cap-Vert':'cv','Curaçao':'cw','RD Congo':'cd','Ouzbékistan':'uz',
  'Bosnie-Herzégovine':'ba','Tchéquie':'cz','Irlande':'ie',
  'Pays de Galles':'gb-wls','Pologne':'pl','Serbie':'rs','Roumanie':'ro',
  'Slovaquie':'sk','Hongrie':'hu','Grèce':'gr','Côte d\'Ivoire':'ci',
  'Cameroun':'cm','Nigéria':'ng','Mali':'ml','Burkina Faso':'bf',
  'Guinée':'gn','Chili':'cl','Pérou':'pe','Venezuela':'ve',
  'Costa Rica':'cr','Honduras':'hn','Jamaïque':'jm','Guatemala':'gt',
  'Russie':'ru','Chine':'cn','Inde':'in','Islande':'is',
  'Finlande':'fi','Albanie':'al','Monténégro':'me','Géorgie':'ge',
  'Kazakhstan':'kz','Slovénie':'si','Azerbaïdjan':'az'
};
function flagUrl(name){ var c=FLAG_CDN[name]||FLAG_CDN[name.trim()]; return c?'https://flagcdn.com/w40/'+c+'.png':null; }
function flagImg(name,sz){sz=sz||20;var c=FLAG_CDN[name]||FLAG_CDN[(name||"").trim()];if(!c)return '';return '<img src="https://flagcdn.com/w40/'+c+'.png" style="width:'+sz+'px;height:'+(sz*.67)+'px;object-fit:cover;border-radius:2px;vertical-align:middle;margin-right:4px;" loading="lazy">';}
var FLAG_EMOJIS={
  'France':'🇫🇷','Espagne':'🇪🇸','Allemagne':'🇩🇪','Angleterre':'🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Italie':'🇮🇹','Portugal':'🇵🇹','Brésil':'🇧🇷','Argentine':'🇦🇷',
  'Pays-Bas':'🇳🇱','Belgique':'🇧🇪','Croatie':'🇭🇷','Maroc':'🇲🇦',
  'Sénégal':'🇸🇳','Colombie':'🇨🇴','Uruguay':'🇺🇾','Japon':'🇯🇵',
  'Suisse':'🇨🇭','Norvège':'🇳🇴','Danemark':'🇩🇰','Mexique':'🇲🇽',
  'Canada':'🇨🇦','États-Unis':'🇺🇸','Australie':'🇦🇺','Iran':'🇮🇷',
  'Corée du Sud':'🇰🇷','Équateur':'🇪🇨','Autriche':'🇦🇹','Algérie':'🇩🇿',
  'Égypte':'🇪🇬','Qatar':'🇶🇦','Tunisie':'🇹🇳','Ghana':'🇬🇭',
  'Arabie saoudite':'🇸🇦','Jordanie':'🇯🇴','Nouvelle-Zélande':'🇳🇿',
  'Panama':'🇵🇦','Suède':'🇸🇪','Ukraine':'🇺🇦','Turquie':'🇹🇷',
  'Irak':'🇮🇶','Bolivie':'🇧🇴','Suriname':'🇸🇷','Écosse':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Paraguay':'🇵🇾','Haïti':'🇭🇹','Afrique du Sud':'🇿🇦','Cap-Vert':'🇨🇻',
  'Curaçao':'🇨🇼','RD Congo':'🇨🇩','Ouzbékistan':'🇺🇿','Bosnie-Herzégovine':'🇧🇦',
  'Tchéquie':'🇨🇿','Irlande':'🇮🇪','Nouvelle-Zélande':'🇳🇿','Pays de Galles':'🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Pologne':'🇵🇱','Serbie':'🇷🇸','Roumanie':'🇷🇴','Slovaquie':'🇸🇰',
  'Hongrie':'🇭🇺','Grèce':'🇬🇷','Côte d\'Ivoire':'🇨🇮','Cameroun':'🇨🇲',
  'Nigéria':'🇳🇬','Mali':'🇲🇱','Burkina Faso':'🇧🇫','Guinée':'🇬🇳',
  'Chili':'🇨🇱','Pérou':'🇵🇪','Venezuela':'🇻🇪','États-Unis':'🇺🇸',
  'Costa Rica':'🇨🇷','Honduras':'🇭🇳','Jamaïque':'🇯🇲','Guatemala':'🇬🇹',
  'Arabie Saoudite':'🇸🇦','Asie':'🌏','Afrique':'🌍'
};
var SPORT_EMOJIS={
  'basket':'🏀','basketball':'🏀','nba':'🏀',
  'tennis':'🎾',
  'formule 1':'🏎️','formula 1':'🏎️','f1':'🏎️','formule1':'🏎️',
  'rugby':'🏉','rugby union':'🏉',
  'au nrl':'🏉','nrl':'🏉',
  'hockey':'🏒','nhl':'🏒',
  'baseball':'⚾','mlb':'⚾',
  'nfl':'🏈','football américain':'🏈','football americain':'🏈',
  'football':'⚽','foot':'⚽','soccer':'⚽',
  'golf':'⛳',
  'mma':'🥊','ufc':'🥊','boxe':'🥊',
  'natation':'🏊','cyclisme':'🚴','athlétisme':'🏃'
};
function logoHtml(name,color,abbr,sz){
  var s=sz||46;
  var fb=abbr||(name.substring(0,3).toUpperCase());
  var rgb=hexRgb(color);
  var baseStyle='width:'+s+'px;height:'+s+'px;border-radius:50%;flex-shrink:0;overflow:hidden;';

  // 1. Vrai drapeau flagcdn en priorité pour les nations
  var flagUrl2=flagUrl(name);
  if(flagUrl2){
    var fDiv='<div style="'+baseStyle+'background:rgba('+rgb+',.08);border:1px solid rgba('+rgb+',.2);display:flex;align-items:center;justify-content:center;overflow:hidden;">';
    fDiv+='<img src="'+flagUrl2+'" style="width:100%;height:100%;object-fit:cover;" loading="lazy">';
    fDiv+='</div>';
    return fDiv;
  }

  // 2. Logo URL si disponible
  var logo=LOGOS[name];
  if(logo){
    return '<div style="'+baseStyle+'background:rgba('+rgb+',.07);border:1px solid rgba('+rgb+',.18);display:flex;align-items:center;justify-content:center;">'
      +'<img src="'+logo+'" style="width:'+(s-10)+'px;height:'+(s-10)+'px;object-fit:contain;" loading="lazy" onerror="logoErr(this)">'
      +'<span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:'+color+';">'+fb+'</span>'
      +'</div>';
  }

  // 3. Emoji sport générique
  var sportEmoji=SPORT_EMOJIS[name.toLowerCase().trim()];
  if(!sportEmoji){
    var uMatch=(typeof state!=='undefined'&&state.u)?state.u.find(function(u){return u.n===name;}):null;
    if(uMatch&&uMatch.sport){
      var sportMap={'🏀':'🏀','🎾':'🎾','🏎':'🏎️','🏎️':'🏎️','🏉':'🏉','🏉🇦🇺':'🏉','🏒':'🏒','⚾':'⚾','🏈':'🏈','⚽':'⚽'};
      sportEmoji=sportMap[uMatch.sport];
    }
  }
  if(sportEmoji){
    var eSz=Math.round(s*.56);
    return '<div style="'+baseStyle+'background:rgba('+rgb+',.14);border:1px solid rgba('+rgb+',.28);display:flex;align-items:center;justify-content:center;font-size:'+eSz+'px;">'+sportEmoji+'</div>';
  }

  // 4. Fallback abbr
  return '<div style="'+baseStyle+'background:rgba('+rgb+',.14);border:1px solid rgba('+rgb+',.28);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:'+color+';">'+fb+'</div>';
}
function hexRgb(h){
  var r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
  return r+','+g+','+b;
}

/* ── PRESET TEAMS ── */
var PRESETS=[
  {n:"Bayern Munich",abbr:"FCB",color:"#dc2626",s:"4",sport:"⚽"},
  {n:"Boca Juniors", abbr:"BJR",color:"#f0b020",s:"3",sport:"⚽"},
  {n:"France",       abbr:"FRA",color:"#3b82f6",s:"4",sport:"⚽"},
  {n:"Inter Milan",  abbr:"INT",color:"#0ea5e9",s:"4",sport:"⚽"},
  {n:"Lyon",         abbr:"OL", color:"#c8a050",s:"3",sport:"⚽"},
  {n:"Palmeiras",    abbr:"PAL",color:"#22c55e",s:"3",sport:"⚽"},
  {n:"PSG",          abbr:"PSG",color:"#c8a050",s:"4",sport:"⚽"},
  {n:"PSV",          abbr:"PSV",color:"#ef4444",s:"3",sport:"⚽"},
  {n:"Real Madrid",  abbr:"RMA",color:"#94a3b8",s:"5",sport:"⚽"},
  {n:"Carolina Hurricanes",abbr:"CAR",color:"#cc0000",s:"3",sport:"🏒"},
  {n:"Colorado Avalanche", abbr:"COL",color:"#7c3aed",s:"3",sport:"🏒"},
  {n:"LA Dodgers",   abbr:"LAD",color:"#3b82f6",s:"3",sport:"⚾"}
];

/* ── STATE ── */
var state=JSON.parse(localStorage.getItem('g45v5'))||{b:{},u:[],h:[],a:[],start_bk:0,goal:0,ugoals:{},notes:{},bkColors:{}};
if(!state.ugoals)state.ugoals={};
if(!state.notes)state.notes={};
DEF_BK.forEach(function(k){if(state.b[k]===undefined)state.b[k]=0;});
PRESETS.forEach(function(pt){
  if(!state.u.find(function(u){return u.n===pt.n;}))
    state.u.push({n:pt.n,abbr:pt.abbr,color:pt.color,s:pt.s,l:1,sport:pt.sport,preset:true});
});

var STRATS={"1":[1,2,6,18,54,162,486,1458],"2":[2,4,12,36,108,324,972,2916],"3":[2,4,12,36,108,324,972,2916],"4":[5,10,30,90,270,810,2430,7290],"5":[10,20,60,180,540,1620,4860,14580]};
var PCOLS=["#4d84ff","#1ed760","#f59e0b","#a855f7","#22d3ee","#f97316","#ef4444","#ec4899","#14b8a6","#6366f1","#84cc16","#e879f9"];
/* Palette étendue pour courbes - couleurs vraiment distinctes */
var CURVE_COLS=["#4d84ff","#1ed760","#f59e0b","#a855f7","#ef4444","#22d3ee","#f97316","#ec4899","#14b8a6","#84cc16","#e879f9","#6366f1","#fbbf24","#34d399","#fb7185","#60a5fa"];
var selColor=PCOLS[0];
var AC={},GC=null,MC={},_currentTeam="";
var bilanSport='ALL';

/* ── INFO BAR MOBILE ── */
function updateInfoBar(barId, txtId, valId, label, val, color){
  var bar=$i(barId);var txt=$i(txtId);var v=$i(valId);
  if(!bar||!txt||!v)return;
  bar.style.display='flex';
  txt.textContent=label||'';
  v.textContent=val||'';
  v.style.color=color||'var(--t1)';
}

function attachTouchTooltip(canvas, chartRef, barId, txtId, valId){
  if(typeof canvas==='string'){var canvasId=canvas;canvas=$i(canvas);}
  if(!canvas)return;
  canvas.addEventListener('touchend',function(e){
    var chart=typeof chartRef==='function'?chartRef():chartRef;
    if(!chart)return;
    /* Résoudre les éléments DOM dynamiquement au moment du touch */
    var bar=$i(barId);var txt=$i(txtId);var v=$i(valId);
    var t=e.changedTouches[0];
    var r=canvas.getBoundingClientRect();
    var x=t.clientX-r.left;
    var y=t.clientY-r.top;
    try{
      var pts=chart.getElementsAtEventForMode({offsetX:x,offsetY:y},'nearest',{intersect:false},false);
      if(pts.length){
        var idx=pts[0].index;
        var ds=chart.data.datasets[pts[0].datasetIndex];
        var lbl=chart.data.labels?chart.data.labels[idx]:'';
        var val2=ds.data[idx];
        var parts=(lbl||'').split('||');
        var mainTxt=parts[0]||'Pari '+(idx+1);
        var gainTxt=parts[1]||(val2!==null?(val2>=0?'+':'')+parseFloat(val2).toFixed(2)+'€':'');
        if(chart.data.datasets.length>1){
          gainTxt=chart.data.datasets.map(function(d){
            var vv=d.data[idx];
            return vv!==null?d.label+' '+(vv>=0?'+':'')+parseFloat(vv).toFixed(2)+'€':'';
          }).filter(Boolean).join(' · ');
        }
        var col=val2>=0?'var(--g)':'var(--r)';
        if(bar&&txt&&v){
          bar.style.display='flex';
          txt.textContent=mainTxt;
          v.textContent=gainTxt;
          v.style.color=col;
        }
      }
    }catch(err){console.log(err);}
  },{passive:true});
}
var bilanMode='global';
function showBilanTab(mode,btn){
  bilanMode=mode;
  var outils=$i('t-outils');
  if(outils)outils.querySelectorAll('.gtab').forEach(function(b){if(b.id&&b.id.startsWith('btab-'))b.classList.remove('on');});
  if(btn)btn.classList.add('on');
  renderBilanTab();
}
var dtRows=[{c:2.0},{c:3.0}];

/* ── PALETTE ── */
function pal(hex){
  var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return{bg:'rgba('+r+','+g+','+b+',.08)',badge:'rgba('+r+','+g+','+b+',.14)',border:'rgba('+r+','+g+','+b+',.28)',c:hex,fade:'rgba('+r+','+g+','+b+',.12)'};
}
function gp(u){return pal(u.color||PCOLS[0]);}

/* ── UTILS ── */
function $i(id){return document.getElementById(id);}
function txt(id,v){var e=$i(id);if(e)e.innerText=v;}
function today(){return new Date().toISOString().split('T')[0];}
function setDates(){['c-date','n-date'].forEach(function(id){var e=$i(id);if(e&&!e.value)e.value=today();});}
function fmt(v){return(v>=0?'+':'')+v.toFixed(2)+'€';}
function streak(paris){if(!paris.length)return{n:0,t:null};var t=paris[0].win,c=0;for(var i=0;i<paris.length;i++){if(paris[i].win===t)c++;else break;}return{n:c,t:t};}

/* ── FORME ── */
function formeHtml(paris,n){
  var last=paris.slice(0,n||5);
  if(!last.length)return '';
  var d=last.map(function(p){return '<div class="fp '+(p.win?'fw':'fl')+'">'+(p.win?'W':'L')+'</div>';}).join('');
  return '<div class="forme-row">'+d+'</div>';
}

/* ── SAVE (ne fait QUE sauvegarder + render, pas de boucle) ── */
function save(){
  localStorage.setItem('g45v5',JSON.stringify(state));
  render();
}

/* ── CRASH SIMULATOR (autonome, pas dans render) ── */
function renderCrash(){
  var uSel=$i('c-unit');
  if(!uSel||!uSel.value){return;}
  var u=state.u.find(function(x){return x.n===uSel.value;});
  if(!u){$i('crash-grid').innerHTML='<div style="color:var(--t3);font-size:11px;grid-column:span 4;text-align:center;padding:8px;">Paliers N/A</div>';return;}
  var s=String(u.s||1);
  var strat=STRATS[s]||STRATS["1"];
  var cote=getMmCote?getMmCote():1.5;
  var total=Object.values(state.b).reduce(function(a,v){return a+parseFloat(v||0);},0);
  var html='';
  var alertMsg='';
  for(var i=0;i<strat.length;i++){
    var mise=strat[i];
    var gain=(mise*cote-mise).toFixed(2);
    var pct=total>0?(mise/total*100):0;
    var cls=pct>15?'danger':pct>8?'warning':'safe';
    var active=(i===u.l-1);
    if(active&&pct>15){alertMsg='⚠ Palier P'+(i+1)+' : '+mise+'€ = '+pct.toFixed(1)+'% du capital — risque élevé !';}
    html+='<div class="cc '+cls+'"'+(active?' style="outline:2px solid var(--a);outline-offset:2px;"':'')+''
      +'><div class="cc-l">P'+(i+1)+(active?' ◀':'')+''+'</div>'
      +'<div class="cc-v" style="color:'+(cls==='danger'?'var(--r)':cls==='warning'?'var(--gold)':'var(--g)')+';">'+mise+'€</div>'
      +'<div class="cc-g">+'+gain+'€</div></div>';
  }
  $i('crash-grid').innerHTML=html;
  var al=$i('crash-alert');
  if(al){
    if(alertMsg){al.classList.add('show');$i('crash-txt').innerText=alertMsg;}
    else{al.classList.remove('show');}
  }
}

/* ── SUREBET ── */
var sbRows=[{c:2.10},{c:2.05}];
function buildSbRows(){
  var tot=parseFloat(($i('sb-tot')&&$i('sb-tot').value)||100);
  var gorr=$i('sb-gorr')&&$i('sb-gorr').checked;
  var impl=sbRows.reduce(function(a,r){return a+1/(r.c||1);},0);
  var dr=$i('sb-rows');if(!dr)return;
  dr.innerHTML=sbRows.map(function(r,i){
    return '<div class="dutch-row">'
      +'<input type="number" class="fi" value="'+r.c+'" step="0.01" placeholder="Cote '+(i+1)+'" data-idx="'+i+'" oninput="sbRows[this.dataset.idx].c=parseFloat(this.value)||1;buildSbRows();">'
      +(sbRows.length>2?'<button class="udel" data-idx="'+i+'" onclick="sbRows.splice(this.dataset.idx,1);buildSbRows();">✕</button>':'')
      +'</div>';
  }).join('');
  var isSure=impl<1;
  var marge=((1-impl)*100).toFixed(2);
  var pe=$i('sb-marge');
  if(pe){pe.innerText=(isSure?'✅ ':'')+Math.abs(marge)+'%'+(isSure?' (arb!)':'');pe.style.color=isSure?'var(--g)':'var(--t1)';}
  var misesHtml='';
  var profit=0;
  if(impl>0){
    var totEff=gorr?tot*(impl):tot;
    sbRows.forEach(function(r,i){
      var mise=gorr?(tot/impl*(1/(r.c||1))).toFixed(2):(tot/impl*(1/(r.c||1))).toFixed(2);
      var ret=(parseFloat(mise)*(r.c||1)).toFixed(2);
      misesHtml+='<div class="cres-row"><span class="cres-l">Mise '+(i+1)+' (@'+(r.c||1)+')</span><span class="cres-v" style="color:var(--a)">'+mise+'€</span></div>';
    });
    var retour=gorr?(tot/impl+tot).toFixed(2):(tot/impl).toFixed(2);
    profit=gorr?(parseFloat(retour)-tot-tot).toFixed(2):(parseFloat(retour)-tot).toFixed(2);
  }
  var pm=$i('sb-mises');if(pm)pm.innerHTML=misesHtml;
  var pp=$i('sb-profit');
  if(pp){pp.innerText=profit?(isSure||gorr?fmt(parseFloat(profit)):'—'):'—';if(pp.innerText!=='—')pp.style.color=parseFloat(profit)>=0?'var(--g)':'var(--r)';}
}
function calcSb(){buildSbRows();}
function addSbRow(){sbRows.push({c:2.0});buildSbRows();}

/* ── DUTCHING (sans boucle) ── */
function buildDtRows(){
  var tot=parseFloat(($i('dt-tot')&&$i('dt-tot').value)||50);
  var impl=dtRows.reduce(function(a,r){return a+1/(r.c||1);},0);
  var dr=$i('dt-rows');if(!dr)return;
  var html='';
  dtRows.forEach(function(r,i){
    var mise=impl>0?(tot*(1/(r.c||1))/impl).toFixed(2):'—';
    html+='<div class="dutch-row">'
      +'<input type="number" class="fi" value="'+r.c+'" step="0.01" placeholder="Cote '+(i+1)+'" data-idx="'+i+'" oninput="dtRows[this.dataset.idx].c=parseFloat(this.value)||1;buildDtRows();">'
      +'<div class="dutch-mise">'+mise+'€</div>'
      +(dtRows.length>2?'<button class="udel" data-idx="'+i+'" onclick="dtRows.splice(this.dataset.idx,1);buildDtRows();">✕</button>':'')
      +'</div>';
  });
  dr.innerHTML=html;
  /* update result */
  var ret=impl>0?(tot/impl).toFixed(2):'—';
  var profit=impl>0?(tot/impl-tot).toFixed(2):'—';
  txt('dt-ret',ret!='—'?ret+'€':'—');
  var pe=$i('dt-profit');
  if(pe&&profit!='—'){pe.innerText=fmt(parseFloat(profit));pe.style.color=parseFloat(profit)>=0?'var(--g)':'var(--r)';}
}
function calcDt(){buildDtRows();}
function addDtRow(){dtRows.push({c:2.0});buildDtRows();}
function swCalc(m){
  ['sb','dt','lay','vb','arjel'].forEach(function(p){
    var el=$i('calc-'+p);if(el)el.style.display=m===p?'block':'none';
    var btn=$i('ct-'+p);if(btn)btn.classList.toggle('on',m===p);
  });
  if(m==='dt')buildDtRows();
  else if(m==='lay'){calcLay();calcFreebet();}
  else if(m==='vb')calcVb();
  else if(m==='arjel'){buildArjelRows();}
  else calcSb();
}
function calcVb(){
  var prob=parseFloat(($i('vb-prob')&&$i('vb-prob').value)||55);
  var cote=parseFloat(($i('vb-cote')&&$i('vb-cote').value)||2.10);
  var mise=parseFloat(($i('vb-mise')&&$i('vb-mise').value)||10);
  if(!prob||!cote||prob<=0||prob>=100||cote<=1)return;
  var p=prob/100;
  var fair=(1/p).toFixed(3);
  var edge=((p*cote-1)*100).toFixed(2);
  var ev=(p*(cote-1)*mise-(1-p)*mise).toFixed(2);
  var kelly=Math.max(0,(p-(1-p)/(cote-1))*100).toFixed(1);
  txt('vb-fair',fair);
  var ee=$i('vb-edge');if(ee){ee.innerText=edge+'%';ee.style.color=parseFloat(edge)>0?'var(--g)':'var(--r)';}
  var ev2=$i('vb-ev');if(ev2){ev2.innerText=(parseFloat(ev)>=0?'+':'')+ev+'€';ev2.style.color=parseFloat(ev)>=0?'var(--g)':'var(--r)';}
  txt('vb-kelly',kelly+'%');
  var verd=$i('vb-verd');
  if(verd){
    var isV=parseFloat(edge)>0;var isS=parseFloat(edge)>5;
    verd.style.cssText='display:block;padding:10px;border-radius:8px;text-align:center;font-size:13px;font-weight:700;background:'+(isS?'rgba(30,215,96,.1)':isV?'rgba(77,132,255,.1)':'rgba(255,69,69,.1)')+';border:1px solid '+(isS?'rgba(30,215,96,.25)':isV?'rgba(77,132,255,.25)':'rgba(255,69,69,.25)')+';color:'+(isS?'var(--g)':isV?'var(--a)':'var(--r)');
    verd.innerText=isS?'🔥 Value ! +'+edge+'%':isV?'✅ Value +'+edge+'%':'❌ Pas de value';
  }
}
function toggleLayMode(){
  var mode=$i('lay-mode-cible')&&$i('lay-mode-cible').checked;
  var wrap=$i('lay-cible-wrap');if(wrap)wrap.style.display=mode?'block':'none';
  var lbl=$i('lay-mise-label');if(lbl)lbl.textContent=mode?'Mise Back calculée':'Mise Back (€)';
  var bm=$i('lay-back-mise');if(bm)bm.readOnly=mode;if(bm)bm.style.opacity=mode?'.5':'1';
  calcLay();
}
function calcLay(){
  var gorr=$i('lay-gorr')&&$i('lay-gorr').checked;
  var useComm=$i('lay-usecomm')&&$i('lay-usecomm').checked;
  var modeCible=$i('lay-mode-cible')&&$i('lay-mode-cible').checked;
  var modeLiability=$i('lay-liability-mode')&&$i('lay-liability-mode').checked;
  var bc=parseFloat(($i('lay-back-cote')&&$i('lay-back-cote').value)||0);
  var lc=parseFloat(($i('lay-lay-cote')&&$i('lay-lay-cote').value)||0);
  var comm=parseFloat(($i('lay-commission')&&$i('lay-commission').value)||3);
  var commR=useComm?comm/100:0;
  var lr=1+(1-commR)/(lc-1);
  if(!bc||!lc||bc<=1||lc<=1)return;

  // Toggle affichage input
  var stakeGrp=$i('lay-stake-group'); var liabGrp=$i('lay-liability-group');
  if(stakeGrp) stakeGrp.style.display=modeLiability?'none':'block';
  if(liabGrp) liabGrp.style.display=modeLiability?'block':'none';

  var bm,ml,liabML,pbw,plw;
  if(modeLiability){
    // Saisie liability → calcule stake
    var targetLiab=parseFloat(($i('lay-liability-input')&&$i('lay-liability-input').value)||0);
    if(!targetLiab)return;
    ml=targetLiab/(lc-1);
    if(gorr){
      bm=ml*(1-commR);
    } else {
      bm=ml*(lc-commR)/bc;
    }
    var bmEl=$i('lay-back-mise');if(bmEl)bmEl.value=bm.toFixed(2);
  } else if(modeCible){
    ml=parseFloat(($i('lay-lay-mise')&&$i('lay-lay-mise').value)||0);
    if(!ml)return;
    if(gorr){
      bm=ml*(1-commR);
    } else {
      bm=ml*(lc-commR)/bc;
    }
    var bmEl=$i('lay-back-mise');if(bmEl)bmEl.value=bm.toFixed(2);
  } else {
    bm=parseFloat(($i('lay-back-mise')&&$i('lay-back-mise').value)||0);
    if(!bm)return;
    if(gorr){
      ml=bm/(1-commR);
    } else {
      ml=(bm*bc)/(lc-commR);
    }
  }
  liabML=ml*(lc-1);
  if(gorr){
    pbw=(bm*bc)-bm-liabML;
    plw=0;
  } else {
    pbw=(bm*(bc-1))-liabML;
    plw=(ml*(1-commR))-bm;
  }
  var pg=Math.min(pbw,plw);
  var roi=(bm+liabML)>0?(pg/(bm+liabML)*100).toFixed(2):0;
  var lrc=$i('lay-real-cote');if(lrc)lrc.innerText='@'+lr.toFixed(3);
  var ll=$i('lay-liability');if(ll)ll.innerText=liabML.toFixed(2)+'€';
  var lmo=$i('lay-mise-opt');if(lmo){lmo.innerText=ml.toFixed(2)+'€';lmo.style.color='var(--a)';}
  var lpb=$i('lay-profit-back');if(lpb){lpb.innerText=(pbw>=0?'+':'')+pbw.toFixed(2)+'€';lpb.style.color=pbw>=0?'var(--g)':'var(--r)';}
  var lpl=$i('lay-profit-lay');if(lpl){lpl.innerText=(plw>=0?'+':'')+plw.toFixed(2)+'€';lpl.style.color=plw>=0?'var(--g)':'var(--r)';}
  var lpg=$i('lay-profit-garanti');if(lpg){lpg.innerText=(pg>=0?'+':'')+pg.toFixed(2)+'€';lpg.style.color=pg>=0?'var(--g)':'var(--r)';}
  var lroi=$i('lay-roi');if(lroi){lroi.innerText=roi+'%';lroi.style.color=roi>=0?'var(--g)':'var(--r)';}
  var lsb=$i('lay-surebet-bar');
  if(lsb){
    if(pg>0){lsb.style.background='var(--g)';lsb.innerHTML='✅ Surebet confirmée — Profit garanti : '+(pg>=0?'+':'')+pg.toFixed(2)+'€';}
    else{lsb.style.background='rgba(255,69,69,.15)';lsb.innerHTML='✗ Pas de surebet';}
  }
}

function calcFreebet(){
  var fb=parseFloat(($i('fb-amount')&&$i('fb-amount').value)||0);
  var bc=parseFloat(($i('fb-back-cote')&&$i('fb-back-cote').value)||0);
  var lc=parseFloat(($i('fb-lay-cote')&&$i('fb-lay-cote').value)||0);
  var comm=parseFloat(($i('fb-comm')&&$i('fb-comm').value)||3);
  var gorr=$i('fb-gorr')&&$i('fb-gorr').checked;
  if(!fb||!bc||!lc||bc<=1||lc<=1)return;
  var commR2=comm/100;
  /* Surebet classique */
  var ml=((bc-1)*fb)/((lc-1)+(1-commR2));
  var liab=ml*(lc-1);
  var gainIfBack=((bc-1)*fb)-liab;
  var gainIfLay=ml*(1-commR2);
  var cg=Math.min(gainIfBack,gainIfLay);
  var taux=fb>0?(cg/fb*100).toFixed(1):0;
  /* Gagner ou Rembourser */
  var ml2=ml,liab2=liab,gainBack2=gainIfBack,gainLay2=gainIfLay;
  if(gorr){
    ml2=fb/(1-commR2);
    liab2=ml2*(lc-1);
    gainBack2=((bc-1)*fb)-liab2;
    gainLay2=0;
  }
  var cg2=gorr?gainBack2:cg;
  var taux2=fb>0?(cg2/fb*100).toFixed(1):0;
  /* Affichage */
  var flm=$i('fb-lay-mise');if(flm){flm.innerText=(gorr?ml2:ml).toFixed(2)+'€';flm.style.color='var(--a)';}
  var fli=$i('fb-liability');if(fli){fli.innerText=(gorr?liab2:liab).toFixed(2)+'€';fli.style.color='var(--gold)';}
  var fc=$i('fb-cash');if(fc){fc.innerText=(cg>=0?'+':'')+cg.toFixed(2)+'€';fc.style.color=cg>=0?'var(--g)':'var(--r)';}
  var ft=$i('fb-taux');if(ft)ft.innerText=taux+'%';
  var fcg=$i('fb-cash-gorr');if(fcg){fcg.innerText=gorr?(cg2>=0?'+':'')+cg2.toFixed(2)+'€ ('+taux2+'%)':'—';fcg.style.color=cg2>=0?'var(--gold)':'var(--r)';}
}

function renderSportFilter(){
  var sports=['ALL','⚽','🏀','🎾','🏈','⚾','🏒'];
  var labels={'ALL':'Tous','⚽':'Football','🏀':'Basket','🎾':'Tennis','🏈':'NFL','⚾':'Baseball','🏒':'Hockey'};
  var used=new Set(state.a.map(function(h){return h.sport||'';}));
  var sf=$i('sport-filter');if(!sf)return;
  sf.innerHTML=sports.filter(function(s){return s==='ALL'||used.has(s);}).map(function(s){
    return '<button class="sfbtn'+(bilanSport===s?' on':'')+'" onclick="bilanSport=\''+s+'\';renderBilanTab()">'+s+' '+labels[s]+'</button>';
  }).join('');
}
function filteredA(){
  var base=state.a;
  if(bilanMode==='cockpit')base=base.filter(function(h){return h.isS;});
  else if(bilanMode==='simple')base=base.filter(function(h){return !h.isS&&!h.isFlash&&!h.isCombi;});
  else if(bilanMode==='combi')base=base.filter(function(h){return h.isCombi;});
  else if(bilanMode==='flash')base=base.filter(function(h){return h.isFlash;});
  var filtered = bilanSport==='ALL'?base:base.filter(function(h){return h.sport===bilanSport;});
  if(window._bilanBkFilter) filtered=filtered.filter(function(h){return h.b===window._bilanBkFilter;});
  return filtered;
}

/* ── BILAN TAB (autonome) ── */
var _bilanChart=null;
var _advCharts={};

function renderAdvancedCharts(paris, bankroll) {
  // Détruire les anciens charts
  Object.values(_advCharts).forEach(function(c){try{c.destroy();}catch(e){}});
  _advCharts = {};
  if(!paris||!paris.length) return;

  var sorted = paris.slice().sort(function(a,b){ return new Date(a.date+' '+(a.heure||'00:00'))-new Date(b.date+' '+(b.heure||'00:00')); });

  // ── 1. Bankroll totale ──
  var bkTotal = Object.values(bankroll||{}).reduce(function(s,v){return s+parseFloat(v||0);},0);
  var cumProfits = [], cum=0;
  sorted.forEach(function(h){cum+=(h.win?(h.m*h.cote-h.m):-h.m);cumProfits.push(parseFloat(cum.toFixed(2)));});
  var startBk = bkTotal - cum;
  var bkCurve = cumProfits.map(function(p){return parseFloat((startBk+p).toFixed(2));});
  var ctx1 = document.getElementById('chart-bankroll');
  if(ctx1){
    var g1=ctx1.getContext('2d').createLinearGradient(0,0,0,150);
    g1.addColorStop(0,'rgba(240,176,32,.3)');g1.addColorStop(1,'rgba(240,176,32,0)');
    var bkLabels = sorted.map(function(h){
      var adv = h.target&&h.target!=='-'?h.target:'';
      return (h.date||'')+(adv?' · '+adv:'');
    });
    var bkGains = sorted.map(function(h){
      return h.win ? '+'+(h.m*h.cote-h.m).toFixed(2)+'€' : '-'+parseFloat(h.m).toFixed(2)+'€';
    });
    _advCharts.bk=new Chart(ctx1,{type:'line',
      data:{labels:bkLabels,datasets:[{data:bkCurve,borderColor:'#f0b020',backgroundColor:g1,borderWidth:2,fill:true,tension:.4,pointRadius:3,pointBackgroundColor:sorted.map(function(h){return h.win?'#1ed760':'#ff4545';}),pointRadius:4,pointHoverRadius:7}]},
      options:{responsive:true,maintainAspectRatio:false,
        interaction:{mode:'nearest',intersect:false},
        plugins:{legend:{display:false},
          tooltip:{backgroundColor:'rgba(8,11,18,.96)',borderColor:'#f0b020',borderWidth:1,padding:10,
            callbacks:{
              title:function(ii){return bkLabels[ii[0].dataIndex]||'';},
              label:function(ii){
                var h=sorted[ii.dataIndex];
                var gain=bkGains[ii.dataIndex];
                return ['Capital : '+ii.raw.toFixed(2)+'€', gain+(h.b?' · '+bki(h.b).n:'')];
              }
            }
          }
        },
        scales:{x:{display:false},y:{ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'€';}},grid:{color:'rgba(255,255,255,.03)'}}}
      }
    });
  }

  // ── 2. Camembert bookmakers ──
  var bkMises={};
  paris.forEach(function(h){bkMises[h.b]=(bkMises[h.b]||0)+parseFloat(h.m||0);});
  var bkKeys=Object.keys(bkMises).sort(function(a,b){return bkMises[b]-bkMises[a];}).slice(0,6);
  var ctx2=document.getElementById('chart-pie-bk');
  if(ctx2&&bkKeys.length){
    var bkColors=['#4d84ff','#1ed760','#f0b020','#ff7b54','#a78bfa','#22d3ee'];
    _advCharts.pie=new Chart(ctx2,{type:'doughnut',data:{labels:bkKeys.map(function(k){return bki(k).n;}),datasets:[{data:bkKeys.map(function(k){return bkMises[k].toFixed(0);}),backgroundColor:bkColors,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{color:'#4f5d88',font:{size:9},boxWidth:10,padding:6}}}}});
  }

  // ── 3. Réussite par sport ──
  var sportStats={};
  paris.forEach(function(h){
    var s=h.sport||'⚽';
    if(!sportStats[s])sportStats[s]={n:0,wins:0,profit:0};
    sportStats[s].n++;
    if(h.win)sportStats[s].wins++;
    sportStats[s].profit+=(h.win?(h.m*h.cote-h.m):-h.m);
  });
  var sportKeys=Object.keys(sportStats).filter(function(s){return sportStats[s].n>=3;});
  var ctx3=document.getElementById('chart-sport');
  if(ctx3&&sportKeys.length){
    var sportWr=sportKeys.map(function(s){return Math.round(sportStats[s].wins/sportStats[s].n*100);});
    var sportColors=sportWr.map(function(v){return v>=55?'#1ed760':v>=45?'#f0b020':'#ff4545';});
    _advCharts.sport=new Chart(ctx3,{type:'bar',data:{labels:sportKeys,datasets:[{data:sportWr,backgroundColor:sportColors,borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:function(i){var s=sportKeys[i.dataIndex];return sportStats[s].wins+'/'+sportStats[s].n+' ('+i.raw+'%)';}}}},scales:{x:{max:100,ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'%';}},grid:{color:'rgba(255,255,255,.03)'}},y:{ticks:{color:'#4f5d88',font:{size:11}},grid:{display:false}}}}});
  }

  // ── 4. ROI dans le temps + Drawdown ──
  var roiCurve=[], ddCurve=[], totalMise=0, totalProfit=0, peak=0, maxDD=0;
  sorted.forEach(function(h){
    totalMise+=parseFloat(h.m||0);
    totalProfit+=(h.win?(h.m*h.cote-h.m):-h.m);
    var roi=totalMise>0?parseFloat((totalProfit/totalMise*100).toFixed(1)):0;
    roiCurve.push(roi);
    if(totalProfit>peak)peak=totalProfit;
    var dd=peak>0?parseFloat(((peak-totalProfit)/peak*100).toFixed(1)):0;
    if(dd>maxDD)maxDD=dd;
    ddCurve.push(-dd);
  });
  var ctx4=document.getElementById('chart-roi-time');
  if(ctx4){
    _advCharts.roi=new Chart(ctx4,{type:'line',data:{labels:sorted.map(function(h,i){return i+1;}),datasets:[
      {label:'ROI %',data:roiCurve,borderColor:'#4d84ff',backgroundColor:'transparent',borderWidth:2,tension:.4,pointRadius:0,yAxisID:'y'},
      {label:'Drawdown %',data:ddCurve,borderColor:'#ff4545',backgroundColor:'rgba(255,69,69,.1)',fill:true,borderWidth:1.5,tension:.4,pointRadius:0,yAxisID:'y'}
    ]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'nearest',intersect:false},plugins:{legend:{position:'bottom',labels:{color:'#4f5d88',font:{size:9},boxWidth:12}}},scales:{x:{display:false},y:{ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'%';}},grid:{color:'rgba(255,255,255,.03)'}}}}});
  }
}
function renderBilanTab(){
  renderSportFilter();
  var paris=filteredA();
  /* Stats */
  var ben=paris.reduce(function(a,h){return a+(h.win?(h.m*h.cote)-h.m:-h.m);},0);
  var benEl=$i('stat-ben');if(benEl){benEl.innerText=fmt(ben);benEl.style.color=ben>=0?'var(--g)':'var(--r)';}
  var wr=paris.length?(paris.filter(function(h){return h.win;}).length/paris.length*100).toFixed(0):0;
  txt('stat-wr',wr+'%');
  var mise=paris.reduce(function(a,h){return a+parseFloat(h.m||0);},0);
  var roi=mise?(ben/mise*100).toFixed(1):0;
  var roiEl=$i('stat-roi');if(roiEl){roiEl.innerText=roi+'%';roiEl.style.color=parseFloat(roi)>=0?'var(--g)':'var(--r)';}
  txt('stat-nb',paris.length);
  renderBilanMois();
  /* Courbe */
  var ctx=$i('bilan-chart');
  if(ctx){
    if(_bilanChart){try{_bilanChart.destroy();}catch(e){}}
    if(paris.length){
      var cum=0;
      var curve=paris.slice().reverse().map(function(h){cum+=(h.win?(h.m*h.cote)-h.m:-h.m);return parseFloat(cum.toFixed(2));});
      var clabels=paris.slice().reverse().map(function(h){var adv2=h.target&&h.target!=='-'?h.target:'';return (h.date||'')+(h.heure?' '+h.heure:'')+(adv2?' vs '+adv2:'')+'||'+(h.win?(h.m*h.cote-h.m>=0?'+':'')+parseFloat(h.m*h.cote-h.m).toFixed(2)+'€':'-'+parseFloat(h.m).toFixed(2)+'€');});
      var color=bilanMode==='flash'?'#f0b020':bilanMode==='cockpit'?'#4d84ff':bilanMode==='simple'?'#22d3ee':'#1ed760';
      var ct=ctx.getContext('2d');
      var g=ct.createLinearGradient(0,0,0,150);
      g.addColorStop(0,color+'44');g.addColorStop(1,color+'00');

      // Courbes par bookmaker
      var datasets = [{label:'Global',data:curve,borderColor:color,backgroundColor:g,borderWidth:2,fill:true,tension:.4,pointRadius:2,pointBackgroundColor:color,pointHoverRadius:5,pointHoverBorderColor:'#fff',pointHoverBorderWidth:2}];
      var bkColors = ['#ff4545','#4d84ff','#f0b020','#1ed760','#a78bfa','#ff7b54','#22d3ee','#e879f9'];
      var bkList = Object.keys(state.b);
      bkList.forEach(function(bk, i){
        var bkParis = paris.filter(function(h){return h.b===bk;});
        if(!bkParis.length) return;
        var bkCum=0;
        // Aligner sur les mêmes labels (indices)
        var bkCurve = paris.slice().reverse().map(function(h){
          if(h.b===bk) bkCum+=(h.win?(h.m*h.cote)-h.m:-h.m);
          return parseFloat(bkCum.toFixed(2));
        });
        var bkCol = bki(bk).c || bkColors[i%bkColors.length];
        datasets.push({label:bki(bk).n,data:bkCurve,borderColor:bkCol,backgroundColor:'transparent',borderWidth:1.5,fill:false,tension:.4,pointRadius:0,pointHoverRadius:4,borderDash:[4,3]});
      });

      _bilanChart=new Chart(ct,{type:'line',data:{labels:clabels,datasets:datasets},options:{responsive:true,maintainAspectRatio:false,events:['mousemove','mouseout','click','touchstart','touchmove'],
        interaction:{mode:'nearest',intersect:false},
            plugins:{legend:{display:true,position:'bottom',labels:{color:'#4f5d88',font:{size:9},boxWidth:20,padding:8}},
              tooltip:{backgroundColor:'rgba(8,11,18,.96)',borderColor:color,borderWidth:1,padding:10,
                callbacks:{
                  title:function(ii){return clabels[ii[0].dataIndex]||('Pari '+(ii[0].dataIndex+1));},
                  label:function(ii){return ii.dataset.label+' : '+(ii.raw>=0?'+':'')+ii.raw.toFixed(2)+'€';}
                }}},
            scales:{x:{display:false},y:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'€';}}}}}});
        attachTouchTooltip('bilan-chart',function(){return _bilanChart;},'cib-bilan','cib-bilan-txt','cib-bilan-val');
    }
  }
  /* ── Graphiques avancés ── */
  renderAdvancedCharts(paris, state.b);

  var bks={};Object.keys(state.b).forEach(function(k){bks[k]={profit:0,n:0,wins:0};});
  paris.forEach(function(h){
    if(!bks[h.b]) bks[h.b]={profit:0,n:0,wins:0};
    bks[h.b].profit+=(h.win?(h.m*h.cote)-h.m:-h.m);
    bks[h.b].n++;
    if(h.win) bks[h.b].wins++;
  });
  var bke=$i('bk-stats');
  if(bke) bke.innerHTML=Object.entries(bks).map(function(e){
    var b=bki(e[0]), p=e[1].profit, n=e[1].n, wr=n?Math.round(e[1].wins/n*100):0;
    var isActive = window._bilanBkFilter===e[0];
    return '<div class="bkrow" onclick="window._bilanBkFilter=(window._bilanBkFilter===\''+e[0]+'\'?null:\''+e[0]+'\');renderBilanTab();" style="--bc:'+b.c+';display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,'+(isActive?'.2':'.04')+');background:rgba(255,255,255,'+(isActive?'.06':'.02')+');margin-bottom:4px;">'
      +bkFavicon(e[0],18)
      +'<span style="flex:1;font-size:11px;font-weight:700;color:'+b.c+';">'+b.n+'</span>'
      +(n?'<span style="font-size:10px;color:var(--t3);">'+n+' paris · '+wr+'%</span>':'')
      +'<span style="font-size:13px;font-weight:800;color:'+(p>=0?'var(--g)':'var(--r)')+';">'+fmt(p)+'</span></div>';
  }).join('')+(window._bilanBkFilter?'<button onclick="window._bilanBkFilter=null;renderBilanTab();" style="width:100%;padding:6px;margin-top:4px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:6px;color:var(--t3);font-size:10px;cursor:pointer;">✕ Effacer le filtre</button>':'');
}

/* ── RENDER PRINCIPAL ── */
function render(){
  var total=Object.values(state.b).reduce(function(a,v){return a+parseFloat(v||0);},0);
  // Bénéfice = toujours calculé depuis les paris de l'archive
  var ben = 0;
  if(state.a && state.a.length > 0) {
    ben = state.a.reduce(function(acc,h){ return acc + (h.win ? (h.m*h.cote - h.m) : -h.m); }, 0);
  } else {
    ben = total - (state.start_bk||0);
  }
  var benC=ben>=0?'var(--g)':'var(--r)';
  txt('top-val',total.toFixed(2)+' €');
  txt('d-cap',total.toFixed(2)+' €');
  var be=$i('d-ben');if(be){be.innerText=fmt(ben);be.style.color=benC;}
  renderGoal(total);
  renderBilanTab();
  renderBilanMois();  /* pas de boucle, c'est une fonction indépendante */

  /* selects */
  var bOpt=Object.keys(state.b).map(function(k){return '<option value="'+k+'">'+bki(k).n+'</option>';}).join('');
  ['c-book','n-book','mv-book'].forEach(function(id){var e=$i(id);if(e)e.innerHTML=bOpt;});
  var uSel=$i('c-unit');
  if(uSel)uSel.innerHTML=state.u.map(function(u){return '<option value="'+u.n+'">'+(u.sport||'')+' '+u.n+' (P'+u.l+')</option>';}).join('');

  /* live cockpit */
  $i('live-strat').innerHTML=state.h.filter(function(x){return x.isS;}).map(function(h){
    return '<tr>'
      +'<td><b>'+h.n+'</b><div style="font-size:9px;color:var(--t3);">'+(h.sport||'')+' '+(h.comp||'')+'</div></td>'
      +'<td><div>'+h.target+'</div>'+(h.date||h.heure?'<div style="font-size:9px;color:var(--t2);">'+(h.date?'📅 '+h.date:'')+' '+(h.heure?'⏰ '+h.heure:'')+'</div>':'')+'</td>'
      +'<td style="color:var(--a);font-weight:700;">@'+h.cote+'</td>'
      +'<td style="color:var(--gold);font-weight:700;">'+h.m+'€</td>'
      +'<td style="text-align:right;white-space:nowrap"><a href="https://www.google.com/search?q='+encodeURIComponent(h.target+' sofascore résumé')+'" target="_blank" style="display:inline-flex;align-items:center;padding:5px 7px;background:rgba(77,132,255,.1);border:1px solid rgba(77,132,255,.25);border-radius:4px;color:#4d84ff;font-size:11px;font-weight:700;text-decoration:none;margin-right:3px;" title="Résumé">🔍</a><button class="sbtn sw" data-id="'+h.id+'" onclick="result(this.dataset.id,true)" style="margin-right:3px">✅</button><button class="sbtn sl" data-id="'+h.id+'" onclick="result(this.dataset.id,false)" style="margin-right:3px">❌</button><button data-id="'+h.id+'" onclick="editBet(this.dataset.id)" style="background:none;border:1px solid rgba(77,132,255,.25);color:var(--a);font-size:11px;font-weight:700;padding:5px 8px;border-radius:4px;cursor:pointer;margin-right:3px">✏️</button><button data-id="'+h.id+'" onclick="cancelBet(this.dataset.id)" style="background:none;border:1px solid rgba(255,69,69,.25);color:var(--r);font-size:11px;font-weight:700;padding:5px 8px;border-radius:4px;cursor:pointer">✕</button></td>'
      +'</tr>';
  }).join('')||'<tr><td colspan="5" class="empty">Aucun pari en cours</td></tr>';

  $i('live-norm').innerHTML=state.h.filter(function(x){return !x.isS;}).map(function(h){
    return '<tr>'
      +'<td><div style="font-size:10px;color:var(--t3);">'+(h.sport||'')+' '+(h.comp||'')+' '+(h.date?'📅 '+h.date:'')+' '+(h.heure?'⏰ '+h.heure:'')+'</div>'
      +'<div style="font-weight:600;">'+(h.domicile==='dom'?'🏠 ':h.domicile==='ext'?'🚌 ':'')+h.target+'</div>'
      +'<div style="font-size:10px;color:var(--t2);">'+(h.type||'—')+' · @'+h.cote+' · '+bbadge(h.b)+(h.isFreebet?' 🎟':'')+'</div></td>'
      +'<td style="color:var(--gold);font-weight:700;">'+h.m+'€</td>'
      +'<td style="text-align:right;white-space:nowrap"><a href="https://www.google.com/search?q='+encodeURIComponent(h.target+' sofascore résumé')+'" target="_blank" style="display:inline-flex;align-items:center;padding:5px 7px;background:rgba(77,132,255,.1);border:1px solid rgba(77,132,255,.25);border-radius:4px;color:#4d84ff;font-size:11px;font-weight:700;text-decoration:none;margin-right:3px;" title="Résumé">🔍</a><button class="sbtn sw" data-id="'+h.id+'" onclick="result(this.dataset.id,true)" style="margin-right:3px">✅</button><button class="sbtn sl" data-id="'+h.id+'" onclick="result(this.dataset.id,false)" style="margin-right:3px">❌</button><button data-id="'+h.id+'" onclick="editBet(this.dataset.id)" style="background:none;border:1px solid rgba(77,132,255,.25);color:var(--a);font-size:11px;font-weight:700;padding:5px 8px;border-radius:4px;cursor:pointer;margin-right:3px">✏️</button><button data-id="'+h.id+'" onclick="cancelBet(this.dataset.id)" style="background:none;border:1px solid rgba(255,69,69,.25);color:var(--r);font-size:11px;font-weight:700;padding:5px 8px;border-radius:4px;cursor:pointer">✕</button></td>'
      +'</tr>';
  }).join('')||'<tr><td colspan="3" class="empty">Aucun pari en cours</td></tr>';

  /* dash units */
  $i('dash-units').innerHTML=state.u.length?state.u.map(function(u){
      var paris=state.a.filter(function(h){return h.n===u.n;});
      var profit=paris.reduce(function(a,h){return a+(h.win?(h.m*h.cote)-h.m:-h.m);},0);
      var wins=paris.filter(function(h){return h.win&&!h.isCashout;}).length;
      var pc=paris.length?Math.round(wins/paris.length*100):0;
      var logo=logoHtml(u.n,u.color,u.abbr,32);
      var forme=formeHtml(paris,5);
      var pColor=profit>=0?'var(--g)':'var(--r)';
      return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--b1);cursor:pointer;" data-nom="'+u.n+'" onclick="openClubFromDash(this.dataset.nom)">'
        +logo
        +'<div style="flex:1;min-width:0;">'
        +'<div style="font-size:12px;font-weight:700;">'+(u.sport||'')+' '+u.n+'</div>'
        +'<div style="font-size:9px;color:var(--t3);">'+'⭐'.repeat(u.s)+' · P'+u.l+' · '+pc+'% réussite</div>'
        +(u.note?'<div style="font-size:10px;color:var(--a);margin-top:2px;font-style:italic;">📌 '+u.note+'</div>':'')
        +forme
        +(streak(paris).n>1?'<div style="display:inline-flex;align-items:center;gap:3px;padding:1px 7px;border-radius:10px;font-size:9px;font-weight:700;margin-top:3px;background:'+(streak(paris).t?'rgba(30,215,96,.1)':'rgba(255,69,69,.1)')+';color:'+(streak(paris).t?'var(--g)':'var(--r)')+'">'
        +(streak(paris).t?'🔥':'❄️')+' '+streak(paris).n+'</div>':'')
        +'</div>'
        +'<div style="font-size:14px;font-weight:800;color:'+pColor+';">'+fmt(profit)+'</div>'
        +'</div>';
    }).join('')+'':'<div class="empty">Aucune équipe</div>';
  /* books */
  $i('books-grid').innerHTML=Object.entries(state.b).map(function(e){
    var b=bki(e[0]);
    return '<div class="btile" style="--bc:'+b.c+';">'
      +'<div class="btile-n" style="color:'+b.c+';display:flex;align-items:center;gap:5px;">'+bkFavicon(e[0],14)+b.n+'</div>'
      +'<div class="btile-v">'+parseFloat(e[1]).toFixed(2)+'€</div>'
      +'<div class="btile-acts" style="align-items:center;">'
      +'<input type="color" value="'+b.c+'" title="Couleur" data-bk="'+e[0]+'" onchange="changeBookColor(this)" style="width:20px;height:20px;border-radius:50%;border:none;padding:0;cursor:pointer;background:none;flex-shrink:0;">'
      +'<button class="ba" data-bk="'+e[0]+'" onclick="editBook(this.dataset.bk)">Modifier</button> '
      +'<button class="ba del" data-bk="'+e[0]+'" onclick="delBook(this.dataset.bk)">✕</button>'
      +'</div></div>';
  }).join('');

  /* ulist */
  $i('ulist').innerHTML=state.u.length?'<div style="border-top:1px solid var(--b1);">'
    +state.u.map(function(u,i){
      return '<div class="urow">'
        +'<div class="udot" style="background:'+u.color+';"></div>'
        +'<div style="flex:1;min-width:0;"><div class="uname">'+(u.sport||'')+' '+u.n+'</div>'
        +'<div style="font-size:10px;color:var(--t3);">'+'⭐'.repeat(u.s)+' · Palier '+u.l+'</div>'+(u.note?'<div style="font-size:10px;color:var(--a);font-style:italic;">📌 '+u.note+'</div>':'')+'</div>'
        +'<div style="display:flex;gap:5px;">'
        +'<button class="ba" data-idx="'+i+'" onclick="editUnit(this.dataset.idx)" style="color:var(--a);border-color:rgba(77,132,255,.3);">✏ Modifier</button>'
        +'<button class="udel" data-idx="'+i+'" onclick="rmUnit(this.dataset.idx)">✕</button>'
        +'</div></div>';
    }).join('')+'</div>':'';

  renderColorPicker();renderBkColorPicker();
  renderArchive();
  renderGlobalChart();
  setDates();
}

function renderGoal(total){
  var goal=parseFloat(state.goal)||0;
  var fill=$i('g-fill');if(!fill)return;
  if(!goal){fill.style.width='0%';txt('g-cur',total.toFixed(2)+'€');txt('g-pct','—');txt('g-lbl','Définir un objectif');txt('g-tgt','');return;}
  var pct=Math.min(100,total/goal*100);
  fill.style.width=pct.toFixed(1)+'%';
  txt('g-cur',total.toFixed(2)+'€');txt('g-pct',pct.toFixed(1)+'%');txt('g-tgt','/ '+goal+'€');
  txt('g-lbl',pct>=100?'🎉 Objectif atteint !':'Reste '+(goal-total).toFixed(2)+'€');
}
function setGoal(){var v=prompt('Objectif bankroll (€) :',state.goal||'');if(v!=null&&!isNaN(+v)){state.goal=+v;save();}}

function renderBkColorPicker(){
  var row=$i('bk-color-row');if(!row)return;
  var cols=['#4d84ff','#ff2040','#00c87a','#f59e0b','#a855f7','#22d3ee','#f97316','#ec4899','#14b8a6','#6366f1','#84cc16','#e879f9'];
  row.innerHTML=cols.map(function(col){
    return '<div data-col="'+col+'" style="width:22px;height:22px;border-radius:50%;background:'+col+';cursor:pointer;transition:all .15s;border:2px solid transparent;"></div>';
  }).join('');
  row.querySelectorAll('div').forEach(function(d){
    d.addEventListener('click',function(){
      row.querySelectorAll('div').forEach(function(x){x.style.borderColor='transparent';});
      d.style.borderColor='#fff';
      var ci=$i('new-bk-color');if(ci)ci.value=d.dataset.col;
    });
  });
  var ci=$i('new-bk-color');if(ci&&!ci.dataset.init){ci.value='#4d84ff';ci.dataset.init='1';}
}
function renderColorPicker(){
  var r=$i('cprow');if(!r)return;
  r.innerHTML=PCOLS.map(function(c){return '<div class="cp '+(c===selColor?'on':'')+'" style="background:'+c+';" onclick="pickColor(\''+c+'\',this)"></div>';}).join('');
  var cc=$i('u-color');if(cc){cc.value=selColor;cc.oninput=function(){selColor=this.value;document.querySelectorAll('.cp').forEach(function(e){e.classList.remove('on');});};}
}
function pickColor(c,el){selColor=c;document.querySelectorAll('.cp').forEach(function(e){e.classList.remove('on');});el.classList.add('on');$i('u-color').value=c;}

/* ── ARCHIVE ── */
/* ── PAR MOIS ── */
var _bilanMoisYear=new Date().getFullYear();
var _archYear=new Date().getFullYear();

function getMoisData(paris, year){
  var mois={};
  paris.forEach(function(h){
    var d=h.date||h.t||'';
    var y=d.substring(0,4);
    var m=d.substring(5,7)||d.substring(3,5);
    if(!y||!m)return;
    if(parseInt(y)!==year)return;
    var key=y+'-'+m;
    if(!mois[key])mois[key]={profit:0,n:0,wins:0};
    var p=(h.win?(h.m*h.cote)-h.m:-h.m);
    mois[key].profit+=p;
    mois[key].n++;
    if(h.win)mois[key].wins++;
  });
  return mois;
}

function renderMoisRow(key, data, prevData){
  var parts=key.split('-');
  var moisNames=['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  var moisNum=parseInt(parts[1]);
  var label=moisNames[moisNum]||parts[1]+'/'+parts[0];
  var p=data.profit;
  var wr=data.n?(data.wins/data.n*100).toFixed(0):'0';
  var col=p>=0?'var(--g)':'var(--r)';
  // Comparaison mois précédent
  var compHtml='';
  if(prevData){
    var diff=p-prevData.profit;
    var diffCol=diff>=0?'var(--g)':'var(--r)';
    var diffIcon=diff>=0?'▲':'▼';
    var diffPct=prevData.profit!==0?((diff/Math.abs(prevData.profit))*100).toFixed(0):null;
    var prevMonthNames = ['','Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
    var prevMNum = parseInt(parts[1]) - 1;
    if(prevMNum < 1) prevMNum = 12;
    var prevMName = prevMonthNames[prevMNum]||'';
    compHtml='<div style="font-size:10px;color:'+diffCol+';font-weight:700;margin-top:3px;" title="Différence de profit entre ce mois et '+prevMName+' ('+( prevData.profit>=0?'+':'')+prevData.profit.toFixed(2)+'€)">'+diffIcon+' '+(diff>=0?'+':'')+diff.toFixed(2)+'€ vs '+prevMName+' ('+(prevData.profit>=0?'+':'')+prevData.profit.toFixed(2)+'€)'+(diffPct?' · '+diffPct+'%':'')+'</div>';
  }
  return '<div style="display:flex;align-items:center;padding:11px 14px;background:var(--s1);border-radius:var(--r6);margin-bottom:6px;border-left:3px solid '+(p>=0?'var(--g)':'var(--r)')+';">'
    +'<div style="flex:1;">'
    +'<div style="font-size:13px;font-weight:700;">'+label+' '+parts[0]+'</div>'
    +'<div style="font-size:10px;color:var(--t3);margin-top:2px;">'+data.n+' paris · '+wr+'% réussite</div>'
    +compHtml
    +'</div>'
    +'<div style="font-size:16px;font-weight:800;color:'+col+';">'+(p>=0?'+':'')+p.toFixed(2)+'€</div>'
    +'</div>';
}

function renderBilanMois(){
  var el=$i('bilan-mois-list');var lbl=$i('mois-year-label');
  if(!el)return;
  if(lbl)lbl.textContent=_bilanMoisYear;
  var paris=state.a.filter(function(h){
    var mode=typeof bilanMode!=='undefined'?bilanMode:'global';
    if(mode==='cockpit')return h.isS;
    if(mode==='simple')return !h.isS&&!h.isFlash;
    if(mode==='flash')return h.isFlash;
    return true;
  });
  if(bilanSport&&bilanSport!=='ALL')paris=paris.filter(function(h){return h.sport===bilanSport;});
  // Récupérer aussi l'année précédente pour les comparaisons
  var mois=getMoisData(paris,_bilanMoisYear);
  var moisPrev=getMoisData(paris,_bilanMoisYear-1);
  // Fusionner les deux années pour avoir les mois précédents de la même année
  var allMois = getMoisDataAll(paris);
  var keys=Object.keys(mois).sort().reverse();
  if(!keys.length){el.innerHTML='<div class="empty">Aucun pari en '+_bilanMoisYear+'</div>';return;}
  el.innerHTML=keys.map(function(k){
    // Mois précédent dans la même année
    var parts=k.split('-');
    var mNum=parseInt(parts[1]);
    var prevKey = mNum>1 ? parts[0]+'-'+(mNum<11?'0':'')+(mNum-1) : (parseInt(parts[0])-1)+'-12';
    var prevData = allMois[prevKey]||null;
    return renderMoisRow(k,mois[k],prevData);
  }).join('');
}

function getMoisDataAll(paris){
  var mois={};
  paris.forEach(function(h){
    var d=h.date||h.t||'';
    var y=d.substring(0,4);
    var m=d.substring(5,7)||d.substring(3,5);
    if(!y||!m)return;
    var key=y+'-'+m;
    if(!mois[key])mois[key]={profit:0,n:0,wins:0};
    var p=(h.win?(h.m*h.cote)-h.m:-h.m);
    mois[key].profit+=p;
    mois[key].n++;
    if(h.win)mois[key].wins++;
  });
  return mois;
}

function changeMoisYear(dir){
  _bilanMoisYear+=dir;
  renderBilanMois();
}

function renderArchMois(){
  var el=$i('arch-mois-list');var lbl=$i('arch-year-label');
  if(!el)return;
  if(lbl)lbl.textContent=_archYear;
  var mois=getMoisData(state.a,_archYear);
  var keys=Object.keys(mois).sort().reverse();
  if(!keys.length){el.innerHTML='<div class="empty">Aucun pari en '+_archYear+'</div>';return;}
  el.innerHTML=keys.map(function(k){return renderMoisRow(k,mois[k]);}).join('');
}

function changeArchYear(dir){
  _archYear+=dir;
  renderArchMois();
}

function toggleArchMonth(el){
  var next=el.nextElementSibling;if(!next)return;
  next.style.display=next.style.display==='none'?'block':'none';
}
var _archFilter = 'all';
function renderArchive(){
  // Mise à jour compteurs KPI
  var wins = state.a.filter(function(x){return !x.isPending && x.win;}).length;
  var loss = state.a.filter(function(x){return !x.isPending && !x.win;}).length;
  var pend = state.a.filter(function(x){return x.isPending;}).length;
  var wEl = document.getElementById('arch-wins');
  var lEl = document.getElementById('arch-loss');
  var pEl = document.getElementById('arch-pending');
  if(wEl) wEl.textContent = wins;
  if(lEl) lEl.textContent = loss;
  if(pEl) pEl.textContent = pend;

  var pm={};
  state.a.forEach(function(h){
    var dateRaw = h.date || h.t || '';
    var k = 'Inconnu';
    if(dateRaw) {
      if(dateRaw.indexOf('-') !== -1) {
        // Format ISO : 2026-05-31
        var parts = dateRaw.split('-');
        if(parts.length >= 2) k = parts[1]+'/'+parts[0]; // mois/année
      } else if(dateRaw.indexOf('/') !== -1) {
        // Format FR : 31/05/2026
        var p = dateRaw.split('/');
        if(p.length >= 2) k = p[1]+'/'+(p[0].length===4?p[0]:'20'+p[0]);
      }
    }
    if(!pm[k])pm[k]={paris:[],profit:0,wins:0};
    pm[k].paris.push(h);pm[k].profit+=(h.isPending?0:(h.win?(h.m*h.cote)-h.m:-h.m));
    if(!h.isPending&&h.win)pm[k].wins++;
  });
  var keys=Object.keys(pm),profits=keys.map(function(k){return parseFloat(pm[k].profit.toFixed(2));});
  var maxA=Math.max.apply(null,profits.map(Math.abs).concat([1]));
  var cz=$i('arch-chart');
  if(cz){
    if(!keys.length){cz.innerHTML='<div class="empty">Aucun historique</div>';return;}
    cz.innerHTML='<div class="ctitle">Profit mensuel</div><div style="height:120px;position:relative;"><canvas id="ac"></canvas></div>';
    setTimeout(function(){
      var ctx=$i('ac');if(!ctx)return;
      if(window._ac){try{window._ac.destroy();}catch(e){}}
      window._ac=new Chart(ctx.getContext('2d'),{type:'bar',data:{labels:keys,datasets:[{data:profits,backgroundColor:profits.map(function(v){return v>=0?'rgba(30,215,96,.55)':'rgba(255,69,69,.55)';}),borderColor:profits.map(function(v){return v>=0?'#1ed760':'#ff4545';}),borderWidth:1,borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#4f5d88',font:{size:9}},grid:{display:false}},y:{ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'€';}},grid:{color:'rgba(255,255,255,.03)'}}}}});
    },60);
  }
  /* Grouper par semaine puis par jour */
  var dayNames=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  var fullDayNames=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  
  /* Grouper tous les paris par mois/semaine/jour */
  var allByDate={};
  state.a.forEach(function(h){
    var dateStr=h.date||'';
    if(!dateStr)dateStr=(h.t||'').substring(0,10);
    var key=dateStr||'Inconnu';
    if(!allByDate[key])allByDate[key]=[];
    allByDate[key].push(h);
  });
  
  /* Trier les dates décroissantes */
  var dateKeys=Object.keys(allByDate).sort().reverse();
  
  /* Grouper par mois */
  var byMonth={};
  dateKeys.forEach(function(dk){
    var mKey=dk.substring(0,7)||'Inconnu';
    if(!byMonth[mKey])byMonth[mKey]={days:{},profit:0,n:0,wins:0};
    allByDate[dk].forEach(function(h){
      var p=h.isPending?0:(h.win?(h.m*h.cote)-h.m:-h.m);
      byMonth[mKey].profit+=p;byMonth[mKey].n++;if(!h.isPending&&h.win)byMonth[mKey].wins++;
      if(!byMonth[mKey].days[dk])byMonth[mKey].days[dk]=[];
      byMonth[mKey].days[dk].push(h);
    });
  });
  
  var monthKeys=Object.keys(byMonth).sort().reverse();
  
  $i('arch-list').innerHTML=monthKeys.map(function(mk){
    var md=byMonth[mk];
    var pC=md.profit>=0?'var(--g)':'var(--r)';
    var wr=md.n?(md.wins/md.n*100).toFixed(0):0;
    var moisNames={'01':'Janvier','02':'Février','03':'Mars','04':'Avril','05':'Mai','06':'Juin','07':'Juillet','08':'Août','09':'Septembre','10':'Octobre','11':'Novembre','12':'Décembre'};
    var parts=mk.split('-');
    var mLabel=(moisNames[parts[1]]||parts[1])+' '+(parts[0]||'');
    
    var daysHtml=Object.keys(md.days).sort().reverse().map(function(dk){
      var dayParis=md.days[dk];
      // Appliquer le filtre résultat
      var filteredDayParis = _archFilter==='w' ? dayParis.filter(function(h){return !h.isPending&&h.win;})
        : _archFilter==='l' ? dayParis.filter(function(h){return !h.isPending&&!h.win;})
        : _archFilter==='p' ? dayParis.filter(function(h){return h.isPending;})
        : dayParis;
      if(!filteredDayParis.length) return '';
      var dayProfit=dayParis.reduce(function(a,h){return a+(h.isPending?0:(h.win?(h.m*h.cote)-h.m:-h.m));},0);
      var dpC=dayProfit>=0?'var(--g)':'var(--r)';
      /* Nom du jour */
      var dayLabel=dk;
      try{
        var dp=dk.split('-');
        if(dp.length===3){
          var dt=new Date(parseInt(dp[0]),parseInt(dp[1])-1,parseInt(dp[2]));
          dayLabel=fullDayNames[dt.getDay()]+' '+parseInt(dp[2]);
        }
      }catch(e){}
      
      var betsHtml=filteredDayParis.map(function(h){
        var b2=bki(h.b);
        var gain=h.isPending?0:(h.win?(h.m*h.cote-h.m):-h.m);
        var gainC=h.isPending?'#f0a020':(gain>=0?'var(--g)':'var(--r)');
        var winC=h.isPending?'#f0a020':(h.win?'var(--g)':'var(--r)');
        var borderC=h.isPending?'#f0a020':(h.win?'var(--g)':'var(--r)');
        var bkBadge='<div style="width:22px;height:22px;border-radius:5px;background:'+b2.c+';color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+b2.n.charAt(0).toUpperCase()+'</div>';
        var titre=(h.target&&h.target!=='-'?h.target:(h.n||'—'));
        var sous=(h.n&&h.target&&h.target!=='-'?h.n+' · ':'')+('@'+parseFloat(h.cote).toFixed(2))+(h.comp?' · '+h.comp:'');
        return '<div style="display:flex;align-items:center;padding:8px 10px;background:var(--s1);border-radius:var(--r6);margin-bottom:4px;border-left:3px solid '+borderC+';gap:8px;">'
          +'<div style="font-size:10px;color:var(--t3);min-width:32px;flex-shrink:0;text-align:center;">'+(h.heure||'—')+'</div>'
          +bkBadge
          +'<div style="flex:1;min-width:0;overflow:hidden;">'
          +'<div style="font-size:12px;font-weight:700;color:var(--t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+titre+'</div>'
          +'<div style="font-size:10px;color:var(--t3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+sous+'</div>'
          +'</div>'
          +'<div style="text-align:right;flex-shrink:0;">'
          +'<div style="font-size:11px;font-weight:800;color:'+winC+';">'+(h.isPending?'⏳':(h.win?'✅':'❌'))+'</div>'
          +'<div style="font-size:11px;font-weight:700;color:'+gainC+';">'+(h.isPending?'En cours':(gain>=0?'+':'')+gain.toFixed(2)+'€')+'</div>'
          +'<div style="font-size:10px;color:var(--t3);">'+parseFloat(h.m).toFixed(2)+'€</div>'
          +'</div>'
          +'<div style="display:flex;flex-direction:column;gap:3px;flex-shrink:0;">'
          +'<a href="https://www.google.com/search?q='+encodeURIComponent(titre+' sofascore')+'" target="_blank" style="background:none;border:none;color:#ff7b54;font-size:13px;cursor:pointer;padding:0;text-decoration:none;" title="Sofascore">⚡</a>'
          +'<button data-titre="'+titre.replace(/"/g,'&quot;')+'" data-date="'+(h.date||'')+'" data-comp="'+(h.comp||'')+'" onclick="var d=this.dataset;ouvrirYouTubeAvecScore(d.titre,d.date,d.comp)" style="background:none;border:none;color:#ff0000;font-size:13px;cursor:pointer;padding:0;" title="YouTube highlights">▶️</button>'
          +'<button data-aid="'+h.id+'" onclick="editArchived(this.dataset.aid)" style="background:none;border:none;color:var(--t3);font-size:14px;cursor:pointer;padding:0;">✏️</button>'
          +'<button data-aid="'+h.id+'" onclick="deleteArchived(this.dataset.aid)" style="background:none;border:none;color:var(--r);font-size:14px;cursor:pointer;padding:0;">🗑</button>'
          +'</div>'
          +(h.sousParis && h.sousParis.length ? '<div style="margin:4px 10px 6px 42px;border-left:2px solid rgba(255,255,255,.08);padding-left:8px;">'
            +h.sousParis.map(function(sp){
              var spC=sp.isPending?'#f0a020':(sp.win?'var(--g)':'var(--r)');
              var spIco=sp.isPending?'⏳':(sp.win?'✅':'❌');
              return '<div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;font-size:10px;color:var(--t2);">'
                +'<span>'+spIco+' '+sp.label+'</span>'
                +'<span style="color:'+spC+';font-weight:700;">@'+parseFloat(sp.cote).toFixed(2)+'</span>'
                +'</div>';
            }).join('')
            +'</div>' : '')
          +'</div>';
      }).join('');
      
      return '<div style="margin-bottom:10px;background:var(--bg2);border:1px solid var(--card-border,rgba(77,132,255,.32));border-radius:var(--r8);overflow:hidden;box-shadow:var(--card-glow,0 0 14px rgba(77,132,255,.18),0 0 4px rgba(77,132,255,.28));">'
        +'<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 12px;border-bottom:1px solid rgba(77,132,255,.15);background:rgba(77,132,255,.05);">'
        +'<span style="font-size:12px;font-weight:800;color:var(--t1);">'+dayLabel+'</span>'
        +'<span style="font-size:13px;font-weight:800;color:'+dpC+';">'+(dayProfit>=0?'+':'')+dayProfit.toFixed(2)+'€</span>'
        +'</div>'
        +'<div style="padding:8px;">'
        +betsHtml
        +'</div>'
        +'</div>';
    }).join('');
    
    return '<div style="margin-bottom:16px;">'
      /* Header mois */
      +'<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--s1);border-radius:var(--r6);border-left:3px solid '+(md.profit>=0?'var(--g)':'var(--r)')+';margin-bottom:8px;cursor:pointer;" onclick="toggleArchMonth(this)">'
      +'<div>'
      +'<div style="font-size:14px;font-weight:800;color:var(--t1);">'+mLabel+'</div>'
      +'<div style="font-size:10px;color:var(--t3);margin-top:2px;">'+md.n+' paris · '+wr+'% réussite</div>'
      +'</div>'
      +'<div style="font-size:18px;font-weight:800;color:'+pC+';">'+(md.profit>=0?'+':'')+md.profit.toFixed(2)+'€</div>'
      +'</div>'
      /* Contenu dépliable */
      +'<div style="padding:0 4px;">'
      +daysHtml
      +'</div>'
      +'</div>';
  }).join('');
}

/* ── GLOBAL CHART ── */
function renderChartMoisBar(){
  var ctx=$i('chart-mois-bar');if(!ctx)return;
  if(window._gcMoisBar){try{window._gcMoisBar.destroy();}catch(e){}}
  var moisNames=['','Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  var year=new Date().getFullYear();
  var mois={};
  state.a.forEach(function(h){
    var d=h.date||h.t||'';
    var y=parseInt(d.substring(0,4));
    if(y!==year)return;
    var m=parseInt(d.substring(5,7));if(!m)return;
    if(!mois[m])mois[m]=0;
    mois[m]+=(h.win?(h.m*h.cote)-h.m:-h.m);
  });
  var keys=Object.keys(mois).map(Number).sort(function(a,b){return a-b;});
  if(!keys.length){ctx.parentElement.innerHTML='<div class="empty">Aucune donnée</div>';return;}
  var labels=keys.map(function(m){return moisNames[m]||m;});
  var data=keys.map(function(m){return parseFloat(mois[m].toFixed(2));});
  var colors=data.map(function(v){return v>=0?'rgba(30,215,96,.7)':'rgba(255,69,69,.7)';});
  window._gcMoisBar=new Chart(ctx.getContext('2d'),{
    type:'bar',data:{labels:labels,datasets:[{data:data,backgroundColor:colors,borderRadius:5,borderSkipped:false}]},
    options:{animation:false,responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:function(i){return (i.raw>=0?'+':'')+i.raw.toFixed(2)+'€';}}}},
      scales:{x:{ticks:{color:'#4f5d88',font:{size:9}},grid:{display:false}},
        y:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'€';}}}}}
  });
  attachTouchTooltip('chart-mois-bar',function(){return window._gcMoisBar;},'','','');
}

function renderChartSport(){
  var ctxBen=$i('chart-sport-ben');var ctxWr=$i('chart-sport-wr');
  if(window._gcSportBen){try{window._gcSportBen.destroy();}catch(e){}}
  if(window._gcSportWr){try{window._gcSportWr.destroy();}catch(e){}}
  var sports={};
  state.a.forEach(function(h){
    var s=h.sport||'Autre';
    if(!sports[s])sports[s]={profit:0,n:0,wins:0};
    sports[s].profit+=(h.win?(h.m*h.cote)-h.m:-h.m);
    sports[s].n++;if(h.win)sports[s].wins++;
  });
  var entries=Object.entries(sports).sort(function(a,b){return b[1].profit-a[1].profit;});
  if(!entries.length)return;
  var labels=entries.map(function(e){return e[0];});
  var profits=entries.map(function(e){return parseFloat(e[1].profit.toFixed(2));});
  var wrs=entries.map(function(e){return parseFloat((e[1].wins/e[1].n*100).toFixed(1));});
  var pColors=profits.map(function(v){return v>=0?'rgba(30,215,96,.7)':'rgba(255,69,69,.7)';});
  var wrColors=['rgba(30,215,96,.7)','rgba(240,176,32,.7)','rgba(255,69,69,.7)','rgba(77,132,255,.7)','rgba(168,85,247,.7)'];
  if(ctxBen)window._gcSportBen=new Chart(ctxBen.getContext('2d'),{
    type:'bar',data:{labels:labels,datasets:[{data:profits,backgroundColor:pColors,borderRadius:5,borderSkipped:false}]},
    options:{animation:false,responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:function(i){return (i.raw>=0?'+':'')+i.raw.toFixed(2)+'€';}}}},
      scales:{x:{ticks:{color:'#4f5d88',font:{size:9}},grid:{display:false}},y:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'€';}}}}}
  });
  if(ctxWr)window._gcSportWr=new Chart(ctxWr.getContext('2d'),{
    type:'bar',data:{labels:labels,datasets:[{data:wrs,backgroundColor:wrColors,borderRadius:5,borderSkipped:false}]},
    options:{animation:false,responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:function(i){return i.raw+'%';}}}},
      scales:{x:{ticks:{color:'#4f5d88',font:{size:9}},grid:{display:false}},y:{min:0,max:100,grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'%';}}}}}
  });
}

function renderChartTypeBen(){
  var ctx=$i('chart-type-ben');if(!ctx)return;
  if(window._gcTypeBen){try{window._gcTypeBen.destroy();}catch(e){}}
  var types={};
  state.a.forEach(function(h){
    var t=(h.type||'Autre').trim()||'Autre';
    if(!types[t])types[t]=0;
    types[t]+=(h.win?(h.m*h.cote)-h.m:-h.m);
  });
  var entries=Object.entries(types).sort(function(a,b){return b[1]-a[1];});
  if(!entries.length)return;
  var labels=entries.map(function(e){return e[0];});
  var data=entries.map(function(e){return parseFloat(e[1].toFixed(2));});
  var TCOLS=['rgba(77,132,255,.8)','rgba(30,215,96,.8)','rgba(240,176,32,.8)','rgba(168,85,247,.8)','rgba(34,211,238,.8)','rgba(249,115,22,.8)','rgba(236,72,153,.8)','rgba(20,184,166,.8)','rgba(132,204,22,.8)','rgba(232,121,249,.8)'];
  var colors=entries.map(function(e,i){return TCOLS[i%TCOLS.length];});
  window._gcTypeBen=new Chart(ctx.getContext('2d'),{
    type:'bar',data:{labels:labels,datasets:[{data:data,backgroundColor:colors,borderRadius:5,borderSkipped:false}]},
    options:{animation:false,responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:function(i){return (i.raw>=0?'+':'')+i.raw.toFixed(2)+'€';}}}},
      scales:{x:{ticks:{color:'#4f5d88',font:{size:9},maxRotation:30},grid:{display:false}},y:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'€';}}}}}
  });
}

/* ── DONUT RÉPARTITION PAR TYPE ── */
var _typeColors={};
var DONUT_DEFAULTS=['#4d84ff','#1ed760','#f0b020','#a855f7','#22d3ee','#f97316','#ec4899','#14b8a6','#84cc16','#e879f9'];

function getTypeColor(type,i){
  if(!_typeColors[type])_typeColors[type]=DONUT_DEFAULTS[i%DONUT_DEFAULTS.length];
  return _typeColors[type];
}

function renderChartTypeDonut(){
  var ctx=$i('chart-type-donut');if(!ctx)return;
  if(window._gcTypeDonut){try{window._gcTypeDonut.destroy();}catch(e){}}
  var types={};var i=0;
  state.a.forEach(function(h){
    var t=(h.type||'Autre').trim()||'Autre';
    if(!types[t]){types[t]={n:0,idx:i++};}
    types[t].n++;
  });
  var entries=Object.entries(types).sort(function(a,b){return b[1].n-a[1].n;});
  if(!entries.length)return;
  var labels=entries.map(function(e){return e[0];});
  var data=entries.map(function(e){return e[1].n;});
  var colors=entries.map(function(e){return getTypeColor(e[0],e[1].idx);});
  window._gcTypeDonut=new Chart(ctx.getContext('2d'),{
    type:'doughnut',
    data:{labels:labels,datasets:[{data:data,backgroundColor:colors,borderWidth:2,borderColor:'var(--bg)'}]},
    options:{animation:false,responsive:true,maintainAspectRatio:false,cutout:'65%',
      plugins:{legend:{position:'bottom',labels:{color:'#4f5d88',font:{size:9},boxWidth:12,padding:8}},
        tooltip:{callbacks:{label:function(i){var total=data.reduce(function(a,b){return a+b;},0);return i.label+': '+i.raw+' ('+((i.raw/total)*100).toFixed(1)+'%)';}}}}}
  });
  /* Color pickers */
  var picker=$i('type-donut-picker');
  if(picker){
    picker.innerHTML=entries.map(function(e,i){
      return '<div style="display:flex;align-items:center;gap:4px;padding:3px 8px;background:var(--s1);border-radius:20px;cursor:pointer;" data-type="'+e[0]+'" onclick="openTypePicker(this)">'
        +'<div style="width:10px;height:10px;border-radius:50%;background:'+getTypeColor(e[0],i)+';flex-shrink:0;"></div>'
        +'<span style="font-size:10px;color:var(--t2);">'+e[0]+'</span>'
        +'<input type="color" id="tp-'+e[0].replace(/[^a-z0-9]/gi,'_')+'" value="'+getTypeColor(e[0],i)+'" data-type="'+e[0]+'" onchange="changeTypeColor(this.dataset.type,this.value)" style="opacity:0;position:absolute;width:0;height:0;">'
        +'</div>';
    }).join('');
  }
}

function openTypePicker(el){
  var type=el.dataset.type;
  var id='tp-'+type.replace(/[^a-z0-9]/gi,'_');
  var inp=$i(id);if(inp)inp.click();
}

function changeTypeColor(type,color){
  _typeColors[type]=color;
  localStorage.setItem('g45_typecolors',JSON.stringify(_typeColors));
  renderChartTypeDonut();
  renderChartTypeBen();
}

/* ── STREAKS ── */
function renderStreakPanel(){
  var el=$i('streak-panel');if(!el)return;
  var paris=state.a.slice().sort(function(a,b){return (a.date+a.heure)<(b.date+b.heure)?-1:1;});
  if(!paris.length){el.innerHTML='<div class="empty" style="grid-column:1/-1;">Aucun pari archivé</div>';return;}
  /* Streak actuel */
  var cur=1,curW=paris[paris.length-1].win;
  for(var i=paris.length-2;i>=0;i--){
    if(paris[i].win===curW)cur++;else break;
  }
  /* Meilleure série W */
  var bestW=0,tmpW=0;
  paris.forEach(function(h){h.win?tmpW++:(tmpW=0);if(tmpW>bestW)bestW=tmpW;});
  /* Pire série L */
  var worstL=0,tmpL=0;
  paris.forEach(function(h){!h.win?tmpL++:(tmpL=0);if(tmpL>worstL)worstL=tmpL;});
  /* Streak actuel ce mois */
  var thisMonth=new Date().toISOString().substring(0,7);
  var monthParis=paris.filter(function(h){return (h.date||'').substring(0,7)===thisMonth;});
  var mWins=monthParis.filter(function(h){return h.win;}).length;
  var mLoss=monthParis.length-mWins;

  var streakLabel=cur+'× '+(curW?'✅ Victoire':'❌ Défaite');
  var streakC=curW?'var(--g)':'var(--r)';

  el.innerHTML=[
    {label:'🔥 Série en cours',val:streakLabel,c:streakC},
    {label:'📈 Meilleure série W',val:bestW+'× ✅',c:'var(--g)'},
    {label:'📉 Pire série L',val:worstL+'× ❌',c:'var(--r)'},
    {label:'📅 Ce mois',val:mWins+'W / '+mLoss+'L',c:'var(--t2)'},
  ].map(function(s){
    return '<div style="padding:12px;background:var(--s1);border-radius:var(--r6);text-align:center;">'
      +'<div style="font-size:10px;color:var(--t3);margin-bottom:4px;">'+s.label+'</div>'
      +'<div style="font-size:16px;font-weight:800;color:'+s.c+';">'+s.val+'</div>'
      +'</div>';
  }).join('');
}

function renderGlobalChart(){
  var gz=$i('global-zone');if(!gz)return;
  var ap=state.a.slice().reverse();
  var startBk=state.start_bk||0;
  var cum=startBk;
  var glabels=['Départ'];
  var curve=[startBk];
  ap.forEach(function(h){
    cum+=(h.win?(h.m*h.cote)-h.m:-h.m);
    curve.push(parseFloat(cum.toFixed(2)));
    var gain=(h.win?(h.m*h.cote)-h.m:-h.m);
    var adv3=h.target&&h.target!=='-'?h.target:'';var lbl=(h.date||'')+(h.n?' '+h.n:'')+(adv3?' vs '+adv3:'')+(h.l?' P'+h.l:'');
    glabels.push(lbl+'||'+(gain>=0?'+':'')+gain.toFixed(2)+'€');
  });
  var tot=cum-startBk;
  var wins=state.a.filter(function(h){return h.win&&!h.isCashout;}).length,n=state.a.filter(function(h){return !h.isCashout;}).length;
  var wr=n?(wins/n*100).toFixed(1):0;
  var mise=state.a.reduce(function(a,h){return a+parseFloat(h.m);},0);
  var roi=mise?(tot/mise*100).toFixed(2):0;
  var bC=tot>=0?'#1ed760':'#ff4545',rC=+roi>=0?'#1ed760':'#ff4545';
  gz.innerHTML='<div class="sec" style="margin-top:0;">Évolution bankroll</div><div class="gchart"><div class="gchart-area"><canvas id="cg"></canvas></div><div class="chart-info-bar" id="cib-global"><span class="cib-main" id="cib-global-txt">Touche un point</span><span class="cib-val" id="cib-global-val"></span></div>'
    +'<div class="gkpis">'
    +'<div class="gk"><div class="gk-l">Paris</div><div class="gk-v" style="color:var(--a);">'+n+'</div></div>'
    +'<div class="gk"><div class="gk-l">Bénéfice</div><div class="gk-v" style="color:'+bC+';">'+fmt(tot)+'</div></div>'
    +'<div class="gk"><div class="gk-l">ROI</div><div class="gk-v" style="color:'+rC+';">'+roi+'%</div></div>'
    +'<div class="gk"><div class="gk-l">Réussite</div><div class="gk-v">'+wr+'%</div></div>'
    +'</div></div>';
  setTimeout(function(){
    var ctx=$i('cg');if(!ctx)return;
    if(GC){try{GC.destroy();}catch(e){}}
    var ct=ctx.getContext('2d');
    var lineColor=cum>=startBk?'#1ed760':'#ff4545';
    var g=ct.createLinearGradient(0,0,0,170);
    g.addColorStop(0,lineColor+'33');g.addColorStop(1,lineColor+'00');
    var ptColors=curve.map(function(v,i){
      if(i===0)return 'rgba(255,255,255,.3)';
      return curve[i]>=curve[i-1]?'rgba(30,215,96,.8)':'rgba(255,69,69,.8)';
    });
    GC=new Chart(ct,{
      type:'line',
      data:{labels:glabels,datasets:[{data:curve,borderColor:lineColor,backgroundColor:g,borderWidth:2,fill:true,tension:.4,
        pointRadius:4,pointBackgroundColor:ptColors,pointHoverRadius:10,pointHoverBorderColor:'#fff',pointHoverBorderWidth:2,pointHitRadius:30}]},
      options:{
        responsive:true,maintainAspectRatio:false,events:['mousemove','mouseout','click','touchstart','touchmove'],interaction:{mode:'nearest',intersect:false},
        plugins:{legend:{display:false},
          tooltip:{backgroundColor:'rgba(8,11,18,.96)',borderColor:lineColor+'66',borderWidth:1,padding:10,
            callbacks:{
              title:function(ii){if(!ii||!ii.length)return '';var l=glabels[ii[0].dataIndex]||'';return l.split('||')[0]||'Départ';},
              label:function(ii){if(!ii||ii.dataIndex===undefined)return '';var l=glabels[ii.dataIndex]||'';var parts=l.split('||');return parts[1]?'Capital : '+ii.raw.toFixed(2)+'€  '+parts[1]:'Capital : '+ii.raw.toFixed(2)+'€';}
            }}},
        scales:{x:{display:false},y:{grid:{color:'rgba(255,255,255,.03)'},border:{display:false},
          ticks:{color:'#4f5d88',font:{size:10},maxTicksLimit:4,callback:function(v){return v+'€';}}}}
      }
    });

  },60);
}
/* ── ÉQUIPES ── */
function renderEquipes(){
  var c=$i('equipes-list');if(!c)return;
  if(!state.u.length){c.innerHTML='<div class="empty">Aucune équipe</div>';return;}
  Object.values(MC).forEach(function(ch){try{ch.destroy();}catch(e){}});MC={};
  c.innerHTML=state.u.map(function(u,idx){
    var p=gp(u);
    var paris=state.a.filter(function(h){return h.n===u.n;});
    var profit=paris.reduce(function(a,h){return a+(h.win?(h.m*h.cote)-h.m:-h.m);},0);
    var wins=paris.filter(function(h){return h.win&&!h.isCashout;}).length;
    var losses=paris.filter(function(h){return !h.win;}).length;
    var wr=paris.length?(wins/paris.length*100).toFixed(0):0;
    var cote=paris.length?(paris.reduce(function(a,h){return a+h.cote;},0)/paris.length).toFixed(2):'—';
    var sk=streak(paris);
    var sid='mc'+u.n.replace(/[^a-z0-9]/gi,'_');
    var link=FAV_LINKS[u.n]?'<a href="'+FAV_LINKS[u.n]+'" target="_blank" onclick="event.stopPropagation();" style="font-size:9px;color:var(--a);text-decoration:none;margin-left:5px;">📡</a>':'';
    var logo=logoHtml(u.n,u.color,u.abbr,46);
    var forme=formeHtml(paris,5);
    return '<div class="tcard" onclick="openClub(\''+u.n+'\','+idx+')">'
      +'<div class="tcard-top" style="background:'+p.bg+';">'
      +logo
      +'<div class="tinfo">'
      +'<div class="tname">'+(u.sport||'')+' '+u.n+link+'</div>'
      +'<div class="tsub">'+paris.length+' paris · '+'⭐'.repeat(u.s)+' · Palier '+u.l+'</div>'
      +forme
      +(sk.n>1?'<div class="spill" style="background:'+(sk.t?'rgba(30,215,96,.1)':'rgba(255,69,69,.1)')+';color:'+(sk.t?'var(--g)':'var(--r)')+';">'+(sk.t?'🔥':'❄️')+' Série '+(sk.t?'W':'L')+' : '+sk.n+'</div>':'')
      +'</div>'
      +'<div class="tprofit" style="color:'+p.c+';">'+fmt(profit)+'</div>'
      +'</div>'
      +'<div class="tmini"><canvas id="'+sid+'" style="height:55px;"></canvas></div>'
      +'<div class="tstats">'
      +'<div class="tstat"><div class="tstat-v" style="color:var(--g);">'+wins+'</div><div class="tstat-l">Wins</div></div>'
      +'<div class="tstat"><div class="tstat-v" style="color:var(--r);">'+losses+'</div><div class="tstat-l">Pertes</div></div>'
      +'<div class="tstat"><div class="tstat-v" style="color:'+p.c+';">'+wr+'%</div><div class="tstat-l">Réussite</div></div>'
      +'<div class="tstat"><div class="tstat-v" style="color:'+p.c+';">'+cote+'</div><div class="tstat-l">Cote moy</div></div>'
      +'</div></div>';
  }).join('');
  setTimeout(function(){
    state.u.forEach(function(u){
      var paris=state.a.filter(function(h){return h.n===u.n;});if(!paris.length)return;
      var p=gp(u),sid='mc'+u.n.replace(/[^a-z0-9]/gi,'_');
      var ctx=$i(sid);if(!ctx)return;
      var cum=0;
      var data=[0].concat(paris.slice().reverse().map(function(h){cum+=(h.win?(h.m*h.cote)-h.m:-h.m);return parseFloat(cum.toFixed(2));}));
      var c2=ctx.getContext('2d'),g=c2.createLinearGradient(0,0,0,55);
      g.addColorStop(0,p.fade.replace('.12','.3'));g.addColorStop(1,'rgba(0,0,0,0)');
      MC[u.n]=new Chart(c2,{type:'line',data:{labels:data.map(function(_,i){return i;}),datasets:[{data:data,borderColor:p.c,backgroundColor:g,borderWidth:1.5,fill:true,tension:.4,pointRadius:0}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{enabled:false}},scales:{x:{display:false},y:{display:false}}}});
    });
  },100);
}

/* ── DÉTAIL CLUB ── */
function openClub(nom,idx){
  _currentTeam=nom;
  Object.values(AC).forEach(function(c){try{c.destroy();}catch(e){}});AC={};
  showOngletMondialIfNational(nom);
  var u=state.u.find(function(x){return x.n===nom;});
  var p=gp(u||{color:PCOLS[0]});
  var paris=state.a.filter(function(h){return h.n===nom;});
  var profit=paris.reduce(function(a,h){return a+(h.win?(h.m*h.cote)-h.m:-h.m);},0);
  var wins=paris.filter(function(h){return h.win&&!h.isCashout;}).length;
  var losses=paris.filter(function(h){return !h.win;}).length;
  var wr=paris.length?(wins/paris.length*100).toFixed(0):0;
  var cote=paris.length?(paris.reduce(function(a,h){return a+h.cote;},0)/paris.length).toFixed(2):'—';
  var mise=paris.reduce(function(a,h){return a+parseFloat(h.m);},0);
  var roi=mise?(profit/mise*100).toFixed(2):0;
  var sk=streak(paris);
  var RC=2*Math.PI*28;var RO=RC-(wr/100)*RC;
  var gu=parseFloat(state.ugoals[nom])||0;var gp2=gu>0?Math.min(100,profit/gu*100):0;
  var cum2=0;
  var cv=[0].concat(paris.slice().reverse().map(function(h){cum2+=(h.win?(h.m*h.cote)-h.m:-h.m);return parseFloat(cum2.toFixed(2));}));
  var lb=['Départ'].concat(paris.slice().reverse().map(function(h){var adv=h.target&&h.target!=='-'?h.target:'';return (h.date||'')+(h.heure?' '+h.heure:'')+(adv?' vs '+adv:'')+(h.l?' P'+h.l:'')+'||'+(h.win?(h.m*h.cote-h.m>=0?'+':'')+parseFloat(h.m*h.cote-h.m).toFixed(2)+'€':'-'+parseFloat(h.m).toFixed(2)+'€');}));
  var pm2={};paris.forEach(function(h){var pts=h.t?h.t.split(' ')[0].split('/'):['??','??'];var k=pts.length>=2?pts[1]+'/'+pts[0]:'?';if(!pm2[k])pm2[k]=0;pm2[k]+=(h.win?(h.m*h.cote)-h.m:-h.m);});
  var mK=Object.keys(pm2),mV=mK.map(function(k){return parseFloat(pm2[k].toFixed(2));});
  var uObjL=state.u.find(function(x){return x.n===nom;});var link=(uObjL&&uObjL.link2)||(uObjL&&uObjL.link)||FAV_LINKS[nom]?'<a href="'+FAV_LINKS[nom]+'" target="_blank" style="font-size:10px;color:var(--a);text-decoration:none;display:inline-flex;align-items:center;gap:4px;margin-top:5px;">📡 Flashscore ↗</a>':'';
  var logo=logoHtml(nom,u?u.color:PCOLS[0],u?u.abbr:nom.substring(0,3),58);
  var forme=formeHtml(paris,7);

  $i('d-hero').innerHTML='<div class="dhero" style="background:'+p.bg+';border-bottom:1px solid '+p.border+';">'
    +'<button class="dback" onclick="closeClub()"><span>←</span> Retour</button>'
    +'<div class="dtop">'+logo
    +'<div><div class="dname">'+(u&&u.sport?u.sport+' ':'')+nom+'</div>'
    +'<div class="dsub">'+paris.length+' paris · '+'⭐'.repeat(u?u.s:1)+' · Palier '+(u?u.l:1)+'</div>'
    +forme+link
    +(sk.n>1?'<div class="spill" style="background:'+(sk.t?'rgba(30,215,96,.14)':'rgba(255,69,69,.12)')+';color:'+(sk.t?'var(--g)':'var(--r)')+';">'+(sk.t?'🔥':'❄️')+' '+sk.n+' consécutifs</div>':'')
    +'</div></div></div>';

  /* Lancer l'analyse IA en arrière-plan */
  setTimeout(function(){ loadTeamAI(nom); }, 300);

  $i('ip-bilan').innerHTML=
    '<div class="kpi2" style="margin-bottom:10px;">'
    +'<div class="kpibox" style="--ac:'+p.c+';"><div class="kpi-l">Bénéfice</div><div class="kpi-v" style="color:'+(profit>=0?'var(--g)':'var(--r)')+';">'+fmt(profit)+'</div></div>'
    +'<div class="kpibox" style="--ac:'+p.c+';"><div class="kpi-l">ROI</div><div class="kpi-v" style="color:'+( +roi>=0?'var(--g)':'var(--r)')+';">'+roi+'%</div></div>'
    +'</div>'
    +'<div class="card cp" style="margin-bottom:10px;"><div class="ringwrap">'
    +'<div class="rsvg"><svg width="74" height="74" viewBox="0 0 74 74"><circle cx="37" cy="37" r="28" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="6"/><circle cx="37" cy="37" r="28" fill="none" stroke="'+p.c+'" stroke-width="6" stroke-dasharray="'+RC.toFixed(1)+'" stroke-dashoffset="'+RO.toFixed(1)+'" stroke-linecap="round"/></svg>'
    +'<div class="rcenter"><div class="rv" style="color:'+p.c+';">'+wr+'%</div><div class="rl">réussite</div></div></div>'
    +'<div><div style="font-size:12px;color:var(--g);font-weight:700;margin-bottom:5px;">✅ '+wins+' victoires</div>'
    +'<div style="font-size:12px;color:var(--r);font-weight:700;margin-bottom:8px;">❌ '+losses+' défaites</div>'
    +'<div style="font-size:11px;color:var(--t3);">Cote moy : <b style="color:var(--t1);">'+cote+'</b></div>'
    +'<div style="font-size:11px;color:var(--t3);">Mise totale : <b style="color:var(--t1);">'+mise.toFixed(0)+'€</b></div>'
    +'</div></div></div>'
    +'<div class="card"><div style="display:flex;align-items:center;justify-content:space-between;padding:11px 14px;border-bottom:1px solid var(--b1);"><span style="font-size:11px;font-weight:600;color:var(--t2);">Objectif profit</span><button class="ba" data-nom="'+nom+'" onclick="setUG(this.dataset.nom)">MODIFIER</button></div>'
    +'<div class="cp" style="padding:12px 14px;">'
    +(gu>0
      ?'<div class="prog-row"><span style="font-size:12px;font-weight:700;">'+fmt(profit)+'</span><span style="font-size:10px;color:var(--t3);">/ +'+gu+'€ · '+gp2.toFixed(1)+'%</span></div>'
       +'<div class="prog-track"><div class="prog-fill" style="width:'+gp2.toFixed(1)+'%;background:'+(gp2>=100?'var(--g)':p.c)+';"></div></div>'
       +'<div class="prog-meta"><span style="color:'+p.c+';">'+gp2.toFixed(1)+'%</span><span>'+(gp2>=100?'🎉 Atteint !':'Reste '+(gu-profit).toFixed(2)+'€')+'</span></div>'
      :'<div style="font-size:12px;color:var(--t3);">Appuie sur Modifier pour définir un objectif.</div>')
    +'</div></div>'
    /* Bloc IA */
    +'<div class="fc" id="team-ai-box" style="margin-top:4px;">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
    +'<div style="display:flex;align-items:center;gap:7px;"><div id="team-ai-dot" style="width:7px;height:7px;border-radius:50%;background:#4d84ff;animation:aidot 1.5s infinite;"></div><span style="font-size:10px;font-weight:700;color:#7aaaff;letter-spacing:.5px;text-transform:uppercase;">Analyse IA — Tavily + Groq</span></div>'
    +'<button onclick="loadTeamAI(this.dataset.nom)" style="background:none;border:1px solid rgba(77,132,255,.3);border-radius:6px;color:#7aaaff;font-size:10px;font-weight:700;padding:3px 8px;cursor:pointer;">↻</button>'
    +'</div>'
    +'<div id="team-ai-content" style="font-size:12px;color:#8b97c4;line-height:1.7;"><div style="display:flex;align-items:center;gap:8px;color:#4f5d88;"><div style="width:12px;height:12px;border:2px solid rgba(77,132,255,.2);border-top-color:#4d84ff;border-radius:50%;animation:spin .8s linear infinite;flex-shrink:0;"></div>Recherche en cours…</div></div>'
    +'</div>';


  // ── Données pour les graphiques ──
  // Forme récente (5 derniers paris perso)
  var forme5 = paris.slice(0,5).reverse();

  // Dom vs Ext
  var domParis = paris.filter(function(h){ return h.lieu==='dom' || h.dom===true || h.domicile==='dom'; });
  var extParis = paris.filter(function(h){ return h.lieu==='ext' || h.dom===false || h.domicile==='ext'; });
  var neutreParis = paris.filter(function(h){ return !h.lieu && h.dom===undefined && !h.domicile; });
  var domProfit = domParis.reduce(function(a,h){ return a+(h.win?(h.m*h.cote)-h.m:-h.m); },0);
  var extProfit = extParis.reduce(function(a,h){ return a+(h.win?(h.m*h.cote)-h.m:-h.m); },0);
  var domWr = domParis.length ? (domParis.filter(function(h){return h.win;}).length/domParis.length*100).toFixed(0) : 0;
  var extWr = extParis.length ? (extParis.filter(function(h){return h.win;}).length/extParis.length*100).toFixed(0) : 0;

  // Types de paris (top 4)
  var tmG={};
  paris.forEach(function(h){
    var t=(h.type||'Autre').trim().split(' ')[0];
    if(!tmG[t])tmG[t]={n:0,wins:0,profit:0};
    tmG[t].n++;if(h.win)tmG[t].wins++;
    tmG[t].profit+=(h.win?(h.m*h.cote)-h.m:-h.m);
  });
  var topTypes=Object.entries(tmG).sort(function(a,b){return b[1].n-a[1].n;}).slice(0,4);

  $i('ip-graphiques').innerHTML=
    // ── 1. Courbe de profit ──
    '<div class="cwrap"><div class="ctitle">📈 Évolution du profit</div>'
    +'<div style="height:180px;position:relative;"><canvas id="dc-courbe"></canvas></div>'
    +'<div class="chart-info-bar" id="cib-club"><span class="cib-main" id="cib-club-txt">Touche un point</span><span class="cib-val" id="cib-club-val"></span></div></div>'

    // ── 2. Forme récente (5 derniers paris perso) ──
    +'<div class="cwrap"><div class="ctitle">🔥 Mes 5 derniers paris sur cette équipe</div>'
    +'<div style="display:flex;gap:8px;align-items:center;padding:10px 0;">'
    +(forme5.length ? forme5.map(function(h){
      var col = h.win ? '#1ed760' : '#ff4545';
      var bg = h.win ? 'rgba(30,215,96,.15)' : 'rgba(255,69,69,.15)';
      var border = h.win ? 'rgba(30,215,96,.4)' : 'rgba(255,69,69,.4)';
      var gain = h.win ? '+'+(h.m*h.cote-h.m).toFixed(1)+'€' : '-'+h.m+'€';
      return '<div style="flex:1;text-align:center;background:'+bg+';border:1px solid '+border+';border-radius:8px;padding:8px 4px;">'
        +'<div style="font-size:14px;font-weight:800;color:'+col+';">'+(h.win?'W':'L')+'</div>'
        +'<div style="font-size:9px;color:'+col+';margin-top:2px;">'+gain+'</div>'
        +'<div style="font-size:8px;color:rgba(255,255,255,.3);margin-top:2px;">@'+h.cote+'</div>'
        +'</div>';
    }).join('') : '<div style="color:var(--t3);font-size:12px;">Pas encore de paris</div>')
    +'</div></div>'

    // ── 3. Dom vs Ext ──
    +(paris.length ? '<div class="cwrap"><div class="ctitle">🏠 Domicile vs 🚌 Extérieur</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 0;">'
    +'<div style="text-align:center;background:rgba(30,215,96,.08);border:1px solid rgba(30,215,96,.2);border-radius:8px;padding:12px;">'
    +'<div style="font-size:11px;color:var(--t3);margin-bottom:4px;">🏠 Domicile</div>'
    +(domParis.length
      ? '<div style="font-size:20px;font-weight:800;color:#1ed760;">'+domWr+'%</div>'
        +'<div style="font-size:10px;color:var(--t3);">'+domParis.length+' paris</div>'
        +'<div style="font-size:12px;font-weight:700;color:'+(domProfit>=0?'#1ed760':'#ff4545')+';">'+(domProfit>=0?'+':'')+domProfit.toFixed(2)+'€</div>'
      : '<div style="font-size:12px;color:var(--t3);">Aucune donnée</div><div style="font-size:9px;color:var(--t3);margin-top:4px;">Coche Dom à la saisie</div>')
    +'</div>'
    +'<div style="text-align:center;background:rgba(77,132,255,.08);border:1px solid rgba(77,132,255,.2);border-radius:8px;padding:12px;">'
    +'<div style="font-size:11px;color:var(--t3);margin-bottom:4px;">🚌 Extérieur</div>'
    +(extParis.length
      ? '<div style="font-size:20px;font-weight:800;color:#4d84ff;">'+extWr+'%</div>'
        +'<div style="font-size:10px;color:var(--t3);">'+extParis.length+' paris</div>'
        +'<div style="font-size:12px;font-weight:700;color:'+(extProfit>=0?'#1ed760':'#ff4545')+';">'+(extProfit>=0?'+':'')+extProfit.toFixed(2)+'€</div>'
      : '<div style="font-size:12px;color:var(--t3);">Aucune donnée</div><div style="font-size:9px;color:var(--t3);margin-top:4px;">Coche Ext à la saisie</div>')
    +'</div>'
    +'</div></div>' : '')

    // ── 4. Top types de paris ──
    +(topTypes.length ? '<div class="cwrap"><div class="ctitle">🎯 Mes types de paris</div>'
    +'<div style="display:flex;flex-direction:column;gap:7px;padding:8px 0;">'
    +topTypes.map(function(e){
      var t=e[0], d=e[1];
      var pct=(d.wins/d.n*100).toFixed(0);
      var col=d.profit>=0?'#1ed760':'#ff4545';
      var barCol=d.profit>=0?'rgba(30,215,96,.6)':'rgba(255,69,69,.5)';
      var maxBar=topTypes[0][1].n;
      return '<div style="display:flex;align-items:center;gap:8px;">'
        +'<div style="font-size:11px;font-weight:700;color:var(--t1);width:80px;flex-shrink:0;">'+t+'</div>'
        +'<div style="flex:1;height:6px;background:rgba(255,255,255,.06);border-radius:3px;">'
        +'<div style="height:6px;border-radius:3px;background:'+barCol+';width:'+(d.n/maxBar*100).toFixed(0)+'%;"></div></div>'
        +'<div style="font-size:10px;color:var(--t3);width:20px;text-align:right;">'+d.n+'</div>'
        +'<div style="font-size:11px;font-weight:700;color:'+col+';width:55px;text-align:right;">'+(d.profit>=0?'+':'')+d.profit.toFixed(1)+'€</div>'
        +'<div style="font-size:10px;color:var(--t3);width:30px;text-align:right;">'+pct+'%</div>'
        +'</div>';
    }).join('')
    +'</div></div>' : '')

    // ── 5. Profit par mois ──
    +(mK.length?'<div class="cwrap"><div class="ctitle">📅 Profit par mois</div><div style="height:150px;position:relative;"><canvas id="dc-mois"></canvas></div></div>':'');

  /* archive */
  var am2={};
  paris.forEach(function(h){var pts=h.t?h.t.split(' ')[0].split('/'):['??','??'];var k=pts.length>=2?pts[1]+'/'+pts[0]:'?';if(!am2[k])am2[k]={paris:[],profit:0};am2[k].paris.push(h);am2[k].profit+=(h.win?(h.m*h.cote)-h.m:-h.m);});
  if(paris.length){
    $i('ip-archive').innerHTML=Object.keys(am2).map(function(key){
      var d=am2[key];var pC=d.profit>=0?'var(--g)':'var(--r)';
      return '<div class="mh"><div class="mh-lbl">'+key+' · '+d.paris.length+' paris</div><div class="mh-val" style="color:'+pC+';">'+fmt(d.profit)+'</div></div>'
        +d.paris.map(function(h){
          var b2=bki(h.b);var dd=h.date?'📅 '+h.date+' ':'';var hh=h.heure?'⏰ '+h.heure+' ':'';
          return '<div class="brow '+(h.win?'w':'l')+'">'
            +'<div class="brow-main"><div class="brow-title">'+(h.sport||'')+' '+h.target+'</div>'
            +'<div class="brow-meta">'+h.t+' '+dd+hh+'· '+(h.type||'—')+' · @'+h.cote+' · <span style="color:'+b2.c+';">'+b2.n+'</span>'+(h.debrief?'<br><i>'+h.debrief+'</i>':'')+'</div></div>'
            +'<div class="brow-right"><div class="brow-amt" style="color:'+(h.win?'var(--g)':'var(--r)')+';">'+(h.win?'+'+(h.m*h.cote).toFixed(2):'-'+h.m)+'€</div>'
            +'<div class="brow-tag" style="color:'+(h.win?'var(--g)':'var(--r)')+';">'+(h.win?'WIN':'LOSS')+'</div></div></div>';
        }).join('');
    }).join('');
  } else {
    $i('ip-archive').innerHTML='<div class="empty">Aucun pari archivé</div>';
  }

  /* types */
  var tm={};paris.forEach(function(h){var t=(h.type||'Autre').trim();if(!tm[t])tm[t]={n:0,wins:0,profit:0};tm[t].n++;if(h.win)tm[t].wins++;tm[t].profit+=(h.win?(h.m*h.cote)-h.m:-h.m);});
  var ts=Object.entries(tm).sort(function(a,b){return b[1].n-a[1].n;});var maxN=ts.length?ts[0][1].n:1;
  $i('ip-types').innerHTML=ts.length
    ?'<div class="card cp">'+ts.map(function(e){
        var t=e[0],d=e[1];var pct=(d.wins/d.n*100).toFixed(0);var pC=d.profit>=0?'var(--g)':'var(--r)';
        return '<div class="tyrow"><div class="tyn">'+t+'</div>'
          +'<div class="tytrack"><div class="tyfill" style="width:'+(d.n/maxN*100).toFixed(0)+'%;background:'+p.c+';"></div></div>'
          +'<div class="typct" style="color:'+p.c+';">'+pct+'%</div>'
          +'<div class="tyn2">'+d.n+'</div>'
          +'<div class="typ" style="color:'+pC+';">'+fmt(d.profit)+'</div></div>';
      }).join('')+'</div>'
    :'<div class="empty">Aucun type</div>';

  document.querySelectorAll('.itab').forEach(function(t){t.classList.remove('on');});
  document.querySelectorAll('.ipanel').forEach(function(c){c.classList.remove('on');});
  document.querySelector('.itab').classList.add('on');
  $i('ip-bilan').classList.add('on');
  $i('t-bilan').style.display='none';
  $i('detail').style.display='block';

  setTimeout(function(){
    if(cv.length>1){
      var ctx=$i('dc-courbe');
      if(ctx){
        var c3=ctx.getContext('2d');
        var g=c3.createLinearGradient(0,0,0,180);
        g.addColorStop(0,p.fade.replace('.12','.28'));g.addColorStop(1,'rgba(0,0,0,0)');
        AC.courbe=new Chart(c3,{
          type:'line',
          data:{labels:lb,datasets:[{data:cv,borderColor:p.c,backgroundColor:g,borderWidth:2,fill:true,tension:.4,pointRadius:cv.length<12?3:0,pointBackgroundColor:p.c}]},
          options:{
            responsive:true,maintainAspectRatio:false,
            plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(8,11,18,.96)',borderColor:p.border,borderWidth:1,titleColor:'#4f5d88',bodyColor:p.c,bodyFont:{weight:'bold'},callbacks:{title:function(ii){return lb[ii[0].dataIndex]||'';},label:function(ii){return (ii.raw>=0?'+':'')+ii.raw+'€';}}}},
            scales:{x:{ticks:{color:'#4f5d88',font:{size:8},maxTicksLimit:6},grid:{display:false}},y:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'€';}}}}
          }
        });
      }
      attachTouchTooltip('dc-courbe',function(){return window._gcClub;},'cib-club','cib-club-txt','cib-club-val');
    }
    if(mK.length){
      var ctx2=$i('dc-mois');
      if(ctx2){
        AC.mois=new Chart(ctx2.getContext('2d'),{
          type:'bar',
          data:{labels:mK,datasets:[{data:mV,backgroundColor:mV.map(function(v){return v>=0?'rgba(30,215,96,.55)':'rgba(255,69,69,.55)';}),borderColor:mV.map(function(v){return v>=0?'#1ed760':'#ff4545';}),borderWidth:1,borderRadius:4}]},
          options:{
            responsive:true,maintainAspectRatio:false,
            plugins:{legend:{display:false},tooltip:{callbacks:{label:function(i){return (i.raw>=0?'+':'')+i.raw.toFixed(2)+'€';}}}},
            scales:{x:{ticks:{color:'#4f5d88',font:{size:9}},grid:{display:false}},y:{ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'€';}},grid:{color:'rgba(255,255,255,.03)'}}}
          }
        });
      }
    }
  },80);
}

function setUG(nom){var v=prompt('Objectif profit pour '+nom+' (€) :',state.ugoals[nom]||0);if(v!=null&&!isNaN(+v)){state.ugoals[nom]=+v;save();}}
function closeClub(){Object.values(AC).forEach(function(c){try{c.destroy();}catch(e){}});AC={};$i('detail').style.display='none';$i('t-bilan').style.display='block';}
function swInner(id,btn){
  if(id==='saisons') setTimeout(loadTeamSaisons, 50);document.querySelectorAll('.itab').forEach(function(t){t.classList.remove('on');});document.querySelectorAll('.ipanel').forEach(function(c){c.classList.remove('on');});if(btn)btn.classList.add('on');$i('ip-'+id).classList.add('on');}

/* ── PARIS ── */
function pari(isS){
  var n,b,c,m,target,type,l=1,sport='',comp='',heure='',date='';
  var now=new Date();
  var t=now.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})+' '+now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  if(isS){
    var u=state.u.find(function(x){return x.n===$i('c-unit').value;});if(!u)return alert('Aucune équipe !');
    n=u.n;target=$i('c-target').value||'-';type=getMmLabel()||'-';
    sport=$i('c-sport').value||'';comp=$i('c-comp').value||'';
    heure=$i('c-heure').value||'';date=$i('c-date').value||'';
    b=$i('c-book').value;c=getMmCote();
    m=parseFloat($i('c-mise').value)||0;l=u.l;
    var notes=($i('c-notes')&&$i('c-notes').value)||'';
  }else{
    n='SIMPLE';sport=$i('p-sport').value;heure=$i('n-heure').value||'';date=$i('n-date').value||'';
    comp=$i('n-comp').value;var nteam=($i('n-team')&&$i('n-team').value)||'';var nadv=($i('n-analysis')&&$i('n-analysis').value)||'';target=(nteam&&nadv?nteam+' vs '+nadv:nteam||nadv||comp||'Pari simple');
    type=getMmLabelSimple()||$i('n-type').value||'-';b=$i('n-book').value;
    c=parseFloat($i('n-cote').value.replace(',','.'))||0;m=parseFloat($i('n-mise').value)||0;
  }
  if(m>0&&(parseFloat(state.b[b])||0)>=m){
    state.b[b]=(parseFloat(state.b[b])-m).toFixed(2);
    var isFlash=!isS&&$i('n-flashboost')&&$i('n-flashboost').checked;
    var isFreebet=!isS&&$i('n-freebet')&&$i('n-freebet').checked;
    var domicile=($i('n-lieu')&&$i('n-lieu').value)||($i('p-domicile')?$i('p-domicile').value:'');state.h.unshift({id:Date.now().toString(),n:n,target:target,b:b,l:l,m:m,cote:c,isS:isS,isFlash:isFlash,isFreebet:isFreebet,t:t,sport:sport,type:type,comp:comp,heure:heure,date:date,notes:notes||'',domicile:domicile});
    save();
    if(isS){$i('c-target').value='';$i('c-comp').value='';if($i('c-notes'))$i('c-notes').value='';}
    else{$i('n-comp').value='';$i('n-type').value='';$i('n-analysis').value='';if($i('n-notes'))$i('n-notes').value='';if($i('n-team'))$i('n-team').value='';if($i('n-flashboost'))$i('n-flashboost').checked=false;if($i('n-freebet'))$i('n-freebet').checked=false;mmRowsSimple=[{type:'',cote:1.50}];renderMmRowsSimple();}
  }else alert('Solde insuffisant sur '+bki(b).n+' !');
}
function result(id,win){
  var idx=state.h.findIndex(function(x){return x.id===id;});if(idx===-1)return;
  var bet=state.h[idx];
  var debrief=prompt('Débrief ('+(win?'WIN ✅':'LOSS ❌')+') :','')||'';
  if(win){var _g=bet.isFreebet?(bet.m*(bet.cote-1)):(bet.m*bet.cote);state.b[bet.b]=(parseFloat(state.b[bet.b])+_g).toFixed(2);if(bet.isS){var u=state.u.find(function(x){return x.n===bet.n;});if(u)u.l=1;}}
  else if(bet.isS){var u2=state.u.find(function(x){return x.n===bet.n;});if(u2&&u2.l<8)u2.l++;}
  var archived=Object.assign({},bet,{win:win,debrief:debrief});
  state.a.unshift(archived);state.h.splice(idx,1);save();updMise();
}
function cancelBet(id){
  if(!confirm('Annuler ce pari et rembourser la mise ?'))return;
  var idx=state.h.findIndex(function(x){return x.id===id;});if(idx===-1)return;
  var bet=state.h[idx];
  state.b[bet.b]=(parseFloat(state.b[bet.b]||0)+parseFloat(bet.m)).toFixed(2);
  if(bet.isS&&bet.l){var u=state.u.find(function(x){return x.n===bet.n;});if(u)u.l=parseInt(bet.l)||1;}
  state.h.splice(idx,1);save();
}
function deleteArchived(id){
  if(!confirm('Supprimer ce pari ?'))return;
  var idx=state.a.findIndex(function(x){return x.id===id;});if(idx===-1)return;
  var bet=state.a[idx];
  if(bet.win)state.b[bet.b]=(parseFloat(state.b[bet.b]||0)-(bet.m*bet.cote)).toFixed(2);
  else state.b[bet.b]=(parseFloat(state.b[bet.b]||0)+parseFloat(bet.m)).toFixed(2);
  state.a.splice(idx,1);save();
}
function editArchived(id){
  var idx=state.a.findIndex(function(x){return x.id===id;});if(idx===-1)return;
  var bet=state.a[idx];
  if(bet.isPending){
    // Pari en attente : choisir le résultat
    var choix=confirm('Résultat du pari "'+((bet.target&&bet.target!=='-'?bet.target:bet.n)||'?')+'" ?\n\nOK = GAGNÉ ✅\nAnnuler = PERDU ❌');
    bet.isPending=false;
    bet.win=choix;
    if(bet.b && state.b){
      if(choix){state.b[bet.b]=(parseFloat(state.b[bet.b]||0)+(bet.m*bet.cote)-parseFloat(bet.m)).toFixed(2);}
      else{state.b[bet.b]=(parseFloat(state.b[bet.b]||0)-parseFloat(bet.m)).toFixed(2);}
    }
    save();renderArchive();return;
  }
  if(!confirm('Inverser le résultat ? (actuellement '+(bet.win?'WIN':'LOSS')+')'))return;
  if(bet.win){state.b[bet.b]=(parseFloat(state.b[bet.b]||0)-(bet.m*bet.cote)+parseFloat(bet.m)).toFixed(2);}
  else{state.b[bet.b]=(parseFloat(state.b[bet.b]||0)-parseFloat(bet.m)+(bet.m*bet.cote)).toFixed(2);}
  bet.win=!bet.win;save();
}
function updMise(){
  var u=state.u.find(function(x){return x.n===$i('c-unit').value;});
  if(!u)return;
  if($i('c-mise'))$i('c-mise').value=STRATS[u.s][u.l-1]||0;
  /* Auto-fill sport */
  if(u.sport&&$i('c-sport'))$i('c-sport').value=u.sport;
  /* Auto-fill competition from CLUB_DB */
  var db=CLUB_DB.find(function(c){return c.name===u.n;});
  if(db&&db.league&&$i('c-comp'))$i('c-comp').value=db.league;
  /* Auto-fill adversaires via API */
  autoFillAdv(u);
  renderCrash();
}
function autoFillAdv(u){
  var TEAM_IDS={};  /* placeholder - API not used */
  var tid=TEAM_IDS[u.n];
  var advEl=$i('c-target');
  if(!tid||!advEl)return;
  apiFootball('/fixtures',{team:tid,next:5},function(d,e){
    if(e||!d||!d.response||!d.response.length)return;
    /* Fill adversaires-list datalist */
    var opps=d.response.map(function(f){
      return f.teams.home.id===tid?f.teams.away.name:f.teams.home.name;
    });
    /* Also fill competition if not set */
    if($i('c-comp'))$i('c-comp').value=d.response[0].league.name;
    /* Fill date of next match */
    var next=d.response[0];
    if(next&&$i('c-date'))$i('c-date').value=next.fixture.date.substring(0,10);
    /* Update adversaire dropdown */
    var adv=$i('adv-res-cock');
    if(adv&&opps.length){
      adv.style.display='block';
      adv.innerHTML=opps.map(function(v){
        return '<div style="padding:8px 12px;cursor:pointer;font-size:12px;border-bottom:1px solid var(--b1);" data-v="'+v+'" data-t="c-target" data-r="adv-res-cock" onclick="pickAdv(this.dataset.v,this.dataset.t,this.dataset.r)">'+v+'</div>';
      }).join('');
      setTimeout(function(){if(adv)adv.style.display='none';},5000);
    }
  });
}

/* ── BANK ── */
function fund(add){
  var b=$i('mv-book').value;var amt=parseFloat($i('mv-amt').value);
  if(!b||isNaN(amt))return;
  state.b[b]=(parseFloat(state.b[b]||0)+(add?amt:-amt)).toFixed(2);
  if(add)state.start_bk+=amt;save();
}
function addBook(){
  var inp=$i('new-bk');var name=inp.value.trim().toLowerCase();if(!name)return;
  if(state.b[name]!==undefined)return alert('Existe déjà !');
  var col=($i('new-bk-color')&&$i('new-bk-color').value)||'#4d84ff';
  var init=parseFloat(prompt('Solde de départ pour '+name+' ?','0'))||0;
  /* Stocker la couleur perso dans state.bkColors */
  if(!state.bkColors)state.bkColors={};loadCustomLinks();_typeColors=JSON.parse(localStorage.getItem('g45_typecolors')||'{}');var _n=localStorage.getItem('gones45_note');var _ni=$i('pc-note');if(_ni&&_n)_ni.innerHTML=_n;var tk=localStorage.getItem('gones45_tavily_key');var tki=$i('tavily-key-input');if(tki&&tk)tki.value=tk;var ask=localStorage.getItem('gones45_apisports_key');var aski=$i('apisports-key-input');if(aski&&ask)aski.value=ask;
  state.bkColors[name]=col;
  state.b[name]=init.toFixed(2);state.start_bk+=init;inp.value='';save();
}
function changeBookColor(el){
  var k=el.dataset.bk;var col=el.value;
  if(!state.bkColors)state.bkColors={};loadCustomLinks();_typeColors=JSON.parse(localStorage.getItem('g45_typecolors')||'{}');var _n=localStorage.getItem('gones45_note');var _ni=$i('pc-note');if(_ni&&_n)_ni.innerHTML=_n;var tk=localStorage.getItem('gones45_tavily_key');var tki=$i('tavily-key-input');if(tki&&tk)tki.value=tk;var ask=localStorage.getItem('gones45_apisports_key');var aski=$i('apisports-key-input');if(aski&&ask)aski.value=ask;
  state.bkColors[k]=col;
  save();
}
function delBook(k){if(confirm('Supprimer '+bki(k).n+' ?')){delete state.b[k];save();}}
function editBook(k){
  var v=prompt('Nouveau solde pour '+bki(k).n+' ?',parseFloat(state.b[k]));
  if(v!=null){var nv=parseFloat(v);if(!isNaN(nv)){state.start_bk+=(nv-parseFloat(state.b[k]));state.b[k]=nv;save();}}
}
function addUnit(){
  var name=($i('u-name')&&$i('u-name').value||'').trim();if(!name)return;
  var color=$i('u-color').value||selColor||PCOLS[0];
  var pending=window._pendingLogo&&window._pendingLogo.name===name?window._pendingLogo:null;
  var abbr=pending?pending.abbr:name.substring(0,3).toUpperCase();
  var logoUrl=pending?pending.url:(LOGOS[name]||null);
  if(pending&&pending.color)color=pending.color;
  if(state.u.find(function(u){return u.n===name;}))return alert('Existe déjà !');
  var ulink=($i('u-link')&&$i('u-link').value.trim())||'';
  var ulink2=($i('u-link2')&&$i('u-link2').value.trim())||'';
  var unote=($i('u-note')&&$i('u-note').value.trim())||'';var utype=($i('u-type')&&$i('u-type').value)||'club';state.u.push({n:name,abbr:abbr,color:color,s:$i('u-stars').value,l:1,sport:($i('u-sport')&&$i('u-sport').value)||'⚽',logoUrl:logoUrl||'',link:ulink,link2:ulink2,note:unote,type:utype});
  if(logoUrl)LOGOS[name]=logoUrl;
  $i('u-name').value='';
  if($i('u-link'))$i('u-link').value='';
  if($i('u-link2'))$i('u-link2').value='';
  $i('search-results').innerHTML='';
  window._pendingLogo=null;
  save();
}
function editUnit(i){
  var u=state.u[parseInt(i)];if(!u)return;
  var m=$i('edit-unit-modal');if(!m)return;
  $i('edit-unit-idx').value=i;
  $i('edit-unit-name').value=u.n||'';
  $i('edit-unit-stars').value=u.s||'3';
  $i('edit-unit-note').value=u.note||'';
  $i('edit-unit-color').value=u.color||'#4d84ff';
  m.style.display='flex';
}
function closeEditUnit(){var m=$i('edit-unit-modal');if(m)m.style.display='none';}
function saveEditUnit(){
  var i=parseInt($i('edit-unit-idx').value);
  var u=state.u[i];if(!u)return;
  var newName=($i('edit-unit-name').value||u.n).trim().toUpperCase();
  // Si le nom change, on garde le logo existant
  u.n=newName;
  u.s=$i('edit-unit-stars').value||u.s;
  u.note=$i('edit-unit-note').value.trim();
  u.color=$i('edit-unit-color').value||u.color;
  // Conserver le logoUrl existant — ne pas l'effacer
  // u.logoUrl reste intact
  save();render();closeEditUnit();
}
function rmUnit(i){var u=state.u[parseInt(i)];if(u&&confirm('Supprimer '+u.n+' ?')){state.u.splice(parseInt(i),1);save();}}

/* ── NAV ── */
function showTab(id,btn){
  document.querySelectorAll('.tab').forEach(function(t){t.style.display='none';});
  var det=$i('detail');if(det)det.style.display='none';
  var t=$i(id);if(t)t.style.display='block';
  document.querySelectorAll('.ni').forEach(function(b){b.classList.remove('on');});
  if(btn)btn.classList.add('on');
  render();
  /* Lazy-render tab-specific content */
  if(id==='t-bilan')setTimeout(function(){renderBilanTab();renderGlobalCharts();},50);
}

// ── COMBINÉ ──
var combiRows = [];

function addCombiRow() {
  var id = Date.now();
  combiRows.push({id:id, label:'', cote:1.50, sport:'⚽'});
  renderCombiRows();
}

function renderCombiRows() {
  var el = document.getElementById('combi-rows');
  if(!el) return;
  if(!combiRows.length) { el.innerHTML=''; updateCombiCote(); return; }
  var sports = ['⚽ Football','🏀 Basket','🎾 Tennis','🏈 NFL','🏒 Hockey','⚾ Baseball','🏉 Rugby','🏎 F1'];
  var html = '';
  combiRows.forEach(function(row, i) {
    html += '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:12px;margin-bottom:10px;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">';
    html += '<span style="font-size:12px;font-weight:800;color:var(--a);">Sélection '+(i+1)+'</span>';
    html += '<button onclick="removeCombiRow('+row.id+')" style="background:none;border:none;color:var(--t3);font-size:16px;cursor:pointer;">✕</button>';
    html += '</div>';
    // Sport + Compet
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">';
    html += '<select class="fi" style="font-size:11px;" onchange="combiRows['+i+'].sport=this.value">';
    sports.forEach(function(s){ var v=s.split(' ')[0]; html += '<option value="'+v+'"'+(row.sport===v?' selected':'')+'>'+s+'</option>'; });
    html += '</select>';
    html += '<input class="fi" placeholder="Compétition" value="'+(row.comp||'')+'" oninput="combiRows['+i+'].comp=this.value" style="font-size:11px;">';
    html += '</div>';
    // Equipe + Adversaire
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">';
    html += '<input class="fi" placeholder="Équipe / Joueur" value="'+(row.team||'')+'" oninput="combiRows['+i+'].team=this.value" style="font-size:11px;">';
    html += '<input class="fi" placeholder="Adversaire" value="'+(row.adv||'')+'" oninput="combiRows['+i+'].adv=this.value" style="font-size:11px;">';
    html += '</div>';
    // Type + Cote
    html += '<div style="display:grid;grid-template-columns:1fr 80px;gap:8px;margin-bottom:8px;">';
    html += '<input class="fi" placeholder="Type de pari (ex: Victoire, O2.5…)" value="'+(row.type||'')+'" oninput="combiRows['+i+'].type=this.value" style="font-size:11px;">';
    html += '<input class="fi" type="number" value="'+row.cote+'" min="1.01" step="0.01" oninput="combiRows['+i+'].cote=parseFloat(this.value)||1;updateCombiCote()" style="font-size:14px;font-weight:800;text-align:center;color:#f0b020;">';
    html += '</div>';
    html += '</div>';
  });
  el.innerHTML = html;
  updateCombiCote();
}

function removeCombiRow(id) {
  combiRows = combiRows.filter(function(r){ return r.id !== id; });
  renderCombiRows();
}

function updateCombiCote() {
  var coteTot = combiRows.reduce(function(acc,r){ return acc*(parseFloat(r.cote)||1); }, 1);
  var mise = parseFloat(document.getElementById('combi-mise')&&document.getElementById('combi-mise').value||0);
  var gain = mise * coteTot;
  var ctEl = document.getElementById('combi-cote-total');
  var gEl = document.getElementById('combi-gain');
  if(ctEl) ctEl.textContent = combiRows.length ? coteTot.toFixed(2) : '—';
  if(gEl) gEl.textContent = (combiRows.length && mise) ? '+'+((gain-mise).toFixed(2))+'€' : '—';
  // Fill bookmaker select
  var bkEl = document.getElementById('combi-book');
  if(bkEl && !bkEl.options.length) {
    Object.keys(state.b||{}).forEach(function(k){
      var opt = document.createElement('option');
      opt.value = k; opt.textContent = k.charAt(0).toUpperCase()+k.slice(1);
      bkEl.appendChild(opt);
    });
  }
}

function setCombiLieu(lieu) {
  var el = document.getElementById('combi-lieu');
  if(el) el.value = lieu;
  ['dom','ext','neu'].forEach(function(l){
    var btn = document.getElementById('combi-'+l+'-btn');
    if(!btn) return;
    var active = (l==='neu' && lieu==='') || l===lieu;
    btn.style.border = active ? '2px solid rgba(30,215,96,.4)' : '2px solid var(--b2)';
    btn.style.background = active ? 'rgba(30,215,96,.1)' : 'var(--bg3)';
    btn.style.color = active ? '#1ed760' : 'var(--t2)';
  });
}

function saveCombi(win) {
  if(!combiRows.length) { alert('Ajoute au moins une sélection'); return; }
  var coteTot = combiRows.reduce(function(acc,r){ return acc*(parseFloat(r.cote)||1); }, 1);
  var mise = parseFloat(document.getElementById('combi-mise').value)||0;
  var book = document.getElementById('combi-book').value;
  var date = document.getElementById('combi-date').value || new Date().toISOString().split('T')[0];
  var heure = document.getElementById('combi-heure').value || '';
  var notes = document.getElementById('combi-notes').value || '';
  var label = combiRows.map(function(r){ return (r.team||r.type||'Sél.')+(r.adv?' vs '+r.adv:''); }).join(' + ');
  var lieu = document.getElementById('combi-lieu') ? document.getElementById('combi-lieu').value : '';
  var isFreebet = document.getElementById('combi-freebet') ? document.getElementById('combi-freebet').checked : false;

  if(!mise || !book) { alert('Mise et bookmaker requis'); return; }

  var pari = {
    id: Date.now().toString(),
    n: label,
    target: combiRows[0]?(combiRows[0].team||combiRows[0].adv||label):label,
    b: book,
    m: mise,
    cote: coteTot,
    win: win,
    sport: combiRows[0]?combiRows[0].sport:'🎲',
    comp: combiRows[0]?combiRows[0].comp:'',
    type: 'Combiné ('+combiRows.length+' sél.)',
    isCombi: true,
    combiRows: combiRows.map(function(r){ return {team:r.team,adv:r.adv,type:r.type,cote:r.cote,sport:r.sport,comp:r.comp}; }),
    t: date,
    date: date,
    heure: heure,
    notes: notes,
    domicile: lieu,
    isFlash: false,
    isFreebet: isFreebet
  };

  state.a.unshift(pari);
  save();

  // Reset
  combiRows = [];
  renderCombiRows();
  document.getElementById('combi-mise').value = '10';
  document.getElementById('combi-notes').value = '';
  document.getElementById('combi-cote-total').textContent = '—';
  document.getElementById('combi-gain').textContent = '—';

  // Feedback
  var profit = win ? (mise*coteTot - mise) : -mise;
  alert((win ? '✅ Gagné !' : '❌ Perdu') + '\n' + label + '\nCote: @'+coteTot.toFixed(2) + '\n' + (win ? '+' : '') + profit.toFixed(2)+'€');
  render();
}

function swBet(mode){
  var isS=mode==='strat';
  var isC=mode==='combi';
  var ss=$i('sub-strat');if(ss)ss.style.display=isS?'block':'none';
  var sp=$i('sub-simple');if(sp)sp.style.display=(!isS&&!isC)?'block':'none';
  var sc=$i('sub-combi');if(sc)sc.style.display=isC?'block':'none';
  var bc=$i('btn-cpit');if(bc)bc.classList.toggle('on',isS);
  var bs=$i('btn-simp');if(bs)bs.classList.toggle('on',!isS&&!isC);
  var bb=$i('btn-comb');if(bb)bb.classList.toggle('on',isC);
  if(isC){ updateCombiCote(); }
}
function exportData(){var d='data:text/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(state));var a=document.createElement('a');a.href=d;a.download='gones45_backup.json';a.click();}

function importBetAnalytix() {
  var bkStr = prompt('💰 Bankroll de départ au moment du premier pari (ex: 1000) :', '');
  if(bkStr === null) return;
  var bkDepart = parseFloat(bkStr) || 0;

  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.onchange = function(e) {
    var file = e.target.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      var text = ev.target.result;
      var lines = text.split('\n').filter(function(l){ return l.trim(); });
      if(!lines.length) return;

      // Parser CSV avec séparateur ;
      function parseCSVLine(line) {
        var result = [], cur = '', inQ = false;
        for(var i=0;i<line.length;i++){
          var c = line[i];
          if(c==='"') { inQ=!inQ; }
          else if(c===';' && !inQ) { result.push(cur.trim()); cur=''; }
          else { cur+=c; }
        }
        result.push(cur.trim());
        return result;
      }

      var headers = parseCSVLine(lines[0]);
      var idxDate=headers.indexOf('Date'), idxType=headers.indexOf('Type'),
          idxSport=headers.indexOf('Sport'), idxLabel=headers.indexOf('Label'),
          idxOdds=headers.indexOf('Odds'), idxStake=headers.indexOf('Stake'),
          idxState=headers.indexOf('State'), idxBook=headers.indexOf('Bookmaker'),
          idxComp=headers.indexOf('Competition'), idxCat=headers.indexOf('Category'),
          idxComment=headers.indexOf('Comment'), idxBonus=headers.indexOf('Bonus'),
          idxFB=headers.indexOf('Freebet');

      var imported = 0, skipped = 0;
      if(!state.a) state.a = [];

      var lastCombined = null; // garde le dernier pari Combined pour y attacher les sous-paris
      lines.slice(1).forEach(function(line) {
        var cols = parseCSVLine(line);
        if(cols.length < 5) { skipped++; return; }

        var dateStr = cols[idxDate]||'';
        var betType = cols[idxType]||'';
        var label   = cols[idxLabel]||'';
        var odds    = parseFloat(cols[idxOdds])||1;
        var stake   = parseFloat(cols[idxStake])||0;

        // Sous-pari d'un combiné : pas de date, pas de mise
        if(!dateStr && !stake && label && lastCombined) {
          var subState = cols[idxState]||'';
          var subWin = subState==='W'||subState==='V'||subState==='WIN'||subState==='GAGNE';
          var subLoss = subState==='L'||subState==='PERDU'||subState==='LOSE';
          var subPend = subState==='P'||subState==='PENDING';
          if(subWin || subLoss || subPend) {
            if(!lastCombined.sousParis) lastCombined.sousParis = [];
            lastCombined.sousParis.push({ label: label, cote: odds, win: subWin, isPending: subPend });
          }
          return;
        }
        var label   = cols[idxLabel]||'';
        var odds    = parseFloat(cols[idxOdds])||1;
        var stake   = parseFloat(cols[idxStake])||0;
        var state2  = cols[idxState]||''; // W/L/V
        var book    = cols[idxBook]||'';
        var sport   = cols[idxSport]||'Football';
        var comp    = cols[idxComp]||'';
        var cat     = cols[idxCat]||'';
        var comment = cols[idxComment]||'';
        var isBonus = cols[idxBonus]==='1'||cols[idxBonus]==='true'||cols[idxBonus]==='TRUE';
        var isFB    = cols[idxFB]==='1'||cols[idxFB]==='true'||cols[idxFB]==='TRUE';

        if(!stake || !odds) { skipped++; return; }

        // Convertir W/L en win
        var win = state2==='W'||state2==='V'||state2==='WIN'||state2==='GAGNE';
        var isLoss = state2==='L'||state2==='PERDU'||state2==='LOSE';
        var isCash = state2==='CASH'||state2==='CASHOUT';
        var isPending = state2==='P'||state2==='EN COURS'||state2==='PENDING';
        if(!win && !isLoss && !isCash && !isPending) { skipped++; return; } // Skip seulement si statut inconnu

        // Cashout : calculer le gain réel depuis la colonne Cashout
        var idxCashout = headers.indexOf('Cashout');
        var cashoutVal = isCash && idxCashout>=0 ? parseFloat(cols[idxCashout])||0 : 0;
        // Si cashout, le profit = cashoutVal - stake
        if(isCash && cashoutVal > 0) {
          win = cashoutVal >= stake; // win si cashout >= mise
        }

        // Convertir sport
        var sportIco = '⚽';
        var sportLower = sport.toLowerCase();
        if(sportLower.indexOf('tennis')>=0) sportIco='🎾';
        else if(sportLower.indexOf('basket')>=0||sportLower.indexOf('nba')>=0) sportIco='🏀';
        else if(sportLower.indexOf('hockey')>=0||sportLower.indexOf('nhl')>=0) sportIco='🏒';
        else if(sportLower.indexOf('baseball')>=0||sportLower.indexOf('mlb')>=0) sportIco='⚾';
        else if(sportLower.indexOf('rugby')>=0) sportIco='🏉';

        // Parser la date
        var dateParts = dateStr.split(' ');
        var dateOnly = dateParts[0]||'';
        var timeOnly = dateParts[1]||'';

        // Extraire le match depuis le label (ex: "Cagliari 0-2 Inter")
        var target = label.replace(/\s+/g,' ').trim();
        // Enlever le score si présent
        var targetClean = target.replace(/\d+\s*[-–]\s*\d+/g,'').replace(/\s+/g,' ').trim();

        // Pour cashout, ajuster la cote pour que le profit soit correct
        // profit = win ? (m*cote - m) : -m
        // Si cashout : profit = cashoutVal - stake → cote = cashoutVal/stake
        var effectiveCote = odds;
        if(isCash && cashoutVal > 0) {
          effectiveCote = cashoutVal / stake;
          win = true; // toujours win pour calculer le profit cashout
        }

        var pari = {
          id: 'ba_'+Date.now()+'_'+Math.random().toString(36).substr(2,5),
          n: cat || label,
          target: targetClean || label,
          cote: effectiveCote,
          m: stake,
          win: win,
          sport: sportIco,
          b: book,
          comp: comp,
          t: dateOnly,
          date: dateOnly,
          heure: timeOnly,
          isFlash: false,
          isFreebet: isFB,
          isCashout: isCash,
          isPending: isPending,
          isCombi: (betType==='Combined'||betType==='Combiné'||(label&&label.toLowerCase().indexOf('combin')>=0)),
          notes: comment,
          source: 'bet-analytix'
        };

        state.a.push(pari);
        imported++;
        // Si c'est un combiné, le mémoriser pour attacher les sous-paris suivants
        if(betType==='Combined'||betType==='Combiné'||(label&&label.toLowerCase().indexOf('combin')>=0)) {
          lastCombined = pari;
        } else {
          lastCombined = null;
        }
      });

      // Trier par date croissante
      state.a.sort(function(a,b){ return new Date(a.date+' '+(a.heure||'00:00')) - new Date(b.date+' '+(b.heure||'00:00')); });

      // Normaliser les noms de bookmakers par correspondance partielle avec state.b
      var existingBks = Object.keys(state.b||{});
      function normalizeBk(name) {
        if(!name) return name;
        var nl = name.toLowerCase().trim();
        // Correspondance exacte d'abord
        if(existingBks.indexOf(nl)>=0) return nl;
        // Correspondance partielle
        var match = existingBks.find(function(k){
          return nl.indexOf(k)>=0 || k.indexOf(nl)>=0 ||
                 nl.replace(/[0-9]/g,'').trim() === k.replace(/[0-9]/g,'').trim();
        });
        return match || nl;
      }
      state.a.forEach(function(h){
        if(h.source==='bet-analytix') h.b = normalizeBk(h.b);
      });

      // Recalculer la BK si bankroll de départ fournie
      if(bkDepart > 0) {
        // Calculer le profit total des paris importés
        var profitTotal = 0;
        state.a.forEach(function(h){
          if(h.source==='bet-analytix'){
            var gain = h.win ? (h.m * h.cote - h.m) : -h.m;
            profitTotal += gain;
          }
        });

        // Mettre à jour la bankroll globale
        state.bk = parseFloat((bkDepart + profitTotal).toFixed(2));
        if(!state.b) state.b = {};
      }

      // Vérifier si tous les paris importés n'ont pas de book
      var newBets = state.a.filter(function(h){ return h.source==='bet-analytix' && !h.b; });
      var allMissingBook = newBets.length > 0 && newBets.length === state.a.filter(function(h){ return h.source==='bet-analytix'; }).length;

      function finalizeImport(defaultBook) {
        // Appliquer le book par défaut si fourni
        if(defaultBook) {
          state.a.forEach(function(h){
            if(h.source==='bet-analytix' && !h.b) h.b = defaultBook;
          });
        }

        save();
        renderArchive && renderArchive();
        render && render();

        var msg = '✅ '+imported+' paris importés depuis Bet-Analytix !';
        if(defaultBook) msg += '\n📚 Book appliqué : '+defaultBook;
        if(skipped) msg += '\n⏭ '+skipped+' lignes ignorées (en cours ou invalides)';
        if(bkDepart > 0) {
          var profit = state.a.filter(function(h){return h.source==='bet-analytix';}).reduce(function(acc,h){return acc+(h.win?(h.m*h.cote-h.m):-h.m);},0);
          msg += '\n💰 BK actuelle recalculée : '+(bkDepart+profit).toFixed(2)+'€ (départ '+bkDepart+'€ + profit '+profit.toFixed(2)+'€)';
        }
        alert(msg);
      }

      if(allMissingBook && existingBks.length > 0) {
        // Créer une modale pour choisir le book par défaut
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
        var box = document.createElement('div');
        box.style.cssText = 'background:var(--bg2,#1a1f2e);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:24px;min-width:280px;max-width:90%;';
        var opts = existingBks.map(function(bk){ return '<option value="'+bk+'">'+bk+'</option>'; }).join('');
        box.innerHTML = '<div style="font-size:14px;font-weight:700;color:var(--t1,#fff);margin-bottom:8px;">📚 Aucun bookmaker dans le CSV</div>'
          +'<div style="font-size:12px;color:var(--t3,#aaa);margin-bottom:16px;">Choisir le book à appliquer à tous les paris importés :</div>'
          +'<select id="default-bk-select" style="width:100%;padding:8px;border-radius:8px;background:var(--bg3,#252b3b);border:1px solid rgba(255,255,255,.15);color:var(--t1,#fff);font-size:13px;margin-bottom:16px;">'
          +opts+'</select>'
          +'<div style="display:flex;gap:8px;">'
          +'<button id="default-bk-ok" style="flex:1;padding:10px;border-radius:8px;background:var(--accent,#4f8ef7);border:none;color:#fff;font-weight:700;cursor:pointer;">Appliquer</button>'
          +'<button id="default-bk-skip" style="flex:1;padding:10px;border-radius:8px;background:rgba(255,255,255,.08);border:none;color:var(--t2,#ccc);cursor:pointer;">Ignorer</button>'
          +'</div>';
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        document.getElementById('default-bk-ok').onclick = function(){
          var chosen = document.getElementById('default-bk-select').value;
          document.body.removeChild(overlay);
          finalizeImport(chosen);
        };
        document.getElementById('default-bk-skip').onclick = function(){
          document.body.removeChild(overlay);
          finalizeImport(null);
        };
      } else {
        finalizeImport(null);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };
  input.click();
}

function importData(){var i=document.createElement('input');i.type='file';i.onchange=function(e){var r=new FileReader();r.onload=function(ev){state=JSON.parse(ev.target.result);save();location.reload();};r.readAsText(e.target.files[0]);};i.click();}


/* ── GLOBAL TAB ── */
var GC2={};
function showGTab(id, btn){
  var container=$i('t-bilan')||document;
  container.querySelectorAll('.gtab').forEach(function(b){b.classList.remove('on');});
  container.querySelectorAll('.gpanel').forEach(function(p){p.classList.remove('on');});
  if(btn)btn.classList.add('on');
  var p=$i(id);if(p)p.classList.add('on');
  if(id==='g-global')renderGlobalCharts();
  if(id==='g-equipes')renderEquipes();
}

/* ── SUB-VIEW TABS IN BILAN ── */
function showBilanView(id, btn){
  document.querySelectorAll('#t-bilan .gpanel').forEach(function(p){p.classList.remove('on');});
  var target=$i(id);if(target)target.classList.add('on');
  if(btn){
    var row=btn.parentElement;
    if(row)row.querySelectorAll('.gtab').forEach(function(b){b.classList.remove('on');});
    btn.classList.add('on');
  }
  if(id==='g-global')renderGlobalCharts();
  if(id==='g-equipes')renderEquipes();
}


var _multiSelected=null;
function toggleCurvePicker(){
  var p=$i('curve-picker');if(!p)return;
  var open=p.style.display==='block';
  p.style.display=open?'none':'block';
  if(!open){renderCurvePicker();setTimeout(function(){document.addEventListener('click',function h(e){var btn=$i('curve-picker-btn'),pk=$i('curve-picker');if(pk&&btn&&!pk.contains(e.target)&&!btn.contains(e.target)){pk.style.display='none';document.removeEventListener('click',h);}});},50);}
}
function renderCurvePicker(){
  var list=$i('curve-picker-list');if(!list)return;
  if(!_multiSelected)_multiSelected={};
  var teams=state.u.filter(function(u){return state.a.some(function(h){return h.n===u.n;});});
  var cnt=Object.values(_multiSelected).filter(Boolean).length;
  list.innerHTML=teams.map(function(u){
    var on=!!_multiSelected[u.n];var dis=!on&&cnt>=5;
    var sn=u.n.replace(/"/g,'&quot;');
    var esc=sn.replace(/"/g,'&quot;');
    return '<label style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--b1);cursor:'+(dis?'not-allowed':'pointer')+';opacity:'+(dis?'.45':'1')+';">'
      +'<input type="checkbox" '+(on?'checked':'')+' '+(dis&&!on?'disabled':'')+' data-nom="'+sn+'" onchange="toggleCurveTeam(this)" style="accent-color:'+(u.color||'#4d84ff')+';width:15px;height:15px;flex-shrink:0;">'
      +'<input type="color" value="'+(u.color||'#4d84ff')+'" title="Changer couleur" data-nom="'+sn+'" onchange="changeCurveColor(this)" onclick="event.stopPropagation();" style="width:18px;height:18px;border-radius:50%;border:none;padding:0;cursor:pointer;flex-shrink:0;background:none;">'
      +'<span style="font-size:12px;font-weight:600;flex:1;">'+u.n+'</span>'
      +(on?'<span style="font-size:9px;color:'+(u.color||'#4d84ff')+';font-weight:700;">✓</span>':'')+'</label>';
  }).join('');
  var btn=$i('curve-picker-btn');if(btn)btn.textContent='⚙️ '+cnt+'/5';
}
function changeCurveColor(el){
  var nom=el.dataset.nom;var col=el.value;
  var u=state.u.find(function(x){return x.n===nom;});
  if(u){u.color=col;save();}
  if(_multiSelected&&_multiSelected[nom])renderMultiCurveChart();
  renderCurvePicker();
}
function toggleCurveTeam(el){
  var nom=el.dataset.nom;var checked=el.checked;
  if(!_multiSelected)_multiSelected={};
  var cnt=Object.values(_multiSelected).filter(Boolean).length;
  if(checked&&cnt>=5){el.checked=false;renderCurvePicker();return;}
  _multiSelected[nom]=checked;renderCurvePicker();renderMultiCurveChart();
}
function renderMultiCurveChart(){
  var ctx=$i('chart-multi');if(!ctx)return;
  if(window._gcM){try{window._gcM.destroy();}catch(e){}}window._gcM=null;
  var leg=$i('chart-multi-legend');if(leg)leg.innerHTML='';
  var all=[];
  state.u.forEach(function(u){
    var paris=state.a.filter(function(h){return h.n===u.n;});if(!paris.length)return;
    var cum=0;
    var dlabels=['Départ'].concat(paris.slice().reverse().map(function(h){var adv4=h.target&&h.target!=='-'?h.target:'';return (h.date||'')+(adv4?' vs '+adv4:'')+(h.l?' P'+h.l:'');}));
    var data=[0].concat(paris.slice().reverse().map(function(h){cum+=(h.win?(parseFloat(h.m)*parseFloat(h.cote))-parseFloat(h.m):-parseFloat(h.m));return parseFloat(cum.toFixed(2));}));
    var _c=u.color&&all.every(function(x){return x._color!==u.color;})?u.color:CURVE_COLS[all.length%CURVE_COLS.length];
    all.push({label:u.n,data:data,_labels:dlabels,borderColor:_c,backgroundColor:'transparent',borderWidth:1.5,tension:.4,pointRadius:3,pointHoverRadius:10,pointHoverBorderColor:'#fff',pointHoverBorderWidth:2,pointHitRadius:30,_color:_c});
  });
  if(!all.length){if(leg)leg.innerHTML='<span style="font-size:11px;color:var(--t3);">Aucun historique</span>';return;}
  if(!_multiSelected)_multiSelected={};
  /* Auto-sélectionner top 5 si premier chargement ou nouvelles équipes */
  var hasSelection=Object.values(_multiSelected).some(Boolean);
  if(!hasSelection){
    var sorted=all.slice().sort(function(a,b){return (b.data[b.data.length-1]||0)-(a.data[a.data.length-1]||0);});
    sorted.forEach(function(d,i){_multiSelected[d.label]=i<5;});
  } else {
    all.forEach(function(d){if(_multiSelected[d.label]===undefined)_multiSelected[d.label]=false;});
  }
  var active=all.filter(function(d){return _multiSelected[d.label];});
  if(leg)leg.innerHTML=active.map(function(d){return '<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;color:var(--t2);white-space:nowrap;flex-shrink:0;"><span style="display:inline-block;width:10px;height:3px;border-radius:2px;background:'+d._color+';"></span>'+d.label+'</span>';}).join('');
  var btn=$i('curve-picker-btn');if(btn)btn.textContent='⚙️ '+active.length+'/5';
  if(!active.length)return;
  var maxLen=active.reduce(function(m,d){return Math.max(m,d.data.length);},0);
  active.forEach(function(d){while(d.data.length<maxLen)d.data.push(null);});
  setTimeout(function(){
    if(!$i('chart-multi'))return;
    var ct=$i('chart-multi').getContext('2d');
    window._gcM=new Chart(ct,{type:'line',data:{labels:Array.from({length:maxLen},function(_,i){return i;}),datasets:active},options:{
      animation:false,responsive:true,maintainAspectRatio:false,interaction:{mode:'nearest',intersect:false},
      plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(8,11,18,.96)',borderColor:'rgba(255,255,255,.1)',borderWidth:1,
        callbacks:{title:function(ii){var d=active[0];return d&&d._labels?d._labels[ii[0].dataIndex]||'':'';},label:function(i){return ' '+i.dataset.label+' : '+(i.raw!==null?(i.raw>=0?'+':'')+i.raw.toFixed(2)+'€':'—');}}}},
      scales:{x:{display:false},y:{grid:{color:'rgba(255,255,255,.03)'},border:{display:false},ticks:{color:'#4f5d88',font:{size:9},maxTicksLimit:4,callback:function(v){return v+'€';}}}}
    }});
    attachTouchTooltip('chart-multi',function(){return window._gcM;},'cib-multi','cib-multi-txt','cib-multi-val');
  },80);
}
function renderGlobalCharts(){
  renderGlobalChart();
  setTimeout(function(){
    renderMultiCurveChart();
    renderBooksChart();
    renderPaliersChart();
    setTimeout(function(){renderRadarChart();renderChartMoisBar();renderChartSport();renderChartTypeBen();renderChartTypeDonut();renderStreakPanel();},200);
  },100);
}

function renderBooksChart(){
  var ctx=$i('chart-books');if(!ctx)return;
  if(GC2.books){try{GC2.books.destroy();}catch(e){}}
  var total=Object.values(state.b).reduce(function(a,v){return a+parseFloat(v||0);},0);
  if(total<=0){ctx.parentElement.innerHTML='<div class="empty">Aucun solde</div>';return;}
  var labels=[],data=[],colors=[];
  Object.entries(state.b).forEach(function(e){
    var v=parseFloat(e[1]||0);
    if(v>0){labels.push(bki(e[0]).n);data.push(v);colors.push(bki(e[0]).c);}
  });
  if(!data.length){ctx.parentElement.innerHTML='<div class="empty">Aucun solde positif</div>';return;}
  GC2.books=new Chart(ctx.getContext('2d'),{
    type:'doughnut',
    data:{labels:labels,datasets:[{data:data,backgroundColor:colors.map(function(c){return c+'aa';}),borderColor:colors,borderWidth:1,hoverOffset:4}]},
    options:{
      responsive:true,maintainAspectRatio:false,cutout:'65%',
      plugins:{
        legend:{display:true,position:'right',labels:{color:'#8b97c4',font:{size:10},boxWidth:10,padding:8}},
        tooltip:{backgroundColor:'rgba(8,11,18,.96)',callbacks:{label:function(i){return i.label+': '+i.raw.toFixed(2)+'€ ('+((i.raw/total)*100).toFixed(1)+'%)';}}}
      }
    }
  });
}

function renderPaliersChart(){
  var ctx=$i('chart-paliers');if(!ctx)return;
  if(GC2.paliers){try{GC2.paliers.destroy();}catch(e){}}
  if(!state.u.length){ctx.parentElement.innerHTML='<div class="empty">Aucune équipe</div>';return;}
  var labels=state.u.map(function(u){return u.n.substring(0,8);});
  var data=state.u.map(function(u){return u.l;});
  var colors=state.u.map(function(u){
    var l=u.l;
    return l>=6?'rgba(255,69,69,.8)':l>=4?'rgba(240,176,32,.8)':l>=2?'rgba(77,132,255,.7)':'rgba(30,215,96,.7)';
  });
  GC2.paliers=new Chart(ctx.getContext('2d'),{
    type:'bar',
    data:{labels:labels,datasets:[{label:'Palier actuel',data:data,backgroundColor:colors,borderColor:colors.map(function(c){return c.replace('.7','.9').replace('.8','1');}),borderWidth:1,borderRadius:4}]},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:function(i){return 'Palier '+i.raw+' ('+state.u[i.dataIndex].n+')';}}}},
      scales:{
        x:{ticks:{color:'#4f5d88',font:{size:9}},grid:{display:false}},
        y:{min:0,max:8,ticks:{color:'#4f5d88',font:{size:9},stepSize:1},grid:{color:'rgba(255,255,255,.03)'}}
      }
    }
  });
}

function renderRadarChart(){
  var ctx=$i('chart-radar');if(!ctx)return;
  if(GC2.radar){try{GC2.radar.destroy();}catch(e){}}
  if(!state.a.length){ctx.parentElement.innerHTML='<div class="empty">Aucun historique</div>';return;}
  var typeMap={};
  state.a.forEach(function(h){
    var t=(h.type||'Autre').trim()||'Autre';
    if(!typeMap[t])typeMap[t]={n:0,wins:0,profit:0,mise:0};
    typeMap[t].n++;
    if(h.win)typeMap[t].wins++;
    typeMap[t].profit+=(h.win?(h.m*h.cote)-h.m:-h.m);
    typeMap[t].mise+=parseFloat(h.m||0);
  });
  var entries=Object.entries(typeMap).sort(function(a,b){return b[1].n-a[1].n;}).slice(0,8);
  var labels=entries.map(function(e){return e[0];});
  var wrData=entries.map(function(e){return parseFloat((e[1].wins/e[1].n*100).toFixed(1));});
  var roiData=entries.map(function(e){return e[1].mise>0?parseFloat((e[1].profit/e[1].mise*100).toFixed(1)):0;});
  GC2.radar=new Chart(ctx.getContext('2d'),{
    type:'radar',
    data:{
      labels:labels,
      datasets:[
        {label:'Réussite %',data:wrData,borderColor:'rgba(30,215,96,.9)',backgroundColor:'rgba(30,215,96,.08)',borderWidth:2,pointBackgroundColor:'#1ed760',pointRadius:3},
        {label:'ROI %',data:roiData,borderColor:'rgba(77,132,255,.9)',backgroundColor:'rgba(77,132,255,.06)',borderWidth:2,pointBackgroundColor:'#4d84ff',pointRadius:3}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:true,labels:{color:'#8b97c4',font:{size:10},boxWidth:10}}},
      scales:{r:{ticks:{color:'#4f5d88',font:{size:9},backdropColor:'transparent'},grid:{color:'rgba(255,255,255,.07)'},pointLabels:{color:'#8b97c4',font:{size:9}}}}
    }
  });
}

/* ── MYMATCH ── */
var mmRows=[
  {type:'Victoire',cote:1.80},
  {type:'BTS Oui',cote:1.70}
];
var MM_TYPES=['Victoire','Nul','Défaite','BTS Oui','BTS Non','Over 1.5','Over 2.5','Under 2.5','HC -1','HC +1','Mi-temps'];

function renderMmRows(){
  var sel=$i('mm-sel');if(!sel)return;
  sel.innerHTML=mmRows.map(function(r,i){
    return '<div class="mm-row">'
      +'<input class="fi mm-cote" value="'+r.type+'" placeholder="Type (Victoire…)" data-idx="'+i+'" oninput="mmRows[this.dataset.idx].type=this.value;renderMmCote();" style="flex:1;padding:6px 8px;font-size:12px;">'
      +'<input type="number" class="fi mm-cote" value="'+r.cote+'" step="0.01" data-idx="'+i+'" oninput="mmRows[this.dataset.idx].cote=parseFloat(this.value)||1;renderMmCote();" style="width:72px;color:var(--a);font-weight:700;">'
      +(mmRows.length>1?'<button class="mm-del" data-idx="'+i+'" onclick="mmRows.splice(parseInt(this.dataset.idx),1);renderMmRows();">✕</button>':'')
      +'</div>';
  }).join('');
  var types=$i('mm-types');
  if(types)types.innerHTML=MM_TYPES.map(function(t){
    return '<button class="mm-type" onclick="addMmType(\''+t+'\')">'+ t+'</button>';
  }).join('');
  renderMmCote();
}
function renderMmCote(){
  var cote=mmRows.reduce(function(a,r){return a*(parseFloat(r.cote)||1);},1);
  var el=$i('mm-cote-total');
  if(el)el.innerText='@'+cote.toFixed(2);
  /* sync to cockpit cote field */
  var cc=$i('c-cote');if(cc)cc.value=cote.toFixed(2);
  renderCrash();
}
function addMmRow(){mmRows.push({type:'',cote:1.50});renderMmRows();}
function addMmType(t){
  var existing=mmRows.find(function(r){return r.type===t;});
  if(existing)return;
  mmRows.push({type:t,cote:1.50});renderMmRows();
}

// ── ENREGISTRER MYMATCH COMME PARI ──

function setLieu(v) {
  var inp = document.getElementById('n-lieu');
  if(inp) inp.value = v;
  var btns = {'dom':'btn-dom','ext':'btn-ext','':'btn-neut'};
  Object.keys(btns).forEach(function(k){
    var b = document.getElementById(btns[k]);
    if(!b) return;
    if(k===v){
      b.style.borderColor='rgba(30,215,96,.5)';b.style.background='rgba(30,215,96,.12)';b.style.color='#1ed760';
    } else {
      b.style.borderColor='var(--b2)';b.style.background='none';b.style.color='var(--t3)';
    }
  });
}

function saveMmAsPari(mode) {
  var rows = mode === 'cockpit' ? mmRows : mmRowsSimple;
  if (!rows || !rows.length || !rows.some(function(r){ return r.type; })) {
    alert('Ajoute au moins une sélection !'); return;
  }
  var cote = rows.reduce(function(a,r){ return a*(parseFloat(r.cote)||1); }, 1);
  var label = rows.filter(function(r){ return r.type; }).map(function(r){ return r.type+' @'+r.cote; }).join(' + ');

  // Récupérer les infos selon le mode
  var team, mise, book, date, sport, comp;
  if (mode === 'cockpit') {
    team = ($i('c-unit') && $i('c-unit').value) || 'MyMatch';
    mise = parseFloat($i('c-mise') && $i('c-mise').value) || 0;
    book = ($i('c-book') && $i('c-book').value) || '';
    date = ($i('c-date') && $i('c-date').value) || new Date().toISOString().split('T')[0];
    sport = ($i('c-sport') && $i('c-sport').value) || '⚽';
    comp = ($i('c-comp') && $i('c-comp').value) || '';
  } else {
    team = ($i('n-team') && $i('n-team').value) || 'MyMatch';
    mise = parseFloat($i('n-mise') && $i('n-mise').value) || 0;
    book = ($i('n-book') && $i('n-book').value) || '';
    date = ($i('n-date') && $i('n-date').value) || new Date().toISOString().split('T')[0];
    sport = ($i('p-sport') && $i('p-sport').value) || '⚽';
    comp = ($i('n-comp') && $i('n-comp').value) || '';
  }

  if (!mise) { alert('Renseigne une mise !'); return; }

  // Créer le pari dans l'archive comme un pari en attente
  var pari = {
    id: Date.now(),
    n: team || 'Combiné',
    cote: parseFloat(cote.toFixed(2)),
    m: mise,
    book: book,
    date: date,
    sport: sport,
    comp: comp,
    type: label,
    mm: true,  // marqué comme MyMatch
    win: null, // en attente de résultat
    r: null
  };

  if (!state.p) state.p = [];
  state.p.push(pari);
  save();

  // Feedback visuel
  var btn = event && event.target;
  if (btn) {
    btn.textContent = '✓ Enregistré !';
    btn.style.borderColor = 'rgba(30,215,96,.8)';
    btn.style.background = 'rgba(30,215,96,.2)';
    setTimeout(function(){ btn.textContent = '💾 Enregistrer pari'; btn.style.borderColor='rgba(30,215,96,.4)'; btn.style.background='rgba(30,215,96,.1)'; }, 2000);
  }

  render();
}

function getMmLabel(){
  return mmRows.filter(function(r){return r.type;}).map(function(r){return r.type+' @'+r.cote;}).join(' + ');
}
function getMmCote(){
  return mmRows.reduce(function(a,r){return a*(parseFloat(r.cote)||1);},1);
}

/* ── SEARCH CLUB API-SPORTS ── */
var _searchTimer=null;
function debounceSearchClub(){
  clearTimeout(_searchTimer);
  _searchTimer=setTimeout(searchClub,600);
}
function searchClub(){
  var q=($i('u-search')&&$i('u-search').value||'').trim();
  var res=$i('search-results');if(!res)return;
  if(q.length<2){res.innerHTML='';window._srCache=[];return;}
  res.innerHTML='<div class="search-loading">🔍 Recherche...</div>';
  window._srCache=fuzzyClubSearch(q);
  if(window._srCache.length){
    res.innerHTML='<div class="search-res">'+window._srCache.map(function(r,i){
      return '<div class="sr-item" data-idx="'+i+'" onclick="selectClub(+this.dataset.idx)">'
        +'<img class="sr-logo" src="'+r.logo+'" onerror="logoErr(this)" loading="lazy">'
        +'<div><div class="sr-name">'+r.name+'</div>'
        +'<div class="sr-meta">'+r.league+' · '+'&#9733;'.repeat(r.stars||3)+'</div></div>'
        +'<span style="font-size:11px;color:var(--a);font-weight:700;">&#8629;</span>'
        +'</div>';
    }).join('')+'</div>';
  } else {
    res.innerHTML='<div class="search-res"><div class="sr-item" style="cursor:default;color:var(--t3);">Aucun résultat</div></div>';
  }
}
function selectClub(idx){
  var r=(window._srCache||[])[idx];if(!r)return;
  if($i('u-name'))$i('u-name').value=r.name;
  if($i('u-note'))$i('u-note').value=r.note||'';
  if($i('u-stars'))$i('u-stars').value=String(r.stars||3);
  if(r.color){if($i('u-color'))$i('u-color').value=r.color;selColor=r.color;renderColorPicker();}
  window._pendingLogo={name:r.name,url:r.logo,abbr:r.abbr||r.name.substring(0,3).toUpperCase(),color:r.color||PCOLS[0]};
  if($i('u-link2')&&r.flashscore)$i('u-link2').value=r.flashscore;
  if($i('u-link')&&r.sofascore)$i('u-link').value=r.sofascore;
  var res=$i('search-results');
  if(res)res.innerHTML='<div style="color:var(--g);font-size:11px;font-weight:700;padding:8px 0;">✅ '+r.name+' sélectionné — clique sur Ajouter</div>';
}
/* ── EMBEDDED CLUB DATABASE (top 200+ clubs) ── */
var CLUB_DB=[
  {name:"Bayern Munich",league:"Bundesliga",logo:"https://media.api-sports.io/football/teams/157.png",abbr:"FCB",stars:4,color:"#dc2626",flashscore:"https://www.flashscore.fr/equipe/bayern/nVp0wiqd/",sofascore:"https://www.sofascore.com/team/football/bayern-munich/2672"},
  {name:"Borussia Dortmund",league:"Bundesliga",logo:"https://media.api-sports.io/football/teams/165.png",abbr:"BVB",stars:4,color:"#f0b020"},
  {name:"RB Leipzig",league:"Bundesliga",logo:"https://media.api-sports.io/football/teams/173.png",abbr:"RBL",stars:3,color:"#cc0000"},
  {name:"Bayer Leverkusen",league:"Bundesliga",logo:"https://media.api-sports.io/football/teams/168.png",abbr:"B04",stars:3,color:"#cc0000"},
  {name:"Real Madrid",league:"La Liga",logo:"https://media.api-sports.io/football/teams/541.png",abbr:"RMA",stars:5,color:"#94a3b8",flashscore:"https://www.flashscore.fr/equipe/real-madrid/W8mj7MDD/",sofascore:"https://www.sofascore.com/team/football/real-madrid/2829"},
  {name:"FC Barcelone",league:"La Liga",logo:"https://media.api-sports.io/football/teams/529.png",abbr:"BAR",stars:5,color:"#3b82f6",flashscore:"https://www.flashscore.fr/equipe/barcelone/GOLd4Ilf/",sofascore:"https://www.sofascore.com/team/football/barcelona/2817"},
  {name:"Atletico Madrid",league:"La Liga",logo:"https://media.api-sports.io/football/teams/530.png",abbr:"ATM",stars:4,color:"#cc0000"},
  {name:"Villarreal",league:"La Liga",logo:"https://media.api-sports.io/football/teams/533.png",abbr:"VIL",stars:3,color:"#f0b020"},
  {name:"Athletic Bilbao",league:"La Liga",logo:"https://media.api-sports.io/football/teams/531.png",abbr:"ATH",stars:3,color:"#cc0000"},
  {name:"PSG",league:"Ligue 1",logo:"https://media.api-sports.io/football/teams/85.png",abbr:"PSG",stars:4,color:"#c8a050",flashscore:"https://www.flashscore.fr/equipe/psg/CjhkPw0k/",sofascore:"https://www.sofascore.com/team/football/paris-saint-germain/1644"},
  {name:"Lyon",league:"Ligue 1",logo:"https://media.api-sports.io/football/teams/80.png",abbr:"OL",stars:3,color:"#c8a050",flashscore:"https://www.flashscore.fr/equipe/lyon/2akflumR/",sofascore:"https://www.sofascore.com/team/football/lyon/1649"},
  {name:"Marseille",league:"Ligue 1",logo:"https://media.api-sports.io/football/teams/81.png",abbr:"OM",stars:3,color:"#3b82f6",flashscore:"https://www.flashscore.fr/equipe/marseille/GRk7WQET/",sofascore:"https://www.sofascore.com/team/football/marseille/1641"},
  {name:"Monaco",league:"Ligue 1",logo:"https://media.api-sports.io/football/teams/91.png",abbr:"ASM",stars:3,color:"#cc0000",flashscore:"https://www.flashscore.fr/equipe/monaco/dOUzNP1B/",sofascore:"https://www.sofascore.com/team/football/monaco/1638"},
  {name:"Lille",league:"Ligue 1",logo:"https://media.api-sports.io/football/teams/79.png",abbr:"LOSC",stars:3,color:"#cc0000"},
  {name:"Nice",league:"Ligue 1",logo:"https://media.api-sports.io/football/teams/84.png",abbr:"OGC",stars:2,color:"#cc0000"},
  {name:"Rennes",league:"Ligue 1",logo:"https://media.api-sports.io/football/teams/93.png",abbr:"SRFC",stars:2,color:"#cc0000"},
  {name:"Lens",league:"Ligue 1",logo:"https://media.api-sports.io/football/teams/116.png",abbr:"RCL",stars:2,color:"#f0b020"},
  {name:"Manchester City",league:"Premier League",logo:"https://media.api-sports.io/football/teams/50.png",abbr:"MCI",stars:5,color:"#3b82f6",flashscore:"https://www.flashscore.fr/equipe/manchester-city/E8Ysm0MO/",sofascore:"https://www.sofascore.com/team/football/manchester-city/17"},
  {name:"Arsenal",league:"Premier League",logo:"https://media.api-sports.io/football/teams/42.png",abbr:"ARS",stars:4,color:"#cc0000",flashscore:"https://www.flashscore.fr/equipe/arsenal/G0g5WGBD/",sofascore:"https://www.sofascore.com/team/football/arsenal/42"},
  {name:"Liverpool",league:"Premier League",logo:"https://media.api-sports.io/football/teams/40.png",abbr:"LIV",stars:5,color:"#cc0000",flashscore:"https://www.flashscore.fr/equipe/liverpool/Ij4aLvSF/",sofascore:"https://www.sofascore.com/team/football/liverpool/44"},
  {name:"Chelsea",league:"Premier League",logo:"https://media.api-sports.io/football/teams/49.png",abbr:"CHE",stars:4,color:"#3b82f6"},
  {name:"Manchester United",league:"Premier League",logo:"https://media.api-sports.io/football/teams/33.png",abbr:"MAN",stars:4,color:"#cc0000"},
  {name:"Tottenham",league:"Premier League",logo:"https://media.api-sports.io/football/teams/47.png",abbr:"TOT",stars:3,color:"#94a3b8"},
  {name:"Newcastle",league:"Premier League",logo:"https://media.api-sports.io/football/teams/34.png",abbr:"NEW",stars:3,color:"#94a3b8"},
  {name:"Aston Villa",league:"Premier League",logo:"https://media.api-sports.io/football/teams/66.png",abbr:"AVL",stars:3,color:"#7c3aed"},
  {name:"Inter Milan",league:"Serie A",logo:"https://media.api-sports.io/football/teams/505.png",abbr:"INT",stars:4,color:"#0ea5e9",flashscore:"https://www.flashscore.fr/equipe/inter/Iw7eKK25/",sofascore:"https://www.sofascore.com/team/football/inter/2697"},
  {name:"AC Milan",league:"Serie A",logo:"https://media.api-sports.io/football/teams/489.png",abbr:"ACM",stars:4,color:"#cc0000"},
  {name:"Juventus",league:"Serie A",logo:"https://media.api-sports.io/football/teams/496.png",abbr:"JUV",stars:4,color:"#94a3b8",flashscore:"https://www.flashscore.fr/equipe/juventus/lB7mkbhH/",sofascore:"https://www.sofascore.com/team/football/juventus/2710"},
  {name:"Napoli",league:"Serie A",logo:"https://media.api-sports.io/football/teams/492.png",abbr:"NAP",stars:3,color:"#3b82f6"},
  {name:"AS Roma",league:"Serie A",logo:"https://media.api-sports.io/football/teams/497.png",abbr:"ROM",stars:3,color:"#f0b020"},
  {name:"Lazio",league:"Serie A",logo:"https://media.api-sports.io/football/teams/487.png",abbr:"LAZ",stars:3,color:"#3b82f6"},
  {name:"Fiorentina",league:"Serie A",logo:"https://media.api-sports.io/football/teams/502.png",abbr:"FIO",stars:2,color:"#7c3aed"},
  {name:"Atalanta",league:"Serie A",logo:"https://media.api-sports.io/football/teams/499.png",abbr:"ATA",stars:3,color:"#0ea5e9"},
  {name:"PSV",league:"Eredivisie",logo:"https://media.api-sports.io/football/teams/674.png",abbr:"PSV",stars:3,color:"#cc0000",flashscore:"https://www.flashscore.fr/equipe/psv/M9UEHJWi/",sofascore:"https://www.sofascore.com/team/football/psv/2295"},
  {name:"Ajax",league:"Eredivisie",logo:"https://media.api-sports.io/football/teams/194.png",abbr:"AJX",stars:3,color:"#cc0000"},
  {name:"Feyenoord",league:"Eredivisie",logo:"https://media.api-sports.io/football/teams/197.png",abbr:"FEY",stars:3,color:"#cc0000"},
  {name:"Portugal",league:"Nations",logo:"https://media.api-sports.io/football/teams/27.png",abbr:"POR",stars:4,color:"#cc0000"},
  {name:"France",league:"Nations",logo:"https://media.api-sports.io/football/teams/2.png",abbr:"FRA",stars:4,color:"#3b82f6"},
  {name:"Espagne",league:"Nations",logo:"https://media.api-sports.io/football/teams/9.png",abbr:"ESP",stars:4,color:"#f0b020"},
  {name:"Angleterre",league:"Nations",logo:"https://media.api-sports.io/football/teams/10.png",abbr:"ENG",stars:4,color:"#cc0000"},
  {name:"Allemagne",league:"Nations",logo:"https://media.api-sports.io/football/teams/25.png",abbr:"GER",stars:4,color:"#f0b020"},
  {name:"Brésil",league:"International",logo:"https://media.api-sports.io/football/teams/6.png",abbr:"BRA",stars:5,color:"#f0b020"},
  {name:"Argentine",league:"International",logo:"https://media.api-sports.io/football/teams/26.png",abbr:"ARG",stars:5,color:"#3b82f6"},
  {name:"Boca Juniors",league:"Argentine",logo:"https://media.api-sports.io/football/teams/405.png",abbr:"BJR",stars:3,color:"#f0b020",flashscore:"https://www.flashscore.fr/equipe/boca-juniors/hMrWAFH0/",sofascore:"https://www.sofascore.com/team/football/boca-juniors/1028"},
  {name:"River Plate",league:"Argentine",logo:"https://media.api-sports.io/football/teams/406.png",abbr:"RIV",stars:3,color:"#cc0000"},
  {name:"Flamengo",league:"Brésil",logo:"https://media.api-sports.io/football/teams/127.png",abbr:"FLA",stars:3,color:"#cc0000"},
  {name:"Palmeiras",league:"Brésil",logo:"https://media.api-sports.io/football/teams/121.png",abbr:"PAL",stars:3,color:"#22c55e",flashscore:"https://www.flashscore.fr/equipe/palmeiras/hMn9FTbH/",sofascore:"https://www.sofascore.com/team/football/palmeiras/1945"},
  {name:"Benfica",league:"Liga Portugal",logo:"https://media.api-sports.io/football/teams/211.png",abbr:"SLB",stars:3,color:"#cc0000"},
  {name:"Sporting CP",league:"Liga Portugal",logo:"https://media.api-sports.io/football/teams/228.png",abbr:"SCP",stars:3,color:"#22c55e"},
  {name:"Porto",league:"Liga Portugal",logo:"https://media.api-sports.io/football/teams/212.png",abbr:"FCP",stars:3,color:"#3b82f6"},
  /* NHL */
  {name:"Carolina Hurricanes",league:"NHL",logo:"https://media.api-sports.io/hockey/teams/7.png",abbr:"CAR",stars:3,color:"#cc0000"},
  {name:"Colorado Avalanche",league:"NHL",logo:"https://media.api-sports.io/hockey/teams/9.png",abbr:"COL",stars:3,color:"#7c3aed"},
  {name:"Tampa Bay Lightning",league:"NHL",logo:"https://media.api-sports.io/hockey/teams/24.png",abbr:"TBL",stars:3,color:"#3b82f6"},
  {name:"Vegas Golden Knights",league:"NHL",logo:"https://media.api-sports.io/hockey/teams/26.png",abbr:"VGK",stars:3,color:"#f0b020"},
  {name:"Florida Panthers",league:"NHL",logo:"https://media.api-sports.io/hockey/teams/15.png",abbr:"FLA",stars:3,color:"#cc0000"},
  /* MLB */
  {name:"LA Dodgers",league:"MLB",logo:"https://media.api-sports.io/baseball/teams/19.png",abbr:"LAD",stars:3,color:"#3b82f6"},
  {name:"New York Yankees",league:"MLB",logo:"https://media.api-sports.io/baseball/teams/9.png",abbr:"NYY",stars:3,color:"#94a3b8"},
  {name:"Atlanta Braves",league:"MLB",logo:"https://media.api-sports.io/baseball/teams/15.png",abbr:"ATL",stars:3,color:"#cc0000"},
  /* NBA */
  {name:"Golden State Warriors",league:"NBA",logo:"https://media.api-sports.io/basketball/teams/11.png",abbr:"GSW",stars:4,color:"#f0b020"},
  {name:"Los Angeles Lakers",league:"NBA",logo:"https://media.api-sports.io/basketball/teams/17.png",abbr:"LAL",stars:4,color:"#7c3aed"},
  {name:"Boston Celtics",league:"NBA",logo:"https://media.api-sports.io/basketball/teams/2.png",abbr:"BOS",stars:4,color:"#22c55e"},
  {name:"Miami Heat",league:"NBA",logo:"https://media.api-sports.io/basketball/teams/20.png",abbr:"MIA",stars:3,color:"#cc0000"}
];

function fuzzyClubSearch(q){
  var ql=q.toLowerCase().replace(/[-_'\.]/g,'');
  return CLUB_DB.filter(function(c){
    var nl=c.name.toLowerCase().replace(/[-_'\.]/g,'');
    var al=(c.abbr||'').toLowerCase();
    return nl.includes(ql)||ql.includes(nl.substring(0,4))||al.startsWith(ql)||nl.startsWith(ql);
  }).slice(0,8);
}


/* ── SOFASCORE ── */
var SOFASCORE_LINKS={
  "Bayern Munich":"https://www.sofascore.com/team/football/bayern-munich/2672",
  "Boca Juniors":"https://www.sofascore.com/team/football/boca-juniors/1028",
  "France":"https://www.sofascore.com/team/football/france/4418",
  "Inter Milan":"https://www.sofascore.com/team/football/inter/2697",
  "Lyon":"https://www.sofascore.com/team/football/lyon/1649",
  "Palmeiras":"https://www.sofascore.com/team/football/palmeiras/1945",
  "PSG":"https://www.sofascore.com/team/football/paris-saint-germain/1644",
  "PSV":"https://www.sofascore.com/team/football/psv/2295",
  "Real Madrid":"https://www.sofascore.com/team/football/real-madrid/2829",
  "Marseille":"https://www.sofascore.com/team/football/marseille/1641",
  "Monaco":"https://www.sofascore.com/team/football/monaco/1638",
  "Lille":"https://www.sofascore.com/team/football/lille/1636",
  "Manchester City":"https://www.sofascore.com/team/football/manchester-city/17",
  "Arsenal":"https://www.sofascore.com/team/football/arsenal/42",
  "Liverpool":"https://www.sofascore.com/team/football/liverpool/44",
  "Chelsea":"https://www.sofascore.com/team/football/chelsea/38",
  "Juventus":"https://www.sofascore.com/team/football/juventus/2710",
  "AC Milan":"https://www.sofascore.com/team/football/ac-milan/2692",
  "Napoli":"https://www.sofascore.com/team/football/napoli/2714",
  "Atletico Madrid":"https://www.sofascore.com/team/football/atletico-madrid/2836",
  "FC Barcelone":"https://www.sofascore.com/team/football/barcelona/2817",
  "Flamengo":"https://www.sofascore.com/team/football/flamengo/1971",
  "River Plate":"https://www.sofascore.com/team/football/river-plate/1042",
  "Carolina Hurricanes":"https://www.sofascore.com/team/ice-hockey/carolina-hurricanes/14",
  "Colorado Avalanche":"https://www.sofascore.com/team/ice-hockey/colorado-avalanche/20",
  "LA Dodgers":"https://www.sofascore.com/team/baseball/los-angeles-dodgers/3952"
};
var ADV_DB={
  "⚽":["PSG","Lyon","Marseille","Monaco","Lille","Nice","Rennes","Lens","Strasbourg","Nantes","Montpellier","Reims","Toulouse","Brest","Lorient","Saint-Etienne","Arsenal","Chelsea","Liverpool","Manchester City","Manchester United","Tottenham","Newcastle","Aston Villa","Brighton","West Ham","Crystal Palace","Fulham","Real Madrid","FC Barcelone","Atletico Madrid","Villarreal","Athletic Bilbao","Bayern Munich","Borussia Dortmund","RB Leipzig","Bayer Leverkusen","Inter Milan","AC Milan","Juventus","Napoli","AS Roma","Lazio","Atalanta","Porto","Benfica","Ajax","PSV","Boca Juniors","River Plate","Flamengo","Palmeiras","France","Espagne","Angleterre","Allemagne","Italie","Portugal","Brésil","Argentine"],
  "🏀":["Lakers","Celtics","Warriors","Heat","Bulls","Knicks","Bucks","Suns","Clippers","76ers","Raptors","Nuggets","Mavericks","Nets"],
  "🎾":["Novak Djokovic","Carlos Alcaraz","Jannik Sinner","Daniil Medvedev","Alexander Zverev","Andrey Rublev","Iga Swiatek","Aryna Sabalenka","Coco Gauff","Elena Rybakina"],
  "🏒":["Carolina Hurricanes","Colorado Avalanche","Tampa Bay Lightning","Vegas Golden Knights","Florida Panthers","Boston Bruins","Toronto Maple Leafs","Edmonton Oilers","New York Rangers","Dallas Stars"],
  "⚾":["LA Dodgers","New York Yankees","Houston Astros","Atlanta Braves","Philadelphia Phillies","Boston Red Sox"],
  "🏈":["Kansas City Chiefs","San Francisco 49ers","Dallas Cowboys","Philadelphia Eagles","Buffalo Bills","Cincinnati Bengals","Baltimore Ravens","Miami Dolphins"],
  "🏎":["Max Verstappen","Lando Norris","Charles Leclerc","Carlos Sainz","Lewis Hamilton","George Russell","Fernando Alonso","Oscar Piastri"],
  "🏉":["Toulouse","Leinster","La Rochelle","Bordeaux-Bègles","Racing 92","Clermont","Lyon","Montpellier","Toulon","France","Nouvelle-Zélande","Afrique du Sud","Irlande","Angleterre","Australie"],
  "🏉🇦🇺":["Melbourne Storm","Sydney Roosters","Penrith Panthers","Brisbane Broncos","South Sydney Rabbitohs","Parramatta Eels","Cronulla Sharks","Manly Sea Eagles","Canterbury Bulldogs","New Zealand Warriors","Gold Coast Titans","Canberra Raiders"]
};
function searchAdv(q,targetId,resId){
  var el=$i(targetId);var res=$i(resId);if(!res)return;
  if(!q||q.length<2){res.style.display='none';return;}
  var sport=$i('c-sport')&&$i('c-sport').value||'⚽';
  var db=(ADV_DB[sport]||ADV_DB['⚽']).concat(state.a.map(function(h){return h.target||'';}).filter(Boolean));
  var seen={};var uniq=db.filter(function(v){return v&&!seen[v]&&(seen[v]=1);});
  var ql=q.toLowerCase();
  var filtered=uniq.filter(function(v){return v.toLowerCase().includes(ql);}).slice(0,8);
  if(!filtered.length){res.style.display='none';return;}
  res.style.display='block';
  res.innerHTML=filtered.map(function(v){
    return '<div style="padding:8px 12px;cursor:pointer;font-size:12px;border-bottom:1px solid var(--b1);" data-val="'+v+'" data-tid="'+targetId+'" data-rid="'+resId+'" onclick="pickAdv(this.dataset.val,this.dataset.tid,this.dataset.rid)">'+v+'</div>';
  }).join('');
}
function pickAdv(val,targetId,resId){
  var el=$i(targetId);if(el)el.value=val;
  var res=$i(resId);if(res)res.style.display='none';
}
var TSDB_IDS={"Melbourne Storm":"134029","Sydney Roosters":"134031","Penrith Panthers":"134030","Brisbane Broncos":"134021","South Sydney Rabbitohs":"134026","Parramatta Eels":"134024","Cronulla Sharks":"134022","Manly Sea Eagles":"134028","Canterbury Bulldogs":"134023","New Zealand Warriors":"134025","Gold Coast Titans":"134032","Canberra Raiders":"134027","Newcastle Knights":"134033","North Queensland Cowboys":"134034","Wests Tigers":"134035","St George Illawarra Dragons":"134036","Dolphins":"134037"};
async function chargerFicheAdversaire(matchId, advId, advNom) {
  var zone = document.getElementById('adv-detail-'+matchId);
  if(!zone) return;
  if(zone.style.display !== 'none') { zone.style.display='none'; return; }
  zone.style.display = 'block';
  zone.innerHTML = '<div style="padding:12px;text-align:center;color:var(--t3);font-size:11px;">⏳ Chargement fiche '+advNom+'...</div>';

  try {
    var nomEquipe = _currentTeam || '';
    var uObj = state.u.find(function(x){return x.n===nomEquipe;})||{};
    var col = uObj.color||'#4d84ff';
    var teamId = null;
    for(var k in TEAM_IDS){ if(k.toLowerCase()===nomEquipe.toLowerCase()||(nomEquipe.toLowerCase().indexOf(k.toLowerCase())>=0)){teamId=TEAM_IDS[k];break;} }

    // 3 requêtes en parallèle — adv, mon équipe, H2H
    var requests = [
      fdFetch('/v4/teams/'+advId+'/matches?status=FINISHED&limit=20'),
      teamId ? fdFetch('/v4/teams/'+teamId+'/matches?status=FINISHED&limit=20') : Promise.resolve(null),
      teamId ? fdFetch('/v4/teams/'+teamId+'/matches?status=FINISHED&limit=50&opponent='+advId) : Promise.resolve(null)
    ];
    var [advData, myData, h2hData] = await Promise.all(requests);

    var advMatchesAll = advData&&advData.matches||[];
    var myMatchesAll = myData&&myData.matches||[];

    // Extraire les compétitions disponibles
    var compsSet = {};
    advMatchesAll.concat(myMatchesAll).forEach(function(m){
      var c = m.competition&&m.competition.name||'';
      if(c) compsSet[c] = m.competition&&m.competition.emblem||'';
    });
    var compsList = Object.keys(compsSet);

    // Appliquer le filtre compétition
    var advMatches = _advCompFilter==='all' ? advMatchesAll : advMatchesAll.filter(function(m){ return m.competition&&m.competition.name===_advCompFilter; });
    var myMatches = _advCompFilter==='all' ? myMatchesAll : myMatchesAll.filter(function(m){ return m.competition&&m.competition.name===_advCompFilter; });

    var h2hMatches = (h2hData&&h2hData.matches||[]).filter(function(m){
      return (m.homeTeam&&m.homeTeam.id===teamId&&m.awayTeam&&m.awayTeam.id===advId) ||
             (m.homeTeam&&m.homeTeam.id===advId&&m.awayTeam&&m.awayTeam.id===teamId);
    });

    function calcStats(matches, tId) {
      var n=matches.length, wins=0, draws=0, goals=0, conceded=0, over25=0, bts=0, cs=0, goalsHT=0;
      var domW=0, domN=0, domL=0, domN2=0, extW=0, extN2=0, extL=0, extN3=0;
      var streak=0, streakType='';
      matches.forEach(function(m){
        var isDom = m.homeTeam&&m.homeTeam.id===tId;
        var hg=(m.score&&m.score.regularTime?m.score.regularTime.home:m.score&&m.score.fullTime?m.score.fullTime.home:0)||0;
        var ag=(m.score&&m.score.regularTime?m.score.regularTime.away:m.score&&m.score.fullTime?m.score.fullTime.away:0)||0;
        var hgHT=m.score&&m.score.halfTime?(m.score.halfTime.home||0):0;
        var agHT=m.score&&m.score.halfTime?(m.score.halfTime.away||0):0;
        var tg=isDom?hg:ag, og=isDom?ag:hg;
        var tgHT=isDom?hgHT:agHT;
        var won=tg>og, draw=tg===og;
        if(won)wins++; else if(draw)draws++;
        goals+=tg; conceded+=og; goalsHT+=tgHT;
        if(hg+ag>2.5)over25++;
        if(hg>0&&ag>0)bts++;
        if(og===0)cs++;
        if(isDom){domN2++;if(won)domW++;else if(draw)domN++;else domL++;}
        else{extN3++;if(won)extW++;else if(draw)extN2++;else extL++;}
      });
      // Série depuis le plus récent
      for(var si=0;si<matches.length;si++){
        var ms=matches[si];
        var isDomS=ms.homeTeam&&ms.homeTeam.id===tId;
        var hgs=(ms.score&&ms.score.regularTime?ms.score.regularTime.home:ms.score&&ms.score.fullTime?ms.score.fullTime.home:0)||0;
        var ags=(ms.score&&ms.score.regularTime?ms.score.regularTime.away:ms.score&&ms.score.fullTime?ms.score.fullTime.away:0)||0;
        var tgs=isDomS?hgs:ags, ogs=isDomS?ags:hgs;
        var wons=tgs>ogs, draws=tgs===ogs;
        var res=wons?'V':draws?'N':'D';
        if(si===0){streakType=res;streak=1;}
        else if(res===streakType){streak++;}
        else{break;}
      }
      return {n:n, wins:wins, draws:draws, losses:n-wins-draws,
        pct:n?Math.round(wins/n*100):0,
        gpg:n?(goals/n).toFixed(1):0, cpg:n?(conceded/n).toFixed(1):0,
        gpgHT:n?(goalsHT/n).toFixed(1):0,
        o25:n?Math.round(over25/n*100):0, bts:n?Math.round(bts/n*100):0,
        cs:n?Math.round(cs/n*100):0,
        domPct:domN2?Math.round(domW/domN2*100):0, domN:domN2,
        extPct:extN3?Math.round(extW/extN3*100):0, extN:extN3,
        streak:streak, streakType:streakType};
    }

    var advStats = calcStats(advMatches, advId);
    var myStats = teamId ? calcStats(myMatches, teamId) : null;

    // Nom court
    var myShort = nomEquipe.replace('FC ','').replace(' FC','').replace(' CF','').split(' ').slice(0,2).join(' ');
    var advShort = advNom.replace('FC ','').replace(' FC','').replace(' CF','').split(' ').slice(0,2).join(' ');

    var html = '<div style="padding:12px;">';

    // Stocker contexte pour les boutons
    window._advCtx = {matchId:matchId, advId:advId, advNom:advNom};

    // Boutons filtre compétition
    html += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">';
    html += '<button onclick="setAdvComp(null)" style="padding:3px 10px;border-radius:10px;border:1px solid rgba(255,255,255,'+(_advCompFilter==='all'?'.3':'.08')+');background:rgba(255,255,255,'+(_advCompFilter==='all'?'.12':'.04')+');color:'+(_advCompFilter==='all'?'var(--t1)':'var(--t3)')+';font-size:9px;font-weight:'+(_advCompFilter==='all'?'700':'400')+';cursor:pointer;">Tous</button>';
    compsList.forEach(function(c, i){
      var isOn = _advCompFilter===c;
      var cLabel=c.replace('UEFA ','').substring(0,15); var cKey2='advc_'+i; _usMatchCache[cKey2]=c;
      var cKey3='advc_'+i; _usMatchCache[cKey3]=c;
      var cLabel=c.replace('UEFA ','').replace("Ligue 1 McDonald's","Ligue 1").substring(0,15);
      html += '<button data-ck="'+cKey3+'" onclick="setAdvComp(this.dataset.ck)" style="padding:3px 10px;border-radius:10px;border:1px solid rgba(255,255,255,'+(isOn?'.3':'.08')+');background:rgba(255,255,255,'+(isOn?'.12':'.04')+');color:'+(isOn?'var(--t1)':'var(--t3)')+';font-size:9px;font-weight:'+(isOn?'700':'400')+';cursor:pointer;">'+getCompIcon(c)+' '+cLabel+'</button>';
    });
    html += '</div>';

    // Forme adversaire
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">📊 Forme '+advShort+' ('+advStats.n+' matchs)</div>';
    html += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;">';
    advMatches.slice(0,10).reverse().forEach(function(m){
      var isDom = m.homeTeam&&m.homeTeam.id===advId;
      var hg=(m.score&&m.score.regularTime?m.score.regularTime.home:m.score&&m.score.fullTime?m.score.fullTime.home:0)||0;
      var ag=(m.score&&m.score.regularTime?m.score.regularTime.away:m.score&&m.score.fullTime?m.score.fullTime.away:0)||0;
      var tg=isDom?hg:ag, og=isDom?ag:hg;
      var won=tg>og, draw=tg===og;
      var rc=won?'#1ed760':draw?'#f0b020':'#ff4545';
      html += '<div style="width:24px;height:24px;border-radius:5px;background:'+rc+';display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#fff;">'+(won?'V':draw?'N':'D')+'</div>';
    });
    html += '</div>';

    // Comparaison côte à côte
    if(myStats) {
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">⚡ Comparaison ('+myStats.n+' matchs)</div>';
      html += '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:4px;margin-bottom:10px;">';

      var COMPARE = [
        {l:'Victoires %', a:myStats.pct+'%', b:advStats.pct+'%', aVal:myStats.pct, bVal:advStats.pct},
        {l:'Dom %', a:myStats.domPct+'% ('+myStats.domN+')', b:advStats.domPct+'% ('+advStats.domN+')', aVal:myStats.domPct, bVal:advStats.domPct},
        {l:'Ext %', a:myStats.extPct+'% ('+myStats.extN+')', b:advStats.extPct+'% ('+advStats.extN+')', aVal:myStats.extPct, bVal:advStats.extPct},
        {l:'Buts/match', a:myStats.gpg, b:advStats.gpg, aVal:parseFloat(myStats.gpg), bVal:parseFloat(advStats.gpg)},
        {l:'Buts 1ère MT', a:myStats.gpgHT, b:advStats.gpgHT, aVal:parseFloat(myStats.gpgHT), bVal:parseFloat(advStats.gpgHT)},
        {l:'Encaissés', a:myStats.cpg, b:advStats.cpg, aVal:parseFloat(advStats.cpg), bVal:parseFloat(myStats.cpg)},
        {l:'Clean Sheet', a:myStats.cs+'%', b:advStats.cs+'%', aVal:myStats.cs, bVal:advStats.cs},
        {l:'Over 2.5', a:myStats.o25+'%', b:advStats.o25+'%', aVal:myStats.o25, bVal:advStats.o25},
        {l:'BTS', a:myStats.bts+'%', b:advStats.bts+'%', aVal:myStats.bts, bVal:advStats.bts},
      ];

      html += '<div style="font-size:10px;font-weight:700;color:'+col+';text-align:center;padding:4px;">'+myShort+'</div>';
      html += '<div style="font-size:9px;color:var(--t3);text-align:center;padding:4px;"></div>';
      html += '<div style="font-size:10px;font-weight:700;color:#a78bfa;text-align:center;padding:4px;">'+advShort+'</div>';

      COMPARE.forEach(function(c){
        var aBetter = c.aVal > c.bVal;
        var bBetter = c.bVal > c.aVal;
        html += '<div style="font-size:11px;font-weight:800;color:'+(aBetter?col:'var(--t2)')+';text-align:center;padding:5px 4px;background:rgba(255,255,255,.03);border-radius:5px;">'+c.a+'</div>';
        html += '<div style="font-size:9px;color:var(--t3);text-align:center;padding:5px 4px;">'+c.l+'</div>';
        html += '<div style="font-size:11px;font-weight:800;color:'+(bBetter?'#a78bfa':'var(--t2)')+';text-align:center;padding:5px 4px;background:rgba(255,255,255,.03);border-radius:5px;">'+c.b+'</div>';
      });
      html += '</div>';
    }

    // H2H
    if(h2hMatches.length) {
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">🔁 H2H — '+myShort+' vs '+advShort+' ('+h2hMatches.length+' matchs)</div>';
      var h2hWins=0, h2hDraws=0, h2hLoss=0;
      html += '<div style="display:flex;flex-direction:column;gap:3px;margin-bottom:8px;">';
      h2hMatches.slice(0,6).forEach(function(m){
        var isMyHome = m.homeTeam&&m.homeTeam.id===teamId;
        var hg=(m.score&&m.score.regularTime?m.score.regularTime.home:m.score&&m.score.fullTime?m.score.fullTime.home:0)||0;
        var ag=(m.score&&m.score.regularTime?m.score.regularTime.away:m.score&&m.score.fullTime?m.score.fullTime.away:0)||0;
        var tg=isMyHome?hg:ag, og=isMyHome?ag:hg;
        var won=tg>og, draw=tg===og;
        if(won)h2hWins++; else if(draw)h2hDraws++; else h2hLoss++;
        var rc=won?'#1ed760':draw?'#f0b020':'#ff4545';
        var d=new Date(m.utcDate);
        var ds=d.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'2-digit'});
        html += '<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:rgba(255,255,255,.03);border-radius:6px;border-left:2px solid '+rc+';">';
        html += '<div style="font-size:9px;color:var(--t3);width:50px;flex-shrink:0;">'+ds+'</div>';
        html += '<div style="flex:1;font-size:10px;color:var(--t2);">'+(isMyHome?myShort+' vs '+advShort:advShort+' vs '+myShort)+'</div>';
        html += '<div style="font-size:11px;font-weight:800;color:'+rc+';">'+hg+' - '+ag+'</div>';
        html += '</div>';
      });
      html += '</div>';
      // Résumé H2H
      html += '<div style="display:flex;gap:6px;margin-bottom:10px;">';
      [{l:myShort,v:h2hWins,c:col},{l:'Nul',v:h2hDraws,c:'#f0b020'},{l:advShort,v:h2hLoss,c:'#a78bfa'}].forEach(function(s){
        html += '<div style="flex:1;text-align:center;background:rgba(255,255,255,.04);border-radius:6px;padding:6px;">';
        html += '<div style="font-size:14px;font-weight:800;color:'+s.c+';">'+s.v+'</div>';
        html += '<div style="font-size:8px;color:var(--t3);">'+s.l+'</div></div>';
      });
      html += '</div>';
    }

    // Analyse
    if(myStats && advStats) {
      var butsAttendusPSG = (parseFloat(myStats.gpg) * parseFloat(advStats.cpg)).toFixed(2);
      var butsAttendusAdv = (parseFloat(advStats.gpg) * parseFloat(myStats.cpg)).toFixed(2);
      var totalAvg = (parseFloat(butsAttendusPSG) + parseFloat(butsAttendusAdv)).toFixed(2);
      var o25prob = Math.round((myStats.o25+advStats.o25)/2);
      var btsprob = Math.round((myStats.bts+advStats.bts)/2);
      html += '<div style="background:rgba(77,132,255,.08);border:1px solid rgba(77,132,255,.2);border-radius:8px;padding:10px;">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4d84ff;margin-bottom:8px;">🎯 Analyse</div>';
      // Séries
      var mySerieCol = myStats.streakType==='V'?'#1ed760':myStats.streakType==='N'?'#f0b020':'#ff4545';
      var advSerieCol = advStats.streakType==='V'?'#1ed760':advStats.streakType==='N'?'#f0b020':'#ff4545';
      html += '<div style="display:flex;gap:8px;margin-bottom:8px;">';
      html += '<div style="flex:1;background:rgba(255,255,255,.04);border-radius:6px;padding:6px;text-align:center;">';
      html += '<div style="font-size:9px;color:var(--t3);">'+myShort+'</div>';
      html += '<div style="font-size:12px;font-weight:800;color:'+mySerieCol+';">'+myStats.streak+myStats.streakType+' d\'affilée</div></div>';
      html += '<div style="flex:1;background:rgba(255,255,255,.04);border-radius:6px;padding:6px;text-align:center;">';
      html += '<div style="font-size:9px;color:var(--t3);">'+advShort+'</div>';
      html += '<div style="font-size:12px;font-weight:800;color:'+advSerieCol+';">'+advStats.streak+advStats.streakType+' d\'affilée</div></div>';
      html += '</div>';
      html += '<div style="font-size:11px;color:var(--t1);">Buts attendus : <strong style="color:'+col+';">'+butsAttendusPSG+'</strong> vs <strong style="color:#a78bfa;">'+butsAttendusAdv+'</strong> = <strong>'+totalAvg+'</strong></div>';
      html += '<div style="font-size:11px;color:var(--t1);">Over 2.5 probable : <strong style="color:'+(o25prob>55?'#1ed760':'#f0b020')+'">'+o25prob+'%</strong></div>';
      html += '<div style="font-size:11px;color:var(--t1);">BTS probable : <strong style="color:'+(btsprob>55?'#a78bfa':'#f0b020')+'">'+btsprob+'%</strong></div>';
      html += '</div>';
    }

    html += '</div>';
    zone.innerHTML = html;

  } catch(e) {
    zone.innerHTML = '<div style="padding:10px;color:#ff4545;font-size:11px;text-align:center;">Erreur : '+e.message+'</div>';
  }
}


/* ══ LIVE API-SPORTS ══ */
var _liveCache = null;
var _liveTeamId = null;

async function loadLiveApiSports(el, nom, col, teamId, key) {
  el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--t3);font-size:11px;"><div style="font-size:24px;margin-bottom:8px;">🔴</div>Chargement live via api-sports...</div>';

  try {
    // Chercher l'ID api-sports pour cette équipe
    var apiTeamId = await findApiSportsTeamId(nom, key);

    if(!apiTeamId) {
      // Fallback calendrier football-data
      el.innerHTML='<div class="fc" style="text-align:center;">'
        +'<div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:6px;">'+nom+'</div>'
        +'<div style="font-size:11px;color:var(--t3);margin-bottom:14px;">Équipe non trouvée sur api-sports</div>'
        +'<button id="btn-load-calendar" style="padding:11px 24px;border-radius:var(--r8);border:none;background:'+col+';color:#fff;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:10px;">📅 Charger le calendrier</button>'
        +'<div style="font-size:10px;color:var(--t3);">1 requête · données mises en cache</div>'
        +'<div id="calendar-content"></div></div>';
      $i('btn-load-calendar').onclick = function(){ loadTeamCalendar(teamId, nom, col); };
      return;
    }

    // Chercher match en direct
    var liveData = await apiSportsFetch('/fixtures?team='+apiTeamId+'&live=all');
    var liveFixtures = liveData&&liveData.response||[];

    var html = '<div style="padding:8px 0;">';

    if(liveFixtures.length) {
      // MATCH EN DIRECT
      var f = liveFixtures[0];
      var fix = f.fixture||{};
      var teams = f.teams||{};
      var goals = f.goals||{};
      var score = f.score||{};
      var elapsed = fix.status&&fix.status.elapsed||0;
      var homeNom = teams.home&&teams.home.name||'?';
      var awayNom = teams.away&&teams.away.name||'?';
      var homeLogo = teams.home&&teams.home.logo||'';
      var awayLogo = teams.away&&teams.away.logo||'';
      var hg = goals.home||0, ag = goals.away||0;
      var isHome = teams.home&&teams.home.id==apiTeamId;
      var rc = (isHome?hg>ag:ag>hg)?'#1ed760':(hg===ag?'#f0b020':'#ff4545');

      html += '<div style="background:rgba(255,0,0,.06);border:1px solid rgba(255,0,0,.2);border-radius:12px;padding:14px;margin-bottom:10px;">';
      html += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:10px;">';
      html += '<div style="width:8px;height:8px;border-radius:50%;background:#ff4545;animation:blink 1s infinite;"></div>';
      html += '<div style="font-size:10px;font-weight:700;color:#ff4545;">EN DIRECT — '+elapsed+"'</div>";
      html += '</div>';

      html += '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;">';
      html += '<div style="text-align:center;">';
      if(homeLogo) html += '<img src="'+homeLogo+'" style="width:40px;height:40px;object-fit:contain;margin-bottom:4px;">';
      html += '<div style="font-size:11px;font-weight:700;color:var(--t1);">'+homeNom+'</div></div>';
      html += '<div style="text-align:center;font-size:36px;font-weight:900;color:'+rc+';">'+hg+' - '+ag+'</div>';
      html += '<div style="text-align:center;">';
      if(awayLogo) html += '<img src="'+awayLogo+'" style="width:40px;height:40px;object-fit:contain;margin-bottom:4px;">';
      html += '<div style="font-size:11px;font-weight:700;color:var(--t1);">'+awayNom+'</div></div>';
      html += '</div>';

      // Score mi-temps
      if(score.halftime&&(score.halftime.home!==null)) {
        html += '<div style="text-align:center;font-size:10px;color:var(--t3);margin-top:4px;">MT: '+score.halftime.home+' - '+score.halftime.away+'</div>';
      }

      // Stats si dispo
      if(f.statistics&&f.statistics.length) {
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:10px;">';
        var statList = ['Ball Possession','Total Shots','Shots on Goal','Corner Kicks'];
        var homeStat = f.statistics.find(function(s){return s.team&&s.team.id===(teams.home&&teams.home.id);})||{};
        var awayStat = f.statistics.find(function(s){return s.team&&s.team.id===(teams.away&&teams.away.id);})||{};
        statList.forEach(function(sn){
          var hs = (homeStat.statistics||[]).find(function(x){return x.type===sn;});
          var as2 = (awayStat.statistics||[]).find(function(x){return x.type===sn;});
          if(hs&&as2) {
            html += '<div style="background:rgba(255,255,255,.04);border-radius:8px;padding:6px 10px;text-align:center;">';
            html += '<div style="font-size:10px;color:var(--t3);margin-bottom:2px;">'+sn.replace('Ball Possession','Possession').replace('Total Shots','Tirs').replace('Shots on Goal','Cadrés').replace('Corner Kicks','Corners')+'</div>';
            html += '<div style="font-size:12px;font-weight:700;color:var(--t1);">'+(hs.value||0)+' - '+(as2.value||0)+'</div>';
            html += '</div>';
          }
        });
        html += '</div>';
      }

      html += '</div>';

      // Bouton rafraîchir
      html += '<button onclick="loadTeamLive()" style="width:100%;padding:8px;background:rgba(255,0,0,.1);border:1px solid rgba(255,0,0,.2);border-radius:8px;color:#ff4545;font-size:11px;font-weight:700;cursor:pointer;margin-top:6px;">🔄 Rafraîchir</button>';

    } else {
      // Pas de match en direct — prochain match
      var nextData = await apiSportsFetch('/fixtures?team='+apiTeamId+'&next=3');
      var nextFixtures = nextData&&nextData.response||[];
      var pastData = await apiSportsFetch('/fixtures?team='+apiTeamId+'&last=5');
      var pastFixtures = pastData&&pastData.response||[];

      if(nextFixtures.length) {
        html += '<div class="cwrap" style="margin-bottom:10px;">';
        html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">Prochains matchs</div>';
        nextFixtures.forEach(function(f){
          var fix=f.fixture||{}, teams=f.teams||{}, league=f.league||{};
          var isHome=teams.home&&teams.home.name===nom;
          var adv=isHome?(teams.away&&teams.away.name||'?'):(teams.home&&teams.home.name||'?');
          var advLogo=isHome?(teams.away&&teams.away.logo||''):(teams.home&&teams.home.logo||'');
          var d=new Date(fix.date||'');
          var ds=d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'});
          var ts=d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
          html += '<div style="display:flex;align-items:center;padding:10px 12px;background:var(--s1);border-radius:var(--r6);margin-bottom:6px;border-left:3px solid '+col+';">';
          if(advLogo) html += '<img src="'+advLogo+'" style="width:28px;height:28px;object-fit:contain;margin-right:10px;">';
          html += '<div style="flex:1;"><div style="font-size:12px;font-weight:700;color:var(--t1);">'+(isHome?'🏠 vs ':'🚌 @ ')+adv+'</div>';
          html += '<div style="font-size:10px;color:var(--t3);">'+league.name+'</div></div>';
          html += '<div style="text-align:right;"><div style="font-size:11px;font-weight:700;color:var(--a);">'+ds+'</div>';
          html += '<div style="font-size:10px;color:var(--t3);">'+ts+'</div></div>';
          html += '</div>';
        });
        html += '</div>';
      }

      if(pastFixtures.length) {
        html += '<div class="cwrap">';
        html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">Résultats récents</div>';
        pastFixtures.slice().reverse().forEach(function(f){
          var fix=f.fixture||{}, teams=f.teams||{}, goals=f.goals||{}, league=f.league||{};
          var isHome=teams.home&&teams.home.name===nom;
          var adv=isHome?(teams.away&&teams.away.name||'?'):(teams.home&&teams.home.name||'?');
          var hg=goals.home||0, ag=goals.away||0;
          var tg=isHome?hg:ag, og=isHome?ag:hg;
          var won=tg>og, draw=tg===og;
          var rc2=won?'#1ed760':draw?'#f0b020':'#ff4545';
          var d2=new Date(fix.date||'');
          var ds2=d2.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
          html += '<div style="display:flex;align-items:center;padding:10px 12px;background:var(--s1);border-radius:var(--r6);margin-bottom:6px;border-left:3px solid '+rc2+';">';
          html += '<div style="width:22px;height:22px;border-radius:50%;background:'+rc2+';display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;margin-right:10px;">'+(won?'V':draw?'N':'D')+'</div>';
          html += '<div style="flex:1;"><div style="font-size:12px;font-weight:700;color:var(--t1);">'+(isHome?'🏠 vs ':'🚌 @ ')+adv+'</div>';
          html += '<div style="font-size:10px;color:var(--t3);">'+league.name+' · '+ds2+'</div></div>';
          html += '<div style="font-size:15px;font-weight:800;color:'+rc2+';">'+(isHome?hg+'-'+ag:ag+'-'+hg)+'</div>';
          html += '</div>';
        });
        html += '</div>';
      }
    }

    html += '</div>';
    el.innerHTML = html;

  } catch(e) {
    el.innerHTML = '<div style="text-align:center;padding:20px;"><div style="color:#ff4545;font-size:13px;font-weight:700;margin-bottom:8px;">❌ Erreur live</div><div style="color:var(--t3);font-size:11px;">'+e.message+'</div><button onclick="loadTeamLive()" style="margin-top:12px;padding:8px 16px;background:rgba(77,132,255,.12);border:1px solid rgba(77,132,255,.3);border-radius:8px;color:#4d84ff;font-size:11px;cursor:pointer;">🔄 Réessayer</button></div>';
    console.error('loadLiveApiSports error:', e);
  }
}

// Cache des IDs api-sports par équipe
var _apiSportsTeamCache = {};

// IDs api-sports des équipes principales
var API_SPORTS_IDS = {
  'PSG':85,'Paris Saint-Germain':85,'Paris SG':85,'Paris Saint-Germain FC':85,
  'Lyon':80,'Olympique Lyonnais':80,
  'Marseille':81,'Olympique de Marseille':81,
  'Monaco':91,'AS Monaco':91,
  'Lille':79,'Lens':116,
  'Nice':84,'Rennes':111,'Nantes':83,
  'Real Madrid':541,'FC Barcelona':529,'Barcelona':529,
  'Bayern Munich':157,'Borussia Dortmund':165,
  'Inter Milan':505,'AC Milan':489,'Juventus':496,
  'Arsenal':42,'Chelsea':49,'Liverpool':40,
  'Manchester City':50,'Manchester United':33,
  'Tottenham':47,'Newcastle':34,'Aston Villa':66,
  'PSV':674,'Ajax':194,'AFC Ajax':194,
  'Porto':212,'Benfica':211,'Sporting':228,
  'Atletico Madrid':530,'Sevilla':536,'Villarreal':533,
  'Boca Juniors':405,'River Plate':410,
  'Flamengo':127,'Palmeiras':121,'Fluminense':119,
  'France':2,'Espagne':9,'Allemagne':25,
  'Angleterre':10,'Italie':27,'Portugal':27,
};

async function findApiSportsTeamId(nom, key) {
  if(_apiSportsTeamCache[nom]) return _apiSportsTeamCache[nom];
  // Chercher dans le dictionnaire d'abord
  if(API_SPORTS_IDS[nom]) { _apiSportsTeamCache[nom]=API_SPORTS_IDS[nom]; return API_SPORTS_IDS[nom]; }
  // Chercher par clé partielle
  for(var k in API_SPORTS_IDS) {
    if(nom.toLowerCase().indexOf(k.toLowerCase())>=0 || k.toLowerCase().indexOf(nom.toLowerCase())>=0) {
      _apiSportsTeamCache[nom]=API_SPORTS_IDS[k];
      return API_SPORTS_IDS[k];
    }
  }
  // Sinon requête API
  try {
    var d = await apiSportsFetch('/teams?search='+encodeURIComponent(nom.substring(0,10)));
    var teams = d&&d.response||[];
    if(!teams.length) return null;
    var match = teams.find(function(t){ return t.team&&t.team.name&&t.team.name.toLowerCase()===nom.toLowerCase(); });
    if(!match) match = teams.find(function(t){ return t.team&&t.team.name&&nom.toLowerCase().indexOf(t.team.name.toLowerCase())>=0; });
    if(!match) match = teams[0];
    if(match&&match.team) {
      _apiSportsTeamCache[nom] = match.team.id;
      return match.team.id;
    }
  } catch(e) {}
  return null;
}

function loadTeamLiveTSDB(el,nom,sport){
  var tid=TSDB_IDS[nom];
  var p=(state.u.find(function(u){return u.n===nom;})||{color:'#4d84ff'}).color||'#4d84ff';
  if(!tid){el.innerHTML='<div style="text-align:center;padding:40px 20px;"><div style="font-size:48px;margin-bottom:16px">🏉</div><div style="font-size:15px;font-weight:800;color:'+p+'">'+nom+'</div><a href="https://www.thesportsdb.com/search_all_teams.php?t='+encodeURIComponent(nom)+'" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:'+p+';color:#fff;padding:12px 24px;border-radius:var(--r8);font-size:13px;font-weight:700;text-decoration:none">🔍 TheSportsDB</a></div>';return;}
  el.innerHTML='<div class="empty">⏳ Chargement…</div>';
  fetch('https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id='+tid).then(function(r){return r.json();}).then(function(d){
    var events=(d.events||[]).slice(0,5);
    var html2='<div style="font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--t3);margin-bottom:8px">Prochains matchs</div>';
    if(events.length){html2+=events.map(function(e){var date=e.dateEvent?e.dateEvent.split('-').reverse().join('/'):'?';var isHome=e.strHomeTeam===nom;var opp=isHome?e.strAwayTeam:e.strHomeTeam;return '<div style="display:flex;align-items:center;gap:8px;padding:9px 12px;background:var(--s1);border-radius:var(--r6);margin-bottom:6px;border-left:3px solid '+p+'"><div style="font-size:9px;color:var(--t3);width:34px;text-align:center">'+date+'</div><div style="flex:1"><div style="font-size:12px;font-weight:700">'+(isHome?'🏠':'✈')+' vs '+opp+'</div><div style="font-size:10px;color:var(--t3)">'+e.strLeague+'</div></div></div>';}).join('');}
    else html2+='<div class="empty">Aucun match</div>';
    el.innerHTML=html2;
  }).catch(function(){el.innerHTML='<div class="empty">❌ Erreur API</div>';});
}
function updateAdvList(){}
function updateCompList(){
  var sport=($i('c-sport')&&$i('c-sport').value)||'⚽';
  var comps=sport==='⚽'?['Ligue 1','Champions League','Europa League','Conference League','Premier League','La Liga','Bundesliga','Serie A','Eredivisie','Liga Portugal','Série A brésilienne','MLS']:sport==='🏀'?['NBA','Euroleague','Pro A']:sport==='🎾'?['Roland Garros','Wimbledon','US Open','Australian Open','Masters 1000']:sport==='🏒'?['NHL']:sport==='⚾'?['MLB']:sport==='🏈'?['NFL']:['Ligue 1'];
  var dl=$i('comp-list');if(dl)dl.innerHTML=comps.map(function(c){return '<option value="'+c+'">';}).join('');
  var dl2=$i('comp-list-simple');if(dl2)dl2.innerHTML=comps.map(function(c){return '<option value="'+c+'">';}).join('');
}
function saveDbxKey(){
  var inp=$i('dbx-key-input');if(!inp)return;
  var key=inp.value.trim();if(!key)return;
  localStorage.setItem('gones45_dbx_token',key);
  _dbxConfig.refreshToken=key;
  var st=$i('dbx-key-status');
  if(st){st.innerText='✅ Token enregistré !';st.style.color='var(--g)';}
  setTimeout(function(){if(st)st.innerText='';},3000);
}
async function testDbxKey(){
  var st=$i('dbx-key-status');
  if(st){st.innerText='⏳ Test connexion…';st.style.color='var(--t3)';}
  try{
    var token=await getValidToken();
    if(!token){if(st){st.innerText='❌ Impossible de rafraîchir le token';st.style.color='var(--r)';}return;}
    var res=await fetch('https://api.dropboxapi.com/2/users/get_current_account',{method:'POST',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:'null'});
    var d=await res.json();
    if(d.email){if(st){st.innerText='✅ Connecté : '+d.email+' (token auto)';st.style.color='var(--g)';}}
    else{if(st){st.innerText='❌ Erreur compte';st.style.color='var(--r)';}}
  }catch(e){if(st){st.innerText='❌ Erreur réseau';st.style.color='var(--r)';}}
}

function loadTeamCompo(){
  var el = $i('ip-compo'); if(!el) return;
  el.style.display = 'block';
  var nom = _currentTeam||'';
  var uObj = state.u.find(function(x){return x.n===nom;})||{};
  var col = uObj.color||'#4d84ff';

  // Chercher le teamId
  var sofaId = SOFASCORE_TEAM_IDS && SOFASCORE_TEAM_IDS[nom];
  if(!sofaId){ for(var k in SOFASCORE_TEAM_IDS){ if(nom.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(nom.toLowerCase())>=0){sofaId=SOFASCORE_TEAM_IDS[k];break;} } }
  var fdTeamId = TEAM_IDS[nom]||null;
  if(!fdTeamId){ for(var k in TEAM_IDS){ if(nom.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(nom.toLowerCase())>=0){fdTeamId=TEAM_IDS[k];break;} } }

  el.innerHTML = '<div id="compo-squad-section"></div>';
  var squadEl = document.getElementById('compo-squad-section');
  if(squadEl) loadFdSquad(squadEl, nom, fdTeamId, true);
}

function loadTeamLive(){
  var el=$i('ip-live');if(!el)return;
  el.style.display='block';
  var nom=_currentTeam||'';
  var uObj=state.u.find(function(x){return x.n===nom;})||{};
  var col=uObj.color||'#4d84ff';
  var sport=uObj.sport||'⚽';
  if(sport==='🏉🇦🇺'||sport==='🏉'){loadTeamLiveTSDB(el,nom,sport);return;}
  // Sports avec résumés vidéo dédiés
  if(sport==='🏒'||sport==='🏒🇺🇸') { loadVideoHighlights(el,nom,col,'nhl'); return; }
  if(sport==='⚾'||sport==='⚾🇺🇸') { loadVideoHighlights(el,nom,col,'mlb'); return; }
  if(sport==='🏀'||sport==='🏀🇺🇸') { loadVideoHighlights(el,nom,col,'nba'); return; }
  if(sport==='🏎️'||sport==='🏎') { loadVideoHighlights(el,nom,col,'f1'); return; }

  // Trouver l'ID football-data
  var teamId=null;
  for(var k in TEAM_IDS){
    if(k.toLowerCase()===nom.toLowerCase()||nom.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(nom.toLowerCase())>=0){
      teamId=TEAM_IDS[k];break;
    }
  }

  var customLink=(uObj&&uObj.link)||null;
  var sofaUrl=customLink||SOFASCORE_LINKS[nom]||('https://www.sofascore.com/search#q='+encodeURIComponent(nom));

  if(!teamId||!getFdorgKey()){
    // Pas de clé ou équipe inconnue → Sofascore
    el.innerHTML='<div style="text-align:center;padding:40px 20px;">'
      +'<div style="font-size:48px;margin-bottom:16px">📡</div>'
      +'<div style="font-size:15px;font-weight:800;margin-bottom:6px;color:'+col+'">'+nom+'</div>'
      +'<div style="font-size:11px;color:var(--t3);margin-bottom:24px">Résultats · Classement · Stats en direct</div>'
      +'<a href="'+sofaUrl+'" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:'+col+';color:#fff;padding:13px 26px;border-radius:var(--r8);font-size:13px;font-weight:700;text-decoration:none;">📊 Voir sur Sofascore</a>'
      +'</div>';
    return;
  }

  // FPL pour les équipes de Premier League — automatique sans clé
  var fplNom = FPL_TEAM_MAP&&FPL_TEAM_MAP[nom];
  if(fplNom) {
    el.innerHTML = '<div id="live-apisports-section"></div><div id="live-fpl-section" style="margin-top:10px;"></div>';
    var fplEl = document.getElementById('live-fpl-section');
    if(fplEl) loadFplSquad(fplEl, nom);
    var apiSportsKey2 = getApiSportsKey();
    if(apiSportsKey2) {
      var liveTarget = document.getElementById('live-apisports-section');
      if(liveTarget) loadLiveApiSports(liveTarget, nom, col, teamId, apiSportsKey2);
    } else {
      var ls2 = document.getElementById('live-apisports-section');
      if(ls2) ls2.innerHTML = '';
    }
    return;
  }

  // Squad dans Live uniquement pour le terrain (noTerrain=false), tableau dans Compo
  var fdKeyCheck = getFdorgKey();
  var fdTeamId = TEAM_IDS[nom]||null;
  if(!fdTeamId){ for(var k in TEAM_IDS){ if(nom.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(nom.toLowerCase())>=0){fdTeamId=TEAM_IDS[k];break;} } }
  if(fdKeyCheck && fdTeamId) {
    el.innerHTML = '<div id="live-apisports-section2"></div><div id="live-fd-section" style="margin-top:10px;"></div>';
    var fdSquadEl = document.getElementById('live-fd-section');
    if(fdSquadEl) loadFdSquad(fdSquadEl, nom, fdTeamId, false, true);
    var apiSportsKey2b = getApiSportsKey();
    if(apiSportsKey2b){
      var liveTarget2 = document.getElementById('live-apisports-section2');
      if(liveTarget2) loadLiveApiSports(liveTarget2, nom, col, teamId, apiSportsKey2b);
    }
    return;
  }

  // Vérifier si un match est en cours via api-sports
  var apiSportsKey = getApiSportsKey();
  if(apiSportsKey) {
    loadLiveApiSports(el, nom, col, teamId, apiSportsKey);
    return;
  }

  // Afficher bouton de chargement
  el.innerHTML='<div class="fc" style="text-align:center;">'
    +'<div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:6px;">'+nom+'</div>'
    +'<div style="font-size:11px;color:var(--t3);margin-bottom:14px;">Charge les prochains matchs et résultats récents via football-data</div>'
    +'<button id="btn-load-calendar" style="padding:11px 24px;border-radius:var(--r8);border:none;background:'+col+';color:#fff;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:10px;">📅 Charger le calendrier</button>'
    +'<div style="font-size:10px;color:var(--t3);">1 requête · données mises en cache</div>'
    +'</div>'
    +'<div id="calendar-content"></div>'
    +'<div style="margin-top:12px;text-align:center;">'
    +'<a href="'+sofaUrl+'" target="_blank" style="font-size:11px;color:var(--t3);">→ Voir aussi sur Sofascore</a>'
    +'</div>';

  document.getElementById('btn-load-calendar').onclick = function(){
    loadTeamCalendar(teamId, nom, col);
  };
}

async function loadTeamCalendar(teamId, nom, col) {
  var btn = document.getElementById('btn-load-calendar');
  var cont = document.getElementById('calendar-content');
  if(!btn||!cont) return;
  btn.textContent = 'Chargement...';
  btn.disabled = true;

  try {
    var [upcoming, finished] = await Promise.all([
      fdFetch('/v4/teams/'+teamId+'/matches?status=SCHEDULED&limit=5'),
      fdFetch('/v4/teams/'+teamId+'/matches?status=FINISHED&limit=10')
    ]);

    var html = '';

    // ── Prochains matchs ──
    if(upcoming && upcoming.matches && upcoming.matches.length) {
      html += '<div class="cwrap" style="margin-top:10px;">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">Prochains matchs</div>';
      upcoming.matches.forEach(function(m){
        var isDom = m.homeTeam && m.homeTeam.id === teamId;
        var adv = isDom ? (m.awayTeam&&m.awayTeam.name||'?') : (m.homeTeam&&m.homeTeam.name||'?');
        var advId = isDom ? (m.awayTeam&&m.awayTeam.id) : (m.homeTeam&&m.homeTeam.id);
        var advCrest = isDom ? (m.awayTeam&&m.awayTeam.crest||'') : (m.homeTeam&&m.homeTeam.crest||'');
        var d = new Date(m.utcDate);
        var dateStr = d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'});
        var timeStr = d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
        var comp = m.competition&&m.competition.name||'';
        var compIco2 = getCompIcon(comp);
        html += '<div id="match-adv-'+m.id+'" style="background:var(--s1);border-radius:10px;margin-bottom:8px;border:1px solid rgba(255,255,255,.06);overflow:hidden;">';
        // Header match
        html += '<div style="display:flex;align-items:center;padding:10px 12px;border-left:3px solid '+col+';cursor:pointer;" onclick="chargerFicheAdversaire('+m.id+','+advId+',\''+adv.replace(/'/g,"\\'")+'\')">';
        if(advCrest) html += '<img src="'+advCrest+'" style="width:28px;height:28px;object-fit:contain;margin-right:10px;flex-shrink:0;" loading="lazy">';
        html += '<div style="flex:1;">';
        html += '<div style="font-size:12px;font-weight:700;color:var(--t1);">'+(isDom?'🏠 vs ':'🚌 @ ')+adv+'</div>';
        html += '<div style="font-size:10px;color:var(--t3);margin-top:2px;">'+compIco2+' '+comp+'</div>';
        html += '</div>';
        html += '<div style="text-align:right;">';
        html += '<div style="font-size:11px;font-weight:700;color:var(--a);">'+dateStr+'</div>';
        html += '<div style="font-size:10px;color:var(--t3);">'+timeStr+'</div>';
        html += '<div style="font-size:9px;color:#4d84ff;margin-top:2px;">🔍 Analyser →</div>';
        html += '</div></div>';
        // Zone pour la fiche adversaire (cachée au départ)
        html += '<div id="adv-detail-'+m.id+'" style="display:none;"></div>';
        html += '</div>';
      });
      html += '</div>';
    }

    // ── Résultats récents ──
    if(finished && finished.matches && finished.matches.length) {
      html += '<div class="cwrap" style="margin-top:10px;">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">Résultats récents</div>';
      finished.matches.slice(0,5).reverse().forEach(function(m){
        var isDom = m.homeTeam && m.homeTeam.id === teamId;
        var adv = isDom ? (m.awayTeam&&m.awayTeam.name||'?') : (m.homeTeam&&m.homeTeam.name||'?');
        var hg = (m.score&&m.score.regularTime?m.score.regularTime.home:m.score&&m.score.fullTime?m.score.fullTime.home:0)||0;
        var ag = (m.score&&m.score.regularTime?m.score.regularTime.away:m.score&&m.score.fullTime?m.score.fullTime.away:0)||0;
        var tg = isDom?hg:ag, og = isDom?ag:hg;
        var won = tg>og, draw = tg===og;
        var rc = won?'#1ed760':draw?'#f0b020':'#ff4545';
        var rl = won?'V':draw?'N':'D';
        var scoreStr = isDom ? hg+' - '+ag : ag+' - '+hg;
        var d = new Date(m.utcDate);
        var dateStr = d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
        var comp = m.competition&&m.competition.name||'';
        var compIco = getCompIcon(comp);
        html += '<div onclick="ouvrirDetailMatch('+m.id+')" style="display:flex;align-items:center;padding:10px 12px;background:var(--s1);border-radius:var(--r6);margin-bottom:6px;border-left:3px solid '+rc+';cursor:pointer;">';
        html += '<div style="width:22px;height:22px;border-radius:50%;background:'+rc+';display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;flex-shrink:0;margin-right:10px;">'+rl+'</div>';
        html += '<div style="flex:1;">';
        html += '<div style="font-size:12px;font-weight:700;color:var(--t1);">'+(isDom?'🏠 vs ':'🚌 @ ')+adv+'</div>';
        html += '<div style="font-size:10px;color:var(--t3);margin-top:2px;">'+compIco+' '+comp+' · '+dateStr+'</div>';
        html += '</div>';
        html += '<div style="font-size:15px;font-weight:800;color:'+rc+';">'+scoreStr+'</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    if(!html) html = '<div class="fc" style="color:var(--t3);text-align:center;">Aucune donnée disponible</div>';
    cont.innerHTML = html;
    btn.style.display = 'none';

  } catch(e) {
    btn.textContent = 'Erreur - Reessayer';
    btn.disabled = false;
  }
}

/* ── DROPBOX AUTO-SAVE (refresh token permanent) ── */
var _dbxConfig={
  appKey:'x9j8qikpa21j1pv',
  appSecret:'vk2o926kopta87b',
  refreshToken:'sl.u.AGhBCqnmWUxbU0tdeMSXTeodWfHcx6CsLZpS2B51mZRlQLDTdM6tBwBlpQbsGPF0n7gUSPrmGn1zj7L9VynnPF6ZSwCFMOgGWT2QckUF49Bmwq1PeRBJYUbcSo-77CPcCTlaXWCIAiMKAytR1UKvlLm7qn1xmZ1T8cZcCX9lqOqkVPRQenzqhmYOKoJJ91cO6nc9_Y9a7s9miN_q7DwVoUutucbLFMRvjy31DlipjxEbDaVhviOiIaaz0VzZsN3L9QEmTASGuE-vWB6QFUUhOZ-TJb4UeyEG9iz0bF-LedTVsSRMmax2yHVKF9ecD0nuMhIa9cE3qcZ6HqPYzu_Nl14dRZ4IFRORuPYD4uWEgiEIaTl3EBfPZPWB0uM8CIarVQh8YcW5QDv26IUIWpZ1bQ7PGPOW-bQog7CKA1yApPxZ-67upPzkUAT_rR529H-K_k9wYMGk_tv7ojT_9SnF2tm5xbm8QXz7UsEG-CKHVockwMJ8jY3U_EbyXy4XGnw66-afjlXFMVxhfQUnNmxlLILs36JKN4uPeS6bNbksxI_XbGM_6-wClAsLCOg5jAqhGsqLfc-HdbmdpHlxqVM_IXJ3N3B3K5PCaijAkVWLQnSnQ6CLBDRPuxLhJUtySInpU4fQ_Ub6MDX5t7bA3k3CMyLT9MPhOLHChwwuwBdr4V7G48oUbvC-HYLwyH6EiMu2xLDlNBdVauf5HSzS6b51phLQByTUk6dWeQ58jAYGx8TVyEQFCf2DOJfcRjZ7L2vdXj81ARXsz0nrUgHX1sRTDjg-Kq4MaMAG_AQ9kchodb0quM7IvgfSOdYqpfcWbEtPaznvpL8gGLjtjRRVwa9FPxKXE3cb8flbqbS4b8IfldwpiD3gZxvkehAsWkk9zD_lrFdCT01COg17RBT2XIgEbvLkmZbeXMFsHe7BXAghrmZ_ifFhKaiZeaFZJc0e7kZ5vek3FaNHzZv-HOYmGdBs4TQ0WjqaIsOciVoLKFgRxw7OUgzgSNUxLewgd91_O7GBzfgc1i5dWwR7dm5ZQWZAItzKGG_4i9belqxTUHLdKNTZ_D2R3doykmOiK9_Ch_Pv22SKolHN2-uR4UvIymo8k30Dbh828KQn5402b5W_P3eMHZVTfERdKiht4EsXF1zAJGJ21Nvd1zMVmhmbB4y3v3mAXJg_iRyYGxMBz1gPtgQcx1HyalTwzLncRVhF3Pdq9dBDLHv-Y7JBH4XaT4f6kOc9JtDANJF10txEZQUZyzAI8AWkGq8VfvghTAYZUazZ_3yYUMBFuunTp3gQMCZf8A3Gs3eIRIgOZKOS-y6nL3Qhe_wC3C3gyvmnuM5IgvgoWK4nq5XsDluYvLIClJACp_lh3VtMcXYB850Pqlf_VXspgK89199OCaiCQOLWLrS4i4mkg2RNBIwfsCWePZinRwXSzKTgqHcJr43zC0TCsaAWIlbGM0tz66L15rNQPNgcypBI'
};
var _dbxSaving=false;
var _dbxAccessToken=null;
async function getValidToken(){
  return localStorage.getItem('gones45_dbx_token')||_dbxConfig.refreshToken||null;
}
async function saveToDropbox(){
  if(_dbxSaving)return;
  _dbxSaving=true;
  try{
    var token=await getValidToken();
    if(!token){_dbxSaving=false;showDbxStatus('❌ Token Dropbox invalide');return;}
    var res=await fetch('https://content.dropboxapi.com/2/files/upload',{
      method:'POST',
      headers:{
        'Authorization':'Bearer '+token,
        'Dropbox-API-Arg':JSON.stringify({path:'/GONES45/backup.json',mode:'overwrite',autorename:false}),
        'Content-Type':'application/octet-stream'
      },
      body:JSON.stringify(state)
    });
    _dbxSaving=false;
    if(res.ok){showDbxStatus('✅ Sauvegardé sur Dropbox');}
    else{showDbxStatus('⚠️ Erreur Dropbox '+res.status);}
  }catch(e){_dbxSaving=false;showDbxStatus('❌ Dropbox hors ligne');}
}
async function loadFromDropbox(){
  var el=document.getElementById('dbx-load-status');
  if(el)el.innerText='⏳ Chargement...';
  try{
    var token=await getValidToken();
    if(!token){if(el)el.innerText='❌ Token Dropbox invalide';return;}
    var res=await fetch('https://content.dropboxapi.com/2/files/download',{
      method:'POST',
      headers:{
        'Authorization':'Bearer '+token,
        'Dropbox-API-Arg':JSON.stringify({path:'/GONES45/backup.json'})
      }
    });
    if(!res.ok){if(el)el.innerText='❌ Fichier introuvable sur Dropbox';return;}
    var data=await res.json();
    state=data;
    save();
    if(el)el.innerText='✅ Données chargées !';
    setTimeout(function(){location.reload();},1200);
  }catch(e){if(el)el.innerText='❌ Erreur : '+e.message;}
}
function showDbxStatus(msg){
  var el=document.getElementById('dbx-status');
  if(!el){el=document.createElement('div');el.id='dbx-status';
    el.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(14,18,32,.97);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:7px 16px;font-size:11px;font-weight:700;z-index:9999;color:var(--t1);white-space:nowrap;';
    document.body.appendChild(el);}
  el.innerText=msg;el.style.opacity='1';
  setTimeout(function(){el.style.opacity='0';},3000);
}
/* ── DROPBOX-TRIGGERED SAVE ── */
var _origSave=save;
save=function(){localStorage.setItem('g45v5',JSON.stringify(state));render();saveToDropbox();};

var arjelRows=[{c:3.00,book:'Bookie 1',isFb:false},{c:3.50,book:'Bookie 2',isFb:true},{c:3.20,book:'Bookie 3',isFb:false}];
var arjelMode='full';
function setArjelMode(m){
  arjelMode=m;
  var bf=$i('arjel-mode-full');var bs=$i('arjel-mode-split');
  if(bf){bf.style.background=m==='full'?'rgba(240,176,32,.15)':'none';bf.style.borderColor=m==='full'?'var(--gold)':'var(--b2)';bf.style.color=m==='full'?'var(--gold)':'var(--t3)';}
  if(bs){bs.style.background=m==='split'?'rgba(77,132,255,.15)':'none';bs.style.borderColor=m==='split'?'var(--a)':'var(--b2)';bs.style.color=m==='split'?'var(--a)':'var(--t3)';}
  var desc=$i('arjel-desc');
  if(desc)desc.innerText=m==='full'?'🎟 FB automatique sur la plus grosse cote.':'✂️ Clique sur 🎟/💵 pour choisir qui reçoit le freebet.';
  buildArjelRows();
}
function toggleArjelFb(idx){
  idx=parseInt(idx);
  if(arjelMode==='full'){arjelRows.forEach(function(r,i){r.isFb=(i===idx);});}
  else{arjelRows[idx].isFb=!arjelRows[idx].isFb;}
  buildArjelRows();
}
function buildArjelRows(){
  var dr=$i('arjel-rows');if(!dr)return;
  if(arjelMode==='full'){
    var maxC=Math.max.apply(null,arjelRows.map(function(r){return r.c||0;}));
    arjelRows.forEach(function(r){r.isFb=(r.c===maxC);});
  }
  dr.innerHTML=arjelRows.map(function(r,i){
    var isFb=!!r.isFb;
    return '<div class="dutch-row" style="align-items:center;">'
      +'<button data-idx="'+i+'" onclick="toggleArjelFb(this.dataset.idx)" style="flex-shrink:0;padding:4px 8px;border-radius:4px;border:1px solid '+(isFb?'var(--gold)':'var(--b2)')+';background:'+(isFb?'rgba(240,176,32,.15)':'none')+';color:'+(isFb?'var(--gold)':'var(--t3)')+';font-size:10px;font-weight:700;cursor:pointer;">'+(isFb?'🎟':'💵')+'</button>'
      +'<input class="fi" value="'+r.book+'" placeholder="Bookmaker '+(i+1)+'" data-idx="'+i+'" oninput="arjelRows[this.dataset.idx].book=this.value;" style="flex:1;font-size:12px;">'
      +'<input type="number" class="fi" value="'+r.c+'" step="0.01" data-idx="'+i+'" oninput="arjelRows[this.dataset.idx].c=parseFloat(this.value)||1;buildArjelRows();" style="width:72px;color:'+(isFb?'var(--gold)':'var(--a)')+';font-weight:700;">'
      +(arjelRows.length>2?'<button class="udel" data-idx="'+i+'" onclick="arjelRows.splice(parseInt(this.dataset.idx),1);buildArjelRows();">✕</button>':'')
      +'</div>';
  }).join('');
  calcArjel();
}
function addArjelRow(){arjelRows.push({c:3.0,book:'Bookie '+(arjelRows.length+1),isFb:false});buildArjelRows();}

function calcArjel(){
  var fb=parseFloat(($i('arjel-fb')&&$i('arjel-fb').value)||10);
  if(!fb||arjelRows.length<2)return;
  var fbRows=arjelRows.filter(function(r){return r.isFb;});
  var realRows=arjelRows.filter(function(r){return !r.isFb;});
  if(!fbRows.length){fbRows=[arjelRows[0]];realRows=arjelRows.slice(1);}
  var fbPerRow=fb/fbRows.length;
  /* Gain brut moyen si freebet gagne */
  var gainFb=fbRows.reduce(function(s,r){return s+(r.c-1)*fbPerRow;},0)/fbRows.length;
  /* Mises réelles pour égaliser */
  var mises=[];var totalCash=0;
  realRows.forEach(function(r){
    var m=gainFb/r.c;
    mises.push(m);totalCash+=m;
  });
  var cash=gainFb-totalCash;
  var taux=fb>0?(cash/fb*100).toFixed(1):0;
  var tm=$i('arjel-mise');
  if(tm)tm.innerText='FB: '+fbRows.map(function(r){return '@'+r.c;}).join('+')+' · Réel: '+mises.map(function(m){return m.toFixed(2)+'€';}).join('+');
  var tc=$i('arjel-cash');if(tc){tc.innerText=(cash>=0?'+':'')+cash.toFixed(2)+'€';tc.style.color=cash>=0?'var(--g)':'var(--r)';}
  var tt=$i('arjel-taux');if(tt){tt.innerText=taux+'%';tt.style.color=parseFloat(taux)>80?'var(--g)':parseFloat(taux)>60?'var(--a)':'var(--r)';}
  var det=$i('arjel-detail');
  if(det){det.innerHTML='<div class="calc-res">'
    +fbRows.map(function(r){return '<div class="cres-row"><span class="cres-l">🎟 FB sur '+r.book+' (@'+r.c+')</span><span class="cres-v" style="color:var(--gold)">'+fbPerRow.toFixed(2)+'€</span></div>';}).join('')
    +realRows.map(function(r,i){return '<div class="cres-row"><span class="cres-l">💵 Réel sur '+r.book+' (@'+r.c+')</span><span class="cres-v" style="color:var(--a)">'+mises[i].toFixed(2)+'€</span></div>';}).join('')
    +'</div>';}
  var verd=$i('arjel-verdict');
  if(verd){
    var ok=cash>0;var great=parseFloat(taux)>80;
    verd.style.cssText='display:block;padding:10px;border-radius:var(--r6);text-align:center;font-size:13px;font-weight:700;background:'+(great?'rgba(30,215,96,.1)':ok?'rgba(77,132,255,.1)':'rgba(255,69,69,.1)')+';border:1px solid '+(great?'rgba(30,215,96,.25)':ok?'rgba(77,132,255,.25)':'rgba(255,69,69,.25)')+';color:'+(great?'var(--g)':ok?'var(--a)':'var(--r)');
    verd.innerText=great?'🔥 '+taux+'% = +'+cash.toFixed(2)+'€':ok?'✅ '+taux+'% = +'+cash.toFixed(2)+'€':'❌ Cotes insuffisantes';
  }
}




/* ── MYMATCH SIMPLE ── */
var mmRowsSimple=[{type:'',cote:1.50}];
function renderMmRowsSimple(){
  var sel=$i('mm-sel-simple');if(!sel)return;
  sel.innerHTML=mmRowsSimple.map(function(r,i){
    return '<div class="mm-row">'
      +'<input class="fi" value="'+r.type+'" placeholder="Type (Victoire…)" data-idx="'+i+'" oninput="mmRowsSimple[this.dataset.idx].type=this.value;renderMmCoteSimple();" style="flex:1;padding:6px 8px;font-size:12px;">'
      +'<input type="number" class="fi mm-cote" value="'+r.cote+'" step="0.01" data-idx="'+i+'" oninput="mmRowsSimple[this.dataset.idx].cote=parseFloat(this.value)||1;renderMmCoteSimple();" style="width:72px;color:var(--a);font-weight:700;">'
      +(mmRowsSimple.length>1?'<button class="mm-del" data-idx="'+i+'" onclick="mmRowsSimple.splice(parseInt(this.dataset.idx),1);renderMmRowsSimple();">✕</button>':'')
      +'</div>';
  }).join('');
  var types=$i('mm-types-simple');
  if(types)types.innerHTML=MM_TYPES.map(function(t){return '<button class="mm-type" data-t="'+t+'" onclick="addMmTypeSimple(this.dataset.t)">'+t+'</button>';}).join('');
  renderMmCoteSimple();
}
function renderMmCoteSimple(){
  var cote=mmRowsSimple.reduce(function(a,r){return a*(parseFloat(r.cote)||1);},1);
  var el=$i('mm-cote-total-simple');if(el)el.innerText='@'+cote.toFixed(2);
  var nc=$i('n-cote');if(nc)nc.value=cote.toFixed(2);
}
function addMmRowSimple(){mmRowsSimple.push({type:'',cote:1.50});renderMmRowsSimple();}
function addMmTypeSimple(t){
  if(mmRowsSimple.find(function(r){return r.type===t;}))return;
  mmRowsSimple.push({type:t,cote:1.50});renderMmRowsSimple();
}
function getMmLabelSimple(){
  return mmRowsSimple.filter(function(r){return r.type;}).map(function(r){return r.type+' @'+r.cote;}).join(' + ');
}
function syncSimpleCote(){
  var nc=$i('n-cote');if(!nc)return;
  var v=parseFloat(nc.value)||1;
  if(mmRowsSimple.length===1){mmRowsSimple[0].cote=v;renderMmCoteSimple();}
}

function openClubFromDash(nom){
  /* Switch to bilan tab first, then open club detail */
  var bilanBtn=document.querySelector('.ni[onclick*="t-bilan"]');
  showTab('t-bilan', bilanBtn);
  setTimeout(function(){
    var idx=state.u.findIndex(function(u){return u.n===nom;});
    openClub(nom, idx>=0?idx:0);
  }, 60);
}

/* ── GEMINI API ── */
function saveTavilyKey(){
  var inp=$i('tavily-key-input');if(!inp)return;
  var key=inp.value.trim();if(!key)return;
  localStorage.setItem('gones45_tavily_key',key);
  var st=$i('tavily-key-status');
  if(st){st.innerText='✅ Clé Tavily enregistrée';st.style.color='var(--g)';}
  setTimeout(function(){if(st)st.innerText='';},3000);
}
function getTavilyKey(){return localStorage.getItem('gones45_tavily_key')||null;}
async function testTavilyKey(){
  var key=getTavilyKey();
  var st=$i('tavily-key-status');
  if(!key){if(st){st.innerText='❌ Aucune clé';st.style.color='var(--r)';}return;}
  if(st){st.innerText='⏳ Test…';st.style.color='var(--t3)';}
  try{
    var r=await fetch('https://api.tavily.com/search',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({api_key:key,query:'test',max_results:1})
    });
    var d=await r.json();
    if(d.results){if(st){st.innerText='✅ Clé Tavily valide !';st.style.color='var(--g)';}}
    else{var e=(d.detail||d.error||'Erreur');if(st){st.innerText='❌ '+e.substring(0,80);st.style.color='var(--r)';}}
  }catch(e){if(st){st.innerText='❌ '+e.message;st.style.color='var(--r)';}}
}
async function searchTavily(query){
  var key=getTavilyKey();if(!key)return null;
  try{
    var r=await fetch('https://api.tavily.com/search',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({api_key:key,query:query,max_results:5,search_depth:'advanced',include_answer:true})
    });
    var d=await r.json();
    console.log('[Tavily]',d);
    if(!d.results||!d.results.length)return null;
    /* Priorité à la réponse directe de Tavily */
    var answer=d.answer||'';
    var snippets=d.results.map(function(r){return r.content||r.snippet||'';}).join(' ').substring(0,600);
    return answer?answer+' '+snippets:snippets;
  }catch(e){console.log('[Tavily erreur]',e);return null;}
}
function saveGeminiKey(){
  var inp=$i('gemini-key-input');if(!inp)return;
  var key=inp.value.trim();if(!key)return;
  localStorage.setItem('gones45_gemini_key',key);
  var st=$i('gemini-key-status');
  if(st){st.innerText='✅ Clé Groq enregistrée';st.style.color='var(--g)';}
  setTimeout(function(){if(st)st.innerText='';},3000);
}

function getApiSportsKey(){ return localStorage.getItem('gones45_apisports_key')||null; }

function saveApiSportsKey(){
  var inp = $i('apisports-key-input'); if(!inp) return;
  var key = inp.value.trim();
  if(!key){ alert('Clé vide'); return; }
  localStorage.setItem('gones45_apisports_key', key);
  var st = $i('apisports-key-status');
  if(st){ st.textContent='✅ Clé sauvegardée !'; st.style.color='var(--g)'; }
  saveToDropbox();
}

async function testApiSportsKey(){
  var key = getApiSportsKey();
  if(!key){ alert('Sauvegarde la clé d\'abord'); return; }
  var st = $i('apisports-key-status');
  if(st){ st.textContent='⏳ Test en cours...'; st.style.color='var(--t3)'; }
  try {
    var r = await fetch('https://fd-proxy.touraine-antoine.workers.dev/?key='+encodeURIComponent(key)+'&path=/status&host=apisports');
    var d = await r.json();
    var resp = d&&d.response&&d.response[0]||d&&d.response||null;
    if(resp&&resp.requests) {
      var cur = resp.requests.current||0;
      var lim = resp.requests.limit_day||100;
      if(st){ st.textContent='✅ Clé valide ! '+cur+'/'+lim+' req aujourd\'hui'; st.style.color='var(--g)'; }
    } else if(d&&d.errors&&d.errors.length) {
      if(st){ st.textContent='❌ '+JSON.stringify(d.errors[0]); st.style.color='var(--r)'; }
    } else {
      // Clé valide mais réponse inattendue
      if(st){ st.textContent='✅ Clé valide !'; st.style.color='var(--g)'; }
    }
  } catch(e) {
    if(st){ st.textContent='❌ Erreur : '+e.message; st.style.color='var(--r)'; }
  }
}

async function apiSportsFetch(path){
  var key = getApiSportsKey();
  if(!key) throw new Error('Clé api-sports manquante — configure dans Outils');
  var r = await fetch('https://fd-proxy.touraine-antoine.workers.dev/?key='+encodeURIComponent(key)+'&path='+encodeURIComponent(path)+'&host=apisports');
  if(!r.ok) throw new Error('HTTP '+r.status);
  return await r.json();
}

function getGeminiKey(){return localStorage.getItem('gones45_gemini_key')||null;}
async function testGroqKey(){
  var key=getGeminiKey();
  var st=$i('gemini-key-status');
  if(!key){if(st){st.innerText='❌ Aucune clé';st.style.color='var(--r)';}return;}
  if(st){st.innerText='⏳ Test…';st.style.color='var(--t3)';}
  try{
    var r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
      body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:[{role:'user',content:'OK'}],max_tokens:3})
    });
    var d=await r.json();
    if(d.choices&&d.choices[0]){if(st){st.innerText='✅ Clé valide !';st.style.color='var(--g)';}}
    else{var e=(d.error&&d.error.message)||JSON.stringify(d);if(st){st.innerText='❌ '+e.substring(0,80);st.style.color='var(--r)';}}
  }catch(e){if(st){st.innerText='❌ '+e.message;st.style.color='var(--r)';}}
}

/* ── CHAT GROQ ── */
var _chatHistory=[];

function chatBubble(role,text){
  var box=$i('chat-messages');if(!box)return;
  var isUser=role==='user';
  var div=document.createElement('div');
  div.style.cssText='display:flex;'+(isUser?'justify-content:flex-end':'justify-content:flex-start')+';';
  div.innerHTML='<div style="max-width:80%;padding:9px 13px;border-radius:'+(isUser?'14px 14px 4px 14px':'14px 14px 14px 4px')+
    ';background:'+(isUser?'var(--a)':'var(--s2)')+
    ';color:var(--t1);font-size:13px;line-height:1.5;white-space:pre-wrap;">'+
    text.replace(/</g,'&lt;')+'</div>';
  box.appendChild(div);
  box.scrollTop=box.scrollHeight;
}

function buildContext(){
  var s=state;
  var top5=s.u.slice(0,5).map(function(u){
    var paris=s.a.filter(function(h){return h.n===u.n;});
    var profit=paris.reduce(function(a,h){return a+(h.win?(h.m*h.cote)-h.m:-h.m);},0);
    return u.n+'('+(profit>=0?'+':'')+profit.toFixed(0)+'€)';
  }).join(',');
  var totalProfit=s.a.reduce(function(a,h){return a+(h.win?(h.m*h.cote)-h.m:-h.m);},0);
  var cap=Object.values(s.b).reduce(function(a,v){return a+parseFloat(v||0);},0);
  var today=new Date();var dateStr=today.toLocaleDateString('fr-FR');
  var dayNames=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  var dayName=dayNames[today.getDay()];
  return 'Tu es un assistant paris sportifs. Nous sommes le '+dayName+' '+dateStr+'. IMPORTANT: tout match dont la date est AVANT ce jour est TERMINE - ne jamais le presenter comme futur. REGLES: 1) Jamais de redirection ou "je n ai pas acces". 2) Max 2-3 phrases directes. 3) Si info via web dis-la directement. 4) Pas de markdown. 5) Si on te demande un match passe, donne le resultat si tu le sais. Bankroll:'+cap.toFixed(0)+'€ profit:'+totalProfit.toFixed(0)+'€ equipes:'+top5+'.';
}
function buildContextWithParams() {
  var base = buildContext();
  var extras = [];
  if (_chatParams.equipe) extras.push('Équipe focus: '+_chatParams.equipe);
  if (_chatParams.lieu !== 'both') extras.push('Mode favori: '+(_chatParams.lieu==='domicile'?'Domicile':'Extérieur'));
  if (_chatParams.types.length) extras.push('Types de paris à privilégier: '+_chatParams.types.join(', '));
  if (_chatParams.champOnly) extras.push('Analyse uniquement les matchs de championnat, exclure Coupes et amicaux');
  if (extras.length) base += ' PRÉFÉRENCES UTILISATEUR: '+extras.join('. ')+'.';
  return base;
}

async function sendChat(){
  var inp=$i('chat-input');
  var msg=inp?inp.value.trim():'';
  if(!msg)return;
  var key=getGeminiKey();
  if(!key){chatBubble('assistant','Configure ta cle Groq dans Outils.');return;}
  inp.value='';
  chatBubble('user',msg);
  _chatHistory.push({role:'user',content:msg});

  /* Indicateur de frappe */
  var box=$i('chat-messages');
  var typing=document.createElement('div');
  typing.id='chat-typing';
  typing.style.cssText='display:flex;justify-content:flex-start;';
  typing.innerHTML='<div style="padding:9px 13px;border-radius:14px 14px 14px 4px;background:var(--s2);color:var(--t3);font-size:12px;">…</div>';
  if(box){box.appendChild(typing);box.scrollTop=box.scrollHeight;}

  try{
    /* Recherche Tavily si question d'actu */
    var needsWeb=/match|résultat|score|classement|ligue|champion|derby|finale|vainqueur|transfert|blessé|compo|prochain|dernier|hier|aujourd|semaine|récent|actuell|2025|2026|nba|nfl|mlb|nhl|dodgers|lakers|yankees|chelsea|arsenal|psg|real|barça|liga|premier|bundesliga/i.test(msg);
    var webCtx='';var webFound=false;
    if(needsWeb&&getTavilyKey()){var searchResult=await searchTavily(msg);if(searchResult){webCtx=searchResult;webFound=true;}}
    var sysPrompt=webFound
      ?'Tu as ces infos web. Cite uniquement ce qui est confirmé. Si le score exact n est pas dans les infos, dis juste qui a gagné. 1-2 phrases en français, pas de supposition: '+webCtx
      :buildContextWithParams();
    var messages=[{role:'system',content:sysPrompt},{role:'user',content:msg}];
    var r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
      body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:messages,temperature:0.3,max_tokens:150})
    });
    var d=await r.json();
    var t=document.getElementById('chat-typing');if(t)t.remove();
    if(d.error)throw new Error(d.error.message);
    var reply=d.choices[0].message.content.trim();
    /* Retirer les citations [1][2] de compound-beta */
    reply=reply.replace(/\[\d+\]/g,'').trim();
    _chatHistory.push({role:'assistant',content:reply});
    chatBubble('assistant',reply);
  }catch(e){
    var t=document.getElementById('chat-typing');if(t)t.remove();
    chatBubble('assistant','Erreur : '+e.message);
  }
}

/* ── LIENS ── */
function loadCustomLinks(){
  var el=$i('custom-links-list');if(!el)return;
  var links=JSON.parse(localStorage.getItem('g45_links')||'[]');
  if(!links.length){el.innerHTML='<div class="empty">Aucun lien perso</div>';return;}
  el.innerHTML=links.map(function(l,i){
    return '<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--s1);border-radius:var(--r6);margin-bottom:6px;border:1px solid var(--b1);">'
      +'<a href="'+l.url+'" target="_blank" style="flex:1;color:var(--a);font-size:13px;font-weight:700;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">🔗 '+l.name+'</a>'
      +'<button onclick="deleteLink('+i+')" style="background:none;border:none;color:var(--r);cursor:pointer;font-size:16px;flex-shrink:0;">🗑</button>'
      +'</div>';
  }).join('');
}
function addCustomLink(){
  var name=$i('link-name');var url=$i('link-url');
  if(!name||!url||!name.value.trim()||!url.value.trim())return;
  var u=url.value.trim();
  if(!u.startsWith('http'))u='https://'+u;
  var links=JSON.parse(localStorage.getItem('g45_links')||'[]');
  links.push({name:name.value.trim(),url:u});
  localStorage.setItem('g45_links',JSON.stringify(links));
  name.value='';url.value='';
  loadCustomLinks();
}
function deleteLink(i){
  var links=JSON.parse(localStorage.getItem('g45_links')||'[]');
  links.splice(i,1);
  localStorage.setItem('g45_links',JSON.stringify(links));
  loadCustomLinks();
}
function togglePariDom(val){
  var inp=$i('p-domicile');if(inp)inp.value=val===null?'':val?'dom':'ext';
  var d=$i('pari-dom-btn');var e=$i('pari-ext-btn');var n=$i('pari-neu-btn');
  var active='border-color:var(--a);background:rgba(77,132,255,.15);color:var(--a);';
  var def='border:2px solid var(--b2);background:var(--bg3);color:var(--t2);';
  if(d)d.style.cssText=val===true?active:def;
  if(e)e.style.cssText=val===false?active:def;
  if(n)n.style.cssText=val===null?active:def;
}
function toggleEditDom(val){
  var inp=$i('edit-domicile');if(inp)inp.value=val?'dom':'ext';
  var d=$i('edit-dom-btn');var e=$i('edit-ext-btn');
  var active='flex:1;padding:10px;border-radius:var(--r6);border:2px solid var(--a);background:rgba(77,132,255,.15);color:var(--a);font-size:13px;font-weight:700;cursor:pointer;';
  var def='flex:1;padding:10px;border-radius:var(--r6);border:2px solid var(--b2);background:var(--bg3);color:var(--t2);font-size:13px;font-weight:700;cursor:pointer;';
  if(d)d.style.cssText=val?active:def;
  if(e)e.style.cssText=!val?active:def;
}
function editBet(id){
  var h=state.h.find(function(x){return x.id===id;});if(!h)return;
  $i('edit-bet-id').value=id;
  $i('edit-target').value=h.target||'';
  $i('edit-equipe').value=h.n||'';
  $i('edit-cote').value=h.cote||'';
  $i('edit-mise').value=h.m||'';
  $i('edit-sport').value=h.sport||'';
  $i('edit-comp').value=h.comp||'';
  $i('edit-type').value=h.type||'';
  $i('edit-bk').value=h.b||'';
  $i('edit-date').value=h.date||'';
  $i('edit-heure').value=h.heure||'';
  $i('edit-notes').value=h.notes||'';
  $i('edit-domicile').value=h.domicile||'';
  toggleEditDom(h.domicile==='dom'?true:false);
  var m=$i('edit-bet-modal');if(m)m.style.display='flex';
}
function closeEditBet(){
  var m=$i('edit-bet-modal');if(m)m.style.display='none';
}
function saveEditBet(){
  var id=$i('edit-bet-id').value;
  var idx=state.h.findIndex(function(x){return x.id===id;});if(idx===-1)return;
  var h=state.h[idx];
  h.target=$i('edit-target').value.trim();
  h.n=$i('edit-equipe').value.trim();
  h.cote=parseFloat($i('edit-cote').value)||h.cote;
  h.m=parseFloat($i('edit-mise').value)||h.m;
  h.sport=$i('edit-sport').value.trim();
  h.comp=$i('edit-comp').value.trim();
  h.type=$i('edit-type').value.trim();
  h.b=$i('edit-bk').value.trim();
  h.date=$i('edit-date').value;
  h.heure=$i('edit-heure').value;
  h.notes=$i('edit-notes').value.trim();
  h.domicile=$i('edit-domicile').value;
  save();render();closeEditBet();
}
function togglePlusMenu(){
  var m=$i('plus-menu');if(!m)return;
  var open=m.style.display==='block';
  m.style.display=open?'none':'block';
  if(!open){
    setTimeout(function(){
      document.addEventListener('click',function h(e){
        var pm=$i('plus-menu');var btn=$i('btn-plus-menu');
        if(pm&&btn&&!pm.contains(e.target)&&!btn.contains(e.target)){
          pm.style.display='none';document.removeEventListener('click',h);
        }
      });
    },50);
  }
}
function resetChat(){
  _chatHistory=[];
  var b1=$i('chat-messages');if(b1)b1.innerHTML='';
  var b2=$i('chat-messages-pc');if(b2)b2.innerHTML='';
}

/* ── SCAN TICKET via bloc-notes ── */
(function(){
  var penseBeteZone = document.getElementById('pc-note');
  if(!penseBeteZone) return;

  penseBeteZone.addEventListener('paste', function(e) {
    var items = e.clipboardData.items;
    for(var i=0;i<items.length;i++){
      var item = items[i];
      if(item.type.indexOf('image') !== -1){
        var blob = item.getAsFile();
        var reader = new FileReader();
        reader.onload = (function(blob){return function(event){
          var imageBase64 = event.target.result;

          penseBeteZone.innerHTML = '<img src="'+imageBase64+'" alt="Pense-bête" style="max-width:100%;border-radius:6px;">';
          localStorage.setItem('penseBeteImage', imageBase64);

          var avertissement = document.createElement('div');
          avertissement.style.cssText = 'position:absolute;bottom:10px;left:10px;background:rgba(0,0,0,0.8);color:#00ff88;padding:5px 10px;border-radius:5px;font-size:12px;z-index:10;';
          avertissement.innerText = 'Lecture du ticket en cours... ⏳';
          penseBeteZone.style.position = 'relative';
          penseBeteZone.appendChild(avertissement);

          if(typeof Tesseract === 'undefined'){ avertissement.innerText='❌ Tesseract non chargé'; return; }

          Tesseract.recognize(imageBase64, 'fra').then(function(result){
            var text = result.data.text;
            console.log('Texte: '+text);
            avertissement.innerText = 'Lecture réussie ! 🎯';
            setTimeout(function(){ avertissement.remove(); }, 2000);

            // Cote
            var matchCote = text.match(/(\d)[,.](\d{2})/);
            if(matchCote){
              var cEl = document.getElementById('n-cote')||document.getElementById('c-cote');
              if(cEl){ cEl.value = matchCote[1]+'.'+matchCote[2]; cEl.dispatchEvent(new Event('input')); }
            }

            // Mise
            var matchMise = text.match(/[Mm]ise\s*([\d,. ]+)/i);
            if(matchMise){
              var mv = parseFloat(matchMise[1].trim().replace(',','.').replace(/\s/g,''));
              var mEl = document.getElementById('n-mise')||document.getElementById('c-mise');
              if(mEl && mv>0) mEl.value = mv;
            }

            // Équipes
            var lignes = text.split('\n');
            var BRUIT = ['mise','gain','cashout','compléter','vainqueur','réf'];
            var ligneMatch = lignes.find(function(l){ return l.includes(' - ') && !BRUIT.some(function(b){return l.toLowerCase().includes(b);}); });
            if(ligneMatch){
              var tEl = document.getElementById('n-team')||document.getElementById('c-target');
              if(tEl) tEl.value = ligneMatch.trim().replace(/\s*(demain|aujourd'hui|\d{2}:\d{2}|LS &)\s*/gi,'').trim();
            }

            // Bookmaker
            var txtLow = text.toLowerCase();
            var bEl = document.getElementById('n-book')||document.getElementById('c-book');
            if(bEl){
              if(txtLow.includes('winamax')||txtLow.includes('cashout')||txtLow.includes('compléter')) bEl.value='Winamax';
              else if(txtLow.includes('betclic')) bEl.value='Betclic';
              else if(txtLow.includes('pmu')) bEl.value='PMU';
              else if(txtLow.includes('unibet')) bEl.value='Unibet';
              else if(txtLow.includes('zebet')) bEl.value='ZEbet';
            }

            // Sport
            var spEl = document.getElementById('n-sport')||document.getElementById('c-sport');
            if(spEl){
              var nhlTeams = ['golden knights','avalanche','maple leafs','canadiens','bruins','rangers','penguins','oilers','flames','canucks'];
              if(txtLow.includes('nhl')||txtLow.includes('hockey')||nhlTeams.some(function(t){return txtLow.includes(t);})) spEl.value='🏒';
              else if(txtLow.includes('tennis')||txtLow.includes('atp')||txtLow.includes('wta')||txtLow.includes('roland garros')) spEl.value='🎾';
              else if(txtLow.includes('nba')||txtLow.includes('basket')) spEl.value='🏀';
              else if(txtLow.includes('ligue 1')||txtLow.includes('champions league')||txtLow.includes('premier league')) spEl.value='⚽';
              else if(txtLow.includes('rugby')) spEl.value='🏉';
              else if(txtLow.includes('football')) spEl.value='⚽';
            }

          }).catch(function(err){
            console.error('Erreur Tesseract :', err);
            avertissement.innerText = 'Erreur de lecture ❌';
            setTimeout(function(){ avertissement.remove(); }, 2000);
          });
        };})(blob);
        reader.readAsDataURL(blob);
      }
    }
  });
})();


localStorage.setItem('gones45_dbx_token','sl.u.AGhBCqnmWUxbU0tdeMSXTeodWfHcx6CsLZpS2B51mZRlQLDTdM6tBwBlpQbsGPF0n7gUSPrmGn1zj7L9VynnPF6ZSwCFMOgGWT2QckUF49Bmwq1PeRBJYUbcSo-77CPcCTlaXWCIAiMKAytR1UKvlLm7qn1xmZ1T8cZcCX9lqOqkVPRQenzqhmYOKoJJ91cO6nc9_Y9a7s9miN_q7DwVoUutucbLFMRvjy31DlipjxEbDaVhviOiIaaz0VzZsN3L9QEmTASGuE-vWB6QFUUhOZ-TJb4UeyEG9iz0bF-LedTVsSRMmax2yHVKF9ecD0nuMhIa9cE3qcZ6HqPYzu_Nl14dRZ4IFRORuPYD4uWEgiEIaTl3EBfPZPWB0uM8CIarVQh8YcW5QDv26IUIWpZ1bQ7PGPOW-bQog7CKA1yApPxZ-67upPzkUAT_rR529H-K_k9wYMGk_tv7ojT_9SnF2tm5xbm8QXz7UsEG-CKHVockwMJ8jY3U_EbyXy4XGnw66-afjlXFMVxhfQUnNmxlLILs36JKN4uPeS6bNbksxI_XbGM_6-wClAsLCOg5jAqhGsqLfc-HdbmdpHlxqVM_IXJ3N3B3K5PCaijAkVWLQnSnQ6CLBDRPuxLhJUtySInpU4fQ_Ub6MDX5t7bA3k3CMyLT9MPhOLHChwwuwBdr4V7G48oUbvC-HYLwyH6EiMu2xLDlNBdVauf5HSzS6b51phLQByTUk6dWeQ58jAYGx8TVyEQFCf2DOJfcRjZ7L2vdXj81ARXsz0nrUgHX1sRTDjg-Kq4MaMAG_AQ9kchodb0quM7IvgfSOdYqpfcWbEtPaznvpL8gGLjtjRRVwa9FPxKXE3cb8flbqbS4b8IfldwpiD3gZxvkehAsWkk9zD_lrFdCT01COg17RBT2XIgEbvLkmZbeXMFsHe7BXAghrmZ_ifFhKaiZeaFZJc0e7kZ5vek3FaNHzZv-HOYmGdBs4TQ0WjqaIsOciVoLKFgRxw7OUgzgSNUxLewgd91_O7GBzfgc1i5dWwR7dm5ZQWZAItzKGG_4i9belqxTUHLdKNTZ_D2R3doykmOiK9_Ch_Pv22SKolHN2-uR4UvIymo8k30Dbh828KQn5402b5W_P3eMHZVTfERdKiht4EsXF1zAJGJ21Nvd1zMVmhmbB4y3v3mAXJg_iRyYGxMBz1gPtgQcx1HyalTwzLncRVhF3Pdq9dBDLHv-Y7JBH4XaT4f6kOc9JtDANJF10xEZQUZyzAI8AWkGq8VfvghTAYZUazZ_3yYUMBFuunTp3gQMCZf8A3Gs3eIRIgOZKOS-y6nL3Qhe_wC3C3gyvmnuM5IgvgoWK4nq5XsDluYvLIClJACp_lh3VtMcXYB850Pqlf_VXspgK89199OCaiCQOLWLrS4i4mkg2RNBIwfsCWePZinRwXSzKTgqHcJr43zC0TCsaAWIlbGM0tz66L15rNQPNgcypBI');
if(window.location.hash.indexOf("#simu=")>=0 || new URLSearchParams(window.location.search).get("sim")) setTimeout(chargerSimuDepuisUrl, 800);
if(window.location.hash.indexOf('#profil=')>=0) setTimeout(chargerProfilDepuisUrl, 800);
function saveNote(){
  var n=$i('pc-note');if(!n)return;
  localStorage.setItem('gones45_note',n.innerHTML);
}
function clearNote(){
  if(confirm('Effacer le pense-bête ?')){
    var n=$i('pc-note');if(n)n.innerHTML='';
    localStorage.removeItem('gones45_note');
  }
}
function chatBubblePC(role,text){
  var box=$i('chat-messages-pc');if(!box)return;
  var isUser=role==='user';
  var div=document.createElement('div');
  div.style.cssText='display:flex;'+(isUser?'justify-content:flex-end':'justify-content:flex-start')+';margin-bottom:4px;';
  div.innerHTML='<div style="max-width:85%;padding:7px 11px;border-radius:'+(isUser?'12px 12px 4px 12px':'12px 12px 12px 4px')+
    ';background:'+(isUser?'var(--a)':'var(--s2)')+
    ';color:var(--t1);font-size:12px;line-height:1.4;white-space:pre-wrap;">'+
    text.replace(/</g,'&lt;')+'</div>';
  box.appendChild(div);
  box.scrollTop=box.scrollHeight;
}
async function sendChatPC(){
  var inp=$i('chat-input-pc');
  var msg=inp?inp.value.trim():'';
  if(!msg)return;
  var key=getGeminiKey();
  if(!key){chatBubblePC('assistant','Configure ta clé Groq dans Outils.');return;}
  inp.value='';
  chatBubblePC('user',msg);
  _chatHistory.push({role:'user',content:msg});
  var typing=document.createElement('div');
  typing.id='chat-typing-pc';
  typing.style.cssText='display:flex;justify-content:flex-start;';
  typing.innerHTML='<div style="padding:7px 11px;border-radius:12px 12px 12px 4px;background:var(--s2);color:var(--t3);font-size:11px;">…</div>';
  var box=$i('chat-messages-pc');if(box){box.appendChild(typing);box.scrollTop=box.scrollHeight;}
  try{
    var needsWeb=/match|résultat|score|classement|ligue|champion|derby|finale|vainqueur|transfert|blessé|compo|prochain|dernier|hier|aujourd|semaine|récent|actuell|2025|2026|nba|nfl|mlb|nhl|dodgers|lakers|yankees|chelsea|arsenal|psg|real|barça|liga|premier|bundesliga/i.test(msg);
    var webCtx='';var webFound2=false;
    if(needsWeb&&getTavilyKey()){var sr=await searchTavily(msg);if(sr){webCtx=sr;webFound2=true;}}
    var sysPC=webFound2?'Tu as ces infos web. Cite uniquement ce qui est confirmé. Si le score exact n est pas dedans, dis juste qui a gagné. 1-2 phrases en français: '+webCtx:buildContextWithParams();
    var messages=[{role:'system',content:sysPC},{role:'user',content:msg}];
    var r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
      body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:messages,temperature:0.3,max_tokens:150})
    });
    var d=await r.json();
    var t=document.getElementById('chat-typing-pc');if(t)t.remove();
    if(d.error)throw new Error(d.error.message);
    var reply=d.choices[0].message.content.trim();
    _chatHistory.push({role:'assistant',content:reply});
    chatBubblePC('assistant',reply);
  }catch(e){
    var t=document.getElementById('chat-typing-pc');if(t)t.remove();
    chatBubblePC('assistant','Erreur : '+e.message);
  }
}

// ── ANALYSE IA ÉQUIPE ──

// ── FOOTBALL-DATA.ORG ──

// ── API-FOOTBALL (RAPIDAPI) ──

// ── THESPORTSDB — LOGOS OFFICIELS ──
var _tsdbCache = {};

async function getTeamLogo(teamName) {
  if(_tsdbCache[teamName]) return _tsdbCache[teamName];
  try {
    var r = await fetch('https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t='+encodeURIComponent(teamName));
    var d = await r.json();
    if(d.teams && d.teams.length) {
      var logo = d.teams[0].strTeamBadge;
      _tsdbCache[teamName] = logo;
      return logo;
    }
  } catch(e) {}
  return null;
}

async function enrichTeamLogos() {
  // Mettre à jour les logos des équipes depuis TheSportsDB
  if(!state.u || !state.u.length) return;
  for(var i=0; i<Math.min(state.u.length, 5); i++) {
    var u = state.u[i];
    if(u.logoUrl && u.logoUrl.indexOf('thesportsdb') >= 0) continue; // déjà enrichi
    var logo = await getTeamLogo(u.n);
    if(logo && !u.logoUrl) {
      u.logoUrl = logo;
    }
  }
  save();
  render();
}

function getApiFootballKey(){ return localStorage.getItem('gones45_apifootball_key')||null; }

function saveGithubToken(){
  var v = ($i('github-token-input')||{}).value||'';
  if(!v){ document.getElementById('github-token-status').textContent='Token vide'; return; }
  localStorage.setItem('gones45_github_token', v.trim());
  document.getElementById('github-token-status').textContent='✓ Token enregistré';
  document.getElementById('github-token-status').style.color='#1ed760';
}

// ── GitHub Stats Sync ──
var GITHUB_OWNER = 'gones45140';
var GITHUB_REPO = 'gones45';
var GITHUB_FILE = 'données/joueurs.json';

async function githubGetStats() {
  var token = localStorage.getItem('gones45_github_token');
  if(!token) return null;
  try {
    var r = await fetch('https://api.github.com/repos/'+GITHUB_OWNER+'/'+GITHUB_REPO+'/contents/'+GITHUB_FILE, {
      headers: {'Authorization':'token '+token, 'Accept':'application/vnd.github.v3+json'}
    });
    if(r.status===404) return {data:{}, sha:null};
    var d = await r.json();
    var data = JSON.parse(atob(d.content.split('\n').join('')));
    return {data:data, sha:d.sha};
  } catch(e) { console.warn('GitHub read error:', e); return null; }
}

async function githubSaveStats(data, sha) {
  var token = localStorage.getItem('gones45_github_token');
  if(!token) return false;
  try {
    var body = {
      message: 'Update player stats',
      content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2)))),
    };
    if(sha) body.sha = sha;
    var r = await fetch('https://api.github.com/repos/'+GITHUB_OWNER+'/'+GITHUB_REPO+'/contents/'+GITHUB_FILE, {
      method:'PUT',
      headers:{'Authorization':'token '+token,'Content-Type':'application/json','Accept':'application/vnd.github.v3+json'},
      body:JSON.stringify(body)
    });
    return r.ok;
  } catch(e) { console.warn('GitHub write error:', e); return false; }
}

async function syncStatsFromGithub() {
  var result = await githubGetStats();
  if(!result) return;
  var data = result.data;
  // Merge GitHub stats into localStorage
  Object.keys(data).forEach(function(key){
    if(key.startsWith('manual_stats_')) {
      localStorage.setItem(key, JSON.stringify(data[key]));
    }
  });
  localStorage.setItem('github_stats_sha', result.sha||'');
  console.log('Stats synced from GitHub:', Object.keys(data).length, 'entries');
}

// Lecture PUBLIQUE (pour les amis, sans token) via GitHub Pages
async function loadPublicStats() {
  try {
    // Chemin relatif encodé (gère l'accent de "données" sur mobile)
    var url = encodeURI('données/joueurs.json') + '?t=' + Date.now();
    var r = await fetch(url);
    if(!r.ok) {
      // Fallback URL absolue encodée
      r = await fetch(encodeURI('https://gones45140.github.io/gones45/données/joueurs.json') + '?t=' + Date.now());
    }
    if(!r.ok) { console.warn('Lecture publique: HTTP', r.status); return; }
    var data = await r.json();
    if(!data || typeof data !== 'object') return;
    var count = 0;
    Object.keys(data).forEach(function(key){
      if(key.startsWith('manual_stats_') || key.startsWith('squad_lastJ_') || key.startsWith('squad_sofa_')) {
        var val = data[key];
        // Rafraîchir le timestamp du cache squad pour éviter l'expiration côté ami
        if(key.startsWith('squad_sofa_') && val && typeof val === 'object' && val.ts) {
          val.ts = Date.now();
        }
        localStorage.setItem(key, typeof val==='string'?val:JSON.stringify(val));
        count++;
      }
    });
    if(count>0) console.log('Stats publiques chargees:', count);
  } catch(e) { console.warn('Lecture publique echouee:', e); }
}

// PUBLIER : rassemble TOUTES les equipes/journees et pousse vers GitHub
async function publishStats() {
  var token = localStorage.getItem('gones45_github_token');
  var statusEl = document.getElementById('publish-stats-status');
  if(!token) {
    if(statusEl){ statusEl.textContent = 'Enregistre ton token GitHub dabord'; statusEl.style.color='#ef4444'; }
    return;
  }
  if(statusEl){ statusEl.textContent = 'Publication en cours...'; statusEl.style.color='var(--t3)'; }

  var payload = {};
  Object.keys(localStorage).forEach(function(k){
    if(k.startsWith('manual_stats_') || k.startsWith('squad_lastJ_') || k.startsWith('squad_sofa_')) {
      try { payload[k] = JSON.parse(localStorage.getItem(k)); }
      catch(e){ payload[k] = localStorage.getItem(k); }
    }
  });
  payload._meta = { updated: new Date().toISOString(), count: Object.keys(payload).length };

  try {
    var getR = await fetch('https://api.github.com/repos/'+GITHUB_OWNER+'/'+GITHUB_REPO+'/contents/'+GITHUB_FILE, {
      headers: {'Authorization':'token '+token, 'Accept':'application/vnd.github.v3+json'}
    });
    var sha = null;
    if(getR.ok) { var gd = await getR.json(); sha = gd.sha; }

    var ok = await githubSaveStats(payload, sha);
    if(ok && statusEl) {
      statusEl.textContent = 'Publie ! ('+ (Object.keys(payload).length-1) +' joueurs) - tes amis verront la MAJ dans ~1 min';
      statusEl.style.color = '#1ed760';
    } else if(statusEl) {
      statusEl.textContent = 'Echec de publication (verifie le token)';
      statusEl.style.color = '#ef4444';
    }
  } catch(e) {
    if(statusEl){ statusEl.textContent = 'Erreur : '+e.message; statusEl.style.color='#ef4444'; }
  }
}

async function saveStatToGithub(key, value) {
  var result = await githubGetStats();
  if(!result) return;
  var data = result.data || {};
  data[key] = value;
  // Also save all local manual_stats
  Object.keys(localStorage).forEach(function(k){
    if(k.startsWith('manual_stats_')){
      try { data[k] = JSON.parse(localStorage.getItem(k)); } catch(e){}
    }
  });
  await githubSaveStats(data, result.sha);
}

function saveRapidApiKey(){
  var v = ($i('rapidapi-key-input')||{}).value||'';
  if(!v){ document.getElementById('rapidapi-key-status').textContent='Clé vide'; return; }
  localStorage.setItem('gones45_rapidapi_key', v.trim());
  document.getElementById('rapidapi-key-status').textContent='✓ Clé enregistrée';
  document.getElementById('rapidapi-key-status').style.color='#1ed760';
}

function saveApiFootballKey(){
  var v = ($i('apifootball-key-input')||{}).value||'';
  if(!v){ document.getElementById('apifootball-key-status').textContent='Clé vide'; return; }
  localStorage.setItem('gones45_apifootball_key', v.trim());
  document.getElementById('apifootball-key-status').textContent='✓ Clé sauvegardée';
  document.getElementById('apifootball-key-status').style.color='#1ed760';
}

async function testApiFootballKey(){
  var key = getApiFootballKey();
  var el = document.getElementById('apifootball-key-status');
  if(!key){ el.textContent='Aucune clé'; return; }
  el.textContent='Test...'; el.style.color='#f0b020';
  try {
    var r = await fetch('https://fd-proxy.touraine-antoine.workers.dev?key='+encodeURIComponent(key)+'&path=/v4/competitions&host=api-football', {});
    if(r.ok){ el.textContent='✓ Clé valide !'; el.style.color='#1ed760'; }
    else { el.textContent='✗ Invalide'; el.style.color='#ff4545'; }
  } catch(e) {
    el.textContent='✓ Clé enregistrée'; el.style.color='#1ed760';
  }
}

async function apiFootballFetch(endpoint) {
  var key = getApiFootballKey();
  if(!key) return null;
  try {
    var r = await fetch('https://api-football-v1.p.rapidapi.com'+endpoint, {
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    });
    if(!r.ok) return null;
    return await r.json();
  } catch(e) { return null; }
}

function getFdorgKey(){ return localStorage.getItem('gones45_fdorg_key')||null; }
var FD_PROXY = 'https://fd-proxy.touraine-antoine.workers.dev';

async function fdFetch(path) {
  var key = getFdorgKey();
  if(!key) return null;
  try {
    var r = await fetch(FD_PROXY+'?key='+encodeURIComponent(key)+'&path='+encodeURIComponent(path));
    if(!r.ok) return null;
    return await r.json();
  } catch(e) { return null; }
}

function saveFdorgKey(){
  var v = ($i('fdorg-key-input')||{}).value||'';
  if(!v){ showFdorgStatus('Clé vide','#ff4545'); return; }
  localStorage.setItem('gones45_fdorg_key', v.trim());
  showFdorgStatus('✓ Clé sauvegardée','#1ed760');
}

function showFdorgStatus(msg, color){
  var el=$i('fdorg-key-status');
  if(el){ el.textContent=msg; el.style.color=color; }
}

function testFdorgKey(){
  var key = getFdorgKey();
  if(!key){ showFdorgStatus('Aucune clé','#ff4545'); return; }
  showFdorgStatus('✓ Clé enregistrée','#1ed760');
}

// Récupérer les stats d'une équipe via Groq qui appelle football-data
async function getTeamStatsViaGroq(teamName, cpTypes) {
  var groqKey = getGeminiKey();
  var fdKey = getFdorgKey();
  if(!groqKey) return null;

  var typesStr = cpTypes && cpTypes.length ? cpTypes.join(', ') : 'Victoire, Over 2.5, BTS Oui';

  var prompt = 'Recherche les statistiques recentes de '+teamName+' en football : '
    + '10 derniers matchs (resultats), % Over 2.5 buts, % Over 3.5 buts, % BTS Oui, % victoires domicile, % victoires exterieur. '
    + 'Donne les stats chiffrees precises puis une analyse de 3 phrases en francais sur ces types de paris : '+typesStr+'.';

  // Map noms équipes vers IDs football-data (plan gratuit)
  

  try {
    // Trouver ID equipe
    var teamId = null;
    var nameToTry = teamName;
    // Essai direct
    for(var k in TEAM_IDS) {
      if(k.toLowerCase()===teamName.toLowerCase()) { teamId=TEAM_IDS[k]; break; }
    }
    // Essai partiel si pas trouvé
    if(!teamId) {
      for(var k in TEAM_IDS) {
        if(teamName.toLowerCase().indexOf(k.toLowerCase())>=0 || k.toLowerCase().indexOf(teamName.toLowerCase())>=0) {
          teamId=TEAM_IDS[k]; break;
        }
      }
    }

    var matchStats = '';
    if(teamId) {
      // Récupérer les 10 derniers matchs via proxy
      var matches = await fdFetch('/v4/teams/'+teamId+'/matches?status=FINISHED&limit=10');
      if(matches && matches.matches && matches.matches.length) {
        var ms = matches.matches;
        var over25=0, over35=0, bts=0, domW=0, domTotal=0, extW=0, extTotal=0;
        ms.forEach(function(m){
          var hg=(m.score&&m.score.regularTime?m.score.regularTime.home:m.score&&m.score.fullTime?m.score.fullTime.home:0)||0;
          var ag=(m.score&&m.score.regularTime?m.score.regularTime.away:m.score&&m.score.fullTime?m.score.fullTime.away:0)||0;
          var total=hg+ag;
          if(total>2.5) over25++;
          if(total>3.5) over35++;
          if(hg>0&&ag>0) bts++;
          var isDom = m.homeTeam&&m.homeTeam.id===teamId;
          var won = isDom?(hg>ag):(ag>hg);
          if(isDom){domTotal++;if(won)domW++;}
          else{extTotal++;if(won)extW++;}
        });
        var n=ms.length;
        matchStats = teamName+' sur '+n+' derniers matchs : '
          +'Over 2.5='+over25+'/'+n+' ('+Math.round(over25/n*100)+'%), '
          +'Over 3.5='+over35+'/'+n+' ('+Math.round(over35/n*100)+'%), '
          +'BTS='+bts+'/'+n+' ('+Math.round(bts/n*100)+'%), '
          +'Dom='+domW+'/'+(domTotal||1)+' victoires, '
          +'Ext='+extW+'/'+(extTotal||1)+' victoires.';
      }
    }

    // 3. Fallback Tavily si pas de données
    if(!matchStats) {
      var tavilyKey = getTavilyKey();
      if(tavilyKey) {
        var webData = await searchTavily(teamName+' statistiques Over 2.5 forme 2025 2026');
        if(webData) matchStats = webData.substring(0,800);
      }
    }

    if(!matchStats || !groqKey) return null;

    // 4. Groq analyse
    var analysisPrompt = 'Tu es expert paris sportifs. Stats reelles de '+teamName+' : '+matchStats+'. Analyse en 3 phrases pour ces types de paris : '+typesStr+'. En francais, sois direct et precis avec les chiffres.';
    var r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+groqKey},
      body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:[{role:'user',content:analysisPrompt}],max_tokens:400,temperature:0.2})
    });
    var d = await r.json();
    if(d.error) return null;
    return d.choices[0].message.content.trim();
  } catch(e) { return null; }
}

// ── STATS 2 SAISONS PAR ÉQUIPE ──
var _saisonsCache = {};

// ── AIDE CLÉS API ──
var KEY_HELP = {
  groq: {
    title: '⚡ Comment obtenir ta clé Groq',
    color: '#7aaaff',
    steps: [
      {n:'1', t:'<a href="https://console.groq.com" target="_blank" style="color:#7aaaff;text-decoration:underline;">console.groq.com</a>', d:'Clique sur le lien pour ouvrir le site'},
      {n:'2', t:'Créer un compte', d:'Clique sur "Sign Up" — gratuit, juste un email'},
      {n:'3', t:'Aller dans API Keys', d:'Dans le menu gauche, clique sur "API Keys"'},
      {n:'4', t:'Créer une clé', d:'Clique "Create API Key", donne un nom (ex: gones45)'},
      {n:'5', t:'Copier la clé', d:'Copie la clé qui commence par gsk_... et colle-la ici'},
    ],
    note: 'Gratuit · 6000 requêtes/minute · Aucune carte bancaire requise',
    url: 'https://console.groq.com'
  },
  tavily: {
    title: '🔍 Comment obtenir ta clé Tavily',
    color: '#f0b020',
    steps: [
      {n:'1', t:'<a href="https://app.tavily.com" target="_blank" style="color:#f0b020;text-decoration:underline;">app.tavily.com</a>', d:'Clique sur le lien pour ouvrir le site'},
      {n:'2', t:'Créer un compte', d:'Clique "Sign Up" — gratuit, juste un email'},
      {n:'3', t:'Copier ta clé', d:'Elle est affichée directement sur le tableau de bord — commence par tvly-...'},
    ],
    note: 'Gratuit · 1000 recherches/mois · Pour la recherche web en temps réel',
    url: 'https://app.tavily.com'
  },
  dropbox: {
    title: '☁️ Comment obtenir ton token Dropbox',
    color: '#0061ff',
    steps: [
      {n:'1', t:'<a href="https://www.dropbox.com/developers/apps" target="_blank" style="color:#0061ff;text-decoration:underline;">dropbox.com/developers</a>', d:'Clique sur le lien — connecte-toi avec ton compte Dropbox'},
      {n:'2', t:'Cliquer sur "App Console"', d:'En haut à droite'},
      {n:'3', t:'Sélectionner ton app GONES45', d:'Ou créer une nouvelle app si besoin'},
      {n:'4', t:'Aller dans l\'onglet Settings', d:'En bas de la page de ton app'},
      {n:'5', t:'Cliquer "Generate access token"', d:'Dans la section OAuth 2 — copie le token sl.u.XXXX'},
      {n:'6', t:'Coller le token ici', d:'Il expire après 4h — à renouveler si besoin'},
    ],
    note: '⚠️ Token valable 4h · Gratuit · Sauvegarde automatique de toutes tes données',
    url: 'https://www.dropbox.com/developers/apps'
  },
  fdorg: {
    title: '⚽ Comment obtenir ta clé Football-Data',
    color: '#1ed760',
    steps: [
      {n:'1', t:'<a href="https://www.football-data.org" target="_blank" style="color:#1ed760;text-decoration:underline;">football-data.org</a>', d:'Clique sur le lien pour ouvrir le site'},
      {n:'2', t:'Cliquer sur "Register"', d:'En haut à droite du site'},
      {n:'3', t:'Remplir le formulaire', d:'Prénom, email — pour "arme" choisis "Je veux rester désarmé"'},
      {n:'4', t:'Vérifier ton email', d:'Tu recevras ta clé API par email'},
      {n:'5', t:'Coller la clé ici', d:'Elle ressemble à une suite de lettres et chiffres'},
    ],
    note: '⚠️ Gratuit · 10 requêtes/minute · Bundesliga, Ligue 1, Liga, Serie A, Premier League, Champions League uniquement',
    url: 'https://www.football-data.org'
  }
};

function showKeyHelp(key) {
  var modal = document.getElementById('key-help-modal');
  var title = document.getElementById('key-help-title');
  var body = document.getElementById('key-help-body');
  if(!modal||!title||!body) return;
  var h = KEY_HELP[key];
  if(!h) return;
  title.textContent = h.title;
  var html = '';
  h.steps.forEach(function(s){
    html += '<div style="display:flex;gap:12px;margin-bottom:14px;">';
    html += '<div style="width:26px;height:26px;border-radius:50%;background:'+h.color+';display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#000;flex-shrink:0;">'+s.n+'</div>';
    html += '<div><div style="font-size:13px;font-weight:700;color:var(--t1);">'+s.t+'</div><div style="font-size:11px;color:var(--t3);margin-top:2px;">'+s.d+'</div></div>';
    html += '</div>';
  });
  html += '<div style="background:rgba(255,255,255,.05);border-radius:8px;padding:10px 12px;font-size:11px;color:var(--t3);margin-top:4px;">'+h.note+'</div>';
  html += '<a href="'+h.url+'" target="_blank" style="display:block;text-align:center;margin-top:14px;padding:12px;background:'+h.color+';color:#000;border-radius:var(--r8);font-size:13px;font-weight:800;text-decoration:none;">→ Aller sur le site</a>';
  body.innerHTML = html;
  modal.style.display = 'flex';
  modal.style.alignItems = 'flex-end';
  modal.style.justifyContent = 'center';
}

function closeKeyHelp() {
  var modal = document.getElementById('key-help-modal');
  if(modal) modal.style.display = 'none';
}

// ── RÉSUMÉS VIDÉO PAR SPORT ──
var SPORT_CONFIG = {
  nhl: {
    name: 'NHL', icon: '🏒',
    sources: [
      {label: '🎬 NHL.com — Highlights officiels', url: 'https://www.nhl.com/video', color: '#000'},
      {label: '📺 YouTube NHL', url: 'https://www.youtube.com/@NHL', color: '#ff0000'},
    ],
    searchUrl: function(nom){ return 'https://www.nhl.com/video/search#q='+encodeURIComponent(nom); },
    tavilyQuery: function(nom){ return nom+' NHL highlights recap video today 2026'; }
  },
  mlb: {
    name: 'MLB', icon: '⚾',
    sources: [
      {label: '🎬 MLB.com — Highlights officiels', url: 'https://www.mlb.com/video', color: '#002d72'},
      {label: '📺 YouTube MLB', url: 'https://www.youtube.com/@MLB', color: '#ff0000'},
    ],
    searchUrl: function(nom){ return 'https://www.mlb.com/video/search#q='+encodeURIComponent(nom); },
    tavilyQuery: function(nom){ return nom+' MLB highlights recap video today 2026'; }
  },
  nba: {
    name: 'NBA', icon: '🏀',
    sources: [
      {label: '🎬 NBA.com — Highlights officiels', url: 'https://www.nba.com/watch', color: '#c8102e'},
      {label: '📺 YouTube NBA', url: 'https://www.youtube.com/@NBA', color: '#ff0000'},
      {label: '🎬 @TheGametimeHighlights', url: 'https://twitter.com/TheGametimeHighlights', color: '#1da1f2'},
    ],
    searchUrl: function(nom){ return 'https://www.nba.com/watch?q='+encodeURIComponent(nom); },
    tavilyQuery: function(nom){ return nom+' NBA highlights recap video today 2026'; }
  },
  f1: {
    name: 'F1', icon: '🏎️',
    sources: [
      {label: '🎬 Formula1.com — Highlights', url: 'https://www.formula1.com/en/video.html', color: '#e8002d'},
      {label: '📺 YouTube F1', url: 'https://www.youtube.com/@Formula1', color: '#ff0000'},
    ],
    searchUrl: function(nom){ return 'https://www.formula1.com/en/video.html'; },
    tavilyQuery: function(nom){ return 'Formula 1 GP highlights recap video 2026 '+nom; }
  }
};

async function loadVideoHighlights(el, nom, col, sport) {
  var cfg = SPORT_CONFIG[sport];
  if(!cfg) return;

  var tavilyKey = getTavilyKey();
  var groqKey = getGeminiKey();

  // Affichage initial avec sources directes
  var html = '<div style="text-align:center;padding:20px 16px;">';
  html += '<div style="font-size:36px;margin-bottom:8px;">'+cfg.icon+'</div>';
  html += '<div style="font-size:15px;font-weight:800;color:'+col+';margin-bottom:4px;">'+nom+'</div>';
  html += '<div style="font-size:11px;color:var(--t3);margin-bottom:20px;">Résumés & Highlights '+cfg.name+'</div>';

  // Boutons sources directes
  cfg.sources.forEach(function(s){
    html += '<a href="'+s.url+'" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;padding:12px;border-radius:var(--r8);background:'+s.color+';color:#fff;font-size:12px;font-weight:700;text-decoration:none;">'+s.label+'</a>';
  });

  html += '</div>';

  // Bouton recherche IA
  if(tavilyKey && groqKey) {
    html += '<div class="fc" style="margin-top:4px;text-align:center;">';
    html += '<div style="font-size:11px;color:var(--t3);margin-bottom:10px;">Ou trouve le dernier résumé automatiquement :</div>';
    html += '<button id="btn-find-highlights" style="padding:10px 20px;border-radius:var(--r8);border:1px solid rgba(77,132,255,.4);background:rgba(77,132,255,.1);color:#7aaaff;font-size:12px;font-weight:700;cursor:pointer;">🔍 Trouver le dernier résumé</button>';
    html += '<div id="highlights-result" style="margin-top:12px;"></div>';
    html += '</div>';
  }

  el.innerHTML = html;

  if(tavilyKey && groqKey) {
    document.getElementById('btn-find-highlights').onclick = async function(){
      var btn = this;
      var res = document.getElementById('highlights-result');
      btn.textContent = '⏳ Recherche...';
      btn.disabled = true;

      // Tavily cherche le dernier résumé
      var webData = await searchTavily(cfg.tavilyQuery(nom));
      if(!webData) {
        res.innerHTML = '<div style="color:#ff4545;font-size:11px;">Aucun résultat trouvé.</div>';
        btn.textContent = '🔍 Réessayer'; btn.disabled = false; return;
      }

      // Groq extrait le lien
      var prompt = 'Voici des résultats de recherche sur les highlights de '+nom+' en '+cfg.name+' : '+webData.substring(0,800)+'. Extrais uniquement le lien vidéo le plus pertinent (YouTube, site officiel) et donne une description en 1 phrase. Format: "LIEN: url\nDESC: description". En français.';
      try {
        var r = await fetch('https://api.groq.com/openai/v1/chat/completions',{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+groqKey},
          body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:[{role:'user',content:prompt}],max_tokens:150,temperature:0.2})
        });
        var d = await r.json();
        var reply = d.choices[0].message.content.trim();
        var linkMatch = reply.match(/LIEN:\s*(https?:\/\/[^\s\n]+)/);
        var descMatch = reply.match(/DESC:\s*(.+)/);
        if(linkMatch) {
          var link = linkMatch[1];
          var desc = descMatch ? descMatch[1] : 'Voir le résumé';
          // YouTube → embed direct
          var ytMatch = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          if(ytMatch) {
            var videoId = ytMatch[1];
            res.innerHTML = '<div style="border-radius:10px;overflow:hidden;margin-bottom:8px;">'
              +'<div style="font-size:11px;color:var(--t3);margin-bottom:8px;text-align:center;">'+desc+'</div>'
              +'<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;">'
              +'<iframe src="https://www.youtube.com/embed/'+videoId+'?autoplay=0" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:8px;" allowfullscreen></iframe>'
              +'</div>'
              +'<a href="'+link+'" target="_blank" style="display:block;margin-top:8px;padding:8px;background:rgba(255,0,0,.15);color:#ff4545;border-radius:6px;font-size:11px;font-weight:700;text-decoration:none;text-align:center;">📺 Ouvrir sur YouTube</a>'
              +'</div>';
          } else {
            // Pas d'ID YouTube — bouton direct vers le lien
            var isYT = link.indexOf('youtube.com') >= 0 || link.indexOf('youtu.be') >= 0;
            var btnColor = isYT ? '#ff0000' : 'var(--a)';
            var btnLabel = isYT ? '📺 Voir sur YouTube' : '▶ Voir le résumé';
            res.innerHTML = '<div style="background:rgba(77,132,255,.08);border:1px solid rgba(77,132,255,.2);border-radius:8px;padding:12px;">'
              +'<div style="font-size:11px;color:var(--t3);margin-bottom:8px;">'+desc+'</div>'
              +'<a href="'+link+'" target="_blank" style="display:block;padding:10px;background:'+btnColor+';color:#fff;border-radius:6px;font-size:12px;font-weight:700;text-decoration:none;text-align:center;">'+btnLabel+'</a>'
              +'</div>';
          }
        } else {
          res.innerHTML = '<div style="font-size:11px;color:var(--t3);">'+reply+'</div>';
        }
      } catch(e) {
        res.innerHTML = '<div style="color:#ff4545;font-size:11px;">Erreur IA.</div>';
      }
      btn.textContent = '🔍 Trouver le dernier résumé'; btn.disabled = false;
    };
  }
}


// ── NHL / MLB IDs ──
var TENNIS_PLAYERS = {
  'Novak Djokovic': {id:'n-djokovic', atp:true},
  'Carlos Alcaraz': {id:'c-alcaraz', atp:true},
  'Jannik Sinner': {id:'j-sinner', atp:true},
  'Daniil Medvedev': {id:'d-medvedev', atp:true},
  'Alexander Zverev': {id:'a-zverev', atp:true},
  'Holger Rune': {id:'h-rune', atp:true},
  'Andrey Rublev': {id:'a-rublev', atp:true},
  'Taylor Fritz': {id:'t-fritz', atp:true},
  'Stefanos Tsitsipas': {id:'s-tsitsipas', atp:true},
  'Casper Ruud': {id:'c-ruud', atp:true},
  'Rafael Nadal': {id:'r-nadal', atp:true},
  'Roger Federer': {id:'r-federer', atp:true},
  'Benoit Paire': {id:'b-paire', atp:true},
  'Iga Swiatek': {id:'i-swiatek', atp:false},
  'Aryna Sabalenka': {id:'a-sabalenka', atp:false},
  'Coco Gauff': {id:'c-gauff', atp:false},
};

var NBA_TEAMS = {
  'Atlanta Hawks':         {id:'1610612737', abbr:'ATL', bdlId:1,   espnId:1,  asId:1,  alias:['Hawks','Atlanta']},
  'Boston Celtics':        {id:'1610612738', abbr:'BOS', bdlId:2,   espnId:2,  asId:2,  alias:['Celtics','Boston']},
  'Brooklyn Nets':         {id:'1610612751', abbr:'BKN', bdlId:3,   espnId:17, asId:4,  alias:['Nets','Brooklyn']},
  'Charlotte Hornets':     {id:'1610612766', abbr:'CHA', bdlId:4,   espnId:30, asId:5,  alias:['Hornets','Charlotte']},
  'Chicago Bulls':         {id:'1610612741', abbr:'CHI', bdlId:5,   espnId:4,  asId:6,  alias:['Bulls','Chicago']},
  'Cleveland Cavaliers':   {id:'1610612739', abbr:'CLE', bdlId:6,   espnId:5,  asId:7,  alias:['Cavaliers','Cavs','Cleveland']},
  'Dallas Mavericks':      {id:'1610612742', abbr:'DAL', bdlId:7,   espnId:6,  asId:8,  alias:['Mavericks','Mavs','Dallas']},
  'Denver Nuggets':        {id:'1610612743', abbr:'DEN', bdlId:8,   espnId:7,  asId:9,  alias:['Nuggets','Denver']},
  'Detroit Pistons':       {id:'1610612765', abbr:'DET', bdlId:9,   espnId:8,  asId:10, alias:['Pistons','Detroit']},
  'Golden State Warriors': {id:'1610612744', abbr:'GSW', bdlId:10,  espnId:9,  asId:11, alias:['Warriors','Golden State','GSW']},
  'Houston Rockets':       {id:'1610612745', abbr:'HOU', bdlId:11,  espnId:10, asId:14, alias:['Rockets','Houston']},
  'Indiana Pacers':        {id:'1610612754', abbr:'IND', bdlId:12,  espnId:11, asId:15, alias:['Pacers','Indiana']},
  'Los Angeles Clippers':  {id:'1610612746', abbr:'LAC', bdlId:13,  espnId:12, asId:16, alias:['Clippers','LA Clippers']},
  'Los Angeles Lakers':    {id:'1610612747', abbr:'LAL', bdlId:14,  espnId:13, asId:17, alias:['Lakers','LA Lakers']},
  'Memphis Grizzlies':     {id:'1610612763', abbr:'MEM', bdlId:15,  espnId:29, asId:19, alias:['Grizzlies','Memphis']},
  'Miami Heat':            {id:'1610612748', abbr:'MIA', bdlId:16,  espnId:14, asId:20, alias:['Heat','Miami']},
  'Milwaukee Bucks':       {id:'1610612749', abbr:'MIL', bdlId:17,  espnId:15, asId:21, alias:['Bucks','Milwaukee']},
  'Minnesota Timberwolves':{id:'1610612750', abbr:'MIN', bdlId:18,  espnId:16, asId:22, alias:['Timberwolves','Wolves','Minnesota']},
  'New Orleans Pelicans':  {id:'1610612740', abbr:'NOP', bdlId:19,  espnId:3,  asId:23, alias:['Pelicans','New Orleans']},
  'New York Knicks':       {id:'1610612752', abbr:'NYK', bdlId:20,  espnId:18, asId:24, alias:['Knicks','New York']},
  'Oklahoma City Thunder': {id:'1610612760', abbr:'OKC', bdlId:21,  espnId:25, asId:25, alias:['Thunder','Oklahoma City','OKC']},
  'Orlando Magic':         {id:'1610612753', abbr:'ORL', bdlId:22,  espnId:22, asId:26, alias:['Magic','Orlando']},
  'Philadelphia 76ers':    {id:'1610612755', abbr:'PHI', bdlId:23,  espnId:20, asId:27, alias:['76ers','Sixers','Philadelphia']},
  'Phoenix Suns':          {id:'1610612756', abbr:'PHX', bdlId:24,  espnId:24, asId:28, alias:['Suns','Phoenix']},
  'Portland Trail Blazers':{id:'1610612757', abbr:'POR', bdlId:25,  espnId:21, asId:29, alias:['Trail Blazers','Blazers','Portland']},
  'Sacramento Kings':      {id:'1610612758', abbr:'SAC', bdlId:26,  espnId:23, asId:30, alias:['Kings','Sacramento']},
  'San Antonio Spurs':     {id:'1610612759', abbr:'SAS', bdlId:27,  espnId:24, asId:31, alias:['Spurs','San Antonio']},
  'Toronto Raptors':       {id:'1610612761', abbr:'TOR', bdlId:28,  espnId:28, asId:38, alias:['Raptors','Toronto']},
  'Utah Jazz':             {id:'1610612762', abbr:'UTA', bdlId:29,  espnId:26, asId:40, alias:['Jazz','Utah']},
  'Washington Wizards':    {id:'1610612764', abbr:'WAS', bdlId:30,  espnId:27, asId:41, alias:['Wizards','Washington']},
};

// Résoudre un nom court/alias vers la clé complète NBA_TEAMS
function resolveNbaTeam(nom) {
  if(NBA_TEAMS[nom]) return nom;
  var lower = (nom||'').toLowerCase().trim();
  for(var key in NBA_TEAMS) {
    if(key.toLowerCase() === lower) return key;
    var al = NBA_TEAMS[key].alias || [];
    for(var i=0;i<al.length;i++){ if(al[i].toLowerCase() === lower) return key; }
  }
  return null;
}

var NFL_TEAMS = {
  'Kansas City Chiefs': {id:'KC'},
  'San Francisco 49ers': {id:'SF'},
  'Philadelphia Eagles': {id:'PHI'},
  'Dallas Cowboys': {id:'DAL'},
  'Buffalo Bills': {id:'BUF'},
  'Baltimore Ravens': {id:'BAL'},
  'Cincinnati Bengals': {id:'CIN'},
  'Miami Dolphins': {id:'MIA'},
  'Green Bay Packers': {id:'GB'},
  'New England Patriots': {id:'NE'},
};

var NHL_TEAMS = {
  'Colorado Avalanche': {abbr:'COL', id:21, mlb:false},
  'Carolina Hurricanes': {abbr:'CAR', id:12, mlb:false},
  'Vegas Golden Knights': {abbr:'VGK', id:54, mlb:false},
  'Tampa Bay Lightning': {abbr:'TBL', id:14, mlb:false},
  'Boston Bruins': {abbr:'BOS', id:6, mlb:false},
  'Toronto Maple Leafs': {abbr:'TOR', id:10, mlb:false},
  'New York Rangers': {abbr:'NYR', id:3, mlb:false},
  'Edmonton Oilers': {abbr:'EDM', id:22, mlb:false},
};

var MLB_TEAMS = {
  'LA Dodgers': {id:119},
  'Los Angeles Dodgers': {id:119},
  'New York Yankees': {id:147},
  'Atlanta Braves': {id:144},
  'Houston Astros': {id:117},
  'Boston Red Sox': {id:111},
  'Chicago Cubs': {id:112},
  'San Francisco Giants': {id:137},
  'New York Mets': {id:121},
  'Philadelphia Phillies': {id:143},
};


/* ══ FORME US HELPER ══ */
function renderFormeUS(games, teamAbbr, sport, isNHL, isMLB) {
  if(!games||!games.length) return '';
  var html = '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;">';
  games.slice(0,10).forEach(function(g){
    var isDom, ts, os, won;
    if(isNHL) {
      isDom = g.homeTeam&&g.homeTeam.abbrev===teamAbbr;
      ts = isDom?(g.homeTeam.score||0):(g.awayTeam.score||0);
      os = isDom?(g.awayTeam.score||0):(g.homeTeam.score||0);
    } else if(isMLB) {
      isDom = g.teams&&g.teams.home&&g.teams.home.team&&g.teams.home.team.name===teamAbbr;
      ts = isDom?(g.teams.home.score||0):(g.teams.away.score||0);
      os = isDom?(g.teams.away.score||0):(g.teams.home.score||0);
    } else {
      // NBA bdl
      isDom = g.home_team&&g.home_team.abbreviation===teamAbbr;
      ts = isDom?(g.home_team_score||0):(g.visitor_team_score||0);
      os = isDom?(g.visitor_team_score||0):(g.home_team_score||0);
    }
    won = ts>os;
    var col = won?'#1ed760':'#ff4545';
    html += '<div style="width:20px;height:20px;border-radius:4px;background:'+col+';display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;color:#fff;">'+(won?'V':'D')+'</div>';
  });
  html += '</div>';
  return html;
}


function compareUSTeams(myGames, oppGames, myAbbr, oppAbbr, myNom, oppNom, myCol, sport) {
  if(!myGames.length || !oppGames.length) return '';

  function calcUSStats(games, abbr, isNHL, isMLB) {
    var n=games.length, wins=0, over=0, bts2=0, goals=0, conceded=0;
    var domW=0, domN=0, extW=0, extN=0, streak=0, streakType='';
    games.forEach(function(g,i){
      var isDom, ts, os;
      if(isNHL){
        isDom=g.homeTeam&&g.homeTeam.abbrev===abbr;
        ts=isDom?(g.homeTeam.score||0):(g.awayTeam.score||0);
        os=isDom?(g.awayTeam.score||0):(g.homeTeam.score||0);
      } else if(isMLB){
        isDom=g.teams&&g.teams.home&&g.teams.home.team&&g.teams.home.team.name===abbr;
        ts=isDom?(g.teams.home.score||0):(g.teams.away.score||0);
        os=isDom?(g.teams.away.score||0):(g.teams.home.score||0);
      } else {
        isDom=g.home_team&&g.home_team.id===abbr;
        ts=isDom?g.home_team_score:g.visitor_team_score;
        os=isDom?g.visitor_team_score:g.home_team_score;
      }
      var tot=ts+os, won=ts>os;
      if(won)wins++;
      goals+=ts; conceded+=os;
      var overLine = isMLB?8:(isNHL?5.5:220);
      if(tot>overLine)over++;
      if(ts>0&&os>0)bts2++;
      if(isDom){domN++;if(won)domW++;}else{extN++;if(won)extW++;}
      // Série
      var res=won?'V':'D';
      if(i===0){streakType=res;streak=1;}
      else if(res===streakType)streak++;
    });
    return {n:n, pct:n?Math.round(wins/n*100):0,
      gpg:n?(goals/n).toFixed(1):0, cpg:n?(conceded/n).toFixed(1):0,
      over:n?Math.round(over/n*100):0, bts:n?Math.round(bts2/n*100):0,
      domPct:domN?Math.round(domW/domN*100):0, domN:domN,
      extPct:extN?Math.round(extW/extN*100):0, extN:extN,
      streak:streak, streakType:streakType};
  }

  var isNHL = sport==='🏒', isMLB = sport==='⚾';
  var myS = calcUSStats(myGames, myAbbr, isNHL, isMLB);
  var oppS = calcUSStats(oppGames, oppAbbr, isNHL, isMLB);
  var overLabel = isMLB?'Over 8':isNHL?'Over 5.5':'Over 220';
  var unit = isMLB?' runs':isNHL?' buts':' pts';

  var html = '<div style="margin-top:10px;">';

  // Forme adversaire
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:6px;">📊 Forme '+oppNom+' ('+oppS.n+' matchs)</div>';
  html += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;">';
  oppGames.slice(0,8).forEach(function(g){
    var isDom, ts, os;
    if(isNHL){isDom=g.homeTeam&&g.homeTeam.abbrev===oppAbbr;ts=isDom?(g.homeTeam.score||0):(g.awayTeam.score||0);os=isDom?(g.awayTeam.score||0):(g.homeTeam.score||0);}
    else if(isMLB){isDom=g.teams&&g.teams.home&&g.teams.home.team&&g.teams.home.team.name===oppAbbr;ts=isDom?(g.teams.home.score||0):(g.teams.away.score||0);os=isDom?(g.teams.away.score||0):(g.teams.home.score||0);}
    else{isDom=g.home_team&&g.home_team.id===oppAbbr;ts=isDom?g.home_team_score:g.visitor_team_score;os=isDom?g.visitor_team_score:g.home_team_score;}
    var rc=ts>os?'#1ed760':'#ff4545';
    html += '<div style="width:22px;height:22px;border-radius:5px;background:'+rc+';display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#fff;">'+(ts>os?'V':'D')+'</div>';
  });
  html += '</div>';

  // Comparaison
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:6px;">⚡ Comparaison ('+myS.n+' matchs)</div>';
  html += '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:4px;margin-bottom:8px;">';
  html += '<div style="font-size:10px;font-weight:700;color:'+myCol+';text-align:center;padding:4px;">'+myNom+'</div>';
  html += '<div></div>';
  html += '<div style="font-size:10px;font-weight:700;color:#a78bfa;text-align:center;padding:4px;">'+oppNom+'</div>';

  var ROWS = [
    {l:'Victoires %', a:myS.pct+'%', b:oppS.pct+'%', av:myS.pct, bv:oppS.pct},
    {l:'Dom %', a:myS.domPct+'% ('+myS.domN+')', b:oppS.domPct+'% ('+oppS.domN+')', av:myS.domPct, bv:oppS.domPct},
    {l:'Ext %', a:myS.extPct+'% ('+myS.extN+')', b:oppS.extPct+'% ('+oppS.extN+')', av:myS.extPct, bv:oppS.extPct},
    {l:'Pts marqués', a:myS.gpg+unit, b:oppS.gpg+unit, av:parseFloat(myS.gpg), bv:parseFloat(oppS.gpg)},
    {l:'Pts encaissés', a:myS.cpg+unit, b:oppS.cpg+unit, av:parseFloat(oppS.cpg), bv:parseFloat(myS.cpg)},
    {l:overLabel, a:myS.over+'%', b:oppS.over+'%', av:myS.over, bv:oppS.over},
    {l:'BTS', a:myS.bts+'%', b:oppS.bts+'%', av:myS.bts, bv:oppS.bts},
  ];
  ROWS.forEach(function(r){
    var aBetter=r.av>r.bv, bBetter=r.bv>r.av;
    html += '<div style="font-size:11px;font-weight:800;color:'+(aBetter?myCol:'var(--t2)')+';text-align:center;padding:5px 4px;background:rgba(255,255,255,.03);border-radius:5px;">'+r.a+'</div>';
    html += '<div style="font-size:9px;color:var(--t3);text-align:center;padding:5px 2px;">'+r.l+'</div>';
    html += '<div style="font-size:11px;font-weight:800;color:'+(bBetter?'#a78bfa':'var(--t2)')+';text-align:center;padding:5px 4px;background:rgba(255,255,255,.03);border-radius:5px;">'+r.b+'</div>';
  });
  html += '</div>';

  // Analyse
  var butsM = (parseFloat(myS.gpg)*parseFloat(oppS.cpg)).toFixed(2);
  var butsOpp = (parseFloat(oppS.gpg)*parseFloat(myS.cpg)).toFixed(2);
  var total = (parseFloat(butsM)+parseFloat(butsOpp)).toFixed(2);
  var mySerieCol=myS.streakType==='V'?'#1ed760':'#ff4545';
  var oppSerieCol=oppS.streakType==='V'?'#1ed760':'#ff4545';

  html += '<div style="background:rgba(77,132,255,.08);border:1px solid rgba(77,132,255,.2);border-radius:8px;padding:10px;">';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4d84ff;margin-bottom:8px;">🎯 Analyse</div>';
  html += '<div style="display:flex;gap:8px;margin-bottom:8px;">';
  html += '<div style="flex:1;text-align:center;background:rgba(255,255,255,.04);border-radius:6px;padding:6px;"><div style="font-size:9px;color:var(--t3);">'+myNom+'</div><div style="font-size:12px;font-weight:800;color:'+mySerieCol+';">'+myS.streak+myS.streakType+' d\'affilée</div></div>';
  html += '<div style="flex:1;text-align:center;background:rgba(255,255,255,.04);border-radius:6px;padding:6px;"><div style="font-size:9px;color:var(--t3);">'+oppNom+'</div><div style="font-size:12px;font-weight:800;color:'+oppSerieCol+';">'+oppS.streak+oppS.streakType+' d\'affilée</div></div>';
  html += '</div>';
  html += '<div style="font-size:11px;color:var(--t1);">'+sport+' attendus : <strong style="color:'+myCol+';">'+butsM+'</strong> vs <strong style="color:#a78bfa;">'+butsOpp+'</strong> = <strong>'+total+'</strong></div>';
  html += '<div style="font-size:11px;color:var(--t1);">'+overLabel+' probable : <strong style="color:'+(Math.round((myS.over+oppS.over)/2)>55?'#1ed760':'#f0b020')+'">'+Math.round((myS.over+oppS.over)/2)+'%</strong></div>';
  html += '</div>';

  html += '</div>';
  return html;
}


/* ══ FPL API ══ */
var _fplCache = null;
var _fplCacheTime = 0;

async function fplFetch(path) {
  var r = await fetch('https://fd-proxy.touraine-antoine.workers.dev/?key=fpl&path='+encodeURIComponent(path)+'&host=fpl');
  if(!r.ok) throw new Error('FPL HTTP '+r.status);
  return await r.json();
}

async function getFplData() {
  var now = Date.now();
  var cacheDuration = 6*60*60*1000; // 6h localStorage
  // Cache mémoire 5min
  if(_fplCache && now-_fplCacheTime < 300000) return _fplCache;
  // Cache localStorage 6h
  try {
    var cached = localStorage.getItem('fpl_bootstrap_cache');
    if(cached) {
      var c = JSON.parse(cached);
      if(now - c.ts < cacheDuration) {
        _fplCache = c.data; _fplCacheTime = now;
        return _fplCache;
      }
    }
  } catch(e) {}
  _fplCache = await fplFetch('/api/bootstrap-static/');
  _fplCacheTime = now;
  try { localStorage.setItem('fpl_bootstrap_cache', JSON.stringify({data:_fplCache, ts:now})); } catch(e) {}
  return _fplCache;
}

// Mapping noms football-data → noms FPL
var FPL_TEAM_MAP = {
  'Arsenal':'Arsenal','Chelsea':'Chelsea','Liverpool':'Liverpool',
  'Manchester City':'Man City','Manchester United':'Man Utd',
  'Tottenham Hotspur':'Spurs','Tottenham':'Spurs',
  'Newcastle United':'Newcastle','Newcastle':'Newcastle',
  'Aston Villa':'Aston Villa','Brighton':'Brighton',
  'West Ham United':'West Ham','West Ham':'West Ham',
  'Fulham':'Fulham','Crystal Palace':'Crystal Palace',
  'Brentford':'Brentford','Wolves':'Wolves',
  'Wolverhampton Wanderers':'Wolves',
  'Everton':'Everton','Leicester City':'Leicester',
  'Southampton':'Southampton','Ipswich Town':'Ipswich',
  'Nottingham Forest':'Nott\'m Forest',
  'Bournemouth':'Bournemouth','AFC Bournemouth':'Bournemouth',
};

async function loadFplSquad(el, nom) {
  el.innerHTML = '<div style="text-align:center;padding:16px;color:var(--t3);font-size:11px;">⏳ Chargement squad FPL...</div>';
  try {
    var data = await getFplData();
    var teams = data.teams||[];
    var elements = data.elements||[];

    var fplName = FPL_TEAM_MAP[nom]||nom;
    var team = teams.find(function(t){
      return t.name===fplName||t.short_name===fplName||
             t.name.toLowerCase()===nom.toLowerCase()||
             nom.toLowerCase().indexOf(t.name.toLowerCase())>=0;
    });
    if(!team){
      el.innerHTML='<div style="color:var(--t3);font-size:10px;text-align:center;padding:8px;">Équipe non trouvée dans FPL (PL uniquement)</div>';
      return;
    }

    var players = elements.filter(function(p){ return p.team===team.id; });
    players.sort(function(a,b){ return a.element_type-b.element_type||b.total_points-a.total_points; });

    var posNames = {1:'GK',2:'DEF',3:'MID',4:'ATT'};
    var posColors = {1:'#f5a623',2:'#4fc3f7',3:'#81c784',4:'#ef9a9a'};
    var statusEmoji = {'a':'','d':'⚠️','i':'🩹','s':'🚫','u':'❓','n':'❌'};
    var statusBorder = {'d':'#ffc107','i':'#ff6432','s':'#9c27b0','u':'#607d8b','n':'#dc3545'};

    // ── Calcul du 11 type (top minutes par poste) ──
    var xi = [];
    var xiCounts = {1:1, 2:4, 3:3, 4:3}; // formation de base 4-3-3
    [1,2,3,4].forEach(function(pos){
      // Exclure prêtés/indisponibles sans minutes
      var pp = players.filter(function(p){
        return p.element_type===pos && p.status==='a' && p.minutes>90;
      });
      // Fallback : disponibles avec n'importe quel temps de jeu
      if(pp.length < xiCounts[pos]) {
        var pp2 = players.filter(function(p){
          return p.element_type===pos && p.status==='a';
        });
        pp2.sort(function(a,b){ return b.minutes-a.minutes; });
        pp = pp2;
      } else {
        pp.sort(function(a,b){ return b.minutes-a.minutes; });
      }
      xi = xi.concat(pp.slice(0, xiCounts[pos]));
    });

    var unavail = players.filter(function(p){ return p.status!=='a'; });

    // ── ID unique pour ce rendu ──
    var uid = 'fpl_'+Date.now();

    var html = '<div style="padding:2px 0;">';

    // ── Header ──
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--t3);">👤 Squad FPL · '+team.name+' <span style="color:var(--t2);font-weight:500;">('+players.length+')</span></div>';
    html += '<div style="font-size:9px;color:var(--t3);">Saison en cours</div>';
    html += '</div>';

    // ── TERRAIN ──
    html += '<div style="position:relative;border-radius:12px;overflow:hidden;margin-bottom:14px;background:#1a3a1a;border:1px solid rgba(255,255,255,.08);">';
    // Lignes terrain SVG
    html += '<svg style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:.18;" viewBox="0 0 300 420" preserveAspectRatio="none">';
    html += '<rect x="1" y="1" width="298" height="418" fill="none" stroke="#fff" stroke-width="1.5"/>';
    html += '<line x1="0" y1="210" x2="300" y2="210" stroke="#fff" stroke-width="1"/>';
    html += '<circle cx="150" cy="210" r="40" fill="none" stroke="#fff" stroke-width="1"/>';
    html += '<circle cx="150" cy="210" r="2" fill="#fff"/>';
    html += '<rect x="75" y="1" width="150" height="55" fill="none" stroke="#fff" stroke-width="1"/>';
    html += '<rect x="75" y="364" width="150" height="55" fill="none" stroke="#fff" stroke-width="1"/>';
    html += '<rect x="105" y="1" width="90" height="25" fill="none" stroke="#fff" stroke-width="1"/>';
    html += '<rect x="105" y="394" width="90" height="25" fill="none" stroke="#fff" stroke-width="1"/>';
    html += '</svg>';

    // Lignes de joueurs par poste
    var rows = [
      { pos: 4, players: xi.filter(function(p){return p.element_type===4;}), y: '13%' },
      { pos: 3, players: xi.filter(function(p){return p.element_type===3;}), y: '36%' },
      { pos: 2, players: xi.filter(function(p){return p.element_type===2;}), y: '60%' },
      { pos: 1, players: xi.filter(function(p){return p.element_type===1;}), y: '84%' },
    ];

    rows.forEach(function(row){
      var rp = row.players;
      if(!rp.length) return;
      var pct = 100/rp.length;
      html += '<div data-terrain-row="'+row.pos+'" style="position:absolute;top:'+row.y+';left:0;right:0;display:flex;justify-content:space-around;align-items:center;transform:translateY(-50%);">';
      rp.forEach(function(p){
        var isUnavail = p.status!=='a';
        var pc = posColors[p.element_type];
        var form = parseFloat(p.form)||0;
        var formCol = form>=6?'#1ed760':form>=4?'#f0b020':'#ff7b54';
        // carte joueur cliquable
        html += '<div class="fpl-player-card" data-uid="'+uid+'" data-pid="'+p.id+'" style="display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;position:relative;max-width:'+Math.floor(pct-2)+'%;">';
        // Avatar cercle
        html += '<div style="width:38px;height:38px;border-radius:50%;background:'+pc+'33;border:2px solid '+(isUnavail?'#ff4545':pc)+';display:flex;align-items:center;justify-content:center;font-size:14px;position:relative;box-shadow:0 2px 8px rgba(0,0,0,.4);">';
        html += '<span>'+posNames[p.element_type].charAt(0)+'</span>';
        if(isUnavail) html += '<span style="position:absolute;top:-4px;right:-4px;font-size:9px;">'+statusEmoji[p.status]+'</span>';
        html += '</div>';
        // Nom
        html += '<div style="background:rgba(0,0,0,.7);backdrop-filter:blur(4px);border-radius:4px;padding:2px 5px;font-size:10px;font-weight:700;color:#fff;white-space:nowrap;max-width:70px;overflow:hidden;text-overflow:ellipsis;text-align:center;">'+p.web_name+'</div>';
        // Forme badge
        html += '<div style="font-size:9px;font-weight:900;color:'+formCol+';">'+p.form+'</div>';
        html += '</div>';
      });
      html += '</div>';
    });

    // Hauteur terrain
    html += '<div style="height:360px;"></div>';
    html += '</div>'; // fin terrain

    // Panneau latéral fiche joueur
    html += '<div id="fpl-tip-'+uid+'" style="width:140px;flex-shrink:0;border-radius:12px;background:rgba(14,18,32,.95);border:1px solid rgba(77,132,255,.25);padding:12px;display:none;flex-direction:column;gap:8px;">';
    html += '<div style="font-size:9px;color:var(--t3);text-align:center;letter-spacing:1px;text-transform:uppercase;">← Sélectionne</div>';
    html += '</div>';
    html += '</div>'; // fin flex wrapper

    // ── Absences ──
    if(unavail.length) {
      html += '<div style="background:rgba(220,53,69,.07);border:1px solid rgba(220,53,69,.2);border-radius:10px;margin-bottom:12px;overflow:hidden;">';
      html += '<div style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-bottom:1px solid rgba(220,53,69,.12);">';
      html += '<span style="font-size:10px;">⚠️</span>';
      html += '<span style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#ff6b6b;">Absences & Incertains</span>';
      html += '<span style="margin-left:auto;background:rgba(220,53,69,.2);color:#ff6b6b;border-radius:10px;padding:1px 8px;font-size:9px;font-weight:800;">'+unavail.length+'</span>';
      html += '</div>';
      unavail.forEach(function(p){
        var pct = p.chance_of_playing_next_round;
        var pctCol = (pct===null||pct===undefined||pct===0)?'#ff4545':pct>=75?'#1ed760':pct>=50?'#f0b020':'#ff9800';
        var border = statusBorder[p.status]||'#607d8b';
        html += '<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid rgba(255,255,255,.03);border-left:3px solid '+border+';">';
        html += '<div style="font-size:11px;width:16px;text-align:center;flex-shrink:0;">'+statusEmoji[p.status]+'</div>';
        html += '<div style="flex:1;min-width:0;">';
        html += '<div style="display:flex;align-items:center;gap:6px;">';
        html += '<span style="font-size:13px;font-weight:700;color:var(--t1);">'+p.web_name+'</span>';
        html += '<span style="background:'+posColors[p.element_type]+'22;color:'+posColors[p.element_type]+';border:1px solid '+posColors[p.element_type]+'44;border-radius:3px;padding:0 5px;font-size:9px;font-weight:700;">'+posNames[p.element_type]+'</span>';
        html += '</div>';
        if(p.news) html += '<div style="font-size:10px;color:var(--t3);margin-top:1px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.news+'</div>';
        html += '</div>';
        html += '<div style="text-align:center;flex-shrink:0;">';
        if(pct!==null&&pct!==undefined){
          html += '<div style="font-size:15px;font-weight:900;color:'+pctCol+';line-height:1;">'+pct+'%</div>';
          html += '<div style="font-size:8px;color:var(--t3);margin-top:1px;">chance</div>';
        } else {
          html += '<div style="font-size:13px;font-weight:900;color:#ff4545;">0%</div>';
          html += '<div style="font-size:8px;color:var(--t3);margin-top:1px;">chance</div>';
        }
        html += '</div></div>';
      });
      html += '</div>';
    }

    // ── Squad par poste ──
    [1,2,3,4].forEach(function(pos){
      var pp = players.filter(function(p){ return p.element_type===pos; });
      if(!pp.length) return;
      var posLabel = {1:'🧤 Gardiens',2:'🛡️ Défenseurs',3:'🎯 Milieux',4:'⚽ Attaquants'}[pos];
      var pc = posColors[pos];
      html += '<div style="margin-bottom:12px;">';
      html += '<div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;">';
      html += '<div style="width:3px;height:14px;border-radius:2px;background:'+pc+';flex-shrink:0;"></div>';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:'+pc+';">'+posLabel+'</div>';
      html += '<div style="flex:1;height:1px;background:rgba(255,255,255,.05);"></div>';
      html += '<div style="font-size:9px;color:var(--t3);">'+pp.length+'</div>';
      html += '</div>';
      // En-tête colonnes : XI | Nom+Forme | B | A | CS | Min | Prix
      html += '<div style="display:grid;grid-template-columns:16px minmax(0,200px) 36px 36px 36px 44px;gap:0 6px;padding:3px 10px;margin-bottom:2px;">';
      html += '<div></div>';
      html += '<div style="font-size:9px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Joueur</div>';
      html += '<div style="font-size:9px;color:var(--t3);font-weight:700;text-align:center;" title="Buts marqu\u00e9s">B</div>';
      html += '<div style="font-size:9px;color:var(--t3);font-weight:700;text-align:center;" title="Passes d\u00e9cisives">A</div>';
      html += '<div style="font-size:9px;color:var(--t3);font-weight:700;text-align:center;" title="Clean sheets - matchs sans encaisser">CS</div>';
      html += '<div style="font-size:9px;color:var(--t3);font-weight:700;text-align:center;" title="Minutes jou\u00e9es">Min</div>';
      html += '</div>';

      pp.forEach(function(p, i){
        var form = parseFloat(p.form)||0;
        var formCol = form>=6?'#1ed760':form>=4?'#f0b020':'#8b97c4';
        var isUnavail = p.status!=='a';
        var mins = p.minutes||0;
        var minsK = mins>=1000?(mins/1000).toFixed(1)+'k':mins;
        var inXi = xi.some(function(x){return x.id===p.id;});
        var rowBg = i%2===0?'rgba(255,255,255,.025)':'rgba(255,255,255,.015)';
        html += '<div style="display:grid;grid-template-columns:16px minmax(0,200px) 36px 36px 36px 44px;gap:0 6px;align-items:center;padding:6px 10px;background:'+rowBg+';border-radius:6px;margin-bottom:2px;border-left:2px solid '+(isUnavail?'rgba(255,69,69,.5)':pc+'55')+';opacity:'+(isUnavail?.6:1)+';">';
        // Badge XI
        html += '<div>'+(inXi?'<span style="font-size:7px;background:'+pc+'33;color:'+pc+';border-radius:3px;padding:1px 3px;font-weight:800;">XI</span>':'')+'</div>';
        // Nom + Forme collés ensemble
        html += '<div style="display:flex;align-items:center;gap:6px;min-width:0;">';
        html += '<span style="font-size:12px;font-weight:700;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.web_name+'</span>';
        if(isUnavail) html += '<span style="font-size:9px;flex-shrink:0;">'+statusEmoji[p.status]+'</span>';
        html += '<span style="font-size:12px;font-weight:900;color:'+formCol+';flex-shrink:0;">'+p.form+'</span>';
        html += '</div>';
        // Buts
        html += '<div style="text-align:center;"><span style="font-size:11px;font-weight:700;color:'+(p.goals_scored>0?'#1ed760':'var(--t3)')+';">'+p.goals_scored+'</span></div>';
        // Passes
        html += '<div style="text-align:center;"><span style="font-size:11px;font-weight:700;color:'+(p.assists>0?'#4d84ff':'var(--t3)')+';">'+p.assists+'</span></div>';
        // CS
        html += '<div style="text-align:center;"><span style="font-size:11px;font-weight:700;color:'+(p.clean_sheets>0?'#f0b020':'var(--t3)')+';">'+p.clean_sheets+'</span></div>';
        // Minutes
        html += '<div style="text-align:center;"><span style="font-size:11px;font-weight:600;color:var(--t2);">'+minsK+'</span></div>';

        html += '</div>';
      });
      html += '</div>';
    });

    html += '</div>';
    el.innerHTML = html;

    // ── Tooltip interactif ──
    var tip = document.getElementById('fpl-tip-'+uid);
    var cards = el.querySelectorAll('.fpl-player-card[data-uid="'+uid+'"]');
    var playerMap = {};
    players.forEach(function(p){ playerMap[p.id] = p; });

    function showTip(card, p) {
      var form = parseFloat(p.form)||0;
      var formCol = form>=6?'#1ed760':form>=4?'#f0b020':'#ff7b54';
      var pct = p.chance_of_playing_next_round;
      var mins = p.minutes||0;
      var minsK = mins>=1000?(mins/1000).toFixed(1)+'k':mins;
      var posColors2 = {1:'#f5a623',2:'#4fc3f7',3:'#81c784',4:'#ef9a9a'};
      var posNms = {1:'GK',2:'DEF',3:'MID',4:'ATT'};
      var pc = posColors2[p.element_type]||'#8b97c4';
      var t = '';
      // Avatar + nom
      t += '<div style="text-align:center;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.07);">';
      t += '<div style="width:40px;height:40px;border-radius:50%;background:'+pc+'33;border:2px solid '+pc+';display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:'+pc+';margin:0 auto 6px;">'+posNms[p.element_type]+'</div>';
      var sofaQ = 'https://www.google.com/search?q='+encodeURIComponent(p.web_name+' '+nom+' Sofascore');
      t += '<a href="'+sofaQ+'" target="_blank" style="font-size:12px;font-weight:800;color:#fff;line-height:1.2;text-decoration:none;display:block;">'+p.web_name+' <span style="font-size:10px;color:#4d84ff;">↗ Sofascore</span></a>';
      t += '</div>';
      // Stats verticales
      t += statV('Forme', '<span style="color:'+formCol+';font-weight:900;font-size:15px;">'+p.form+'</span>');
      t += statV('Minutes', '<span style="color:var(--t2);">'+minsK+"'</span>");
      t += statV('Points', p.total_points);
      t += statV('Buts', '<span style="color:#1ed760;">'+p.goals_scored+'</span>');
      t += statV('Passes', '<span style="color:#4d84ff;">'+p.assists+'</span>');
      t += statV('CS', '<span style="color:#f0b020;">'+p.clean_sheets+'</span>');
      t += statV('Prix', '<span style="color:#a78bfa;">£'+(p.now_cost/10).toFixed(1)+'m</span>');
      if(pct!==null&&pct!==undefined) t += statV('Dispo', '<span style="color:'+(pct>=75?'#1ed760':pct>=50?'#f0b020':'#ff4545')+';">'+pct+'%</span>');
      if(p.news) t += '<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.07);font-size:9px;color:#ff7b54;line-height:1.4;">'+p.news+'</div>';
      tip.innerHTML = t;
      tip.style.display = 'flex';
      tip.style.flexDirection = 'column';
    }
    function statV(l,v){ return '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);"><span style="font-size:10px;color:var(--t3);">'+l+'</span><span style="font-size:11px;font-weight:700;">'+v+'</span></div>'; }

    cards.forEach(function(card){
      var pid = parseInt(card.dataset.pid);
      var p = playerMap[pid];
      if(!p) return;
      // Mobile: clic
      card.addEventListener('click', function(e){
        e.stopPropagation();
        if(tip.style.display==='block' && tip._pid===pid){
          tip.style.display='none'; tip._pid=null;
        } else {
          showTip(card, p); tip._pid=pid;
        }
      });
      // Desktop: hover
      card.addEventListener('mouseenter', function(){ showTip(card, p); tip._pid=pid; });
      card.addEventListener('mouseleave', function(){ tip.style.display='none'; tip._pid=null; });
    });
    document.addEventListener('click', function(){ if(tip) tip.style.display='none'; });

  } catch(e) {
    el.innerHTML='<div style="color:#ff4545;font-size:10px;text-align:center;padding:8px;">Erreur : '+e.message+'</div>';
  }
}

// ── Édition manuelle des stats joueurs ──
function fdEditStats(btn) {
  var pid = parseInt(btn.dataset.pid);
  var afId = btn.dataset.afid;
  var key = 'manual_stats_'+saisonKey(afId+'_'+pid);
  var current = {};
  try { current = JSON.parse(localStorage.getItem(key)||'{}'); } catch(e){}

  // Mini popup
  var existing = document.getElementById('fd-edit-overlay');
  if(existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'fd-edit-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.6);z-index:9998;';
  // overlay.onclick désactivé - fermer uniquement via bouton
  document.body.appendChild(overlay);

  var popup = document.createElement('div');
  popup.id = 'fd-edit-popup';
  popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--bg2);border:1px solid rgba(77,132,255,.4);border-radius:12px;padding:16px;z-index:9999;min-width:240px;box-shadow:0 8px 32px rgba(0,0,0,.8);';
  var inpStyle = 'width:100%;padding:5px;background:var(--bg3);border:1px solid var(--b2);border-radius:6px;color:var(--t1);font-size:13px;font-weight:700;text-align:center;';
  popup.innerHTML = '<div style="font-size:13px;font-weight:800;color:var(--t1);margin-bottom:10px;">✏️ Stats manuelles</div>'
    +'<div style="display:grid;grid-template-columns:auto 1fr 1fr 1fr;gap:6px;align-items:center;margin-bottom:12px;">'
    +'<div style="font-size:10px;color:var(--t3);font-weight:700;"></div>'
    +'<div style="font-size:10px;color:var(--t2);font-weight:700;text-align:center;">MJ</div>'
    +'<div style="font-size:10px;color:#1ed760;font-weight:700;text-align:center;">Buts ⚽</div>'
    +'<div style="font-size:10px;color:#4d84ff;font-weight:700;text-align:center;">Passes 🅰</div>'
    +'<div style="font-size:10px;color:var(--t3);">🏆 Champ.</div>'
    +'<input id="fe-lmj" type="number" min="0" value="'+(current.league_apps||0)+'" style="'+inpStyle+'">'
    +'<input id="fe-lg" type="number" min="0" value="'+(current.league_goals||0)+'" style="'+inpStyle+'">'
    +'<input id="fe-la" type="number" min="0" value="'+(current.league_assists||0)+'" style="'+inpStyle+'">'
    +'<div style="font-size:10px;color:var(--t3);">⭐ Europe</div>'
    +'<input id="fe-emj" type="number" min="0" value="'+(current.euro_apps||0)+'" style="'+inpStyle+'">'
    +'<input id="fe-eg" type="number" min="0" value="'+(current.euro_goals||0)+'" style="'+inpStyle+'">'
    +'<input id="fe-ea" type="number" min="0" value="'+(current.euro_assists||0)+'" style="'+inpStyle+'">'
    +'</div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button onclick="fdSaveStats(this)" data-key="'+key+'" style="flex:1;padding:8px;background:var(--a);border:none;border-radius:8px;color:#fff;font-weight:700;cursor:pointer;">💾 Sauver</button>'
    +'<button onclick="var o=document.getElementById(\'fd-edit-overlay\');if(o)o.remove();" style="padding:8px 12px;background:var(--bg3);border:1px solid var(--b2);border-radius:8px;color:var(--t3);cursor:pointer;">✕</button>'
    +'</div>';
  overlay.appendChild(popup);
  popup.addEventListener('click', function(e){ e.stopPropagation(); });
  var feFirst = document.getElementById('fe-lg'); if(feFirst) feFirst.focus();
}

function fdSaveStats(btn) {
  var key = btn ? btn.dataset.key : '';
  if(!key) return;
  var lmj = parseInt(document.getElementById('fe-lmj').value)||0;
  var lg = parseInt(document.getElementById('fe-lg').value)||0;
  var la = parseInt(document.getElementById('fe-la').value)||0;
  var emj = parseInt(document.getElementById('fe-emj').value)||0;
  var eg = parseInt(document.getElementById('fe-eg').value)||0;
  var ea = parseInt(document.getElementById('fe-ea').value)||0;
  var statsObj = {league_apps:lmj,league_goals:lg,league_assists:la,euro_apps:emj,euro_goals:eg,euro_assists:ea,ts:Date.now()};
  localStorage.setItem(key, JSON.stringify(statsObj));
  // Sync sur GitHub si token dispo
  if(localStorage.getItem('gones45_github_token')) {
    saveStatToGithub(key, statsObj).then(function(ok){
      if(ok) console.log('GitHub sync OK');
    });
  }
  var ov=document.getElementById('fd-edit-overlay');if(ov)ov.remove();
  var pid = key.split('_')[3];
  var activeEl = document.querySelector('[data-bench-pid="'+pid+'"]');
  if(activeEl) {
    var cells = activeEl.children;
    if(cells[2]){ cells[2].textContent=lg; cells[2].style.color=lg>0?'#1ed760':'var(--t3)'; }
    if(cells[3]){ cells[3].textContent=la; cells[3].style.color=la>0?'#4d84ff':'var(--t3)'; }
    if(cells[5]){ cells[5].textContent=eg; cells[5].style.color=eg>0?'#f0b020':'var(--t3)'; }
    if(cells[6]){ cells[6].textContent=ea; cells[6].style.color=ea>0?'#f59e0b':'var(--t3)'; }
  }
}


// ── IDs Sofascore par équipe ── AJOUTER ICI ──
var SOFASCORE_TEAM_IDS = {
  // Football
  'PSG':1644, 'Paris Saint-Germain':1644, 'Paris SG':1644,
  'Real Madrid':2829, 'Real':2829,
  'Bayern Munich':2672, 'Bayern':2672,
  'Inter Milan':2697, 'Inter':2697,
  'Lyon':1649, 'OL':1649, 'Olympique Lyonnais':1649,
  'Palmeiras':1963,
  'Boca Juniors':3202, 'Boca':3202,
  'France':4481,
  'PSV':2952, 'PSV Eindhoven':2952,
  // Baseball
  'LA Dodgers':3638, 'Los Angeles Dodgers':3638,
};

async function sofascoreFetch(path) {
  var key = localStorage.getItem('gones45_rapidapi_key');
  if(!key) return null;
  var url = 'https://fd-proxy.touraine-antoine.workers.dev/?key='+key+'&host=rapidapi&rapidhost=sofascore-sport-api.p.rapidapi.com&path='+encodeURIComponent(path);
  var r = await fetch(url);
  if(!r.ok) return null;
  return await r.json();
}

function refreshSquadCache(nom) {
  var sofaId = SOFASCORE_TEAM_IDS && SOFASCORE_TEAM_IDS[nom];
  if(!sofaId) { for(var k in SOFASCORE_TEAM_IDS){ if(nom.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(nom.toLowerCase())>=0){sofaId=SOFASCORE_TEAM_IDS[k];break;} } }
  var cacheKey = 'squad_sofa_'+(sofaId||'af_'+nom);
  localStorage.removeItem(cacheKey);
  loadTeamLive();
}

function editPlayerStats(teamId, playerId, encName, isGK, uid) {
  var name = decodeURIComponent(encName);
  var manualKey = 'manual_stats_'+saisonKey(teamId+'_'+playerId);
  var ms = {}; try { ms = JSON.parse(localStorage.getItem(manualKey)||'{}'); } catch(e){}
  // compMode + journée actuels
  var compMode = window['_compMode_'+uid] || 'league';
  var prefix = compMode === 'euro' ? 'euro' : 'league';
  var vj = (function(){ var el=document.getElementById('fbref-journee-'+uid); return el?el.value:'global'; })() || 'global';
  var jp = (vj !== 'global') ? prefix+'_'+vj : prefix;
  var compLabel = (compMode==='euro'?'Europe':'Championnat') + (vj!=='global'?' '+vj:' (global)');

  function g(k){ return ms[jp+'_'+k]!==undefined ? ms[jp+'_'+k] : ''; }
  var fields = isGK
    ? [['apps','Matchs'],['starts','Titularisations'],['minutes','Minutes'],['ga','Buts encaissés'],['sota','Tirs cadrés subis'],['saves','Arrêts'],['cs','Clean sheets']]
    : [['apps','Matchs'],['starts','Titularisations'],['minutes','Minutes'],['goals','Buts'],['assists','Passes décisives'],['gpk','Buts hors penalty'],['pk','Penalties marqués'],['pkatt','Penalties tentés'],['yellow','Cartons jaunes'],['red','Cartons rouges']];

  var msg = '✏️ '+name+'\n'+compLabel+'\n\nLaisse vide pour ne pas changer. Entre les valeurs séparées par des virgules dans cet ordre :\n\n'
    + fields.map(function(f){ return f[1]+' ('+(g(f[0])!==''?g(f[0]):'0')+')'; }).join('\n')
    + '\n\nFormat : '+fields.map(function(){return 'n';}).join(',');

  var input = prompt(msg, fields.map(function(f){ return g(f[0])!==''?g(f[0]):''; }).join(','));
  if(input===null) return;
  var vals = input.split(',');
  fields.forEach(function(f, i){
    var v = (vals[i]||'').trim();
    if(v !== '') {
      var num = parseFloat(v);
      if(!isNaN(num)) ms[jp+'_'+f[0]] = num;
    }
  });
  localStorage.setItem(manualKey, JSON.stringify(ms));
  if(typeof loadTeamCompo === 'function') loadTeamCompo();
}

function resetTeamStats(nom) {
  var sofaId = SOFASCORE_TEAM_IDS && SOFASCORE_TEAM_IDS[nom];
  if(!sofaId) { for(var k in SOFASCORE_TEAM_IDS){ if(nom.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(nom.toLowerCase())>=0){sofaId=SOFASCORE_TEAM_IDS[k];break;} } }
  if(!sofaId) { alert('Equipe introuvable'); return; }
  if(!confirm('Effacer TOUTES les stats manuelles de '+nom+' (championnat + Europe + toutes journees) ? Le squad est conserve. Irreversible.')) return;
  var prefix = 'manual_stats_'+_currentSaison+'_'+sofaId+'_';
  var toRemove = [];
  Object.keys(localStorage).forEach(function(k){ if(k.indexOf(prefix)===0) toRemove.push(k); });
  toRemove.forEach(function(k){ localStorage.removeItem(k); });
  localStorage.removeItem('squad_lastJ_'+saisonKey(sofaId));
  alert(toRemove.length+' joueur(s) reinitialise(s) pour '+nom+'. Tu peux reimporter proprement.');
  if(typeof loadTeamCompo === 'function') loadTeamCompo();
}

async function importFbrefStats(uid, nom) {
  var groqKey = getGeminiKey();
  if(!groqKey) { alert('❌ Clé Groq manquante — configure-la dans Outils.'); return; }

  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async function(e) {
    var file = e.target.files[0];
    if(!file) return;
    var b64 = await fileToBase64(file);
    await runFbrefGroq(uid, nom, b64, groqKey);
  };
  input.click();
}

function handleFbrefFileInput(e, uid, nom) {
  var file = e.target.files[0];
  if(!file) return;
  var groqKey = getGeminiKey();
  if(!groqKey) { alert('❌ Clé Groq manquante — configure-la dans Outils.'); return; }
  var modeBtn = document.getElementById('fbref-mode-'+uid);
  var mode = modeBtn ? modeBtn.dataset.mode : 'replace';
  var compBtn = document.getElementById('fbref-comp-'+uid);
  var comp = compBtn ? compBtn.dataset.comp : 'league';
  fileToBase64(file).then(function(b64){ runFbrefGroq(uid, nom, b64, groqKey, mode, comp); });
}

function handleFbrefDrop(e, uid, nom) {
  e.preventDefault();
  var zone = document.getElementById('fbref-paste-zone-'+uid);
  if(zone) zone.style.borderColor = 'rgba(255,255,255,.1)';
  var file = e.dataTransfer.files[0];
  if(!file || file.type.indexOf('image')===-1) return;
  var groqKey = getGeminiKey();
  if(!groqKey) { alert('❌ Clé Groq manquante — configure-la dans Outils.'); return; }
  var modeBtn = document.getElementById('fbref-mode-'+uid);
  var mode = modeBtn ? modeBtn.dataset.mode : 'replace';
  var compBtn = document.getElementById('fbref-comp-'+uid);
  var comp = compBtn ? compBtn.dataset.comp : 'league';
  fileToBase64(file).then(function(b64){ runFbrefGroq(uid, nom, b64, groqKey, mode, comp); });
}

function setupFbrefPaste(uid, nom) {
  document.addEventListener('paste', function handler(e) {
    var liveEl = document.getElementById('ip-live');
    if(!liveEl || liveEl.style.display==='none') return;
    var items = e.clipboardData && e.clipboardData.items;
    if(!items) return;
    for(var i=0;i<items.length;i++){
      if(items[i].type.indexOf('image')!==-1){
        var groqKey = getGeminiKey();
        if(!groqKey) { alert('❌ Clé Groq manquante.'); return; }
        var modeBtn = document.getElementById('fbref-mode-'+uid);
        var mode = modeBtn ? modeBtn.dataset.mode : 'replace';
        var compBtn = document.getElementById('fbref-comp-'+uid);
        var comp = compBtn ? compBtn.dataset.comp : 'league';
        var blob = items[i].getAsFile();
        fileToBase64(blob).then(function(b64){ runFbrefGroq(uid, nom, b64, groqKey, mode, comp); });
        document.removeEventListener('paste', handler);
        break;
      }
    }
  });
}

function fileToBase64(file) {
  return new Promise(function(res) {
    var r = new FileReader();
    r.onload = function(ev) { res(ev.target.result.split(',')[1]); };
    r.readAsDataURL(file);
  });
}


function bkFavicon(k,sz){
  var b=bki(k);
  sz=sz||20;
  if(b.d){
    return '<img src="https://www.google.com/s2/favicons?domain='+b.d+'&sz=32" '
      +'style="width:'+sz+'px;height:'+sz+'px;border-radius:4px;object-fit:contain;" '
      +'onerror="logoErr(this)" loading="lazy">';
  }
  return '<span style="width:'+sz+'px;height:'+sz+'px;border-radius:4px;background:'+b.c+'22;display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;color:'+b.c+';">'+b.n.substring(0,2)+'</span>';
}
var DEF_BK=Object.keys(BK);
function bki(k){var lk=(k||'').toLowerCase();var cc=state.bkColors&&state.bkColors[lk];var base=BK[lk]||{n:(k||'').toUpperCase()||'—',c:'#4f5d88'};if(cc)base=Object.assign({},base,{c:cc});return base;}
function bbadge(k){
  var b=bki(k);
  var ico=b.d?'<img src="https://www.google.com/s2/favicons?domain='+b.d+'&sz=32" style="width:12px;height:12px;border-radius:2px;object-fit:contain;vertical-align:middle;margin-right:3px;" onerror="logoErr(this)" loading="lazy">':'';
  return '<span class="bbadge" style="color:'+b.c+';border-color:'+b.c+'33;background:'+b.c+'14;">'+ico+b.n+'</span>';
}

/* ── LOGOS (api-sports CDN) ── */
var LOGOS={
  "Bayern Munich":"https://media.api-sports.io/football/teams/157.png",
  "Boca Juniors": "https://media.api-sports.io/football/teams/405.png",
  "France":       "https://media.api-sports.io/football/teams/2.png",
  "Inter Milan":  "https://media.api-sports.io/football/teams/505.png",
  "Lyon":         "https://media.api-sports.io/football/teams/80.png",
  "Palmeiras":    "https://media.api-sports.io/football/teams/121.png",
  "PSG":          "https://media.api-sports.io/football/teams/85.png",
  "PSV":          "https://media.api-sports.io/football/teams/674.png",
  "Real Madrid":  "https://media.api-sports.io/football/teams/541.png",
  "Carolina Hurricanes":"https://media.api-sports.io/hockey/teams/7.png",
  "Colorado Avalanche": "https://media.api-sports.io/hockey/teams/9.png",
  "LA Dodgers":   "https://media.api-sports.io/baseball/teams/19.png"
};
var FAV_LINKS={
  "Bayern Munich":"https://www.flashscore.fr/equipe/bayern/nVp0wiqd/",
  "Boca Juniors":"https://www.flashscore.fr/equipe/boca-juniors/hMrWAFH0/",
  "France":"https://www.flashscore.fr/equipe/france/QkGeVG1n/",
  "Inter Milan":"https://www.flashscore.fr/equipe/inter/Iw7eKK25/",
  "Lyon":"https://www.flashscore.fr/equipe/lyon/2akflumR/",
  "Palmeiras":"https://www.flashscore.fr/equipe/palmeiras/hMn9FTbH/",
  "PSG":"https://www.flashscore.fr/equipe/psg/CjhkPw0k/",
  "PSV":"https://www.flashscore.fr/equipe/psv/M9UEHJWi/",
  "Real Madrid":"https://www.flashscore.fr/equipe/real-madrid/W8mj7MDD/",
  "Carolina Hurricanes":"https://www.flashscore.fr/equipe/carolina-hurricanes/Sx0gl0tm/",
  "Colorado Avalanche":"https://www.flashscore.fr/equipe/colorado-avalanche/hACAnvBa/",
  "LA Dodgers":"https://www.flashscore.fr/equipe/los-angeles-dodgers/nwPDBpVc/",
  "Marseille":"https://www.flashscore.fr/equipe/marseille/GRk7WQET/",
  "Monaco":"https://www.flashscore.fr/equipe/monaco/dOUzNP1B/",
  "Lille":"https://www.flashscore.fr/equipe/lille/fOHJ2dlA/",
  "Arsenal":"https://www.flashscore.fr/equipe/arsenal/G0g5WGBD/",
  "Liverpool":"https://www.flashscore.fr/equipe/liverpool/Ij4aLvSF/",
  "Manchester City":"https://www.flashscore.fr/equipe/manchester-city/E8Ysm0MO/",
  "Chelsea":"https://www.flashscore.fr/equipe/chelsea/hRsAdPdH/",
  "Juventus":"https://www.flashscore.fr/equipe/juventus/lB7mkbhH/",
  "AC Milan":"https://www.flashscore.fr/equipe/ac-milan/jqbDiOIS/",
  "Napoli":"https://www.flashscore.fr/equipe/napoli/KXqvBHpA/",
  "FC Barcelone":"https://www.flashscore.fr/equipe/barcelone/GOLd4Ilf/",
  "Atletico Madrid":"https://www.flashscore.fr/equipe/atletico-madrid/GlEGerKH/",
  "Flamengo":"https://www.flashscore.fr/equipe/flamengo/pNAWLFBl/",
  "River Plate":"https://www.flashscore.fr/equipe/river-plate/nUQlTZNq/"
};

function logoErr(img){
  img.style.display='none';
  var s=img.nextSibling;
  if(s)s.style.display='flex';
}
var _statFilter = 'global';
var _nhlFilter = 'global';
var _advCompFilter = 'all';
var _nhlTypeFilter = 'all'; // 'all', 'reg', 'playoffs'
var _mlbFilter = 'global';
var _nbaFilter = 'global';
var _standingsCache = {};


/* ══ DETAIL MATCH ══ */
var _matchDetailCache = {};

var _usMatchCache = {};


async function ouvrirYouTubeAvecScore(titre, date, comp) {
  // Chercher le match via football-data pour avoir le score exact
  var query = titre + ' ' + (date||'') + ' highlights';
  try {
    var teamKey = Object.keys(TEAM_IDS).find(function(k){ return titre.toLowerCase().indexOf(k.toLowerCase())>=0; });
    if(teamKey) {
      var teamId = TEAM_IDS[teamKey];
      var d = new Date(date||'');
      var ds = d.toISOString().split('T')[0];
      var data = await fdFetch('/v4/teams/'+teamId+'/matches?dateFrom='+ds+'&dateTo='+ds+'&status=FINISHED');
      if(data&&data.matches&&data.matches.length) {
        var m = data.matches[0];
        var hg = m.score&&m.score.fullTime ? m.score.fullTime.home : '?';
        var ag = m.score&&m.score.fullTime ? m.score.fullTime.away : '?';
        var home = m.homeTeam&&m.homeTeam.name||'';
        var away = m.awayTeam&&m.awayTeam.name||'';
        query = home+' '+away+' '+hg+'-'+ag+' highlights '+(comp||'');
      }
    }
  } catch(e) {}
  window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(query), '_blank');
}


function setAdvComp(ckey) {
  _advCompFilter = ckey ? (_usMatchCache[ckey]||'all') : 'all';
  var cx = window._advCtx;
  if(cx) chargerFicheAdversaire(cx.matchId, cx.advId, cx.advNom);
}

function _callUS(k){var m=_usMatchCache[k];if(m)ouvrirDetailMatchUS(m.sport,m.h,m.a,m.hs,m.as,m.d);}
function ouvrirDetailMatchUS(sport, homeTeam, awayTeam, homeScore, awayScore, date) {
  var modal = document.getElementById('match-detail-modal');
  if(!modal) {
    modal = document.createElement('div');
    modal.id = 'match-detail-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  modal.onclick = function(e){ if(e.target===modal) modal.style.display='none'; };

  var total = (homeScore||0) + (awayScore||0);
  var rc = homeScore>awayScore ? '#1ed760' : homeScore<awayScore ? '#ff4545' : '#f0b020';

  var overChecks = [];
  if(sport==='🏒') overChecks = [{l:'O5.5',ok:total>5.5,c:'#1ed760'},{l:'O6.5',ok:total>6.5,c:'#f0b020'},{l:'O7.5',ok:total>7.5,c:'#ff7b54'}];
  else if(sport==='⚾') overChecks = [{l:'O7',ok:total>7,c:'#1ed760'},{l:'O8',ok:total>8,c:'#f0b020'},{l:'O9',ok:total>9,c:'#ff7b54'}];
  else if(sport==='🏀') overChecks = [{l:'O210',ok:total>210,c:'#1ed760'},{l:'O220',ok:total>220,c:'#f0b020'},{l:'O230',ok:total>230,c:'#ff7b54'}];

  var d2 = new Date(date||'');
  var dateStr = isNaN(d2.getTime()) ? (date||'') : d2.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  var ytUrl = 'https://www.youtube.com/results?search_query='+encodeURIComponent(homeTeam+' '+awayTeam+' highlights résumé');
  var sofaQ = 'https://www.google.com/search?q='+encodeURIComponent(homeTeam+' '+awayTeam+' sofascore');
  var googleQ = 'https://www.google.com/search?q='+encodeURIComponent(homeTeam+' '+awayTeam+' '+dateStr+' résumé');

  var html = '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:16px;padding:20px;max-width:420px;width:100%;">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">';
  html += '<div style="font-size:14px;">'+sport+' <span style="font-size:10px;color:var(--t3);">'+dateStr+'</span></div>';
  html += '<button onclick="document.getElementById(\'match-detail-modal\').style.display=\'none\'" style="background:rgba(255,255,255,.06);border:1px solid var(--b2);border-radius:6px;color:var(--t2);font-size:11px;padding:4px 10px;cursor:pointer;">✕</button>';
  html += '</div>';

  html += '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:14px;">';
  html += '<div style="text-align:center;font-size:12px;font-weight:700;color:var(--t1);">'+homeTeam+'</div>';
  html += '<div style="text-align:center;font-size:36px;font-weight:900;color:'+rc+';">'+homeScore+' - '+awayScore+'</div>';
  html += '<div style="text-align:center;font-size:12px;font-weight:700;color:var(--t1);">'+awayTeam+'</div>';
  html += '</div>';

  html += '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">';
  html += '<div style="background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;"><div style="font-size:11px;font-weight:700;color:#f0b020;">'+total+' pts</div></div>';
  overChecks.forEach(function(o){
    html += '<div style="background:rgba(255,255,255,.04);border-radius:8px;padding:6px 10px;"><div style="font-size:11px;font-weight:700;color:'+(o.ok?o.c:'#4f5d88')+';">'+o.l+(o.ok?' ✅':'')+'</div></div>';
  });
  html += '</div>';

  html += '<div style="display:flex;gap:8px;margin-bottom:8px;">';
  html += '<a href="'+sofaQ+'" target="_blank" style="flex:1;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(255,107,54,.15);border:1px solid rgba(255,107,54,.3);border-radius:10px;text-decoration:none;color:#ff7b54;font-size:12px;font-weight:700;">⚡ Sofascore</a>';
  html += '<a href="'+googleQ+'" target="_blank" style="flex:1;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(77,132,255,.15);border:1px solid rgba(77,132,255,.3);border-radius:10px;text-decoration:none;color:#4d84ff;font-size:12px;font-weight:700;">🔍 Résumé</a>';
  html += '</div>';
  html += '<a href="'+ytUrl+'" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;background:rgba(255,0,0,.15);border:1px solid rgba(255,0,0,.3);border-radius:10px;text-decoration:none;color:#ff4545;font-size:12px;font-weight:700;">▶️ Voir sur YouTube</a>';
  html += '</div>';
  modal.innerHTML = html;
}



async function ouvrirDetailMatch(matchId) {
  if(!matchId) return;

  // Afficher modal de chargement
  var modal = document.getElementById('match-detail-modal');
  if(!modal) {
    modal = document.createElement('div');
    modal.id = 'match-detail-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
    document.body.appendChild(modal);
  }
  modal.innerHTML = '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:16px;padding:24px;max-width:420px;width:100%;text-align:center;"><div style="font-size:24px;margin-bottom:8px;">⏳</div><div style="color:var(--t3);font-size:12px;">Chargement du match...</div></div>';
  modal.style.display = 'flex';
  modal.onclick = function(e){ if(e.target===modal) modal.style.display='none'; };

  try {
    var data;
    if(_matchDetailCache[matchId]) {
      data = _matchDetailCache[matchId];
    } else {
      var resp = await fdFetch('/v4/matches/'+matchId);
      if(!resp || !resp.homeTeam) { modal.innerHTML = '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:16px;padding:24px;max-width:420px;width:100%;text-align:center;"><div style="color:#ff4545;">❌ Match non disponible</div><button onclick="document.getElementById(\'match-detail-modal\').style.display=\'none\'" style="margin-top:12px;padding:8px 16px;background:rgba(255,255,255,.06);border:1px solid var(--b2);border-radius:8px;color:var(--t2);cursor:pointer;">Fermer</button></div>'; return; }
      _matchDetailCache[matchId] = resp;
      data = resp;
    }

    renderDetailMatch(modal, data, matchId);
  } catch(e) {
    modal.innerHTML = '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:16px;padding:24px;max-width:420px;width:100%;text-align:center;"><div style="color:#ff4545;">❌ Erreur : '+e.message+'</div><button onclick="document.getElementById(\'match-detail-modal\').style.display=\'none\'" style="margin-top:12px;padding:8px 16px;background:rgba(255,255,255,.06);border:1px solid var(--b2);border-radius:8px;color:var(--t2);cursor:pointer;">Fermer</button></div>';
  }
}


/* ══ STATS MATCH API-SPORTS ══ */
var _apiMatchCache = {};

async function chargerStatsMatchApiSports(fdMatchId, homeTeamName) {
  var zone = document.getElementById('match-player-stats-'+fdMatchId);
  if(!zone) return;
  if(zone.innerHTML && zone.innerHTML.length > 10) { zone.innerHTML=''; return; }
  zone.innerHTML = '<div style="text-align:center;padding:12px;color:var(--t3);font-size:11px;">⏳ Chargement stats joueurs...</div>';

  try {
    // Trouver l'ID api-sports du match via la date et les équipes
    if(_apiMatchCache[fdMatchId]) {
      renderApiSportsStats(zone, _apiMatchCache[fdMatchId]);
      return;
    }

    // Chercher le match par équipe et date dans api-sports
    var cached = _matchDetailCache[fdMatchId];
    if(!cached) { zone.innerHTML='<div style="color:#ff4545;font-size:10px;text-align:center;">Match non chargé</div>'; return; }

    var d = new Date(cached.utcDate);
    var dateStr = d.toISOString().split('T')[0];
    
    // Chercher l'ID api-sports — essayer home ET away
    var homeNom2 = cached.homeTeam&&cached.homeTeam.name||'';
    var awayNom2 = cached.awayTeam&&cached.awayTeam.name||'';
    var teamId = API_SPORTS_IDS[homeNom2] || API_SPORTS_IDS[awayNom2] || await findApiSportsTeamId(homeNom2) || await findApiSportsTeamId(awayNom2);

    if(!teamId) { zone.innerHTML='<div style="color:var(--t3);font-size:10px;text-align:center;">Équipe non trouvée sur api-sports</div>'; return; }

    // Chercher les fixtures de cette date pour cette équipe
    var data = await apiSportsFetch('/fixtures?team='+teamId+'&date='+dateStr);
    var fixtures = data&&data.response||[];

    if(!fixtures.length) {
      zone.innerHTML='<div style="color:var(--t3);font-size:10px;text-align:center;">Match non trouvé sur api-sports</div>';
      return;
    }

    // Prendre le bon match
    var fix = fixtures[0];
    var fixtureId = fix.fixture&&fix.fixture.id;

    // Récupérer les stats joueurs ET les events ET les stats de match en parallèle
    var [playersData, statsData, eventsData] = await Promise.all([
      apiSportsFetch('/fixtures/players?fixture='+fixtureId),
      apiSportsFetch('/fixtures/statistics?fixture='+fixtureId),
      apiSportsFetch('/fixtures/events?fixture='+fixtureId)
    ]);

    _apiMatchCache[fdMatchId] = {fix:fix, players:playersData, stats:statsData, events:eventsData};
    renderApiSportsStats(zone, _apiMatchCache[fdMatchId]);

  } catch(e) {
    zone.innerHTML = '<div style="color:#ff4545;font-size:10px;text-align:center;">Erreur : '+e.message+'</div>';
  }
}

function renderApiSportsStats(zone, data) {
  var fix = data.fix||{};
  var teams = fix.teams||{};
  var homeId = teams.home&&teams.home.id;
  var awayId = teams.away&&teams.away.id;
  var homeNom = teams.home&&teams.home.name||'Dom';
  var awayNom = teams.away&&teams.away.name||'Ext';

  var html = '<div style="margin-top:10px;">';

  // Stats de match (xG, possession etc.)
  var statsResp = data.stats&&data.stats.response||[];
  if(statsResp.length) {
    var homeSt = statsResp.find(function(s){return s.team&&s.team.id===homeId;})||statsResp[0];
    var awaySt = statsResp.find(function(s){return s.team&&s.team.id===awayId;})||statsResp[1];

    if(homeSt&&awaySt) {
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">📊 Stats du match</div>';
      html += '<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:10px;">';

      var SHOW_STATS = ['Ball Possession','Expected Goals','Total Shots','Shots on Goal','Corner Kicks','Fouls','Yellow Cards'];
      SHOW_STATS.forEach(function(sn){
        var hs = (homeSt.statistics||[]).find(function(x){return x.type===sn;});
        var as2 = (awaySt.statistics||[]).find(function(x){return x.type===sn;});
        if(!hs||!as2) return;
        var hv = hs.value||0, av = as2.value||0;
        var label = sn.replace('Ball Possession','Possession').replace('Expected Goals','xG')
          .replace('Total Shots','Tirs total').replace('Shots on Goal','Tirs cadrés')
          .replace('Corner Kicks','Corners').replace('Yellow Cards','Cartons jaunes');
        var isPercent = sn==='Ball Possession';
        var hNum = parseFloat(hv)||0, aNum = parseFloat(av)||0;
        var total = hNum+aNum||1;
        var hPct = Math.round(hNum/total*100);
        html += '<div style="display:flex;align-items:center;gap:6px;padding:3px 0;">';
        html += '<div style="font-size:10px;font-weight:700;color:var(--t1);width:30px;text-align:center;">'+hv+'</div>';
        html += '<div style="flex:1;">';
        html += '<div style="font-size:8px;color:var(--t3);text-align:center;margin-bottom:2px;">'+label+'</div>';
        html += '<div style="height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden;display:flex;">';
        html += '<div style="width:'+hPct+'%;background:#4d84ff;border-radius:3px 0 0 3px;"></div>';
        html += '<div style="width:'+(100-hPct)+'%;background:#a78bfa;border-radius:0 3px 3px 0;"></div>';
        html += '</div></div>';
        html += '<div style="font-size:10px;font-weight:700;color:var(--t1);width:30px;text-align:center;">'+av+'</div>';
        html += '</tr>';
      });
      html += '</tbody></table>';
      html += '</div>';
    }
  }

  // Stats joueurs
  var playersResp = data.players&&data.players.response||[];
  if(playersResp.length) {
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">👤 Top joueurs</div>';

    // Trouver les meilleurs joueurs (par note)
    var allPlayers = [];
    playersResp.forEach(function(teamData){
      (teamData.players||[]).forEach(function(p){
        var stats = p.statistics&&p.statistics[0]||{};
        var rating = parseFloat(stats.games&&stats.games.rating||0);
        if(rating>0) allPlayers.push({
          name:p.player&&p.player.name||'?',
          photo:p.player&&p.player.photo||'',
          teamId:teamData.team&&teamData.team.id,
          rating:rating,
          goals:stats.goals&&stats.goals.total||0,
          assists:stats.goals&&stats.goals.assists||0,
          shots:stats.shots&&stats.shots.total||0,
          shotsOn:stats.shots&&stats.shots.on||0,
          minutes:stats.games&&stats.games.minutes||0,
          yellowCard:stats.cards&&stats.cards.yellow||0,
          redCard:stats.cards&&stats.cards.red||0,
        });
      });
    });

    allPlayers.sort(function(a,b){return b.rating-a.rating;});

    html += '<div style="display:flex;flex-direction:column;gap:4px;">';
    allPlayers.slice(0,8).forEach(function(p){
      var isHome = p.teamId===homeId;
      var ratingColor = p.rating>=8?'#1ed760':p.rating>=7?'#f0b020':'#ff7b54';
      html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:rgba(255,255,255,.03);border-radius:6px;border-left:2px solid '+(isHome?'#4d84ff':'#a78bfa')+'">';
      if(p.photo) html += '<img src="'+p.photo+'" style="width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0;" loading="lazy">';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-size:10px;font-weight:700;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.name+'</div>';
      html += '<div style="font-size:9px;color:var(--t3);">'+(isHome?homeNom:awayNom)+(p.minutes?' · '+p.minutes+"'":'')+' '+(p.yellowCard?'🟨':'')+(p.redCard?'🟥':'')+'</div>';
      html += '</div>';
      html += '<div style="display:flex;gap:8px;align-items:center;flex-shrink:0;">';
      if(p.goals) html += '<div style="text-align:center;"><div style="font-size:12px;font-weight:800;color:#1ed760;">'+p.goals+'</div><div style="font-size:7px;color:var(--t3);">⚽</div></div>';
      if(p.assists) html += '<div style="text-align:center;"><div style="font-size:12px;font-weight:800;color:#4d84ff;">'+p.assists+'</div><div style="font-size:7px;color:var(--t3);">🅰️</div></div>';
      if(p.shotsOn) html += '<div style="text-align:center;"><div style="font-size:11px;font-weight:700;color:var(--t3);">'+p.shotsOn+'/'+p.shots+'</div><div style="font-size:7px;color:var(--t3);">tirs</div></div>';
      html += '<div style="text-align:center;"><div style="font-size:13px;font-weight:900;color:'+ratingColor+';">'+p.rating.toFixed(1)+'</div><div style="font-size:7px;color:var(--t3);">note</div></div>';
      html += '</div></div>';
    });
    html += '</div>';
  }

  if(!statsResp.length && !playersResp.length) {
    html += '<div style="color:var(--t3);font-size:10px;text-align:center;padding:8px;">Stats non disponibles pour ce match</div>';
  }

  html += '</div>';
  zone.innerHTML = html;
}

function renderDetailMatch(modal, m, matchId) {
  // Utiliser regularTime si dispo (exclut TAB), sinon fullTime
  var hg = m.score&&m.score.regularTime ? (m.score.regularTime.home||0) : ((m.score&&m.score.regularTime?m.score.regularTime.home:m.score&&m.score.fullTime?m.score.fullTime.home:0)||0);
  var ag = m.score&&m.score.regularTime ? (m.score.regularTime.away||0) : ((m.score&&m.score.regularTime?m.score.regularTime.away:m.score&&m.score.fullTime?m.score.fullTime.away:0)||0);
  var hgHT = m.score&&m.score.halfTime ? (m.score.halfTime.home||0) : null;
  var agHT = m.score&&m.score.halfTime ? (m.score.halfTime.away||0) : null;
  // Détecter tirs aux buts
  var hasPenalties = m.score&&m.score.penalties&&(m.score.penalties.home!==null);
  var penHome = hasPenalties ? m.score.penalties.home : null;
  var penAway = hasPenalties ? m.score.penalties.away : null;
  var homeName = m.homeTeam&&m.homeTeam.name||'?';
  var awayName = m.awayTeam&&m.awayTeam.name||'?';
  var homeCrest = m.homeTeam&&m.homeTeam.crest||'';
  var awayCrest = m.awayTeam&&m.awayTeam.crest||'';
  var won = hg>ag, draw = hg===ag;
  var rc = won?'#1ed760':draw?'#f0b020':'#ff4545';
  var d = new Date(m.utcDate);
  var dateStr = d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  var comp = m.competition&&m.competition.name||'';
  var journee = m.matchday ? 'J'+m.matchday : '';
  var stade = m.venue||'';
  var arbitre = m.referees&&m.referees.length ? m.referees[0].name : '';
  var goals = (m.goals||[]).sort(function(a,b){return (a.minute||0)-(b.minute||0);});
  var bookings = (m.bookings||[]).sort(function(a,b){return (a.minute||0)-(b.minute||0);});

  var html = '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:16px;padding:20px;max-width:440px;width:100%;max-height:85vh;overflow-y:auto;">';

  // Header fermer
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">';
  html += '<div style="font-size:10px;color:var(--t3);">'+getCompIcon(comp)+' '+comp+(journee?' · '+journee:'')+'</div>';
  html += '<button onclick="document.getElementById(\'match-detail-modal\').style.display=\'none\'" style="background:rgba(255,255,255,.06);border:1px solid var(--b2);border-radius:6px;color:var(--t2);font-size:11px;padding:4px 10px;cursor:pointer;">✕</button>';
  html += '</div>';

  // Score principal
  html += '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:8px;">';
  // Dom
  html += '<div style="text-align:center;">';
  if(homeCrest) html += '<img src="'+homeCrest+'" style="width:40px;height:40px;object-fit:contain;margin-bottom:4px;" loading="lazy">';
  html += '<div style="font-size:11px;font-weight:700;color:var(--t1);">'+homeName+'</div></div>';
  // Score
  html += '<div style="text-align:center;">';
  html += '<div style="font-size:36px;font-weight:900;color:'+rc+';">'+hg+' - '+ag+'</div>';
  if(hasPenalties) html += '<div style="font-size:11px;font-weight:700;color:var(--gold);margin-top:2px;">TAB: '+penHome+' - '+penAway+'</div>';
  if(hgHT!==null) html += '<div style="font-size:10px;color:var(--t3);">(MT: '+hgHT+' - '+agHT+')</div>';
  html += '<div style="font-size:9px;color:var(--t3);margin-top:2px;">'+dateStr+'</div>';
  if(stade) html += '<div style="font-size:9px;color:var(--t3);margin-top:2px;">🏟️ '+stade+'</div>';
  if(arbitre) html += '<div style="font-size:9px;color:var(--t3);margin-top:2px;">⚽ Arbitre : '+arbitre+'</div>';
  html += '</div>';
  // Ext
  html += '<div style="text-align:center;">';
  if(awayCrest) html += '<img src="'+awayCrest+'" style="width:40px;height:40px;object-fit:contain;margin-bottom:4px;" loading="lazy">';
  html += '<div style="font-size:11px;font-weight:700;color:var(--t1);">'+awayName+'</div></div>';
  html += '</div>';

  // Buts
  if(!goals.length && !bookings.length) {
    html += '<div style="background:rgba(255,255,255,.03);border-radius:10px;padding:12px;margin-bottom:8px;text-align:center;color:var(--t3);font-size:11px;">Détail des buts non disponible sur ce plan</div>';
  }
  if(goals.length) {
    html += '<div style="background:rgba(255,255,255,.03);border-radius:10px;padding:12px;margin-bottom:8px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">⚽ Buts</div>';
    goals.forEach(function(g){
      var isHome = g.team&&g.team.id===m.homeTeam.id;
      var scorer = g.scorer&&g.scorer.name||'?';
      var assist = g.assist&&g.assist.name||'';
      var min = g.minute||'?';
      var type = g.type||'REGULAR';
      var typeIco = type==='PENALTY'?'🎯':type==='OWN_GOAL'?'🙈':'⚽';
      html += '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);">';
      if(isHome) {
        html += '<div style="flex:1;text-align:right;"><div style="font-size:11px;font-weight:700;color:var(--t1);">'+scorer+'</div>';
        if(assist) html += '<div style="font-size:9px;color:var(--t3);">p. '+assist+'</div>';
        html += '</div>';
        html += '<div style="font-size:11px;font-weight:800;color:#f0b020;min-width:32px;text-align:center;">'+min+"'</div>";
        html += '<div style="font-size:14px;min-width:20px;">'+typeIco+'</div>';
        html += '<div style="flex:1;"></div>';
      } else {
        html += '<div style="flex:1;"></div>';
        html += '<div style="font-size:14px;min-width:20px;">'+typeIco+'</div>';
        html += '<div style="font-size:11px;font-weight:800;color:#f0b020;min-width:32px;text-align:center;">'+min+"'</div>";
        html += '<div style="flex:1;"><div style="font-size:11px;font-weight:700;color:var(--t1);">'+scorer+'</div>';
        if(assist) html += '<div style="font-size:9px;color:var(--t3);">p. '+assist+'</div>';
        html += '</div>';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  // Cartons
  if(bookings.length) {
    html += '<div style="background:rgba(255,255,255,.03);border-radius:10px;padding:12px;margin-bottom:8px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">🟨 Cartons</div>';
    bookings.forEach(function(b){
      var isHome = b.team&&b.team.id===m.homeTeam.id;
      var player = b.player&&b.player.name||'?';
      var min = b.minute||'?';
      var card = b.card||'YELLOW';
      var cardIco = card==='RED'?'🟥':card==='YELLOW_RED'?'🟥🟨':'🟨';
      html += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;">';
      if(isHome) {
        html += '<div style="flex:1;text-align:right;font-size:11px;font-weight:700;color:var(--t1);">'+player+'</div>';
        html += '<div style="font-size:10px;color:var(--t3);min-width:32px;text-align:center;">'+min+"'</div>";
        html += '<div style="font-size:14px;">'+cardIco+'</div><div style="flex:1;"></div>';
      } else {
        html += '<div style="flex:1;"></div>';
        html += '<div style="font-size:14px;">'+cardIco+'</div>';
        html += '<div style="font-size:10px;color:var(--t3);min-width:32px;text-align:center;">'+min+"'</div>";
        html += '<div style="flex:1;font-size:11px;font-weight:700;color:var(--t1);">'+player+'</div>';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  // Stats rapides
  var total = hg+ag;
  html += '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">';
  [{l:'Total buts',v:total,c:'#f0b020'},{l:'MT '+hgHT+'-'+agHT,v:'',c:'#4d84ff'},{l:total>2.5?'O2.5 ✅':'U2.5',v:'',c:total>2.5?'#1ed760':'#22d3ee'},{l:hg>0&&ag>0?'BTS ✅':'No BTS',v:'',c:hg>0&&ag>0?'#a78bfa':'#4f5d88'}].forEach(function(s){
    if(s.v===''&&s.l.indexOf('null')>=0) return;
    html += '<div style="background:rgba(255,255,255,.04);border-radius:8px;padding:6px 10px;text-align:center;"><div style="font-size:11px;font-weight:700;color:'+s.c+';">'+(s.v!==''?s.v:'')+s.l+'</div></div>';
  });
  html += '</div>';

  // Boutons résumé externe
  var d2 = new Date(m.utcDate);
  var dateQuery = d2.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
  var query = encodeURIComponent(homeName+' '+awayName+' '+dateQuery+' résumé');
  var sofaQuery = encodeURIComponent(homeName+' '+awayName+' sofascore');
  var googleUrl = 'https://www.google.com/search?q='+query;
  var sofaUrl2  = 'https://www.google.com/search?q='+sofaQuery;

  var ytMatchUrl = 'https://www.youtube.com/results?search_query='+encodeURIComponent(homeName+' '+awayName+' '+d2.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})+' buts résumé highlights');

  html += '<div style="display:flex;gap:8px;margin-top:12px;">';
  html += '<a href="'+sofaUrl2+'" target="_blank" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;background:rgba(255,107,54,.15);border:1px solid rgba(255,107,54,.3);border-radius:10px;text-decoration:none;color:#ff7b54;font-size:12px;font-weight:700;">⚡ Sofascore</a>';
  html += '<a href="'+googleUrl+'" target="_blank" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;background:rgba(77,132,255,.15);border:1px solid rgba(77,132,255,.3);border-radius:10px;text-decoration:none;color:#4d84ff;font-size:12px;font-weight:700;">🔍 Résumé</a>';
  html += '</div>';
  html += '<div style="margin-top:8px;">';
  html += '<a href="'+ytMatchUrl+'" target="_blank" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;background:rgba(255,0,0,.15);border:1px solid rgba(255,0,0,.3);border-radius:10px;text-decoration:none;color:#ff4545;font-size:12px;font-weight:700;box-sizing:border-box;">▶️ Voir les buts sur YouTube</a>';

  // Bouton stats joueurs si api-sports disponible
  if(getApiSportsKey()) {
    html += '<button onclick="chargerStatsMatchApiSports(\''+matchId+'\',\''+homeName.replace(/'/g,"\\'")+'\')" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;background:rgba(30,215,96,.1);border:1px solid rgba(30,215,96,.25);border-radius:10px;color:#1ed760;font-size:12px;font-weight:700;cursor:pointer;margin-top:8px;box-sizing:border-box;">👤 Stats joueurs & xG</button>';
    html += '<div id="match-player-stats-'+matchId+'"></div>';
  }
  html += '</div>';

  html += '</div>';
  modal.innerHTML = html;
}

function toggleQuickStat(btn) {
  var stat = btn.dataset.qs;
  if(!window._quickStats) window._quickStats = ['O2.5','BTS'];
  var i = window._quickStats.indexOf(stat);
  if(i>=0) window._quickStats.splice(i,1);
  else window._quickStats.push(stat);
  loadTeamSaisons();
}


function renderScorersList(scorers, teamId, title, highlightTeam) {
  if(!scorers||!scorers.length) return '<div style="color:var(--t3);font-size:10px;text-align:center;padding:8px;">Aucune donnée</div>';
  var html = title ? '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">'+title+'</div>' : '';
  html += '<div style="display:flex;flex-direction:column;gap:3px;">';
  scorers.slice(0,20).forEach(function(sc,i){
    var p = sc.player;
    var goals = sc.goals||0;
    var assists = sc.assists||0;
    var nat = p&&p.nationality||'';
    var natCode = FLAG_CDN[nat]||null;
    var clubCrest = sc.team&&sc.team.crest||'';
    var isOur = highlightTeam && sc.team && sc.team.id===teamId;
    html += '<div style="display:flex;align-items:center;gap:7px;padding:7px 10px;background:'+(isOur?'rgba(77,132,255,.1)':'rgba(255,255,255,.02)')+';border-radius:8px;border:1px solid '+(isOur?'rgba(77,132,255,.3)':'rgba(255,255,255,.05)')+'">';
    // Rang
    html += '<div style="font-size:10px;font-weight:700;color:'+(i===0?'#f0b020':i===1?'#aaa':i===2?'#cd7f32':'#4f5d88')+';width:16px;text-align:center;flex-shrink:0;">'+(i+1)+'</div>';
    // Drapeau nationalité
    if(natCode) html += '<img src="https://flagcdn.com/w20/'+natCode+'.png" style="width:18px;height:12px;object-fit:cover;border-radius:2px;flex-shrink:0;" loading="lazy" title="'+nat+'">';
    else html += '<div style="width:18px;height:12px;flex-shrink:0;"></div>';
    // Nom + club
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="font-size:11px;font-weight:'+(isOur?'800':'600')+';color:'+(isOur?'#4d84ff':'var(--t1)')+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(p&&p.name||'?')+'</div>';
    if(sc.team) {
      html += '<div style="display:flex;align-items:center;gap:4px;margin-top:1px;">';
      if(clubCrest) html += '<img src="'+clubCrest+'" style="width:12px;height:12px;object-fit:contain;" loading="lazy">';
      html += '<div style="font-size:9px;color:var(--t3);">'+sc.team.shortName+'</div>';
      html += '</div>';
    }
    html += '</div>';
    // Stats
    html += '<div style="display:flex;gap:8px;align-items:center;flex-shrink:0;">';
    html += '<div style="text-align:center;min-width:26px;"><div style="font-size:14px;font-weight:900;color:#1ed760;">'+goals+'</div><div style="font-size:8px;color:var(--t3);">⚽</div></div>';
    if(assists>0) html += '<div style="text-align:center;min-width:26px;"><div style="font-size:14px;font-weight:900;color:#4d84ff;">'+assists+'</div><div style="font-size:8px;color:var(--t3);">🅰️</div></div>';
    html += '</div></div>';
  });
  html += '</div>';
  return html;
}

async function _loadScorers(el) {
  var nom = el.dataset.nom;
  var s = el.dataset.saison;
  el.innerHTML = '<div style="color:var(--t3);font-size:11px;text-align:center;padding:12px;">⏳ Chargement buteurs...</div>';

  var teamId = null;
  for(var k in TEAM_IDS){ if(k.toLowerCase()===nom.toLowerCase()||(nom.toLowerCase().indexOf(k.toLowerCase())>=0)){teamId=TEAM_IDS[k];break;} }
  if(!teamId){ el.innerHTML='<div style="color:var(--t3);font-size:10px;text-align:center;">Équipe non reconnue</div>'; return; }

  var cached = _saisonsCache && _saisonsCache[teamId] && _saisonsCache[teamId][s];
  var leagueCode = null;
  var euCodes = [];
  if(cached) {
    var LEAGUE_CODES = ['PL','PD','BL1','SA','FL1','PPL'];
    var EU_CODES = ['CL','EL','ECL'];
    for(var i=0;i<cached.length;i++){
      var c = cached[i].competition && cached[i].competition.code;
      if(c && LEAGUE_CODES.indexOf(c)>=0 && !leagueCode) leagueCode=c;
      if(c && EU_CODES.indexOf(c)>=0 && euCodes.indexOf(c)<0) euCodes.push(c);
    }
  }
  if(!leagueCode){ el.innerHTML='<div style="color:var(--t3);font-size:10px;text-align:center;">Ligue non disponible</div>'; return; }

  try {
    // 1 seule requête — top scorers du championnat
    var data = await fdFetch('/v4/competitions/'+leagueCode+'/scorers?season='+s+'&limit=50');
    if(!data||!data.scorers){ el.innerHTML='<div style="color:var(--t3);font-size:10px;text-align:center;">Données non disponibles</div>'; return; }

    var allScorers = data.scorers;
    var teamScorers = allScorers.filter(function(sc){ return sc.team && sc.team.id===teamId; });
    var compName = data.competition&&data.competition.name||'Championnat';

    var html = '<div style="display:flex;flex-direction:column;gap:10px;">';

    // Section 1 — Buteurs du club
    if(teamScorers.length) {
      html += '<div class="cwrap">';
      html += renderScorersList(teamScorers, teamId, '⚽ '+nom+' — Buteurs & passeurs', false);
      html += '</div>';
    }

    // Section 2 — Top 20 championnat
    html += '<div class="cwrap">';
    html += '<div id="champ-scorers-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;">🏆 Top buteurs — '+compName+'</div>';
    html += '</div>';
    html += renderScorersList(allScorers, teamId, '', true);
    html += '</div>';

    // Section 3 — Coupe d'Europe (requête séparée si disponible)
    if(euCodes.length) {
      html += '<div class="cwrap" id="eu-scorers-section">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">⭐ Coupe d\'Europe</div>';
      html += '<div id="eu-scorers-content" style="font-size:10px;color:var(--t3);text-align:center;padding:8px;cursor:pointer;background:rgba(255,255,255,.03);border-radius:6px;" onclick="_loadEuScorers(this,\''+euCodes[0]+'\',\''+s+'\','+teamId+')">⭐ Charger top buteurs Coupe d\'Europe →</div>';
      html += '</div>';
    }

    html += '</div>';
    el.outerHTML = html;

  } catch(e) {
    el.innerHTML = '<div style="color:var(--t3);font-size:10px;text-align:center;">Erreur : '+e.message+'</div>';
  }
}

async function _loadEuScorers(el, code, saison, teamId) {
  el.innerHTML = '⏳ Chargement...';
  try {
    var data = await fdFetch('/v4/competitions/'+code+'/scorers?season='+saison+'&limit=30');
    if(!data||!data.scorers){ el.innerHTML='<div style="color:var(--t3);font-size:10px;text-align:center;">Non disponible</div>'; return; }
    el.outerHTML = renderScorersList(data.scorers, teamId, '', true);
  } catch(e) {
    el.innerHTML = '<div style="color:var(--t3);font-size:10px;">Erreur</div>';
  }
}

async function _loadStd(el) {
  var nom = el.dataset.nom;
  var teamId = parseInt(el.dataset.tid);
  var saison = el.dataset.saison;
  el.innerHTML = '⏳ Chargement...';
  // Récupérer les matchs depuis le cache saison
  var matches = (_saisonsCache && _saisonsCache[teamId] && _saisonsCache[teamId][saison]) || [];
  var data = await loadStandings(nom, teamId, matches);
  if(data) {
    _standingsCache[nom+'_'+saison] = data;
    el.outerHTML = renderStandingsTable(data, teamId);
  } else {
    el.innerHTML = '<div style="color:var(--t3);font-size:10px;text-align:center;">Non disponible</div>';
  }
}

var FLAG_CDN={
  'France':'fr','Espagne':'es','Allemagne':'de','Angleterre':'gb-eng',
  'Italie':'it','Portugal':'pt','Brésil':'br','Argentine':'ar',
  'Pays-Bas':'nl','Belgique':'be','Croatie':'hr','Maroc':'ma',
  'Sénégal':'sn','Colombie':'co','Uruguay':'uy','Japon':'jp',
  'Suisse':'ch','Norvège':'no','Danemark':'dk','Mexique':'mx',
  'Canada':'ca','États-Unis':'us','Australie':'au','Iran':'ir',
  'Corée du Sud':'kr','Équateur':'ec','Autriche':'at','Algérie':'dz',
  'Égypte':'eg','Qatar':'qa','Tunisie':'tn','Ghana':'gh',
  'Arabie saoudite':'sa','Arabie Saoudite':'sa','Jordanie':'jo',
  'Nouvelle-Zélande':'nz','Panama':'pa','Suède':'se','Ukraine':'ua',
  'Turquie':'tr','Irak':'iq','Bolivie':'bo','Suriname':'sr',
  'Écosse':'gb-sct','Paraguay':'py','Haïti':'ht','Afrique du Sud':'za',
  'Cap-Vert':'cv','Curaçao':'cw','RD Congo':'cd','Ouzbékistan':'uz',
  'Bosnie-Herzégovine':'ba','Tchéquie':'cz','Irlande':'ie',
  'Pays de Galles':'gb-wls','Pologne':'pl','Serbie':'rs','Roumanie':'ro',
  'Slovaquie':'sk','Hongrie':'hu','Grèce':'gr','Côte d\'Ivoire':'ci',
  'Cameroun':'cm','Nigéria':'ng','Mali':'ml','Burkina Faso':'bf',
  'Guinée':'gn','Chili':'cl','Pérou':'pe','Venezuela':'ve',
  'Costa Rica':'cr','Honduras':'hn','Jamaïque':'jm','Guatemala':'gt',
  'Russie':'ru','Chine':'cn','Inde':'in','Islande':'is',
  'Finlande':'fi','Albanie':'al','Monténégro':'me','Géorgie':'ge',
  'Kazakhstan':'kz','Slovénie':'si','Azerbaïdjan':'az'
};
function flagUrl(name){ var c=FLAG_CDN[name]||FLAG_CDN[name.trim()]; return c?'https://flagcdn.com/w40/'+c+'.png':null; }
function flagImg(name,sz){sz=sz||20;var c=FLAG_CDN[name]||FLAG_CDN[(name||"").trim()];if(!c)return '';return '<img src="https://flagcdn.com/w40/'+c+'.png" style="width:'+sz+'px;height:'+(sz*.67)+'px;object-fit:cover;border-radius:2px;vertical-align:middle;margin-right:4px;" loading="lazy">';}
var FLAG_EMOJIS={
  'France':'🇫🇷','Espagne':'🇪🇸','Allemagne':'🇩🇪','Angleterre':'🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Italie':'🇮🇹','Portugal':'🇵🇹','Brésil':'🇧🇷','Argentine':'🇦🇷',
  'Pays-Bas':'🇳🇱','Belgique':'🇧🇪','Croatie':'🇭🇷','Maroc':'🇲🇦',
  'Sénégal':'🇸🇳','Colombie':'🇨🇴','Uruguay':'🇺🇾','Japon':'🇯🇵',
  'Suisse':'🇨🇭','Norvège':'🇳🇴','Danemark':'🇩🇰','Mexique':'🇲🇽',
  'Canada':'🇨🇦','États-Unis':'🇺🇸','Australie':'🇦🇺','Iran':'🇮🇷',
  'Corée du Sud':'🇰🇷','Équateur':'🇪🇨','Autriche':'🇦🇹','Algérie':'🇩🇿',
  'Égypte':'🇪🇬','Qatar':'🇶🇦','Tunisie':'🇹🇳','Ghana':'🇬🇭',
  'Arabie saoudite':'🇸🇦','Jordanie':'🇯🇴','Nouvelle-Zélande':'🇳🇿',
  'Panama':'🇵🇦','Suède':'🇸🇪','Ukraine':'🇺🇦','Turquie':'🇹🇷',
  'Irak':'🇮🇶','Bolivie':'🇧🇴','Suriname':'🇸🇷','Écosse':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Paraguay':'🇵🇾','Haïti':'🇭🇹','Afrique du Sud':'🇿🇦','Cap-Vert':'🇨🇻',
  'Curaçao':'🇨🇼','RD Congo':'🇨🇩','Ouzbékistan':'🇺🇿','Bosnie-Herzégovine':'🇧🇦',
  'Tchéquie':'🇨🇿','Irlande':'🇮🇪','Nouvelle-Zélande':'🇳🇿','Pays de Galles':'🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Pologne':'🇵🇱','Serbie':'🇷🇸','Roumanie':'🇷🇴','Slovaquie':'🇸🇰',
  'Hongrie':'🇭🇺','Grèce':'🇬🇷','Côte d\'Ivoire':'🇨🇮','Cameroun':'🇨🇲',
  'Nigéria':'🇳🇬','Mali':'🇲🇱','Burkina Faso':'🇧🇫','Guinée':'🇬🇳',
  'Chili':'🇨🇱','Pérou':'🇵🇪','Venezuela':'🇻🇪','États-Unis':'🇺🇸',
  'Costa Rica':'🇨🇷','Honduras':'🇭🇳','Jamaïque':'🇯🇲','Guatemala':'🇬🇹',
  'Arabie Saoudite':'🇸🇦','Asie':'🌏','Afrique':'🌍'
};
var SPORT_EMOJIS={
  'basket':'🏀','basketball':'🏀','nba':'🏀',
  'tennis':'🎾',
  'formule 1':'🏎️','formula 1':'🏎️','f1':'🏎️','formule1':'🏎️',
  'rugby':'🏉','rugby union':'🏉',
  'au nrl':'🏉','nrl':'🏉',
  'hockey':'🏒','nhl':'🏒',
  'baseball':'⚾','mlb':'⚾',
  'nfl':'🏈','football américain':'🏈','football americain':'🏈',
  'football':'⚽','foot':'⚽','soccer':'⚽',
  'golf':'⛳',
  'mma':'🥊','ufc':'🥊','boxe':'🥊',
  'natation':'🏊','cyclisme':'🚴','athlétisme':'🏃'
};
function logoHtml(name,color,abbr,sz){
  var s=sz||46;
  var fb=abbr||(name.substring(0,3).toUpperCase());
  var rgb=hexRgb(color);
  var baseStyle='width:'+s+'px;height:'+s+'px;border-radius:50%;flex-shrink:0;overflow:hidden;';

  // 1. Vrai drapeau flagcdn en priorité pour les nations
  var flagUrl2=flagUrl(name);
  if(flagUrl2){
    var fDiv='<div style="'+baseStyle+'background:rgba('+rgb+',.08);border:1px solid rgba('+rgb+',.2);display:flex;align-items:center;justify-content:center;overflow:hidden;">';
    fDiv+='<img src="'+flagUrl2+'" style="width:100%;height:100%;object-fit:cover;" loading="lazy">';
    fDiv+='</div>';
    return fDiv;
  }

  // 2. Logo URL si disponible
  var logo=LOGOS[name];
  if(logo){
    return '<div style="'+baseStyle+'background:rgba('+rgb+',.07);border:1px solid rgba('+rgb+',.18);display:flex;align-items:center;justify-content:center;">'
      +'<img src="'+logo+'" style="width:'+(s-10)+'px;height:'+(s-10)+'px;object-fit:contain;" loading="lazy" onerror="logoErr(this)">'
      +'<span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:'+color+';">'+fb+'</span>'
      +'</div>';
  }

  // 3. Emoji sport générique
  var sportEmoji=SPORT_EMOJIS[name.toLowerCase().trim()];
  if(!sportEmoji){
    var uMatch=(typeof state!=='undefined'&&state.u)?state.u.find(function(u){return u.n===name;}):null;
    if(uMatch&&uMatch.sport){
      var sportMap={'🏀':'🏀','🎾':'🎾','🏎':'🏎️','🏎️':'🏎️','🏉':'🏉','🏉🇦🇺':'🏉','🏒':'🏒','⚾':'⚾','🏈':'🏈','⚽':'⚽'};
      sportEmoji=sportMap[uMatch.sport];
    }
  }
  if(sportEmoji){
    var eSz=Math.round(s*.56);
    return '<div style="'+baseStyle+'background:rgba('+rgb+',.14);border:1px solid rgba('+rgb+',.28);display:flex;align-items:center;justify-content:center;font-size:'+eSz+'px;">'+sportEmoji+'</div>';
  }

  // 4. Fallback abbr
  return '<div style="'+baseStyle+'background:rgba('+rgb+',.14);border:1px solid rgba('+rgb+',.28);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:'+color+';">'+fb+'</div>';
}
function hexRgb(h){
  var r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
  return r+','+g+','+b;
}

/* ── PRESET TEAMS ── */
var PRESETS=[
  {n:"Bayern Munich",abbr:"FCB",color:"#dc2626",s:"4",sport:"⚽"},
  {n:"Boca Juniors", abbr:"BJR",color:"#f0b020",s:"3",sport:"⚽"},
  {n:"France",       abbr:"FRA",color:"#3b82f6",s:"4",sport:"⚽"},
  {n:"Inter Milan",  abbr:"INT",color:"#0ea5e9",s:"4",sport:"⚽"},
  {n:"Lyon",         abbr:"OL", color:"#c8a050",s:"3",sport:"⚽"},
  {n:"Palmeiras",    abbr:"PAL",color:"#22c55e",s:"3",sport:"⚽"},
  {n:"PSG",          abbr:"PSG",color:"#c8a050",s:"4",sport:"⚽"},
  {n:"PSV",          abbr:"PSV",color:"#ef4444",s:"3",sport:"⚽"},
  {n:"Real Madrid",  abbr:"RMA",color:"#94a3b8",s:"5",sport:"⚽"},
  {n:"Carolina Hurricanes",abbr:"CAR",color:"#cc0000",s:"3",sport:"🏒"},
  {n:"Colorado Avalanche", abbr:"COL",color:"#7c3aed",s:"3",sport:"🏒"},
  {n:"LA Dodgers",   abbr:"LAD",color:"#3b82f6",s:"3",sport:"⚾"}
];

/* ── STATE ── */
var state=JSON.parse(localStorage.getItem('g45v5'))||{b:{},u:[],h:[],a:[],start_bk:0,goal:0,ugoals:{},notes:{},bkColors:{}};
if(!state.ugoals)state.ugoals={};
if(!state.notes)state.notes={};
DEF_BK.forEach(function(k){if(state.b[k]===undefined)state.b[k]=0;});
PRESETS.forEach(function(pt){
  if(!state.u.find(function(u){return u.n===pt.n;}))
    state.u.push({n:pt.n,abbr:pt.abbr,color:pt.color,s:pt.s,l:1,sport:pt.sport,preset:true});
});

var STRATS={"1":[1,2,6,18,54,162,486,1458],"2":[2,4,12,36,108,324,972,2916],"3":[2,4,12,36,108,324,972,2916],"4":[5,10,30,90,270,810,2430,7290],"5":[10,20,60,180,540,1620,4860,14580]};
var PCOLS=["#4d84ff","#1ed760","#f59e0b","#a855f7","#22d3ee","#f97316","#ef4444","#ec4899","#14b8a6","#6366f1","#84cc16","#e879f9"];
/* Palette étendue pour courbes - couleurs vraiment distinctes */
var CURVE_COLS=["#4d84ff","#1ed760","#f59e0b","#a855f7","#ef4444","#22d3ee","#f97316","#ec4899","#14b8a6","#84cc16","#e879f9","#6366f1","#fbbf24","#34d399","#fb7185","#60a5fa"];
var selColor=PCOLS[0];
var AC={},GC=null,MC={},_currentTeam="";
var bilanSport='ALL';

/* ── INFO BAR MOBILE ── */
function updateInfoBar(barId, txtId, valId, label, val, color){
  var bar=$i(barId);var txt=$i(txtId);var v=$i(valId);
  if(!bar||!txt||!v)return;
  bar.style.display='flex';
  txt.textContent=label||'';
  v.textContent=val||'';
  v.style.color=color||'var(--t1)';
}

function attachTouchTooltip(canvas, chartRef, barId, txtId, valId){
  if(typeof canvas==='string'){var canvasId=canvas;canvas=$i(canvas);}
  if(!canvas)return;
  canvas.addEventListener('touchend',function(e){
    var chart=typeof chartRef==='function'?chartRef():chartRef;
    if(!chart)return;
    /* Résoudre les éléments DOM dynamiquement au moment du touch */
    var bar=$i(barId);var txt=$i(txtId);var v=$i(valId);
    var t=e.changedTouches[0];
    var r=canvas.getBoundingClientRect();
    var x=t.clientX-r.left;
    var y=t.clientY-r.top;
    try{
      var pts=chart.getElementsAtEventForMode({offsetX:x,offsetY:y},'nearest',{intersect:false},false);
      if(pts.length){
        var idx=pts[0].index;
        var ds=chart.data.datasets[pts[0].datasetIndex];
        var lbl=chart.data.labels?chart.data.labels[idx]:'';
        var val2=ds.data[idx];
        var parts=(lbl||'').split('||');
        var mainTxt=parts[0]||'Pari '+(idx+1);
        var gainTxt=parts[1]||(val2!==null?(val2>=0?'+':'')+parseFloat(val2).toFixed(2)+'€':'');
        if(chart.data.datasets.length>1){
          gainTxt=chart.data.datasets.map(function(d){
            var vv=d.data[idx];
            return vv!==null?d.label+' '+(vv>=0?'+':'')+parseFloat(vv).toFixed(2)+'€':'';
          }).filter(Boolean).join(' · ');
        }
        var col=val2>=0?'var(--g)':'var(--r)';
        if(bar&&txt&&v){
          bar.style.display='flex';
          txt.textContent=mainTxt;
          v.textContent=gainTxt;
          v.style.color=col;
        }
      }
    }catch(err){console.log(err);}
  },{passive:true});
}
var bilanMode='global';
function showBilanTab(mode,btn){
  bilanMode=mode;
  var outils=$i('t-outils');
  if(outils)outils.querySelectorAll('.gtab').forEach(function(b){if(b.id&&b.id.startsWith('btab-'))b.classList.remove('on');});
  if(btn)btn.classList.add('on');
  renderBilanTab();
}
var dtRows=[{c:2.0},{c:3.0}];

/* ── PALETTE ── */
function pal(hex){
  var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return{bg:'rgba('+r+','+g+','+b+',.08)',badge:'rgba('+r+','+g+','+b+',.14)',border:'rgba('+r+','+g+','+b+',.28)',c:hex,fade:'rgba('+r+','+g+','+b+',.12)'};
}
function gp(u){return pal(u.color||PCOLS[0]);}

/* ── UTILS ── */
function $i(id){return document.getElementById(id);}
function txt(id,v){var e=$i(id);if(e)e.innerText=v;}
function today(){return new Date().toISOString().split('T')[0];}
function setDates(){['c-date','n-date'].forEach(function(id){var e=$i(id);if(e&&!e.value)e.value=today();});}
function fmt(v){return(v>=0?'+':'')+v.toFixed(2)+'€';}
function streak(paris){if(!paris.length)return{n:0,t:null};var t=paris[0].win,c=0;for(var i=0;i<paris.length;i++){if(paris[i].win===t)c++;else break;}return{n:c,t:t};}

/* ── FORME ── */
function formeHtml(paris,n){
  var last=paris.slice(0,n||5);
  if(!last.length)return '';
  var d=last.map(function(p){return '<div class="fp '+(p.win?'fw':'fl')+'">'+(p.win?'W':'L')+'</div>';}).join('');
  return '<div class="forme-row">'+d+'</div>';
}

/* ── SAVE (ne fait QUE sauvegarder + render, pas de boucle) ── */
function save(){
  localStorage.setItem('g45v5',JSON.stringify(state));
  render();
}

/* ── CRASH SIMULATOR (autonome, pas dans render) ── */
function renderCrash(){
  var uSel=$i('c-unit');
  if(!uSel||!uSel.value){return;}
  var u=state.u.find(function(x){return x.n===uSel.value;});
  if(!u){$i('crash-grid').innerHTML='<div style="color:var(--t3);font-size:11px;grid-column:span 4;text-align:center;padding:8px;">Paliers N/A</div>';return;}
  var s=String(u.s||1);
  var strat=STRATS[s]||STRATS["1"];
  var cote=getMmCote?getMmCote():1.5;
  var total=Object.values(state.b).reduce(function(a,v){return a+parseFloat(v||0);},0);
  var html='';
  var alertMsg='';
  for(var i=0;i<strat.length;i++){
    var mise=strat[i];
    var gain=(mise*cote-mise).toFixed(2);
    var pct=total>0?(mise/total*100):0;
    var cls=pct>15?'danger':pct>8?'warning':'safe';
    var active=(i===u.l-1);
    if(active&&pct>15){alertMsg='⚠ Palier P'+(i+1)+' : '+mise+'€ = '+pct.toFixed(1)+'% du capital — risque élevé !';}
    html+='<div class="cc '+cls+'"'+(active?' style="outline:2px solid var(--a);outline-offset:2px;"':'')+''
      +'><div class="cc-l">P'+(i+1)+(active?' ◀':'')+''+'</div>'
      +'<div class="cc-v" style="color:'+(cls==='danger'?'var(--r)':cls==='warning'?'var(--gold)':'var(--g)')+';">'+mise+'€</div>'
      +'<div class="cc-g">+'+gain+'€</div></div>';
  }
  $i('crash-grid').innerHTML=html;
  var al=$i('crash-alert');
  if(al){
    if(alertMsg){al.classList.add('show');$i('crash-txt').innerText=alertMsg;}
    else{al.classList.remove('show');}
  }
}

/* ── SUREBET ── */
var sbRows=[{c:2.10},{c:2.05}];
function buildSbRows(){
  var tot=parseFloat(($i('sb-tot')&&$i('sb-tot').value)||100);
  var gorr=$i('sb-gorr')&&$i('sb-gorr').checked;
  var impl=sbRows.reduce(function(a,r){return a+1/(r.c||1);},0);
  var dr=$i('sb-rows');if(!dr)return;
  dr.innerHTML=sbRows.map(function(r,i){
    return '<div class="dutch-row">'
      +'<input type="number" class="fi" value="'+r.c+'" step="0.01" placeholder="Cote '+(i+1)+'" data-idx="'+i+'" oninput="sbRows[this.dataset.idx].c=parseFloat(this.value)||1;buildSbRows();">'
      +(sbRows.length>2?'<button class="udel" data-idx="'+i+'" onclick="sbRows.splice(this.dataset.idx,1);buildSbRows();">✕</button>':'')
      +'</div>';
  }).join('');
  var isSure=impl<1;
  var marge=((1-impl)*100).toFixed(2);
  var pe=$i('sb-marge');
  if(pe){pe.innerText=(isSure?'✅ ':'')+Math.abs(marge)+'%'+(isSure?' (arb!)':'');pe.style.color=isSure?'var(--g)':'var(--t1)';}
  var misesHtml='';
  var profit=0;
  if(impl>0){
    var totEff=gorr?tot*(impl):tot;
    sbRows.forEach(function(r,i){
      var mise=gorr?(tot/impl*(1/(r.c||1))).toFixed(2):(tot/impl*(1/(r.c||1))).toFixed(2);
      var ret=(parseFloat(mise)*(r.c||1)).toFixed(2);
      misesHtml+='<div class="cres-row"><span class="cres-l">Mise '+(i+1)+' (@'+(r.c||1)+')</span><span class="cres-v" style="color:var(--a)">'+mise+'€</span></div>';
    });
    var retour=gorr?(tot/impl+tot).toFixed(2):(tot/impl).toFixed(2);
    profit=gorr?(parseFloat(retour)-tot-tot).toFixed(2):(parseFloat(retour)-tot).toFixed(2);
  }
  var pm=$i('sb-mises');if(pm)pm.innerHTML=misesHtml;
  var pp=$i('sb-profit');
  if(pp){pp.innerText=profit?(isSure||gorr?fmt(parseFloat(profit)):'—'):'—';if(pp.innerText!=='—')pp.style.color=parseFloat(profit)>=0?'var(--g)':'var(--r)';}
}
function calcSb(){buildSbRows();}
function addSbRow(){sbRows.push({c:2.0});buildSbRows();}

/* ── DUTCHING (sans boucle) ── */
function buildDtRows(){
  var tot=parseFloat(($i('dt-tot')&&$i('dt-tot').value)||50);
  var impl=dtRows.reduce(function(a,r){return a+1/(r.c||1);},0);
  var dr=$i('dt-rows');if(!dr)return;
  var html='';
  dtRows.forEach(function(r,i){
    var mise=impl>0?(tot*(1/(r.c||1))/impl).toFixed(2):'—';
    html+='<div class="dutch-row">'
      +'<input type="number" class="fi" value="'+r.c+'" step="0.01" placeholder="Cote '+(i+1)+'" data-idx="'+i+'" oninput="dtRows[this.dataset.idx].c=parseFloat(this.value)||1;buildDtRows();">'
      +'<div class="dutch-mise">'+mise+'€</div>'
      +(dtRows.length>2?'<button class="udel" data-idx="'+i+'" onclick="dtRows.splice(this.dataset.idx,1);buildDtRows();">✕</button>':'')
      +'</div>';
  });
  dr.innerHTML=html;
  /* update result */
  var ret=impl>0?(tot/impl).toFixed(2):'—';
  var profit=impl>0?(tot/impl-tot).toFixed(2):'—';
  txt('dt-ret',ret!='—'?ret+'€':'—');
  var pe=$i('dt-profit');
  if(pe&&profit!='—'){pe.innerText=fmt(parseFloat(profit));pe.style.color=parseFloat(profit)>=0?'var(--g)':'var(--r)';}
}
function calcDt(){buildDtRows();}
function addDtRow(){dtRows.push({c:2.0});buildDtRows();}
function swCalc(m){
  ['sb','dt','lay','vb','arjel'].forEach(function(p){
    var el=$i('calc-'+p);if(el)el.style.display=m===p?'block':'none';
    var btn=$i('ct-'+p);if(btn)btn.classList.toggle('on',m===p);
  });
  if(m==='dt')buildDtRows();
  else if(m==='lay'){calcLay();calcFreebet();}
  else if(m==='vb')calcVb();
  else if(m==='arjel'){buildArjelRows();}
  else calcSb();
}
function calcVb(){
  var prob=parseFloat(($i('vb-prob')&&$i('vb-prob').value)||55);
  var cote=parseFloat(($i('vb-cote')&&$i('vb-cote').value)||2.10);
  var mise=parseFloat(($i('vb-mise')&&$i('vb-mise').value)||10);
  if(!prob||!cote||prob<=0||prob>=100||cote<=1)return;
  var p=prob/100;
  var fair=(1/p).toFixed(3);
  var edge=((p*cote-1)*100).toFixed(2);
  var ev=(p*(cote-1)*mise-(1-p)*mise).toFixed(2);
  var kelly=Math.max(0,(p-(1-p)/(cote-1))*100).toFixed(1);
  txt('vb-fair',fair);
  var ee=$i('vb-edge');if(ee){ee.innerText=edge+'%';ee.style.color=parseFloat(edge)>0?'var(--g)':'var(--r)';}
  var ev2=$i('vb-ev');if(ev2){ev2.innerText=(parseFloat(ev)>=0?'+':'')+ev+'€';ev2.style.color=parseFloat(ev)>=0?'var(--g)':'var(--r)';}
  txt('vb-kelly',kelly+'%');
  var verd=$i('vb-verd');
  if(verd){
    var isV=parseFloat(edge)>0;var isS=parseFloat(edge)>5;
    verd.style.cssText='display:block;padding:10px;border-radius:8px;text-align:center;font-size:13px;font-weight:700;background:'+(isS?'rgba(30,215,96,.1)':isV?'rgba(77,132,255,.1)':'rgba(255,69,69,.1)')+';border:1px solid '+(isS?'rgba(30,215,96,.25)':isV?'rgba(77,132,255,.25)':'rgba(255,69,69,.25)')+';color:'+(isS?'var(--g)':isV?'var(--a)':'var(--r)');
    verd.innerText=isS?'🔥 Value ! +'+edge+'%':isV?'✅ Value +'+edge+'%':'❌ Pas de value';
  }
}
function toggleLayMode(){
  var mode=$i('lay-mode-cible')&&$i('lay-mode-cible').checked;
  var wrap=$i('lay-cible-wrap');if(wrap)wrap.style.display=mode?'block':'none';
  var lbl=$i('lay-mise-label');if(lbl)lbl.textContent=mode?'Mise Back calculée':'Mise Back (€)';
  var bm=$i('lay-back-mise');if(bm)bm.readOnly=mode;if(bm)bm.style.opacity=mode?'.5':'1';
  calcLay();
}
function calcLay(){
  var gorr=$i('lay-gorr')&&$i('lay-gorr').checked;
  var useComm=$i('lay-usecomm')&&$i('lay-usecomm').checked;
  var modeCible=$i('lay-mode-cible')&&$i('lay-mode-cible').checked;
  var modeLiability=$i('lay-liability-mode')&&$i('lay-liability-mode').checked;
  var bc=parseFloat(($i('lay-back-cote')&&$i('lay-back-cote').value)||0);
  var lc=parseFloat(($i('lay-lay-cote')&&$i('lay-lay-cote').value)||0);
  var comm=parseFloat(($i('lay-commission')&&$i('lay-commission').value)||3);
  var commR=useComm?comm/100:0;
  var lr=1+(1-commR)/(lc-1);
  if(!bc||!lc||bc<=1||lc<=1)return;

  // Toggle affichage input
  var stakeGrp=$i('lay-stake-group'); var liabGrp=$i('lay-liability-group');
  if(stakeGrp) stakeGrp.style.display=modeLiability?'none':'block';
  if(liabGrp) liabGrp.style.display=modeLiability?'block':'none';

  var bm,ml,liabML,pbw,plw;
  if(modeLiability){
    // Saisie liability → calcule stake
    var targetLiab=parseFloat(($i('lay-liability-input')&&$i('lay-liability-input').value)||0);
    if(!targetLiab)return;
    ml=targetLiab/(lc-1);
    if(gorr){
      bm=ml*(1-commR);
    } else {
      bm=ml*(lc-commR)/bc;
    }
    var bmEl=$i('lay-back-mise');if(bmEl)bmEl.value=bm.toFixed(2);
  } else if(modeCible){
    ml=parseFloat(($i('lay-lay-mise')&&$i('lay-lay-mise').value)||0);
    if(!ml)return;
    if(gorr){
      bm=ml*(1-commR);
    } else {
      bm=ml*(lc-commR)/bc;
    }
    var bmEl=$i('lay-back-mise');if(bmEl)bmEl.value=bm.toFixed(2);
  } else {
    bm=parseFloat(($i('lay-back-mise')&&$i('lay-back-mise').value)||0);
    if(!bm)return;
    if(gorr){
      ml=bm/(1-commR);
    } else {
      ml=(bm*bc)/(lc-commR);
    }
  }
  liabML=ml*(lc-1);
  if(gorr){
    pbw=(bm*bc)-bm-liabML;
    plw=0;
  } else {
    pbw=(bm*(bc-1))-liabML;
    plw=(ml*(1-commR))-bm;
  }
  var pg=Math.min(pbw,plw);
  var roi=(bm+liabML)>0?(pg/(bm+liabML)*100).toFixed(2):0;
  var lrc=$i('lay-real-cote');if(lrc)lrc.innerText='@'+lr.toFixed(3);
  var ll=$i('lay-liability');if(ll)ll.innerText=liabML.toFixed(2)+'€';
  var lmo=$i('lay-mise-opt');if(lmo){lmo.innerText=ml.toFixed(2)+'€';lmo.style.color='var(--a)';}
  var lpb=$i('lay-profit-back');if(lpb){lpb.innerText=(pbw>=0?'+':'')+pbw.toFixed(2)+'€';lpb.style.color=pbw>=0?'var(--g)':'var(--r)';}
  var lpl=$i('lay-profit-lay');if(lpl){lpl.innerText=(plw>=0?'+':'')+plw.toFixed(2)+'€';lpl.style.color=plw>=0?'var(--g)':'var(--r)';}
  var lpg=$i('lay-profit-garanti');if(lpg){lpg.innerText=(pg>=0?'+':'')+pg.toFixed(2)+'€';lpg.style.color=pg>=0?'var(--g)':'var(--r)';}
  var lroi=$i('lay-roi');if(lroi){lroi.innerText=roi+'%';lroi.style.color=roi>=0?'var(--g)':'var(--r)';}
  var lsb=$i('lay-surebet-bar');
  if(lsb){
    if(pg>0){lsb.style.background='var(--g)';lsb.innerHTML='✅ Surebet confirmée — Profit garanti : '+(pg>=0?'+':'')+pg.toFixed(2)+'€';}
    else{lsb.style.background='rgba(255,69,69,.15)';lsb.innerHTML='✗ Pas de surebet';}
  }
}

function calcFreebet(){
  var fb=parseFloat(($i('fb-amount')&&$i('fb-amount').value)||0);
  var bc=parseFloat(($i('fb-back-cote')&&$i('fb-back-cote').value)||0);
  var lc=parseFloat(($i('fb-lay-cote')&&$i('fb-lay-cote').value)||0);
  var comm=parseFloat(($i('fb-comm')&&$i('fb-comm').value)||3);
  var gorr=$i('fb-gorr')&&$i('fb-gorr').checked;
  if(!fb||!bc||!lc||bc<=1||lc<=1)return;
  var commR2=comm/100;
  /* Surebet classique */
  var ml=((bc-1)*fb)/((lc-1)+(1-commR2));
  var liab=ml*(lc-1);
  var gainIfBack=((bc-1)*fb)-liab;
  var gainIfLay=ml*(1-commR2);
  var cg=Math.min(gainIfBack,gainIfLay);
  var taux=fb>0?(cg/fb*100).toFixed(1):0;
  /* Gagner ou Rembourser */
  var ml2=ml,liab2=liab,gainBack2=gainIfBack,gainLay2=gainIfLay;
  if(gorr){
    ml2=fb/(1-commR2);
    liab2=ml2*(lc-1);
    gainBack2=((bc-1)*fb)-liab2;
    gainLay2=0;
  }
  var cg2=gorr?gainBack2:cg;
  var taux2=fb>0?(cg2/fb*100).toFixed(1):0;
  /* Affichage */
  var flm=$i('fb-lay-mise');if(flm){flm.innerText=(gorr?ml2:ml).toFixed(2)+'€';flm.style.color='var(--a)';}
  var fli=$i('fb-liability');if(fli){fli.innerText=(gorr?liab2:liab).toFixed(2)+'€';fli.style.color='var(--gold)';}
  var fc=$i('fb-cash');if(fc){fc.innerText=(cg>=0?'+':'')+cg.toFixed(2)+'€';fc.style.color=cg>=0?'var(--g)':'var(--r)';}
  var ft=$i('fb-taux');if(ft)ft.innerText=taux+'%';
  var fcg=$i('fb-cash-gorr');if(fcg){fcg.innerText=gorr?(cg2>=0?'+':'')+cg2.toFixed(2)+'€ ('+taux2+'%)':'—';fcg.style.color=cg2>=0?'var(--gold)':'var(--r)';}
}

function renderSportFilter(){
  var sports=['ALL','⚽','🏀','🎾','🏈','⚾','🏒'];
  var labels={'ALL':'Tous','⚽':'Football','🏀':'Basket','🎾':'Tennis','🏈':'NFL','⚾':'Baseball','🏒':'Hockey'};
  var used=new Set(state.a.map(function(h){return h.sport||'';}));
  var sf=$i('sport-filter');if(!sf)return;
  sf.innerHTML=sports.filter(function(s){return s==='ALL'||used.has(s);}).map(function(s){
    return '<button class="sfbtn'+(bilanSport===s?' on':'')+'" onclick="bilanSport=\''+s+'\';renderBilanTab()">'+s+' '+labels[s]+'</button>';
  }).join('');
}
function filteredA(){
  var base=state.a;
  if(bilanMode==='cockpit')base=base.filter(function(h){return h.isS;});
  else if(bilanMode==='simple')base=base.filter(function(h){return !h.isS&&!h.isFlash&&!h.isCombi;});
  else if(bilanMode==='combi')base=base.filter(function(h){return h.isCombi;});
  else if(bilanMode==='flash')base=base.filter(function(h){return h.isFlash;});
  var filtered = bilanSport==='ALL'?base:base.filter(function(h){return h.sport===bilanSport;});
  if(window._bilanBkFilter) filtered=filtered.filter(function(h){return h.b===window._bilanBkFilter;});
  return filtered;
}

/* ── BILAN TAB (autonome) ── */
var _bilanChart=null;
var _advCharts={};

function renderAdvancedCharts(paris, bankroll) {
  // Détruire les anciens charts
  Object.values(_advCharts).forEach(function(c){try{c.destroy();}catch(e){}});
  _advCharts = {};
  if(!paris||!paris.length) return;

  var sorted = paris.slice().sort(function(a,b){ return new Date(a.date+' '+(a.heure||'00:00'))-new Date(b.date+' '+(b.heure||'00:00')); });

  // ── 1. Bankroll totale ──
  var bkTotal = Object.values(bankroll||{}).reduce(function(s,v){return s+parseFloat(v||0);},0);
  var cumProfits = [], cum=0;
  sorted.forEach(function(h){cum+=(h.win?(h.m*h.cote-h.m):-h.m);cumProfits.push(parseFloat(cum.toFixed(2)));});
  var startBk = bkTotal - cum;
  var bkCurve = cumProfits.map(function(p){return parseFloat((startBk+p).toFixed(2));});
  var ctx1 = document.getElementById('chart-bankroll');
  if(ctx1){
    var g1=ctx1.getContext('2d').createLinearGradient(0,0,0,150);
    g1.addColorStop(0,'rgba(240,176,32,.3)');g1.addColorStop(1,'rgba(240,176,32,0)');
    var bkLabels = sorted.map(function(h){
      var adv = h.target&&h.target!=='-'?h.target:'';
      return (h.date||'')+(adv?' · '+adv:'');
    });
    var bkGains = sorted.map(function(h){
      return h.win ? '+'+(h.m*h.cote-h.m).toFixed(2)+'€' : '-'+parseFloat(h.m).toFixed(2)+'€';
    });
    _advCharts.bk=new Chart(ctx1,{type:'line',
      data:{labels:bkLabels,datasets:[{data:bkCurve,borderColor:'#f0b020',backgroundColor:g1,borderWidth:2,fill:true,tension:.4,pointRadius:3,pointBackgroundColor:sorted.map(function(h){return h.win?'#1ed760':'#ff4545';}),pointRadius:4,pointHoverRadius:7}]},
      options:{responsive:true,maintainAspectRatio:false,
        interaction:{mode:'nearest',intersect:false},
        plugins:{legend:{display:false},
          tooltip:{backgroundColor:'rgba(8,11,18,.96)',borderColor:'#f0b020',borderWidth:1,padding:10,
            callbacks:{
              title:function(ii){return bkLabels[ii[0].dataIndex]||'';},
              label:function(ii){
                var h=sorted[ii.dataIndex];
                var gain=bkGains[ii.dataIndex];
                return ['Capital : '+ii.raw.toFixed(2)+'€', gain+(h.b?' · '+bki(h.b).n:'')];
              }
            }
          }
        },
        scales:{x:{display:false},y:{ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'€';}},grid:{color:'rgba(255,255,255,.03)'}}}
      }
    });
  }

  // ── 2. Camembert bookmakers ──
  var bkMises={};
  paris.forEach(function(h){bkMises[h.b]=(bkMises[h.b]||0)+parseFloat(h.m||0);});
  var bkKeys=Object.keys(bkMises).sort(function(a,b){return bkMises[b]-bkMises[a];}).slice(0,6);
  var ctx2=document.getElementById('chart-pie-bk');
  if(ctx2&&bkKeys.length){
    var bkColors=['#4d84ff','#1ed760','#f0b020','#ff7b54','#a78bfa','#22d3ee'];
    _advCharts.pie=new Chart(ctx2,{type:'doughnut',data:{labels:bkKeys.map(function(k){return bki(k).n;}),datasets:[{data:bkKeys.map(function(k){return bkMises[k].toFixed(0);}),backgroundColor:bkColors,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{color:'#4f5d88',font:{size:9},boxWidth:10,padding:6}}}}});
  }

  // ── 3. Réussite par sport ──
  var sportStats={};
  paris.forEach(function(h){
    var s=h.sport||'⚽';
    if(!sportStats[s])sportStats[s]={n:0,wins:0,profit:0};
    sportStats[s].n++;
    if(h.win)sportStats[s].wins++;
    sportStats[s].profit+=(h.win?(h.m*h.cote-h.m):-h.m);
  });
  var sportKeys=Object.keys(sportStats).filter(function(s){return sportStats[s].n>=3;});
  var ctx3=document.getElementById('chart-sport');
  if(ctx3&&sportKeys.length){
    var sportWr=sportKeys.map(function(s){return Math.round(sportStats[s].wins/sportStats[s].n*100);});
    var sportColors=sportWr.map(function(v){return v>=55?'#1ed760':v>=45?'#f0b020':'#ff4545';});
    _advCharts.sport=new Chart(ctx3,{type:'bar',data:{labels:sportKeys,datasets:[{data:sportWr,backgroundColor:sportColors,borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:function(i){var s=sportKeys[i.dataIndex];return sportStats[s].wins+'/'+sportStats[s].n+' ('+i.raw+'%)';}}}},scales:{x:{max:100,ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'%';}},grid:{color:'rgba(255,255,255,.03)'}},y:{ticks:{color:'#4f5d88',font:{size:11}},grid:{display:false}}}}});
  }

  // ── 4. ROI dans le temps + Drawdown ──
  var roiCurve=[], ddCurve=[], totalMise=0, totalProfit=0, peak=0, maxDD=0;
  sorted.forEach(function(h){
    totalMise+=parseFloat(h.m||0);
    totalProfit+=(h.win?(h.m*h.cote-h.m):-h.m);
    var roi=totalMise>0?parseFloat((totalProfit/totalMise*100).toFixed(1)):0;
    roiCurve.push(roi);
    if(totalProfit>peak)peak=totalProfit;
    var dd=peak>0?parseFloat(((peak-totalProfit)/peak*100).toFixed(1)):0;
    if(dd>maxDD)maxDD=dd;
    ddCurve.push(-dd);
  });
  var ctx4=document.getElementById('chart-roi-time');
  if(ctx4){
    _advCharts.roi=new Chart(ctx4,{type:'line',data:{labels:sorted.map(function(h,i){return i+1;}),datasets:[
      {label:'ROI %',data:roiCurve,borderColor:'#4d84ff',backgroundColor:'transparent',borderWidth:2,tension:.4,pointRadius:0,yAxisID:'y'},
      {label:'Drawdown %',data:ddCurve,borderColor:'#ff4545',backgroundColor:'rgba(255,69,69,.1)',fill:true,borderWidth:1.5,tension:.4,pointRadius:0,yAxisID:'y'}
    ]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'nearest',intersect:false},plugins:{legend:{position:'bottom',labels:{color:'#4f5d88',font:{size:9},boxWidth:12}}},scales:{x:{display:false},y:{ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'%';}},grid:{color:'rgba(255,255,255,.03)'}}}}});
  }
}
function renderBilanTab(){
  renderSportFilter();
  var paris=filteredA();
  /* Stats */
  var ben=paris.reduce(function(a,h){return a+(h.win?(h.m*h.cote)-h.m:-h.m);},0);
  var benEl=$i('stat-ben');if(benEl){benEl.innerText=fmt(ben);benEl.style.color=ben>=0?'var(--g)':'var(--r)';}
  var wr=paris.length?(paris.filter(function(h){return h.win;}).length/paris.length*100).toFixed(0):0;
  txt('stat-wr',wr+'%');
  var mise=paris.reduce(function(a,h){return a+parseFloat(h.m||0);},0);
  var roi=mise?(ben/mise*100).toFixed(1):0;
  var roiEl=$i('stat-roi');if(roiEl){roiEl.innerText=roi+'%';roiEl.style.color=parseFloat(roi)>=0?'var(--g)':'var(--r)';}
  txt('stat-nb',paris.length);
  renderBilanMois();
  /* Courbe */
  var ctx=$i('bilan-chart');
  if(ctx){
    if(_bilanChart){try{_bilanChart.destroy();}catch(e){}}
    if(paris.length){
      var cum=0;
      var curve=paris.slice().reverse().map(function(h){cum+=(h.win?(h.m*h.cote)-h.m:-h.m);return parseFloat(cum.toFixed(2));});
      var clabels=paris.slice().reverse().map(function(h){var adv2=h.target&&h.target!=='-'?h.target:'';return (h.date||'')+(h.heure?' '+h.heure:'')+(adv2?' vs '+adv2:'')+'||'+(h.win?(h.m*h.cote-h.m>=0?'+':'')+parseFloat(h.m*h.cote-h.m).toFixed(2)+'€':'-'+parseFloat(h.m).toFixed(2)+'€');});
      var color=bilanMode==='flash'?'#f0b020':bilanMode==='cockpit'?'#4d84ff':bilanMode==='simple'?'#22d3ee':'#1ed760';
      var ct=ctx.getContext('2d');
      var g=ct.createLinearGradient(0,0,0,150);
      g.addColorStop(0,color+'44');g.addColorStop(1,color+'00');

      // Courbes par bookmaker
      var datasets = [{label:'Global',data:curve,borderColor:color,backgroundColor:g,borderWidth:2,fill:true,tension:.4,pointRadius:2,pointBackgroundColor:color,pointHoverRadius:5,pointHoverBorderColor:'#fff',pointHoverBorderWidth:2}];
      var bkColors = ['#ff4545','#4d84ff','#f0b020','#1ed760','#a78bfa','#ff7b54','#22d3ee','#e879f9'];
      var bkList = Object.keys(state.b);
      bkList.forEach(function(bk, i){
        var bkParis = paris.filter(function(h){return h.b===bk;});
        if(!bkParis.length) return;
        var bkCum=0;
        // Aligner sur les mêmes labels (indices)
        var bkCurve = paris.slice().reverse().map(function(h){
          if(h.b===bk) bkCum+=(h.win?(h.m*h.cote)-h.m:-h.m);
          return parseFloat(bkCum.toFixed(2));
        });
        var bkCol = bki(bk).c || bkColors[i%bkColors.length];
        datasets.push({label:bki(bk).n,data:bkCurve,borderColor:bkCol,backgroundColor:'transparent',borderWidth:1.5,fill:false,tension:.4,pointRadius:0,pointHoverRadius:4,borderDash:[4,3]});
      });

      _bilanChart=new Chart(ct,{type:'line',data:{labels:clabels,datasets:datasets},options:{responsive:true,maintainAspectRatio:false,events:['mousemove','mouseout','click','touchstart','touchmove'],
        interaction:{mode:'nearest',intersect:false},
            plugins:{legend:{display:true,position:'bottom',labels:{color:'#4f5d88',font:{size:9},boxWidth:20,padding:8}},
              tooltip:{backgroundColor:'rgba(8,11,18,.96)',borderColor:color,borderWidth:1,padding:10,
                callbacks:{
                  title:function(ii){return clabels[ii[0].dataIndex]||('Pari '+(ii[0].dataIndex+1));},
                  label:function(ii){return ii.dataset.label+' : '+(ii.raw>=0?'+':'')+ii.raw.toFixed(2)+'€';}
                }}},
            scales:{x:{display:false},y:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'€';}}}}}});
        attachTouchTooltip('bilan-chart',function(){return _bilanChart;},'cib-bilan','cib-bilan-txt','cib-bilan-val');
    }
  }
  /* ── Graphiques avancés ── */
  renderAdvancedCharts(paris, state.b);

  var bks={};Object.keys(state.b).forEach(function(k){bks[k]={profit:0,n:0,wins:0};});
  paris.forEach(function(h){
    if(!bks[h.b]) bks[h.b]={profit:0,n:0,wins:0};
    bks[h.b].profit+=(h.win?(h.m*h.cote)-h.m:-h.m);
    bks[h.b].n++;
    if(h.win) bks[h.b].wins++;
  });
  var bke=$i('bk-stats');
  if(bke) bke.innerHTML=Object.entries(bks).map(function(e){
    var b=bki(e[0]), p=e[1].profit, n=e[1].n, wr=n?Math.round(e[1].wins/n*100):0;
    var isActive = window._bilanBkFilter===e[0];
    return '<div class="bkrow" onclick="window._bilanBkFilter=(window._bilanBkFilter===\''+e[0]+'\'?null:\''+e[0]+'\');renderBilanTab();" style="--bc:'+b.c+';display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,'+(isActive?'.2':'.04')+');background:rgba(255,255,255,'+(isActive?'.06':'.02')+');margin-bottom:4px;">'
      +bkFavicon(e[0],18)
      +'<span style="flex:1;font-size:11px;font-weight:700;color:'+b.c+';">'+b.n+'</span>'
      +(n?'<span style="font-size:10px;color:var(--t3);">'+n+' paris · '+wr+'%</span>':'')
      +'<span style="font-size:13px;font-weight:800;color:'+(p>=0?'var(--g)':'var(--r)')+';">'+fmt(p)+'</span></div>';
  }).join('')+(window._bilanBkFilter?'<button onclick="window._bilanBkFilter=null;renderBilanTab();" style="width:100%;padding:6px;margin-top:4px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:6px;color:var(--t3);font-size:10px;cursor:pointer;">✕ Effacer le filtre</button>':'');
}

/* ── RENDER PRINCIPAL ── */
function render(){
  var total=Object.values(state.b).reduce(function(a,v){return a+parseFloat(v||0);},0);
  // Bénéfice = toujours calculé depuis les paris de l'archive
  var ben = 0;
  if(state.a && state.a.length > 0) {
    ben = state.a.reduce(function(acc,h){ return acc + (h.win ? (h.m*h.cote - h.m) : -h.m); }, 0);
  } else {
    ben = total - (state.start_bk||0);
  }
  var benC=ben>=0?'var(--g)':'var(--r)';
  txt('top-val',total.toFixed(2)+' €');
  txt('d-cap',total.toFixed(2)+' €');
  var be=$i('d-ben');if(be){be.innerText=fmt(ben);be.style.color=benC;}
  renderGoal(total);
  renderBilanTab();
  renderBilanMois();  /* pas de boucle, c'est une fonction indépendante */

  /* selects */
  var bOpt=Object.keys(state.b).map(function(k){return '<option value="'+k+'">'+bki(k).n+'</option>';}).join('');
  ['c-book','n-book','mv-book'].forEach(function(id){var e=$i(id);if(e)e.innerHTML=bOpt;});
  var uSel=$i('c-unit');
  if(uSel)uSel.innerHTML=state.u.map(function(u){return '<option value="'+u.n+'">'+(u.sport||'')+' '+u.n+' (P'+u.l+')</option>';}).join('');

  /* live cockpit */
  $i('live-strat').innerHTML=state.h.filter(function(x){return x.isS;}).map(function(h){
    return '<tr>'
      +'<td><b>'+h.n+'</b><div style="font-size:9px;color:var(--t3);">'+(h.sport||'')+' '+(h.comp||'')+'</div></td>'
      +'<td><div>'+h.target+'</div>'+(h.date||h.heure?'<div style="font-size:9px;color:var(--t2);">'+(h.date?'📅 '+h.date:'')+' '+(h.heure?'⏰ '+h.heure:'')+'</div>':'')+'</td>'
      +'<td style="color:var(--a);font-weight:700;">@'+h.cote+'</td>'
      +'<td style="color:var(--gold);font-weight:700;">'+h.m+'€</td>'
      +'<td style="text-align:right;white-space:nowrap"><a href="https://www.google.com/search?q='+encodeURIComponent(h.target+' sofascore résumé')+'" target="_blank" style="display:inline-flex;align-items:center;padding:5px 7px;background:rgba(77,132,255,.1);border:1px solid rgba(77,132,255,.25);border-radius:4px;color:#4d84ff;font-size:11px;font-weight:700;text-decoration:none;margin-right:3px;" title="Résumé">🔍</a><button class="sbtn sw" data-id="'+h.id+'" onclick="result(this.dataset.id,true)" style="margin-right:3px">✅</button><button class="sbtn sl" data-id="'+h.id+'" onclick="result(this.dataset.id,false)" style="margin-right:3px">❌</button><button data-id="'+h.id+'" onclick="editBet(this.dataset.id)" style="background:none;border:1px solid rgba(77,132,255,.25);color:var(--a);font-size:11px;font-weight:700;padding:5px 8px;border-radius:4px;cursor:pointer;margin-right:3px">✏️</button><button data-id="'+h.id+'" onclick="cancelBet(this.dataset.id)" style="background:none;border:1px solid rgba(255,69,69,.25);color:var(--r);font-size:11px;font-weight:700;padding:5px 8px;border-radius:4px;cursor:pointer">✕</button></td>'
      +'</tr>';
  }).join('')||'<tr><td colspan="5" class="empty">Aucun pari en cours</td></tr>';

  $i('live-norm').innerHTML=state.h.filter(function(x){return !x.isS;}).map(function(h){
    return '<tr>'
      +'<td><div style="font-size:10px;color:var(--t3);">'+(h.sport||'')+' '+(h.comp||'')+' '+(h.date?'📅 '+h.date:'')+' '+(h.heure?'⏰ '+h.heure:'')+'</div>'
      +'<div style="font-weight:600;">'+(h.domicile==='dom'?'🏠 ':h.domicile==='ext'?'🚌 ':'')+h.target+'</div>'
      +'<div style="font-size:10px;color:var(--t2);">'+(h.type||'—')+' · @'+h.cote+' · '+bbadge(h.b)+(h.isFreebet?' 🎟':'')+'</div></td>'
      +'<td style="color:var(--gold);font-weight:700;">'+h.m+'€</td>'
      +'<td style="text-align:right;white-space:nowrap"><a href="https://www.google.com/search?q='+encodeURIComponent(h.target+' sofascore résumé')+'" target="_blank" style="display:inline-flex;align-items:center;padding:5px 7px;background:rgba(77,132,255,.1);border:1px solid rgba(77,132,255,.25);border-radius:4px;color:#4d84ff;font-size:11px;font-weight:700;text-decoration:none;margin-right:3px;" title="Résumé">🔍</a><button class="sbtn sw" data-id="'+h.id+'" onclick="result(this.dataset.id,true)" style="margin-right:3px">✅</button><button class="sbtn sl" data-id="'+h.id+'" onclick="result(this.dataset.id,false)" style="margin-right:3px">❌</button><button data-id="'+h.id+'" onclick="editBet(this.dataset.id)" style="background:none;border:1px solid rgba(77,132,255,.25);color:var(--a);font-size:11px;font-weight:700;padding:5px 8px;border-radius:4px;cursor:pointer;margin-right:3px">✏️</button><button data-id="'+h.id+'" onclick="cancelBet(this.dataset.id)" style="background:none;border:1px solid rgba(255,69,69,.25);color:var(--r);font-size:11px;font-weight:700;padding:5px 8px;border-radius:4px;cursor:pointer">✕</button></td>'
      +'</tr>';
  }).join('')||'<tr><td colspan="3" class="empty">Aucun pari en cours</td></tr>';

  /* dash units */
  $i('dash-units').innerHTML=state.u.length?state.u.map(function(u){
      var paris=state.a.filter(function(h){return h.n===u.n;});
      var profit=paris.reduce(function(a,h){return a+(h.win?(h.m*h.cote)-h.m:-h.m);},0);
      var wins=paris.filter(function(h){return h.win&&!h.isCashout;}).length;
      var pc=paris.length?Math.round(wins/paris.length*100):0;
      var logo=logoHtml(u.n,u.color,u.abbr,32);
      var forme=formeHtml(paris,5);
      var pColor=profit>=0?'var(--g)':'var(--r)';
      return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--b1);cursor:pointer;" data-nom="'+u.n+'" onclick="openClubFromDash(this.dataset.nom)">'
        +logo
        +'<div style="flex:1;min-width:0;">'
        +'<div style="font-size:12px;font-weight:700;">'+(u.sport||'')+' '+u.n+'</div>'
        +'<div style="font-size:9px;color:var(--t3);">'+'⭐'.repeat(u.s)+' · P'+u.l+' · '+pc+'% réussite</div>'
        +(u.note?'<div style="font-size:10px;color:var(--a);margin-top:2px;font-style:italic;">📌 '+u.note+'</div>':'')
        +forme
        +(streak(paris).n>1?'<div style="display:inline-flex;align-items:center;gap:3px;padding:1px 7px;border-radius:10px;font-size:9px;font-weight:700;margin-top:3px;background:'+(streak(paris).t?'rgba(30,215,96,.1)':'rgba(255,69,69,.1)')+';color:'+(streak(paris).t?'var(--g)':'var(--r)')+'">'
        +(streak(paris).t?'🔥':'❄️')+' '+streak(paris).n+'</div>':'')
        +'</div>'
        +'<div style="font-size:14px;font-weight:800;color:'+pColor+';">'+fmt(profit)+'</div>'
        +'</div>';
    }).join('')+'':'<div class="empty">Aucune équipe</div>';
  /* books */
  $i('books-grid').innerHTML=Object.entries(state.b).map(function(e){
    var b=bki(e[0]);
    return '<div class="btile" style="--bc:'+b.c+';">'
      +'<div class="btile-n" style="color:'+b.c+';display:flex;align-items:center;gap:5px;">'+bkFavicon(e[0],14)+b.n+'</div>'
      +'<div class="btile-v">'+parseFloat(e[1]).toFixed(2)+'€</div>'
      +'<div class="btile-acts" style="align-items:center;">'
      +'<input type="color" value="'+b.c+'" title="Couleur" data-bk="'+e[0]+'" onchange="changeBookColor(this)" style="width:20px;height:20px;border-radius:50%;border:none;padding:0;cursor:pointer;background:none;flex-shrink:0;">'
      +'<button class="ba" data-bk="'+e[0]+'" onclick="editBook(this.dataset.bk)">Modifier</button> '
      +'<button class="ba del" data-bk="'+e[0]+'" onclick="delBook(this.dataset.bk)">✕</button>'
      +'</div></div>';
  }).join('');

  /* ulist */
  $i('ulist').innerHTML=state.u.length?'<div style="border-top:1px solid var(--b1);">'
    +state.u.map(function(u,i){
      return '<div class="urow">'
        +'<div class="udot" style="background:'+u.color+';"></div>'
        +'<div style="flex:1;min-width:0;"><div class="uname">'+(u.sport||'')+' '+u.n+'</div>'
        +'<div style="font-size:10px;color:var(--t3);">'+'⭐'.repeat(u.s)+' · Palier '+u.l+'</div>'+(u.note?'<div style="font-size:10px;color:var(--a);font-style:italic;">📌 '+u.note+'</div>':'')+'</div>'
        +'<div style="display:flex;gap:5px;">'
        +'<button class="ba" data-idx="'+i+'" onclick="editUnit(this.dataset.idx)" style="color:var(--a);border-color:rgba(77,132,255,.3);">✏ Modifier</button>'
        +'<button class="udel" data-idx="'+i+'" onclick="rmUnit(this.dataset.idx)">✕</button>'
        +'</div></div>';
    }).join('')+'</div>':'';

  renderColorPicker();renderBkColorPicker();
  renderArchive();
  renderGlobalChart();
  setDates();
}

function renderGoal(total){
  var goal=parseFloat(state.goal)||0;
  var fill=$i('g-fill');if(!fill)return;
  if(!goal){fill.style.width='0%';txt('g-cur',total.toFixed(2)+'€');txt('g-pct','—');txt('g-lbl','Définir un objectif');txt('g-tgt','');return;}
  var pct=Math.min(100,total/goal*100);
  fill.style.width=pct.toFixed(1)+'%';
  txt('g-cur',total.toFixed(2)+'€');txt('g-pct',pct.toFixed(1)+'%');txt('g-tgt','/ '+goal+'€');
  txt('g-lbl',pct>=100?'🎉 Objectif atteint !':'Reste '+(goal-total).toFixed(2)+'€');
}
function setGoal(){var v=prompt('Objectif bankroll (€) :',state.goal||'');if(v!=null&&!isNaN(+v)){state.goal=+v;save();}}

function renderBkColorPicker(){
  var row=$i('bk-color-row');if(!row)return;
  var cols=['#4d84ff','#ff2040','#00c87a','#f59e0b','#a855f7','#22d3ee','#f97316','#ec4899','#14b8a6','#6366f1','#84cc16','#e879f9'];
  row.innerHTML=cols.map(function(col){
    return '<div data-col="'+col+'" style="width:22px;height:22px;border-radius:50%;background:'+col+';cursor:pointer;transition:all .15s;border:2px solid transparent;"></div>';
  }).join('');
  row.querySelectorAll('div').forEach(function(d){
    d.addEventListener('click',function(){
      row.querySelectorAll('div').forEach(function(x){x.style.borderColor='transparent';});
      d.style.borderColor='#fff';
      var ci=$i('new-bk-color');if(ci)ci.value=d.dataset.col;
    });
  });
  var ci=$i('new-bk-color');if(ci&&!ci.dataset.init){ci.value='#4d84ff';ci.dataset.init='1';}
}
function renderColorPicker(){
  var r=$i('cprow');if(!r)return;
  r.innerHTML=PCOLS.map(function(c){return '<div class="cp '+(c===selColor?'on':'')+'" style="background:'+c+';" onclick="pickColor(\''+c+'\',this)"></div>';}).join('');
  var cc=$i('u-color');if(cc){cc.value=selColor;cc.oninput=function(){selColor=this.value;document.querySelectorAll('.cp').forEach(function(e){e.classList.remove('on');});};}
}
function pickColor(c,el){selColor=c;document.querySelectorAll('.cp').forEach(function(e){e.classList.remove('on');});el.classList.add('on');$i('u-color').value=c;}

/* ── ARCHIVE ── */
/* ── PAR MOIS ── */
var _bilanMoisYear=new Date().getFullYear();
var _archYear=new Date().getFullYear();

function getMoisData(paris, year){
  var mois={};
  paris.forEach(function(h){
    var d=h.date||h.t||'';
    var y=d.substring(0,4);
    var m=d.substring(5,7)||d.substring(3,5);
    if(!y||!m)return;
    if(parseInt(y)!==year)return;
    var key=y+'-'+m;
    if(!mois[key])mois[key]={profit:0,n:0,wins:0};
    var p=(h.win?(h.m*h.cote)-h.m:-h.m);
    mois[key].profit+=p;
    mois[key].n++;
    if(h.win)mois[key].wins++;
  });
  return mois;
}

function renderMoisRow(key, data, prevData){
  var parts=key.split('-');
  var moisNames=['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  var moisNum=parseInt(parts[1]);
  var label=moisNames[moisNum]||parts[1]+'/'+parts[0];
  var p=data.profit;
  var wr=data.n?(data.wins/data.n*100).toFixed(0):'0';
  var col=p>=0?'var(--g)':'var(--r)';
  // Comparaison mois précédent
  var compHtml='';
  if(prevData){
    var diff=p-prevData.profit;
    var diffCol=diff>=0?'var(--g)':'var(--r)';
    var diffIcon=diff>=0?'▲':'▼';
    var diffPct=prevData.profit!==0?((diff/Math.abs(prevData.profit))*100).toFixed(0):null;
    var prevMonthNames = ['','Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
    var prevMNum = parseInt(parts[1]) - 1;
    if(prevMNum < 1) prevMNum = 12;
    var prevMName = prevMonthNames[prevMNum]||'';
    compHtml='<div style="font-size:10px;color:'+diffCol+';font-weight:700;margin-top:3px;" title="Différence de profit entre ce mois et '+prevMName+' ('+( prevData.profit>=0?'+':'')+prevData.profit.toFixed(2)+'€)">'+diffIcon+' '+(diff>=0?'+':'')+diff.toFixed(2)+'€ vs '+prevMName+' ('+(prevData.profit>=0?'+':'')+prevData.profit.toFixed(2)+'€)'+(diffPct?' · '+diffPct+'%':'')+'</div>';
  }
  return '<div style="display:flex;align-items:center;padding:11px 14px;background:var(--s1);border-radius:var(--r6);margin-bottom:6px;border-left:3px solid '+(p>=0?'var(--g)':'var(--r)')+';">'
    +'<div style="flex:1;">'
    +'<div style="font-size:13px;font-weight:700;">'+label+' '+parts[0]+'</div>'
    +'<div style="font-size:10px;color:var(--t3);margin-top:2px;">'+data.n+' paris · '+wr+'% réussite</div>'
    +compHtml
    +'</div>'
    +'<div style="font-size:16px;font-weight:800;color:'+col+';">'+(p>=0?'+':'')+p.toFixed(2)+'€</div>'
    +'</div>';
}

function renderBilanMois(){
  var el=$i('bilan-mois-list');var lbl=$i('mois-year-label');
  if(!el)return;
  if(lbl)lbl.textContent=_bilanMoisYear;
  var paris=state.a.filter(function(h){
    var mode=typeof bilanMode!=='undefined'?bilanMode:'global';
    if(mode==='cockpit')return h.isS;
    if(mode==='simple')return !h.isS&&!h.isFlash;
    if(mode==='flash')return h.isFlash;
    return true;
  });
  if(bilanSport&&bilanSport!=='ALL')paris=paris.filter(function(h){return h.sport===bilanSport;});
  // Récupérer aussi l'année précédente pour les comparaisons
  var mois=getMoisData(paris,_bilanMoisYear);
  var moisPrev=getMoisData(paris,_bilanMoisYear-1);
  // Fusionner les deux années pour avoir les mois précédents de la même année
  var allMois = getMoisDataAll(paris);
  var keys=Object.keys(mois).sort().reverse();
  if(!keys.length){el.innerHTML='<div class="empty">Aucun pari en '+_bilanMoisYear+'</div>';return;}
  el.innerHTML=keys.map(function(k){
    // Mois précédent dans la même année
    var parts=k.split('-');
    var mNum=parseInt(parts[1]);
    var prevKey = mNum>1 ? parts[0]+'-'+(mNum<11?'0':'')+(mNum-1) : (parseInt(parts[0])-1)+'-12';
    var prevData = allMois[prevKey]||null;
    return renderMoisRow(k,mois[k],prevData);
  }).join('');
}

function getMoisDataAll(paris){
  var mois={};
  paris.forEach(function(h){
    var d=h.date||h.t||'';
    var y=d.substring(0,4);
    var m=d.substring(5,7)||d.substring(3,5);
    if(!y||!m)return;
    var key=y+'-'+m;
    if(!mois[key])mois[key]={profit:0,n:0,wins:0};
    var p=(h.win?(h.m*h.cote)-h.m:-h.m);
    mois[key].profit+=p;
    mois[key].n++;
    if(h.win)mois[key].wins++;
  });
  return mois;
}

function changeMoisYear(dir){
  _bilanMoisYear+=dir;
  renderBilanMois();
}

function renderArchMois(){
  var el=$i('arch-mois-list');var lbl=$i('arch-year-label');
  if(!el)return;
  if(lbl)lbl.textContent=_archYear;
  var mois=getMoisData(state.a,_archYear);
  var keys=Object.keys(mois).sort().reverse();
  if(!keys.length){el.innerHTML='<div class="empty">Aucun pari en '+_archYear+'</div>';return;}
  el.innerHTML=keys.map(function(k){return renderMoisRow(k,mois[k]);}).join('');
}

function changeArchYear(dir){
  _archYear+=dir;
  renderArchMois();
}

function toggleArchMonth(el){
  var next=el.nextElementSibling;if(!next)return;
  next.style.display=next.style.display==='none'?'block':'none';
}
var _archFilter = 'all';
function renderArchive(){
  // Mise à jour compteurs KPI
  var wins = state.a.filter(function(x){return !x.isPending && x.win;}).length;
  var loss = state.a.filter(function(x){return !x.isPending && !x.win;}).length;
  var pend = state.a.filter(function(x){return x.isPending;}).length;
  var wEl = document.getElementById('arch-wins');
  var lEl = document.getElementById('arch-loss');
  var pEl = document.getElementById('arch-pending');
  if(wEl) wEl.textContent = wins;
  if(lEl) lEl.textContent = loss;
  if(pEl) pEl.textContent = pend;

  var pm={};
  state.a.forEach(function(h){
    var dateRaw = h.date || h.t || '';
    var k = 'Inconnu';
    if(dateRaw) {
      if(dateRaw.indexOf('-') !== -1) {
        // Format ISO : 2026-05-31
        var parts = dateRaw.split('-');
        if(parts.length >= 2) k = parts[1]+'/'+parts[0]; // mois/année
      } else if(dateRaw.indexOf('/') !== -1) {
        // Format FR : 31/05/2026
        var p = dateRaw.split('/');
        if(p.length >= 2) k = p[1]+'/'+(p[0].length===4?p[0]:'20'+p[0]);
      }
    }
    if(!pm[k])pm[k]={paris:[],profit:0,wins:0};
    pm[k].paris.push(h);pm[k].profit+=(h.isPending?0:(h.win?(h.m*h.cote)-h.m:-h.m));
    if(!h.isPending&&h.win)pm[k].wins++;
  });
  var keys=Object.keys(pm),profits=keys.map(function(k){return parseFloat(pm[k].profit.toFixed(2));});
  var maxA=Math.max.apply(null,profits.map(Math.abs).concat([1]));
  var cz=$i('arch-chart');
  if(cz){
    if(!keys.length){cz.innerHTML='<div class="empty">Aucun historique</div>';return;}
    cz.innerHTML='<div class="ctitle">Profit mensuel</div><div style="height:120px;position:relative;"><canvas id="ac"></canvas></div>';
    setTimeout(function(){
      var ctx=$i('ac');if(!ctx)return;
      if(window._ac){try{window._ac.destroy();}catch(e){}}
      window._ac=new Chart(ctx.getContext('2d'),{type:'bar',data:{labels:keys,datasets:[{data:profits,backgroundColor:profits.map(function(v){return v>=0?'rgba(30,215,96,.55)':'rgba(255,69,69,.55)';}),borderColor:profits.map(function(v){return v>=0?'#1ed760':'#ff4545';}),borderWidth:1,borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#4f5d88',font:{size:9}},grid:{display:false}},y:{ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'€';}},grid:{color:'rgba(255,255,255,.03)'}}}}});
    },60);
  }
  /* Grouper par semaine puis par jour */
  var dayNames=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  var fullDayNames=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  
  /* Grouper tous les paris par mois/semaine/jour */
  var allByDate={};
  state.a.forEach(function(h){
    var dateStr=h.date||'';
    if(!dateStr)dateStr=(h.t||'').substring(0,10);
    var key=dateStr||'Inconnu';
    if(!allByDate[key])allByDate[key]=[];
    allByDate[key].push(h);
  });
  
  /* Trier les dates décroissantes */
  var dateKeys=Object.keys(allByDate).sort().reverse();
  
  /* Grouper par mois */
  var byMonth={};
  dateKeys.forEach(function(dk){
    var mKey=dk.substring(0,7)||'Inconnu';
    if(!byMonth[mKey])byMonth[mKey]={days:{},profit:0,n:0,wins:0};
    allByDate[dk].forEach(function(h){
      var p=h.isPending?0:(h.win?(h.m*h.cote)-h.m:-h.m);
      byMonth[mKey].profit+=p;byMonth[mKey].n++;if(!h.isPending&&h.win)byMonth[mKey].wins++;
      if(!byMonth[mKey].days[dk])byMonth[mKey].days[dk]=[];
      byMonth[mKey].days[dk].push(h);
    });
  });
  
  var monthKeys=Object.keys(byMonth).sort().reverse();
  
  $i('arch-list').innerHTML=monthKeys.map(function(mk){
    var md=byMonth[mk];
    var pC=md.profit>=0?'var(--g)':'var(--r)';
    var wr=md.n?(md.wins/md.n*100).toFixed(0):0;
    var moisNames={'01':'Janvier','02':'Février','03':'Mars','04':'Avril','05':'Mai','06':'Juin','07':'Juillet','08':'Août','09':'Septembre','10':'Octobre','11':'Novembre','12':'Décembre'};
    var parts=mk.split('-');
    var mLabel=(moisNames[parts[1]]||parts[1])+' '+(parts[0]||'');
    
    var daysHtml=Object.keys(md.days).sort().reverse().map(function(dk){
      var dayParis=md.days[dk];
      // Appliquer le filtre résultat
      var filteredDayParis = _archFilter==='w' ? dayParis.filter(function(h){return !h.isPending&&h.win;})
        : _archFilter==='l' ? dayParis.filter(function(h){return !h.isPending&&!h.win;})
        : _archFilter==='p' ? dayParis.filter(function(h){return h.isPending;})
        : dayParis;
      if(!filteredDayParis.length) return '';
      var dayProfit=dayParis.reduce(function(a,h){return a+(h.isPending?0:(h.win?(h.m*h.cote)-h.m:-h.m));},0);
      var dpC=dayProfit>=0?'var(--g)':'var(--r)';
      /* Nom du jour */
      var dayLabel=dk;
      try{
        var dp=dk.split('-');
        if(dp.length===3){
          var dt=new Date(parseInt(dp[0]),parseInt(dp[1])-1,parseInt(dp[2]));
          dayLabel=fullDayNames[dt.getDay()]+' '+parseInt(dp[2]);
        }
      }catch(e){}
      
      var betsHtml=filteredDayParis.map(function(h){
        var b2=bki(h.b);
        var gain=h.isPending?0:(h.win?(h.m*h.cote-h.m):-h.m);
        var gainC=h.isPending?'#f0a020':(gain>=0?'var(--g)':'var(--r)');
        var winC=h.isPending?'#f0a020':(h.win?'var(--g)':'var(--r)');
        var borderC=h.isPending?'#f0a020':(h.win?'var(--g)':'var(--r)');
        var bkBadge='<div style="width:22px;height:22px;border-radius:5px;background:'+b2.c+';color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+b2.n.charAt(0).toUpperCase()+'</div>';
        var titre=(h.target&&h.target!=='-'?h.target:(h.n||'—'));
        var sous=(h.n&&h.target&&h.target!=='-'?h.n+' · ':'')+('@'+parseFloat(h.cote).toFixed(2))+(h.comp?' · '+h.comp:'');
        return '<div style="display:flex;align-items:center;padding:8px 10px;background:var(--s1);border-radius:var(--r6);margin-bottom:4px;border-left:3px solid '+borderC+';gap:8px;">'
          +'<div style="font-size:10px;color:var(--t3);min-width:32px;flex-shrink:0;text-align:center;">'+(h.heure||'—')+'</div>'
          +bkBadge
          +'<div style="flex:1;min-width:0;overflow:hidden;">'
          +'<div style="font-size:12px;font-weight:700;color:var(--t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+titre+'</div>'
          +'<div style="font-size:10px;color:var(--t3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+sous+'</div>'
          +'</div>'
          +'<div style="text-align:right;flex-shrink:0;">'
          +'<div style="font-size:11px;font-weight:800;color:'+winC+';">'+(h.isPending?'⏳':(h.win?'✅':'❌'))+'</div>'
          +'<div style="font-size:11px;font-weight:700;color:'+gainC+';">'+(h.isPending?'En cours':(gain>=0?'+':'')+gain.toFixed(2)+'€')+'</div>'
          +'<div style="font-size:10px;color:var(--t3);">'+parseFloat(h.m).toFixed(2)+'€</div>'
          +'</div>'
          +'<div style="display:flex;flex-direction:column;gap:3px;flex-shrink:0;">'
          +'<a href="https://www.google.com/search?q='+encodeURIComponent(titre+' sofascore')+'" target="_blank" style="background:none;border:none;color:#ff7b54;font-size:13px;cursor:pointer;padding:0;text-decoration:none;" title="Sofascore">⚡</a>'
          +'<button data-titre="'+titre.replace(/"/g,'&quot;')+'" data-date="'+(h.date||'')+'" data-comp="'+(h.comp||'')+'" onclick="var d=this.dataset;ouvrirYouTubeAvecScore(d.titre,d.date,d.comp)" style="background:none;border:none;color:#ff0000;font-size:13px;cursor:pointer;padding:0;" title="YouTube highlights">▶️</button>'
          +'<button data-aid="'+h.id+'" onclick="editArchived(this.dataset.aid)" style="background:none;border:none;color:var(--t3);font-size:14px;cursor:pointer;padding:0;">✏️</button>'
          +'<button data-aid="'+h.id+'" onclick="deleteArchived(this.dataset.aid)" style="background:none;border:none;color:var(--r);font-size:14px;cursor:pointer;padding:0;">🗑</button>'
          +'</div>'
          +(h.sousParis && h.sousParis.length ? '<div style="margin:4px 10px 6px 42px;border-left:2px solid rgba(255,255,255,.08);padding-left:8px;">'
            +h.sousParis.map(function(sp){
              var spC=sp.isPending?'#f0a020':(sp.win?'var(--g)':'var(--r)');
              var spIco=sp.isPending?'⏳':(sp.win?'✅':'❌');
              return '<div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;font-size:10px;color:var(--t2);">'
                +'<span>'+spIco+' '+sp.label+'</span>'
                +'<span style="color:'+spC+';font-weight:700;">@'+parseFloat(sp.cote).toFixed(2)+'</span>'
                +'</div>';
            }).join('')
            +'</div>' : '')
          +'</div>';
      }).join('');
      
      return '<div style="margin-bottom:10px;background:var(--bg2);border:1px solid var(--card-border,rgba(77,132,255,.32));border-radius:var(--r8);overflow:hidden;box-shadow:var(--card-glow,0 0 14px rgba(77,132,255,.18),0 0 4px rgba(77,132,255,.28));">'
        +'<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 12px;border-bottom:1px solid rgba(77,132,255,.15);background:rgba(77,132,255,.05);">'
        +'<span style="font-size:12px;font-weight:800;color:var(--t1);">'+dayLabel+'</span>'
        +'<span style="font-size:13px;font-weight:800;color:'+dpC+';">'+(dayProfit>=0?'+':'')+dayProfit.toFixed(2)+'€</span>'
        +'</div>'
        +'<div style="padding:8px;">'
        +betsHtml
        +'</div>'
        +'</div>';
    }).join('');
    
    return '<div style="margin-bottom:16px;">'
      /* Header mois */
      +'<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--s1);border-radius:var(--r6);border-left:3px solid '+(md.profit>=0?'var(--g)':'var(--r)')+';margin-bottom:8px;cursor:pointer;" onclick="toggleArchMonth(this)">'
      +'<div>'
      +'<div style="font-size:14px;font-weight:800;color:var(--t1);">'+mLabel+'</div>'
      +'<div style="font-size:10px;color:var(--t3);margin-top:2px;">'+md.n+' paris · '+wr+'% réussite</div>'
      +'</div>'
      +'<div style="font-size:18px;font-weight:800;color:'+pC+';">'+(md.profit>=0?'+':'')+md.profit.toFixed(2)+'€</div>'
      +'</div>'
      /* Contenu dépliable */
      +'<div style="padding:0 4px;">'
      +daysHtml
      +'</div>'
      +'</div>';
  }).join('');
}

/* ── GLOBAL CHART ── */
function renderChartMoisBar(){
  var ctx=$i('chart-mois-bar');if(!ctx)return;
  if(window._gcMoisBar){try{window._gcMoisBar.destroy();}catch(e){}}
  var moisNames=['','Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  var year=new Date().getFullYear();
  var mois={};
  state.a.forEach(function(h){
    var d=h.date||h.t||'';
    var y=parseInt(d.substring(0,4));
    if(y!==year)return;
    var m=parseInt(d.substring(5,7));if(!m)return;
    if(!mois[m])mois[m]=0;
    mois[m]+=(h.win?(h.m*h.cote)-h.m:-h.m);
  });
  var keys=Object.keys(mois).map(Number).sort(function(a,b){return a-b;});
  if(!keys.length){ctx.parentElement.innerHTML='<div class="empty">Aucune donnée</div>';return;}
  var labels=keys.map(function(m){return moisNames[m]||m;});
  var data=keys.map(function(m){return parseFloat(mois[m].toFixed(2));});
  var colors=data.map(function(v){return v>=0?'rgba(30,215,96,.7)':'rgba(255,69,69,.7)';});
  window._gcMoisBar=new Chart(ctx.getContext('2d'),{
    type:'bar',data:{labels:labels,datasets:[{data:data,backgroundColor:colors,borderRadius:5,borderSkipped:false}]},
    options:{animation:false,responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:function(i){return (i.raw>=0?'+':'')+i.raw.toFixed(2)+'€';}}}},
      scales:{x:{ticks:{color:'#4f5d88',font:{size:9}},grid:{display:false}},
        y:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'€';}}}}}
  });
  attachTouchTooltip('chart-mois-bar',function(){return window._gcMoisBar;},'','','');
}

function renderChartSport(){
  var ctxBen=$i('chart-sport-ben');var ctxWr=$i('chart-sport-wr');
  if(window._gcSportBen){try{window._gcSportBen.destroy();}catch(e){}}
  if(window._gcSportWr){try{window._gcSportWr.destroy();}catch(e){}}
  var sports={};
  state.a.forEach(function(h){
    var s=h.sport||'Autre';
    if(!sports[s])sports[s]={profit:0,n:0,wins:0};
    sports[s].profit+=(h.win?(h.m*h.cote)-h.m:-h.m);
    sports[s].n++;if(h.win)sports[s].wins++;
  });
  var entries=Object.entries(sports).sort(function(a,b){return b[1].profit-a[1].profit;});
  if(!entries.length)return;
  var labels=entries.map(function(e){return e[0];});
  var profits=entries.map(function(e){return parseFloat(e[1].profit.toFixed(2));});
  var wrs=entries.map(function(e){return parseFloat((e[1].wins/e[1].n*100).toFixed(1));});
  var pColors=profits.map(function(v){return v>=0?'rgba(30,215,96,.7)':'rgba(255,69,69,.7)';});
  var wrColors=['rgba(30,215,96,.7)','rgba(240,176,32,.7)','rgba(255,69,69,.7)','rgba(77,132,255,.7)','rgba(168,85,247,.7)'];
  if(ctxBen)window._gcSportBen=new Chart(ctxBen.getContext('2d'),{
    type:'bar',data:{labels:labels,datasets:[{data:profits,backgroundColor:pColors,borderRadius:5,borderSkipped:false}]},
    options:{animation:false,responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:function(i){return (i.raw>=0?'+':'')+i.raw.toFixed(2)+'€';}}}},
      scales:{x:{ticks:{color:'#4f5d88',font:{size:9}},grid:{display:false}},y:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'€';}}}}}
  });
  if(ctxWr)window._gcSportWr=new Chart(ctxWr.getContext('2d'),{
    type:'bar',data:{labels:labels,datasets:[{data:wrs,backgroundColor:wrColors,borderRadius:5,borderSkipped:false}]},
    options:{animation:false,responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:function(i){return i.raw+'%';}}}},
      scales:{x:{ticks:{color:'#4f5d88',font:{size:9}},grid:{display:false}},y:{min:0,max:100,grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'%';}}}}}
  });
}

function renderChartTypeBen(){
  var ctx=$i('chart-type-ben');if(!ctx)return;
  if(window._gcTypeBen){try{window._gcTypeBen.destroy();}catch(e){}}
  var types={};
  state.a.forEach(function(h){
    var t=(h.type||'Autre').trim()||'Autre';
    if(!types[t])types[t]=0;
    types[t]+=(h.win?(h.m*h.cote)-h.m:-h.m);
  });
  var entries=Object.entries(types).sort(function(a,b){return b[1]-a[1];});
  if(!entries.length)return;
  var labels=entries.map(function(e){return e[0];});
  var data=entries.map(function(e){return parseFloat(e[1].toFixed(2));});
  var TCOLS=['rgba(77,132,255,.8)','rgba(30,215,96,.8)','rgba(240,176,32,.8)','rgba(168,85,247,.8)','rgba(34,211,238,.8)','rgba(249,115,22,.8)','rgba(236,72,153,.8)','rgba(20,184,166,.8)','rgba(132,204,22,.8)','rgba(232,121,249,.8)'];
  var colors=entries.map(function(e,i){return TCOLS[i%TCOLS.length];});
  window._gcTypeBen=new Chart(ctx.getContext('2d'),{
    type:'bar',data:{labels:labels,datasets:[{data:data,backgroundColor:colors,borderRadius:5,borderSkipped:false}]},
    options:{animation:false,responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:function(i){return (i.raw>=0?'+':'')+i.raw.toFixed(2)+'€';}}}},
      scales:{x:{ticks:{color:'#4f5d88',font:{size:9},maxRotation:30},grid:{display:false}},y:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'€';}}}}}
  });
}

/* ── DONUT RÉPARTITION PAR TYPE ── */
var _typeColors={};
var DONUT_DEFAULTS=['#4d84ff','#1ed760','#f0b020','#a855f7','#22d3ee','#f97316','#ec4899','#14b8a6','#84cc16','#e879f9'];

function getTypeColor(type,i){
  if(!_typeColors[type])_typeColors[type]=DONUT_DEFAULTS[i%DONUT_DEFAULTS.length];
  return _typeColors[type];
}

function renderChartTypeDonut(){
  var ctx=$i('chart-type-donut');if(!ctx)return;
  if(window._gcTypeDonut){try{window._gcTypeDonut.destroy();}catch(e){}}
  var types={};var i=0;
  state.a.forEach(function(h){
    var t=(h.type||'Autre').trim()||'Autre';
    if(!types[t]){types[t]={n:0,idx:i++};}
    types[t].n++;
  });
  var entries=Object.entries(types).sort(function(a,b){return b[1].n-a[1].n;});
  if(!entries.length)return;
  var labels=entries.map(function(e){return e[0];});
  var data=entries.map(function(e){return e[1].n;});
  var colors=entries.map(function(e){return getTypeColor(e[0],e[1].idx);});
  window._gcTypeDonut=new Chart(ctx.getContext('2d'),{
    type:'doughnut',
    data:{labels:labels,datasets:[{data:data,backgroundColor:colors,borderWidth:2,borderColor:'var(--bg)'}]},
    options:{animation:false,responsive:true,maintainAspectRatio:false,cutout:'65%',
      plugins:{legend:{position:'bottom',labels:{color:'#4f5d88',font:{size:9},boxWidth:12,padding:8}},
        tooltip:{callbacks:{label:function(i){var total=data.reduce(function(a,b){return a+b;},0);return i.label+': '+i.raw+' ('+((i.raw/total)*100).toFixed(1)+'%)';}}}}}
  });
  /* Color pickers */
  var picker=$i('type-donut-picker');
  if(picker){
    picker.innerHTML=entries.map(function(e,i){
      return '<div style="display:flex;align-items:center;gap:4px;padding:3px 8px;background:var(--s1);border-radius:20px;cursor:pointer;" data-type="'+e[0]+'" onclick="openTypePicker(this)">'
        +'<div style="width:10px;height:10px;border-radius:50%;background:'+getTypeColor(e[0],i)+';flex-shrink:0;"></div>'
        +'<span style="font-size:10px;color:var(--t2);">'+e[0]+'</span>'
        +'<input type="color" id="tp-'+e[0].replace(/[^a-z0-9]/gi,'_')+'" value="'+getTypeColor(e[0],i)+'" data-type="'+e[0]+'" onchange="changeTypeColor(this.dataset.type,this.value)" style="opacity:0;position:absolute;width:0;height:0;">'
        +'</div>';
    }).join('');
  }
}

function openTypePicker(el){
  var type=el.dataset.type;
  var id='tp-'+type.replace(/[^a-z0-9]/gi,'_');
  var inp=$i(id);if(inp)inp.click();
}

function changeTypeColor(type,color){
  _typeColors[type]=color;
  localStorage.setItem('g45_typecolors',JSON.stringify(_typeColors));
  renderChartTypeDonut();
  renderChartTypeBen();
}

/* ── STREAKS ── */
function renderStreakPanel(){
  var el=$i('streak-panel');if(!el)return;
  var paris=state.a.slice().sort(function(a,b){return (a.date+a.heure)<(b.date+b.heure)?-1:1;});
  if(!paris.length){el.innerHTML='<div class="empty" style="grid-column:1/-1;">Aucun pari archivé</div>';return;}
  /* Streak actuel */
  var cur=1,curW=paris[paris.length-1].win;
  for(var i=paris.length-2;i>=0;i--){
    if(paris[i].win===curW)cur++;else break;
  }
  /* Meilleure série W */
  var bestW=0,tmpW=0;
  paris.forEach(function(h){h.win?tmpW++:(tmpW=0);if(tmpW>bestW)bestW=tmpW;});
  /* Pire série L */
  var worstL=0,tmpL=0;
  paris.forEach(function(h){!h.win?tmpL++:(tmpL=0);if(tmpL>worstL)worstL=tmpL;});
  /* Streak actuel ce mois */
  var thisMonth=new Date().toISOString().substring(0,7);
  var monthParis=paris.filter(function(h){return (h.date||'').substring(0,7)===thisMonth;});
  var mWins=monthParis.filter(function(h){return h.win;}).length;
  var mLoss=monthParis.length-mWins;

  var streakLabel=cur+'× '+(curW?'✅ Victoire':'❌ Défaite');
  var streakC=curW?'var(--g)':'var(--r)';

  el.innerHTML=[
    {label:'🔥 Série en cours',val:streakLabel,c:streakC},
    {label:'📈 Meilleure série W',val:bestW+'× ✅',c:'var(--g)'},
    {label:'📉 Pire série L',val:worstL+'× ❌',c:'var(--r)'},
    {label:'📅 Ce mois',val:mWins+'W / '+mLoss+'L',c:'var(--t2)'},
  ].map(function(s){
    return '<div style="padding:12px;background:var(--s1);border-radius:var(--r6);text-align:center;">'
      +'<div style="font-size:10px;color:var(--t3);margin-bottom:4px;">'+s.label+'</div>'
      +'<div style="font-size:16px;font-weight:800;color:'+s.c+';">'+s.val+'</div>'
      +'</div>';
  }).join('');
}

function renderGlobalChart(){
  var gz=$i('global-zone');if(!gz)return;
  var ap=state.a.slice().reverse();
  var startBk=state.start_bk||0;
  var cum=startBk;
  var glabels=['Départ'];
  var curve=[startBk];
  ap.forEach(function(h){
    cum+=(h.win?(h.m*h.cote)-h.m:-h.m);
    curve.push(parseFloat(cum.toFixed(2)));
    var gain=(h.win?(h.m*h.cote)-h.m:-h.m);
    var adv3=h.target&&h.target!=='-'?h.target:'';var lbl=(h.date||'')+(h.n?' '+h.n:'')+(adv3?' vs '+adv3:'')+(h.l?' P'+h.l:'');
    glabels.push(lbl+'||'+(gain>=0?'+':'')+gain.toFixed(2)+'€');
  });
  var tot=cum-startBk;
  var wins=state.a.filter(function(h){return h.win&&!h.isCashout;}).length,n=state.a.filter(function(h){return !h.isCashout;}).length;
  var wr=n?(wins/n*100).toFixed(1):0;
  var mise=state.a.reduce(function(a,h){return a+parseFloat(h.m);},0);
  var roi=mise?(tot/mise*100).toFixed(2):0;
  var bC=tot>=0?'#1ed760':'#ff4545',rC=+roi>=0?'#1ed760':'#ff4545';
  gz.innerHTML='<div class="sec" style="margin-top:0;">Évolution bankroll</div><div class="gchart"><div class="gchart-area"><canvas id="cg"></canvas></div><div class="chart-info-bar" id="cib-global"><span class="cib-main" id="cib-global-txt">Touche un point</span><span class="cib-val" id="cib-global-val"></span></div>'
    +'<div class="gkpis">'
    +'<div class="gk"><div class="gk-l">Paris</div><div class="gk-v" style="color:var(--a);">'+n+'</div></div>'
    +'<div class="gk"><div class="gk-l">Bénéfice</div><div class="gk-v" style="color:'+bC+';">'+fmt(tot)+'</div></div>'
    +'<div class="gk"><div class="gk-l">ROI</div><div class="gk-v" style="color:'+rC+';">'+roi+'%</div></div>'
    +'<div class="gk"><div class="gk-l">Réussite</div><div class="gk-v">'+wr+'%</div></div>'
    +'</div></div>';
  setTimeout(function(){
    var ctx=$i('cg');if(!ctx)return;
    if(GC){try{GC.destroy();}catch(e){}}
    var ct=ctx.getContext('2d');
    var lineColor=cum>=startBk?'#1ed760':'#ff4545';
    var g=ct.createLinearGradient(0,0,0,170);
    g.addColorStop(0,lineColor+'33');g.addColorStop(1,lineColor+'00');
    var ptColors=curve.map(function(v,i){
      if(i===0)return 'rgba(255,255,255,.3)';
      return curve[i]>=curve[i-1]?'rgba(30,215,96,.8)':'rgba(255,69,69,.8)';
    });
    GC=new Chart(ct,{
      type:'line',
      data:{labels:glabels,datasets:[{data:curve,borderColor:lineColor,backgroundColor:g,borderWidth:2,fill:true,tension:.4,
        pointRadius:4,pointBackgroundColor:ptColors,pointHoverRadius:10,pointHoverBorderColor:'#fff',pointHoverBorderWidth:2,pointHitRadius:30}]},
      options:{
        responsive:true,maintainAspectRatio:false,events:['mousemove','mouseout','click','touchstart','touchmove'],interaction:{mode:'nearest',intersect:false},
        plugins:{legend:{display:false},
          tooltip:{backgroundColor:'rgba(8,11,18,.96)',borderColor:lineColor+'66',borderWidth:1,padding:10,
            callbacks:{
              title:function(ii){if(!ii||!ii.length)return '';var l=glabels[ii[0].dataIndex]||'';return l.split('||')[0]||'Départ';},
              label:function(ii){if(!ii||ii.dataIndex===undefined)return '';var l=glabels[ii.dataIndex]||'';var parts=l.split('||');return parts[1]?'Capital : '+ii.raw.toFixed(2)+'€  '+parts[1]:'Capital : '+ii.raw.toFixed(2)+'€';}
            }}},
        scales:{x:{display:false},y:{grid:{color:'rgba(255,255,255,.03)'},border:{display:false},
          ticks:{color:'#4f5d88',font:{size:10},maxTicksLimit:4,callback:function(v){return v+'€';}}}}
      }
    });

  },60);
}
/* ── ÉQUIPES ── */
function renderEquipes(){
  var c=$i('equipes-list');if(!c)return;
  if(!state.u.length){c.innerHTML='<div class="empty">Aucune équipe</div>';return;}
  Object.values(MC).forEach(function(ch){try{ch.destroy();}catch(e){}});MC={};
  c.innerHTML=state.u.map(function(u,idx){
    var p=gp(u);
    var paris=state.a.filter(function(h){return h.n===u.n;});
    var profit=paris.reduce(function(a,h){return a+(h.win?(h.m*h.cote)-h.m:-h.m);},0);
    var wins=paris.filter(function(h){return h.win&&!h.isCashout;}).length;
    var losses=paris.filter(function(h){return !h.win;}).length;
    var wr=paris.length?(wins/paris.length*100).toFixed(0):0;
    var cote=paris.length?(paris.reduce(function(a,h){return a+h.cote;},0)/paris.length).toFixed(2):'—';
    var sk=streak(paris);
    var sid='mc'+u.n.replace(/[^a-z0-9]/gi,'_');
    var link=FAV_LINKS[u.n]?'<a href="'+FAV_LINKS[u.n]+'" target="_blank" onclick="event.stopPropagation();" style="font-size:9px;color:var(--a);text-decoration:none;margin-left:5px;">📡</a>':'';
    var logo=logoHtml(u.n,u.color,u.abbr,46);
    var forme=formeHtml(paris,5);
    return '<div class="tcard" onclick="openClub(\''+u.n+'\','+idx+')">'
      +'<div class="tcard-top" style="background:'+p.bg+';">'
      +logo
      +'<div class="tinfo">'
      +'<div class="tname">'+(u.sport||'')+' '+u.n+link+'</div>'
      +'<div class="tsub">'+paris.length+' paris · '+'⭐'.repeat(u.s)+' · Palier '+u.l+'</div>'
      +forme
      +(sk.n>1?'<div class="spill" style="background:'+(sk.t?'rgba(30,215,96,.1)':'rgba(255,69,69,.1)')+';color:'+(sk.t?'var(--g)':'var(--r)')+';">'+(sk.t?'🔥':'❄️')+' Série '+(sk.t?'W':'L')+' : '+sk.n+'</div>':'')
      +'</div>'
      +'<div class="tprofit" style="color:'+p.c+';">'+fmt(profit)+'</div>'
      +'</div>'
      +'<div class="tmini"><canvas id="'+sid+'" style="height:55px;"></canvas></div>'
      +'<div class="tstats">'
      +'<div class="tstat"><div class="tstat-v" style="color:var(--g);">'+wins+'</div><div class="tstat-l">Wins</div></div>'
      +'<div class="tstat"><div class="tstat-v" style="color:var(--r);">'+losses+'</div><div class="tstat-l">Pertes</div></div>'
      +'<div class="tstat"><div class="tstat-v" style="color:'+p.c+';">'+wr+'%</div><div class="tstat-l">Réussite</div></div>'
      +'<div class="tstat"><div class="tstat-v" style="color:'+p.c+';">'+cote+'</div><div class="tstat-l">Cote moy</div></div>'
      +'</div></div>';
  }).join('');
  setTimeout(function(){
    state.u.forEach(function(u){
      var paris=state.a.filter(function(h){return h.n===u.n;});if(!paris.length)return;
      var p=gp(u),sid='mc'+u.n.replace(/[^a-z0-9]/gi,'_');
      var ctx=$i(sid);if(!ctx)return;
      var cum=0;
      var data=[0].concat(paris.slice().reverse().map(function(h){cum+=(h.win?(h.m*h.cote)-h.m:-h.m);return parseFloat(cum.toFixed(2));}));
      var c2=ctx.getContext('2d'),g=c2.createLinearGradient(0,0,0,55);
      g.addColorStop(0,p.fade.replace('.12','.3'));g.addColorStop(1,'rgba(0,0,0,0)');
      MC[u.n]=new Chart(c2,{type:'line',data:{labels:data.map(function(_,i){return i;}),datasets:[{data:data,borderColor:p.c,backgroundColor:g,borderWidth:1.5,fill:true,tension:.4,pointRadius:0}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{enabled:false}},scales:{x:{display:false},y:{display:false}}}});
    });
  },100);
}

/* ── DÉTAIL CLUB ── */
function openClub(nom,idx){
  _currentTeam=nom;
  Object.values(AC).forEach(function(c){try{c.destroy();}catch(e){}});AC={};
  showOngletMondialIfNational(nom);
  var u=state.u.find(function(x){return x.n===nom;});
  var p=gp(u||{color:PCOLS[0]});
  var paris=state.a.filter(function(h){return h.n===nom;});
  var profit=paris.reduce(function(a,h){return a+(h.win?(h.m*h.cote)-h.m:-h.m);},0);
  var wins=paris.filter(function(h){return h.win&&!h.isCashout;}).length;
  var losses=paris.filter(function(h){return !h.win;}).length;
  var wr=paris.length?(wins/paris.length*100).toFixed(0):0;
  var cote=paris.length?(paris.reduce(function(a,h){return a+h.cote;},0)/paris.length).toFixed(2):'—';
  var mise=paris.reduce(function(a,h){return a+parseFloat(h.m);},0);
  var roi=mise?(profit/mise*100).toFixed(2):0;
  var sk=streak(paris);
  var RC=2*Math.PI*28;var RO=RC-(wr/100)*RC;
  var gu=parseFloat(state.ugoals[nom])||0;var gp2=gu>0?Math.min(100,profit/gu*100):0;
  var cum2=0;
  var cv=[0].concat(paris.slice().reverse().map(function(h){cum2+=(h.win?(h.m*h.cote)-h.m:-h.m);return parseFloat(cum2.toFixed(2));}));
  var lb=['Départ'].concat(paris.slice().reverse().map(function(h){var adv=h.target&&h.target!=='-'?h.target:'';return (h.date||'')+(h.heure?' '+h.heure:'')+(adv?' vs '+adv:'')+(h.l?' P'+h.l:'')+'||'+(h.win?(h.m*h.cote-h.m>=0?'+':'')+parseFloat(h.m*h.cote-h.m).toFixed(2)+'€':'-'+parseFloat(h.m).toFixed(2)+'€');}));
  var pm2={};paris.forEach(function(h){var pts=h.t?h.t.split(' ')[0].split('/'):['??','??'];var k=pts.length>=2?pts[1]+'/'+pts[0]:'?';if(!pm2[k])pm2[k]=0;pm2[k]+=(h.win?(h.m*h.cote)-h.m:-h.m);});
  var mK=Object.keys(pm2),mV=mK.map(function(k){return parseFloat(pm2[k].toFixed(2));});
  var uObjL=state.u.find(function(x){return x.n===nom;});var link=(uObjL&&uObjL.link2)||(uObjL&&uObjL.link)||FAV_LINKS[nom]?'<a href="'+FAV_LINKS[nom]+'" target="_blank" style="font-size:10px;color:var(--a);text-decoration:none;display:inline-flex;align-items:center;gap:4px;margin-top:5px;">📡 Flashscore ↗</a>':'';
  var logo=logoHtml(nom,u?u.color:PCOLS[0],u?u.abbr:nom.substring(0,3),58);
  var forme=formeHtml(paris,7);

  $i('d-hero').innerHTML='<div class="dhero" style="background:'+p.bg+';border-bottom:1px solid '+p.border+';">'
    +'<button class="dback" onclick="closeClub()"><span>←</span> Retour</button>'
    +'<div class="dtop">'+logo
    +'<div><div class="dname">'+(u&&u.sport?u.sport+' ':'')+nom+'</div>'
    +'<div class="dsub">'+paris.length+' paris · '+'⭐'.repeat(u?u.s:1)+' · Palier '+(u?u.l:1)+'</div>'
    +forme+link
    +(sk.n>1?'<div class="spill" style="background:'+(sk.t?'rgba(30,215,96,.14)':'rgba(255,69,69,.12)')+';color:'+(sk.t?'var(--g)':'var(--r)')+';">'+(sk.t?'🔥':'❄️')+' '+sk.n+' consécutifs</div>':'')
    +'</div></div></div>';

  /* Lancer l'analyse IA en arrière-plan */
  setTimeout(function(){ loadTeamAI(nom); }, 300);

  $i('ip-bilan').innerHTML=
    '<div class="kpi2" style="margin-bottom:10px;">'
    +'<div class="kpibox" style="--ac:'+p.c+';"><div class="kpi-l">Bénéfice</div><div class="kpi-v" style="color:'+(profit>=0?'var(--g)':'var(--r)')+';">'+fmt(profit)+'</div></div>'
    +'<div class="kpibox" style="--ac:'+p.c+';"><div class="kpi-l">ROI</div><div class="kpi-v" style="color:'+( +roi>=0?'var(--g)':'var(--r)')+';">'+roi+'%</div></div>'
    +'</div>'
    +'<div class="card cp" style="margin-bottom:10px;"><div class="ringwrap">'
    +'<div class="rsvg"><svg width="74" height="74" viewBox="0 0 74 74"><circle cx="37" cy="37" r="28" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="6"/><circle cx="37" cy="37" r="28" fill="none" stroke="'+p.c+'" stroke-width="6" stroke-dasharray="'+RC.toFixed(1)+'" stroke-dashoffset="'+RO.toFixed(1)+'" stroke-linecap="round"/></svg>'
    +'<div class="rcenter"><div class="rv" style="color:'+p.c+';">'+wr+'%</div><div class="rl">réussite</div></div></div>'
    +'<div><div style="font-size:12px;color:var(--g);font-weight:700;margin-bottom:5px;">✅ '+wins+' victoires</div>'
    +'<div style="font-size:12px;color:var(--r);font-weight:700;margin-bottom:8px;">❌ '+losses+' défaites</div>'
    +'<div style="font-size:11px;color:var(--t3);">Cote moy : <b style="color:var(--t1);">'+cote+'</b></div>'
    +'<div style="font-size:11px;color:var(--t3);">Mise totale : <b style="color:var(--t1);">'+mise.toFixed(0)+'€</b></div>'
    +'</div></div></div>'
    +'<div class="card"><div style="display:flex;align-items:center;justify-content:space-between;padding:11px 14px;border-bottom:1px solid var(--b1);"><span style="font-size:11px;font-weight:600;color:var(--t2);">Objectif profit</span><button class="ba" data-nom="'+nom+'" onclick="setUG(this.dataset.nom)">MODIFIER</button></div>'
    +'<div class="cp" style="padding:12px 14px;">'
    +(gu>0
      ?'<div class="prog-row"><span style="font-size:12px;font-weight:700;">'+fmt(profit)+'</span><span style="font-size:10px;color:var(--t3);">/ +'+gu+'€ · '+gp2.toFixed(1)+'%</span></div>'
       +'<div class="prog-track"><div class="prog-fill" style="width:'+gp2.toFixed(1)+'%;background:'+(gp2>=100?'var(--g)':p.c)+';"></div></div>'
       +'<div class="prog-meta"><span style="color:'+p.c+';">'+gp2.toFixed(1)+'%</span><span>'+(gp2>=100?'🎉 Atteint !':'Reste '+(gu-profit).toFixed(2)+'€')+'</span></div>'
      :'<div style="font-size:12px;color:var(--t3);">Appuie sur Modifier pour définir un objectif.</div>')
    +'</div></div>'
    /* Bloc IA */
    +'<div class="fc" id="team-ai-box" style="margin-top:4px;">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
    +'<div style="display:flex;align-items:center;gap:7px;"><div id="team-ai-dot" style="width:7px;height:7px;border-radius:50%;background:#4d84ff;animation:aidot 1.5s infinite;"></div><span style="font-size:10px;font-weight:700;color:#7aaaff;letter-spacing:.5px;text-transform:uppercase;">Analyse IA — Tavily + Groq</span></div>'
    +'<button onclick="loadTeamAI(this.dataset.nom)" style="background:none;border:1px solid rgba(77,132,255,.3);border-radius:6px;color:#7aaaff;font-size:10px;font-weight:700;padding:3px 8px;cursor:pointer;">↻</button>'
    +'</div>'
    +'<div id="team-ai-content" style="font-size:12px;color:#8b97c4;line-height:1.7;"><div style="display:flex;align-items:center;gap:8px;color:#4f5d88;"><div style="width:12px;height:12px;border:2px solid rgba(77,132,255,.2);border-top-color:#4d84ff;border-radius:50%;animation:spin .8s linear infinite;flex-shrink:0;"></div>Recherche en cours…</div></div>'
    +'</div>';


  // ── Données pour les graphiques ──
  // Forme récente (5 derniers paris perso)
  var forme5 = paris.slice(0,5).reverse();

  // Dom vs Ext
  var domParis = paris.filter(function(h){ return h.lieu==='dom' || h.dom===true || h.domicile==='dom'; });
  var extParis = paris.filter(function(h){ return h.lieu==='ext' || h.dom===false || h.domicile==='ext'; });
  var neutreParis = paris.filter(function(h){ return !h.lieu && h.dom===undefined && !h.domicile; });
  var domProfit = domParis.reduce(function(a,h){ return a+(h.win?(h.m*h.cote)-h.m:-h.m); },0);
  var extProfit = extParis.reduce(function(a,h){ return a+(h.win?(h.m*h.cote)-h.m:-h.m); },0);
  var domWr = domParis.length ? (domParis.filter(function(h){return h.win;}).length/domParis.length*100).toFixed(0) : 0;
  var extWr = extParis.length ? (extParis.filter(function(h){return h.win;}).length/extParis.length*100).toFixed(0) : 0;

  // Types de paris (top 4)
  var tmG={};
  paris.forEach(function(h){
    var t=(h.type||'Autre').trim().split(' ')[0];
    if(!tmG[t])tmG[t]={n:0,wins:0,profit:0};
    tmG[t].n++;if(h.win)tmG[t].wins++;
    tmG[t].profit+=(h.win?(h.m*h.cote)-h.m:-h.m);
  });
  var topTypes=Object.entries(tmG).sort(function(a,b){return b[1].n-a[1].n;}).slice(0,4);

  $i('ip-graphiques').innerHTML=
    // ── 1. Courbe de profit ──
    '<div class="cwrap"><div class="ctitle">📈 Évolution du profit</div>'
    +'<div style="height:180px;position:relative;"><canvas id="dc-courbe"></canvas></div>'
    +'<div class="chart-info-bar" id="cib-club"><span class="cib-main" id="cib-club-txt">Touche un point</span><span class="cib-val" id="cib-club-val"></span></div></div>'

    // ── 2. Forme récente (5 derniers paris perso) ──
    +'<div class="cwrap"><div class="ctitle">🔥 Mes 5 derniers paris sur cette équipe</div>'
    +'<div style="display:flex;gap:8px;align-items:center;padding:10px 0;">'
    +(forme5.length ? forme5.map(function(h){
      var col = h.win ? '#1ed760' : '#ff4545';
      var bg = h.win ? 'rgba(30,215,96,.15)' : 'rgba(255,69,69,.15)';
      var border = h.win ? 'rgba(30,215,96,.4)' : 'rgba(255,69,69,.4)';
      var gain = h.win ? '+'+(h.m*h.cote-h.m).toFixed(1)+'€' : '-'+h.m+'€';
      return '<div style="flex:1;text-align:center;background:'+bg+';border:1px solid '+border+';border-radius:8px;padding:8px 4px;">'
        +'<div style="font-size:14px;font-weight:800;color:'+col+';">'+(h.win?'W':'L')+'</div>'
        +'<div style="font-size:9px;color:'+col+';margin-top:2px;">'+gain+'</div>'
        +'<div style="font-size:8px;color:rgba(255,255,255,.3);margin-top:2px;">@'+h.cote+'</div>'
        +'</div>';
    }).join('') : '<div style="color:var(--t3);font-size:12px;">Pas encore de paris</div>')
    +'</div></div>'

    // ── 3. Dom vs Ext ──
    +(paris.length ? '<div class="cwrap"><div class="ctitle">🏠 Domicile vs 🚌 Extérieur</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 0;">'
    +'<div style="text-align:center;background:rgba(30,215,96,.08);border:1px solid rgba(30,215,96,.2);border-radius:8px;padding:12px;">'
    +'<div style="font-size:11px;color:var(--t3);margin-bottom:4px;">🏠 Domicile</div>'
    +(domParis.length
      ? '<div style="font-size:20px;font-weight:800;color:#1ed760;">'+domWr+'%</div>'
        +'<div style="font-size:10px;color:var(--t3);">'+domParis.length+' paris</div>'
        +'<div style="font-size:12px;font-weight:700;color:'+(domProfit>=0?'#1ed760':'#ff4545')+';">'+(domProfit>=0?'+':'')+domProfit.toFixed(2)+'€</div>'
      : '<div style="font-size:12px;color:var(--t3);">Aucune donnée</div><div style="font-size:9px;color:var(--t3);margin-top:4px;">Coche Dom à la saisie</div>')
    +'</div>'
    +'<div style="text-align:center;background:rgba(77,132,255,.08);border:1px solid rgba(77,132,255,.2);border-radius:8px;padding:12px;">'
    +'<div style="font-size:11px;color:var(--t3);margin-bottom:4px;">🚌 Extérieur</div>'
    +(extParis.length
      ? '<div style="font-size:20px;font-weight:800;color:#4d84ff;">'+extWr+'%</div>'
        +'<div style="font-size:10px;color:var(--t3);">'+extParis.length+' paris</div>'
        +'<div style="font-size:12px;font-weight:700;color:'+(extProfit>=0?'#1ed760':'#ff4545')+';">'+(extProfit>=0?'+':'')+extProfit.toFixed(2)+'€</div>'
      : '<div style="font-size:12px;color:var(--t3);">Aucune donnée</div><div style="font-size:9px;color:var(--t3);margin-top:4px;">Coche Ext à la saisie</div>')
    +'</div>'
    +'</div></div>' : '')

    // ── 4. Top types de paris ──
    +(topTypes.length ? '<div class="cwrap"><div class="ctitle">🎯 Mes types de paris</div>'
    +'<div style="display:flex;flex-direction:column;gap:7px;padding:8px 0;">'
    +topTypes.map(function(e){
      var t=e[0], d=e[1];
      var pct=(d.wins/d.n*100).toFixed(0);
      var col=d.profit>=0?'#1ed760':'#ff4545';
      var barCol=d.profit>=0?'rgba(30,215,96,.6)':'rgba(255,69,69,.5)';
      var maxBar=topTypes[0][1].n;
      return '<div style="display:flex;align-items:center;gap:8px;">'
        +'<div style="font-size:11px;font-weight:700;color:var(--t1);width:80px;flex-shrink:0;">'+t+'</div>'
        +'<div style="flex:1;height:6px;background:rgba(255,255,255,.06);border-radius:3px;">'
        +'<div style="height:6px;border-radius:3px;background:'+barCol+';width:'+(d.n/maxBar*100).toFixed(0)+'%;"></div></div>'
        +'<div style="font-size:10px;color:var(--t3);width:20px;text-align:right;">'+d.n+'</div>'
        +'<div style="font-size:11px;font-weight:700;color:'+col+';width:55px;text-align:right;">'+(d.profit>=0?'+':'')+d.profit.toFixed(1)+'€</div>'
        +'<div style="font-size:10px;color:var(--t3);width:30px;text-align:right;">'+pct+'%</div>'
        +'</div>';
    }).join('')
    +'</div></div>' : '')

    // ── 5. Profit par mois ──
    +(mK.length?'<div class="cwrap"><div class="ctitle">📅 Profit par mois</div><div style="height:150px;position:relative;"><canvas id="dc-mois"></canvas></div></div>':'');

  /* archive */
  var am2={};
  paris.forEach(function(h){var pts=h.t?h.t.split(' ')[0].split('/'):['??','??'];var k=pts.length>=2?pts[1]+'/'+pts[0]:'?';if(!am2[k])am2[k]={paris:[],profit:0};am2[k].paris.push(h);am2[k].profit+=(h.win?(h.m*h.cote)-h.m:-h.m);});
  if(paris.length){
    $i('ip-archive').innerHTML=Object.keys(am2).map(function(key){
      var d=am2[key];var pC=d.profit>=0?'var(--g)':'var(--r)';
      return '<div class="mh"><div class="mh-lbl">'+key+' · '+d.paris.length+' paris</div><div class="mh-val" style="color:'+pC+';">'+fmt(d.profit)+'</div></div>'
        +d.paris.map(function(h){
          var b2=bki(h.b);var dd=h.date?'📅 '+h.date+' ':'';var hh=h.heure?'⏰ '+h.heure+' ':'';
          return '<div class="brow '+(h.win?'w':'l')+'">'
            +'<div class="brow-main"><div class="brow-title">'+(h.sport||'')+' '+h.target+'</div>'
            +'<div class="brow-meta">'+h.t+' '+dd+hh+'· '+(h.type||'—')+' · @'+h.cote+' · <span style="color:'+b2.c+';">'+b2.n+'</span>'+(h.debrief?'<br><i>'+h.debrief+'</i>':'')+'</div></div>'
            +'<div class="brow-right"><div class="brow-amt" style="color:'+(h.win?'var(--g)':'var(--r)')+';">'+(h.win?'+'+(h.m*h.cote).toFixed(2):'-'+h.m)+'€</div>'
            +'<div class="brow-tag" style="color:'+(h.win?'var(--g)':'var(--r)')+';">'+(h.win?'WIN':'LOSS')+'</div></div></div>';
        }).join('');
    }).join('');
  } else {
    $i('ip-archive').innerHTML='<div class="empty">Aucun pari archivé</div>';
  }

  /* types */
  var tm={};paris.forEach(function(h){var t=(h.type||'Autre').trim();if(!tm[t])tm[t]={n:0,wins:0,profit:0};tm[t].n++;if(h.win)tm[t].wins++;tm[t].profit+=(h.win?(h.m*h.cote)-h.m:-h.m);});
  var ts=Object.entries(tm).sort(function(a,b){return b[1].n-a[1].n;});var maxN=ts.length?ts[0][1].n:1;
  $i('ip-types').innerHTML=ts.length
    ?'<div class="card cp">'+ts.map(function(e){
        var t=e[0],d=e[1];var pct=(d.wins/d.n*100).toFixed(0);var pC=d.profit>=0?'var(--g)':'var(--r)';
        return '<div class="tyrow"><div class="tyn">'+t+'</div>'
          +'<div class="tytrack"><div class="tyfill" style="width:'+(d.n/maxN*100).toFixed(0)+'%;background:'+p.c+';"></div></div>'
          +'<div class="typct" style="color:'+p.c+';">'+pct+'%</div>'
          +'<div class="tyn2">'+d.n+'</div>'
          +'<div class="typ" style="color:'+pC+';">'+fmt(d.profit)+'</div></div>';
      }).join('')+'</div>'
    :'<div class="empty">Aucun type</div>';

  document.querySelectorAll('.itab').forEach(function(t){t.classList.remove('on');});
  document.querySelectorAll('.ipanel').forEach(function(c){c.classList.remove('on');});
  document.querySelector('.itab').classList.add('on');
  $i('ip-bilan').classList.add('on');
  $i('t-bilan').style.display='none';
  $i('detail').style.display='block';

  setTimeout(function(){
    if(cv.length>1){
      var ctx=$i('dc-courbe');
      if(ctx){
        var c3=ctx.getContext('2d');
        var g=c3.createLinearGradient(0,0,0,180);
        g.addColorStop(0,p.fade.replace('.12','.28'));g.addColorStop(1,'rgba(0,0,0,0)');
        AC.courbe=new Chart(c3,{
          type:'line',
          data:{labels:lb,datasets:[{data:cv,borderColor:p.c,backgroundColor:g,borderWidth:2,fill:true,tension:.4,pointRadius:cv.length<12?3:0,pointBackgroundColor:p.c}]},
          options:{
            responsive:true,maintainAspectRatio:false,
            plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(8,11,18,.96)',borderColor:p.border,borderWidth:1,titleColor:'#4f5d88',bodyColor:p.c,bodyFont:{weight:'bold'},callbacks:{title:function(ii){return lb[ii[0].dataIndex]||'';},label:function(ii){return (ii.raw>=0?'+':'')+ii.raw+'€';}}}},
            scales:{x:{ticks:{color:'#4f5d88',font:{size:8},maxTicksLimit:6},grid:{display:false}},y:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'€';}}}}
          }
        });
      }
      attachTouchTooltip('dc-courbe',function(){return window._gcClub;},'cib-club','cib-club-txt','cib-club-val');
    }
    if(mK.length){
      var ctx2=$i('dc-mois');
      if(ctx2){
        AC.mois=new Chart(ctx2.getContext('2d'),{
          type:'bar',
          data:{labels:mK,datasets:[{data:mV,backgroundColor:mV.map(function(v){return v>=0?'rgba(30,215,96,.55)':'rgba(255,69,69,.55)';}),borderColor:mV.map(function(v){return v>=0?'#1ed760':'#ff4545';}),borderWidth:1,borderRadius:4}]},
          options:{
            responsive:true,maintainAspectRatio:false,
            plugins:{legend:{display:false},tooltip:{callbacks:{label:function(i){return (i.raw>=0?'+':'')+i.raw.toFixed(2)+'€';}}}},
            scales:{x:{ticks:{color:'#4f5d88',font:{size:9}},grid:{display:false}},y:{ticks:{color:'#4f5d88',font:{size:9},callback:function(v){return v+'€';}},grid:{color:'rgba(255,255,255,.03)'}}}
          }
        });
      }
    }
  },80);
}

function setUG(nom){var v=prompt('Objectif profit pour '+nom+' (€) :',state.ugoals[nom]||0);if(v!=null&&!isNaN(+v)){state.ugoals[nom]=+v;save();}}
function closeClub(){Object.values(AC).forEach(function(c){try{c.destroy();}catch(e){}});AC={};$i('detail').style.display='none';$i('t-bilan').style.display='block';}
function swInner(id,btn){
  if(id==='saisons') setTimeout(loadTeamSaisons, 50);document.querySelectorAll('.itab').forEach(function(t){t.classList.remove('on');});document.querySelectorAll('.ipanel').forEach(function(c){c.classList.remove('on');});if(btn)btn.classList.add('on');$i('ip-'+id).classList.add('on');}

/* ── PARIS ── */
function pari(isS){
  var n,b,c,m,target,type,l=1,sport='',comp='',heure='',date='';
  var now=new Date();
  var t=now.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})+' '+now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  if(isS){
    var u=state.u.find(function(x){return x.n===$i('c-unit').value;});if(!u)return alert('Aucune équipe !');
    n=u.n;target=$i('c-target').value||'-';type=getMmLabel()||'-';
    sport=$i('c-sport').value||'';comp=$i('c-comp').value||'';
    heure=$i('c-heure').value||'';date=$i('c-date').value||'';
    b=$i('c-book').value;c=getMmCote();
    m=parseFloat($i('c-mise').value)||0;l=u.l;
    var notes=($i('c-notes')&&$i('c-notes').value)||'';
  }else{
    n='SIMPLE';sport=$i('p-sport').value;heure=$i('n-heure').value||'';date=$i('n-date').value||'';
    comp=$i('n-comp').value;var nteam=($i('n-team')&&$i('n-team').value)||'';var nadv=($i('n-analysis')&&$i('n-analysis').value)||'';target=(nteam&&nadv?nteam+' vs '+nadv:nteam||nadv||comp||'Pari simple');
    type=getMmLabelSimple()||$i('n-type').value||'-';b=$i('n-book').value;
    c=parseFloat($i('n-cote').value.replace(',','.'))||0;m=parseFloat($i('n-mise').value)||0;
  }
  if(m>0&&(parseFloat(state.b[b])||0)>=m){
    state.b[b]=(parseFloat(state.b[b])-m).toFixed(2);
    var isFlash=!isS&&$i('n-flashboost')&&$i('n-flashboost').checked;
    var isFreebet=!isS&&$i('n-freebet')&&$i('n-freebet').checked;
    var domicile=($i('n-lieu')&&$i('n-lieu').value)||($i('p-domicile')?$i('p-domicile').value:'');state.h.unshift({id:Date.now().toString(),n:n,target:target,b:b,l:l,m:m,cote:c,isS:isS,isFlash:isFlash,isFreebet:isFreebet,t:t,sport:sport,type:type,comp:comp,heure:heure,date:date,notes:notes||'',domicile:domicile});
    save();
    if(isS){$i('c-target').value='';$i('c-comp').value='';if($i('c-notes'))$i('c-notes').value='';}
    else{$i('n-comp').value='';$i('n-type').value='';$i('n-analysis').value='';if($i('n-notes'))$i('n-notes').value='';if($i('n-team'))$i('n-team').value='';if($i('n-flashboost'))$i('n-flashboost').checked=false;if($i('n-freebet'))$i('n-freebet').checked=false;mmRowsSimple=[{type:'',cote:1.50}];renderMmRowsSimple();}
  }else alert('Solde insuffisant sur '+bki(b).n+' !');
}
function result(id,win){
  var idx=state.h.findIndex(function(x){return x.id===id;});if(idx===-1)return;
  var bet=state.h[idx];
  var debrief=prompt('Débrief ('+(win?'WIN ✅':'LOSS ❌')+') :','')||'';
  if(win){var _g=bet.isFreebet?(bet.m*(bet.cote-1)):(bet.m*bet.cote);state.b[bet.b]=(parseFloat(state.b[bet.b])+_g).toFixed(2);if(bet.isS){var u=state.u.find(function(x){return x.n===bet.n;});if(u)u.l=1;}}
  else if(bet.isS){var u2=state.u.find(function(x){return x.n===bet.n;});if(u2&&u2.l<8)u2.l++;}
  var archived=Object.assign({},bet,{win:win,debrief:debrief});
  state.a.unshift(archived);state.h.splice(idx,1);save();updMise();
}
function cancelBet(id){
  if(!confirm('Annuler ce pari et rembourser la mise ?'))return;
  var idx=state.h.findIndex(function(x){return x.id===id;});if(idx===-1)return;
  var bet=state.h[idx];
  state.b[bet.b]=(parseFloat(state.b[bet.b]||0)+parseFloat(bet.m)).toFixed(2);
  if(bet.isS&&bet.l){var u=state.u.find(function(x){return x.n===bet.n;});if(u)u.l=parseInt(bet.l)||1;}
  state.h.splice(idx,1);save();
}
function deleteArchived(id){
  if(!confirm('Supprimer ce pari ?'))return;
  var idx=state.a.findIndex(function(x){return x.id===id;});if(idx===-1)return;
  var bet=state.a[idx];
  if(bet.win)state.b[bet.b]=(parseFloat(state.b[bet.b]||0)-(bet.m*bet.cote)).toFixed(2);
  else state.b[bet.b]=(parseFloat(state.b[bet.b]||0)+parseFloat(bet.m)).toFixed(2);
  state.a.splice(idx,1);save();
}
function editArchived(id){
  var idx=state.a.findIndex(function(x){return x.id===id;});if(idx===-1)return;
  var bet=state.a[idx];
  if(bet.isPending){
    // Pari en attente : choisir le résultat
    var choix=confirm('Résultat du pari "'+((bet.target&&bet.target!=='-'?bet.target:bet.n)||'?')+'" ?\n\nOK = GAGNÉ ✅\nAnnuler = PERDU ❌');
    bet.isPending=false;
    bet.win=choix;
    if(bet.b && state.b){
      if(choix){state.b[bet.b]=(parseFloat(state.b[bet.b]||0)+(bet.m*bet.cote)-parseFloat(bet.m)).toFixed(2);}
      else{state.b[bet.b]=(parseFloat(state.b[bet.b]||0)-parseFloat(bet.m)).toFixed(2);}
    }
    save();renderArchive();return;
  }
  if(!confirm('Inverser le résultat ? (actuellement '+(bet.win?'WIN':'LOSS')+')'))return;
  if(bet.win){state.b[bet.b]=(parseFloat(state.b[bet.b]||0)-(bet.m*bet.cote)+parseFloat(bet.m)).toFixed(2);}
  else{state.b[bet.b]=(parseFloat(state.b[bet.b]||0)-parseFloat(bet.m)+(bet.m*bet.cote)).toFixed(2);}
  bet.win=!bet.win;save();
}
function updMise(){
  var u=state.u.find(function(x){return x.n===$i('c-unit').value;});
  if(!u)return;
  if($i('c-mise'))$i('c-mise').value=STRATS[u.s][u.l-1]||0;
  /* Auto-fill sport */
  if(u.sport&&$i('c-sport'))$i('c-sport').value=u.sport;
  /* Auto-fill competition from CLUB_DB */
  var db=CLUB_DB.find(function(c){return c.name===u.n;});
  if(db&&db.league&&$i('c-comp'))$i('c-comp').value=db.league;
  /* Auto-fill adversaires via API */
  autoFillAdv(u);
  renderCrash();
}
function autoFillAdv(u){
  var TEAM_IDS={};  /* placeholder - API not used */
  var tid=TEAM_IDS[u.n];
  var advEl=$i('c-target');
  if(!tid||!advEl)return;
  apiFootball('/fixtures',{team:tid,next:5},function(d,e){
    if(e||!d||!d.response||!d.response.length)return;
    /* Fill adversaires-list datalist */
    var opps=d.response.map(function(f){
      return f.teams.home.id===tid?f.teams.away.name:f.teams.home.name;
    });
    /* Also fill competition if not set */
    if($i('c-comp'))$i('c-comp').value=d.response[0].league.name;
    /* Fill date of next match */
    var next=d.response[0];
    if(next&&$i('c-date'))$i('c-date').value=next.fixture.date.substring(0,10);
    /* Update adversaire dropdown */
    var adv=$i('adv-res-cock');
    if(adv&&opps.length){
      adv.style.display='block';
      adv.innerHTML=opps.map(function(v){
        return '<div style="padding:8px 12px;cursor:pointer;font-size:12px;border-bottom:1px solid var(--b1);" data-v="'+v+'" data-t="c-target" data-r="adv-res-cock" onclick="pickAdv(this.dataset.v,this.dataset.t,this.dataset.r)">'+v+'</div>';
      }).join('');
      setTimeout(function(){if(adv)adv.style.display='none';},5000);
    }
  });
}

/* ── BANK ── */
function fund(add){
  var b=$i('mv-book').value;var amt=parseFloat($i('mv-amt').value);
  if(!b||isNaN(amt))return;
  state.b[b]=(parseFloat(state.b[b]||0)+(add?amt:-amt)).toFixed(2);
  if(add)state.start_bk+=amt;save();
}
function addBook(){
  var inp=$i('new-bk');var name=inp.value.trim().toLowerCase();if(!name)return;
  if(state.b[name]!==undefined)return alert('Existe déjà !');
  var col=($i('new-bk-color')&&$i('new-bk-color').value)||'#4d84ff';
  var init=parseFloat(prompt('Solde de départ pour '+name+' ?','0'))||0;
  /* Stocker la couleur perso dans state.bkColors */
  if(!state.bkColors)state.bkColors={};loadCustomLinks();_typeColors=JSON.parse(localStorage.getItem('g45_typecolors')||'{}');var _n=localStorage.getItem('gones45_note');var _ni=$i('pc-note');if(_ni&&_n)_ni.innerHTML=_n;var tk=localStorage.getItem('gones45_tavily_key');var tki=$i('tavily-key-input');if(tki&&tk)tki.value=tk;var ask=localStorage.getItem('gones45_apisports_key');var aski=$i('apisports-key-input');if(aski&&ask)aski.value=ask;
  state.bkColors[name]=col;
  state.b[name]=init.toFixed(2);state.start_bk+=init;inp.value='';save();
}
function changeBookColor(el){
  var k=el.dataset.bk;var col=el.value;
  if(!state.bkColors)state.bkColors={};loadCustomLinks();_typeColors=JSON.parse(localStorage.getItem('g45_typecolors')||'{}');var _n=localStorage.getItem('gones45_note');var _ni=$i('pc-note');if(_ni&&_n)_ni.innerHTML=_n;var tk=localStorage.getItem('gones45_tavily_key');var tki=$i('tavily-key-input');if(tki&&tk)tki.value=tk;var ask=localStorage.getItem('gones45_apisports_key');var aski=$i('apisports-key-input');if(aski&&ask)aski.value=ask;
  state.bkColors[k]=col;
  save();
}
function delBook(k){if(confirm('Supprimer '+bki(k).n+' ?')){delete state.b[k];save();}}
function editBook(k){
  var v=prompt('Nouveau solde pour '+bki(k).n+' ?',parseFloat(state.b[k]));
  if(v!=null){var nv=parseFloat(v);if(!isNaN(nv)){state.start_bk+=(nv-parseFloat(state.b[k]));state.b[k]=nv;save();}}
}
function addUnit(){
  var name=($i('u-name')&&$i('u-name').value||'').trim();if(!name)return;
  var color=$i('u-color').value||selColor||PCOLS[0];
  var pending=window._pendingLogo&&window._pendingLogo.name===name?window._pendingLogo:null;
  var abbr=pending?pending.abbr:name.substring(0,3).toUpperCase();
  var logoUrl=pending?pending.url:(LOGOS[name]||null);
  if(pending&&pending.color)color=pending.color;
  if(state.u.find(function(u){return u.n===name;}))return alert('Existe déjà !');
  var ulink=($i('u-link')&&$i('u-link').value.trim())||'';
  var ulink2=($i('u-link2')&&$i('u-link2').value.trim())||'';
  var unote=($i('u-note')&&$i('u-note').value.trim())||'';var utype=($i('u-type')&&$i('u-type').value)||'club';state.u.push({n:name,abbr:abbr,color:color,s:$i('u-stars').value,l:1,sport:($i('u-sport')&&$i('u-sport').value)||'⚽',logoUrl:logoUrl||'',link:ulink,link2:ulink2,note:unote,type:utype});
  if(logoUrl)LOGOS[name]=logoUrl;
  $i('u-name').value='';
  if($i('u-link'))$i('u-link').value='';
  if($i('u-link2'))$i('u-link2').value='';
  $i('search-results').innerHTML='';
  window._pendingLogo=null;
  save();
}
function editUnit(i){
  var u=state.u[parseInt(i)];if(!u)return;
  var m=$i('edit-unit-modal');if(!m)return;
  $i('edit-unit-idx').value=i;
  $i('edit-unit-name').value=u.n||'';
  $i('edit-unit-stars').value=u.s||'3';
  $i('edit-unit-note').value=u.note||'';
  $i('edit-unit-color').value=u.color||'#4d84ff';
  m.style.display='flex';
}
function closeEditUnit(){var m=$i('edit-unit-modal');if(m)m.style.display='none';}
function saveEditUnit(){
  var i=parseInt($i('edit-unit-idx').value);
  var u=state.u[i];if(!u)return;
  var newName=($i('edit-unit-name').value||u.n).trim().toUpperCase();
  // Si le nom change, on garde le logo existant
  u.n=newName;
  u.s=$i('edit-unit-stars').value||u.s;
  u.note=$i('edit-unit-note').value.trim();
  u.color=$i('edit-unit-color').value||u.color;
  // Conserver le logoUrl existant — ne pas l'effacer
  // u.logoUrl reste intact
  save();render();closeEditUnit();
}
function rmUnit(i){var u=state.u[parseInt(i)];if(u&&confirm('Supprimer '+u.n+' ?')){state.u.splice(parseInt(i),1);save();}}

/* ── NAV ── */
function showTab(id,btn){
  document.querySelectorAll('.tab').forEach(function(t){t.style.display='none';});
  var det=$i('detail');if(det)det.style.display='none';
  var t=$i(id);if(t)t.style.display='block';
  document.querySelectorAll('.ni').forEach(function(b){b.classList.remove('on');});
  if(btn)btn.classList.add('on');
  render();
  /* Lazy-render tab-specific content */
  if(id==='t-bilan')setTimeout(function(){renderBilanTab();renderGlobalCharts();},50);
}

// ── COMBINÉ ──
var combiRows = [];

function addCombiRow() {
  var id = Date.now();
  combiRows.push({id:id, label:'', cote:1.50, sport:'⚽'});
  renderCombiRows();
}

function renderCombiRows() {
  var el = document.getElementById('combi-rows');
  if(!el) return;
  if(!combiRows.length) { el.innerHTML=''; updateCombiCote(); return; }
  var sports = ['⚽ Football','🏀 Basket','🎾 Tennis','🏈 NFL','🏒 Hockey','⚾ Baseball','🏉 Rugby','🏎 F1'];
  var html = '';
  combiRows.forEach(function(row, i) {
    html += '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:12px;margin-bottom:10px;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">';
    html += '<span style="font-size:12px;font-weight:800;color:var(--a);">Sélection '+(i+1)+'</span>';
    html += '<button onclick="removeCombiRow('+row.id+')" style="background:none;border:none;color:var(--t3);font-size:16px;cursor:pointer;">✕</button>';
    html += '</div>';
    // Sport + Compet
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">';
    html += '<select class="fi" style="font-size:11px;" onchange="combiRows['+i+'].sport=this.value">';
    sports.forEach(function(s){ var v=s.split(' ')[0]; html += '<option value="'+v+'"'+(row.sport===v?' selected':'')+'>'+s+'</option>'; });
    html += '</select>';
    html += '<input class="fi" placeholder="Compétition" value="'+(row.comp||'')+'" oninput="combiRows['+i+'].comp=this.value" style="font-size:11px;">';
    html += '</div>';
    // Equipe + Adversaire
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">';
    html += '<input class="fi" placeholder="Équipe / Joueur" value="'+(row.team||'')+'" oninput="combiRows['+i+'].team=this.value" style="font-size:11px;">';
    html += '<input class="fi" placeholder="Adversaire" value="'+(row.adv||'')+'" oninput="combiRows['+i+'].adv=this.value" style="font-size:11px;">';
    html += '</div>';
    // Type + Cote
    html += '<div style="display:grid;grid-template-columns:1fr 80px;gap:8px;margin-bottom:8px;">';
    html += '<input class="fi" placeholder="Type de pari (ex: Victoire, O2.5…)" value="'+(row.type||'')+'" oninput="combiRows['+i+'].type=this.value" style="font-size:11px;">';
    html += '<input class="fi" type="number" value="'+row.cote+'" min="1.01" step="0.01" oninput="combiRows['+i+'].cote=parseFloat(this.value)||1;updateCombiCote()" style="font-size:14px;font-weight:800;text-align:center;color:#f0b020;">';
    html += '</div>';
    html += '</div>';
  });
  el.innerHTML = html;
  updateCombiCote();
}

function removeCombiRow(id) {
  combiRows = combiRows.filter(function(r){ return r.id !== id; });
  renderCombiRows();
}

function updateCombiCote() {
  var coteTot = combiRows.reduce(function(acc,r){ return acc*(parseFloat(r.cote)||1); }, 1);
  var mise = parseFloat(document.getElementById('combi-mise')&&document.getElementById('combi-mise').value||0);
  var gain = mise * coteTot;
  var ctEl = document.getElementById('combi-cote-total');
  var gEl = document.getElementById('combi-gain');
  if(ctEl) ctEl.textContent = combiRows.length ? coteTot.toFixed(2) : '—';
  if(gEl) gEl.textContent = (combiRows.length && mise) ? '+'+((gain-mise).toFixed(2))+'€' : '—';
  // Fill bookmaker select
  var bkEl = document.getElementById('combi-book');
  if(bkEl && !bkEl.options.length) {
    Object.keys(state.b||{}).forEach(function(k){
      var opt = document.createElement('option');
      opt.value = k; opt.textContent = k.charAt(0).toUpperCase()+k.slice(1);
      bkEl.appendChild(opt);
    });
  }
}

function setCombiLieu(lieu) {
  var el = document.getElementById('combi-lieu');
  if(el) el.value = lieu;
  ['dom','ext','neu'].forEach(function(l){
    var btn = document.getElementById('combi-'+l+'-btn');
    if(!btn) return;
    var active = (l==='neu' && lieu==='') || l===lieu;
    btn.style.border = active ? '2px solid rgba(30,215,96,.4)' : '2px solid var(--b2)';
    btn.style.background = active ? 'rgba(30,215,96,.1)' : 'var(--bg3)';
    btn.style.color = active ? '#1ed760' : 'var(--t2)';
  });
}

function saveCombi(win) {
  if(!combiRows.length) { alert('Ajoute au moins une sélection'); return; }
  var coteTot = combiRows.reduce(function(acc,r){ return acc*(parseFloat(r.cote)||1); }, 1);
  var mise = parseFloat(document.getElementById('combi-mise').value)||0;
  var book = document.getElementById('combi-book').value;
  var date = document.getElementById('combi-date').value || new Date().toISOString().split('T')[0];
  var heure = document.getElementById('combi-heure').value || '';
  var notes = document.getElementById('combi-notes').value || '';
  var label = combiRows.map(function(r){ return (r.team||r.type||'Sél.')+(r.adv?' vs '+r.adv:''); }).join(' + ');
  var lieu = document.getElementById('combi-lieu') ? document.getElementById('combi-lieu').value : '';
  var isFreebet = document.getElementById('combi-freebet') ? document.getElementById('combi-freebet').checked : false;

  if(!mise || !book) { alert('Mise et bookmaker requis'); return; }

  var pari = {
    id: Date.now().toString(),
    n: label,
    target: combiRows[0]?(combiRows[0].team||combiRows[0].adv||label):label,
    b: book,
    m: mise,
    cote: coteTot,
    win: win,
    sport: combiRows[0]?combiRows[0].sport:'🎲',
    comp: combiRows[0]?combiRows[0].comp:'',
    type: 'Combiné ('+combiRows.length+' sél.)',
    isCombi: true,
    combiRows: combiRows.map(function(r){ return {team:r.team,adv:r.adv,type:r.type,cote:r.cote,sport:r.sport,comp:r.comp}; }),
    t: date,
    date: date,
    heure: heure,
    notes: notes,
    domicile: lieu,
    isFlash: false,
    isFreebet: isFreebet
  };

  state.a.unshift(pari);
  save();

  // Reset
  combiRows = [];
  renderCombiRows();
  document.getElementById('combi-mise').value = '10';
  document.getElementById('combi-notes').value = '';
  document.getElementById('combi-cote-total').textContent = '—';
  document.getElementById('combi-gain').textContent = '—';

  // Feedback
  var profit = win ? (mise*coteTot - mise) : -mise;
  alert((win ? '✅ Gagné !' : '❌ Perdu') + '\n' + label + '\nCote: @'+coteTot.toFixed(2) + '\n' + (win ? '+' : '') + profit.toFixed(2)+'€');
  render();
}

function swBet(mode){
  var isS=mode==='strat';
  var isC=mode==='combi';
  var ss=$i('sub-strat');if(ss)ss.style.display=isS?'block':'none';
  var sp=$i('sub-simple');if(sp)sp.style.display=(!isS&&!isC)?'block':'none';
  var sc=$i('sub-combi');if(sc)sc.style.display=isC?'block':'none';
  var bc=$i('btn-cpit');if(bc)bc.classList.toggle('on',isS);
  var bs=$i('btn-simp');if(bs)bs.classList.toggle('on',!isS&&!isC);
  var bb=$i('btn-comb');if(bb)bb.classList.toggle('on',isC);
  if(isC){ updateCombiCote(); }
}
function exportData(){var d='data:text/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(state));var a=document.createElement('a');a.href=d;a.download='gones45_backup.json';a.click();}

function importBetAnalytix() {
  var bkStr = prompt('💰 Bankroll de départ au moment du premier pari (ex: 1000) :', '');
  if(bkStr === null) return;
  var bkDepart = parseFloat(bkStr) || 0;

  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.onchange = function(e) {
    var file = e.target.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      var text = ev.target.result;
      var lines = text.split('\n').filter(function(l){ return l.trim(); });
      if(!lines.length) return;

      // Parser CSV avec séparateur ;
      function parseCSVLine(line) {
        var result = [], cur = '', inQ = false;
        for(var i=0;i<line.length;i++){
          var c = line[i];
          if(c==='"') { inQ=!inQ; }
          else if(c===';' && !inQ) { result.push(cur.trim()); cur=''; }
          else { cur+=c; }
        }
        result.push(cur.trim());
        return result;
      }

      var headers = parseCSVLine(lines[0]);
      var idxDate=headers.indexOf('Date'), idxType=headers.indexOf('Type'),
          idxSport=headers.indexOf('Sport'), idxLabel=headers.indexOf('Label'),
          idxOdds=headers.indexOf('Odds'), idxStake=headers.indexOf('Stake'),
          idxState=headers.indexOf('State'), idxBook=headers.indexOf('Bookmaker'),
          idxComp=headers.indexOf('Competition'), idxCat=headers.indexOf('Category'),
          idxComment=headers.indexOf('Comment'), idxBonus=headers.indexOf('Bonus'),
          idxFB=headers.indexOf('Freebet');

      var imported = 0, skipped = 0;
      if(!state.a) state.a = [];

      var lastCombined = null; // garde le dernier pari Combined pour y attacher les sous-paris
      lines.slice(1).forEach(function(line) {
        var cols = parseCSVLine(line);
        if(cols.length < 5) { skipped++; return; }

        var dateStr = cols[idxDate]||'';
        var betType = cols[idxType]||'';
        var label   = cols[idxLabel]||'';
        var odds    = parseFloat(cols[idxOdds])||1;
        var stake   = parseFloat(cols[idxStake])||0;

        // Sous-pari d'un combiné : pas de date, pas de mise
        if(!dateStr && !stake && label && lastCombined) {
          var subState = cols[idxState]||'';
          var subWin = subState==='W'||subState==='V'||subState==='WIN'||subState==='GAGNE';
          var subLoss = subState==='L'||subState==='PERDU'||subState==='LOSE';
          var subPend = subState==='P'||subState==='PENDING';
          if(subWin || subLoss || subPend) {
            if(!lastCombined.sousParis) lastCombined.sousParis = [];
            lastCombined.sousParis.push({ label: label, cote: odds, win: subWin, isPending: subPend });
          }
          return;
        }
        var label   = cols[idxLabel]||'';
        var odds    = parseFloat(cols[idxOdds])||1;
        var stake   = parseFloat(cols[idxStake])||0;
        var state2  = cols[idxState]||''; // W/L/V
        var book    = cols[idxBook]||'';
        var sport   = cols[idxSport]||'Football';
        var comp    = cols[idxComp]||'';
        var cat     = cols[idxCat]||'';
        var comment = cols[idxComment]||'';
        var isBonus = cols[idxBonus]==='1'||cols[idxBonus]==='true'||cols[idxBonus]==='TRUE';
        var isFB    = cols[idxFB]==='1'||cols[idxFB]==='true'||cols[idxFB]==='TRUE';

        if(!stake || !odds) { skipped++; return; }

        // Convertir W/L en win
        var win = state2==='W'||state2==='V'||state2==='WIN'||state2==='GAGNE';
        var isLoss = state2==='L'||state2==='PERDU'||state2==='LOSE';
        var isCash = state2==='CASH'||state2==='CASHOUT';
        var isPending = state2==='P'||state2==='EN COURS'||state2==='PENDING';
        if(!win && !isLoss && !isCash && !isPending) { skipped++; return; } // Skip seulement si statut inconnu

        // Cashout : calculer le gain réel depuis la colonne Cashout
        var idxCashout = headers.indexOf('Cashout');
        var cashoutVal = isCash && idxCashout>=0 ? parseFloat(cols[idxCashout])||0 : 0;
        // Si cashout, le profit = cashoutVal - stake
        if(isCash && cashoutVal > 0) {
          win = cashoutVal >= stake; // win si cashout >= mise
        }

        // Convertir sport
        var sportIco = '⚽';
        var sportLower = sport.toLowerCase();
        if(sportLower.indexOf('tennis')>=0) sportIco='🎾';
        else if(sportLower.indexOf('basket')>=0||sportLower.indexOf('nba')>=0) sportIco='🏀';
        else if(sportLower.indexOf('hockey')>=0||sportLower.indexOf('nhl')>=0) sportIco='🏒';
        else if(sportLower.indexOf('baseball')>=0||sportLower.indexOf('mlb')>=0) sportIco='⚾';
        else if(sportLower.indexOf('rugby')>=0) sportIco='🏉';

        // Parser la date
        var dateParts = dateStr.split(' ');
        var dateOnly = dateParts[0]||'';
        var timeOnly = dateParts[1]||'';

        // Extraire le match depuis le label (ex: "Cagliari 0-2 Inter")
        var target = label.replace(/\s+/g,' ').trim();
        // Enlever le score si présent
        var targetClean = target.replace(/\d+\s*[-–]\s*\d+/g,'').replace(/\s+/g,' ').trim();

        // Pour cashout, ajuster la cote pour que le profit soit correct
        // profit = win ? (m*cote - m) : -m
        // Si cashout : profit = cashoutVal - stake → cote = cashoutVal/stake
        var effectiveCote = odds;
        if(isCash && cashoutVal > 0) {
          effectiveCote = cashoutVal / stake;
          win = true; // toujours win pour calculer le profit cashout
        }

        var pari = {
          id: 'ba_'+Date.now()+'_'+Math.random().toString(36).substr(2,5),
          n: cat || label,
          target: targetClean || label,
          cote: effectiveCote,
          m: stake,
          win: win,
          sport: sportIco,
          b: book,
          comp: comp,
          t: dateOnly,
          date: dateOnly,
          heure: timeOnly,
          isFlash: false,
          isFreebet: isFB,
          isCashout: isCash,
          isPending: isPending,
          isCombi: (betType==='Combined'||betType==='Combiné'||(label&&label.toLowerCase().indexOf('combin')>=0)),
          notes: comment,
          source: 'bet-analytix'
        };

        state.a.push(pari);
        imported++;
        // Si c'est un combiné, le mémoriser pour attacher les sous-paris suivants
        if(betType==='Combined'||betType==='Combiné'||(label&&label.toLowerCase().indexOf('combin')>=0)) {
          lastCombined = pari;
        } else {
          lastCombined = null;
        }
      });

      // Trier par date croissante
      state.a.sort(function(a,b){ return new Date(a.date+' '+(a.heure||'00:00')) - new Date(b.date+' '+(b.heure||'00:00')); });

      // Normaliser les noms de bookmakers par correspondance partielle avec state.b
      var existingBks = Object.keys(state.b||{});
      function normalizeBk(name) {
        if(!name) return name;
        var nl = name.toLowerCase().trim();
        // Correspondance exacte d'abord
        if(existingBks.indexOf(nl)>=0) return nl;
        // Correspondance partielle
        var match = existingBks.find(function(k){
          return nl.indexOf(k)>=0 || k.indexOf(nl)>=0 ||
                 nl.replace(/[0-9]/g,'').trim() === k.replace(/[0-9]/g,'').trim();
        });
        return match || nl;
      }
      state.a.forEach(function(h){
        if(h.source==='bet-analytix') h.b = normalizeBk(h.b);
      });

      // Recalculer la BK si bankroll de départ fournie
      if(bkDepart > 0) {
        // Calculer le profit total des paris importés
        var profitTotal = 0;
        state.a.forEach(function(h){
          if(h.source==='bet-analytix'){
            var gain = h.win ? (h.m * h.cote - h.m) : -h.m;
            profitTotal += gain;
          }
        });

        // Mettre à jour la bankroll globale
        state.bk = parseFloat((bkDepart + profitTotal).toFixed(2));
        if(!state.b) state.b = {};
      }

      // Vérifier si tous les paris importés n'ont pas de book
      var newBets = state.a.filter(function(h){ return h.source==='bet-analytix' && !h.b; });
      var allMissingBook = newBets.length > 0 && newBets.length === state.a.filter(function(h){ return h.source==='bet-analytix'; }).length;

      function finalizeImport(defaultBook) {
        // Appliquer le book par défaut si fourni
        if(defaultBook) {
          state.a.forEach(function(h){
            if(h.source==='bet-analytix' && !h.b) h.b = defaultBook;
          });
        }

        save();
        renderArchive && renderArchive();
        render && render();

        var msg = '✅ '+imported+' paris importés depuis Bet-Analytix !';
        if(defaultBook) msg += '\n📚 Book appliqué : '+defaultBook;
        if(skipped) msg += '\n⏭ '+skipped+' lignes ignorées (en cours ou invalides)';
        if(bkDepart > 0) {
          var profit = state.a.filter(function(h){return h.source==='bet-analytix';}).reduce(function(acc,h){return acc+(h.win?(h.m*h.cote-h.m):-h.m);},0);
          msg += '\n💰 BK actuelle recalculée : '+(bkDepart+profit).toFixed(2)+'€ (départ '+bkDepart+'€ + profit '+profit.toFixed(2)+'€)';
        }
        alert(msg);
      }

      if(allMissingBook && existingBks.length > 0) {
        // Créer une modale pour choisir le book par défaut
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
        var box = document.createElement('div');
        box.style.cssText = 'background:var(--bg2,#1a1f2e);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:24px;min-width:280px;max-width:90%;';
        var opts = existingBks.map(function(bk){ return '<option value="'+bk+'">'+bk+'</option>'; }).join('');
        box.innerHTML = '<div style="font-size:14px;font-weight:700;color:var(--t1,#fff);margin-bottom:8px;">📚 Aucun bookmaker dans le CSV</div>'
          +'<div style="font-size:12px;color:var(--t3,#aaa);margin-bottom:16px;">Choisir le book à appliquer à tous les paris importés :</div>'
          +'<select id="default-bk-select" style="width:100%;padding:8px;border-radius:8px;background:var(--bg3,#252b3b);border:1px solid rgba(255,255,255,.15);color:var(--t1,#fff);font-size:13px;margin-bottom:16px;">'
          +opts+'</select>'
          +'<div style="display:flex;gap:8px;">'
          +'<button id="default-bk-ok" style="flex:1;padding:10px;border-radius:8px;background:var(--accent,#4f8ef7);border:none;color:#fff;font-weight:700;cursor:pointer;">Appliquer</button>'
          +'<button id="default-bk-skip" style="flex:1;padding:10px;border-radius:8px;background:rgba(255,255,255,.08);border:none;color:var(--t2,#ccc);cursor:pointer;">Ignorer</button>'
          +'</div>';
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        document.getElementById('default-bk-ok').onclick = function(){
          var chosen = document.getElementById('default-bk-select').value;
          document.body.removeChild(overlay);
          finalizeImport(chosen);
        };
        document.getElementById('default-bk-skip').onclick = function(){
          document.body.removeChild(overlay);
          finalizeImport(null);
        };
      } else {
        finalizeImport(null);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };
  input.click();
}

function importData(){var i=document.createElement('input');i.type='file';i.onchange=function(e){var r=new FileReader();r.onload=function(ev){state=JSON.parse(ev.target.result);save();location.reload();};r.readAsText(e.target.files[0]);};i.click();}


/* ── GLOBAL TAB ── */
var GC2={};
function showGTab(id, btn){
  var container=$i('t-bilan')||document;
  container.querySelectorAll('.gtab').forEach(function(b){b.classList.remove('on');});
  container.querySelectorAll('.gpanel').forEach(function(p){p.classList.remove('on');});
  if(btn)btn.classList.add('on');
  var p=$i(id);if(p)p.classList.add('on');
  if(id==='g-global')renderGlobalCharts();
  if(id==='g-equipes')renderEquipes();
}

/* ── SUB-VIEW TABS IN BILAN ── */
function showBilanView(id, btn){
  document.querySelectorAll('#t-bilan .gpanel').forEach(function(p){p.classList.remove('on');});
  var target=$i(id);if(target)target.classList.add('on');
  if(btn){
    var row=btn.parentElement;
    if(row)row.querySelectorAll('.gtab').forEach(function(b){b.classList.remove('on');});
    btn.classList.add('on');
  }
  if(id==='g-global')renderGlobalCharts();
  if(id==='g-equipes')renderEquipes();
}


var _multiSelected=null;
function toggleCurvePicker(){
  var p=$i('curve-picker');if(!p)return;
  var open=p.style.display==='block';
  p.style.display=open?'none':'block';
  if(!open){renderCurvePicker();setTimeout(function(){document.addEventListener('click',function h(e){var btn=$i('curve-picker-btn'),pk=$i('curve-picker');if(pk&&btn&&!pk.contains(e.target)&&!btn.contains(e.target)){pk.style.display='none';document.removeEventListener('click',h);}});},50);}
}
function renderCurvePicker(){
  var list=$i('curve-picker-list');if(!list)return;
  if(!_multiSelected)_multiSelected={};
  var teams=state.u.filter(function(u){return state.a.some(function(h){return h.n===u.n;});});
  var cnt=Object.values(_multiSelected).filter(Boolean).length;
  list.innerHTML=teams.map(function(u){
    var on=!!_multiSelected[u.n];var dis=!on&&cnt>=5;
    var sn=u.n.replace(/"/g,'&quot;');
    var esc=sn.replace(/"/g,'&quot;');
    return '<label style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--b1);cursor:'+(dis?'not-allowed':'pointer')+';opacity:'+(dis?'.45':'1')+';">'
      +'<input type="checkbox" '+(on?'checked':'')+' '+(dis&&!on?'disabled':'')+' data-nom="'+sn+'" onchange="toggleCurveTeam(this)" style="accent-color:'+(u.color||'#4d84ff')+';width:15px;height:15px;flex-shrink:0;">'
      +'<input type="color" value="'+(u.color||'#4d84ff')+'" title="Changer couleur" data-nom="'+sn+'" onchange="changeCurveColor(this)" onclick="event.stopPropagation();" style="width:18px;height:18px;border-radius:50%;border:none;padding:0;cursor:pointer;flex-shrink:0;background:none;">'
      +'<span style="font-size:12px;font-weight:600;flex:1;">'+u.n+'</span>'
      +(on?'<span style="font-size:9px;color:'+(u.color||'#4d84ff')+';font-weight:700;">✓</span>':'')+'</label>';
  }).join('');
  var btn=$i('curve-picker-btn');if(btn)btn.textContent='⚙️ '+cnt+'/5';
}
function changeCurveColor(el){
  var nom=el.dataset.nom;var col=el.value;
  var u=state.u.find(function(x){return x.n===nom;});
  if(u){u.color=col;save();}
  if(_multiSelected&&_multiSelected[nom])renderMultiCurveChart();
  renderCurvePicker();
}
function toggleCurveTeam(el){
  var nom=el.dataset.nom;var checked=el.checked;
  if(!_multiSelected)_multiSelected={};
  var cnt=Object.values(_multiSelected).filter(Boolean).length;
  if(checked&&cnt>=5){el.checked=false;renderCurvePicker();return;}
  _multiSelected[nom]=checked;renderCurvePicker();renderMultiCurveChart();
}
function renderMultiCurveChart(){
  var ctx=$i('chart-multi');if(!ctx)return;
  if(window._gcM){try{window._gcM.destroy();}catch(e){}}window._gcM=null;
  var leg=$i('chart-multi-legend');if(leg)leg.innerHTML='';
  var all=[];
  state.u.forEach(function(u){
    var paris=state.a.filter(function(h){return h.n===u.n;});if(!paris.length)return;
    var cum=0;
    var dlabels=['Départ'].concat(paris.slice().reverse().map(function(h){var adv4=h.target&&h.target!=='-'?h.target:'';return (h.date||'')+(adv4?' vs '+adv4:'')+(h.l?' P'+h.l:'');}));
    var data=[0].concat(paris.slice().reverse().map(function(h){cum+=(h.win?(parseFloat(h.m)*parseFloat(h.cote))-parseFloat(h.m):-parseFloat(h.m));return parseFloat(cum.toFixed(2));}));
    var _c=u.color&&all.every(function(x){return x._color!==u.color;})?u.color:CURVE_COLS[all.length%CURVE_COLS.length];
    all.push({label:u.n,data:data,_labels:dlabels,borderColor:_c,backgroundColor:'transparent',borderWidth:1.5,tension:.4,pointRadius:3,pointHoverRadius:10,pointHoverBorderColor:'#fff',pointHoverBorderWidth:2,pointHitRadius:30,_color:_c});
  });
  if(!all.length){if(leg)leg.innerHTML='<span style="font-size:11px;color:var(--t3);">Aucun historique</span>';return;}
  if(!_multiSelected)_multiSelected={};
  /* Auto-sélectionner top 5 si premier chargement ou nouvelles équipes */
  var hasSelection=Object.values(_multiSelected).some(Boolean);
  if(!hasSelection){
    var sorted=all.slice().sort(function(a,b){return (b.data[b.data.length-1]||0)-(a.data[a.data.length-1]||0);});
    sorted.forEach(function(d,i){_multiSelected[d.label]=i<5;});
  } else {
    all.forEach(function(d){if(_multiSelected[d.label]===undefined)_multiSelected[d.label]=false;});
  }
  var active=all.filter(function(d){return _multiSelected[d.label];});
  if(leg)leg.innerHTML=active.map(function(d){return '<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;color:var(--t2);white-space:nowrap;flex-shrink:0;"><span style="display:inline-block;width:10px;height:3px;border-radius:2px;background:'+d._color+';"></span>'+d.label+'</span>';}).join('');
  var btn=$i('curve-picker-btn');if(btn)btn.textContent='⚙️ '+active.length+'/5';
  if(!active.length)return;
  var maxLen=active.reduce(function(m,d){return Math.max(m,d.data.length);},0);
  active.forEach(function(d){while(d.data.length<maxLen)d.data.push(null);});
  setTimeout(function(){
    if(!$i('chart-multi'))return;
    var ct=$i('chart-multi').getContext('2d');
    window._gcM=new Chart(ct,{type:'line',data:{labels:Array.from({length:maxLen},function(_,i){return i;}),datasets:active},options:{
      animation:false,responsive:true,maintainAspectRatio:false,interaction:{mode:'nearest',intersect:false},
      plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(8,11,18,.96)',borderColor:'rgba(255,255,255,.1)',borderWidth:1,
        callbacks:{title:function(ii){var d=active[0];return d&&d._labels?d._labels[ii[0].dataIndex]||'':'';},label:function(i){return ' '+i.dataset.label+' : '+(i.raw!==null?(i.raw>=0?'+':'')+i.raw.toFixed(2)+'€':'—');}}}},
      scales:{x:{display:false},y:{grid:{color:'rgba(255,255,255,.03)'},border:{display:false},ticks:{color:'#4f5d88',font:{size:9},maxTicksLimit:4,callback:function(v){return v+'€';}}}}
    }});
    attachTouchTooltip('chart-multi',function(){return window._gcM;},'cib-multi','cib-multi-txt','cib-multi-val');
  },80);
}
function renderGlobalCharts(){
  renderGlobalChart();
  setTimeout(function(){
    renderMultiCurveChart();
    renderBooksChart();
    renderPaliersChart();
    setTimeout(function(){renderRadarChart();renderChartMoisBar();renderChartSport();renderChartTypeBen();renderChartTypeDonut();renderStreakPanel();},200);
  },100);
}

function renderBooksChart(){
  var ctx=$i('chart-books');if(!ctx)return;
  if(GC2.books){try{GC2.books.destroy();}catch(e){}}
  var total=Object.values(state.b).reduce(function(a,v){return a+parseFloat(v||0);},0);
  if(total<=0){ctx.parentElement.innerHTML='<div class="empty">Aucun solde</div>';return;}
  var labels=[],data=[],colors=[];
  Object.entries(state.b).forEach(function(e){
    var v=parseFloat(e[1]||0);
    if(v>0){labels.push(bki(e[0]).n);data.push(v);colors.push(bki(e[0]).c);}
  });
  if(!data.length){ctx.parentElement.innerHTML='<div class="empty">Aucun solde positif</div>';return;}
  GC2.books=new Chart(ctx.getContext('2d'),{
    type:'doughnut',
    data:{labels:labels,datasets:[{data:data,backgroundColor:colors.map(function(c){return c+'aa';}),borderColor:colors,borderWidth:1,hoverOffset:4}]},
    options:{
      responsive:true,maintainAspectRatio:false,cutout:'65%',
      plugins:{
        legend:{display:true,position:'right',labels:{color:'#8b97c4',font:{size:10},boxWidth:10,padding:8}},
        tooltip:{backgroundColor:'rgba(8,11,18,.96)',callbacks:{label:function(i){return i.label+': '+i.raw.toFixed(2)+'€ ('+((i.raw/total)*100).toFixed(1)+'%)';}}}
      }
    }
  });
}

function renderPaliersChart(){
  var ctx=$i('chart-paliers');if(!ctx)return;
  if(GC2.paliers){try{GC2.paliers.destroy();}catch(e){}}
  if(!state.u.length){ctx.parentElement.innerHTML='<div class="empty">Aucune équipe</div>';return;}
  var labels=state.u.map(function(u){return u.n.substring(0,8);});
  var data=state.u.map(function(u){return u.l;});
  var colors=state.u.map(function(u){
    var l=u.l;
    return l>=6?'rgba(255,69,69,.8)':l>=4?'rgba(240,176,32,.8)':l>=2?'rgba(77,132,255,.7)':'rgba(30,215,96,.7)';
  });
  GC2.paliers=new Chart(ctx.getContext('2d'),{
    type:'bar',
    data:{labels:labels,datasets:[{label:'Palier actuel',data:data,backgroundColor:colors,borderColor:colors.map(function(c){return c.replace('.7','.9').replace('.8','1');}),borderWidth:1,borderRadius:4}]},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:function(i){return 'Palier '+i.raw+' ('+state.u[i.dataIndex].n+')';}}}},
      scales:{
        x:{ticks:{color:'#4f5d88',font:{size:9}},grid:{display:false}},
        y:{min:0,max:8,ticks:{color:'#4f5d88',font:{size:9},stepSize:1},grid:{color:'rgba(255,255,255,.03)'}}
      }
    }
  });
}

function renderRadarChart(){
  var ctx=$i('chart-radar');if(!ctx)return;
  if(GC2.radar){try{GC2.radar.destroy();}catch(e){}}
  if(!state.a.length){ctx.parentElement.innerHTML='<div class="empty">Aucun historique</div>';return;}
  var typeMap={};
  state.a.forEach(function(h){
    var t=(h.type||'Autre').trim()||'Autre';
    if(!typeMap[t])typeMap[t]={n:0,wins:0,profit:0,mise:0};
    typeMap[t].n++;
    if(h.win)typeMap[t].wins++;
    typeMap[t].profit+=(h.win?(h.m*h.cote)-h.m:-h.m);
    typeMap[t].mise+=parseFloat(h.m||0);
  });
  var entries=Object.entries(typeMap).sort(function(a,b){return b[1].n-a[1].n;}).slice(0,8);
  var labels=entries.map(function(e){return e[0];});
  var wrData=entries.map(function(e){return parseFloat((e[1].wins/e[1].n*100).toFixed(1));});
  var roiData=entries.map(function(e){return e[1].mise>0?parseFloat((e[1].profit/e[1].mise*100).toFixed(1)):0;});
  GC2.radar=new Chart(ctx.getContext('2d'),{
    type:'radar',
    data:{
      labels:labels,
      datasets:[
        {label:'Réussite %',data:wrData,borderColor:'rgba(30,215,96,.9)',backgroundColor:'rgba(30,215,96,.08)',borderWidth:2,pointBackgroundColor:'#1ed760',pointRadius:3},
        {label:'ROI %',data:roiData,borderColor:'rgba(77,132,255,.9)',backgroundColor:'rgba(77,132,255,.06)',borderWidth:2,pointBackgroundColor:'#4d84ff',pointRadius:3}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:true,labels:{color:'#8b97c4',font:{size:10},boxWidth:10}}},
      scales:{r:{ticks:{color:'#4f5d88',font:{size:9},backdropColor:'transparent'},grid:{color:'rgba(255,255,255,.07)'},pointLabels:{color:'#8b97c4',font:{size:9}}}}
    }
  });
}

/* ── MYMATCH ── */
var mmRows=[
  {type:'Victoire',cote:1.80},
  {type:'BTS Oui',cote:1.70}
];
var MM_TYPES=['Victoire','Nul','Défaite','BTS Oui','BTS Non','Over 1.5','Over 2.5','Under 2.5','HC -1','HC +1','Mi-temps'];

function renderMmRows(){
  var sel=$i('mm-sel');if(!sel)return;
  sel.innerHTML=mmRows.map(function(r,i){
    return '<div class="mm-row">'
      +'<input class="fi mm-cote" value="'+r.type+'" placeholder="Type (Victoire…)" data-idx="'+i+'" oninput="mmRows[this.dataset.idx].type=this.value;renderMmCote();" style="flex:1;padding:6px 8px;font-size:12px;">'
      +'<input type="number" class="fi mm-cote" value="'+r.cote+'" step="0.01" data-idx="'+i+'" oninput="mmRows[this.dataset.idx].cote=parseFloat(this.value)||1;renderMmCote();" style="width:72px;color:var(--a);font-weight:700;">'
      +(mmRows.length>1?'<button class="mm-del" data-idx="'+i+'" onclick="mmRows.splice(parseInt(this.dataset.idx),1);renderMmRows();">✕</button>':'')
      +'</div>';
  }).join('');
  var types=$i('mm-types');
  if(types)types.innerHTML=MM_TYPES.map(function(t){
    return '<button class="mm-type" onclick="addMmType(\''+t+'\')">'+ t+'</button>';
  }).join('');
  renderMmCote();
}
function renderMmCote(){
  var cote=mmRows.reduce(function(a,r){return a*(parseFloat(r.cote)||1);},1);
  var el=$i('mm-cote-total');
  if(el)el.innerText='@'+cote.toFixed(2);
  /* sync to cockpit cote field */
  var cc=$i('c-cote');if(cc)cc.value=cote.toFixed(2);
  renderCrash();
}
function addMmRow(){mmRows.push({type:'',cote:1.50});renderMmRows();}
function addMmType(t){
  var existing=mmRows.find(function(r){return r.type===t;});
  if(existing)return;
  mmRows.push({type:t,cote:1.50});renderMmRows();
}

// ── ENREGISTRER MYMATCH COMME PARI ──

function setLieu(v) {
  var inp = document.getElementById('n-lieu');
  if(inp) inp.value = v;
  var btns = {'dom':'btn-dom','ext':'btn-ext','':'btn-neut'};
  Object.keys(btns).forEach(function(k){
    var b = document.getElementById(btns[k]);
    if(!b) return;
    if(k===v){
      b.style.borderColor='rgba(30,215,96,.5)';b.style.background='rgba(30,215,96,.12)';b.style.color='#1ed760';
    } else {
      b.style.borderColor='var(--b2)';b.style.background='none';b.style.color='var(--t3)';
    }
  });
}

function saveMmAsPari(mode) {
  var rows = mode === 'cockpit' ? mmRows : mmRowsSimple;
  if (!rows || !rows.length || !rows.some(function(r){ return r.type; })) {
    alert('Ajoute au moins une sélection !'); return;
  }
  var cote = rows.reduce(function(a,r){ return a*(parseFloat(r.cote)||1); }, 1);
  var label = rows.filter(function(r){ return r.type; }).map(function(r){ return r.type+' @'+r.cote; }).join(' + ');

  // Récupérer les infos selon le mode
  var team, mise, book, date, sport, comp;
  if (mode === 'cockpit') {
    team = ($i('c-unit') && $i('c-unit').value) || 'MyMatch';
    mise = parseFloat($i('c-mise') && $i('c-mise').value) || 0;
    book = ($i('c-book') && $i('c-book').value) || '';
    date = ($i('c-date') && $i('c-date').value) || new Date().toISOString().split('T')[0];
    sport = ($i('c-sport') && $i('c-sport').value) || '⚽';
    comp = ($i('c-comp') && $i('c-comp').value) || '';
  } else {
    team = ($i('n-team') && $i('n-team').value) || 'MyMatch';
    mise = parseFloat($i('n-mise') && $i('n-mise').value) || 0;
    book = ($i('n-book') && $i('n-book').value) || '';
    date = ($i('n-date') && $i('n-date').value) || new Date().toISOString().split('T')[0];
    sport = ($i('p-sport') && $i('p-sport').value) || '⚽';
    comp = ($i('n-comp') && $i('n-comp').value) || '';
  }

  if (!mise) { alert('Renseigne une mise !'); return; }

  // Créer le pari dans l'archive comme un pari en attente
  var pari = {
    id: Date.now(),
    n: team || 'Combiné',
    cote: parseFloat(cote.toFixed(2)),
    m: mise,
    book: book,
    date: date,
    sport: sport,
    comp: comp,
    type: label,
    mm: true,  // marqué comme MyMatch
    win: null, // en attente de résultat
    r: null
  };

  if (!state.p) state.p = [];
  state.p.push(pari);
  save();

  // Feedback visuel
  var btn = event && event.target;
  if (btn) {
    btn.textContent = '✓ Enregistré !';
    btn.style.borderColor = 'rgba(30,215,96,.8)';
    btn.style.background = 'rgba(30,215,96,.2)';
    setTimeout(function(){ btn.textContent = '💾 Enregistrer pari'; btn.style.borderColor='rgba(30,215,96,.4)'; btn.style.background='rgba(30,215,96,.1)'; }, 2000);
  }

  render();
}

function getMmLabel(){
  return mmRows.filter(function(r){return r.type;}).map(function(r){return r.type+' @'+r.cote;}).join(' + ');
}
function getMmCote(){
  return mmRows.reduce(function(a,r){return a*(parseFloat(r.cote)||1);},1);
}

/* ── SEARCH CLUB API-SPORTS ── */
var _searchTimer=null;
function debounceSearchClub(){
  clearTimeout(_searchTimer);
  _searchTimer=setTimeout(searchClub,600);
}
function searchClub(){
  var q=($i('u-search')&&$i('u-search').value||'').trim();
  var res=$i('search-results');if(!res)return;
  if(q.length<2){res.innerHTML='';window._srCache=[];return;}
  res.innerHTML='<div class="search-loading">🔍 Recherche...</div>';
  window._srCache=fuzzyClubSearch(q);
  if(window._srCache.length){
    res.innerHTML='<div class="search-res">'+window._srCache.map(function(r,i){
      return '<div class="sr-item" data-idx="'+i+'" onclick="selectClub(+this.dataset.idx)">'
        +'<img class="sr-logo" src="'+r.logo+'" onerror="logoErr(this)" loading="lazy">'
        +'<div><div class="sr-name">'+r.name+'</div>'
        +'<div class="sr-meta">'+r.league+' · '+'&#9733;'.repeat(r.stars||3)+'</div></div>'
        +'<span style="font-size:11px;color:var(--a);font-weight:700;">&#8629;</span>'
        +'</div>';
    }).join('')+'</div>';
  } else {
    res.innerHTML='<div class="search-res"><div class="sr-item" style="cursor:default;color:var(--t3);">Aucun résultat</div></div>';
  }
}
function selectClub(idx){
  var r=(window._srCache||[])[idx];if(!r)return;
  if($i('u-name'))$i('u-name').value=r.name;
  if($i('u-note'))$i('u-note').value=r.note||'';
  if($i('u-stars'))$i('u-stars').value=String(r.stars||3);
  if(r.color){if($i('u-color'))$i('u-color').value=r.color;selColor=r.color;renderColorPicker();}
  window._pendingLogo={name:r.name,url:r.logo,abbr:r.abbr||r.name.substring(0,3).toUpperCase(),color:r.color||PCOLS[0]};
  if($i('u-link2')&&r.flashscore)$i('u-link2').value=r.flashscore;
  if($i('u-link')&&r.sofascore)$i('u-link').value=r.sofascore;
  var res=$i('search-results');
  if(res)res.innerHTML='<div style="color:var(--g);font-size:11px;font-weight:700;padding:8px 0;">✅ '+r.name+' sélectionné — clique sur Ajouter</div>';
}
/* ── EMBEDDED CLUB DATABASE (top 200+ clubs) ── */
var CLUB_DB=[
  {name:"Bayern Munich",league:"Bundesliga",logo:"https://media.api-sports.io/football/teams/157.png",abbr:"FCB",stars:4,color:"#dc2626",flashscore:"https://www.flashscore.fr/equipe/bayern/nVp0wiqd/",sofascore:"https://www.sofascore.com/team/football/bayern-munich/2672"},
  {name:"Borussia Dortmund",league:"Bundesliga",logo:"https://media.api-sports.io/football/teams/165.png",abbr:"BVB",stars:4,color:"#f0b020"},
  {name:"RB Leipzig",league:"Bundesliga",logo:"https://media.api-sports.io/football/teams/173.png",abbr:"RBL",stars:3,color:"#cc0000"},
  {name:"Bayer Leverkusen",league:"Bundesliga",logo:"https://media.api-sports.io/football/teams/168.png",abbr:"B04",stars:3,color:"#cc0000"},
  {name:"Real Madrid",league:"La Liga",logo:"https://media.api-sports.io/football/teams/541.png",abbr:"RMA",stars:5,color:"#94a3b8",flashscore:"https://www.flashscore.fr/equipe/real-madrid/W8mj7MDD/",sofascore:"https://www.sofascore.com/team/football/real-madrid/2829"},
  {name:"FC Barcelone",league:"La Liga",logo:"https://media.api-sports.io/football/teams/529.png",abbr:"BAR",stars:5,color:"#3b82f6",flashscore:"https://www.flashscore.fr/equipe/barcelone/GOLd4Ilf/",sofascore:"https://www.sofascore.com/team/football/barcelona/2817"},
  {name:"Atletico Madrid",league:"La Liga",logo:"https://media.api-sports.io/football/teams/530.png",abbr:"ATM",stars:4,color:"#cc0000"},
  {name:"Villarreal",league:"La Liga",logo:"https://media.api-sports.io/football/teams/533.png",abbr:"VIL",stars:3,color:"#f0b020"},
  {name:"Athletic Bilbao",league:"La Liga",logo:"https://media.api-sports.io/football/teams/531.png",abbr:"ATH",stars:3,color:"#cc0000"},
  {name:"PSG",league:"Ligue 1",logo:"https://media.api-sports.io/football/teams/85.png",abbr:"PSG",stars:4,color:"#c8a050",flashscore:"https://www.flashscore.fr/equipe/psg/CjhkPw0k/",sofascore:"https://www.sofascore.com/team/football/paris-saint-germain/1644"},
  {name:"Lyon",league:"Ligue 1",logo:"https://media.api-sports.io/football/teams/80.png",abbr:"OL",stars:3,color:"#c8a050",flashscore:"https://www.flashscore.fr/equipe/lyon/2akflumR/",sofascore:"https://www.sofascore.com/team/football/lyon/1649"},
  {name:"Marseille",league:"Ligue 1",logo:"https://media.api-sports.io/football/teams/81.png",abbr:"OM",stars:3,color:"#3b82f6",flashscore:"https://www.flashscore.fr/equipe/marseille/GRk7WQET/",sofascore:"https://www.sofascore.com/team/football/marseille/1641"},
  {name:"Monaco",league:"Ligue 1",logo:"https://media.api-sports.io/football/teams/91.png",abbr:"ASM",stars:3,color:"#cc0000",flashscore:"https://www.flashscore.fr/equipe/monaco/dOUzNP1B/",sofascore:"https://www.sofascore.com/team/football/monaco/1638"},
  {name:"Lille",league:"Ligue 1",logo:"https://media.api-sports.io/football/teams/79.png",abbr:"LOSC",stars:3,color:"#cc0000"},
  {name:"Nice",league:"Ligue 1",logo:"https://media.api-sports.io/football/teams/84.png",abbr:"OGC",stars:2,color:"#cc0000"},
  {name:"Rennes",league:"Ligue 1",logo:"https://media.api-sports.io/football/teams/93.png",abbr:"SRFC",stars:2,color:"#cc0000"},
  {name:"Lens",league:"Ligue 1",logo:"https://media.api-sports.io/football/teams/116.png",abbr:"RCL",stars:2,color:"#f0b020"},
  {name:"Manchester City",league:"Premier League",logo:"https://media.api-sports.io/football/teams/50.png",abbr:"MCI",stars:5,color:"#3b82f6",flashscore:"https://www.flashscore.fr/equipe/manchester-city/E8Ysm0MO/",sofascore:"https://www.sofascore.com/team/football/manchester-city/17"},
  {name:"Arsenal",league:"Premier League",logo:"https://media.api-sports.io/football/teams/42.png",abbr:"ARS",stars:4,color:"#cc0000",flashscore:"https://www.flashscore.fr/equipe/arsenal/G0g5WGBD/",sofascore:"https://www.sofascore.com/team/football/arsenal/42"},
  {name:"Liverpool",league:"Premier League",logo:"https://media.api-sports.io/football/teams/40.png",abbr:"LIV",stars:5,color:"#cc0000",flashscore:"https://www.flashscore.fr/equipe/liverpool/Ij4aLvSF/",sofascore:"https://www.sofascore.com/team/football/liverpool/44"},
  {name:"Chelsea",league:"Premier League",logo:"https://media.api-sports.io/football/teams/49.png",abbr:"CHE",stars:4,color:"#3b82f6"},
  {name:"Manchester United",league:"Premier League",logo:"https://media.api-sports.io/football/teams/33.png",abbr:"MAN",stars:4,color:"#cc0000"},
  {name:"Tottenham",league:"Premier League",logo:"https://media.api-sports.io/football/teams/47.png",abbr:"TOT",stars:3,color:"#94a3b8"},
  {name:"Newcastle",league:"Premier League",logo:"https://media.api-sports.io/football/teams/34.png",abbr:"NEW",stars:3,color:"#94a3b8"},
  {name:"Aston Villa",league:"Premier League",logo:"https://media.api-sports.io/football/teams/66.png",abbr:"AVL",stars:3,color:"#7c3aed"},
  {name:"Inter Milan",league:"Serie A",logo:"https://media.api-sports.io/football/teams/505.png",abbr:"INT",stars:4,color:"#0ea5e9",flashscore:"https://www.flashscore.fr/equipe/inter/Iw7eKK25/",sofascore:"https://www.sofascore.com/team/football/inter/2697"},
  {name:"AC Milan",league:"Serie A",logo:"https://media.api-sports.io/football/teams/489.png",abbr:"ACM",stars:4,color:"#cc0000"},
  {name:"Juventus",league:"Serie A",logo:"https://media.api-sports.io/football/teams/496.png",abbr:"JUV",stars:4,color:"#94a3b8",flashscore:"https://www.flashscore.fr/equipe/juventus/lB7mkbhH/",sofascore:"https://www.sofascore.com/team/football/juventus/2710"},
  {name:"Napoli",league:"Serie A",logo:"https://media.api-sports.io/football/teams/492.png",abbr:"NAP",stars:3,color:"#3b82f6"},
  {name:"AS Roma",league:"Serie A",logo:"https://media.api-sports.io/football/teams/497.png",abbr:"ROM",stars:3,color:"#f0b020"},
  {name:"Lazio",league:"Serie A",logo:"https://media.api-sports.io/football/teams/487.png",abbr:"LAZ",stars:3,color:"#3b82f6"},
  {name:"Fiorentina",league:"Serie A",logo:"https://media.api-sports.io/football/teams/502.png",abbr:"FIO",stars:2,color:"#7c3aed"},
  {name:"Atalanta",league:"Serie A",logo:"https://media.api-sports.io/football/teams/499.png",abbr:"ATA",stars:3,color:"#0ea5e9"},
  {name:"PSV",league:"Eredivisie",logo:"https://media.api-sports.io/football/teams/674.png",abbr:"PSV",stars:3,color:"#cc0000",flashscore:"https://www.flashscore.fr/equipe/psv/M9UEHJWi/",sofascore:"https://www.sofascore.com/team/football/psv/2295"},
  {name:"Ajax",league:"Eredivisie",logo:"https://media.api-sports.io/football/teams/194.png",abbr:"AJX",stars:3,color:"#cc0000"},
  {name:"Feyenoord",league:"Eredivisie",logo:"https://media.api-sports.io/football/teams/197.png",abbr:"FEY",stars:3,color:"#cc0000"},
  {name:"Portugal",league:"Nations",logo:"https://media.api-sports.io/football/teams/27.png",abbr:"POR",stars:4,color:"#cc0000"},
  {name:"France",league:"Nations",logo:"https://media.api-sports.io/football/teams/2.png",abbr:"FRA",stars:4,color:"#3b82f6"},
  {name:"Espagne",league:"Nations",logo:"https://media.api-sports.io/football/teams/9.png",abbr:"ESP",stars:4,color:"#f0b020"},
  {name:"Angleterre",league:"Nations",logo:"https://media.api-sports.io/football/teams/10.png",abbr:"ENG",stars:4,color:"#cc0000"},
  {name:"Allemagne",league:"Nations",logo:"https://media.api-sports.io/football/teams/25.png",abbr:"GER",stars:4,color:"#f0b020"},
  {name:"Brésil",league:"International",logo:"https://media.api-sports.io/football/teams/6.png",abbr:"BRA",stars:5,color:"#f0b020"},
  {name:"Argentine",league:"International",logo:"https://media.api-sports.io/football/teams/26.png",abbr:"ARG",stars:5,color:"#3b82f6"},
  {name:"Boca Juniors",league:"Argentine",logo:"https://media.api-sports.io/football/teams/405.png",abbr:"BJR",stars:3,color:"#f0b020",flashscore:"https://www.flashscore.fr/equipe/boca-juniors/hMrWAFH0/",sofascore:"https://www.sofascore.com/team/football/boca-juniors/1028"},
  {name:"River Plate",league:"Argentine",logo:"https://media.api-sports.io/football/teams/406.png",abbr:"RIV",stars:3,color:"#cc0000"},
  {name:"Flamengo",league:"Brésil",logo:"https://media.api-sports.io/football/teams/127.png",abbr:"FLA",stars:3,color:"#cc0000"},
  {name:"Palmeiras",league:"Brésil",logo:"https://media.api-sports.io/football/teams/121.png",abbr:"PAL",stars:3,color:"#22c55e",flashscore:"https://www.flashscore.fr/equipe/palmeiras/hMn9FTbH/",sofascore:"https://www.sofascore.com/team/football/palmeiras/1945"},
  {name:"Benfica",league:"Liga Portugal",logo:"https://media.api-sports.io/football/teams/211.png",abbr:"SLB",stars:3,color:"#cc0000"},
  {name:"Sporting CP",league:"Liga Portugal",logo:"https://media.api-sports.io/football/teams/228.png",abbr:"SCP",stars:3,color:"#22c55e"},
  {name:"Porto",league:"Liga Portugal",logo:"https://media.api-sports.io/football/teams/212.png",abbr:"FCP",stars:3,color:"#3b82f6"},
  /* NHL */
  {name:"Carolina Hurricanes",league:"NHL",logo:"https://media.api-sports.io/hockey/teams/7.png",abbr:"CAR",stars:3,color:"#cc0000"},
  {name:"Colorado Avalanche",league:"NHL",logo:"https://media.api-sports.io/hockey/teams/9.png",abbr:"COL",stars:3,color:"#7c3aed"},
  {name:"Tampa Bay Lightning",league:"NHL",logo:"https://media.api-sports.io/hockey/teams/24.png",abbr:"TBL",stars:3,color:"#3b82f6"},
  {name:"Vegas Golden Knights",league:"NHL",logo:"https://media.api-sports.io/hockey/teams/26.png",abbr:"VGK",stars:3,color:"#f0b020"},
  {name:"Florida Panthers",league:"NHL",logo:"https://media.api-sports.io/hockey/teams/15.png",abbr:"FLA",stars:3,color:"#cc0000"},
  /* MLB */
  {name:"LA Dodgers",league:"MLB",logo:"https://media.api-sports.io/baseball/teams/19.png",abbr:"LAD",stars:3,color:"#3b82f6"},
  {name:"New York Yankees",league:"MLB",logo:"https://media.api-sports.io/baseball/teams/9.png",abbr:"NYY",stars:3,color:"#94a3b8"},
  {name:"Atlanta Braves",league:"MLB",logo:"https://media.api-sports.io/baseball/teams/15.png",abbr:"ATL",stars:3,color:"#cc0000"},
  /* NBA */
  {name:"Golden State Warriors",league:"NBA",logo:"https://media.api-sports.io/basketball/teams/11.png",abbr:"GSW",stars:4,color:"#f0b020"},
  {name:"Los Angeles Lakers",league:"NBA",logo:"https://media.api-sports.io/basketball/teams/17.png",abbr:"LAL",stars:4,color:"#7c3aed"},
  {name:"Boston Celtics",league:"NBA",logo:"https://media.api-sports.io/basketball/teams/2.png",abbr:"BOS",stars:4,color:"#22c55e"},
  {name:"Miami Heat",league:"NBA",logo:"https://media.api-sports.io/basketball/teams/20.png",abbr:"MIA",stars:3,color:"#cc0000"}
];

function fuzzyClubSearch(q){
  var ql=q.toLowerCase().replace(/[-_'\.]/g,'');
  return CLUB_DB.filter(function(c){
    var nl=c.name.toLowerCase().replace(/[-_'\.]/g,'');
    var al=(c.abbr||'').toLowerCase();
    return nl.includes(ql)||ql.includes(nl.substring(0,4))||al.startsWith(ql)||nl.startsWith(ql);
  }).slice(0,8);
}


/* ── SOFASCORE ── */
var SOFASCORE_LINKS={
  "Bayern Munich":"https://www.sofascore.com/team/football/bayern-munich/2672",
  "Boca Juniors":"https://www.sofascore.com/team/football/boca-juniors/1028",
  "France":"https://www.sofascore.com/team/football/france/4418",
  "Inter Milan":"https://www.sofascore.com/team/football/inter/2697",
  "Lyon":"https://www.sofascore.com/team/football/lyon/1649",
  "Palmeiras":"https://www.sofascore.com/team/football/palmeiras/1945",
  "PSG":"https://www.sofascore.com/team/football/paris-saint-germain/1644",
  "PSV":"https://www.sofascore.com/team/football/psv/2295",
  "Real Madrid":"https://www.sofascore.com/team/football/real-madrid/2829",
  "Marseille":"https://www.sofascore.com/team/football/marseille/1641",
  "Monaco":"https://www.sofascore.com/team/football/monaco/1638",
  "Lille":"https://www.sofascore.com/team/football/lille/1636",
  "Manchester City":"https://www.sofascore.com/team/football/manchester-city/17",
  "Arsenal":"https://www.sofascore.com/team/football/arsenal/42",
  "Liverpool":"https://www.sofascore.com/team/football/liverpool/44",
  "Chelsea":"https://www.sofascore.com/team/football/chelsea/38",
  "Juventus":"https://www.sofascore.com/team/football/juventus/2710",
  "AC Milan":"https://www.sofascore.com/team/football/ac-milan/2692",
  "Napoli":"https://www.sofascore.com/team/football/napoli/2714",
  "Atletico Madrid":"https://www.sofascore.com/team/football/atletico-madrid/2836",
  "FC Barcelone":"https://www.sofascore.com/team/football/barcelona/2817",
  "Flamengo":"https://www.sofascore.com/team/football/flamengo/1971",
  "River Plate":"https://www.sofascore.com/team/football/river-plate/1042",
  "Carolina Hurricanes":"https://www.sofascore.com/team/ice-hockey/carolina-hurricanes/14",
  "Colorado Avalanche":"https://www.sofascore.com/team/ice-hockey/colorado-avalanche/20",
  "LA Dodgers":"https://www.sofascore.com/team/baseball/los-angeles-dodgers/3952"
};
var ADV_DB={
  "⚽":["PSG","Lyon","Marseille","Monaco","Lille","Nice","Rennes","Lens","Strasbourg","Nantes","Montpellier","Reims","Toulouse","Brest","Lorient","Saint-Etienne","Arsenal","Chelsea","Liverpool","Manchester City","Manchester United","Tottenham","Newcastle","Aston Villa","Brighton","West Ham","Crystal Palace","Fulham","Real Madrid","FC Barcelone","Atletico Madrid","Villarreal","Athletic Bilbao","Bayern Munich","Borussia Dortmund","RB Leipzig","Bayer Leverkusen","Inter Milan","AC Milan","Juventus","Napoli","AS Roma","Lazio","Atalanta","Porto","Benfica","Ajax","PSV","Boca Juniors","River Plate","Flamengo","Palmeiras","France","Espagne","Angleterre","Allemagne","Italie","Portugal","Brésil","Argentine"],
  "🏀":["Lakers","Celtics","Warriors","Heat","Bulls","Knicks","Bucks","Suns","Clippers","76ers","Raptors","Nuggets","Mavericks","Nets"],
  "🎾":["Novak Djokovic","Carlos Alcaraz","Jannik Sinner","Daniil Medvedev","Alexander Zverev","Andrey Rublev","Iga Swiatek","Aryna Sabalenka","Coco Gauff","Elena Rybakina"],
  "🏒":["Carolina Hurricanes","Colorado Avalanche","Tampa Bay Lightning","Vegas Golden Knights","Florida Panthers","Boston Bruins","Toronto Maple Leafs","Edmonton Oilers","New York Rangers","Dallas Stars"],
  "⚾":["LA Dodgers","New York Yankees","Houston Astros","Atlanta Braves","Philadelphia Phillies","Boston Red Sox"],
  "🏈":["Kansas City Chiefs","San Francisco 49ers","Dallas Cowboys","Philadelphia Eagles","Buffalo Bills","Cincinnati Bengals","Baltimore Ravens","Miami Dolphins"],
  "🏎":["Max Verstappen","Lando Norris","Charles Leclerc","Carlos Sainz","Lewis Hamilton","George Russell","Fernando Alonso","Oscar Piastri"],
  "🏉":["Toulouse","Leinster","La Rochelle","Bordeaux-Bègles","Racing 92","Clermont","Lyon","Montpellier","Toulon","France","Nouvelle-Zélande","Afrique du Sud","Irlande","Angleterre","Australie"],
  "🏉🇦🇺":["Melbourne Storm","Sydney Roosters","Penrith Panthers","Brisbane Broncos","South Sydney Rabbitohs","Parramatta Eels","Cronulla Sharks","Manly Sea Eagles","Canterbury Bulldogs","New Zealand Warriors","Gold Coast Titans","Canberra Raiders"]
};
function searchAdv(q,targetId,resId){
  var el=$i(targetId);var res=$i(resId);if(!res)return;
  if(!q||q.length<2){res.style.display='none';return;}
  var sport=$i('c-sport')&&$i('c-sport').value||'⚽';
  var db=(ADV_DB[sport]||ADV_DB['⚽']).concat(state.a.map(function(h){return h.target||'';}).filter(Boolean));
  var seen={};var uniq=db.filter(function(v){return v&&!seen[v]&&(seen[v]=1);});
  var ql=q.toLowerCase();
  var filtered=uniq.filter(function(v){return v.toLowerCase().includes(ql);}).slice(0,8);
  if(!filtered.length){res.style.display='none';return;}
  res.style.display='block';
  res.innerHTML=filtered.map(function(v){
    return '<div style="padding:8px 12px;cursor:pointer;font-size:12px;border-bottom:1px solid var(--b1);" data-val="'+v+'" data-tid="'+targetId+'" data-rid="'+resId+'" onclick="pickAdv(this.dataset.val,this.dataset.tid,this.dataset.rid)">'+v+'</div>';
  }).join('');
}
function pickAdv(val,targetId,resId){
  var el=$i(targetId);if(el)el.value=val;
  var res=$i(resId);if(res)res.style.display='none';
}
var TSDB_IDS={"Melbourne Storm":"134029","Sydney Roosters":"134031","Penrith Panthers":"134030","Brisbane Broncos":"134021","South Sydney Rabbitohs":"134026","Parramatta Eels":"134024","Cronulla Sharks":"134022","Manly Sea Eagles":"134028","Canterbury Bulldogs":"134023","New Zealand Warriors":"134025","Gold Coast Titans":"134032","Canberra Raiders":"134027","Newcastle Knights":"134033","North Queensland Cowboys":"134034","Wests Tigers":"134035","St George Illawarra Dragons":"134036","Dolphins":"134037"};
async function chargerFicheAdversaire(matchId, advId, advNom) {
  var zone = document.getElementById('adv-detail-'+matchId);
  if(!zone) return;
  if(zone.style.display !== 'none') { zone.style.display='none'; return; }
  zone.style.display = 'block';
  zone.innerHTML = '<div style="padding:12px;text-align:center;color:var(--t3);font-size:11px;">⏳ Chargement fiche '+advNom+'...</div>';

  try {
    var nomEquipe = _currentTeam || '';
    var uObj = state.u.find(function(x){return x.n===nomEquipe;})||{};
    var col = uObj.color||'#4d84ff';
    var teamId = null;
    for(var k in TEAM_IDS){ if(k.toLowerCase()===nomEquipe.toLowerCase()||(nomEquipe.toLowerCase().indexOf(k.toLowerCase())>=0)){teamId=TEAM_IDS[k];break;} }

    // 3 requêtes en parallèle — adv, mon équipe, H2H
    var requests = [
      fdFetch('/v4/teams/'+advId+'/matches?status=FINISHED&limit=20'),
      teamId ? fdFetch('/v4/teams/'+teamId+'/matches?status=FINISHED&limit=20') : Promise.resolve(null),
      teamId ? fdFetch('/v4/teams/'+teamId+'/matches?status=FINISHED&limit=50&opponent='+advId) : Promise.resolve(null)
    ];
    var [advData, myData, h2hData] = await Promise.all(requests);

    var advMatchesAll = advData&&advData.matches||[];
    var myMatchesAll = myData&&myData.matches||[];

    // Extraire les compétitions disponibles
    var compsSet = {};
    advMatchesAll.concat(myMatchesAll).forEach(function(m){
      var c = m.competition&&m.competition.name||'';
      if(c) compsSet[c] = m.competition&&m.competition.emblem||'';
    });
    var compsList = Object.keys(compsSet);

    // Appliquer le filtre compétition
    var advMatches = _advCompFilter==='all' ? advMatchesAll : advMatchesAll.filter(function(m){ return m.competition&&m.competition.name===_advCompFilter; });
    var myMatches = _advCompFilter==='all' ? myMatchesAll : myMatchesAll.filter(function(m){ return m.competition&&m.competition.name===_advCompFilter; });

    var h2hMatches = (h2hData&&h2hData.matches||[]).filter(function(m){
      return (m.homeTeam&&m.homeTeam.id===teamId&&m.awayTeam&&m.awayTeam.id===advId) ||
             (m.homeTeam&&m.homeTeam.id===advId&&m.awayTeam&&m.awayTeam.id===teamId);
    });

    function calcStats(matches, tId) {
      var n=matches.length, wins=0, draws=0, goals=0, conceded=0, over25=0, bts=0, cs=0, goalsHT=0;
      var domW=0, domN=0, domL=0, domN2=0, extW=0, extN2=0, extL=0, extN3=0;
      var streak=0, streakType='';
      matches.forEach(function(m){
        var isDom = m.homeTeam&&m.homeTeam.id===tId;
        var hg=(m.score&&m.score.regularTime?m.score.regularTime.home:m.score&&m.score.fullTime?m.score.fullTime.home:0)||0;
        var ag=(m.score&&m.score.regularTime?m.score.regularTime.away:m.score&&m.score.fullTime?m.score.fullTime.away:0)||0;
        var hgHT=m.score&&m.score.halfTime?(m.score.halfTime.home||0):0;
        var agHT=m.score&&m.score.halfTime?(m.score.halfTime.away||0):0;
        var tg=isDom?hg:ag, og=isDom?ag:hg;
        var tgHT=isDom?hgHT:agHT;
        var won=tg>og, draw=tg===og;
        if(won)wins++; else if(draw)draws++;
        goals+=tg; conceded+=og; goalsHT+=tgHT;
        if(hg+ag>2.5)over25++;
        if(hg>0&&ag>0)bts++;
        if(og===0)cs++;
        if(isDom){domN2++;if(won)domW++;else if(draw)domN++;else domL++;}
        else{extN3++;if(won)extW++;else if(draw)extN2++;else extL++;}
      });
      // Série depuis le plus récent
      for(var si=0;si<matches.length;si++){
        var ms=matches[si];
        var isDomS=ms.homeTeam&&ms.homeTeam.id===tId;
        var hgs=(ms.score&&ms.score.regularTime?ms.score.regularTime.home:ms.score&&ms.score.fullTime?ms.score.fullTime.home:0)||0;
        var ags=(ms.score&&ms.score.regularTime?ms.score.regularTime.away:ms.score&&ms.score.fullTime?ms.score.fullTime.away:0)||0;
        var tgs=isDomS?hgs:ags, ogs=isDomS?ags:hgs;
        var wons=tgs>ogs, draws=tgs===ogs;
        var res=wons?'V':draws?'N':'D';
        if(si===0){streakType=res;streak=1;}
        else if(res===streakType){streak++;}
        else{break;}
      }
      return {n:n, wins:wins, draws:draws, losses:n-wins-draws,
        pct:n?Math.round(wins/n*100):0,
        gpg:n?(goals/n).toFixed(1):0, cpg:n?(conceded/n).toFixed(1):0,
        gpgHT:n?(goalsHT/n).toFixed(1):0,
        o25:n?Math.round(over25/n*100):0, bts:n?Math.round(bts/n*100):0,
        cs:n?Math.round(cs/n*100):0,
        domPct:domN2?Math.round(domW/domN2*100):0, domN:domN2,
        extPct:extN3?Math.round(extW/extN3*100):0, extN:extN3,
        streak:streak, streakType:streakType};
    }

    var advStats = calcStats(advMatches, advId);
    var myStats = teamId ? calcStats(myMatches, teamId) : null;

    // Nom court
    var myShort = nomEquipe.replace('FC ','').replace(' FC','').replace(' CF','').split(' ').slice(0,2).join(' ');
    var advShort = advNom.replace('FC ','').replace(' FC','').replace(' CF','').split(' ').slice(0,2).join(' ');

    var html = '<div style="padding:12px;">';

    // Stocker contexte pour les boutons
    window._advCtx = {matchId:matchId, advId:advId, advNom:advNom};

    // Boutons filtre compétition
    html += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">';
    html += '<button onclick="setAdvComp(null)" style="padding:3px 10px;border-radius:10px;border:1px solid rgba(255,255,255,'+(_advCompFilter==='all'?'.3':'.08')+');background:rgba(255,255,255,'+(_advCompFilter==='all'?'.12':'.04')+');color:'+(_advCompFilter==='all'?'var(--t1)':'var(--t3)')+';font-size:9px;font-weight:'+(_advCompFilter==='all'?'700':'400')+';cursor:pointer;">Tous</button>';
    compsList.forEach(function(c, i){
      var isOn = _advCompFilter===c;
      var cLabel=c.replace('UEFA ','').substring(0,15); var cKey2='advc_'+i; _usMatchCache[cKey2]=c;
      var cKey3='advc_'+i; _usMatchCache[cKey3]=c;
      var cLabel=c.replace('UEFA ','').replace("Ligue 1 McDonald's","Ligue 1").substring(0,15);
      html += '<button data-ck="'+cKey3+'" onclick="setAdvComp(this.dataset.ck)" style="padding:3px 10px;border-radius:10px;border:1px solid rgba(255,255,255,'+(isOn?'.3':'.08')+');background:rgba(255,255,255,'+(isOn?'.12':'.04')+');color:'+(isOn?'var(--t1)':'var(--t3)')+';font-size:9px;font-weight:'+(isOn?'700':'400')+';cursor:pointer;">'+getCompIcon(c)+' '+cLabel+'</button>';
    });
    html += '</div>';

    // Forme adversaire
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">📊 Forme '+advShort+' ('+advStats.n+' matchs)</div>';
    html += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;">';
    advMatches.slice(0,10).reverse().forEach(function(m){
      var isDom = m.homeTeam&&m.homeTeam.id===advId;
      var hg=(m.score&&m.score.regularTime?m.score.regularTime.home:m.score&&m.score.fullTime?m.score.fullTime.home:0)||0;
      var ag=(m.score&&m.score.regularTime?m.score.regularTime.away:m.score&&m.score.fullTime?m.score.fullTime.away:0)||0;
      var tg=isDom?hg:ag, og=isDom?ag:hg;
      var won=tg>og, draw=tg===og;
      var rc=won?'#1ed760':draw?'#f0b020':'#ff4545';
      html += '<div style="width:24px;height:24px;border-radius:5px;background:'+rc+';display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#fff;">'+(won?'V':draw?'N':'D')+'</div>';
    });
    html += '</div>';

    // Comparaison côte à côte
    if(myStats) {
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">⚡ Comparaison ('+myStats.n+' matchs)</div>';
      html += '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:4px;margin-bottom:10px;">';

      var COMPARE = [
        {l:'Victoires %', a:myStats.pct+'%', b:advStats.pct+'%', aVal:myStats.pct, bVal:advStats.pct},
        {l:'Dom %', a:myStats.domPct+'% ('+myStats.domN+')', b:advStats.domPct+'% ('+advStats.domN+')', aVal:myStats.domPct, bVal:advStats.domPct},
        {l:'Ext %', a:myStats.extPct+'% ('+myStats.extN+')', b:advStats.extPct+'% ('+advStats.extN+')', aVal:myStats.extPct, bVal:advStats.extPct},
        {l:'Buts/match', a:myStats.gpg, b:advStats.gpg, aVal:parseFloat(myStats.gpg), bVal:parseFloat(advStats.gpg)},
        {l:'Buts 1ère MT', a:myStats.gpgHT, b:advStats.gpgHT, aVal:parseFloat(myStats.gpgHT), bVal:parseFloat(advStats.gpgHT)},
        {l:'Encaissés', a:myStats.cpg, b:advStats.cpg, aVal:parseFloat(advStats.cpg), bVal:parseFloat(myStats.cpg)},
        {l:'Clean Sheet', a:myStats.cs+'%', b:advStats.cs+'%', aVal:myStats.cs, bVal:advStats.cs},
        {l:'Over 2.5', a:myStats.o25+'%', b:advStats.o25+'%', aVal:myStats.o25, bVal:advStats.o25},
        {l:'BTS', a:myStats.bts+'%', b:advStats.bts+'%', aVal:myStats.bts, bVal:advStats.bts},
      ];

      html += '<div style="font-size:10px;font-weight:700;color:'+col+';text-align:center;padding:4px;">'+myShort+'</div>';
      html += '<div style="font-size:9px;color:var(--t3);text-align:center;padding:4px;"></div>';
      html += '<div style="font-size:10px;font-weight:700;color:#a78bfa;text-align:center;padding:4px;">'+advShort+'</div>';

      COMPARE.forEach(function(c){
        var aBetter = c.aVal > c.bVal;
        var bBetter = c.bVal > c.aVal;
        html += '<div style="font-size:11px;font-weight:800;color:'+(aBetter?col:'var(--t2)')+';text-align:center;padding:5px 4px;background:rgba(255,255,255,.03);border-radius:5px;">'+c.a+'</div>';
        html += '<div style="font-size:9px;color:var(--t3);text-align:center;padding:5px 4px;">'+c.l+'</div>';
        html += '<div style="font-size:11px;font-weight:800;color:'+(bBetter?'#a78bfa':'var(--t2)')+';text-align:center;padding:5px 4px;background:rgba(255,255,255,.03);border-radius:5px;">'+c.b+'</div>';
      });
      html += '</div>';
    }

    // H2H
    if(h2hMatches.length) {
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">🔁 H2H — '+myShort+' vs '+advShort+' ('+h2hMatches.length+' matchs)</div>';
      var h2hWins=0, h2hDraws=0, h2hLoss=0;
      html += '<div style="display:flex;flex-direction:column;gap:3px;margin-bottom:8px;">';
      h2hMatches.slice(0,6).forEach(function(m){
        var isMyHome = m.homeTeam&&m.homeTeam.id===teamId;
        var hg=(m.score&&m.score.regularTime?m.score.regularTime.home:m.score&&m.score.fullTime?m.score.fullTime.home:0)||0;
        var ag=(m.score&&m.score.regularTime?m.score.regularTime.away:m.score&&m.score.fullTime?m.score.fullTime.away:0)||0;
        var tg=isMyHome?hg:ag, og=isMyHome?ag:hg;
        var won=tg>og, draw=tg===og;
        if(won)h2hWins++; else if(draw)h2hDraws++; else h2hLoss++;
        var rc=won?'#1ed760':draw?'#f0b020':'#ff4545';
        var d=new Date(m.utcDate);
        var ds=d.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'2-digit'});
        html += '<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:rgba(255,255,255,.03);border-radius:6px;border-left:2px solid '+rc+';">';
        html += '<div style="font-size:9px;color:var(--t3);width:50px;flex-shrink:0;">'+ds+'</div>';
        html += '<div style="flex:1;font-size:10px;color:var(--t2);">'+(isMyHome?myShort+' vs '+advShort:advShort+' vs '+myShort)+'</div>';
        html += '<div style="font-size:11px;font-weight:800;color:'+rc+';">'+hg+' - '+ag+'</div>';
        html += '</div>';
      });
      html += '</div>';
      // Résumé H2H
      html += '<div style="display:flex;gap:6px;margin-bottom:10px;">';
      [{l:myShort,v:h2hWins,c:col},{l:'Nul',v:h2hDraws,c:'#f0b020'},{l:advShort,v:h2hLoss,c:'#a78bfa'}].forEach(function(s){
        html += '<div style="flex:1;text-align:center;background:rgba(255,255,255,.04);border-radius:6px;padding:6px;">';
        html += '<div style="font-size:14px;font-weight:800;color:'+s.c+';">'+s.v+'</div>';
        html += '<div style="font-size:8px;color:var(--t3);">'+s.l+'</div></div>';
      });
      html += '</div>';
    }

    // Analyse
    if(myStats && advStats) {
      var butsAttendusPSG = (parseFloat(myStats.gpg) * parseFloat(advStats.cpg)).toFixed(2);
      var butsAttendusAdv = (parseFloat(advStats.gpg) * parseFloat(myStats.cpg)).toFixed(2);
      var totalAvg = (parseFloat(butsAttendusPSG) + parseFloat(butsAttendusAdv)).toFixed(2);
      var o25prob = Math.round((myStats.o25+advStats.o25)/2);
      var btsprob = Math.round((myStats.bts+advStats.bts)/2);
      html += '<div style="background:rgba(77,132,255,.08);border:1px solid rgba(77,132,255,.2);border-radius:8px;padding:10px;">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4d84ff;margin-bottom:8px;">🎯 Analyse</div>';
      // Séries
      var mySerieCol = myStats.streakType==='V'?'#1ed760':myStats.streakType==='N'?'#f0b020':'#ff4545';
      var advSerieCol = advStats.streakType==='V'?'#1ed760':advStats.streakType==='N'?'#f0b020':'#ff4545';
      html += '<div style="display:flex;gap:8px;margin-bottom:8px;">';
      html += '<div style="flex:1;background:rgba(255,255,255,.04);border-radius:6px;padding:6px;text-align:center;">';
      html += '<div style="font-size:9px;color:var(--t3);">'+myShort+'</div>';
      html += '<div style="font-size:12px;font-weight:800;color:'+mySerieCol+';">'+myStats.streak+myStats.streakType+' d\'affilée</div></div>';
      html += '<div style="flex:1;background:rgba(255,255,255,.04);border-radius:6px;padding:6px;text-align:center;">';
      html += '<div style="font-size:9px;color:var(--t3);">'+advShort+'</div>';
      html += '<div style="font-size:12px;font-weight:800;color:'+advSerieCol+';">'+advStats.streak+advStats.streakType+' d\'affilée</div></div>';
      html += '</div>';
      html += '<div style="font-size:11px;color:var(--t1);">Buts attendus : <strong style="color:'+col+';">'+butsAttendusPSG+'</strong> vs <strong style="color:#a78bfa;">'+butsAttendusAdv+'</strong> = <strong>'+totalAvg+'</strong></div>';
      html += '<div style="font-size:11px;color:var(--t1);">Over 2.5 probable : <strong style="color:'+(o25prob>55?'#1ed760':'#f0b020')+'">'+o25prob+'%</strong></div>';
      html += '<div style="font-size:11px;color:var(--t1);">BTS probable : <strong style="color:'+(btsprob>55?'#a78bfa':'#f0b020')+'">'+btsprob+'%</strong></div>';
      html += '</div>';
    }

    html += '</div>';
    zone.innerHTML = html;

  } catch(e) {
    zone.innerHTML = '<div style="padding:10px;color:#ff4545;font-size:11px;text-align:center;">Erreur : '+e.message+'</div>';
  }
}


/* ══ LIVE API-SPORTS ══ */
var _liveCache = null;
var _liveTeamId = null;

async function loadLiveApiSports(el, nom, col, teamId, key) {
  el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--t3);font-size:11px;"><div style="font-size:24px;margin-bottom:8px;">🔴</div>Chargement live via api-sports...</div>';

  try {
    // Chercher l'ID api-sports pour cette équipe
    var apiTeamId = await findApiSportsTeamId(nom, key);

    if(!apiTeamId) {
      // Fallback calendrier football-data
      el.innerHTML='<div class="fc" style="text-align:center;">'
        +'<div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:6px;">'+nom+'</div>'
        +'<div style="font-size:11px;color:var(--t3);margin-bottom:14px;">Équipe non trouvée sur api-sports</div>'
        +'<button id="btn-load-calendar" style="padding:11px 24px;border-radius:var(--r8);border:none;background:'+col+';color:#fff;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:10px;">📅 Charger le calendrier</button>'
        +'<div style="font-size:10px;color:var(--t3);">1 requête · données mises en cache</div>'
        +'<div id="calendar-content"></div></div>';
      $i('btn-load-calendar').onclick = function(){ loadTeamCalendar(teamId, nom, col); };
      return;
    }

    // Chercher match en direct
    var liveData = await apiSportsFetch('/fixtures?team='+apiTeamId+'&live=all');
    var liveFixtures = liveData&&liveData.response||[];

    var html = '<div style="padding:8px 0;">';

    if(liveFixtures.length) {
      // MATCH EN DIRECT
      var f = liveFixtures[0];
      var fix = f.fixture||{};
      var teams = f.teams||{};
      var goals = f.goals||{};
      var score = f.score||{};
      var elapsed = fix.status&&fix.status.elapsed||0;
      var homeNom = teams.home&&teams.home.name||'?';
      var awayNom = teams.away&&teams.away.name||'?';
      var homeLogo = teams.home&&teams.home.logo||'';
      var awayLogo = teams.away&&teams.away.logo||'';
      var hg = goals.home||0, ag = goals.away||0;
      var isHome = teams.home&&teams.home.id==apiTeamId;
      var rc = (isHome?hg>ag:ag>hg)?'#1ed760':(hg===ag?'#f0b020':'#ff4545');

      html += '<div style="background:rgba(255,0,0,.06);border:1px solid rgba(255,0,0,.2);border-radius:12px;padding:14px;margin-bottom:10px;">';
      html += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:10px;">';
      html += '<div style="width:8px;height:8px;border-radius:50%;background:#ff4545;animation:blink 1s infinite;"></div>';
      html += '<div style="font-size:10px;font-weight:700;color:#ff4545;">EN DIRECT — '+elapsed+"'</div>";
      html += '</div>';

      html += '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;">';
      html += '<div style="text-align:center;">';
      if(homeLogo) html += '<img src="'+homeLogo+'" style="width:40px;height:40px;object-fit:contain;margin-bottom:4px;">';
      html += '<div style="font-size:11px;font-weight:700;color:var(--t1);">'+homeNom+'</div></div>';
      html += '<div style="text-align:center;font-size:36px;font-weight:900;color:'+rc+';">'+hg+' - '+ag+'</div>';
      html += '<div style="text-align:center;">';
      if(awayLogo) html += '<img src="'+awayLogo+'" style="width:40px;height:40px;object-fit:contain;margin-bottom:4px;">';
      html += '<div style="font-size:11px;font-weight:700;color:var(--t1);">'+awayNom+'</div></div>';
      html += '</div>';

      // Score mi-temps
      if(score.halftime&&(score.halftime.home!==null)) {
        html += '<div style="text-align:center;font-size:10px;color:var(--t3);margin-top:4px;">MT: '+score.halftime.home+' - '+score.halftime.away+'</div>';
      }

      // Stats si dispo
      if(f.statistics&&f.statistics.length) {
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:10px;">';
        var statList = ['Ball Possession','Total Shots','Shots on Goal','Corner Kicks'];
        var homeStat = f.statistics.find(function(s){return s.team&&s.team.id===(teams.home&&teams.home.id);})||{};
        var awayStat = f.statistics.find(function(s){return s.team&&s.team.id===(teams.away&&teams.away.id);})||{};
        statList.forEach(function(sn){
          var hs = (homeStat.statistics||[]).find(function(x){return x.type===sn;});
          var as2 = (awayStat.statistics||[]).find(function(x){return x.type===sn;});
          if(hs&&as2) {
            html += '<div style="background:rgba(255,255,255,.04);border-radius:8px;padding:6px 10px;text-align:center;">';
            html += '<div style="font-size:10px;color:var(--t3);margin-bottom:2px;">'+sn.replace('Ball Possession','Possession').replace('Total Shots','Tirs').replace('Shots on Goal','Cadrés').replace('Corner Kicks','Corners')+'</div>';
            html += '<div style="font-size:12px;font-weight:700;color:var(--t1);">'+(hs.value||0)+' - '+(as2.value||0)+'</div>';
            html += '</div>';
          }
        });
        html += '</div>';
      }

      html += '</div>';

      // Bouton rafraîchir
      html += '<button onclick="loadTeamLive()" style="width:100%;padding:8px;background:rgba(255,0,0,.1);border:1px solid rgba(255,0,0,.2);border-radius:8px;color:#ff4545;font-size:11px;font-weight:700;cursor:pointer;margin-top:6px;">🔄 Rafraîchir</button>';

    } else {
      // Pas de match en direct — prochain match
      var nextData = await apiSportsFetch('/fixtures?team='+apiTeamId+'&next=3');
      var nextFixtures = nextData&&nextData.response||[];
      var pastData = await apiSportsFetch('/fixtures?team='+apiTeamId+'&last=5');
      var pastFixtures = pastData&&pastData.response||[];

      if(nextFixtures.length) {
        html += '<div class="cwrap" style="margin-bottom:10px;">';
        html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">Prochains matchs</div>';
        nextFixtures.forEach(function(f){
          var fix=f.fixture||{}, teams=f.teams||{}, league=f.league||{};
          var isHome=teams.home&&teams.home.name===nom;
          var adv=isHome?(teams.away&&teams.away.name||'?'):(teams.home&&teams.home.name||'?');
          var advLogo=isHome?(teams.away&&teams.away.logo||''):(teams.home&&teams.home.logo||'');
          var d=new Date(fix.date||'');
          var ds=d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'});
          var ts=d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
          html += '<div style="display:flex;align-items:center;padding:10px 12px;background:var(--s1);border-radius:var(--r6);margin-bottom:6px;border-left:3px solid '+col+';">';
          if(advLogo) html += '<img src="'+advLogo+'" style="width:28px;height:28px;object-fit:contain;margin-right:10px;">';
          html += '<div style="flex:1;"><div style="font-size:12px;font-weight:700;color:var(--t1);">'+(isHome?'🏠 vs ':'🚌 @ ')+adv+'</div>';
          html += '<div style="font-size:10px;color:var(--t3);">'+league.name+'</div></div>';
          html += '<div style="text-align:right;"><div style="font-size:11px;font-weight:700;color:var(--a);">'+ds+'</div>';
          html += '<div style="font-size:10px;color:var(--t3);">'+ts+'</div></div>';
          html += '</div>';
        });
        html += '</div>';
      }

      if(pastFixtures.length) {
        html += '<div class="cwrap">';
        html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">Résultats récents</div>';
        pastFixtures.slice().reverse().forEach(function(f){
          var fix=f.fixture||{}, teams=f.teams||{}, goals=f.goals||{}, league=f.league||{};
          var isHome=teams.home&&teams.home.name===nom;
          var adv=isHome?(teams.away&&teams.away.name||'?'):(teams.home&&teams.home.name||'?');
          var hg=goals.home||0, ag=goals.away||0;
          var tg=isHome?hg:ag, og=isHome?ag:hg;
          var won=tg>og, draw=tg===og;
          var rc2=won?'#1ed760':draw?'#f0b020':'#ff4545';
          var d2=new Date(fix.date||'');
          var ds2=d2.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
          html += '<div style="display:flex;align-items:center;padding:10px 12px;background:var(--s1);border-radius:var(--r6);margin-bottom:6px;border-left:3px solid '+rc2+';">';
          html += '<div style="width:22px;height:22px;border-radius:50%;background:'+rc2+';display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;margin-right:10px;">'+(won?'V':draw?'N':'D')+'</div>';
          html += '<div style="flex:1;"><div style="font-size:12px;font-weight:700;color:var(--t1);">'+(isHome?'🏠 vs ':'🚌 @ ')+adv+'</div>';
          html += '<div style="font-size:10px;color:var(--t3);">'+league.name+' · '+ds2+'</div></div>';
          html += '<div style="font-size:15px;font-weight:800;color:'+rc2+';">'+(isHome?hg+'-'+ag:ag+'-'+hg)+'</div>';
          html += '</div>';
        });
        html += '</div>';
      }
    }

    html += '</div>';
    el.innerHTML = html;

  } catch(e) {
    el.innerHTML = '<div style="text-align:center;padding:20px;"><div style="color:#ff4545;font-size:13px;font-weight:700;margin-bottom:8px;">❌ Erreur live</div><div style="color:var(--t3);font-size:11px;">'+e.message+'</div><button onclick="loadTeamLive()" style="margin-top:12px;padding:8px 16px;background:rgba(77,132,255,.12);border:1px solid rgba(77,132,255,.3);border-radius:8px;color:#4d84ff;font-size:11px;cursor:pointer;">🔄 Réessayer</button></div>';
    console.error('loadLiveApiSports error:', e);
  }
}

// Cache des IDs api-sports par équipe
var _apiSportsTeamCache = {};

// IDs api-sports des équipes principales
var API_SPORTS_IDS = {
  'PSG':85,'Paris Saint-Germain':85,'Paris SG':85,'Paris Saint-Germain FC':85,
  'Lyon':80,'Olympique Lyonnais':80,
  'Marseille':81,'Olympique de Marseille':81,
  'Monaco':91,'AS Monaco':91,
  'Lille':79,'Lens':116,
  'Nice':84,'Rennes':111,'Nantes':83,
  'Real Madrid':541,'FC Barcelona':529,'Barcelona':529,
  'Bayern Munich':157,'Borussia Dortmund':165,
  'Inter Milan':505,'AC Milan':489,'Juventus':496,
  'Arsenal':42,'Chelsea':49,'Liverpool':40,
  'Manchester City':50,'Manchester United':33,
  'Tottenham':47,'Newcastle':34,'Aston Villa':66,
  'PSV':674,'Ajax':194,'AFC Ajax':194,
  'Porto':212,'Benfica':211,'Sporting':228,
  'Atletico Madrid':530,'Sevilla':536,'Villarreal':533,
  'Boca Juniors':405,'River Plate':410,
  'Flamengo':127,'Palmeiras':121,'Fluminense':119,
  'France':2,'Espagne':9,'Allemagne':25,
  'Angleterre':10,'Italie':27,'Portugal':27,
};

async function findApiSportsTeamId(nom, key) {
  if(_apiSportsTeamCache[nom]) return _apiSportsTeamCache[nom];
  // Chercher dans le dictionnaire d'abord
  if(API_SPORTS_IDS[nom]) { _apiSportsTeamCache[nom]=API_SPORTS_IDS[nom]; return API_SPORTS_IDS[nom]; }
  // Chercher par clé partielle
  for(var k in API_SPORTS_IDS) {
    if(nom.toLowerCase().indexOf(k.toLowerCase())>=0 || k.toLowerCase().indexOf(nom.toLowerCase())>=0) {
      _apiSportsTeamCache[nom]=API_SPORTS_IDS[k];
      return API_SPORTS_IDS[k];
    }
  }
  // Sinon requête API
  try {
    var d = await apiSportsFetch('/teams?search='+encodeURIComponent(nom.substring(0,10)));
    var teams = d&&d.response||[];
    if(!teams.length) return null;
    var match = teams.find(function(t){ return t.team&&t.team.name&&t.team.name.toLowerCase()===nom.toLowerCase(); });
    if(!match) match = teams.find(function(t){ return t.team&&t.team.name&&nom.toLowerCase().indexOf(t.team.name.toLowerCase())>=0; });
    if(!match) match = teams[0];
    if(match&&match.team) {
      _apiSportsTeamCache[nom] = match.team.id;
      return match.team.id;
    }
  } catch(e) {}
  return null;
}

function loadTeamLiveTSDB(el,nom,sport){
  var tid=TSDB_IDS[nom];
  var p=(state.u.find(function(u){return u.n===nom;})||{color:'#4d84ff'}).color||'#4d84ff';
  if(!tid){el.innerHTML='<div style="text-align:center;padding:40px 20px;"><div style="font-size:48px;margin-bottom:16px">🏉</div><div style="font-size:15px;font-weight:800;color:'+p+'">'+nom+'</div><a href="https://www.thesportsdb.com/search_all_teams.php?t='+encodeURIComponent(nom)+'" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:'+p+';color:#fff;padding:12px 24px;border-radius:var(--r8);font-size:13px;font-weight:700;text-decoration:none">🔍 TheSportsDB</a></div>';return;}
  el.innerHTML='<div class="empty">⏳ Chargement…</div>';
  fetch('https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id='+tid).then(function(r){return r.json();}).then(function(d){
    var events=(d.events||[]).slice(0,5);
    var html2='<div style="font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--t3);margin-bottom:8px">Prochains matchs</div>';
    if(events.length){html2+=events.map(function(e){var date=e.dateEvent?e.dateEvent.split('-').reverse().join('/'):'?';var isHome=e.strHomeTeam===nom;var opp=isHome?e.strAwayTeam:e.strHomeTeam;return '<div style="display:flex;align-items:center;gap:8px;padding:9px 12px;background:var(--s1);border-radius:var(--r6);margin-bottom:6px;border-left:3px solid '+p+'"><div style="font-size:9px;color:var(--t3);width:34px;text-align:center">'+date+'</div><div style="flex:1"><div style="font-size:12px;font-weight:700">'+(isHome?'🏠':'✈')+' vs '+opp+'</div><div style="font-size:10px;color:var(--t3)">'+e.strLeague+'</div></div></div>';}).join('');}
    else html2+='<div class="empty">Aucun match</div>';
    el.innerHTML=html2;
  }).catch(function(){el.innerHTML='<div class="empty">❌ Erreur API</div>';});
}
function updateAdvList(){}
function updateCompList(){
  var sport=($i('c-sport')&&$i('c-sport').value)||'⚽';
  var comps=sport==='⚽'?['Ligue 1','Champions League','Europa League','Conference League','Premier League','La Liga','Bundesliga','Serie A','Eredivisie','Liga Portugal','Série A brésilienne','MLS']:sport==='🏀'?['NBA','Euroleague','Pro A']:sport==='🎾'?['Roland Garros','Wimbledon','US Open','Australian Open','Masters 1000']:sport==='🏒'?['NHL']:sport==='⚾'?['MLB']:sport==='🏈'?['NFL']:['Ligue 1'];
  var dl=$i('comp-list');if(dl)dl.innerHTML=comps.map(function(c){return '<option value="'+c+'">';}).join('');
  var dl2=$i('comp-list-simple');if(dl2)dl2.innerHTML=comps.map(function(c){return '<option value="'+c+'">';}).join('');
}
function saveDbxKey(){
  var inp=$i('dbx-key-input');if(!inp)return;
  var key=inp.value.trim();if(!key)return;
  localStorage.setItem('gones45_dbx_token',key);
  _dbxConfig.refreshToken=key;
  var st=$i('dbx-key-status');
  if(st){st.innerText='✅ Token enregistré !';st.style.color='var(--g)';}
  setTimeout(function(){if(st)st.innerText='';},3000);
}
async function testDbxKey(){
  var st=$i('dbx-key-status');
  if(st){st.innerText='⏳ Test connexion…';st.style.color='var(--t3)';}
  try{
    var token=await getValidToken();
    if(!token){if(st){st.innerText='❌ Impossible de rafraîchir le token';st.style.color='var(--r)';}return;}
    var res=await fetch('https://api.dropboxapi.com/2/users/get_current_account',{method:'POST',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:'null'});
    var d=await res.json();
    if(d.email){if(st){st.innerText='✅ Connecté : '+d.email+' (token auto)';st.style.color='var(--g)';}}
    else{if(st){st.innerText='❌ Erreur compte';st.style.color='var(--r)';}}
  }catch(e){if(st){st.innerText='❌ Erreur réseau';st.style.color='var(--r)';}}
}

function loadTeamCompo(){
  var el = $i('ip-compo'); if(!el) return;
  el.style.display = 'block';
  var nom = _currentTeam||'';
  var uObj = state.u.find(function(x){return x.n===nom;})||{};
  var col = uObj.color||'#4d84ff';

  // Chercher le teamId
  var sofaId = SOFASCORE_TEAM_IDS && SOFASCORE_TEAM_IDS[nom];
  if(!sofaId){ for(var k in SOFASCORE_TEAM_IDS){ if(nom.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(nom.toLowerCase())>=0){sofaId=SOFASCORE_TEAM_IDS[k];break;} } }
  var fdTeamId = TEAM_IDS[nom]||null;
  if(!fdTeamId){ for(var k in TEAM_IDS){ if(nom.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(nom.toLowerCase())>=0){fdTeamId=TEAM_IDS[k];break;} } }

  el.innerHTML = '<div id="compo-squad-section"></div>';
  var squadEl = document.getElementById('compo-squad-section');
  if(squadEl) loadFdSquad(squadEl, nom, fdTeamId, true);
}

function loadTeamLive(){
  var el=$i('ip-live');if(!el)return;
  el.style.display='block';
  var nom=_currentTeam||'';
  var uObj=state.u.find(function(x){return x.n===nom;})||{};
  var col=uObj.color||'#4d84ff';
  var sport=uObj.sport||'⚽';
  if(sport==='🏉🇦🇺'||sport==='🏉'){loadTeamLiveTSDB(el,nom,sport);return;}
  // Sports avec résumés vidéo dédiés
  if(sport==='🏒'||sport==='🏒🇺🇸') { loadVideoHighlights(el,nom,col,'nhl'); return; }
  if(sport==='⚾'||sport==='⚾🇺🇸') { loadVideoHighlights(el,nom,col,'mlb'); return; }
  if(sport==='🏀'||sport==='🏀🇺🇸') { loadVideoHighlights(el,nom,col,'nba'); return; }
  if(sport==='🏎️'||sport==='🏎') { loadVideoHighlights(el,nom,col,'f1'); return; }

  // Trouver l'ID football-data
  var teamId=null;
  for(var k in TEAM_IDS){
    if(k.toLowerCase()===nom.toLowerCase()||nom.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(nom.toLowerCase())>=0){
      teamId=TEAM_IDS[k];break;
    }
  }

  var customLink=(uObj&&uObj.link)||null;
  var sofaUrl=customLink||SOFASCORE_LINKS[nom]||('https://www.sofascore.com/search#q='+encodeURIComponent(nom));

  if(!teamId||!getFdorgKey()){
    // Pas de clé ou équipe inconnue → Sofascore
    el.innerHTML='<div style="text-align:center;padding:40px 20px;">'
      +'<div style="font-size:48px;margin-bottom:16px">📡</div>'
      +'<div style="font-size:15px;font-weight:800;margin-bottom:6px;color:'+col+'">'+nom+'</div>'
      +'<div style="font-size:11px;color:var(--t3);margin-bottom:24px">Résultats · Classement · Stats en direct</div>'
      +'<a href="'+sofaUrl+'" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:'+col+';color:#fff;padding:13px 26px;border-radius:var(--r8);font-size:13px;font-weight:700;text-decoration:none;">📊 Voir sur Sofascore</a>'
      +'</div>';
    return;
  }

  // FPL pour les équipes de Premier League — automatique sans clé
  var fplNom = FPL_TEAM_MAP&&FPL_TEAM_MAP[nom];
  if(fplNom) {
    el.innerHTML = '<div id="live-apisports-section"></div><div id="live-fpl-section" style="margin-top:10px;"></div>';
    var fplEl = document.getElementById('live-fpl-section');
    if(fplEl) loadFplSquad(fplEl, nom);
    var apiSportsKey2 = getApiSportsKey();
    if(apiSportsKey2) {
      var liveTarget = document.getElementById('live-apisports-section');
      if(liveTarget) loadLiveApiSports(liveTarget, nom, col, teamId, apiSportsKey2);
    } else {
      var ls2 = document.getElementById('live-apisports-section');
      if(ls2) ls2.innerHTML = '';
    }
    return;
  }

  // Squad dans Live uniquement pour le terrain (noTerrain=false), tableau dans Compo
  var fdKeyCheck = getFdorgKey();
  var fdTeamId = TEAM_IDS[nom]||null;
  if(!fdTeamId){ for(var k in TEAM_IDS){ if(nom.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(nom.toLowerCase())>=0){fdTeamId=TEAM_IDS[k];break;} } }
  if(fdKeyCheck && fdTeamId) {
    el.innerHTML = '<div id="live-apisports-section2"></div><div id="live-fd-section" style="margin-top:10px;"></div>';
    var fdSquadEl = document.getElementById('live-fd-section');
    if(fdSquadEl) loadFdSquad(fdSquadEl, nom, fdTeamId, false, true);
    var apiSportsKey2b = getApiSportsKey();
    if(apiSportsKey2b){
      var liveTarget2 = document.getElementById('live-apisports-section2');
      if(liveTarget2) loadLiveApiSports(liveTarget2, nom, col, teamId, apiSportsKey2b);
    }
    return;
  }

  // Vérifier si un match est en cours via api-sports
  var apiSportsKey = getApiSportsKey();
  if(apiSportsKey) {
    loadLiveApiSports(el, nom, col, teamId, apiSportsKey);
    return;
  }

  // Afficher bouton de chargement
  el.innerHTML='<div class="fc" style="text-align:center;">'
    +'<div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:6px;">'+nom+'</div>'
    +'<div style="font-size:11px;color:var(--t3);margin-bottom:14px;">Charge les prochains matchs et résultats récents via football-data</div>'
    +'<button id="btn-load-calendar" style="padding:11px 24px;border-radius:var(--r8);border:none;background:'+col+';color:#fff;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:10px;">📅 Charger le calendrier</button>'
    +'<div style="font-size:10px;color:var(--t3);">1 requête · données mises en cache</div>'
    +'</div>'
    +'<div id="calendar-content"></div>'
    +'<div style="margin-top:12px;text-align:center;">'
    +'<a href="'+sofaUrl+'" target="_blank" style="font-size:11px;color:var(--t3);">→ Voir aussi sur Sofascore</a>'
    +'</div>';

  document.getElementById('btn-load-calendar').onclick = function(){
    loadTeamCalendar(teamId, nom, col);
  };
}

async function loadTeamCalendar(teamId, nom, col) {
  var btn = document.getElementById('btn-load-calendar');
  var cont = document.getElementById('calendar-content');
  if(!btn||!cont) return;
  btn.textContent = 'Chargement...';
  btn.disabled = true;

  try {
    var [upcoming, finished] = await Promise.all([
      fdFetch('/v4/teams/'+teamId+'/matches?status=SCHEDULED&limit=5'),
      fdFetch('/v4/teams/'+teamId+'/matches?status=FINISHED&limit=10')
    ]);

    var html = '';

    // ── Prochains matchs ──
    if(upcoming && upcoming.matches && upcoming.matches.length) {
      html += '<div class="cwrap" style="margin-top:10px;">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">Prochains matchs</div>';
      upcoming.matches.forEach(function(m){
        var isDom = m.homeTeam && m.homeTeam.id === teamId;
        var adv = isDom ? (m.awayTeam&&m.awayTeam.name||'?') : (m.homeTeam&&m.homeTeam.name||'?');
        var advId = isDom ? (m.awayTeam&&m.awayTeam.id) : (m.homeTeam&&m.homeTeam.id);
        var advCrest = isDom ? (m.awayTeam&&m.awayTeam.crest||'') : (m.homeTeam&&m.homeTeam.crest||'');
        var d = new Date(m.utcDate);
        var dateStr = d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'});
        var timeStr = d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
        var comp = m.competition&&m.competition.name||'';
        var compIco2 = getCompIcon(comp);
        html += '<div id="match-adv-'+m.id+'" style="background:var(--s1);border-radius:10px;margin-bottom:8px;border:1px solid rgba(255,255,255,.06);overflow:hidden;">';
        // Header match
        html += '<div style="display:flex;align-items:center;padding:10px 12px;border-left:3px solid '+col+';cursor:pointer;" onclick="chargerFicheAdversaire('+m.id+','+advId+',\''+adv.replace(/'/g,"\\'")+'\')">';
        if(advCrest) html += '<img src="'+advCrest+'" style="width:28px;height:28px;object-fit:contain;margin-right:10px;flex-shrink:0;" loading="lazy">';
        html += '<div style="flex:1;">';
        html += '<div style="font-size:12px;font-weight:700;color:var(--t1);">'+(isDom?'🏠 vs ':'🚌 @ ')+adv+'</div>';
        html += '<div style="font-size:10px;color:var(--t3);margin-top:2px;">'+compIco2+' '+comp+'</div>';
        html += '</div>';
        html += '<div style="text-align:right;">';
        html += '<div style="font-size:11px;font-weight:700;color:var(--a);">'+dateStr+'</div>';
        html += '<div style="font-size:10px;color:var(--t3);">'+timeStr+'</div>';
        html += '<div style="font-size:9px;color:#4d84ff;margin-top:2px;">🔍 Analyser →</div>';
        html += '</div></div>';
        // Zone pour la fiche adversaire (cachée au départ)
        html += '<div id="adv-detail-'+m.id+'" style="display:none;"></div>';
        html += '</div>';
      });
      html += '</div>';
    }

    // ── Résultats récents ──
    if(finished && finished.matches && finished.matches.length) {
      html += '<div class="cwrap" style="margin-top:10px;">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">Résultats récents</div>';
      finished.matches.slice(0,5).reverse().forEach(function(m){
        var isDom = m.homeTeam && m.homeTeam.id === teamId;
        var adv = isDom ? (m.awayTeam&&m.awayTeam.name||'?') : (m.homeTeam&&m.homeTeam.name||'?');
        var hg = (m.score&&m.score.regularTime?m.score.regularTime.home:m.score&&m.score.fullTime?m.score.fullTime.home:0)||0;
        var ag = (m.score&&m.score.regularTime?m.score.regularTime.away:m.score&&m.score.fullTime?m.score.fullTime.away:0)||0;
        var tg = isDom?hg:ag, og = isDom?ag:hg;
        var won = tg>og, draw = tg===og;
        var rc = won?'#1ed760':draw?'#f0b020':'#ff4545';
        var rl = won?'V':draw?'N':'D';
        var scoreStr = isDom ? hg+' - '+ag : ag+' - '+hg;
        var d = new Date(m.utcDate);
        var dateStr = d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
        var comp = m.competition&&m.competition.name||'';
        var compIco = getCompIcon(comp);
        html += '<div onclick="ouvrirDetailMatch('+m.id+')" style="display:flex;align-items:center;padding:10px 12px;background:var(--s1);border-radius:var(--r6);margin-bottom:6px;border-left:3px solid '+rc+';cursor:pointer;">';
        html += '<div style="width:22px;height:22px;border-radius:50%;background:'+rc+';display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;flex-shrink:0;margin-right:10px;">'+rl+'</div>';
        html += '<div style="flex:1;">';
        html += '<div style="font-size:12px;font-weight:700;color:var(--t1);">'+(isDom?'🏠 vs ':'🚌 @ ')+adv+'</div>';
        html += '<div style="font-size:10px;color:var(--t3);margin-top:2px;">'+compIco+' '+comp+' · '+dateStr+'</div>';
        html += '</div>';
        html += '<div style="font-size:15px;font-weight:800;color:'+rc+';">'+scoreStr+'</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    if(!html) html = '<div class="fc" style="color:var(--t3);text-align:center;">Aucune donnée disponible</div>';
    cont.innerHTML = html;
    btn.style.display = 'none';

  } catch(e) {
    btn.textContent = 'Erreur - Reessayer';
    btn.disabled = false;
  }
}

/* ── DROPBOX AUTO-SAVE (refresh token permanent) ── */
var _dbxConfig={
  appKey:'x9j8qikpa21j1pv',
  appSecret:'vk2o926kopta87b',
  refreshToken:'sl.u.AGhBCqnmWUxbU0tdeMSXTeodWfHcx6CsLZpS2B51mZRlQLDTdM6tBwBlpQbsGPF0n7gUSPrmGn1zj7L9VynnPF6ZSwCFMOgGWT2QckUF49Bmwq1PeRBJYUbcSo-77CPcCTlaXWCIAiMKAytR1UKvlLm7qn1xmZ1T8cZcCX9lqOqkVPRQenzqhmYOKoJJ91cO6nc9_Y9a7s9miN_q7DwVoUutucbLFMRvjy31DlipjxEbDaVhviOiIaaz0VzZsN3L9QEmTASGuE-vWB6QFUUhOZ-TJb4UeyEG9iz0bF-LedTVsSRMmax2yHVKF9ecD0nuMhIa9cE3qcZ6HqPYzu_Nl14dRZ4IFRORuPYD4uWEgiEIaTl3EBfPZPWB0uM8CIarVQh8YcW5QDv26IUIWpZ1bQ7PGPOW-bQog7CKA1yApPxZ-67upPzkUAT_rR529H-K_k9wYMGk_tv7ojT_9SnF2tm5xbm8QXz7UsEG-CKHVockwMJ8jY3U_EbyXy4XGnw66-afjlXFMVxhfQUnNmxlLILs36JKN4uPeS6bNbksxI_XbGM_6-wClAsLCOg5jAqhGsqLfc-HdbmdpHlxqVM_IXJ3N3B3K5PCaijAkVWLQnSnQ6CLBDRPuxLhJUtySInpU4fQ_Ub6MDX5t7bA3k3CMyLT9MPhOLHChwwuwBdr4V7G48oUbvC-HYLwyH6EiMu2xLDlNBdVauf5HSzS6b51phLQByTUk6dWeQ58jAYGx8TVyEQFCf2DOJfcRjZ7L2vdXj81ARXsz0nrUgHX1sRTDjg-Kq4MaMAG_AQ9kchodb0quM7IvgfSOdYqpfcWbEtPaznvpL8gGLjtjRRVwa9FPxKXE3cb8flbqbS4b8IfldwpiD3gZxvkehAsWkk9zD_lrFdCT01COg17RBT2XIgEbvLkmZbeXMFsHe7BXAghrmZ_ifFhKaiZeaFZJc0e7kZ5vek3FaNHzZv-HOYmGdBs4TQ0WjqaIsOciVoLKFgRxw7OUgzgSNUxLewgd91_O7GBzfgc1i5dWwR7dm5ZQWZAItzKGG_4i9belqxTUHLdKNTZ_D2R3doykmOiK9_Ch_Pv22SKolHN2-uR4UvIymo8k30Dbh828KQn5402b5W_P3eMHZVTfERdKiht4EsXF1zAJGJ21Nvd1zMVmhmbB4y3v3mAXJg_iRyYGxMBz1gPtgQcx1HyalTwzLncRVhF3Pdq9dBDLHv-Y7JBH4XaT4f6kOc9JtDANJF10txEZQUZyzAI8AWkGq8VfvghTAYZUazZ_3yYUMBFuunTp3gQMCZf8A3Gs3eIRIgOZKOS-y6nL3Qhe_wC3C3gyvmnuM5IgvgoWK4nq5XsDluYvLIClJACp_lh3VtMcXYB850Pqlf_VXspgK89199OCaiCQOLWLrS4i4mkg2RNBIwfsCWePZinRwXSzKTgqHcJr43zC0TCsaAWIlbGM0tz66L15rNQPNgcypBI'
};
var _dbxSaving=false;
var _dbxAccessToken=null;
async function getValidToken(){
  return localStorage.getItem('gones45_dbx_token')||_dbxConfig.refreshToken||null;
}
async function saveToDropbox(){
  if(_dbxSaving)return;
  _dbxSaving=true;
  try{
    var token=await getValidToken();
    if(!token){_dbxSaving=false;showDbxStatus('❌ Token Dropbox invalide');return;}
    var res=await fetch('https://content.dropboxapi.com/2/files/upload',{
      method:'POST',
      headers:{
        'Authorization':'Bearer '+token,
        'Dropbox-API-Arg':JSON.stringify({path:'/GONES45/backup.json',mode:'overwrite',autorename:false}),
        'Content-Type':'application/octet-stream'
      },
      body:JSON.stringify(state)
    });
    _dbxSaving=false;
    if(res.ok){showDbxStatus('✅ Sauvegardé sur Dropbox');}
    else{showDbxStatus('⚠️ Erreur Dropbox '+res.status);}
  }catch(e){_dbxSaving=false;showDbxStatus('❌ Dropbox hors ligne');}
}
async function loadFromDropbox(){
  var el=document.getElementById('dbx-load-status');
  if(el)el.innerText='⏳ Chargement...';
  try{
    var token=await getValidToken();
    if(!token){if(el)el.innerText='❌ Token Dropbox invalide';return;}
    var res=await fetch('https://content.dropboxapi.com/2/files/download',{
      method:'POST',
      headers:{
        'Authorization':'Bearer '+token,
        'Dropbox-API-Arg':JSON.stringify({path:'/GONES45/backup.json'})
      }
    });
    if(!res.ok){if(el)el.innerText='❌ Fichier introuvable sur Dropbox';return;}
    var data=await res.json();
    state=data;
    save();
    if(el)el.innerText='✅ Données chargées !';
    setTimeout(function(){location.reload();},1200);
  }catch(e){if(el)el.innerText='❌ Erreur : '+e.message;}
}
function showDbxStatus(msg){
  var el=document.getElementById('dbx-status');
  if(!el){el=document.createElement('div');el.id='dbx-status';
    el.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(14,18,32,.97);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:7px 16px;font-size:11px;font-weight:700;z-index:9999;color:var(--t1);white-space:nowrap;';
    document.body.appendChild(el);}
  el.innerText=msg;el.style.opacity='1';
  setTimeout(function(){el.style.opacity='0';},3000);
}
/* ── DROPBOX-TRIGGERED SAVE ── */
var _origSave=save;
save=function(){localStorage.setItem('g45v5',JSON.stringify(state));render();saveToDropbox();};

var arjelRows=[{c:3.00,book:'Bookie 1',isFb:false},{c:3.50,book:'Bookie 2',isFb:true},{c:3.20,book:'Bookie 3',isFb:false}];
var arjelMode='full';
function setArjelMode(m){
  arjelMode=m;
  var bf=$i('arjel-mode-full');var bs=$i('arjel-mode-split');
  if(bf){bf.style.background=m==='full'?'rgba(240,176,32,.15)':'none';bf.style.borderColor=m==='full'?'var(--gold)':'var(--b2)';bf.style.color=m==='full'?'var(--gold)':'var(--t3)';}
  if(bs){bs.style.background=m==='split'?'rgba(77,132,255,.15)':'none';bs.style.borderColor=m==='split'?'var(--a)':'var(--b2)';bs.style.color=m==='split'?'var(--a)':'var(--t3)';}
  var desc=$i('arjel-desc');
  if(desc)desc.innerText=m==='full'?'🎟 FB automatique sur la plus grosse cote.':'✂️ Clique sur 🎟/💵 pour choisir qui reçoit le freebet.';
  buildArjelRows();
}
function toggleArjelFb(idx){
  idx=parseInt(idx);
  if(arjelMode==='full'){arjelRows.forEach(function(r,i){r.isFb=(i===idx);});}
  else{arjelRows[idx].isFb=!arjelRows[idx].isFb;}
  buildArjelRows();
}
function buildArjelRows(){
  var dr=$i('arjel-rows');if(!dr)return;
  if(arjelMode==='full'){
    var maxC=Math.max.apply(null,arjelRows.map(function(r){return r.c||0;}));
    arjelRows.forEach(function(r){r.isFb=(r.c===maxC);});
  }
  dr.innerHTML=arjelRows.map(function(r,i){
    var isFb=!!r.isFb;
    return '<div class="dutch-row" style="align-items:center;">'
      +'<button data-idx="'+i+'" onclick="toggleArjelFb(this.dataset.idx)" style="flex-shrink:0;padding:4px 8px;border-radius:4px;border:1px solid '+(isFb?'var(--gold)':'var(--b2)')+';background:'+(isFb?'rgba(240,176,32,.15)':'none')+';color:'+(isFb?'var(--gold)':'var(--t3)')+';font-size:10px;font-weight:700;cursor:pointer;">'+(isFb?'🎟':'💵')+'</button>'
      +'<input class="fi" value="'+r.book+'" placeholder="Bookmaker '+(i+1)+'" data-idx="'+i+'" oninput="arjelRows[this.dataset.idx].book=this.value;" style="flex:1;font-size:12px;">'
      +'<input type="number" class="fi" value="'+r.c+'" step="0.01" data-idx="'+i+'" oninput="arjelRows[this.dataset.idx].c=parseFloat(this.value)||1;buildArjelRows();" style="width:72px;color:'+(isFb?'var(--gold)':'var(--a)')+';font-weight:700;">'
      +(arjelRows.length>2?'<button class="udel" data-idx="'+i+'" onclick="arjelRows.splice(parseInt(this.dataset.idx),1);buildArjelRows();">✕</button>':'')
      +'</div>';
  }).join('');
  calcArjel();
}
function addArjelRow(){arjelRows.push({c:3.0,book:'Bookie '+(arjelRows.length+1),isFb:false});buildArjelRows();}

function calcArjel(){
  var fb=parseFloat(($i('arjel-fb')&&$i('arjel-fb').value)||10);
  if(!fb||arjelRows.length<2)return;
  var fbRows=arjelRows.filter(function(r){return r.isFb;});
  var realRows=arjelRows.filter(function(r){return !r.isFb;});
  if(!fbRows.length){fbRows=[arjelRows[0]];realRows=arjelRows.slice(1);}
  var fbPerRow=fb/fbRows.length;
  /* Gain brut moyen si freebet gagne */
  var gainFb=fbRows.reduce(function(s,r){return s+(r.c-1)*fbPerRow;},0)/fbRows.length;
  /* Mises réelles pour égaliser */
  var mises=[];var totalCash=0;
  realRows.forEach(function(r){
    var m=gainFb/r.c;
    mises.push(m);totalCash+=m;
  });
  var cash=gainFb-totalCash;
  var taux=fb>0?(cash/fb*100).toFixed(1):0;
  var tm=$i('arjel-mise');
  if(tm)tm.innerText='FB: '+fbRows.map(function(r){return '@'+r.c;}).join('+')+' · Réel: '+mises.map(function(m){return m.toFixed(2)+'€';}).join('+');
  var tc=$i('arjel-cash');if(tc){tc.innerText=(cash>=0?'+':'')+cash.toFixed(2)+'€';tc.style.color=cash>=0?'var(--g)':'var(--r)';}
  var tt=$i('arjel-taux');if(tt){tt.innerText=taux+'%';tt.style.color=parseFloat(taux)>80?'var(--g)':parseFloat(taux)>60?'var(--a)':'var(--r)';}
  var det=$i('arjel-detail');
  if(det){det.innerHTML='<div class="calc-res">'
    +fbRows.map(function(r){return '<div class="cres-row"><span class="cres-l">🎟 FB sur '+r.book+' (@'+r.c+')</span><span class="cres-v" style="color:var(--gold)">'+fbPerRow.toFixed(2)+'€</span></div>';}).join('')
    +realRows.map(function(r,i){return '<div class="cres-row"><span class="cres-l">💵 Réel sur '+r.book+' (@'+r.c+')</span><span class="cres-v" style="color:var(--a)">'+mises[i].toFixed(2)+'€</span></div>';}).join('')
    +'</div>';}
  var verd=$i('arjel-verdict');
  if(verd){
    var ok=cash>0;var great=parseFloat(taux)>80;
    verd.style.cssText='display:block;padding:10px;border-radius:var(--r6);text-align:center;font-size:13px;font-weight:700;background:'+(great?'rgba(30,215,96,.1)':ok?'rgba(77,132,255,.1)':'rgba(255,69,69,.1)')+';border:1px solid '+(great?'rgba(30,215,96,.25)':ok?'rgba(77,132,255,.25)':'rgba(255,69,69,.25)')+';color:'+(great?'var(--g)':ok?'var(--a)':'var(--r)');
    verd.innerText=great?'🔥 '+taux+'% = +'+cash.toFixed(2)+'€':ok?'✅ '+taux+'% = +'+cash.toFixed(2)+'€':'❌ Cotes insuffisantes';
  }
}




/* ── MYMATCH SIMPLE ── */
var mmRowsSimple=[{type:'',cote:1.50}];
function renderMmRowsSimple(){
  var sel=$i('mm-sel-simple');if(!sel)return;
  sel.innerHTML=mmRowsSimple.map(function(r,i){
    return '<div class="mm-row">'
      +'<input class="fi" value="'+r.type+'" placeholder="Type (Victoire…)" data-idx="'+i+'" oninput="mmRowsSimple[this.dataset.idx].type=this.value;renderMmCoteSimple();" style="flex:1;padding:6px 8px;font-size:12px;">'
      +'<input type="number" class="fi mm-cote" value="'+r.cote+'" step="0.01" data-idx="'+i+'" oninput="mmRowsSimple[this.dataset.idx].cote=parseFloat(this.value)||1;renderMmCoteSimple();" style="width:72px;color:var(--a);font-weight:700;">'
      +(mmRowsSimple.length>1?'<button class="mm-del" data-idx="'+i+'" onclick="mmRowsSimple.splice(parseInt(this.dataset.idx),1);renderMmRowsSimple();">✕</button>':'')
      +'</div>';
  }).join('');
  var types=$i('mm-types-simple');
  if(types)types.innerHTML=MM_TYPES.map(function(t){return '<button class="mm-type" data-t="'+t+'" onclick="addMmTypeSimple(this.dataset.t)">'+t+'</button>';}).join('');
  renderMmCoteSimple();
}
function renderMmCoteSimple(){
  var cote=mmRowsSimple.reduce(function(a,r){return a*(parseFloat(r.cote)||1);},1);
  var el=$i('mm-cote-total-simple');if(el)el.innerText='@'+cote.toFixed(2);
  var nc=$i('n-cote');if(nc)nc.value=cote.toFixed(2);
}
function addMmRowSimple(){mmRowsSimple.push({type:'',cote:1.50});renderMmRowsSimple();}
function addMmTypeSimple(t){
  if(mmRowsSimple.find(function(r){return r.type===t;}))return;
  mmRowsSimple.push({type:t,cote:1.50});renderMmRowsSimple();
}
function getMmLabelSimple(){
  return mmRowsSimple.filter(function(r){return r.type;}).map(function(r){return r.type+' @'+r.cote;}).join(' + ');
}
function syncSimpleCote(){
  var nc=$i('n-cote');if(!nc)return;
  var v=parseFloat(nc.value)||1;
  if(mmRowsSimple.length===1){mmRowsSimple[0].cote=v;renderMmCoteSimple();}
}

function openClubFromDash(nom){
  /* Switch to bilan tab first, then open club detail */
  var bilanBtn=document.querySelector('.ni[onclick*="t-bilan"]');
  showTab('t-bilan', bilanBtn);
  setTimeout(function(){
    var idx=state.u.findIndex(function(u){return u.n===nom;});
    openClub(nom, idx>=0?idx:0);
  }, 60);
}

/* ── GEMINI API ── */
function saveTavilyKey(){
  var inp=$i('tavily-key-input');if(!inp)return;
  var key=inp.value.trim();if(!key)return;
  localStorage.setItem('gones45_tavily_key',key);
  var st=$i('tavily-key-status');
  if(st){st.innerText='✅ Clé Tavily enregistrée';st.style.color='var(--g)';}
  setTimeout(function(){if(st)st.innerText='';},3000);
}
function getTavilyKey(){return localStorage.getItem('gones45_tavily_key')||null;}
async function testTavilyKey(){
  var key=getTavilyKey();
  var st=$i('tavily-key-status');
  if(!key){if(st){st.innerText='❌ Aucune clé';st.style.color='var(--r)';}return;}
  if(st){st.innerText='⏳ Test…';st.style.color='var(--t3)';}
  try{
    var r=await fetch('https://api.tavily.com/search',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({api_key:key,query:'test',max_results:1})
    });
    var d=await r.json();
    if(d.results){if(st){st.innerText='✅ Clé Tavily valide !';st.style.color='var(--g)';}}
    else{var e=(d.detail||d.error||'Erreur');if(st){st.innerText='❌ '+e.substring(0,80);st.style.color='var(--r)';}}
  }catch(e){if(st){st.innerText='❌ '+e.message;st.style.color='var(--r)';}}
}
async function searchTavily(query){
  var key=getTavilyKey();if(!key)return null;
  try{
    var r=await fetch('https://api.tavily.com/search',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({api_key:key,query:query,max_results:5,search_depth:'advanced',include_answer:true})
    });
    var d=await r.json();
    console.log('[Tavily]',d);
    if(!d.results||!d.results.length)return null;
    /* Priorité à la réponse directe de Tavily */
    var answer=d.answer||'';
    var snippets=d.results.map(function(r){return r.content||r.snippet||'';}).join(' ').substring(0,600);
    return answer?answer+' '+snippets:snippets;
  }catch(e){console.log('[Tavily erreur]',e);return null;}
}
function saveGeminiKey(){
  var inp=$i('gemini-key-input');if(!inp)return;
  var key=inp.value.trim();if(!key)return;
  localStorage.setItem('gones45_gemini_key',key);
  var st=$i('gemini-key-status');
  if(st){st.innerText='✅ Clé Groq enregistrée';st.style.color='var(--g)';}
  setTimeout(function(){if(st)st.innerText='';},3000);
}

function getApiSportsKey(){ return localStorage.getItem('gones45_apisports_key')||null; }

function saveApiSportsKey(){
  var inp = $i('apisports-key-input'); if(!inp) return;
  var key = inp.value.trim();
  if(!key){ alert('Clé vide'); return; }
  localStorage.setItem('gones45_apisports_key', key);
  var st = $i('apisports-key-status');
  if(st){ st.textContent='✅ Clé sauvegardée !'; st.style.color='var(--g)'; }
  saveToDropbox();
}

async function testApiSportsKey(){
  var key = getApiSportsKey();
  if(!key){ alert('Sauvegarde la clé d\'abord'); return; }
  var st = $i('apisports-key-status');
  if(st){ st.textContent='⏳ Test en cours...'; st.style.color='var(--t3)'; }
  try {
    var r = await fetch('https://fd-proxy.touraine-antoine.workers.dev/?key='+encodeURIComponent(key)+'&path=/status&host=apisports');
    var d = await r.json();
    var resp = d&&d.response&&d.response[0]||d&&d.response||null;
    if(resp&&resp.requests) {
      var cur = resp.requests.current||0;
      var lim = resp.requests.limit_day||100;
      if(st){ st.textContent='✅ Clé valide ! '+cur+'/'+lim+' req aujourd\'hui'; st.style.color='var(--g)'; }
    } else if(d&&d.errors&&d.errors.length) {
      if(st){ st.textContent='❌ '+JSON.stringify(d.errors[0]); st.style.color='var(--r)'; }
    } else {
      // Clé valide mais réponse inattendue
      if(st){ st.textContent='✅ Clé valide !'; st.style.color='var(--g)'; }
    }
  } catch(e) {
    if(st){ st.textContent='❌ Erreur : '+e.message; st.style.color='var(--r)'; }
  }
}

async function apiSportsFetch(path){
  var key = getApiSportsKey();
  if(!key) throw new Error('Clé api-sports manquante — configure dans Outils');
  var r = await fetch('https://fd-proxy.touraine-antoine.workers.dev/?key='+encodeURIComponent(key)+'&path='+encodeURIComponent(path)+'&host=apisports');
  if(!r.ok) throw new Error('HTTP '+r.status);
  return await r.json();
}

function getGeminiKey(){return localStorage.getItem('gones45_gemini_key')||null;}
async function testGroqKey(){
  var key=getGeminiKey();
  var st=$i('gemini-key-status');
  if(!key){if(st){st.innerText='❌ Aucune clé';st.style.color='var(--r)';}return;}
  if(st){st.innerText='⏳ Test…';st.style.color='var(--t3)';}
  try{
    var r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
      body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:[{role:'user',content:'OK'}],max_tokens:3})
    });
    var d=await r.json();
    if(d.choices&&d.choices[0]){if(st){st.innerText='✅ Clé valide !';st.style.color='var(--g)';}}
    else{var e=(d.error&&d.error.message)||JSON.stringify(d);if(st){st.innerText='❌ '+e.substring(0,80);st.style.color='var(--r)';}}
  }catch(e){if(st){st.innerText='❌ '+e.message;st.style.color='var(--r)';}}
}

/* ── CHAT GROQ ── */
var _chatHistory=[];

function chatBubble(role,text){
  var box=$i('chat-messages');if(!box)return;
  var isUser=role==='user';
  var div=document.createElement('div');
  div.style.cssText='display:flex;'+(isUser?'justify-content:flex-end':'justify-content:flex-start')+';';
  div.innerHTML='<div style="max-width:80%;padding:9px 13px;border-radius:'+(isUser?'14px 14px 4px 14px':'14px 14px 14px 4px')+
    ';background:'+(isUser?'var(--a)':'var(--s2)')+
    ';color:var(--t1);font-size:13px;line-height:1.5;white-space:pre-wrap;">'+
    text.replace(/</g,'&lt;')+'</div>';
  box.appendChild(div);
  box.scrollTop=box.scrollHeight;
}

function buildContext(){
  var s=state;
  var top5=s.u.slice(0,5).map(function(u){
    var paris=s.a.filter(function(h){return h.n===u.n;});
    var profit=paris.reduce(function(a,h){return a+(h.win?(h.m*h.cote)-h.m:-h.m);},0);
    return u.n+'('+(profit>=0?'+':'')+profit.toFixed(0)+'€)';
  }).join(',');
  var totalProfit=s.a.reduce(function(a,h){return a+(h.win?(h.m*h.cote)-h.m:-h.m);},0);
  var cap=Object.values(s.b).reduce(function(a,v){return a+parseFloat(v||0);},0);
  var today=new Date();var dateStr=today.toLocaleDateString('fr-FR');
  var dayNames=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  var dayName=dayNames[today.getDay()];
  return 'Tu es un assistant paris sportifs. Nous sommes le '+dayName+' '+dateStr+'. IMPORTANT: tout match dont la date est AVANT ce jour est TERMINE - ne jamais le presenter comme futur. REGLES: 1) Jamais de redirection ou "je n ai pas acces". 2) Max 2-3 phrases directes. 3) Si info via web dis-la directement. 4) Pas de markdown. 5) Si on te demande un match passe, donne le resultat si tu le sais. Bankroll:'+cap.toFixed(0)+'€ profit:'+totalProfit.toFixed(0)+'€ equipes:'+top5+'.';
}
function buildContextWithParams() {
  var base = buildContext();
  var extras = [];
  if (_chatParams.equipe) extras.push('Équipe focus: '+_chatParams.equipe);
  if (_chatParams.lieu !== 'both') extras.push('Mode favori: '+(_chatParams.lieu==='domicile'?'Domicile':'Extérieur'));
  if (_chatParams.types.length) extras.push('Types de paris à privilégier: '+_chatParams.types.join(', '));
  if (_chatParams.champOnly) extras.push('Analyse uniquement les matchs de championnat, exclure Coupes et amicaux');
  if (extras.length) base += ' PRÉFÉRENCES UTILISATEUR: '+extras.join('. ')+'.';
  return base;
}

async function sendChat(){
  var inp=$i('chat-input');
  var msg=inp?inp.value.trim():'';
  if(!msg)return;
  var key=getGeminiKey();
  if(!key){chatBubble('assistant','Configure ta cle Groq dans Outils.');return;}
  inp.value='';
  chatBubble('user',msg);
  _chatHistory.push({role:'user',content:msg});

  /* Indicateur de frappe */
  var box=$i('chat-messages');
  var typing=document.createElement('div');
  typing.id='chat-typing';
  typing.style.cssText='display:flex;justify-content:flex-start;';
  typing.innerHTML='<div style="padding:9px 13px;border-radius:14px 14px 14px 4px;background:var(--s2);color:var(--t3);font-size:12px;">…</div>';
  if(box){box.appendChild(typing);box.scrollTop=box.scrollHeight;}

  try{
    /* Recherche Tavily si question d'actu */
    var needsWeb=/match|résultat|score|classement|ligue|champion|derby|finale|vainqueur|transfert|blessé|compo|prochain|dernier|hier|aujourd|semaine|récent|actuell|2025|2026|nba|nfl|mlb|nhl|dodgers|lakers|yankees|chelsea|arsenal|psg|real|barça|liga|premier|bundesliga/i.test(msg);
    var webCtx='';var webFound=false;
    if(needsWeb&&getTavilyKey()){var searchResult=await searchTavily(msg);if(searchResult){webCtx=searchResult;webFound=true;}}
    var sysPrompt=webFound
      ?'Tu as ces infos web. Cite uniquement ce qui est confirmé. Si le score exact n est pas dans les infos, dis juste qui a gagné. 1-2 phrases en français, pas de supposition: '+webCtx
      :buildContextWithParams();
    var messages=[{role:'system',content:sysPrompt},{role:'user',content:msg}];
    var r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
      body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:messages,temperature:0.3,max_tokens:150})
    });
    var d=await r.json();
    var t=document.getElementById('chat-typing');if(t)t.remove();
    if(d.error)throw new Error(d.error.message);
    var reply=d.choices[0].message.content.trim();
    /* Retirer les citations [1][2] de compound-beta */
    reply=reply.replace(/\[\d+\]/g,'').trim();
    _chatHistory.push({role:'assistant',content:reply});
    chatBubble('assistant',reply);
  }catch(e){
    var t=document.getElementById('chat-typing');if(t)t.remove();
    chatBubble('assistant','Erreur : '+e.message);
  }
}

/* ── LIENS ── */
function loadCustomLinks(){
  var el=$i('custom-links-list');if(!el)return;
  var links=JSON.parse(localStorage.getItem('g45_links')||'[]');
  if(!links.length){el.innerHTML='<div class="empty">Aucun lien perso</div>';return;}
  el.innerHTML=links.map(function(l,i){
    return '<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--s1);border-radius:var(--r6);margin-bottom:6px;border:1px solid var(--b1);">'
      +'<a href="'+l.url+'" target="_blank" style="flex:1;color:var(--a);font-size:13px;font-weight:700;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">🔗 '+l.name+'</a>'
      +'<button onclick="deleteLink('+i+')" style="background:none;border:none;color:var(--r);cursor:pointer;font-size:16px;flex-shrink:0;">🗑</button>'
      +'</div>';
  }).join('');
}
function addCustomLink(){
  var name=$i('link-name');var url=$i('link-url');
  if(!name||!url||!name.value.trim()||!url.value.trim())return;
  var u=url.value.trim();
  if(!u.startsWith('http'))u='https://'+u;
  var links=JSON.parse(localStorage.getItem('g45_links')||'[]');
  links.push({name:name.value.trim(),url:u});
  localStorage.setItem('g45_links',JSON.stringify(links));
  name.value='';url.value='';
  loadCustomLinks();
}
function deleteLink(i){
  var links=JSON.parse(localStorage.getItem('g45_links')||'[]');
  links.splice(i,1);
  localStorage.setItem('g45_links',JSON.stringify(links));
  loadCustomLinks();
}
function togglePariDom(val){
  var inp=$i('p-domicile');if(inp)inp.value=val===null?'':val?'dom':'ext';
  var d=$i('pari-dom-btn');var e=$i('pari-ext-btn');var n=$i('pari-neu-btn');
  var active='border-color:var(--a);background:rgba(77,132,255,.15);color:var(--a);';
  var def='border:2px solid var(--b2);background:var(--bg3);color:var(--t2);';
  if(d)d.style.cssText=val===true?active:def;
  if(e)e.style.cssText=val===false?active:def;
  if(n)n.style.cssText=val===null?active:def;
}
function toggleEditDom(val){
  var inp=$i('edit-domicile');if(inp)inp.value=val?'dom':'ext';
  var d=$i('edit-dom-btn');var e=$i('edit-ext-btn');
  var active='flex:1;padding:10px;border-radius:var(--r6);border:2px solid var(--a);background:rgba(77,132,255,.15);color:var(--a);font-size:13px;font-weight:700;cursor:pointer;';
  var def='flex:1;padding:10px;border-radius:var(--r6);border:2px solid var(--b2);background:var(--bg3);color:var(--t2);font-size:13px;font-weight:700;cursor:pointer;';
  if(d)d.style.cssText=val?active:def;
  if(e)e.style.cssText=!val?active:def;
}
function editBet(id){
  var h=state.h.find(function(x){return x.id===id;});if(!h)return;
  $i('edit-bet-id').value=id;
  $i('edit-target').value=h.target||'';
  $i('edit-equipe').value=h.n||'';
  $i('edit-cote').value=h.cote||'';
  $i('edit-mise').value=h.m||'';
  $i('edit-sport').value=h.sport||'';
  $i('edit-comp').value=h.comp||'';
  $i('edit-type').value=h.type||'';
  $i('edit-bk').value=h.b||'';
  $i('edit-date').value=h.date||'';
  $i('edit-heure').value=h.heure||'';
  $i('edit-notes').value=h.notes||'';
  $i('edit-domicile').value=h.domicile||'';
  toggleEditDom(h.domicile==='dom'?true:false);
  var m=$i('edit-bet-modal');if(m)m.style.display='flex';
}
function closeEditBet(){
  var m=$i('edit-bet-modal');if(m)m.style.display='none';
}
function saveEditBet(){
  var id=$i('edit-bet-id').value;
  var idx=state.h.findIndex(function(x){return x.id===id;});if(idx===-1)return;
  var h=state.h[idx];
  h.target=$i('edit-target').value.trim();
  h.n=$i('edit-equipe').value.trim();
  h.cote=parseFloat($i('edit-cote').value)||h.cote;
  h.m=parseFloat($i('edit-mise').value)||h.m;
  h.sport=$i('edit-sport').value.trim();
  h.comp=$i('edit-comp').value.trim();
  h.type=$i('edit-type').value.trim();
  h.b=$i('edit-bk').value.trim();
  h.date=$i('edit-date').value;
  h.heure=$i('edit-heure').value;
  h.notes=$i('edit-notes').value.trim();
  h.domicile=$i('edit-domicile').value;
  save();render();closeEditBet();
}
function togglePlusMenu(){
  var m=$i('plus-menu');if(!m)return;
  var open=m.style.display==='block';
  m.style.display=open?'none':'block';
  if(!open){
    setTimeout(function(){
      document.addEventListener('click',function h(e){
        var pm=$i('plus-menu');var btn=$i('btn-plus-menu');
        if(pm&&btn&&!pm.contains(e.target)&&!btn.contains(e.target)){
          pm.style.display='none';document.removeEventListener('click',h);
        }
      });
    },50);
  }
}
function resetChat(){
  _chatHistory=[];
  var b1=$i('chat-messages');if(b1)b1.innerHTML='';
  var b2=$i('chat-messages-pc');if(b2)b2.innerHTML='';
}

/* ── SCAN TICKET via bloc-notes ── */
(function(){
  var penseBeteZone = document.getElementById('pc-note');
  if(!penseBeteZone) return;

  penseBeteZone.addEventListener('paste', function(e) {
    var items = e.clipboardData.items;
    for(var i=0;i<items.length;i++){
      var item = items[i];
      if(item.type.indexOf('image') !== -1){
        var blob = item.getAsFile();
        var reader = new FileReader();
        reader.onload = (function(blob){return function(event){
          var imageBase64 = event.target.result;

          penseBeteZone.innerHTML = '<img src="'+imageBase64+'" alt="Pense-bête" style="max-width:100%;border-radius:6px;">';
          localStorage.setItem('penseBeteImage', imageBase64);

          var avertissement = document.createElement('div');
          avertissement.style.cssText = 'position:absolute;bottom:10px;left:10px;background:rgba(0,0,0,0.8);color:#00ff88;padding:5px 10px;border-radius:5px;font-size:12px;z-index:10;';
          avertissement.innerText = 'Lecture du ticket en cours... ⏳';
          penseBeteZone.style.position = 'relative';
          penseBeteZone.appendChild(avertissement);

          if(typeof Tesseract === 'undefined'){ avertissement.innerText='❌ Tesseract non chargé'; return; }

          Tesseract.recognize(imageBase64, 'fra').then(function(result){
            var text = result.data.text;
            console.log('Texte: '+text);
            avertissement.innerText = 'Lecture réussie ! 🎯';
            setTimeout(function(){ avertissement.remove(); }, 2000);

            // Cote
            var matchCote = text.match(/(\d)[,.](\d{2})/);
            if(matchCote){
              var cEl = document.getElementById('n-cote')||document.getElementById('c-cote');
              if(cEl){ cEl.value = matchCote[1]+'.'+matchCote[2]; cEl.dispatchEvent(new Event('input')); }
            }

            // Mise
            var matchMise = text.match(/[Mm]ise\s*([\d,. ]+)/i);
            if(matchMise){
              var mv = parseFloat(matchMise[1].trim().replace(',','.').replace(/\s/g,''));
              var mEl = document.getElementById('n-mise')||document.getElementById('c-mise');
              if(mEl && mv>0) mEl.value = mv;
            }

            // Équipes
            var lignes = text.split('\n');
            var BRUIT = ['mise','gain','cashout','compléter','vainqueur','réf'];
            var ligneMatch = lignes.find(function(l){ return l.includes(' - ') && !BRUIT.some(function(b){return l.toLowerCase().includes(b);}); });
            if(ligneMatch){
              var tEl = document.getElementById('n-team')||document.getElementById('c-target');
              if(tEl) tEl.value = ligneMatch.trim().replace(/\s*(demain|aujourd'hui|\d{2}:\d{2}|LS &)\s*/gi,'').trim();
            }

            // Bookmaker
            var txtLow = text.toLowerCase();
            var bEl = document.getElementById('n-book')||document.getElementById('c-book');
            if(bEl){
              if(txtLow.includes('winamax')||txtLow.includes('cashout')||txtLow.includes('compléter')) bEl.value='Winamax';
              else if(txtLow.includes('betclic')) bEl.value='Betclic';
              else if(txtLow.includes('pmu')) bEl.value='PMU';
              else if(txtLow.includes('unibet')) bEl.value='Unibet';
              else if(txtLow.includes('zebet')) bEl.value='ZEbet';
            }

            // Sport
            var spEl = document.getElementById('n-sport')||document.getElementById('c-sport');
            if(spEl){
              var nhlTeams = ['golden knights','avalanche','maple leafs','canadiens','bruins','rangers','penguins','oilers','flames','canucks'];
              if(txtLow.includes('nhl')||txtLow.includes('hockey')||nhlTeams.some(function(t){return txtLow.includes(t);})) spEl.value='🏒';
              else if(txtLow.includes('tennis')||txtLow.includes('atp')||txtLow.includes('wta')||txtLow.includes('roland garros')) spEl.value='🎾';
              else if(txtLow.includes('nba')||txtLow.includes('basket')) spEl.value='🏀';
              else if(txtLow.includes('ligue 1')||txtLow.includes('champions league')||txtLow.includes('premier league')) spEl.value='⚽';
              else if(txtLow.includes('rugby')) spEl.value='🏉';
              else if(txtLow.includes('football')) spEl.value='⚽';
            }

          }).catch(function(err){
            console.error('Erreur Tesseract :', err);
            avertissement.innerText = 'Erreur de lecture ❌';
            setTimeout(function(){ avertissement.remove(); }, 2000);
          });
        };})(blob);
        reader.readAsDataURL(blob);
      }
    }
  });
})();


localStorage.setItem('gones45_dbx_token','sl.u.AGhBCqnmWUxbU0tdeMSXTeodWfHcx6CsLZpS2B51mZRlQLDTdM6tBwBlpQbsGPF0n7gUSPrmGn1zj7L9VynnPF6ZSwCFMOgGWT2QckUF49Bmwq1PeRBJYUbcSo-77CPcCTlaXWCIAiMKAytR1UKvlLm7qn1xmZ1T8cZcCX9lqOqkVPRQenzqhmYOKoJJ91cO6nc9_Y9a7s9miN_q7DwVoUutucbLFMRvjy31DlipjxEbDaVhviOiIaaz0VzZsN3L9QEmTASGuE-vWB6QFUUhOZ-TJb4UeyEG9iz0bF-LedTVsSRMmax2yHVKF9ecD0nuMhIa9cE3qcZ6HqPYzu_Nl14dRZ4IFRORuPYD4uWEgiEIaTl3EBfPZPWB0uM8CIarVQh8YcW5QDv26IUIWpZ1bQ7PGPOW-bQog7CKA1yApPxZ-67upPzkUAT_rR529H-K_k9wYMGk_tv7ojT_9SnF2tm5xbm8QXz7UsEG-CKHVockwMJ8jY3U_EbyXy4XGnw66-afjlXFMVxhfQUnNmxlLILs36JKN4uPeS6bNbksxI_XbGM_6-wClAsLCOg5jAqhGsqLfc-HdbmdpHlxqVM_IXJ3N3B3K5PCaijAkVWLQnSnQ6CLBDRPuxLhJUtySInpU4fQ_Ub6MDX5t7bA3k3CMyLT9MPhOLHChwwuwBdr4V7G48oUbvC-HYLwyH6EiMu2xLDlNBdVauf5HSzS6b51phLQByTUk6dWeQ58jAYGx8TVyEQFCf2DOJfcRjZ7L2vdXj81ARXsz0nrUgHX1sRTDjg-Kq4MaMAG_AQ9kchodb0quM7IvgfSOdYqpfcWbEtPaznvpL8gGLjtjRRVwa9FPxKXE3cb8flbqbS4b8IfldwpiD3gZxvkehAsWkk9zD_lrFdCT01COg17RBT2XIgEbvLkmZbeXMFsHe7BXAghrmZ_ifFhKaiZeaFZJc0e7kZ5vek3FaNHzZv-HOYmGdBs4TQ0WjqaIsOciVoLKFgRxw7OUgzgSNUxLewgd91_O7GBzfgc1i5dWwR7dm5ZQWZAItzKGG_4i9belqxTUHLdKNTZ_D2R3doykmOiK9_Ch_Pv22SKolHN2-uR4UvIymo8k30Dbh828KQn5402b5W_P3eMHZVTfERdKiht4EsXF1zAJGJ21Nvd1zMVmhmbB4y3v3mAXJg_iRyYGxMBz1gPtgQcx1HyalTwzLncRVhF3Pdq9dBDLHv-Y7JBH4XaT4f6kOc9JtDANJF10xEZQUZyzAI8AWkGq8VfvghTAYZUazZ_3yYUMBFuunTp3gQMCZf8A3Gs3eIRIgOZKOS-y6nL3Qhe_wC3C3gyvmnuM5IgvgoWK4nq5XsDluYvLIClJACp_lh3VtMcXYB850Pqlf_VXspgK89199OCaiCQOLWLrS4i4mkg2RNBIwfsCWePZinRwXSzKTgqHcJr43zC0TCsaAWIlbGM0tz66L15rNQPNgcypBI');
if(window.location.hash.indexOf("#simu=")>=0 || new URLSearchParams(window.location.search).get("sim")) setTimeout(chargerSimuDepuisUrl, 800);
if(window.location.hash.indexOf('#profil=')>=0) setTimeout(chargerProfilDepuisUrl, 800);
function saveNote(){
  var n=$i('pc-note');if(!n)return;
  localStorage.setItem('gones45_note',n.innerHTML);
}
function clearNote(){
  if(confirm('Effacer le pense-bête ?')){
    var n=$i('pc-note');if(n)n.innerHTML='';
    localStorage.removeItem('gones45_note');
  }
}
function chatBubblePC(role,text){
  var box=$i('chat-messages-pc');if(!box)return;
  var isUser=role==='user';
  var div=document.createElement('div');
  div.style.cssText='display:flex;'+(isUser?'justify-content:flex-end':'justify-content:flex-start')+';margin-bottom:4px;';
  div.innerHTML='<div style="max-width:85%;padding:7px 11px;border-radius:'+(isUser?'12px 12px 4px 12px':'12px 12px 12px 4px')+
    ';background:'+(isUser?'var(--a)':'var(--s2)')+
    ';color:var(--t1);font-size:12px;line-height:1.4;white-space:pre-wrap;">'+
    text.replace(/</g,'&lt;')+'</div>';
  box.appendChild(div);
  box.scrollTop=box.scrollHeight;
}
async function sendChatPC(){
  var inp=$i('chat-input-pc');
  var msg=inp?inp.value.trim():'';
  if(!msg)return;
  var key=getGeminiKey();
  if(!key){chatBubblePC('assistant','Configure ta clé Groq dans Outils.');return;}
  inp.value='';
  chatBubblePC('user',msg);
  _chatHistory.push({role:'user',content:msg});
  var typing=document.createElement('div');
  typing.id='chat-typing-pc';
  typing.style.cssText='display:flex;justify-content:flex-start;';
  typing.innerHTML='<div style="padding:7px 11px;border-radius:12px 12px 12px 4px;background:var(--s2);color:var(--t3);font-size:11px;">…</div>';
  var box=$i('chat-messages-pc');if(box){box.appendChild(typing);box.scrollTop=box.scrollHeight;}
  try{
    var needsWeb=/match|résultat|score|classement|ligue|champion|derby|finale|vainqueur|transfert|blessé|compo|prochain|dernier|hier|aujourd|semaine|récent|actuell|2025|2026|nba|nfl|mlb|nhl|dodgers|lakers|yankees|chelsea|arsenal|psg|real|barça|liga|premier|bundesliga/i.test(msg);
    var webCtx='';var webFound2=false;
    if(needsWeb&&getTavilyKey()){var sr=await searchTavily(msg);if(sr){webCtx=sr;webFound2=true;}}
    var sysPC=webFound2?'Tu as ces infos web. Cite uniquement ce qui est confirmé. Si le score exact n est pas dedans, dis juste qui a gagné. 1-2 phrases en français: '+webCtx:buildContextWithParams();
    var messages=[{role:'system',content:sysPC},{role:'user',content:msg}];
    var r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
      body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:messages,temperature:0.3,max_tokens:150})
    });
    var d=await r.json();
    var t=document.getElementById('chat-typing-pc');if(t)t.remove();
    if(d.error)throw new Error(d.error.message);
    var reply=d.choices[0].message.content.trim();
    _chatHistory.push({role:'assistant',content:reply});
    chatBubblePC('assistant',reply);
  }catch(e){
    var t=document.getElementById('chat-typing-pc');if(t)t.remove();
    chatBubblePC('assistant','Erreur : '+e.message);
  }
}

// ── ANALYSE IA ÉQUIPE ──

// ── FOOTBALL-DATA.ORG ──

// ── API-FOOTBALL (RAPIDAPI) ──

// ── THESPORTSDB — LOGOS OFFICIELS ──
var _tsdbCache = {};

async function getTeamLogo(teamName) {
  if(_tsdbCache[teamName]) return _tsdbCache[teamName];
  try {
    var r = await fetch('https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t='+encodeURIComponent(teamName));
    var d = await r.json();
    if(d.teams && d.teams.length) {
      var logo = d.teams[0].strTeamBadge;
      _tsdbCache[teamName] = logo;
      return logo;
    }
  } catch(e) {}
  return null;
}

async function enrichTeamLogos() {
  // Mettre à jour les logos des équipes depuis TheSportsDB
  if(!state.u || !state.u.length) return;
  for(var i=0; i<Math.min(state.u.length, 5); i++) {
    var u = state.u[i];
    if(u.logoUrl && u.logoUrl.indexOf('thesportsdb') >= 0) continue; // déjà enrichi
    var logo = await getTeamLogo(u.n);
    if(logo && !u.logoUrl) {
      u.logoUrl = logo;
    }
  }
  save();
  render();
}

function getApiFootballKey(){ return localStorage.getItem('gones45_apifootball_key')||null; }

function saveGithubToken(){
  var v = ($i('github-token-input')||{}).value||'';
  if(!v){ document.getElementById('github-token-status').textContent='Token vide'; return; }
  localStorage.setItem('gones45_github_token', v.trim());
  document.getElementById('github-token-status').textContent='✓ Token enregistré';
  document.getElementById('github-token-status').style.color='#1ed760';
}

// ── GitHub Stats Sync ──
var GITHUB_OWNER = 'gones45140';
var GITHUB_REPO = 'gones45';
var GITHUB_FILE = 'données/joueurs.json';

async function githubGetStats() {
  var token = localStorage.getItem('gones45_github_token');
  if(!token) return null;
  try {
    var r = await fetch('https://api.github.com/repos/'+GITHUB_OWNER+'/'+GITHUB_REPO+'/contents/'+GITHUB_FILE, {
      headers: {'Authorization':'token '+token, 'Accept':'application/vnd.github.v3+json'}
    });
    if(r.status===404) return {data:{}, sha:null};
    var d = await r.json();
    var data = JSON.parse(atob(d.content.split('\n').join('')));
    return {data:data, sha:d.sha};
  } catch(e) { console.warn('GitHub read error:', e); return null; }
}

async function githubSaveStats(data, sha) {
  var token = localStorage.getItem('gones45_github_token');
  if(!token) return false;
  try {
    var body = {
      message: 'Update player stats',
      content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2)))),
    };
    if(sha) body.sha = sha;
    var r = await fetch('https://api.github.com/repos/'+GITHUB_OWNER+'/'+GITHUB_REPO+'/contents/'+GITHUB_FILE, {
      method:'PUT',
      headers:{'Authorization':'token '+token,'Content-Type':'application/json','Accept':'application/vnd.github.v3+json'},
      body:JSON.stringify(body)
    });
    return r.ok;
  } catch(e) { console.warn('GitHub write error:', e); return false; }
}

async function syncStatsFromGithub() {
  var result = await githubGetStats();
  if(!result) return;
  var data = result.data;
  // Merge GitHub stats into localStorage
  Object.keys(data).forEach(function(key){
    if(key.startsWith('manual_stats_')) {
      localStorage.setItem(key, JSON.stringify(data[key]));
    }
  });
  localStorage.setItem('github_stats_sha', result.sha||'');
  console.log('Stats synced from GitHub:', Object.keys(data).length, 'entries');
}

async function saveStatToGithub(key, value) {
  var result = await githubGetStats();
  if(!result) return;
  var data = result.data || {};
  data[key] = value;
  // Also save all local manual_stats
  Object.keys(localStorage).forEach(function(k){
    if(k.startsWith('manual_stats_')){
      try { data[k] = JSON.parse(localStorage.getItem(k)); } catch(e){}
    }
  });
  await githubSaveStats(data, result.sha);
}

function saveRapidApiKey(){
  var v = ($i('rapidapi-key-input')||{}).value||'';
  if(!v){ document.getElementById('rapidapi-key-status').textContent='Clé vide'; return; }
  localStorage.setItem('gones45_rapidapi_key', v.trim());
  document.getElementById('rapidapi-key-status').textContent='✓ Clé enregistrée';
  document.getElementById('rapidapi-key-status').style.color='#1ed760';
}

function saveApiFootballKey(){
  var v = ($i('apifootball-key-input')||{}).value||'';
  if(!v){ document.getElementById('apifootball-key-status').textContent='Clé vide'; return; }
  localStorage.setItem('gones45_apifootball_key', v.trim());
  document.getElementById('apifootball-key-status').textContent='✓ Clé sauvegardée';
  document.getElementById('apifootball-key-status').style.color='#1ed760';
}

async function testApiFootballKey(){
  var key = getApiFootballKey();
  var el = document.getElementById('apifootball-key-status');
  if(!key){ el.textContent='Aucune clé'; return; }
  el.textContent='Test...'; el.style.color='#f0b020';
  try {
    var r = await fetch('https://fd-proxy.touraine-antoine.workers.dev?key='+encodeURIComponent(key)+'&path=/v4/competitions&host=api-football', {});
    if(r.ok){ el.textContent='✓ Clé valide !'; el.style.color='#1ed760'; }
    else { el.textContent='✗ Invalide'; el.style.color='#ff4545'; }
  } catch(e) {
    el.textContent='✓ Clé enregistrée'; el.style.color='#1ed760';
  }
}

async function apiFootballFetch(endpoint) {
  var key = getApiFootballKey();
  if(!key) return null;
  try {
    var r = await fetch('https://api-football-v1.p.rapidapi.com'+endpoint, {
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    });
    if(!r.ok) return null;
    return await r.json();
  } catch(e) { return null; }
}

function getFdorgKey(){ return localStorage.getItem('gones45_fdorg_key')||null; }
var FD_PROXY = 'https://fd-proxy.touraine-antoine.workers.dev';

async function fdFetch(path) {
  var key = getFdorgKey();
  if(!key) return null;
  try {
    var r = await fetch(FD_PROXY+'?key='+encodeURIComponent(key)+'&path='+encodeURIComponent(path));
    if(!r.ok) return null;
    return await r.json();
  } catch(e) { return null; }
}

function saveFdorgKey(){
  var v = ($i('fdorg-key-input')||{}).value||'';
  if(!v){ showFdorgStatus('Clé vide','#ff4545'); return; }
  localStorage.setItem('gones45_fdorg_key', v.trim());
  showFdorgStatus('✓ Clé sauvegardée','#1ed760');
}

function showFdorgStatus(msg, color){
  var el=$i('fdorg-key-status');
  if(el){ el.textContent=msg; el.style.color=color; }
}

function testFdorgKey(){
  var key = getFdorgKey();
  if(!key){ showFdorgStatus('Aucune clé','#ff4545'); return; }
  showFdorgStatus('✓ Clé enregistrée','#1ed760');
}

// Récupérer les stats d'une équipe via Groq qui appelle football-data
async function getTeamStatsViaGroq(teamName, cpTypes) {
  var groqKey = getGeminiKey();
  var fdKey = getFdorgKey();
  if(!groqKey) return null;

  var typesStr = cpTypes && cpTypes.length ? cpTypes.join(', ') : 'Victoire, Over 2.5, BTS Oui';

  var prompt = 'Recherche les statistiques recentes de '+teamName+' en football : '
    + '10 derniers matchs (resultats), % Over 2.5 buts, % Over 3.5 buts, % BTS Oui, % victoires domicile, % victoires exterieur. '
    + 'Donne les stats chiffrees precises puis une analyse de 3 phrases en francais sur ces types de paris : '+typesStr+'.';

  // Map noms équipes vers IDs football-data (plan gratuit)
  

  try {
    // Trouver ID equipe
    var teamId = null;
    var nameToTry = teamName;
    // Essai direct
    for(var k in TEAM_IDS) {
      if(k.toLowerCase()===teamName.toLowerCase()) { teamId=TEAM_IDS[k]; break; }
    }
    // Essai partiel si pas trouvé
    if(!teamId) {
      for(var k in TEAM_IDS) {
        if(teamName.toLowerCase().indexOf(k.toLowerCase())>=0 || k.toLowerCase().indexOf(teamName.toLowerCase())>=0) {
          teamId=TEAM_IDS[k]; break;
        }
      }
    }

    var matchStats = '';
    if(teamId) {
      // Récupérer les 10 derniers matchs via proxy
      var matches = await fdFetch('/v4/teams/'+teamId+'/matches?status=FINISHED&limit=10');
      if(matches && matches.matches && matches.matches.length) {
        var ms = matches.matches;
        var over25=0, over35=0, bts=0, domW=0, domTotal=0, extW=0, extTotal=0;
        ms.forEach(function(m){
          var hg=(m.score&&m.score.regularTime?m.score.regularTime.home:m.score&&m.score.fullTime?m.score.fullTime.home:0)||0;
          var ag=(m.score&&m.score.regularTime?m.score.regularTime.away:m.score&&m.score.fullTime?m.score.fullTime.away:0)||0;
          var total=hg+ag;
          if(total>2.5) over25++;
          if(total>3.5) over35++;
          if(hg>0&&ag>0) bts++;
          var isDom = m.homeTeam&&m.homeTeam.id===teamId;
          var won = isDom?(hg>ag):(ag>hg);
          if(isDom){domTotal++;if(won)domW++;}
          else{extTotal++;if(won)extW++;}
        });
        var n=ms.length;
        matchStats = teamName+' sur '+n+' derniers matchs : '
          +'Over 2.5='+over25+'/'+n+' ('+Math.round(over25/n*100)+'%), '
          +'Over 3.5='+over35+'/'+n+' ('+Math.round(over35/n*100)+'%), '
          +'BTS='+bts+'/'+n+' ('+Math.round(bts/n*100)+'%), '
          +'Dom='+domW+'/'+(domTotal||1)+' victoires, '
          +'Ext='+extW+'/'+(extTotal||1)+' victoires.';
      }
    }

    // 3. Fallback Tavily si pas de données
    if(!matchStats) {
      var tavilyKey = getTavilyKey();
      if(tavilyKey) {
        var webData = await searchTavily(teamName+' statistiques Over 2.5 forme 2025 2026');
        if(webData) matchStats = webData.substring(0,800);
      }
    }

    if(!matchStats || !groqKey) return null;

    // 4. Groq analyse
    var analysisPrompt = 'Tu es expert paris sportifs. Stats reelles de '+teamName+' : '+matchStats+'. Analyse en 3 phrases pour ces types de paris : '+typesStr+'. En francais, sois direct et precis avec les chiffres.';
    var r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+groqKey},
      body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:[{role:'user',content:analysisPrompt}],max_tokens:400,temperature:0.2})
    });
    var d = await r.json();
    if(d.error) return null;
    return d.choices[0].message.content.trim();
  } catch(e) { return null; }
}

// ── STATS 2 SAISONS PAR ÉQUIPE ──
var _saisonsCache = {};

// ── AIDE CLÉS API ──
var KEY_HELP = {
  groq: {
    title: '⚡ Comment obtenir ta clé Groq',
    color: '#7aaaff',
    steps: [
      {n:'1', t:'<a href="https://console.groq.com" target="_blank" style="color:#7aaaff;text-decoration:underline;">console.groq.com</a>', d:'Clique sur le lien pour ouvrir le site'},
      {n:'2', t:'Créer un compte', d:'Clique sur "Sign Up" — gratuit, juste un email'},
      {n:'3', t:'Aller dans API Keys', d:'Dans le menu gauche, clique sur "API Keys"'},
      {n:'4', t:'Créer une clé', d:'Clique "Create API Key", donne un nom (ex: gones45)'},
      {n:'5', t:'Copier la clé', d:'Copie la clé qui commence par gsk_... et colle-la ici'},
    ],
    note: 'Gratuit · 6000 requêtes/minute · Aucune carte bancaire requise',
    url: 'https://console.groq.com'
  },
  tavily: {
    title: '🔍 Comment obtenir ta clé Tavily',
    color: '#f0b020',
    steps: [
      {n:'1', t:'<a href="https://app.tavily.com" target="_blank" style="color:#f0b020;text-decoration:underline;">app.tavily.com</a>', d:'Clique sur le lien pour ouvrir le site'},
      {n:'2', t:'Créer un compte', d:'Clique "Sign Up" — gratuit, juste un email'},
      {n:'3', t:'Copier ta clé', d:'Elle est affichée directement sur le tableau de bord — commence par tvly-...'},
    ],
    note: 'Gratuit · 1000 recherches/mois · Pour la recherche web en temps réel',
    url: 'https://app.tavily.com'
  },
  dropbox: {
    title: '☁️ Comment obtenir ton token Dropbox',
    color: '#0061ff',
    steps: [
      {n:'1', t:'<a href="https://www.dropbox.com/developers/apps" target="_blank" style="color:#0061ff;text-decoration:underline;">dropbox.com/developers</a>', d:'Clique sur le lien — connecte-toi avec ton compte Dropbox'},
      {n:'2', t:'Cliquer sur "App Console"', d:'En haut à droite'},
      {n:'3', t:'Sélectionner ton app GONES45', d:'Ou créer une nouvelle app si besoin'},
      {n:'4', t:'Aller dans l\'onglet Settings', d:'En bas de la page de ton app'},
      {n:'5', t:'Cliquer "Generate access token"', d:'Dans la section OAuth 2 — copie le token sl.u.XXXX'},
      {n:'6', t:'Coller le token ici', d:'Il expire après 4h — à renouveler si besoin'},
    ],
    note: '⚠️ Token valable 4h · Gratuit · Sauvegarde automatique de toutes tes données',
    url: 'https://www.dropbox.com/developers/apps'
  },
  fdorg: {
    title: '⚽ Comment obtenir ta clé Football-Data',
    color: '#1ed760',
    steps: [
      {n:'1', t:'<a href="https://www.football-data.org" target="_blank" style="color:#1ed760;text-decoration:underline;">football-data.org</a>', d:'Clique sur le lien pour ouvrir le site'},
      {n:'2', t:'Cliquer sur "Register"', d:'En haut à droite du site'},
      {n:'3', t:'Remplir le formulaire', d:'Prénom, email — pour "arme" choisis "Je veux rester désarmé"'},
      {n:'4', t:'Vérifier ton email', d:'Tu recevras ta clé API par email'},
      {n:'5', t:'Coller la clé ici', d:'Elle ressemble à une suite de lettres et chiffres'},
    ],
    note: '⚠️ Gratuit · 10 requêtes/minute · Bundesliga, Ligue 1, Liga, Serie A, Premier League, Champions League uniquement',
    url: 'https://www.football-data.org'
  }
};

function showKeyHelp(key) {
  var modal = document.getElementById('key-help-modal');
  var title = document.getElementById('key-help-title');
  var body = document.getElementById('key-help-body');
  if(!modal||!title||!body) return;
  var h = KEY_HELP[key];
  if(!h) return;
  title.textContent = h.title;
  var html = '';
  h.steps.forEach(function(s){
    html += '<div style="display:flex;gap:12px;margin-bottom:14px;">';
    html += '<div style="width:26px;height:26px;border-radius:50%;background:'+h.color+';display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#000;flex-shrink:0;">'+s.n+'</div>';
    html += '<div><div style="font-size:13px;font-weight:700;color:var(--t1);">'+s.t+'</div><div style="font-size:11px;color:var(--t3);margin-top:2px;">'+s.d+'</div></div>';
    html += '</div>';
  });
  html += '<div style="background:rgba(255,255,255,.05);border-radius:8px;padding:10px 12px;font-size:11px;color:var(--t3);margin-top:4px;">'+h.note+'</div>';
  html += '<a href="'+h.url+'" target="_blank" style="display:block;text-align:center;margin-top:14px;padding:12px;background:'+h.color+';color:#000;border-radius:var(--r8);font-size:13px;font-weight:800;text-decoration:none;">→ Aller sur le site</a>';
  body.innerHTML = html;
  modal.style.display = 'flex';
  modal.style.alignItems = 'flex-end';
  modal.style.justifyContent = 'center';
}

function closeKeyHelp() {
  var modal = document.getElementById('key-help-modal');
  if(modal) modal.style.display = 'none';
}

// ── RÉSUMÉS VIDÉO PAR SPORT ──
var SPORT_CONFIG = {
  nhl: {
    name: 'NHL', icon: '🏒',
    sources: [
      {label: '🎬 NHL.com — Highlights officiels', url: 'https://www.nhl.com/video', color: '#000'},
      {label: '📺 YouTube NHL', url: 'https://www.youtube.com/@NHL', color: '#ff0000'},
    ],
    searchUrl: function(nom){ return 'https://www.nhl.com/video/search#q='+encodeURIComponent(nom); },
    tavilyQuery: function(nom){ return nom+' NHL highlights recap video today 2026'; }
  },
  mlb: {
    name: 'MLB', icon: '⚾',
    sources: [
      {label: '🎬 MLB.com — Highlights officiels', url: 'https://www.mlb.com/video', color: '#002d72'},
      {label: '📺 YouTube MLB', url: 'https://www.youtube.com/@MLB', color: '#ff0000'},
    ],
    searchUrl: function(nom){ return 'https://www.mlb.com/video/search#q='+encodeURIComponent(nom); },
    tavilyQuery: function(nom){ return nom+' MLB highlights recap video today 2026'; }
  },
  nba: {
    name: 'NBA', icon: '🏀',
    sources: [
      {label: '🎬 NBA.com — Highlights officiels', url: 'https://www.nba.com/watch', color: '#c8102e'},
      {label: '📺 YouTube NBA', url: 'https://www.youtube.com/@NBA', color: '#ff0000'},
      {label: '🎬 @TheGametimeHighlights', url: 'https://twitter.com/TheGametimeHighlights', color: '#1da1f2'},
    ],
    searchUrl: function(nom){ return 'https://www.nba.com/watch?q='+encodeURIComponent(nom); },
    tavilyQuery: function(nom){ return nom+' NBA highlights recap video today 2026'; }
  },
  f1: {
    name: 'F1', icon: '🏎️',
    sources: [
      {label: '🎬 Formula1.com — Highlights', url: 'https://www.formula1.com/en/video.html', color: '#e8002d'},
      {label: '📺 YouTube F1', url: 'https://www.youtube.com/@Formula1', color: '#ff0000'},
    ],
    searchUrl: function(nom){ return 'https://www.formula1.com/en/video.html'; },
    tavilyQuery: function(nom){ return 'Formula 1 GP highlights recap video 2026 '+nom; }
  }
};

async function loadVideoHighlights(el, nom, col, sport) {
  var cfg = SPORT_CONFIG[sport];
  if(!cfg) return;

  var tavilyKey = getTavilyKey();
  var groqKey = getGeminiKey();

  // Affichage initial avec sources directes
  var html = '<div style="text-align:center;padding:20px 16px;">';
  html += '<div style="font-size:36px;margin-bottom:8px;">'+cfg.icon+'</div>';
  html += '<div style="font-size:15px;font-weight:800;color:'+col+';margin-bottom:4px;">'+nom+'</div>';
  html += '<div style="font-size:11px;color:var(--t3);margin-bottom:20px;">Résumés & Highlights '+cfg.name+'</div>';

  // Boutons sources directes
  cfg.sources.forEach(function(s){
    html += '<a href="'+s.url+'" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;padding:12px;border-radius:var(--r8);background:'+s.color+';color:#fff;font-size:12px;font-weight:700;text-decoration:none;">'+s.label+'</a>';
  });

  html += '</div>';

  // Bouton recherche IA
  if(tavilyKey && groqKey) {
    html += '<div class="fc" style="margin-top:4px;text-align:center;">';
    html += '<div style="font-size:11px;color:var(--t3);margin-bottom:10px;">Ou trouve le dernier résumé automatiquement :</div>';
    html += '<button id="btn-find-highlights" style="padding:10px 20px;border-radius:var(--r8);border:1px solid rgba(77,132,255,.4);background:rgba(77,132,255,.1);color:#7aaaff;font-size:12px;font-weight:700;cursor:pointer;">🔍 Trouver le dernier résumé</button>';
    html += '<div id="highlights-result" style="margin-top:12px;"></div>';
    html += '</div>';
  }

  el.innerHTML = html;

  if(tavilyKey && groqKey) {
    document.getElementById('btn-find-highlights').onclick = async function(){
      var btn = this;
      var res = document.getElementById('highlights-result');
      btn.textContent = '⏳ Recherche...';
      btn.disabled = true;

      // Tavily cherche le dernier résumé
      var webData = await searchTavily(cfg.tavilyQuery(nom));
      if(!webData) {
        res.innerHTML = '<div style="color:#ff4545;font-size:11px;">Aucun résultat trouvé.</div>';
        btn.textContent = '🔍 Réessayer'; btn.disabled = false; return;
      }

      // Groq extrait le lien
      var prompt = 'Voici des résultats de recherche sur les highlights de '+nom+' en '+cfg.name+' : '+webData.substring(0,800)+'. Extrais uniquement le lien vidéo le plus pertinent (YouTube, site officiel) et donne une description en 1 phrase. Format: "LIEN: url\nDESC: description". En français.';
      try {
        var r = await fetch('https://api.groq.com/openai/v1/chat/completions',{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+groqKey},
          body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:[{role:'user',content:prompt}],max_tokens:150,temperature:0.2})
        });
        var d = await r.json();
        var reply = d.choices[0].message.content.trim();
        var linkMatch = reply.match(/LIEN:\s*(https?:\/\/[^\s\n]+)/);
        var descMatch = reply.match(/DESC:\s*(.+)/);
        if(linkMatch) {
          var link = linkMatch[1];
          var desc = descMatch ? descMatch[1] : 'Voir le résumé';
          // YouTube → embed direct
          var ytMatch = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          if(ytMatch) {
            var videoId = ytMatch[1];
            res.innerHTML = '<div style="border-radius:10px;overflow:hidden;margin-bottom:8px;">'
              +'<div style="font-size:11px;color:var(--t3);margin-bottom:8px;text-align:center;">'+desc+'</div>'
              +'<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;">'
              +'<iframe src="https://www.youtube.com/embed/'+videoId+'?autoplay=0" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:8px;" allowfullscreen></iframe>'
              +'</div>'
              +'<a href="'+link+'" target="_blank" style="display:block;margin-top:8px;padding:8px;background:rgba(255,0,0,.15);color:#ff4545;border-radius:6px;font-size:11px;font-weight:700;text-decoration:none;text-align:center;">📺 Ouvrir sur YouTube</a>'
              +'</div>';
          } else {
            // Pas d'ID YouTube — bouton direct vers le lien
            var isYT = link.indexOf('youtube.com') >= 0 || link.indexOf('youtu.be') >= 0;
            var btnColor = isYT ? '#ff0000' : 'var(--a)';
            var btnLabel = isYT ? '📺 Voir sur YouTube' : '▶ Voir le résumé';
            res.innerHTML = '<div style="background:rgba(77,132,255,.08);border:1px solid rgba(77,132,255,.2);border-radius:8px;padding:12px;">'
              +'<div style="font-size:11px;color:var(--t3);margin-bottom:8px;">'+desc+'</div>'
              +'<a href="'+link+'" target="_blank" style="display:block;padding:10px;background:'+btnColor+';color:#fff;border-radius:6px;font-size:12px;font-weight:700;text-decoration:none;text-align:center;">'+btnLabel+'</a>'
              +'</div>';
          }
        } else {
          res.innerHTML = '<div style="font-size:11px;color:var(--t3);">'+reply+'</div>';
        }
      } catch(e) {
        res.innerHTML = '<div style="color:#ff4545;font-size:11px;">Erreur IA.</div>';
      }
      btn.textContent = '🔍 Trouver le dernier résumé'; btn.disabled = false;
    };
  }
}


// ── NHL / MLB IDs ──
var TENNIS_PLAYERS = {
  'Novak Djokovic': {id:'n-djokovic', atp:true},
  'Carlos Alcaraz': {id:'c-alcaraz', atp:true},
  'Jannik Sinner': {id:'j-sinner', atp:true},
  'Daniil Medvedev': {id:'d-medvedev', atp:true},
  'Alexander Zverev': {id:'a-zverev', atp:true},
  'Holger Rune': {id:'h-rune', atp:true},
  'Andrey Rublev': {id:'a-rublev', atp:true},
  'Taylor Fritz': {id:'t-fritz', atp:true},
  'Stefanos Tsitsipas': {id:'s-tsitsipas', atp:true},
  'Casper Ruud': {id:'c-ruud', atp:true},
  'Rafael Nadal': {id:'r-nadal', atp:true},
  'Roger Federer': {id:'r-federer', atp:true},
  'Benoit Paire': {id:'b-paire', atp:true},
  'Iga Swiatek': {id:'i-swiatek', atp:false},
  'Aryna Sabalenka': {id:'a-sabalenka', atp:false},
  'Coco Gauff': {id:'c-gauff', atp:false},
};

var NBA_TEAMS = {
  'Atlanta Hawks':         {id:'1610612737', abbr:'ATL', bdlId:1,   espnId:1,  asId:1,  alias:['Hawks','Atlanta']},
  'Boston Celtics':        {id:'1610612738', abbr:'BOS', bdlId:2,   espnId:2,  asId:2,  alias:['Celtics','Boston']},
  'Brooklyn Nets':         {id:'1610612751', abbr:'BKN', bdlId:3,   espnId:17, asId:4,  alias:['Nets','Brooklyn']},
  'Charlotte Hornets':     {id:'1610612766', abbr:'CHA', bdlId:4,   espnId:30, asId:5,  alias:['Hornets','Charlotte']},
  'Chicago Bulls':         {id:'1610612741', abbr:'CHI', bdlId:5,   espnId:4,  asId:6,  alias:['Bulls','Chicago']},
  'Cleveland Cavaliers':   {id:'1610612739', abbr:'CLE', bdlId:6,   espnId:5,  asId:7,  alias:['Cavaliers','Cavs','Cleveland']},
  'Dallas Mavericks':      {id:'1610612742', abbr:'DAL', bdlId:7,   espnId:6,  asId:8,  alias:['Mavericks','Mavs','Dallas']},
  'Denver Nuggets':        {id:'1610612743', abbr:'DEN', bdlId:8,   espnId:7,  asId:9,  alias:['Nuggets','Denver']},
  'Detroit Pistons':       {id:'1610612765', abbr:'DET', bdlId:9,   espnId:8,  asId:10, alias:['Pistons','Detroit']},
  'Golden State Warriors': {id:'1610612744', abbr:'GSW', bdlId:10,  espnId:9,  asId:11, alias:['Warriors','Golden State','GSW']},
  'Houston Rockets':       {id:'1610612745', abbr:'HOU', bdlId:11,  espnId:10, asId:14, alias:['Rockets','Houston']},
  'Indiana Pacers':        {id:'1610612754', abbr:'IND', bdlId:12,  espnId:11, asId:15, alias:['Pacers','Indiana']},
  'Los Angeles Clippers':  {id:'1610612746', abbr:'LAC', bdlId:13,  espnId:12, asId:16, alias:['Clippers','LA Clippers']},
  'Los Angeles Lakers':    {id:'1610612747', abbr:'LAL', bdlId:14,  espnId:13, asId:17, alias:['Lakers','LA Lakers']},
  'Memphis Grizzlies':     {id:'1610612763', abbr:'MEM', bdlId:15,  espnId:29, asId:19, alias:['Grizzlies','Memphis']},
  'Miami Heat':            {id:'1610612748', abbr:'MIA', bdlId:16,  espnId:14, asId:20, alias:['Heat','Miami']},
  'Milwaukee Bucks':       {id:'1610612749', abbr:'MIL', bdlId:17,  espnId:15, asId:21, alias:['Bucks','Milwaukee']},
  'Minnesota Timberwolves':{id:'1610612750', abbr:'MIN', bdlId:18,  espnId:16, asId:22, alias:['Timberwolves','Wolves','Minnesota']},
  'New Orleans Pelicans':  {id:'1610612740', abbr:'NOP', bdlId:19,  espnId:3,  asId:23, alias:['Pelicans','New Orleans']},
  'New York Knicks':       {id:'1610612752', abbr:'NYK', bdlId:20,  espnId:18, asId:24, alias:['Knicks','New York']},
  'Oklahoma City Thunder': {id:'1610612760', abbr:'OKC', bdlId:21,  espnId:25, asId:25, alias:['Thunder','Oklahoma City','OKC']},
  'Orlando Magic':         {id:'1610612753', abbr:'ORL', bdlId:22,  espnId:22, asId:26, alias:['Magic','Orlando']},
  'Philadelphia 76ers':    {id:'1610612755', abbr:'PHI', bdlId:23,  espnId:20, asId:27, alias:['76ers','Sixers','Philadelphia']},
  'Phoenix Suns':          {id:'1610612756', abbr:'PHX', bdlId:24,  espnId:24, asId:28, alias:['Suns','Phoenix']},
  'Portland Trail Blazers':{id:'1610612757', abbr:'POR', bdlId:25,  espnId:21, asId:29, alias:['Trail Blazers','Blazers','Portland']},
  'Sacramento Kings':      {id:'1610612758', abbr:'SAC', bdlId:26,  espnId:23, asId:30, alias:['Kings','Sacramento']},
  'San Antonio Spurs':     {id:'1610612759', abbr:'SAS', bdlId:27,  espnId:24, asId:31, alias:['Spurs','San Antonio']},
  'Toronto Raptors':       {id:'1610612761', abbr:'TOR', bdlId:28,  espnId:28, asId:38, alias:['Raptors','Toronto']},
  'Utah Jazz':             {id:'1610612762', abbr:'UTA', bdlId:29,  espnId:26, asId:40, alias:['Jazz','Utah']},
  'Washington Wizards':    {id:'1610612764', abbr:'WAS', bdlId:30,  espnId:27, asId:41, alias:['Wizards','Washington']},
};

// Résoudre un nom court/alias vers la clé complète NBA_TEAMS
function resolveNbaTeam(nom) {
  if(NBA_TEAMS[nom]) return nom;
  var lower = (nom||'').toLowerCase().trim();
  for(var key in NBA_TEAMS) {
    if(key.toLowerCase() === lower) return key;
    var al = NBA_TEAMS[key].alias || [];
    for(var i=0;i<al.length;i++){ if(al[i].toLowerCase() === lower) return key; }
  }
  return null;
}

var NFL_TEAMS = {
  'Kansas City Chiefs': {id:'KC'},
  'San Francisco 49ers': {id:'SF'},
  'Philadelphia Eagles': {id:'PHI'},
  'Dallas Cowboys': {id:'DAL'},
  'Buffalo Bills': {id:'BUF'},
  'Baltimore Ravens': {id:'BAL'},
  'Cincinnati Bengals': {id:'CIN'},
  'Miami Dolphins': {id:'MIA'},
  'Green Bay Packers': {id:'GB'},
  'New England Patriots': {id:'NE'},
};

var NHL_TEAMS = {
  'Colorado Avalanche': {abbr:'COL', id:21, mlb:false},
  'Carolina Hurricanes': {abbr:'CAR', id:12, mlb:false},
  'Vegas Golden Knights': {abbr:'VGK', id:54, mlb:false},
  'Tampa Bay Lightning': {abbr:'TBL', id:14, mlb:false},
  'Boston Bruins': {abbr:'BOS', id:6, mlb:false},
  'Toronto Maple Leafs': {abbr:'TOR', id:10, mlb:false},
  'New York Rangers': {abbr:'NYR', id:3, mlb:false},
  'Edmonton Oilers': {abbr:'EDM', id:22, mlb:false},
};

var MLB_TEAMS = {
  'LA Dodgers': {id:119},
  'Los Angeles Dodgers': {id:119},
  'New York Yankees': {id:147},
  'Atlanta Braves': {id:144},
  'Houston Astros': {id:117},
  'Boston Red Sox': {id:111},
  'Chicago Cubs': {id:112},
  'San Francisco Giants': {id:137},
  'New York Mets': {id:121},
  'Philadelphia Phillies': {id:143},
};


/* ══ FORME US HELPER ══ */
function renderFormeUS(games, teamAbbr, sport, isNHL, isMLB) {
  if(!games||!games.length) return '';
  var html = '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;">';
  games.slice(0,10).forEach(function(g){
    var isDom, ts, os, won;
    if(isNHL) {
      isDom = g.homeTeam&&g.homeTeam.abbrev===teamAbbr;
      ts = isDom?(g.homeTeam.score||0):(g.awayTeam.score||0);
      os = isDom?(g.awayTeam.score||0):(g.homeTeam.score||0);
    } else if(isMLB) {
      isDom = g.teams&&g.teams.home&&g.teams.home.team&&g.teams.home.team.name===teamAbbr;
      ts = isDom?(g.teams.home.score||0):(g.teams.away.score||0);
      os = isDom?(g.teams.away.score||0):(g.teams.home.score||0);
    } else {
      // NBA bdl
      isDom = g.home_team&&g.home_team.abbreviation===teamAbbr;
      ts = isDom?(g.home_team_score||0):(g.visitor_team_score||0);
      os = isDom?(g.visitor_team_score||0):(g.home_team_score||0);
    }
    won = ts>os;
    var col = won?'#1ed760':'#ff4545';
    html += '<div style="width:20px;height:20px;border-radius:4px;background:'+col+';display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;color:#fff;">'+(won?'V':'D')+'</div>';
  });
  html += '</div>';
  return html;
}


function compareUSTeams(myGames, oppGames, myAbbr, oppAbbr, myNom, oppNom, myCol, sport) {
  if(!myGames.length || !oppGames.length) return '';

  function calcUSStats(games, abbr, isNHL, isMLB) {
    var n=games.length, wins=0, over=0, bts2=0, goals=0, conceded=0;
    var domW=0, domN=0, extW=0, extN=0, streak=0, streakType='';
    games.forEach(function(g,i){
      var isDom, ts, os;
      if(isNHL){
        isDom=g.homeTeam&&g.homeTeam.abbrev===abbr;
        ts=isDom?(g.homeTeam.score||0):(g.awayTeam.score||0);
        os=isDom?(g.awayTeam.score||0):(g.homeTeam.score||0);
      } else if(isMLB){
        isDom=g.teams&&g.teams.home&&g.teams.home.team&&g.teams.home.team.name===abbr;
        ts=isDom?(g.teams.home.score||0):(g.teams.away.score||0);
        os=isDom?(g.teams.away.score||0):(g.teams.home.score||0);
      } else {
        isDom=g.home_team&&g.home_team.id===abbr;
        ts=isDom?g.home_team_score:g.visitor_team_score;
        os=isDom?g.visitor_team_score:g.home_team_score;
      }
      var tot=ts+os, won=ts>os;
      if(won)wins++;
      goals+=ts; conceded+=os;
      var overLine = isMLB?8:(isNHL?5.5:220);
      if(tot>overLine)over++;
      if(ts>0&&os>0)bts2++;
      if(isDom){domN++;if(won)domW++;}else{extN++;if(won)extW++;}
      // Série
      var res=won?'V':'D';
      if(i===0){streakType=res;streak=1;}
      else if(res===streakType)streak++;
    });
    return {n:n, pct:n?Math.round(wins/n*100):0,
      gpg:n?(goals/n).toFixed(1):0, cpg:n?(conceded/n).toFixed(1):0,
      over:n?Math.round(over/n*100):0, bts:n?Math.round(bts2/n*100):0,
      domPct:domN?Math.round(domW/domN*100):0, domN:domN,
      extPct:extN?Math.round(extW/extN*100):0, extN:extN,
      streak:streak, streakType:streakType};
  }

  var isNHL = sport==='🏒', isMLB = sport==='⚾';
  var myS = calcUSStats(myGames, myAbbr, isNHL, isMLB);
  var oppS = calcUSStats(oppGames, oppAbbr, isNHL, isMLB);
  var overLabel = isMLB?'Over 8':isNHL?'Over 5.5':'Over 220';
  var unit = isMLB?' runs':isNHL?' buts':' pts';

  var html = '<div style="margin-top:10px;">';

  // Forme adversaire
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:6px;">📊 Forme '+oppNom+' ('+oppS.n+' matchs)</div>';
  html += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;">';
  oppGames.slice(0,8).forEach(function(g){
    var isDom, ts, os;
    if(isNHL){isDom=g.homeTeam&&g.homeTeam.abbrev===oppAbbr;ts=isDom?(g.homeTeam.score||0):(g.awayTeam.score||0);os=isDom?(g.awayTeam.score||0):(g.homeTeam.score||0);}
    else if(isMLB){isDom=g.teams&&g.teams.home&&g.teams.home.team&&g.teams.home.team.name===oppAbbr;ts=isDom?(g.teams.home.score||0):(g.teams.away.score||0);os=isDom?(g.teams.away.score||0):(g.teams.home.score||0);}
    else{isDom=g.home_team&&g.home_team.id===oppAbbr;ts=isDom?g.home_team_score:g.visitor_team_score;os=isDom?g.visitor_team_score:g.home_team_score;}
    var rc=ts>os?'#1ed760':'#ff4545';
    html += '<div style="width:22px;height:22px;border-radius:5px;background:'+rc+';display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#fff;">'+(ts>os?'V':'D')+'</div>';
  });
  html += '</div>';

  // Comparaison
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:6px;">⚡ Comparaison ('+myS.n+' matchs)</div>';
  html += '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:4px;margin-bottom:8px;">';
  html += '<div style="font-size:10px;font-weight:700;color:'+myCol+';text-align:center;padding:4px;">'+myNom+'</div>';
  html += '<div></div>';
  html += '<div style="font-size:10px;font-weight:700;color:#a78bfa;text-align:center;padding:4px;">'+oppNom+'</div>';

  var ROWS = [
    {l:'Victoires %', a:myS.pct+'%', b:oppS.pct+'%', av:myS.pct, bv:oppS.pct},
    {l:'Dom %', a:myS.domPct+'% ('+myS.domN+')', b:oppS.domPct+'% ('+oppS.domN+')', av:myS.domPct, bv:oppS.domPct},
    {l:'Ext %', a:myS.extPct+'% ('+myS.extN+')', b:oppS.extPct+'% ('+oppS.extN+')', av:myS.extPct, bv:oppS.extPct},
    {l:'Pts marqués', a:myS.gpg+unit, b:oppS.gpg+unit, av:parseFloat(myS.gpg), bv:parseFloat(oppS.gpg)},
    {l:'Pts encaissés', a:myS.cpg+unit, b:oppS.cpg+unit, av:parseFloat(oppS.cpg), bv:parseFloat(myS.cpg)},
    {l:overLabel, a:myS.over+'%', b:oppS.over+'%', av:myS.over, bv:oppS.over},
    {l:'BTS', a:myS.bts+'%', b:oppS.bts+'%', av:myS.bts, bv:oppS.bts},
  ];
  ROWS.forEach(function(r){
    var aBetter=r.av>r.bv, bBetter=r.bv>r.av;
    html += '<div style="font-size:11px;font-weight:800;color:'+(aBetter?myCol:'var(--t2)')+';text-align:center;padding:5px 4px;background:rgba(255,255,255,.03);border-radius:5px;">'+r.a+'</div>';
    html += '<div style="font-size:9px;color:var(--t3);text-align:center;padding:5px 2px;">'+r.l+'</div>';
    html += '<div style="font-size:11px;font-weight:800;color:'+(bBetter?'#a78bfa':'var(--t2)')+';text-align:center;padding:5px 4px;background:rgba(255,255,255,.03);border-radius:5px;">'+r.b+'</div>';
  });
  html += '</div>';

  // Analyse
  var butsM = (parseFloat(myS.gpg)*parseFloat(oppS.cpg)).toFixed(2);
  var butsOpp = (parseFloat(oppS.gpg)*parseFloat(myS.cpg)).toFixed(2);
  var total = (parseFloat(butsM)+parseFloat(butsOpp)).toFixed(2);
  var mySerieCol=myS.streakType==='V'?'#1ed760':'#ff4545';
  var oppSerieCol=oppS.streakType==='V'?'#1ed760':'#ff4545';

  html += '<div style="background:rgba(77,132,255,.08);border:1px solid rgba(77,132,255,.2);border-radius:8px;padding:10px;">';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4d84ff;margin-bottom:8px;">🎯 Analyse</div>';
  html += '<div style="display:flex;gap:8px;margin-bottom:8px;">';
  html += '<div style="flex:1;text-align:center;background:rgba(255,255,255,.04);border-radius:6px;padding:6px;"><div style="font-size:9px;color:var(--t3);">'+myNom+'</div><div style="font-size:12px;font-weight:800;color:'+mySerieCol+';">'+myS.streak+myS.streakType+' d\'affilée</div></div>';
  html += '<div style="flex:1;text-align:center;background:rgba(255,255,255,.04);border-radius:6px;padding:6px;"><div style="font-size:9px;color:var(--t3);">'+oppNom+'</div><div style="font-size:12px;font-weight:800;color:'+oppSerieCol+';">'+oppS.streak+oppS.streakType+' d\'affilée</div></div>';
  html += '</div>';
  html += '<div style="font-size:11px;color:var(--t1);">'+sport+' attendus : <strong style="color:'+myCol+';">'+butsM+'</strong> vs <strong style="color:#a78bfa;">'+butsOpp+'</strong> = <strong>'+total+'</strong></div>';
  html += '<div style="font-size:11px;color:var(--t1);">'+overLabel+' probable : <strong style="color:'+(Math.round((myS.over+oppS.over)/2)>55?'#1ed760':'#f0b020')+'">'+Math.round((myS.over+oppS.over)/2)+'%</strong></div>';
  html += '</div>';

  html += '</div>';
  return html;
}


/* ══ FPL API ══ */
var _fplCache = null;
var _fplCacheTime = 0;

async function fplFetch(path) {
  var r = await fetch('https://fd-proxy.touraine-antoine.workers.dev/?key=fpl&path='+encodeURIComponent(path)+'&host=fpl');
  if(!r.ok) throw new Error('FPL HTTP '+r.status);
  return await r.json();
}

async function getFplData() {
  var now = Date.now();
  var cacheDuration = 6*60*60*1000; // 6h localStorage
  // Cache mémoire 5min
  if(_fplCache && now-_fplCacheTime < 300000) return _fplCache;
  // Cache localStorage 6h
  try {
    var cached = localStorage.getItem('fpl_bootstrap_cache');
    if(cached) {
      var c = JSON.parse(cached);
      if(now - c.ts < cacheDuration) {
        _fplCache = c.data; _fplCacheTime = now;
        return _fplCache;
      }
    }
  } catch(e) {}
  _fplCache = await fplFetch('/api/bootstrap-static/');
  _fplCacheTime = now;
  try { localStorage.setItem('fpl_bootstrap_cache', JSON.stringify({data:_fplCache, ts:now})); } catch(e) {}
  return _fplCache;
}

// Mapping noms football-data → noms FPL
var FPL_TEAM_MAP = {
  'Arsenal':'Arsenal','Chelsea':'Chelsea','Liverpool':'Liverpool',
  'Manchester City':'Man City','Manchester United':'Man Utd',
  'Tottenham Hotspur':'Spurs','Tottenham':'Spurs',
  'Newcastle United':'Newcastle','Newcastle':'Newcastle',
  'Aston Villa':'Aston Villa','Brighton':'Brighton',
  'West Ham United':'West Ham','West Ham':'West Ham',
  'Fulham':'Fulham','Crystal Palace':'Crystal Palace',
  'Brentford':'Brentford','Wolves':'Wolves',
  'Wolverhampton Wanderers':'Wolves',
  'Everton':'Everton','Leicester City':'Leicester',
  'Southampton':'Southampton','Ipswich Town':'Ipswich',
  'Nottingham Forest':'Nott\'m Forest',
  'Bournemouth':'Bournemouth','AFC Bournemouth':'Bournemouth',
};

async function loadFplSquad(el, nom) {
  el.innerHTML = '<div style="text-align:center;padding:16px;color:var(--t3);font-size:11px;">⏳ Chargement squad FPL...</div>';
  try {
    var data = await getFplData();
    var teams = data.teams||[];
    var elements = data.elements||[];

    var fplName = FPL_TEAM_MAP[nom]||nom;
    var team = teams.find(function(t){
      return t.name===fplName||t.short_name===fplName||
             t.name.toLowerCase()===nom.toLowerCase()||
             nom.toLowerCase().indexOf(t.name.toLowerCase())>=0;
    });
    if(!team){
      el.innerHTML='<div style="color:var(--t3);font-size:10px;text-align:center;padding:8px;">Équipe non trouvée dans FPL (PL uniquement)</div>';
      return;
    }

    var players = elements.filter(function(p){ return p.team===team.id; });
    players.sort(function(a,b){ return a.element_type-b.element_type||b.total_points-a.total_points; });

    var posNames = {1:'GK',2:'DEF',3:'MID',4:'ATT'};
    var posColors = {1:'#f5a623',2:'#4fc3f7',3:'#81c784',4:'#ef9a9a'};
    var statusEmoji = {'a':'','d':'⚠️','i':'🩹','s':'🚫','u':'❓','n':'❌'};
    var statusBorder = {'d':'#ffc107','i':'#ff6432','s':'#9c27b0','u':'#607d8b','n':'#dc3545'};

    // ── Calcul du 11 type (top minutes par poste) ──
    var xi = [];
    var xiCounts = {1:1, 2:4, 3:3, 4:3}; // formation de base 4-3-3
    [1,2,3,4].forEach(function(pos){
      // Exclure prêtés/indisponibles sans minutes
      var pp = players.filter(function(p){
        return p.element_type===pos && p.status==='a' && p.minutes>90;
      });
      // Fallback : disponibles avec n'importe quel temps de jeu
      if(pp.length < xiCounts[pos]) {
        var pp2 = players.filter(function(p){
          return p.element_type===pos && p.status==='a';
        });
        pp2.sort(function(a,b){ return b.minutes-a.minutes; });
        pp = pp2;
      } else {
        pp.sort(function(a,b){ return b.minutes-a.minutes; });
      }
      xi = xi.concat(pp.slice(0, xiCounts[pos]));
    });

    var unavail = players.filter(function(p){ return p.status!=='a'; });

    // ── ID unique pour ce rendu ──
    var uid = 'fpl_'+Date.now();

    var html = '<div style="padding:2px 0;">';

    // ── Header ──
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--t3);">👤 Squad FPL · '+team.name+' <span style="color:var(--t2);font-weight:500;">('+players.length+')</span></div>';
    html += '<div style="font-size:9px;color:var(--t3);">Saison en cours</div>';
    html += '</div>';

    // ── TERRAIN ──
    html += '<div style="position:relative;border-radius:12px;overflow:hidden;margin-bottom:14px;background:#1a3a1a;border:1px solid rgba(255,255,255,.08);">';
    // Lignes terrain SVG
    html += '<svg style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:.18;" viewBox="0 0 300 420" preserveAspectRatio="none">';
    html += '<rect x="1" y="1" width="298" height="418" fill="none" stroke="#fff" stroke-width="1.5"/>';
    html += '<line x1="0" y1="210" x2="300" y2="210" stroke="#fff" stroke-width="1"/>';
    html += '<circle cx="150" cy="210" r="40" fill="none" stroke="#fff" stroke-width="1"/>';
    html += '<circle cx="150" cy="210" r="2" fill="#fff"/>';
    html += '<rect x="75" y="1" width="150" height="55" fill="none" stroke="#fff" stroke-width="1"/>';
    html += '<rect x="75" y="364" width="150" height="55" fill="none" stroke="#fff" stroke-width="1"/>';
    html += '<rect x="105" y="1" width="90" height="25" fill="none" stroke="#fff" stroke-width="1"/>';
    html += '<rect x="105" y="394" width="90" height="25" fill="none" stroke="#fff" stroke-width="1"/>';
    html += '</svg>';

    // Lignes de joueurs par poste
    var rows = [
      { pos: 4, players: xi.filter(function(p){return p.element_type===4;}), y: '13%' },
      { pos: 3, players: xi.filter(function(p){return p.element_type===3;}), y: '36%' },
      { pos: 2, players: xi.filter(function(p){return p.element_type===2;}), y: '60%' },
      { pos: 1, players: xi.filter(function(p){return p.element_type===1;}), y: '84%' },
    ];

    rows.forEach(function(row){
      var rp = row.players;
      if(!rp.length) return;
      var pct = 100/rp.length;
      html += '<div data-terrain-row="'+row.pos+'" style="position:absolute;top:'+row.y+';left:0;right:0;display:flex;justify-content:space-around;align-items:center;transform:translateY(-50%);">';
      rp.forEach(function(p){
        var isUnavail = p.status!=='a';
        var pc = posColors[p.element_type];
        var form = parseFloat(p.form)||0;
        var formCol = form>=6?'#1ed760':form>=4?'#f0b020':'#ff7b54';
        // carte joueur cliquable
        html += '<div class="fpl-player-card" data-uid="'+uid+'" data-pid="'+p.id+'" style="display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;position:relative;max-width:'+Math.floor(pct-2)+'%;">';
        // Avatar cercle
        html += '<div style="width:38px;height:38px;border-radius:50%;background:'+pc+'33;border:2px solid '+(isUnavail?'#ff4545':pc)+';display:flex;align-items:center;justify-content:center;font-size:14px;position:relative;box-shadow:0 2px 8px rgba(0,0,0,.4);">';
        html += '<span>'+posNames[p.element_type].charAt(0)+'</span>';
        if(isUnavail) html += '<span style="position:absolute;top:-4px;right:-4px;font-size:9px;">'+statusEmoji[p.status]+'</span>';
        html += '</div>';
        // Nom
        html += '<div style="background:rgba(0,0,0,.7);backdrop-filter:blur(4px);border-radius:4px;padding:2px 5px;font-size:10px;font-weight:700;color:#fff;white-space:nowrap;max-width:70px;overflow:hidden;text-overflow:ellipsis;text-align:center;">'+p.web_name+'</div>';
        // Forme badge
        html += '<div style="font-size:9px;font-weight:900;color:'+formCol+';">'+p.form+'</div>';
        html += '</div>';
      });
      html += '</div>';
    });

    // Hauteur terrain
    html += '<div style="height:360px;"></div>';
    html += '</div>'; // fin terrain

    // Panneau latéral fiche joueur
    html += '<div id="fpl-tip-'+uid+'" style="width:140px;flex-shrink:0;border-radius:12px;background:rgba(14,18,32,.95);border:1px solid rgba(77,132,255,.25);padding:12px;display:none;flex-direction:column;gap:8px;">';
    html += '<div style="font-size:9px;color:var(--t3);text-align:center;letter-spacing:1px;text-transform:uppercase;">← Sélectionne</div>';
    html += '</div>';
    html += '</div>'; // fin flex wrapper

    // ── Absences ──
    if(unavail.length) {
      html += '<div style="background:rgba(220,53,69,.07);border:1px solid rgba(220,53,69,.2);border-radius:10px;margin-bottom:12px;overflow:hidden;">';
      html += '<div style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-bottom:1px solid rgba(220,53,69,.12);">';
      html += '<span style="font-size:10px;">⚠️</span>';
      html += '<span style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#ff6b6b;">Absences & Incertains</span>';
      html += '<span style="margin-left:auto;background:rgba(220,53,69,.2);color:#ff6b6b;border-radius:10px;padding:1px 8px;font-size:9px;font-weight:800;">'+unavail.length+'</span>';
      html += '</div>';
      unavail.forEach(function(p){
        var pct = p.chance_of_playing_next_round;
        var pctCol = (pct===null||pct===undefined||pct===0)?'#ff4545':pct>=75?'#1ed760':pct>=50?'#f0b020':'#ff9800';
        var border = statusBorder[p.status]||'#607d8b';
        html += '<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid rgba(255,255,255,.03);border-left:3px solid '+border+';">';
        html += '<div style="font-size:11px;width:16px;text-align:center;flex-shrink:0;">'+statusEmoji[p.status]+'</div>';
        html += '<div style="flex:1;min-width:0;">';
        html += '<div style="display:flex;align-items:center;gap:6px;">';
        html += '<span style="font-size:13px;font-weight:700;color:var(--t1);">'+p.web_name+'</span>';
        html += '<span style="background:'+posColors[p.element_type]+'22;color:'+posColors[p.element_type]+';border:1px solid '+posColors[p.element_type]+'44;border-radius:3px;padding:0 5px;font-size:9px;font-weight:700;">'+posNames[p.element_type]+'</span>';
        html += '</div>';
        if(p.news) html += '<div style="font-size:10px;color:var(--t3);margin-top:1px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.news+'</div>';
        html += '</div>';
        html += '<div style="text-align:center;flex-shrink:0;">';
        if(pct!==null&&pct!==undefined){
          html += '<div style="font-size:15px;font-weight:900;color:'+pctCol+';line-height:1;">'+pct+'%</div>';
          html += '<div style="font-size:8px;color:var(--t3);margin-top:1px;">chance</div>';
        } else {
          html += '<div style="font-size:13px;font-weight:900;color:#ff4545;">0%</div>';
          html += '<div style="font-size:8px;color:var(--t3);margin-top:1px;">chance</div>';
        }
        html += '</div></div>';
      });
      html += '</div>';
    }

    // ── Squad par poste ──
    [1,2,3,4].forEach(function(pos){
      var pp = players.filter(function(p){ return p.element_type===pos; });
      if(!pp.length) return;
      var posLabel = {1:'🧤 Gardiens',2:'🛡️ Défenseurs',3:'🎯 Milieux',4:'⚽ Attaquants'}[pos];
      var pc = posColors[pos];
      html += '<div style="margin-bottom:12px;">';
      html += '<div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;">';
      html += '<div style="width:3px;height:14px;border-radius:2px;background:'+pc+';flex-shrink:0;"></div>';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:'+pc+';">'+posLabel+'</div>';
      html += '<div style="flex:1;height:1px;background:rgba(255,255,255,.05);"></div>';
      html += '<div style="font-size:9px;color:var(--t3);">'+pp.length+'</div>';
      html += '</div>';
      // En-tête colonnes : XI | Nom+Forme | B | A | CS | Min | Prix
      html += '<div style="display:grid;grid-template-columns:16px minmax(0,200px) 36px 36px 36px 44px;gap:0 6px;padding:3px 10px;margin-bottom:2px;">';
      html += '<div></div>';
      html += '<div style="font-size:9px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Joueur</div>';
      html += '<div style="font-size:9px;color:var(--t3);font-weight:700;text-align:center;" title="Buts marqu\u00e9s">B</div>';
      html += '<div style="font-size:9px;color:var(--t3);font-weight:700;text-align:center;" title="Passes d\u00e9cisives">A</div>';
      html += '<div style="font-size:9px;color:var(--t3);font-weight:700;text-align:center;" title="Clean sheets - matchs sans encaisser">CS</div>';
      html += '<div style="font-size:9px;color:var(--t3);font-weight:700;text-align:center;" title="Minutes jou\u00e9es">Min</div>';
      html += '</div>';

      pp.forEach(function(p, i){
        var form = parseFloat(p.form)||0;
        var formCol = form>=6?'#1ed760':form>=4?'#f0b020':'#8b97c4';
        var isUnavail = p.status!=='a';
        var mins = p.minutes||0;
        var minsK = mins>=1000?(mins/1000).toFixed(1)+'k':mins;
        var inXi = xi.some(function(x){return x.id===p.id;});
        var rowBg = i%2===0?'rgba(255,255,255,.025)':'rgba(255,255,255,.015)';
        html += '<div style="display:grid;grid-template-columns:16px minmax(0,200px) 36px 36px 36px 44px;gap:0 6px;align-items:center;padding:6px 10px;background:'+rowBg+';border-radius:6px;margin-bottom:2px;border-left:2px solid '+(isUnavail?'rgba(255,69,69,.5)':pc+'55')+';opacity:'+(isUnavail?.6:1)+';">';
        // Badge XI
        html += '<div>'+(inXi?'<span style="font-size:7px;background:'+pc+'33;color:'+pc+';border-radius:3px;padding:1px 3px;font-weight:800;">XI</span>':'')+'</div>';
        // Nom + Forme collés ensemble
        html += '<div style="display:flex;align-items:center;gap:6px;min-width:0;">';
        html += '<span style="font-size:12px;font-weight:700;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.web_name+'</span>';
        if(isUnavail) html += '<span style="font-size:9px;flex-shrink:0;">'+statusEmoji[p.status]+'</span>';
        html += '<span style="font-size:12px;font-weight:900;color:'+formCol+';flex-shrink:0;">'+p.form+'</span>';
        html += '</div>';
        // Buts
        html += '<div style="text-align:center;"><span style="font-size:11px;font-weight:700;color:'+(p.goals_scored>0?'#1ed760':'var(--t3)')+';">'+p.goals_scored+'</span></div>';
        // Passes
        html += '<div style="text-align:center;"><span style="font-size:11px;font-weight:700;color:'+(p.assists>0?'#4d84ff':'var(--t3)')+';">'+p.assists+'</span></div>';
        // CS
        html += '<div style="text-align:center;"><span style="font-size:11px;font-weight:700;color:'+(p.clean_sheets>0?'#f0b020':'var(--t3)')+';">'+p.clean_sheets+'</span></div>';
        // Minutes
        html += '<div style="text-align:center;"><span style="font-size:11px;font-weight:600;color:var(--t2);">'+minsK+'</span></div>';

        html += '</div>';
      });
      html += '</div>';
    });

    html += '</div>';
    el.innerHTML = html;

    // ── Tooltip interactif ──
    var tip = document.getElementById('fpl-tip-'+uid);
    var cards = el.querySelectorAll('.fpl-player-card[data-uid="'+uid+'"]');
    var playerMap = {};
    players.forEach(function(p){ playerMap[p.id] = p; });

    function showTip(card, p) {
      var form = parseFloat(p.form)||0;
      var formCol = form>=6?'#1ed760':form>=4?'#f0b020':'#ff7b54';
      var pct = p.chance_of_playing_next_round;
      var mins = p.minutes||0;
      var minsK = mins>=1000?(mins/1000).toFixed(1)+'k':mins;
      var posColors2 = {1:'#f5a623',2:'#4fc3f7',3:'#81c784',4:'#ef9a9a'};
      var posNms = {1:'GK',2:'DEF',3:'MID',4:'ATT'};
      var pc = posColors2[p.element_type]||'#8b97c4';
      var t = '';
      // Avatar + nom
      t += '<div style="text-align:center;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.07);">';
      t += '<div style="width:40px;height:40px;border-radius:50%;background:'+pc+'33;border:2px solid '+pc+';display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:'+pc+';margin:0 auto 6px;">'+posNms[p.element_type]+'</div>';
      var sofaQ = 'https://www.google.com/search?q='+encodeURIComponent(p.web_name+' '+nom+' Sofascore');
      t += '<a href="'+sofaQ+'" target="_blank" style="font-size:12px;font-weight:800;color:#fff;line-height:1.2;text-decoration:none;display:block;">'+p.web_name+' <span style="font-size:10px;color:#4d84ff;">↗ Sofascore</span></a>';
      t += '</div>';
      // Stats verticales
      t += statV('Forme', '<span style="color:'+formCol+';font-weight:900;font-size:15px;">'+p.form+'</span>');
      t += statV('Minutes', '<span style="color:var(--t2);">'+minsK+"'</span>");
      t += statV('Points', p.total_points);
      t += statV('Buts', '<span style="color:#1ed760;">'+p.goals_scored+'</span>');
      t += statV('Passes', '<span style="color:#4d84ff;">'+p.assists+'</span>');
      t += statV('CS', '<span style="color:#f0b020;">'+p.clean_sheets+'</span>');
      t += statV('Prix', '<span style="color:#a78bfa;">£'+(p.now_cost/10).toFixed(1)+'m</span>');
      if(pct!==null&&pct!==undefined) t += statV('Dispo', '<span style="color:'+(pct>=75?'#1ed760':pct>=50?'#f0b020':'#ff4545')+';">'+pct+'%</span>');
      if(p.news) t += '<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.07);font-size:9px;color:#ff7b54;line-height:1.4;">'+p.news+'</div>';
      tip.innerHTML = t;
      tip.style.display = 'flex';
      tip.style.flexDirection = 'column';
    }
    function statV(l,v){ return '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);"><span style="font-size:10px;color:var(--t3);">'+l+'</span><span style="font-size:11px;font-weight:700;">'+v+'</span></div>'; }

    cards.forEach(function(card){
      var pid = parseInt(card.dataset.pid);
      var p = playerMap[pid];
      if(!p) return;
      // Mobile: clic
      card.addEventListener('click', function(e){
        e.stopPropagation();
        if(tip.style.display==='block' && tip._pid===pid){
          tip.style.display='none'; tip._pid=null;
        } else {
          showTip(card, p); tip._pid=pid;
        }
      });
      // Desktop: hover
      card.addEventListener('mouseenter', function(){ showTip(card, p); tip._pid=pid; });
      card.addEventListener('mouseleave', function(){ tip.style.display='none'; tip._pid=null; });
    });
    document.addEventListener('click', function(){ if(tip) tip.style.display='none'; });

  } catch(e) {
    el.innerHTML='<div style="color:#ff4545;font-size:10px;text-align:center;padding:8px;">Erreur : '+e.message+'</div>';
  }
}

// ── Édition manuelle des stats joueurs ──
function fdEditStats(btn) {
  var pid = parseInt(btn.dataset.pid);
  var afId = btn.dataset.afid;
  var key = 'manual_stats_'+saisonKey(afId+'_'+pid);
  var current = {};
  try { current = JSON.parse(localStorage.getItem(key)||'{}'); } catch(e){}

  // Mini popup
  var existing = document.getElementById('fd-edit-overlay');
  if(existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'fd-edit-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.6);z-index:9998;';
  // overlay.onclick désactivé - fermer uniquement via bouton
  document.body.appendChild(overlay);

  var popup = document.createElement('div');
  popup.id = 'fd-edit-popup';
  popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--bg2);border:1px solid rgba(77,132,255,.4);border-radius:12px;padding:16px;z-index:9999;min-width:240px;box-shadow:0 8px 32px rgba(0,0,0,.8);';
  var inpStyle = 'width:100%;padding:5px;background:var(--bg3);border:1px solid var(--b2);border-radius:6px;color:var(--t1);font-size:13px;font-weight:700;text-align:center;';
  popup.innerHTML = '<div style="font-size:13px;font-weight:800;color:var(--t1);margin-bottom:10px;">✏️ Stats manuelles</div>'
    +'<div style="display:grid;grid-template-columns:auto 1fr 1fr 1fr;gap:6px;align-items:center;margin-bottom:12px;">'
    +'<div style="font-size:10px;color:var(--t3);font-weight:700;"></div>'
    +'<div style="font-size:10px;color:var(--t2);font-weight:700;text-align:center;">MJ</div>'
    +'<div style="font-size:10px;color:#1ed760;font-weight:700;text-align:center;">Buts ⚽</div>'
    +'<div style="font-size:10px;color:#4d84ff;font-weight:700;text-align:center;">Passes 🅰</div>'
    +'<div style="font-size:10px;color:var(--t3);">🏆 Champ.</div>'
    +'<input id="fe-lmj" type="number" min="0" value="'+(current.league_apps||0)+'" style="'+inpStyle+'">'
    +'<input id="fe-lg" type="number" min="0" value="'+(current.league_goals||0)+'" style="'+inpStyle+'">'
    +'<input id="fe-la" type="number" min="0" value="'+(current.league_assists||0)+'" style="'+inpStyle+'">'
    +'<div style="font-size:10px;color:var(--t3);">⭐ Europe</div>'
    +'<input id="fe-emj" type="number" min="0" value="'+(current.euro_apps||0)+'" style="'+inpStyle+'">'
    +'<input id="fe-eg" type="number" min="0" value="'+(current.euro_goals||0)+'" style="'+inpStyle+'">'
    +'<input id="fe-ea" type="number" min="0" value="'+(current.euro_assists||0)+'" style="'+inpStyle+'">'
    +'</div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button onclick="fdSaveStats(this)" data-key="'+key+'" style="flex:1;padding:8px;background:var(--a);border:none;border-radius:8px;color:#fff;font-weight:700;cursor:pointer;">💾 Sauver</button>'
    +'<button onclick="var o=document.getElementById(\'fd-edit-overlay\');if(o)o.remove();" style="padding:8px 12px;background:var(--bg3);border:1px solid var(--b2);border-radius:8px;color:var(--t3);cursor:pointer;">✕</button>'
    +'</div>';
  overlay.appendChild(popup);
  popup.addEventListener('click', function(e){ e.stopPropagation(); });
  var feFirst = document.getElementById('fe-lg'); if(feFirst) feFirst.focus();
}

function fdSaveStats(btn) {
  var key = btn ? btn.dataset.key : '';
  if(!key) return;
  var lmj = parseInt(document.getElementById('fe-lmj').value)||0;
  var lg = parseInt(document.getElementById('fe-lg').value)||0;
  var la = parseInt(document.getElementById('fe-la').value)||0;
  var emj = parseInt(document.getElementById('fe-emj').value)||0;
  var eg = parseInt(document.getElementById('fe-eg').value)||0;
  var ea = parseInt(document.getElementById('fe-ea').value)||0;
  var statsObj = {league_apps:lmj,league_goals:lg,league_assists:la,euro_apps:emj,euro_goals:eg,euro_assists:ea,ts:Date.now()};
  localStorage.setItem(key, JSON.stringify(statsObj));
  // Sync sur GitHub si token dispo
  if(localStorage.getItem('gones45_github_token')) {
    saveStatToGithub(key, statsObj).then(function(ok){
      if(ok) console.log('GitHub sync OK');
    });
  }
  var ov=document.getElementById('fd-edit-overlay');if(ov)ov.remove();
  var pid = key.split('_')[3];
  var activeEl = document.querySelector('[data-bench-pid="'+pid+'"]');
  if(activeEl) {
    var cells = activeEl.children;
    if(cells[2]){ cells[2].textContent=lg; cells[2].style.color=lg>0?'#1ed760':'var(--t3)'; }
    if(cells[3]){ cells[3].textContent=la; cells[3].style.color=la>0?'#4d84ff':'var(--t3)'; }
    if(cells[5]){ cells[5].textContent=eg; cells[5].style.color=eg>0?'#f0b020':'var(--t3)'; }
    if(cells[6]){ cells[6].textContent=ea; cells[6].style.color=ea>0?'#f59e0b':'var(--t3)'; }
  }
}


// ── IDs Sofascore par équipe ── AJOUTER ICI ──
var SOFASCORE_TEAM_IDS = {
  // Football
  'PSG':1644, 'Paris Saint-Germain':1644, 'Paris SG':1644,
  'Real Madrid':2829, 'Real':2829,
  'Bayern Munich':2672, 'Bayern':2672,
  'Inter Milan':2697, 'Inter':2697,
  'Lyon':1649, 'OL':1649, 'Olympique Lyonnais':1649,
  'Palmeiras':1963,
  'Boca Juniors':3202, 'Boca':3202,
  'France':4481,
  'PSV':2952, 'PSV Eindhoven':2952,
  // Baseball
  'LA Dodgers':3638, 'Los Angeles Dodgers':3638,
};

async function sofascoreFetch(path) {
  var key = localStorage.getItem('gones45_rapidapi_key');
  if(!key) return null;
  var url = 'https://fd-proxy.touraine-antoine.workers.dev/?key='+key+'&host=rapidapi&rapidhost=sofascore-sport-api.p.rapidapi.com&path='+encodeURIComponent(path);
  var r = await fetch(url);
  if(!r.ok) return null;
  return await r.json();
}

function refreshSquadCache(nom) {
  var sofaId = SOFASCORE_TEAM_IDS && SOFASCORE_TEAM_IDS[nom];
  if(!sofaId) { for(var k in SOFASCORE_TEAM_IDS){ if(nom.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(nom.toLowerCase())>=0){sofaId=SOFASCORE_TEAM_IDS[k];break;} } }
  var cacheKey = 'squad_sofa_'+(sofaId||'af_'+nom);
  localStorage.removeItem(cacheKey);
  loadTeamLive();
}

async function importFbrefStats(uid, nom) {
  var groqKey = getGeminiKey();
  if(!groqKey) { alert('❌ Clé Groq manquante — configure-la dans Outils.'); return; }

  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async function(e) {
    var file = e.target.files[0];
    if(!file) return;
    var b64 = await fileToBase64(file);
    await runFbrefGroq(uid, nom, b64, groqKey);
  };
  input.click();
}

function handleFbrefFileInput(e, uid, nom) {
  var file = e.target.files[0];
  if(!file) return;
  var groqKey = getGeminiKey();
  if(!groqKey) { alert('❌ Clé Groq manquante — configure-la dans Outils.'); return; }
  var modeBtn = document.getElementById('fbref-mode-'+uid);
  var mode = modeBtn ? modeBtn.dataset.mode : 'replace';
  var compBtn = document.getElementById('fbref-comp-'+uid);
  var comp = compBtn ? compBtn.dataset.comp : 'league';
  fileToBase64(file).then(function(b64){ runFbrefGroq(uid, nom, b64, groqKey, mode, comp); });
}

function handleFbrefDrop(e, uid, nom) {
  e.preventDefault();
  var zone = document.getElementById('fbref-paste-zone-'+uid);
  if(zone) zone.style.borderColor = 'rgba(255,255,255,.1)';
  var file = e.dataTransfer.files[0];
  if(!file || file.type.indexOf('image')===-1) return;
  var groqKey = getGeminiKey();
  if(!groqKey) { alert('❌ Clé Groq manquante — configure-la dans Outils.'); return; }
  var modeBtn = document.getElementById('fbref-mode-'+uid);
  var mode = modeBtn ? modeBtn.dataset.mode : 'replace';
  var compBtn = document.getElementById('fbref-comp-'+uid);
  var comp = compBtn ? compBtn.dataset.comp : 'league';
  fileToBase64(file).then(function(b64){ runFbrefGroq(uid, nom, b64, groqKey, mode, comp); });
}

function setupFbrefPaste(uid, nom) {
  document.addEventListener('paste', function handler(e) {
    var liveEl = document.getElementById('ip-live');
    if(!liveEl || liveEl.style.display==='none') return;
    var items = e.clipboardData && e.clipboardData.items;
    if(!items) return;
    for(var i=0;i<items.length;i++){
      if(items[i].type.indexOf('image')!==-1){
        var groqKey = getGeminiKey();
        if(!groqKey) { alert('❌ Clé Groq manquante.'); return; }
        var modeBtn = document.getElementById('fbref-mode-'+uid);
        var mode = modeBtn ? modeBtn.dataset.mode : 'replace';
        var compBtn = document.getElementById('fbref-comp-'+uid);
        var comp = compBtn ? compBtn.dataset.comp : 'league';
        var blob = items[i].getAsFile();
        fileToBase64(blob).then(function(b64){ runFbrefGroq(uid, nom, b64, groqKey, mode, comp); });
        document.removeEventListener('paste', handler);
        break;
      }
    }
  });
}

function fileToBase64(file) {
  return new Promise(function(res) {
    var r = new FileReader();
    r.onload = function(ev) { res(ev.target.result.split(',')[1]); };
    r.readAsDataURL(file);
  });
}

async function runFbrefGroq(uid, nom, b64, groqKey, mode, comp) {
  mode = mode || 'replace';
  comp = comp || 'league';
  var prefix = comp === 'euro' ? 'euro' : 'league';

  // Récupérer la journée sélectionnée dans le sélecteur admin
  var journeeEl = document.getElementById('fbref-journee-'+uid);
  var journee = journeeEl ? journeeEl.value : 'global';
  // Si journée spécifique, on préfixe les clés
  var savePrefix = (journee && journee !== 'global') ? prefix+'_'+journee : prefix;
  var zone = document.getElementById('fbref-paste-zone-'+uid);
  var btn = document.getElementById('btn-fbref-import-'+uid);
  if(zone) zone.innerHTML = '<span style="font-size:11px;color:var(--t3);">⏳ Lecture en cours...</span>';
  if(btn) { btn.textContent = '⏳...'; btn.disabled = true; }

  try {
    var resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+groqKey },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,'+b64 } },
            { type: 'text', text: 'Tu es un extracteur de données de statistiques football. Analyse ce tableau de stats (peut être FBref, Sofascore, ou autre) et retourne UNIQUEMENT un JSON valide (pas de texte autour, pas de markdown) avec ce format:\n{"players":[{"name":"Nom Joueur","apps":0,"starts":0,"goals":0,"assists":0,"minutes":0,"gpk":0,"pk":0,"pkatt":0,"yellow":0,"red":0,"ga":0,"sota":0,"saves":0,"save_pct":0,"cs":0,"cs_pct":0}]}\n\nCorrespondances de colonnes à reconnaître :\n- apps/matchs joués : "Député", "MJ", "MP", "Apps", "Matches"\n- starts/titularisations : "Débuts", "Starts", "Tit"\n- minutes : "Min", "Minutes"\n- buts : "Gls", "Buts", "Goals", "B"\n- passes décisives : "Ast", "Passes", "Assists", "A"\n- cartons jaunes : "CrdY", "CJ", "Yellow"\n- cartons rouges : \"CrdR\", \"CR\", \"Red\"\n- G+A (buts plus passes) : \\"G+A\\"\n- G-PK (buts hors penalty) : \\"G-PK\\"\n- PK (penalties marques) : \\"PK\\"\n- PKatt (penalties tentes) : \\"PKatt\\"\n- GARDIEN GA (buts encaisses) : \"GA\"\n- GARDIEN SoTA (tirs cadres subis) : \"SoTA\"\n- GARDIEN Arrets : \"Arrets\", \"Saves\"\n- GARDIEN Save pct : \"Save %\"\n- GARDIEN CS clean sheets : \"CS\"\n- GARDIEN CS pct : \"CS %\"\n\nEXEMPLE FBref: une ligne \"Lucas Hernandez FRA DF 29 25 20 1747 19.4 0 3 3 0 0 0 4 0\" se lit ainsi: Nation=FRA, Pos=DF, Age=29, MP/apps=25, Debuts/starts=20, Min=1747, 90s=19.4(ignorer), Gls=0, Ast=3, G+A=3, G-PK=0, PK=0, PKatt=0, CrdY/yellow=4, CrdR/red=0. Donc apps=25 PAS 29 (29=age a ignorer). yellow=4. NE DECALE PAS les colonnes.\n\nTRES IMPORTANT FBref standard: 3 sections de colonnes. Temps de jeu (MP Debuts Min), Performances (Gls Ast G+A G-PK PK PKatt CrdY CrdR), Par 90 minutes (a IGNORER completement). CrdY et CrdR sont les 2 dernieres colonnes de Performances avant la section Par 90. Ne prends jamais une valeur Per90 (avec decimale comme 0.85) pour un carton ou un but. Les buts/passes/cartons sont des nombres ENTIERS.\n\nExtrais TOUS les joueurs visibles. Si une colonne est absente mets 0. Utilise le nom exact tel qu\'il apparaît.' }
          ]
        }]
      })
    });

    var data = await resp.json();
    var raw = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if(!raw) {
      console.error('Groq réponse complète:', JSON.stringify(data));
      if(data.error) throw new Error('Groq: '+(data.error.message||data.error.type||'erreur API'));
      throw new Error('Réponse vide (voir console)');
    }

    var clean = raw.replace(/```json|```/g, '').trim();
    var parsed;
    try {
      parsed = JSON.parse(clean);
    } catch(parseErr) {
      // JSON tronqué : tenter de récupérer les joueurs complets
      var lastComplete = clean.lastIndexOf('}');
      if(lastComplete > 0) {
        var repaired = clean.substring(0, lastComplete+1);
        // Fermer le tableau et l'objet
        if(!repaired.trim().endsWith(']}')) {
          repaired = repaired.replace(/,\s*$/, '') + ']}';
        }
        try {
          parsed = JSON.parse(repaired);
        } catch(e2) {
          throw new Error('JSON illisible (réessaie avec moins de joueurs)');
        }
      } else {
        throw parseErr;
      }
    }
    var players = parsed.players || [];
    if(!players.length) throw new Error('Aucun joueur extrait');

    var sofaId = SOFASCORE_TEAM_IDS && SOFASCORE_TEAM_IDS[nom];
    if(!sofaId) { for(var k in SOFASCORE_TEAM_IDS){ if(nom.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(nom.toLowerCase())>=0){sofaId=SOFASCORE_TEAM_IDS[k];break;} } }
    var updated = 0;

    var cacheKey = 'squad_sofa_'+(sofaId||'af_'+nom);
    var squadData = null;
    try { var c = JSON.parse(localStorage.getItem(cacheKey)||'{}'); squadData = c.squad; } catch(e){}

    if(squadData) {
      players.forEach(function(sp) {
        var normName = function(s){ return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z ]/g,'').trim(); };
        var sn = normName(sp.name);
        var snParts = sn.split(' ').filter(function(x){return x.length>2;});
        var snLast = snParts[snParts.length-1] || sn;
        // Comparaison de deux mots avec tolérance accents/orthographe (Fabien~Fabian)
        var wordsClose = function(a, b) {
          if(a === b) return true;
          if(a.length>4 && b.length>4 && (a.includes(b)||b.includes(a))) return true;
          // Tolérance 1-2 lettres différentes pour mots de meme longueur approx
          if(Math.abs(a.length-b.length)<=1 && a.length>=5) {
            var common=0; var minL=Math.min(a.length,b.length);
            for(var i=0;i<minL;i++){ if(a[i]===b[i]) common++; }
            if(common >= minL-1) return true;
          }
          return false;
        };
        var match = squadData.find(function(p) {
          var pn = normName(p.name||p.shortName||'');
          if(pn===sn) return true; // match exact
          var pnParts = pn.split(' ').filter(function(x){return x.length>2;});
          var pnLast = pnParts[pnParts.length-1] || pn;
          // 1. Nom de famille identique ou proche
          if(wordsClose(pnLast, snLast)) return true;
          // 2. Noms inverses (Lee Kang-In vs Kang-in Lee) : un mot significatif commun aux deux
          var sharedSignificant = snParts.some(function(sp2){
            return sp2.length>3 && pnParts.some(function(pp2){ return wordsClose(sp2, pp2); });
          });
          if(sharedSignificant) {
            // Exiger qu'au moins 1 autre mot matche aussi OU que ce soit un nom rare
            var matchCount = 0;
            snParts.forEach(function(sp2){
              if(pnParts.some(function(pp2){ return wordsClose(sp2, pp2); })) matchCount++;
            });
            return matchCount >= Math.min(snParts.length, pnParts.length);
          }
          return false;
        });
        // Fallback : nom complet inclus
        if(!match) {
          match = squadData.find(function(p) {
            var pn = normName(p.name||p.shortName||'');
            return pn===sn || (sn.length>5 && pn.includes(sn)) || (pn.length>5 && sn.includes(pn));
          });
        }
        if(match) {
          var manualKey = 'manual_stats_'+saisonKey((sofaId||'0')+'_'+match.id);
          var ms = {}; try { ms = JSON.parse(localStorage.getItem(manualKey)||'{}'); } catch(e){}
          if(mode === 'add') {
            if(sp.apps)    ms[savePrefix+'_apps']    = (ms[savePrefix+'_apps']||0)    + sp.apps;
            if(sp.starts !== undefined) ms[savePrefix+'_starts'] = (ms[savePrefix+'_starts']||0) + sp.starts;
            if(sp.goals)   ms[savePrefix+'_goals']   = (ms[savePrefix+'_goals']||0)   + sp.goals;
            if(sp.assists) ms[savePrefix+'_assists']  = (ms[savePrefix+'_assists']||0) + sp.assists;
            if(sp.minutes) ms[savePrefix+'_minutes']  = (ms[savePrefix+'_minutes']||0) + sp.minutes;
            if(sp.gpk)     ms[savePrefix+'_gpk']      = (ms[savePrefix+'_gpk']||0)     + sp.gpk;
            if(sp.pk)      ms[savePrefix+'_pk']       = (ms[savePrefix+'_pk']||0)      + sp.pk;
            if(sp.pkatt)   ms[savePrefix+'_pkatt']    = (ms[savePrefix+'_pkatt']||0)   + sp.pkatt;
            if(sp.yellow)  ms[savePrefix+'_yellow']   = (ms[savePrefix+'_yellow']||0)  + sp.yellow;
            if(sp.red)     ms[savePrefix+'_red']      = (ms[savePrefix+'_red']||0)     + sp.red;
            if(sp.ga)      ms[savePrefix+'_ga']       = (ms[savePrefix+'_ga']||0)      + sp.ga;
            if(sp.sota)    ms[savePrefix+'_sota']     = (ms[savePrefix+'_sota']||0)    + sp.sota;
            if(sp.saves)   ms[savePrefix+'_saves']    = (ms[savePrefix+'_saves']||0)   + sp.saves;
            if(sp.cs)      ms[savePrefix+'_cs']       = (ms[savePrefix+'_cs']||0)      + sp.cs;
            if(sp.save_pct !== undefined) ms[savePrefix+'_savepct'] = parseFloat(sp.save_pct).toFixed(1);
            if(sp.cs_pct !== undefined)   ms[savePrefix+'_cspct']   = parseFloat(sp.cs_pct).toFixed(1);
          } else {
            if(sp.apps)    ms[savePrefix+'_apps']    = sp.apps;
            if(sp.starts !== undefined) ms[savePrefix+'_starts'] = sp.starts;
            if(sp.goals)   ms[savePrefix+'_goals']   = sp.goals;
            if(sp.assists) ms[savePrefix+'_assists']  = sp.assists;
            if(sp.minutes) ms[savePrefix+'_minutes']  = sp.minutes;
            if(sp.gpk !== undefined)   ms[savePrefix+'_gpk']   = sp.gpk;
            if(sp.pk !== undefined)    ms[savePrefix+'_pk']    = sp.pk;
            if(sp.pkatt !== undefined) ms[savePrefix+'_pkatt'] = sp.pkatt;
            if(sp.yellow)  ms[savePrefix+'_yellow']   = sp.yellow;
            if(sp.red)     ms[savePrefix+'_red']      = sp.red;
            if(sp.ga !== undefined)    ms[savePrefix+'_ga']      = sp.ga;
            if(sp.sota !== undefined)  ms[savePrefix+'_sota']    = sp.sota;
            if(sp.saves !== undefined) ms[savePrefix+'_saves']   = sp.saves;
            if(sp.cs !== undefined)    ms[savePrefix+'_cs']      = sp.cs;
            if(sp.save_pct !== undefined) ms[savePrefix+'_savepct'] = parseFloat(sp.save_pct).toFixed(1);
            if(sp.cs_pct !== undefined)   ms[savePrefix+'_cspct']   = parseFloat(sp.cs_pct).toFixed(1);
          }
          localStorage.setItem(manualKey, JSON.stringify(ms));
          updated++;
        }
      });
    }

    if(zone) zone.innerHTML = '<span style="font-size:11px;color:var(--g);">✅ '+updated+' joueur(s) '+(mode==='add'?'additionnés':'mis à jour')+' ('+(comp==='euro'?'Europe':'Championnat')+(journee&&journee!=='global'?' · '+journee:'')+') — rechargement...</span>';
    if(btn) { btn.textContent = '✅ '+updated+' MAJ'; btn.disabled = false; }

    // Sauvegarder la dernière journée mise à jour
    if(journee && journee !== 'global') {
      localStorage.setItem('squad_lastJ_'+saisonKey(sofaId||'0'), journee);
    }
    setTimeout(function() {
      loadTeamLive();
    }, 1000);

  } catch(err) {
    console.error('runFbrefGroq error:', err);
    if(zone) zone.innerHTML = '<span style="font-size:11px;color:var(--r);">❌ Erreur : '+err.message+'</span>';
    if(btn) { btn.textContent = '📸 Import FBref'; btn.disabled = false; }
    setTimeout(function(){
      if(zone) zone.innerHTML = '<span style="font-size:11px;color:var(--t3);">📸 Colle ou glisse un screenshot FBref ici pour importer les stats automatiquement</span>';
    }, 4000);
  }
}


function sortSquad(uid, col) {
  var cur = window['_squadSort_'+uid] || 'name';
  if(cur === col) {
    window['_squadSortDir_'+uid] = (window['_squadSortDir_'+uid] || 1) * -1;
  } else {
    window['_squadSort_'+uid] = col;
    window['_squadSortDir_'+uid] = col === 'name' ? 1 : -1;
  }
  loadTeamCompo && loadTeamCompo();
}

function toggleAdminLock(uid) {
  var isAdmin = localStorage.getItem('gones45_admin') === '1';
  if(isAdmin) {
    // Verrouiller
    localStorage.removeItem('gones45_admin');
    var btn = document.getElementById('btn-admin-lock-'+uid);
    if(btn) btn.textContent = '\uD83D\uDD12';
    var zone = document.getElementById('fbref-admin-zone-'+uid);
    if(zone) zone.style.display = 'none';
  } else {
    // Deverrouiller - demander le mot de passe
    var pwd = prompt('Code admin :');
    if(!pwd) return;
    if(pwd === localStorage.getItem('gones45_admin_pwd') || pwd === 'Laurajtm45') {
      localStorage.setItem('gones45_admin', '1');
      // Sauvegarder le mot de passe si premier usage
      if(!localStorage.getItem('gones45_admin_pwd')) {
        localStorage.setItem('gones45_admin_pwd', pwd);
      }
      var btn = document.getElementById('btn-admin-lock-'+uid);
      if(btn) btn.textContent = '\uD83D\uDD13';
      var zone = document.getElementById('fbref-admin-zone-'+uid);
      if(zone) zone.style.display = 'block';
    } else {
      alert('Code incorrect');
    }
  }
}

function setCompMode(uid, comp) {
  window['_compMode_'+uid] = comp;
  var b = document.getElementById('fbref-comp-'+uid);
  if(b) {
    b.dataset.comp = comp;
    var isLeague = comp === 'league';
    b.textContent = isLeague ? 'Champ' : 'Europe';
    b.style.background = isLeague ? 'rgba(77,132,255,.15)' : 'rgba(240,180,32,.15)';
    b.style.borderColor = isLeague ? 'rgba(77,132,255,.4)' : 'rgba(240,180,32,.4)';
    b.style.color = isLeague ? '#4d84ff' : '#f0b420';
  }
  if(typeof loadTeamCompo === 'function') loadTeamCompo();
}

function toggleFbrefComp(uid) {
  var b = document.getElementById('fbref-comp-'+uid);
  if(!b) return;
  b.dataset.comp = b.dataset.comp === 'league' ? 'euro' : 'league';
  window['_compMode_'+uid] = b.dataset.comp;
  var isLeague = b.dataset.comp === 'league';
  b.textContent = isLeague ? 'Champ' : 'Europe';
  b.style.background = isLeague ? 'rgba(77,132,255,.15)' : 'rgba(240,180,32,.15)';
  b.style.borderColor = isLeague ? 'rgba(77,132,255,.4)' : 'rgba(240,180,32,.4)';
  b.style.color = isLeague ? '#4d84ff' : '#f0b420';
  updateFbrefHint(uid);
  // Recharger le tableau Compo avec les stats de la bonne competition
  if(typeof loadTeamCompo === 'function') loadTeamCompo();
  else if(typeof loadTeamLive === 'function') loadTeamLive();
}

function toggleFbrefMode(uid) {
  var b = document.getElementById('fbref-mode-'+uid);
  if(!b) return;
  b.dataset.mode = b.dataset.mode === 'replace' ? 'add' : 'replace';
  var isReplace = b.dataset.mode === 'replace';
  b.textContent = isReplace ? 'Remplacer' : 'Additionner';
  b.style.background = isReplace ? 'rgba(255,120,80,.15)' : 'rgba(30,215,96,.15)';
  b.style.borderColor = isReplace ? 'rgba(255,120,80,.4)' : 'rgba(30,215,96,.4)';
  b.style.color = isReplace ? '#ff7850' : '#1ed760';
  updateFbrefHint(uid);
}

function updateFbrefHint(uid) {
  var hint = document.getElementById('fbref-mode-hint-'+uid);
  var cb = document.getElementById('fbref-comp-'+uid);
  var mb = document.getElementById('fbref-mode-'+uid);
  if(!hint||!cb||!mb) return;
  var c = cb.dataset.comp === 'euro' ? 'Europe' : 'Championnat';
  var m = mb.dataset.mode === 'add' ? 'journee par journee' : 'saison complete';
  hint.textContent = c + ' - ' + m;
}

async function loadFdSquad(el, nom, teamId, noTerrain, terrainOnly) {
  el.innerHTML = '<div style="text-align:center;padding:16px;color:var(--t3);font-size:11px;">⏳ Chargement squad...</div>';
  try {
    var rapidKey = localStorage.getItem('gones45_rapidapi_key');
    var afKey = getApiSportsKey();

    // Trouver l'ID Sofascore
    var sofaId = SOFASCORE_TEAM_IDS[nom];
    if(!sofaId) {
      // Chercher par correspondance partielle
      for(var k in SOFASCORE_TEAM_IDS) {
        if(nom.toLowerCase().indexOf(k.toLowerCase())>=0 || k.toLowerCase().indexOf(nom.toLowerCase())>=0) {
          sofaId = SOFASCORE_TEAM_IDS[k]; break;
        }
      }
    }

    if(!sofaId && !afKey) {
      el.innerHTML='<div style="color:var(--t3);font-size:10px;text-align:center;padding:12px;">Équipe non configurée</div>'; return;
    }

    var cacheKey = 'squad_sofa_'+(sofaId||'af_'+nom);
    var cacheDuration = 24*60*60*1000;
    var squad, statsMap = {};

    // Sync stats depuis GitHub au premier chargement du jour
    if(localStorage.getItem('gones45_github_token') && !localStorage.getItem('github_synced_today')) {
      try {
        await syncStatsFromGithub();
        localStorage.setItem('github_synced_today', Date.now());
        setTimeout(function(){ localStorage.removeItem('github_synced_today'); }, 6*60*60*1000);
      } catch(e) { console.warn('GitHub sync error:', e); }
    } else if(!localStorage.getItem('gones45_github_token') && !localStorage.getItem('public_stats_loaded')) {
      // Amis sans token : lecture publique des stats partagées
      try {
        await loadPublicStats();
        localStorage.setItem('public_stats_loaded', Date.now());
        setTimeout(function(){ localStorage.removeItem('public_stats_loaded'); }, 30*60*1000);
      } catch(e) { console.warn('Public stats error:', e); }
    }

    var usingSofa = false;

    // Vérifier cache
    try {
      var cached = localStorage.getItem(cacheKey);
      if(cached) {
        var c = JSON.parse(cached);
        if(Date.now()-c.ts < cacheDuration) {
          squad = c.squad; statsMap = c.statsMap||{}; usingSofa = c.usingSofa||false;
          console.log('Squad '+nom+' depuis cache');
        }
      }
    } catch(e) {}

    if(!squad) {
      if(sofaId && rapidKey) {
        // ── Sofascore ──
        var data = await sofascoreFetch('/api/team/'+sofaId+'/players');
        if(data && data.players && data.players.length) {
          usingSofa = true;
          squad = data.players.map(function(r){
            var p = r.player;
            var posMap = {'G':1,'D':2,'M':3,'F':4};
            return {
              id: p.id,
              name: p.name,
              shortName: p.shortName,
              nationality: p.country&&p.country.name||'',
              position: p.position||'F',
              _type: posMap[p.position]||4,
              _age: p.dateOfBirth ? Math.floor((Date.now()-new Date(p.dateOfBirth))/(365.25*24*3600*1000)) : 0,
              number: p.shirtNumber||0,
              marketValue: p.proposedMarketValue||0,
              sofaId: p.id,
              _goals: 0, _assists: 0, _minutes: 0, _rating: null
            };
          });
        }
      }

      // Fallback API-Football
      if(!squad && afKey) {
        var afId = await findApiSportsTeamId(nom, afKey);
        if(afId) {
          var season = 2024;
          var [squadData, statsData] = await Promise.all([
            apiSportsFetch('/players/squads?team='+afId),
            apiSportsFetch('/players?team='+afId+'&season='+season+'&page=1')
          ]);
          var squadResp = squadData&&squadData.response&&squadData.response[0];
          if(squadResp&&squadResp.players&&squadResp.players.length) {
            squad = squadResp.players.map(function(p){
              return {id:p.id,name:p.name,shortName:p.name,nationality:p.nationality||'',
                position:p.position||'Attacker',number:p.number||0,
                _age:p.age||0,marketValue:0,sofaId:null,_goals:0,_assists:0,_minutes:0,_rating:null};
            });
            var allStats = (statsData&&statsData.response)||[];
            var allStats = (statsData&&statsData.response)||[];
            allStats.forEach(function(r){
              var pl=r.player; var st=r.statistics&&r.statistics[0];
              if(!pl||!st) return;
              // Matching par nom normalisé
              var s = squad.find(function(p){return matchName(p.name, pl.name);});
              if(s){
                s._goals=st.goals&&st.goals.total||0;
                s._assists=st.goals&&st.goals.assists||0;
                s._minutes=st.games&&st.games.minutes||0;
                s._rating=st.games&&st.games.rating?parseFloat(st.games.rating).toFixed(1):null;
              }
                s._apps=st.games&&st.games.appearances||0;
            });
          }
        }
      }

      if(!squad){ el.innerHTML='<div style="color:var(--t3);font-size:10px;text-align:center;padding:12px;">Squad non disponible</div>'; return; }

      // Fonction de matching nom Sofascore → API-Football
      function matchName(sofaName, afName) {
        if(!sofaName || !afName) return false;
        var s = sofaName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z ]/g,'');
        var a = afName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z ]/g,'');
        if(s === a) return true;
        // Check last name match
        var sLast = s.split(' ').pop();
        var aLast = a.split(' ').pop();
        if(sLast.length > 3 && sLast === aLast) return true;
        // Check if one contains the other
        if(s.indexOf(a) >= 0 || a.indexOf(s) >= 0) return true;
        // Check first + last
        var sParts = s.split(' ');
        var aParts = a.split(' ');
        if(sParts[0] === aParts[0] && sParts[sParts.length-1] === aParts[aParts.length-1]) return true;
        return false;
      }

      // Corrections positions
      var posCorrections = {
        'Marquinhos':2,'Nuno Mendes':2,'Achraf Hakimi':2,'William Pacho':2,'Lucas Beraldo':2,
        'Fabian Ruiz':3,'Vitinha':3,'Warren Zaire-Emery':3,'Joao Neves':3,
        'Ousmane Dembele':4,'Bradley Barcola':4,'Goncalo Ramos':4,'Desire Doue':4,
        'Trent Alexander-Arnold':2,'Ferland Mendy':2,'Dani Carvajal':2,'Eder Militao':2,
        'Antonio Rudiger':2,'David Alaba':2,'Dean Huijsen':2,'Fran Garcia':2,
        'Aurelien Tchouameni':3,'Eduardo Camavinga':3,'Federico Valverde':3,
        'Jude Bellingham':3,'Dani Ceballos':3,'Arda Guler':3,
        'Kylian Mbappe':4,'Vinicius Junior':4,'Rodrygo':4,'Endrick':4,'Brahim Diaz':4,
        'Alphonso Davies':2,'Dayot Upamecano':2,'Konrad Laimer':2,
        'Joshua Kimmich':3,'Leon Goretzka':3,'Jamal Musiala':3,'Michael Olise':3,
        'Harry Kane':4,'Leroy Sane':4,'Thomas Muller':4,
        'Alessandro Bastoni':2,'Francesco Acerbi':2,'Benjamin Pavard':2,
        'Denzel Dumfries':2,'Federico Dimarco':2,
        'Nicolo Barella':3,'Hakan Calhanoglu':3,
        'Lautaro Martinez':4,'Marcus Thuram':4,
        'Corentin Tolisso':3,'Maxence Caqueret':3,
        'Alexandre Lacazette':4,'Ernest Nuamah':4,
      };

      if(usingSofa) {
        // Sofascore donne déjà les bonnes positions, corrections légères seulement
        squad.forEach(function(p){
          for(var k in posCorrections){
            if(p.name&&p.name.toLowerCase().indexOf(k.toLowerCase())>=0){ p._type=posCorrections[k]; break; }
          }
        });
      } else {
        var posTypeAf = function(pos){
          if(!pos) return 4; var p=pos.toUpperCase();
          if(p==='GOALKEEPER') return 1; if(p==='DEFENDER') return 2; if(p==='MIDFIELDER') return 3; return 4;
        };
        squad.forEach(function(p){
          p._type = posTypeAf(p.position);
          for(var k in posCorrections){
            if(p.name&&p.name.toLowerCase().indexOf(k.toLowerCase())>=0){ p._type=posCorrections[k]; break; }
          }
        });
      }

      // Sauvegarder cache
      try { localStorage.setItem(cacheKey, JSON.stringify({squad:squad,statsMap:statsMap,usingSofa:usingSofa,ts:Date.now()})); } catch(e) {}
    }

    // XI type par minutes ou numéro
    var xiCounts = {1:1,2:4,3:3,4:3};
    var xi = [];
    [1,2,3,4].forEach(function(pos){
      var pp = squad.filter(function(p){return p._type===pos;});
      pp.sort(function(a,b){ return b._minutes-a._minutes||b._age-a._age; });
      xi = xi.concat(pp.slice(0,xiCounts[pos]));
    });
    squad.sort(function(a,b){ return a._type-b._type||b._minutes-a._minutes||b._age-a._age; });

    var posNames={1:'GK',2:'DEF',3:'MID',4:'ATT'};
    var posColors={1:'#f5a623',2:'#4fc3f7',3:'#81c784',4:'#ef9a9a'};
    var posLabels={1:'🧤 Gardiens',2:'🛡️ Défenseurs',3:'🎯 Milieux',4:'⚽ Attaquants'};
    var uid = 'fd_'+(sofaId||afId||nom||'x').toString().replace(/[^a-zA-Z0-9]/g,'');
    var html = '<div style="padding:2px 0;">';

    // Header
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--t3);">👤 Squad · '+nom+' <span style="color:var(--t2);font-weight:500;">('+squad.length+')</span></div>';
    html += '<div style="display:flex;align-items:center;gap:8px;">';
    html += '<div style="font-size:9px;color:var(--t3);">'+(usingSofa?'sofascore':'api-football · 2024-25')+'</div>';
    html += '<button id="btn-fbref-import-'+uid+'" onclick="importFbrefStats(\''+uid+'\',\''+nom+'\')" style="display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:6px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);color:var(--t2);font-size:9px;font-weight:700;cursor:pointer;">📸 Import FBref</button>';
    html += '<button id="btn-admin-lock-'+uid+'" onclick="toggleAdminLock(\''+uid+'\')" style="padding:4px 7px;border-radius:6px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);color:var(--t2);font-size:12px;cursor:pointer;" title="Mode admin">'+(localStorage.getItem('gones45_admin')==='1'?'🔓':'🔒')+'</button>';
    html += '<button onclick="refreshSquadCache(\''+nom+'\')" style="display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:6px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);color:var(--t2);font-size:9px;font-weight:700;cursor:pointer;" title="Vider le cache et recharger le squad depuis l\'API">🔄</button>';
    if(localStorage.getItem('gones45_admin')==='1'){ html += '<button onclick="resetTeamStats(\''+nom+'\')" style="display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:6px;border:1px solid rgba(255,69,69,.3);background:rgba(255,69,69,.1);color:#ff7b7b;font-size:9px;font-weight:700;cursor:pointer;" title="Effacer les stats de cette equipe">Reset</button>'; }
    html += '</div>';
    html += '</div>';

    if(!terrainOnly) {
    // Sélecteur de saison
    html += '<div style="margin-bottom:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'      +'<span style="font-size:10px;color:var(--t3);">Saison :</span>';
    SAISONS.forEach(function(s){
      var isOn = _currentSaison === s.id;
      html += '<button onclick="setSaison(\''+s.id+'\')" style="padding:4px 12px;border-radius:6px;border:1px solid '+(isOn?'rgba(77,132,255,.5)':'rgba(255,255,255,.12)')+';background:'+(isOn?'rgba(77,132,255,.2)':'rgba(255,255,255,.05)')+';color:'+(isOn?'#4d84ff':'var(--t3)')+';font-size:11px;font-weight:700;cursor:pointer;">'+s.label+'</button>';
    });
    html += '</div>';

    // Sélecteur de journée - visible par tous
    var lastJKey = 'squad_lastJ_'+saisonKey(sofaId||'0');
    var lastJ = localStorage.getItem(lastJKey)||'';
    html += '<div style="margin-bottom:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'
      +'<span style="font-size:10px;color:var(--t3);">Journée :</span>'
      +'<select id="fbref-journee-'+uid+'" onchange="loadTeamCompo&&loadTeamCompo()" style="padding:3px 8px;border-radius:6px;border:1px solid rgba(255,255,255,.15);background:var(--bg2,#1a1f2e);color:var(--t2);font-size:10px;font-weight:700;cursor:pointer;">'
      +'<option value="global">Global (total)</option>';
    html += '<optgroup label="Championnat">';
    for(var jj=1;jj<=38;jj++){ html += '<option value="J'+jj+'"'+(lastJ==='J'+jj?' selected':'')+'>J'+jj+'</option>'; }
    html += '</optgroup>';
    html += '<optgroup label="Europe">';
    for(var mm=1;mm<=8;mm++){ html += '<option value="MD'+mm+'"'+(lastJ==='MD'+mm?' selected':'')+'>MD'+mm+'</option>'; }
    html += '</optgroup>';
    html += '</select>';
    if(lastJ) html += '<span style="font-size:9px;padding:2px 7px;border-radius:10px;background:rgba(240,180,32,.15);color:#f0b420;border:1px solid rgba(240,180,32,.3);">Dernière MAJ : <strong>'+lastJ+'</strong></span>';
    html += '</div>';

    // Selecteur Competition (Champ/Europe) - visible par tous
    var curComp = window['_compMode_'+uid] || 'league';
    html += '<div style="margin-bottom:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'
      +'<span style="font-size:10px;color:var(--t3);">Competition :</span>'
      +'<button onclick="setCompMode(\''+uid+'\',\'league\')" style="padding:4px 12px;border-radius:6px;border:1px solid '+(curComp==='league'?'rgba(77,132,255,.5)':'rgba(255,255,255,.12)')+';background:'+(curComp==='league'?'rgba(77,132,255,.2)':'rgba(255,255,255,.05)')+';color:'+(curComp==='league'?'#4d84ff':'var(--t3)')+';font-size:11px;font-weight:700;cursor:pointer;">Championnat</button>'
      +'<button onclick="setCompMode(\''+uid+'\',\'euro\')" style="padding:4px 12px;border-radius:6px;border:1px solid '+(curComp==='euro'?'rgba(240,180,32,.5)':'rgba(255,255,255,.12)')+';background:'+(curComp==='euro'?'rgba(240,180,32,.2)':'rgba(255,255,255,.05)')+';color:'+(curComp==='euro'?'#f0b420':'var(--t3)')+';font-size:11px;font-weight:700;cursor:pointer;">Europe</button>'
      +'</div>';

    // ZONE ADMIN - visible seulement en mode admin
    var isAdmin = localStorage.getItem('gones45_admin') === '1';
    html += '<div id="fbref-admin-zone-'+uid+'" style="'+(isAdmin?'':'display:none;') +'">';
    html += '<div style="margin-bottom:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'
      +'<span style="font-size:10px;color:var(--t3);">Comp :</span>'
      +'<button id="fbref-comp-'+uid+'" data-comp="'+(window['_compMode_'+uid]||'league')+'" onclick="toggleFbrefComp(\''+uid+'\')" style="padding:3px 10px;border-radius:6px;border:1px solid '+(window['_compMode_'+uid]==='euro'?'rgba(240,180,32,.4)':'rgba(77,132,255,.4)')+';background:'+(window['_compMode_'+uid]==='euro'?'rgba(240,180,32,.15)':'rgba(77,132,255,.15)')+';color:'+(window['_compMode_'+uid]==='euro'?'#f0b420':'#4d84ff')+';font-size:10px;font-weight:700;cursor:pointer;">'+(window['_compMode_'+uid]==='euro'?'Europe':'Champ')+'</button>'
      +'<span style="font-size:10px;color:var(--t3);margin-left:4px;">Mode :</span>'
      +'<button id="fbref-mode-'+uid+'" data-mode="replace" onclick="toggleFbrefMode(\''+uid+'\')" style="padding:3px 10px;border-radius:6px;border:1px solid rgba(255,120,80,.4);background:rgba(255,120,80,.15);color:#ff7850;font-size:10px;font-weight:700;cursor:pointer;">Remplacer</button>'
      +'<span style="font-size:9px;color:var(--t3);" id="fbref-mode-hint-'+uid+'">Championnat - saison complete</span>'
      +'</div>';
    html += '<div id="fbref-paste-zone-'+uid+'" onclick="document.getElementById(\'fbref-file-'+uid+'\').click()" ondragover="event.preventDefault();this.style.borderColor=\'var(--a)\'" ondragleave="this.style.borderColor=\'rgba(255,255,255,.1)\'" ondrop="handleFbrefDrop(event,\''+uid+'\',\''+nom+'\')" style="border:1.5px dashed rgba(255,255,255,.1);border-radius:8px;padding:10px 14px;margin-bottom:12px;text-align:center;cursor:pointer;transition:border-color .2s;display:flex;align-items:center;justify-content:center;gap:8px;">'
      +'<span style="font-size:11px;color:var(--t3);">📸 Colle ou glisse un screenshot FBref ici pour importer les stats automatiquement</span>'
      +'</div>'
      +'<input type="file" id="fbref-file-'+uid+'" accept="image/*" style="display:none" onchange="handleFbrefFileInput(event,\''+uid+'\',\''+nom+'\')">';
    html += '</div>'; // fin fbref-admin-zone
    } // fin if(!terrainOnly)

    // TERRAIN + FICHE

    if(!noTerrain){
    // TERRAIN + FICHE
    html += '<div style="display:flex;gap:10px;margin-bottom:14px;">';
    html += '<div id="fd-pitch-'+uid+'" style="position:relative;border-radius:12px;overflow:hidden;background:#1a3a1a;border:1px solid rgba(255,255,255,.08);flex:1;min-width:0;">';
    html += '<svg style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:.18;" viewBox="0 0 300 420" preserveAspectRatio="none">';
    html += '<rect x="1" y="1" width="298" height="418" fill="none" stroke="#fff" stroke-width="1.5"/>';
    html += '<line x1="0" y1="210" x2="300" y2="210" stroke="#fff" stroke-width="1"/>';
    html += '<circle cx="150" cy="210" r="40" fill="none" stroke="#fff" stroke-width="1"/>';
    html += '<circle cx="150" cy="210" r="2" fill="#fff"/>';
    html += '<rect x="75" y="1" width="150" height="55" fill="none" stroke="#fff" stroke-width="1"/>';
    html += '<rect x="75" y="364" width="150" height="55" fill="none" stroke="#fff" stroke-width="1"/>';
    html += '</svg>';
    var rowYs={4:'13%',3:'36%',2:'60%',1:'84%'};
    [4,3,2,1].forEach(function(pos){
      var rp=xi.filter(function(p){return p._type===pos;});
      if(!rp.length) return;
      html += '<div data-terrain-row="'+pos+'" style="position:absolute;top:'+rowYs[pos]+';left:0;right:0;display:flex;justify-content:space-around;align-items:center;transform:translateY(-50%);">';
      rp.forEach(function(p){
        var pc=posColors[p._type];
        var shortName=p.shortName?p.shortName.split(' ').pop():p.name?p.name.split(' ').pop():'?';
        var sub=p._rating?p._rating:p._age+'a';
        var subCol=p._rating?(parseFloat(p._rating)>=7?'#1ed760':parseFloat(p._rating)>=6?'#f0b020':'#ef9a9a'):'rgba(255,255,255,.5)';
        var cardW=rp.length>=4?'22%':'25%';
        html += '<div class="fd-player-card" data-uid="'+uid+'" data-pid="'+p.id+'" style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;max-width:'+cardW+';">';
        var cs=rp.length>=4?'32px':'38px'; var fs=rp.length>=4?'10px':'11px'; var ts=rp.length>=4?'9px':'10px';
        html += '<div style="width:'+cs+';height:'+cs+';border-radius:50%;background:'+pc+'33;border:2px solid '+pc+';display:flex;align-items:center;justify-content:center;font-size:'+fs+';font-weight:800;color:'+pc+';box-shadow:0 2px 8px rgba(0,0,0,.4);">'+posNames[p._type].charAt(0)+'</div>';
        html += '<div style="background:rgba(0,0,0,.75);border-radius:4px;padding:1px 4px;font-size:'+ts+';font-weight:700;color:#fff;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;text-align:center;">'+shortName+'</div>';
        html += '<div style="font-size:8px;font-weight:700;color:'+subCol+';">'+sub+'</div>';
        html += '</div>';
      });
      html += '</div>';
    });
    html += '<div style="height:360px;"></div></div>';

    }
    // Panneau fiche
    html += '<div id="fd-tip-'+uid+'" style="width:140px;flex-shrink:0;border-radius:12px;background:rgba(14,18,32,.95);border:1px solid rgba(77,132,255,.25);padding:12px;display:flex;flex-direction:column;gap:2px;">';
    html += '<div style="font-size:9px;color:var(--t3);text-align:center;margin:auto 0;">← Sélectionne</div>';
    html += '</div></div>';

    // Tableau par poste
    [1,2,3,4].forEach(function(pos){
      var pp=squad.filter(function(p){return p._type===pos;});
      if(!pp.length) return;
      var pc=posColors[pos];
      html += '<div style="margin-bottom:12px;">';
      html += '<div style="display:flex;align-items:center;gap:7px;margin-bottom:6px;"><div style="width:3px;height:14px;border-radius:2px;background:'+pc+';flex-shrink:0;"></div>';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:'+pc+';">'+posLabels[pos]+'</div>';
      html += '<div style="flex:1;height:1px;background:rgba(255,255,255,.05);"></div>';
      html += '<div style="font-size:9px;color:var(--t3);">'+pp.length+'</div></div>';
      var tc = 'font-size:8px;color:var(--t3);font-weight:700;text-align:center;padding:3px 4px;white-space:nowrap;';
      var isMobilePortrait = window.innerWidth < 600;

      if(!terrainOnly) {     if(isMobilePortrait) {
        // ── MODE PORTRAIT MOBILE : Joueur + stats compactes ──
        var mCompMode = window['_compMode_'+uid] || 'league';
        var mPrefix = mCompMode === 'euro' ? 'euro' : 'league';
        var mView = (function(){ var el=document.getElementById('fbref-journee-'+uid); return el?el.value:'global'; })() || 'global';
        var mJ = (mView && mView !== 'global') ? mPrefix+'_'+mView : mPrefix;
        var mIsGK = (pos === 1);
        html += '<table style="width:100%;border-collapse:collapse;table-layout:fixed;">';
        if(mIsGK) {
          html += '<colgroup><col style="width:18px"><col style="auto"><col style="width:30px"><col style="width:34px"><col style="width:34px"></colgroup>';
          html += '<thead><tr>';
          html += '<th style="'+tc+'"></th>';
          html += '<th style="'+tc+'text-align:left;">Gardien</th>';
          html += '<th style="'+tc+'" title="Buts encaiss\u00e9s">GA</th>';
          html += '<th style="'+tc+'" title="Arr\u00eats">Arr</th>';
          html += '<th style="'+tc+'" title="Clean sheets">CS</th>';
          html += '</tr></thead><tbody>';
        } else {
          html += '<colgroup><col style="width:18px"><col style="auto"><col style="width:28px"><col style="width:28px"><col style="width:28px"></colgroup>';
          html += '<thead><tr>';
          html += '<th style="'+tc+'"></th>';
          html += '<th style="'+tc+'text-align:left;">Joueur</th>';
          html += '<th style="'+tc+'" title="Matchs jou\u00e9s">MJ</th>';
          html += '<th style="'+tc+'" title="Buts">B</th>';
          html += '<th style="'+tc+'" title="Passes d\u00e9cisives">A</th>';
          html += '</tr></thead><tbody>';
        }
        pp.forEach(function(p,i){
          var inXi=xi.some(function(x){return x.id===p.id;});
          var rowBg=i%2===0?'rgba(255,255,255,.025)':'rgba(255,255,255,.015)';
          var manualKey='manual_stats_'+saisonKey((sofaId||afId||'0')+'_'+p.id);
          var ms={}; try{ms=JSON.parse(localStorage.getItem(manualKey)||'{}');}catch(e){}
          var hasManual=ms.league_goals!==undefined||ms.euro_goals!==undefined;
          var lg=ms[mJ+'_goals']!==undefined?ms[mJ+'_goals']:(mView==='global'&&mCompMode==='league'?(hasManual?0:(p._goals||0)):0);
          var la=ms[mJ+'_assists']!==undefined?ms[mJ+'_assists']:(mView==='global'&&mCompMode==='league'?(hasManual?0:(p._assists||0)):0);
          var lmj=ms[mJ+'_apps']!==undefined?ms[mJ+'_apps']:(mView==='global'&&mCompMode==='league'?(p._apps||0):0);
          var mga=ms[mJ+'_ga']||0;
          var msaves=ms[mJ+'_saves']||0;
          var mcs=ms[mJ+'_cs']||0;
          var sofaUrl=p.sofaId?'https://www.sofascore.com/player/'+p.sofaId:'https://www.google.com/search?q='+encodeURIComponent(p.name+' '+nom);
          html += '<tr data-bench-pid="'+p.id+'" style="background:'+rowBg+';border-left:3px solid '+pc+'55;cursor:pointer;">';
          html += '<td style="padding:5px 3px;text-align:center;"><span style="font-size:7px;background:'+pc+'33;color:'+pc+';border-radius:3px;padding:1px 3px;font-weight:800;'+(inXi?'':'visibility:hidden;')+'">XI</span></td>';
          html += '<td style="padding:5px 4px;overflow:hidden;"><span style="font-size:12px;font-weight:700;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;">'+p.name+'</span></td>';
          if(mIsGK) {
            html += '<td style="text-align:center;font-size:12px;font-weight:700;padding:5px 2px;color:'+(mga>0?'#ef4444':'rgba(255,255,255,.2)')+'">'+(mga||'\u2014')+'</td>';
            html += '<td style="text-align:center;font-size:12px;font-weight:700;padding:5px 2px;color:'+(msaves>0?'#1ed760':'rgba(255,255,255,.2)')+'">'+(msaves||'\u2014')+'</td>';
            html += '<td style="text-align:center;font-size:12px;font-weight:700;padding:5px 2px;color:'+(mcs>0?'#1ed760':'rgba(255,255,255,.2)')+'">'+(mcs||'\u2014')+'</td>';
          } else {
            html += '<td style="text-align:center;font-size:11px;color:var(--t2);padding:5px 2px;">'+(lmj||0)+'</td>';
            html += '<td style="text-align:center;font-size:12px;font-weight:700;padding:5px 2px;color:'+(lg>0?'#1ed760':'rgba(255,255,255,.2)')+'">'+lg+'</td>';
            html += '<td style="text-align:center;font-size:12px;font-weight:700;padding:5px 2px;color:'+(la>0?'#4d84ff':'rgba(255,255,255,.2)')+'">'+la+'</td>';
          }
          html += '</tr>';
        });
        html += '</tbody></table>';
        html += '</div>';
      } else {
        // ── MODE PAYSAGE / PC : colonnes selon comp toggle ──
        var isGK = (pos === 1); // Gardiens
        var compMode = window['_compMode_'+uid] || (function(){ var b=document.getElementById('fbref-comp-'+uid); return (b&&b.dataset.comp) || 'league'; })();
        var sortKey = window['_squadSort_'+uid] || 'name';
        var sortDir = window['_squadSortDir_'+uid] || 1;
        var lastJKey2 = 'squad_lastJ_'+saisonKey(sofaId||'0');
        var lastJBadge = localStorage.getItem(lastJKey2)||'';
        var viewJournee = (function(){ var el=document.getElementById('fbref-journee-'+uid); return el?el.value:'global'; })() || window['_squadViewJ_'+uid] || 'global';

                var thS = function(col,lbl,title){
          var active = sortKey===col;
          var arrow = active?(sortDir===1?' ↓':' ↑'):'';
          var color = active?'#4d84ff':'var(--t3)';
          return '<th data-sort="'+col+'" data-uid="'+uid+'" onclick="sortSquad(this.dataset.uid,this.dataset.sort)" style="font-size:8px;color:'+color+';font-weight:700;text-align:center;padding:3px 4px;white-space:nowrap;cursor:pointer;" title="'+(title||lbl)+'">'+lbl+arrow+'</th>';
        };
        html += '<div style="overflow-x:auto;" id="squad-table-'+uid+'">';
        html += '<table style="width:100%;border-collapse:collapse;table-layout:fixed;min-width:680px;">';
        html += '<colgroup><col style="width:22px"><col style="width:150px"><col style="width:32px"><col style="width:30px"><col style="width:30px"><col style="width:42px"><col style="width:auto"><col style="width:auto"><col style="width:auto"><col style="width:auto"><col style="width:auto"><col style="width:auto"><col style="width:auto"><col style="width:auto"><col style="width:30px"></colgroup>';
        html += '<thead><tr>';
        html += '<th style="'+tc+'"></th>';
        html += '<th data-sort="name" data-uid="'+uid+'" onclick="sortSquad(this.dataset.uid,this.dataset.sort)" style="'+tc+'text-align:left;cursor:pointer;">Joueur'+(sortKey==='name'?(sortDir===1?' ↓':' ↑'):'')+'</th>';
        if(isGK) {
          html += thS('age','Age','Age du joueur');
          html += thS('mj','MJ','Matchs joués');
          html += thS('tit','Tit','Titularisations');
          html += thS('min','Min','Minutes jouées');
          html += thS('ga','GA','Buts encaissés');
          html += thS('sota','SoTA','Tirs cadrés subis');
          html += thS('saves','Arrêts','Arrêts effectués');
          html += thS('savepct','Save%','Pourcentage d arrêts');
          html += thS('cs','CS','Clean sheets');
          html += thS('cspct','CS%','% de clean sheets');
          html += '<th style="'+tc+'"></th>';
        } else {
          html += thS('age','Age','Age du joueur');
          html += thS('mj','MJ','Matchs joués');
          html += thS('tit','Tit','Titularisations');
          html += thS('min','Min','Minutes jouées');
          html += thS('g','B','Buts');
          html += thS('a','A','Passes décisives');
          html += thS('ga_sum','G+A','Buts + Passes');
          html += thS('gpk','G-PK','Buts hors penalty');
          html += thS('pk','PK','Penalties marqués');
          html += thS('pkatt','PKt','Penalties tentés');
          html += thS('cj','CJ','Cartons jaunes');
          html += thS('cr','CR','Cartons rouges');
          html += '<th style="'+tc+'"></th>';
        }
        html += '</tr></thead><tbody>';
        // Trier les joueurs selon la colonne selectionnee
        var sortedPp = pp.slice().sort(function(a,b){
          var prefix2 = compMode==='euro'?'euro':'league';
          var jPfx = (viewJournee&&viewJournee!=='global') ? prefix2+'_'+viewJournee : prefix2;
          var getVal = function(p, key) {
            var ms2={}; try{ms2=JSON.parse(localStorage.getItem('manual_stats_'+saisonKey((sofaId||afId||'0')+'_'+p.id))||'{}');}catch(e){}
            if(key==='name') return (p.name||'').toLowerCase();
            if(key==='age') return parseInt(p._age)||0;
            if(key==='mj') return ms2[jPfx+'_apps']!==undefined?ms2[jPfx+'_apps']:(p._apps||0);
            if(key==='tit') return ms2[jPfx+'_starts']||0;
            if(key==='min') return ms2[jPfx+'_minutes']!==undefined?ms2[jPfx+'_minutes']:(p._minutes||0);
            if(key==='g') return ms2[jPfx+'_goals']!==undefined?ms2[jPfx+'_goals']:(p._goals||0);
            if(key==='a') return ms2[jPfx+'_assists']!==undefined?ms2[jPfx+'_assists']:(p._assists||0);
            if(key==='ga_sum') return (ms2[jPfx+'_goals']||0)+(ms2[jPfx+'_assists']||0);
            if(key==='gpk') return ms2[jPfx+'_gpk']||0;
            if(key==='pk') return ms2[jPfx+'_pk']||0;
            if(key==='pkatt') return ms2[jPfx+'_pkatt']||0;
            if(key==='cj') return ms2[jPfx+'_yellow']||0;
            if(key==='cr') return ms2[jPfx+'_red']||0;
            return 0;
          };
          var va = getVal(a, sortKey), vb = getVal(b, sortKey);
          if(sortKey==='name') return sortDir * va.localeCompare(vb);
          return sortDir * (vb - va);
        });

        sortedPp.forEach(function(p,i){
          var inXi=xi.some(function(x){return x.id===p.id;});
          var rowBg=i%2===0?'rgba(255,255,255,.025)':'rgba(255,255,255,.015)';
          var pSlug=p.name?p.name.toLowerCase().split(' ').join('-'):'player';
          var sofaUrl=p.sofaId?'https://www.sofascore.com/player/'+pSlug+'/'+p.sofaId:'https://www.google.com/search?q='+encodeURIComponent(p.name+' '+nom+' Sofascore');
          var manualKey='manual_stats_'+saisonKey((sofaId||afId||'0')+'_'+p.id);
          var ms={}; try{ms=JSON.parse(localStorage.getItem(manualKey)||'{}');}catch(e){}
          var hasManual=ms.league_goals!==undefined||ms.euro_goals!==undefined;
          var isEuro = compMode==='euro';
          var prefix = isEuro ? 'euro' : 'league';

          // Lecture selon la journée sélectionnée
          var jPrefix = prefix; // par défaut global
          if(viewJournee !== 'global') {
            jPrefix = prefix + '_' + viewJournee;
          }

          var g  = ms[jPrefix+'_goals']!==undefined ? ms[jPrefix+'_goals'] : (viewJournee==='global'&&!isEuro?(hasManual?0:(p._goals||0)):0);
          var a  = ms[jPrefix+'_assists']!==undefined ? ms[jPrefix+'_assists'] : (viewJournee==='global'&&!isEuro?(hasManual?0:(p._assists||0)):0);
          var mj = ms[jPrefix+'_apps']!==undefined ? ms[jPrefix+'_apps'] : (viewJournee==='global'&&!isEuro?(p._apps||0):0);
          var tit= ms[jPrefix+'_starts']||0;
          var min= ms[jPrefix+'_minutes']!==undefined ? ms[jPrefix+'_minutes'] : (viewJournee==='global'&&!isEuro?(p._minutes||0):0);
          var minK=min>=1000?(min/1000).toFixed(1)+'k':min||0;

          // Stats gardien
          var ga      = ms[jPrefix+'_ga']||0;
          var sota    = ms[jPrefix+'_sota']||0;
          var saves   = ms[jPrefix+'_saves']||0;
          // Save% calculé : arrêts / (arrêts + buts encaissés)
          var savepct = (saves+ga)>0 ? ((saves/(saves+ga))*100).toFixed(1) : null;
          var cs      = ms[jPrefix+'_cs']||0;
          // CS% calculé : clean sheets / matchs joués
          var cspct   = (mj>0) ? ((cs/mj)*100).toFixed(1) : null;
          var gpk = ms[jPrefix+'_gpk']!==undefined?ms[jPrefix+'_gpk']:0;
          var pk = ms[jPrefix+'_pk']||0;
          var pkatt = ms[jPrefix+'_pkatt']||0;
          var sh = ms[jPrefix+'_shots']||0;
          var sot= ms[jPrefix+'_sot']||0;
          var cj = ms[jPrefix+'_yellow']||0;
          var cr = ms[jPrefix+'_red']||0;
          var fmtS=function(v,col){return '<td style="text-align:center;font-size:12px;font-weight:700;padding:6px 2px;color:'+(v>0?col:'rgba(255,255,255,.2)')+'">'+v+'</td>';};
          html += '<tr data-bench-pid="'+p.id+'" style="background:'+rowBg+';border-left:3px solid '+pc+'55;cursor:pointer;">';
          html += '<td style="padding:6px 4px;text-align:center;"><span class="xi-badge" style="font-size:7px;background:'+pc+'33;color:'+pc+';border-radius:3px;padding:1px 3px;font-weight:800;'+(inXi?'':'visibility:hidden;')+'">XI</span></td>';
          html += '<td style="padding:6px 4px;overflow:hidden;"><a href="'+sofaUrl+'" target="_blank" onclick="event.stopPropagation()" style="font-size:12px;font-weight:700;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-decoration:none;display:block;">'+p.name+'</a></td>';
          html += '<td style="text-align:center;font-size:11px;color:var(--t2);padding:6px 2px;">'+p._age+'</td>';
          html += '<td style="text-align:center;font-size:11px;color:var(--t2);padding:6px 2px;">'+(mj||0)+'</td>';
          html += '<td style="text-align:center;font-size:11px;color:var(--t2);padding:6px 2px;">'+(tit||0)+'</td>';
          html += '<td style="text-align:center;font-size:11px;color:var(--t2);padding:6px 2px;">'+(min?minK:'—')+'</td>';
          if(isGK) {
            html += '<td style="text-align:center;font-size:11px;color:'+(ga>0?'#ef4444':'rgba(255,255,255,.3)')+';padding:6px 2px;">'+(ga||'—')+'</td>';
            html += '<td style="text-align:center;font-size:11px;color:var(--t2);padding:6px 2px;">'+(sota||'—')+'</td>';
            html += '<td style="text-align:center;font-size:11px;color:'+(saves>0?'#1ed760':'rgba(255,255,255,.3)')+';padding:6px 2px;">'+(saves||'—')+'</td>';
            html += '<td style="text-align:center;font-size:11px;color:'+(savepct?'#4d84ff':'rgba(255,255,255,.3)')+';font-weight:700;padding:6px 2px;">'+(savepct?savepct+'%':'—')+'</td>';
            html += '<td style="text-align:center;font-size:11px;color:'+(cs>0?'#1ed760':'rgba(255,255,255,.3)')+';font-weight:700;padding:6px 2px;">'+(cs||'—')+'</td>';
            html += '<td style="text-align:center;font-size:11px;color:'+(cspct?'#a78bfa':'rgba(255,255,255,.3)')+';padding:6px 2px;">'+(cspct?cspct+'%':'—')+'</td>';
          } else {
            html += fmtS(g,'#1ed760');
            html += fmtS(a,'#4d84ff');
            html += '<td style="text-align:center;font-size:11px;font-weight:700;padding:6px 2px;color:'+((g+a)>0?'#7ee0a0':'rgba(255,255,255,.2)')+'">'+((g+a)||'—')+'</td>';
            html += '<td style="text-align:center;font-size:11px;padding:6px 2px;color:'+(gpk>0?'#1ed760':'rgba(255,255,255,.2)')+'">'+(gpk||'—')+'</td>';
            html += '<td style="text-align:center;font-size:11px;padding:6px 2px;color:'+(pk>0?'#f0b020':'rgba(255,255,255,.2)')+'">'+(pk||'—')+'</td>';
            html += '<td style="text-align:center;font-size:11px;padding:6px 2px;color:'+(pkatt>0?'var(--t2)':'rgba(255,255,255,.2)')+'">'+(pkatt||'—')+'</td>';
            html += '<td style="text-align:center;font-size:11px;padding:6px 2px;color:'+(cj>0?'#f0b020':'rgba(255,255,255,.2)')+'">'+( cj||'—')+'</td>';
            html += '<td style="text-align:center;font-size:11px;padding:6px 2px;color:'+(cr>0?'#ef4444':'rgba(255,255,255,.2)')+'">'+( cr||'—')+'</td>';
          }
          if(localStorage.getItem('gones45_admin')==='1'){
            html += '<td style="text-align:center;padding:6px 2px;"><span onclick="event.stopPropagation();editPlayerStats(\''+(sofaId||afId||'0')+'\',\''+p.id+'\',\''+encodeURIComponent(p.name)+'\','+(pos===1?'true':'false')+',\''+uid+'\')" style="cursor:pointer;font-size:13px;opacity:.6;" title="Editer les stats">✏️</span></td>';
          } else {
            html += '<td></td>';
          }
          html += '</tr>';
        });
        html += '</tbody></table>';
        html += '</div>';
        html += '</div>';
      }
      } // fin if(!terrainOnly) pour le tableau
    });

    html += '</div>';
    el.innerHTML = html;

    // Activer le paste global pour la zone screenshot
    setupFbrefPaste(uid, nom);

    // Mettre à jour le hint du mode import
    var modeBtn2 = document.getElementById('fbref-mode-'+uid);
    var compBtn2 = document.getElementById('fbref-comp-'+uid);
    var hintEl = document.getElementById('fbref-mode-hint-'+uid);
    function updateHint() {
      if(!hintEl||!modeBtn2||!compBtn2) return;
      var c = compBtn2.dataset.comp==='euro'?'Europe':'Championnat';
      var m = modeBtn2.dataset.mode==='add'?'journée par journée':'saison complète';
      hintEl.textContent = c+' · '+m;
    }
    if(modeBtn2) modeBtn2.addEventListener('click', updateHint);
    if(compBtn2) compBtn2.addEventListener('click', updateHint);

    var tip=document.getElementById('fd-tip-'+uid);
    var playerMap={};
    squad.forEach(function(p){playerMap[p.id]=p;});
    var selectedXiId=null;

    function statRow(l,v){return '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);"><span style="font-size:10px;color:var(--t3);">'+l+'</span><span style="font-size:11px;font-weight:700;color:var(--t1);">'+v+'</span></div>';}

    function showTip(p,msg){
      var pc=posColors[p._type];
      var rCol=p._rating?(parseFloat(p._rating)>=7?'#1ed760':parseFloat(p._rating)>=6?'#f0b020':'#ef9a9a'):'var(--t3)';
      var sofaUrl=p.sofaId?'https://www.sofascore.com/player/'+p.sofaId:'https://www.google.com/search?q='+encodeURIComponent(p.name+' '+nom+' Sofascore');
      var val=p.marketValue>=1000000?(p.marketValue/1000000).toFixed(0)+'M€':'—';
      var minsK=p._minutes>=1000?(p._minutes/1000).toFixed(1)+"k'":p._minutes?""+p._minutes+"'":'—';
      var t='<div style="text-align:center;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,.07);">';
      t+='<div style="width:36px;height:36px;border-radius:50%;background:'+pc+'33;border:2px solid '+pc+';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:'+pc+';margin:0 auto 5px;">'+posNames[p._type]+'</div>';
      t+='<a href="'+sofaUrl+'" target="_blank" style="font-size:12px;font-weight:800;color:#fff;text-decoration:none;display:block;line-height:1.2;" onclick="event.stopPropagation()">'+p.name+'<span style="font-size:9px;color:#4d84ff;"> ↗</span></a>';
      t+='</div>';
      if(p._rating) t+=statRow('Note','<span style="color:'+rCol+';">'+p._rating+'</span>');
      t+=statRow('Buts','<span style="color:'+(p._goals>0?'#1ed760':'var(--t1)')+';">'+p._goals+'</span>');
      t+=statRow('Passes','<span style="color:'+(p._assists>0?'#4d84ff':'var(--t1)')+';">'+p._assists+'</span>');
      if(p._minutes) t+=statRow('Min','<span style="color:var(--t2);">'+minsK+'</span>');
      t+=statRow('Âge',p._age+' ans');
      t+=statRow('Nationalité',p.nationality||'—');
      if(p.number) t+=statRow('Numéro','#'+p.number);
      if(val!=='—') t+=statRow('Valeur','<span style="color:#a78bfa;">'+val+'</span>');
      if(msg) t+='<div style="margin-top:8px;font-size:10px;color:#4d84ff;font-weight:700;text-align:center;">'+msg+'</div>';
      if(!tip) return;
      tip.innerHTML=t; tip.style.display='flex'; tip.style.flexDirection='column';
    }

    function highlightSelected(){
      el.querySelectorAll('.fd-player-card[data-uid="'+uid+'"]').forEach(function(c){
        var cid=parseInt(c.dataset.pid); var circle=c.querySelector('div');
        if(circle) circle.style.boxShadow=cid===selectedXiId?'0 0 0 3px #fff,0 0 12px rgba(255,255,255,.3)':'';
      });
    }

    function rebuildRow(pos){
      var rowEl=el.querySelector('[data-terrain-row="'+pos+'"]');
      if(!rowEl) return; rowEl.innerHTML='';
      xi.filter(function(p){return p._type===pos;}).forEach(function(p){
        var pc=posColors[p._type];
        var shortName=p.shortName?p.shortName.split(' ').pop():p.name?p.name.split(' ').pop():'?';
        var sub=p._rating?p._rating:p._age+'a';
        var subCol=p._rating?(parseFloat(p._rating)>=7?'#1ed760':parseFloat(p._rating)>=6?'#f0b020':'#ef9a9a'):'rgba(255,255,255,.5)';
        var rp=xi.filter(function(x){return x._type===pos;}); var cs=rp.length>=4?'32px':'38px'; var fs=rp.length>=4?'10px':'11px'; var ts=rp.length>=4?'9px':'10px';
        var div=document.createElement('div');
        div.className='fd-player-card'; div.dataset.uid=uid; div.dataset.pid=p.id;
        div.style.cssText='display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;max-width:'+(rp.length>=4?'22%':'25%')+';';
        div.innerHTML='<div style="width:'+cs+';height:'+cs+';border-radius:50%;background:'+pc+'33;border:2px solid '+pc+';display:flex;align-items:center;justify-content:center;font-size:'+fs+';font-weight:800;color:'+pc+';box-shadow:0 2px 8px rgba(0,0,0,.4);">'+posNames[p._type].charAt(0)+'</div>'
          +'<div style="background:rgba(0,0,0,.75);border-radius:4px;padding:1px 4px;font-size:'+ts+';font-weight:700;color:#fff;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;text-align:center;">'+shortName+'</div>'
          +'<div style="font-size:8px;font-weight:700;color:'+subCol+';">'+sub+'</div>';
        rowEl.appendChild(div); attachXiCard(div);
      });
      refreshBadges();
    }

    function refreshBadges(){
      el.querySelectorAll('[data-bench-pid]').forEach(function(row){
        var pid=parseInt(row.getAttribute('data-bench-pid'));
        var badge=row.querySelector('.xi-badge');
        var inXiNow=xi.some(function(x){return x.id===pid;});
        if(badge) badge.style.display=inXiNow?'inline':'none';
      });
    }

    function attachXiCard(card){
      var pid=parseInt(card.dataset.pid); var p=playerMap[pid]; if(!p) return;
      card.addEventListener('click',function(e){
        e.stopPropagation();
        selectedXiId=selectedXiId===pid?null:pid;
        highlightSelected();
        showTip(p,selectedXiId?'🔄 Clique remplaçant (même poste)':'');
      });
      card.addEventListener('mouseenter',function(){showTip(p,selectedXiId?'🔄 Clique remplaçant':'');});
    }

    el.querySelectorAll('.fd-player-card[data-uid="'+uid+'"]').forEach(function(card){attachXiCard(card);});

    el.querySelectorAll('[data-bench-pid]').forEach(function(row){
      var pid=parseInt(row.getAttribute('data-bench-pid')); var p=playerMap[pid]; if(!p) return;
      row.addEventListener('click',function(e){
        e.stopPropagation();
        if(selectedXiId){
          var xiPlayer=playerMap[selectedXiId];
          if(xiPlayer&&xiPlayer._type===p._type){
            xi=xi.filter(function(x){return x.id!==selectedXiId;});
            xi.push(p); var pos=p._type; selectedXiId=null;
            rebuildRow(pos); showTip(p,'✅ Swap effectué !');
          } else { showTip(p,'⚠️ Même poste requis'); }
        } else {
          var sofaUrl=p.sofaId?'https://www.sofascore.com/player/'+p.sofaId:'https://www.google.com/search?q='+encodeURIComponent(p.name+' '+nom+' Sofascore');
          window.open(sofaUrl,'_blank');
        }
      });
      if(tip) row.addEventListener('mouseenter',function(){showTip(p,selectedXiId?'🔄 Clique pour swapper':'↗ Clic → Sofascore');});
    });

    document.addEventListener('click',function(){tip.style.display='none';selectedXiId=null;highlightSelected();});

  } catch(e) {
    el.innerHTML='<div style="color:#ff4545;font-size:10px;text-align:center;padding:8px;">Erreur : '+e.message+'</div>';
  }
}

function renderProchainMatch(label, adversaire, date, lieu, sport) {
  var ls = 'display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(77,132,255,.06);border:1px solid rgba(77,132,255,.2);border-radius:8px;';
  var html = '<div style="'+ls+'">';
  html += '<div style="font-size:20px;">'+sport+'</div>';
  html += '<div style="flex:1;">';
  html += '<div style="font-size:12px;font-weight:800;color:var(--t1);">'+label+' vs '+adversaire+'</div>';
  if(date) html += '<div style="font-size:10px;color:var(--t3);">📅 '+date+'</div>';
  if(lieu) html += '<div style="font-size:10px;color:var(--t3);">🏟️ '+lieu+'</div>';
  html += '</div></div>';
  return html;
}

async function loadNhlSaisons(el, nom) {
  var teamInfo = NHL_TEAMS[nom];
  if(!teamInfo) {
    el.innerHTML = '<div style="color:var(--t3);text-align:center;padding:20px;">Équipe NHL non reconnue.</div>';
    return;
  }
  el.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:20px;color:var(--t3);"><div style="width:14px;height:14px;border:2px solid rgba(77,132,255,.2);border-top-color:#4d84ff;border-radius:50%;animation:spin .8s linear infinite;"></div>Chargement NHL...</div>';

  try {
    var [standResp, schedResp] = await Promise.all([
      fetch('https://fd-proxy.touraine-antoine.workers.dev?key=nhl&path=/v1/standings/now&host=nhl'),
      fetch('https://fd-proxy.touraine-antoine.workers.dev?key=nhl&path=/v1/club-schedule-season/'+teamInfo.abbr+'/now&host=nhl')
    ]);
    var standData = await standResp.json();
    var schedData = await schedResp.json();

    var team = (standData.standings||[]).find(function(t){ return (t.teamAbbrev&&t.teamAbbrev.default)===teamInfo.abbr; });
    var allGames = (schedData.games||[]).filter(function(g){ return g.gameState==='OFF'||g.gameState==='FINAL'; });
    var last5 = allGames.slice(-5).reverse();

    var html = '<div style="padding:4px 0;">';

    // Classement
    if(team) {
      var pts=team.points||0, w=team.wins||0, l=team.losses||0, otl=team.otLosses||0;
      var gf=team.goalFor||0, ga=team.goalAgainst||0;
      html += '<div class="cwrap" style="margin-bottom:10px;">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">🏒 Saison 2025-2026</div>';
      html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">';
      [{l:'Points',v:pts,c:'#4d84ff'},{l:'Victoires',v:w,c:'#1ed760'},{l:l+(otl?'+'+otl+' OT':''),v:'Défaites',c:'#ff4545'},{l:'Buts +',v:gf,c:'#f0b020'},{l:'Buts -',v:ga,c:'#ff7b54'},{l:'Diff.',v:(gf-ga>0?'+':'')+(gf-ga),c:gf>=ga?'#1ed760':'#ff4545'}].forEach(function(s){
        html += '<div style="text-align:center;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px 4px;">';
        html += '<div style="font-size:18px;font-weight:800;color:'+s.c+';">'+(s.v==='Défaites'?s.l:s.v)+'</div>';
        html += '<div style="font-size:8px;color:var(--t3);">'+(s.v==='Défaites'?'Défaites':s.l)+'</div>';
        html += '</div>';
      });
      html += '</div></div>';
    }

    // Forme récente + Over/Under
    if(last5.length) {
      html += '<div class="cwrap" style="margin-bottom:10px;">';
      // Filtre Global/Dom/Ext NHL
      html += '<div style="display:flex;gap:6px;margin-bottom:10px;">';
      ['global','dom','ext'].forEach(function(f){
        var lbl=f==='global'?'🌐 Global':f==='dom'?'🏠 Dom':'🚌 Ext';
        var isOn=f===window._nhlFilter;
        html += '<button onclick="_nhlFilter=\''+f+'\';loadTeamSaisons();" style="flex:1;padding:6px 4px;border-radius:6px;border:1px solid rgba(255,255,255,'+(isOn?'.3':'.08')+');background:rgba(255,255,255,'+(isOn?'.12':'.04')+');color:'+(isOn?'var(--t1)':'var(--t3)')+';font-size:10px;font-weight:'+(isOn?'700':'400')+';cursor:pointer;">'+lbl+'</button>';
      });
      html += '</div>';
      // Filtrer les matchs selon dom/ext AVANT les calculs
      if(window._nhlFilter==='dom') allGames=allGames.filter(function(g){return g.homeTeam&&g.homeTeam.abbrev===teamInfo.abbr;});
      else if(window._nhlFilter==='ext') allGames=allGames.filter(function(g){return g.awayTeam&&g.awayTeam.abbrev===teamInfo.abbr;});
      // Filtre saison régulière / playoffs
      if(window._nhlTypeFilter==='reg') allGames=allGames.filter(function(g){return g.gameType===2;});
      else if(window._nhlTypeFilter==='playoffs') allGames=allGames.filter(function(g){return g.gameType===3;});

      // Stats Over/Under sur les matchs filtrés
      var over55=0, over65=0, over75=0, bts5=0, n=allGames.length;
      var over45nhl=0;
      allGames.forEach(function(g){
        var hs=g.homeTeam&&g.homeTeam.score||0, as2=g.awayTeam&&g.awayTeam.score||0;
        var tot=hs+as2;
        if(tot>4.5) over45nhl++;
        if(tot>5.5) over55++;
        if(tot>6.5) over65++;
        if(tot>7.5) over75++;
        if(hs>0&&as2>0) bts5++;
      });
      // Boutons Saison régulière / Playoffs
      html += '<div style="display:flex;gap:6px;margin-bottom:10px;">';
      [{k:'all',l:'Tout'},{k:'reg',l:'Saison rég.'},{k:'playoffs',l:'Playoffs'}].forEach(function(f){
        var isOn=f.k===(window._nhlTypeFilter||'all');
        html += '<button onclick="_nhlTypeFilter=\''+f.k+'\';loadTeamSaisons();" style="flex:1;padding:5px 4px;border-radius:6px;border:1px solid rgba(255,255,255,'+(isOn?'.3':'.08')+');background:rgba(255,255,255,'+(isOn?'.12':'.04')+');color:'+(isOn?'#f0b020':'var(--t3)')+';font-size:9px;font-weight:'+(isOn?'700':'400')+';cursor:pointer;">'+f.l+'</button>';
      });
      html += '</div>';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">Forme récente</div>';
      html += '<div style="display:flex;gap:5px;margin-bottom:12px;">';
      last5.forEach(function(g){
        var isDom = g.homeTeam&&g.homeTeam.abbrev===teamInfo.abbr;
        var ts = isDom?(g.homeTeam.score||0):(g.awayTeam.score||0);
        var os = isDom?(g.awayTeam.score||0):(g.homeTeam.score||0);
        var opp = isDom?(g.awayTeam&&g.awayTeam.abbrev||'?'):(g.homeTeam&&g.homeTeam.abbrev||'?');
        var won = ts>os; var col = won?'#1ed760':'#ff4545';
        var d2 = new Date(g.gameDate);
        var ds = d2.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
        var total = ts+os;
        var cKey='c_'+Math.random().toString(36).substr(2,6); _usMatchCache[cKey]={sport:'🏒',h:isDom?(teamInfo.abbr||nom):opp,a:isDom?opp:(teamInfo.abbr||nom),hs:isDom?ts:os,as:isDom?os:ts,d:ds};
        html += '<div onclick="_callUS(\''+cKey+'\')" style="flex:1;text-align:center;background:var(--s1);border-radius:10px;padding:7px 3px;border-top:3px solid '+col+';border:1px solid rgba(255,255,255,.06);cursor:pointer;">';
        html += '<div style="font-size:10px;">'+(isDom?'🏠':'🚌')+'</div>';
        html += '<div style="font-size:16px;font-weight:800;color:'+col+';">'+ts+'-'+os+'</div>';
        html += '<div style="font-size:9px;color:var(--t2);">'+opp+'</div>';
        html += '<div style="font-size:8px;color:var(--t3);">'+ds+'</div>';
        if(total>5.5) html += '<div style="font-size:8px;color:#f0b020;">O5.5</div>';
        html += '</div>';
      });
      html += '</div>';

      // Calcul Under
      var under55=0, under65=0, under75=0;
      allGames.forEach(function(g){
        var tot=(g.homeTeam.score||0)+(g.awayTeam.score||0);
        if(tot<=5.5) under55++; if(tot<=6.5) under65++; if(tot<=7.5) under75++;
      });

      // Sélecteur + barres Over/Under hockey
      if(n>0) {
        var wins=0,losses=0; allGames.forEach(function(g){var id=g.homeTeam&&g.homeTeam.abbrev===teamInfo.abbr;var ts2=id?(g.homeTeam.score||0):(g.awayTeam.score||0);var os2=id?(g.awayTeam.score||0):(g.homeTeam.score||0);if(ts2>os2)wins++;else losses++;});
        var NHL_STATS = [
          {key:'O4.5', label:'Over 4.5', v:Math.round(over45nhl/n*100)||0, color:'#4d84ff'},
          {key:'O5.5', label:'Over 5.5', v:Math.round(over55/n*100), color:'#1ed760'},
          {key:'O6.5', label:'Over 6.5', v:Math.round(over65/n*100), color:'#f0b020'},
          {key:'O7.5', label:'Over 7.5', v:Math.round(over75/n*100), color:'#ff7b54'},
          {key:'U5.5', label:'Under 5.5', v:Math.round(under55/n*100), color:'#22d3ee'},
          {key:'U6.5', label:'Under 6.5', v:Math.round(under65/n*100), color:'#67e8f9'},
          {key:'U7.5', label:'Under 7.5', v:Math.round(under75/n*100), color:'#a5f3fc'},
          {key:'BTS', label:'Les 2 équipes', v:Math.round(bts5/n*100), color:'#a78bfa'},
          {key:'WIN', label:'Victoire', v:Math.round(wins/n*100), color:'#1ed760'},
          {key:'LOSE', label:'Défaite', v:Math.round(losses/n*100), color:'#ff4545'},
        ];
        if(!window._nhlQuickStats) window._nhlQuickStats = ['O5.5','O6.5','BTS'];

        // Chips sélecteur
        html += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">';
        NHL_STATS.forEach(function(s){
          var isOn = window._nhlQuickStats.indexOf(s.key)>=0;
          html += '<button data-nqs="'+s.key+'" onclick="var a=window._nhlQuickStats,i=a.indexOf(this.dataset.nqs);i>=0?a.splice(i,1):a.push(this.dataset.nqs);loadTeamSaisons();" style="padding:3px 8px;border-radius:10px;border:1px solid rgba(255,255,255,'+(isOn?'.3':'.08')+');background:rgba(255,255,255,'+(isOn?'.12':'.04')+');color:'+(isOn?'var(--t1)':'var(--t3)')+';font-size:9px;font-weight:'+(isOn?'700':'400')+';cursor:pointer;">'+s.key+'</button>';
        });
        html += '</div>';

        var activeNhl = NHL_STATS.filter(function(s){ return window._nhlQuickStats.indexOf(s.key)>=0; });
        html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">Stats saison ('+n+' matchs)</div>';
        activeNhl.forEach(function(o){
          html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">';
          html += '<div style="font-size:10px;color:var(--t2);width:100px;flex-shrink:0;">'+o.label+'</div>';
          html += '<div style="flex:1;height:7px;background:rgba(255,255,255,.06);border-radius:4px;"><div style="height:7px;border-radius:4px;background:'+o.color+';width:'+o.v+'%;"></div></div>';
          html += '<div style="font-size:11px;font-weight:800;color:'+o.color+';width:34px;text-align:right;">'+o.v+'%</div>';
          html += '</div>';
        });
      }
      html += '</div>';

      // Résultats complets
      html += '<div class="cwrap">';
      var nhlMatchOk=0; allGames.forEach(function(g){var idN=g.homeTeam&&g.homeTeam.abbrev===teamInfo.abbr;var tsN=idN?(g.homeTeam.score||0):(g.awayTeam.score||0);var osN=idN?(g.awayTeam.score||0):(g.homeTeam.score||0);var totN=tsN+osN;var cN={'O4.5':totN>4.5,'O5.5':totN>5.5,'O6.5':totN>6.5,'O7.5':totN>7.5,'U5.5':totN<=5.5,'U6.5':totN<=6.5,'U7.5':totN<=7.5,'BTS':g.homeTeam.score>0&&g.awayTeam.score>0,'WIN':tsN>osN,'LOSE':tsN<osN};if((window._nhlQuickStats||['O5.5']).every(function(k){return cN[k]!==undefined?cN[k]:true;}))nhlMatchOk++;});
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;">📅 Résultats ('+n+')</div>';
      html += '<div style="font-size:10px;font-weight:800;color:'+(nhlMatchOk>0?'#1ed760':'#ff4545')+';">✅ '+nhlMatchOk+'/'+n+' — '+(window._nhlQuickStats||['O5.5']).join(' + ')+'</div>';
      html += '</div>';
      html += '<div style="display:flex;flex-direction:column;gap:3px;">';
      allGames.slice().reverse().forEach(function(g){
        var isDom = g.homeTeam&&g.homeTeam.abbrev===teamInfo.abbr;
        var ts=isDom?(g.homeTeam.score||0):(g.awayTeam.score||0);
        var os=isDom?(g.awayTeam.score||0):(g.homeTeam.score||0);
        var hName=g.homeTeam&&(g.homeTeam.name&&g.homeTeam.name.default||g.homeTeam.abbrev)||'?';
        var aName=g.awayTeam&&(g.awayTeam.name&&g.awayTeam.name.default||g.awayTeam.abbrev)||'?';
        var won=ts>os, draw=ts===os;
        var rc=won?'#1ed760':draw?'#f0b020':'#ff4545';
        var total=ts+os;
        var d3=new Date(g.gameDate);
        var ds2=d3.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
        var qs2 = window._quickStats||['O2.5','BTS'];
        var NHL_CHECKS={'O5.5':total>5.5,'O6.5':total>6.5,'O7.5':total>7.5,'U5.5':total<=5.5,'U6.5':total<=6.5,'BTS':ts>0&&os>0};
        var NHL_COLORS={'O5.5':'#1ed760','O6.5':'#f0b020','O7.5':'#ff4545','U5.5':'#22d3ee','U6.5':'#67e8f9','BTS':'#a78bfa'};
        var badges='';
        qs2.forEach(function(k){if(NHL_CHECKS[k])badges+='<span style="color:'+NHL_COLORS[k]+';">'+k+'</span> ';});

        var nKey='n_'+Math.random().toString(36).substr(2,6); _usMatchCache[nKey]={sport:'🏒',h:hName,a:aName,hs:g.homeTeam.score,as:g.awayTeam.score,d:d3.toISOString().split('T')[0]};
        var nqlqs=window._nhlQuickStats||['O5.5','O6.5','BTS'];
        var nhlChk={'O4.5':total>4.5,'O5.5':total>5.5,'O6.5':total>6.5,'O7.5':total>7.5,'U5.5':total<=5.5,'U6.5':total<=6.5,'U7.5':total<=7.5,'BTS':g.homeTeam.score>0&&g.awayTeam.score>0,'WIN':ts>os,'LOSE':ts<os};
        var nhlAllOk=nqlqs.every(function(k){return nhlChk[k]!==undefined?nhlChk[k]:true;});
        var nhlBar=nhlAllOk?'#1ed760':'#ff4545';
        html += '<div onclick="_callUS(\''+nKey+'\')" style="display:grid;grid-template-columns:32px 1fr auto 1fr 50px;gap:4px;align-items:center;padding:5px 8px;background:'+(isDom?'rgba(255,255,255,.04)':'rgba(255,255,255,.02)')+';border-radius:6px;border-left:3px solid '+nhlBar+';cursor:pointer;">';
        html += '<div style="font-size:9px;color:var(--t3);text-align:center;">'+ds2+'</div>';
        html += '<div style="font-size:10px;font-weight:'+(isDom?'800':'400')+';color:'+(isDom?'var(--t1)':'var(--t2)')+';text-align:right;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">'+hName+'</div>';
        html += '<div style="font-size:11px;font-weight:800;color:'+rc+';text-align:center;min-width:40px;">'+g.homeTeam.score+' - '+g.awayTeam.score+'</div>';
        html += '<div style="font-size:10px;font-weight:'+(!isDom?'800':'400')+';color:'+(!isDom?'var(--t1)':'var(--t2)')+';overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">'+aName+'</div>';
        var nhlBadges='';
        var nqs2 = window._nhlQuickStats||['O5.5','O6.5','BTS'];
        var NHL_CHK={'O4.5':total>4.5,'O5.5':total>5.5,'O6.5':total>6.5,'O7.5':total>7.5,'U5.5':total<=5.5,'U6.5':total<=6.5,'U7.5':total<=7.5,'BTS':g.homeTeam.score>0&&g.awayTeam.score>0,'WIN':ts>os,'LOSE':ts<os};
        var NHL_COL={'O4.5':'#4d84ff','O5.5':'#1ed760','O6.5':'#f0b020','O7.5':'#ff7b54','U5.5':'#22d3ee','U6.5':'#67e8f9','U7.5':'#a5f3fc','BTS':'#a78bfa','WIN':'#1ed760','LOSE':'#ff4545'};
        nqs2.forEach(function(k){if(NHL_CHK[k])nhlBadges+='<span style="color:'+NHL_COL[k]+';">'+k+'</span><br>';});
        html += '<div style="font-size:8px;text-align:right;">🏒<br>'+nhlBadges+'</div>';
        html += '</div>';
      });
      html += '</div></div>';
    }

    // Prochain match
    var upcoming = (schedData.games||[]).filter(function(g){ return g.gameState==='FUT'||g.gameState==='PRE'; });
    if(upcoming.length) {
      var next = upcoming[0];
      var isDomNext = next.homeTeam&&next.homeTeam.abbrev===teamInfo.abbr;
      var oppNext = isDomNext ? (next.awayTeam&&next.awayTeam.placeName&&next.awayTeam.placeName.default||next.awayTeam.abbrev||'?') : (next.homeTeam&&next.homeTeam.placeName&&next.homeTeam.placeName.default||next.homeTeam.abbrev||'?');
      var oppAbbr = isDomNext ? (next.awayTeam&&next.awayTeam.abbrev||'?') : (next.homeTeam&&next.homeTeam.abbrev||'?');
      var dNext = new Date(next.startTimeUTC||next.gameDate);
      var dsNext = dNext.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
      var lieu = isDomNext ? (next.venue&&next.venue.default||'') : '@ '+oppNext;

      html += '<div class="cwrap" style="margin-bottom:10px;">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4d84ff;margin-bottom:8px;">📅 Prochain match</div>';
      html += renderProchainMatch(nom, oppNext, dsNext, lieu, '🏒');

      // Forme adversaire depuis les matchs déjà en cache
      var oppGames = (schedData.games||[]).filter(function(g){
        return (g.gameState==='OFF'||g.gameState==='FINAL') &&
               (g.homeTeam&&g.homeTeam.abbrev===oppAbbr || g.awayTeam&&g.awayTeam.abbrev===oppAbbr);
      }).slice(-5);

      if(oppGames.length) {
        var myRecentGames = allGames.slice(-20);
        var uObj2 = state.u.find(function(x){return x.n===nom;})||{};
        html += compareUSTeams(myRecentGames, oppGames, teamInfo.abbr, oppAbbr, nom, oppNext, uObj2.color||'#4d84ff', '🏒');
      }
      html += '</div>';
    }

    html += '</div>';
    el.innerHTML = html;
  } catch(e) {
    el.innerHTML = '<div style="color:#ff4545;text-align:center;padding:20px;">Erreur NHL<br><small>'+e.message+'</small></div>';
  }
}

async function loadMlbSaisons(el, nom) {
  var teamInfo = MLB_TEAMS[nom];
  if(!teamInfo) { el.innerHTML='<div style="color:var(--t3);text-align:center;padding:20px;">Équipe MLB non reconnue.</div>'; return; }
  el.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:20px;color:var(--t3);"><div style="width:14px;height:14px;border:2px solid rgba(77,132,255,.2);border-top-color:#4d84ff;border-radius:50%;animation:spin .8s linear infinite;"></div>Chargement MLB...</div>';

  try {
    var today = new Date().toISOString().split('T')[0];
    var past = new Date(Date.now()-120*24*3600*1000).toISOString().split('T')[0];
    var [r, sr] = await Promise.all([
      fetch('https://fd-proxy.touraine-antoine.workers.dev?key=mlb&path=/api/v1/standings?leagueId=103,104%26season=2026%26hydrate=team,record&host=mlb'),
      fetch('https://fd-proxy.touraine-antoine.workers.dev?key=mlb&path=/api/v1/schedule?teamId='+teamInfo.id+'%26startDate='+past+'%26endDate='+today+'%26sportId=1%26gameType=R&host=mlb')
    ]);
    var d = await r.json();
    var sd = await sr.json();

    var teamRecord = null;
    (d.records||[]).forEach(function(div){ (div.teamRecords||[]).forEach(function(tr){ if(tr.team&&tr.team.id===teamInfo.id) teamRecord=tr; }); });

    var allGames = [];
    (sd.dates||[]).forEach(function(date){ (date.games||[]).forEach(function(g){ if(g.status&&g.status.abstractGameState==='Final') allGames.push(g); }); });
    var last5 = allGames.slice(-5).reverse();
    var n = allGames.length;

    var html = '<div style="padding:4px 0;">';

    // Bilan
    if(teamRecord) {
      var w=teamRecord.wins||0, l=teamRecord.losses||0, pct=teamRecord.winningPercentage||'0';
      var runs = teamRecord.runsScored||0, ra = teamRecord.runsAllowed||0;
      html += '<div class="cwrap" style="margin-bottom:10px;">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">⚾ Saison 2026</div>';
      html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">';
      [{l:'Victoires',v:w,c:'#1ed760'},{l:'Défaites',v:l,c:'#ff4545'},{l:'% victoires',v:pct,c:'#f0b020'}].forEach(function(s){
        html += '<div style="text-align:center;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px 4px;"><div style="font-size:18px;font-weight:800;color:'+s.c+';">'+s.v+'</div><div style="font-size:8px;color:var(--t3);">'+s.l+'</div></div>';
      });
      html += '</div></div>';
    }

    if(last5.length) {
      html += '<div class="cwrap" style="margin-bottom:10px;">';
      // Filtre Global/Dom/Ext MLB — AVANT les calculs
      html += '<div style="display:flex;gap:6px;margin-bottom:10px;">';
      ['global','dom','ext'].forEach(function(f){
        var lbl=f==='global'?'🌐 Global':f==='dom'?'🏠 Dom':'🚌 Ext';
        var isOn=f===window._mlbFilter;
        html += '<button onclick="_mlbFilter=\''+f+'\';loadTeamSaisons();" style="flex:1;padding:6px 4px;border-radius:6px;border:1px solid rgba(255,255,255,'+(isOn?'.3':'.08')+');background:rgba(255,255,255,'+(isOn?'.12':'.04')+');color:'+(isOn?'var(--t1)':'var(--t3)')+';font-size:10px;font-weight:'+(isOn?'700':'400')+';cursor:pointer;">'+lbl+'</button>';
      });
      html += '</div>';
      if(window._mlbFilter==='dom') allGames=allGames.filter(function(g){return g.teams&&g.teams.home&&g.teams.home.team&&g.teams.home.team.id===teamInfo.id;});
      else if(window._mlbFilter==='ext') allGames=allGames.filter(function(g){return g.teams&&g.teams.away&&g.teams.away.team&&g.teams.away.team.id===teamInfo.id;});

      // Over/Under baseball sur matchs filtrés
      var over7=0,over8=0,over9=0,btsMlb=0;
      var over6mlb=0;
      allGames.forEach(function(g){
        var hs=g.teams&&g.teams.home&&g.teams.home.score||0;
        var as2=g.teams&&g.teams.away&&g.teams.away.score||0;
        var tot=hs+as2;
        if(tot>6) over6mlb++; if(tot>7) over7++; if(tot>8) over8++; if(tot>9) over9++;
        if(hs>0&&as2>0) btsMlb++;
      });
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">Forme récente</div>';
      html += '<div style="display:flex;gap:5px;margin-bottom:12px;">';
      last5.forEach(function(g){
        var isDom=g.teams&&g.teams.home&&g.teams.home.team&&g.teams.home.team.id===teamInfo.id;
        var ts=isDom?(g.teams.home.score||0):(g.teams.away.score||0);
        var os=isDom?(g.teams.away.score||0):(g.teams.home.score||0);
        var opp=isDom?(g.teams.away.team&&g.teams.away.team.name||'?'):(g.teams.home.team&&g.teams.home.team.name||'?');
        var oppShort=opp.split(' ').pop().substring(0,5);
        var won=ts>os; var col=won?'#1ed760':'#ff4545';
        var ds=(g.gameDate||'').split('T')[0].substring(5);
        var total=ts+os;
        html += '<div style="flex:1;text-align:center;background:var(--s1);border-radius:10px;padding:7px 3px;border-top:3px solid '+col+';border:1px solid rgba(255,255,255,.06);">';
        html += '<div style="font-size:10px;">'+(isDom?'🏠':'🚌')+'</div>';
        html += '<div style="font-size:16px;font-weight:800;color:'+col+';">'+ts+'-'+os+'</div>';
        html += '<div style="font-size:9px;color:var(--t2);">'+oppShort+'</div>';
        html += '<div style="font-size:8px;color:var(--t3);">'+ds+'</div>';
        if(total>8) html += '<div style="font-size:8px;color:#f0b020;">O8</div>';
        html += '</div>';
      });
      html += '</div>';

      if(n>0) {
        var winsM=0,lossesM=0; allGames.forEach(function(g){var id=g.teams&&g.teams.home&&g.teams.home.team&&g.teams.home.team.id===teamInfo.id;var ts2=id?(g.teams.home.score||0):(g.teams.away.score||0);var os2=id?(g.teams.away.score||0):(g.teams.home.score||0);if(ts2>os2)winsM++;else lossesM++;});
        var under7=0,under8=0,under9=0;
        allGames.forEach(function(g){ var tot=(g.teams.home.score||0)+(g.teams.away.score||0); if(tot<=7)under7++; if(tot<=8)under8++; if(tot<=9)under9++; });
        var MLB_STATS=[
          {key:'O6',label:'Over 6',v:Math.round(over6mlb/n*100)||0,color:'#4d84ff'},
          {key:'O7',label:'Over 7',v:Math.round(over7/n*100),color:'#1ed760'},
          {key:'O8',label:'Over 8',v:Math.round(over8/n*100),color:'#f0b020'},
          {key:'O9',label:'Over 9',v:Math.round(over9/n*100),color:'#ff7b54'},
          {key:'U7',label:'Under 7',v:Math.round(under7/n*100),color:'#22d3ee'},
          {key:'U8',label:'Under 8',v:Math.round(under8/n*100),color:'#67e8f9'},
          {key:'U9',label:'Under 9',v:Math.round(under9/n*100),color:'#a5f3fc'},
          {key:'BTS',label:'Les 2 équipes',v:Math.round(btsMlb/n*100),color:'#a78bfa'},
          {key:'WIN',label:'Victoire',v:Math.round(winsM/n*100),color:'#1ed760'},
          {key:'LOSE',label:'Défaite',v:Math.round(lossesM/n*100),color:'#ff4545'},
        ];
        if(!window._mlbQuickStats) window._mlbQuickStats=['O7','O8','BTS'];
        html += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">';
        MLB_STATS.forEach(function(s){ var isOn=window._mlbQuickStats.indexOf(s.key)>=0; html += '<button data-mqs="'+s.key+'" onclick="var a=window._mlbQuickStats,i=a.indexOf(this.dataset.mqs);i>=0?a.splice(i,1):a.push(this.dataset.mqs);loadTeamSaisons();" style="padding:3px 8px;border-radius:10px;border:1px solid rgba(255,255,255,'+(isOn?'.3':'.08')+');background:rgba(255,255,255,'+(isOn?'.12':'.04')+');color:'+(isOn?'var(--t1)':'var(--t3)')+';font-size:9px;font-weight:'+(isOn?'700':'400')+';cursor:pointer;">'+s.key+'</button>'; });
        html += '</div>';
        MLB_STATS.filter(function(s){return window._mlbQuickStats.indexOf(s.key)>=0;}).forEach(function(o){
          html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">';
          html += '<div style="font-size:10px;color:var(--t2);width:100px;flex-shrink:0;">'+o.label+'</div>';
          html += '<div style="flex:1;height:7px;background:rgba(255,255,255,.06);border-radius:4px;"><div style="height:7px;border-radius:4px;background:'+o.color+';width:'+o.v+'%;"></div></div>';
          html += '<div style="font-size:11px;font-weight:800;color:'+o.color+';width:34px;text-align:right;">'+o.v+'%</div></div>';
        });
      }
      html += '</div>';

      // Résultats complets
      html += '<div class="cwrap">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">📅 Résultats ('+n+' matchs)</div>';
      html += '<div style="display:flex;flex-direction:column;gap:3px;">';
      allGames.slice().reverse().forEach(function(g){
        var isDom=g.teams&&g.teams.home&&g.teams.home.team&&g.teams.home.team.id===teamInfo.id;
        var ts=isDom?(g.teams.home.score||0):(g.teams.away.score||0);
        var os=isDom?(g.teams.away.score||0):(g.teams.home.score||0);
        var hName=g.teams&&g.teams.home&&g.teams.home.team&&g.teams.home.team.name||'?';
        var aName=g.teams&&g.teams.away&&g.teams.away.team&&g.teams.away.team.name||'?';
        var won=ts>os; var rc=won?'#1ed760':'#ff4545';
        var total=ts+os;
        var ds2=(g.gameDate||'').split('T')[0].substring(5);
        var mKey='m_'+Math.random().toString(36).substr(2,6); _usMatchCache[mKey]={sport:'⚾',h:hName,a:aName,hs:g.teams.home.score,as:g.teams.away.score,d:ds2};
        var mqlqs=window._mlbQuickStats||['O7','O8','BTS'];
        var mlbChk={'O6':total>6,'O7':total>7,'O8':total>8,'O9':total>9,'U7':total<=7,'U8':total<=8,'U9':total<=9,'BTS':ts>0&&os>0,'WIN':ts>os,'LOSE':ts<os};
        var mlbAllOk=mqlqs.every(function(k){return mlbChk[k]!==undefined?mlbChk[k]:true;});
        var mlbBar=mlbAllOk?'#1ed760':'#ff4545';
        html += '<div onclick="_callUS(\''+mKey+'\')" style="display:grid;grid-template-columns:32px 1fr auto 1fr 36px;gap:4px;align-items:center;padding:5px 8px;background:'+(isDom?'rgba(255,255,255,.04)':'rgba(255,255,255,.02)')+';border-radius:6px;border-left:3px solid '+mlbBar+';cursor:pointer;">';
        html += '<div style="font-size:9px;color:var(--t3);text-align:center;">'+ds2+'</div>';
        html += '<div style="font-size:10px;font-weight:'+(isDom?'800':'400')+';color:'+(isDom?'var(--t1)':'var(--t2)')+';text-align:right;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">'+hName+'</div>';
        html += '<div style="font-size:11px;font-weight:800;color:'+rc+';text-align:center;min-width:40px;">'+g.teams.home.score+' - '+g.teams.away.score+'</div>';
        html += '<div style="font-size:10px;font-weight:'+(!isDom?'800':'400')+';color:'+(!isDom?'var(--t1)':'var(--t2)')+';overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">'+aName+'</div>';
        html += '<div style="font-size:8px;text-align:right;">⚾<br>'+(total>8?'<span style="color:#f0b020;">O8</span>':'')+'</div>';
        html += '</div>';
      });
      html += '</div></div>';
    }

    // Prochain match MLB
    var futureDates = new Date(Date.now()+14*24*3600*1000).toISOString().split('T')[0];
    try {
      var nr = await fetch('https://fd-proxy.touraine-antoine.workers.dev?key=mlb&path=/api/v1/schedule?teamId='+teamInfo.id+'%26startDate='+today+'%26endDate='+futureDates+'%26sportId=1%26gameType=R&host=mlb');
      var nd = await nr.json();
      var nextGames = [];
      (nd.dates||[]).forEach(function(date){ (date.games||[]).forEach(function(g){ if(g.status&&g.status.abstractGameState!=='Final') nextGames.push(g); }); });

      if(nextGames.length) {
        var ng = nextGames[0];
        var isDomN = ng.teams&&ng.teams.home&&ng.teams.home.team&&ng.teams.home.team.id===teamInfo.id;
        var oppN2 = isDomN ? (ng.teams.away.team&&ng.teams.away.team.name||'?') : (ng.teams.home.team&&ng.teams.home.team.name||'?');
        var oppId2 = isDomN ? (ng.teams.away.team&&ng.teams.away.team.id) : (ng.teams.home.team&&ng.teams.home.team.id);
        var dN2 = new Date(ng.gameDate||'');
        var dsN2 = dN2.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
        var venue2 = ng.venue&&ng.venue.name||'';

        html += '<div class="cwrap" style="margin-bottom:10px;">';
        html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4d84ff;margin-bottom:8px;">📅 Prochain match</div>';
        html += renderProchainMatch(nom, oppN2, dsN2, venue2, '⚾');

        // Forme adversaire
        if(oppId2) {
          try {
            var or2 = await fetch('https://fd-proxy.touraine-antoine.workers.dev?key=mlb&path=/api/v1/schedule?teamId='+oppId2+'%26startDate='+past+'%26endDate='+today+'%26sportId=1%26gameType=R&host=mlb');
            var od2 = await or2.json();
            var oppGames2 = [];
            (od2.dates||[]).forEach(function(date){ (date.games||[]).forEach(function(g){ if(g.status&&g.status.abstractGameState==='Final') oppGames2.push(g); }); });
            oppGames2 = oppGames2.slice(-5).reverse();

            if(oppGames2.length) {
              var uObjM = state.u.find(function(x){return x.n===nom;})||{};
              html += compareUSTeams(allGames.slice(-20), oppGames2, nom, oppN2, nom, oppN2, uObjM.color||'#4d84ff', '⚾');
            }
          } catch(e2){}
        }
        html += '</div>';
      }
    } catch(e3){}

    html += '</div>';
    el.innerHTML = html;
  } catch(e) {
    el.innerHTML = '<div style="color:#ff4545;text-align:center;padding:20px;">Erreur MLB</div>';
  }
}



// ── F1 SAISONS ──
var F1_TEAMS = {
  'Formula 1': true, 'F1': true, 'Formule 1': true,
  'McLaren': true, 'Red Bull': true, 'Ferrari': true,
  'Mercedes': true, 'Aston Martin': true, 'Alpine': true,
  'Williams': true, 'Haas': true, 'Sauber': true, 'Racing Bulls': true,
};
var F1_DRIVERS = {
  'Lando Norris': 'norris', 'Max Verstappen': 'max_verstappen',
  'Charles Leclerc': 'leclerc', 'Carlos Sainz': 'sainz',
  'Lewis Hamilton': 'hamilton', 'George Russell': 'russell',
  'Fernando Alonso': 'alonso', 'Oscar Piastri': 'piastri',
  'Sergio Perez': 'perez', 'Lance Stroll': 'stroll',
};

async function loadF1Saisons(el, nom) {
  el.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:20px;color:var(--t3);"><div style="width:14px;height:14px;border:2px solid rgba(77,132,255,.2);border-top-color:#4d84ff;border-radius:50%;animation:spin .8s linear infinite;"></div>Chargement stats F1...</div>';

  var year = new Date().getFullYear();
  var driverRef = F1_DRIVERS[nom] || null;
  
  var html = '<div style="padding:4px 0;">';
  
  // ── Classement ──
  html += '<div class="cwrap" style="margin-bottom:10px;">';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">🏆 Saison F1 '+year+'</div>';
  
  var links = [
    {label:'🏆 Classement pilotes', url:'https://www.formula1.com/en/results/'+year+'/drivers', col:'#e8002d'},
    {label:'🏗️ Classement constructeurs', url:'https://www.formula1.com/en/results/'+year+'/team', col:'#e8002d'},
    {label:'🏁 Résultats des GP', url:'https://www.formula1.com/en/results/'+year+'/races', col:'#ff7b54'},
    {label:'📅 Calendrier', url:'https://www.formula1.com/en/racing/'+year, col:'#4d84ff'},
    {label:'📺 Highlights YouTube', url:'https://www.youtube.com/@Formula1', col:'#ff0000'},
  ];
  
  if(driverRef) {
    links.unshift({label:'👤 Stats '+nom, url:'https://www.formula1.com/en/drivers/'+driverRef, col:'#f0b020'});
  }
  
  links.forEach(function(l){
    html += '<a href="'+l.url+'" target="_blank" style="display:flex;align-items:center;gap:10px;padding:11px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;margin-bottom:7px;text-decoration:none;">';
    html += '<div style="font-size:13px;font-weight:700;color:'+l.col+';flex:1;">'+l.label+'</div>';
    html += '<div style="font-size:12px;color:var(--t3);">→</div>';
    html += '</a>';
  });
  
  html += '</div></div>';
  el.innerHTML = html;
}


// ── TENNIS SAISONS ──
async function loadTennisSaisons(el, nom) {
  var year = new Date().getFullYear();
  
  // Interface principale Tennis
  el.innerHTML = '<div style="padding:4px 0;">'

    // Recherche joueur
    +'<div class="cwrap" style="margin-bottom:10px;">'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">🎾 Rechercher un joueur</div>'

    // Chips pré-sélection ATP
    +'<div style="font-size:9px;color:#4f5d88;margin-bottom:6px;">ATP</div>'
    +'<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;" id="tennis-atp-chips">'
    +'<div class="t-chip" data-player="Jannik Sinner">Sinner</div>'
    +'<div class="t-chip" data-player="Carlos Alcaraz">Alcaraz</div>'
    +'<div class="t-chip" data-player="Alexander Zverev">Zverev</div>'
    +'<div class="t-chip" data-player="Novak Djokovic">Djokovic</div>'
    +'<div class="t-chip" data-player="Daniil Medvedev">Medvedev</div>'
    +'<div class="t-chip" data-player="Andrey Rublev">Rublev</div>'
    +'<div class="t-chip" data-player="Holger Rune">Rune</div>'
    +'<div class="t-chip" data-player="Taylor Fritz">Fritz</div>'
    +'<div class="t-chip" data-player="Casper Ruud">Ruud</div>'
    +'<div class="t-chip" data-player="Stefanos Tsitsipas">Tsitsipas</div>'
    +'<div class="t-chip" data-player="Hubert Hurkacz">Hurkacz</div>'
    +'<div class="t-chip" data-player="Tommy Paul">T.Paul</div>'
    +'<div class="t-chip" data-player="Benoit Paire">Paire 😂</div>'
    +'</div>'
    +'<div style="font-size:9px;color:#4f5d88;margin-bottom:6px;">WTA</div>'
    +'<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;">'
    +'<div class="t-chip" data-player="Iga Swiatek">Swiatek</div>'
    +'<div class="t-chip" data-player="Aryna Sabalenka">Sabalenka</div>'
    +'<div class="t-chip" data-player="Coco Gauff">Gauff</div>'
    +'<div class="t-chip" data-player="Elena Rybakina">Rybakina</div>'
    +'<div class="t-chip" data-player="Jessica Pegula">Pegula</div>'
    +'<div class="t-chip" data-player="Barbora Krejcikova">Krejcikova</div>'
    +'</div>'

    +'<div style="display:flex;gap:8px;margin-bottom:8px;align-items:center;">'
    +'<div style="font-size:9px;color:#4f5d88;flex-shrink:0;">Année :</div>'
    +'<div style="display:flex;gap:4px;" id="tennis-year-chips">'
    +'<div class="t-chip active" data-year="2026">2026</div>'
    +'<div class="t-chip" data-year="2025">2025</div>'
    +'<div class="t-chip" data-year="2024">2024</div>'
    +'<div class="t-chip" data-year="2023">2023</div>'
    +'</div>'
    +'</div>'
    +'<div style="display:flex;gap:8px;margin-bottom:8px;">'
    +'<input id="tennis-search-input" class="fi" placeholder="Ou tape un nom..." style="flex:1;font-size:12px;">'
    +'<button id="tennis-search-btn" style="padding:8px 14px;border-radius:var(--r6);border:none;background:var(--a);color:#fff;font-size:11px;font-weight:700;cursor:pointer;">🔍</button>'
    +'</div>'
    +'<div id="tennis-player-result"></div>'
    +'</div>'

    // Liens utiles
    +'<div class="cwrap">'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">Liens utiles</div>'
    +'<a href="https://www.atptour.com/en/rankings/singles" target="_blank" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;margin-bottom:6px;text-decoration:none;"><div style="font-size:12px;font-weight:700;color:#f0b020;flex:1;">🏆 Classement ATP</div><div style="color:var(--t3);">→</div></a>'
    +'<a href="https://www.wtatennis.com/rankings/singles" target="_blank" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;margin-bottom:6px;text-decoration:none;"><div style="font-size:12px;font-weight:700;color:#ff7b54;flex:1;">🏆 Classement WTA</div><div style="color:var(--t3);">→</div></a>'
    +'<a href="https://www.tennisabstract.com" target="_blank" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;margin-bottom:6px;text-decoration:none;"><div style="font-size:12px;font-weight:700;color:#4d84ff;flex:1;">📊 Tennis Abstract — Stats avancées</div><div style="color:var(--t3);">→</div></a>'
    +'<a href="https://www.atptour.com/en/tournaments" target="_blank" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;margin-bottom:6px;text-decoration:none;"><div style="font-size:12px;font-weight:700;color:#1ed760;flex:1;">📅 Calendrier ATP</div><div style="color:var(--t3);">→</div></a>'
    +'<a href="https://www.youtube.com/@TennisTV" target="_blank" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;margin-bottom:6px;text-decoration:none;"><div style="font-size:12px;font-weight:700;color:#ff0000;flex:1;">📺 Tennis TV YouTube</div><div style="color:var(--t3);">→</div></a>'
    +'</div>'
    +'</div>';

  // Branche les boutons
  document.getElementById('tennis-search-btn').onclick = function(){
    var q = document.getElementById('tennis-search-input').value.trim();
    if(q) searchTennisPlayer(q);
  };
  document.getElementById('tennis-search-input').onkeydown = function(e){
    if(e.key==='Enter') { var q=this.value.trim(); if(q) searchTennisPlayer(q); }
  };
  // Chips pré-sélection joueur
  document.querySelectorAll('.t-chip[data-player]').forEach(function(chip){
    chip.addEventListener('click', function(){
      document.querySelectorAll('.t-chip[data-player]').forEach(function(c){ c.classList.remove('active'); });
      chip.classList.add('active');
      var player = chip.dataset.player;
      document.getElementById('tennis-search-input').value = player;
      searchTennisPlayer(player);
    });
  });
  // Chips année
  document.querySelectorAll('.t-chip[data-year]').forEach(function(chip){
    chip.addEventListener('click', function(){
      document.querySelectorAll('.t-chip[data-year]').forEach(function(c){ c.classList.remove('active'); });
      chip.classList.add('active');
      _tennisYear = chip.dataset.year;
      // Relancer la recherche si un joueur est déjà affiché
      var inp = document.getElementById('tennis-search-input');
      if(inp && inp.value.trim()) searchTennisPlayer(inp.value.trim());
    });
  });
  // Pré-remplir si c'est un joueur connu
  if(TENNIS_PLAYERS[nom]) {
    document.getElementById('tennis-search-input').value = nom;
    searchTennisPlayer(nom);
  }

  return; // Stop ici — le reste de la fonction est remplacé par les handlers
  var player = TENNIS_PLAYERS[nom] || {id: nom.toLowerCase().replace(/ /g,'-'), atp:true};
  var year2 = year;

  try {
    // Sofascore API pour les stats du joueur
    var searchResp = await fetch('https://api.sofascore.com/api/v1/player/search?query='+encodeURIComponent(nom), {
      headers: {'User-Agent': 'Mozilla/5.0'}
    });
    var searchData = await searchResp.json();
    var playerId = null;
    if(searchData.players && searchData.players.length) {
      playerId = searchData.players[0].id;
    }

    var html = '<div style="padding:4px 0;">';

    // Stats par surface via Tennis Abstract
    var surfaceUrl = 'https://www.tennisabstract.com/cgi-bin/player.cgi?p='+encodeURIComponent(nom)+'&f=A';

    // Stats générales ATP
    if(playerId) {
      var statsResp = await fetch('https://api.sofascore.com/api/v1/player/'+playerId+'/statistics/seasons');
      var statsData = await statsResp.json();
      var currentStats = statsData.statistics && statsData.statistics[0];

      if(currentStats) {
        html += '<div class="cwrap" style="margin-bottom:10px;">';
        html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">🎾 Stats saison '+year+'</div>';
        html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
        
        var wins = currentStats.wins || 0;
        var losses = currentStats.losses || 0;
        var total = wins + losses;
        var pct = total ? Math.round(wins/total*100) : 0;
        
        [
          {l:'Victoires', v:wins, c:'#1ed760'},
          {l:'Défaites', v:losses, c:'#ff4545'},
          {l:'% victoires', v:pct+'%', c:'#f0b020'},
        ].forEach(function(s){
          html += '<div style="text-align:center;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:10px 4px;">';
          html += '<div style="font-size:22px;font-weight:800;color:'+s.c+';">'+s.v+'</div>';
          html += '<div style="font-size:9px;color:var(--t3);margin-top:2px;">'+s.l+'</div>';
          html += '</div>';
        });
        html += '</div></div>';
      }

      // Derniers matchs
      var matchesResp = await fetch('https://api.sofascore.com/api/v1/player/'+playerId+'/events/last/0');
      var matchesData = await matchesResp.json();
      var matches = matchesData.events || [];

      if(matches.length) {
        html += '<div class="cwrap" style="margin-bottom:10px;">';
        html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">Forme récente</div>';
        html += '<div style="display:flex;gap:6px;">';
        matches.slice(0,5).forEach(function(m){
          var isHome = m.homeTeam && m.homeTeam.name === nom;
          var won = (isHome && m.winnerCode===1) || (!isHome && m.winnerCode===2);
          var col = won ? '#1ed760' : '#ff4545';
          var opp = isHome ? (m.awayTeam&&m.awayTeam.name||'?') : (m.homeTeam&&m.homeTeam.name||'?');
          var oppShort = opp.split(' ').pop().substring(0,7);
          var score = m.homeScore&&m.homeScore.current ? m.homeScore.current+'-'+m.awayScore.current : '?';
          var dateStr = m.startTimestamp ? new Date(m.startTimestamp*1000).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}) : '';
          html += '<div style="flex:1;text-align:center;background:var(--s1);border-radius:10px;padding:6px 3px;border-top:3px solid '+col+';border:1px solid rgba(255,255,255,.06);border-top:3px solid '+col+';">';
          html += '<div style="font-size:14px;">🎾</div>';
          html += '<div style="font-size:16px;font-weight:700;color:'+col+';">'+score+'</div>';
          html += '<div style="font-size:9px;color:var(--t2);font-weight:600;">'+oppShort+'</div>';
          html += '<div style="font-size:8px;color:rgba(255,255,255,.25);">'+dateStr+'</div>';
          html += '</div>';
        });
        html += '</div></div>';
      }
    }

    // Stats par surface
    html += '<div class="cwrap" style="margin-bottom:10px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">Stats par surface</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
    var surfaces = [
      {l:'🟠 Terre', k:'clay', c:'#ff7b54'},
      {l:'🔵 Dur', k:'hard', c:'#4d84ff'},
      {l:'🟢 Gazon', k:'grass', c:'#1ed760'},
    ];
    surfaces.forEach(function(s){
      html += '<div style="text-align:center;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:10px 4px;">';
      html += '<div style="font-size:12px;margin-bottom:4px;">'+s.l+'</div>';
      html += '<a href="https://www.tennisabstract.com/cgi-bin/player.cgi?p='+encodeURIComponent(nom)+'&f=A'+s.k+'" target="_blank" style="font-size:10px;color:'+s.c+';text-decoration:none;">Stats →</a>';
      html += '</div>';
    });
    html += '</div></div>';

    // Liens utiles
    html += '<div class="cwrap">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">Liens utiles</div>';
    var links = [
      {l:'🏆 Classement ATP', url:'https://www.atptour.com/en/rankings/singles', c:'#f0b020'},
      {l:'📊 Tennis Abstract', url:'https://www.tennisabstract.com/cgi-bin/player.cgi?p='+encodeURIComponent(nom), c:'#4d84ff'},
      {l:'📅 Calendrier ATP', url:'https://www.atptour.com/en/tournaments', c:'#1ed760'},
      {l:'📺 YouTube Tennis', url:'https://www.youtube.com/@TennisTV', c:'#ff0000'},
    ];
    links.forEach(function(l){
      html += '<a href="'+l.url+'" target="_blank" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;margin-bottom:7px;text-decoration:none;">';
      html += '<div style="font-size:12px;font-weight:700;color:'+l.c+';flex:1;">'+l.l+'</div>';
      html += '<div style="font-size:12px;color:var(--t3);">→</div>';
      html += '</a>';
    });
    html += '</div>';

    html += '</div>';
    el.innerHTML = html;

  } catch(e) {
    // Fallback si Sofascore bloque
    var html = '<div style="padding:4px 0;">';
    html += '<div class="cwrap">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">🎾 '+nom+'</div>';
    var links = [
      {l:'🏆 Classement ATP', url:'https://www.atptour.com/en/rankings/singles', c:'#f0b020'},
      {l:'📊 Stats Tennis Abstract', url:'https://www.tennisabstract.com/cgi-bin/player.cgi?p='+encodeURIComponent(nom), c:'#4d84ff'},
      {l:'📺 Résultats Flashscore', url:'https://www.flashscore.fr/joueur/tennis/'+nom.toLowerCase().replace(/ /g,'-')+'/', c:'#ff7b54'},
      {l:'📅 Calendrier ATP', url:'https://www.atptour.com/en/tournaments', c:'#1ed760'},
    ];
    links.forEach(function(l){
      html += '<a href="'+l.url+'" target="_blank" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;margin-bottom:7px;text-decoration:none;">';
      html += '<div style="font-size:12px;font-weight:700;color:'+l.c+';flex:1;">'+l.l+'</div>';
      html += '<div style="font-size:12px;color:var(--t3);">→</div>';
      html += '</a>';
    });
    html += '</div></div>';
    el.innerHTML = html;
  }
}


async function searchTennisPlayer(nom) {
  var res = document.getElementById('tennis-player-result');
  if(!res) return;
  res.innerHTML = '<div style="display:flex;align-items:center;gap:8px;color:var(--t3);font-size:11px;padding:8px 0;"><div style="width:12px;height:12px;border:2px solid rgba(77,132,255,.2);border-top-color:#4d84ff;border-radius:50%;animation:spin .8s linear infinite;flex-shrink:0;"></div>Recherche...</div>';

  var groqKey = getGeminiKey();
  var tavilyKey = getTavilyKey();
  var yr = (typeof _tennisYear !== 'undefined' ? _tennisYear : '2026');
  var taUrl = 'https://www.tennisabstract.com/cgi-bin/player.cgi?p=' + encodeURIComponent(nom.replace(/ /g, '+')) + '&f=A&sdf=' + yr + '0101&sdl=' + yr + '1231';
  var html = '';

  if(!tavilyKey) {
    res.innerHTML = '<div style="color:#ff4545;font-size:11px;padding:10px;">Cle Tavily requise dans Outils</div>';
    return;
  }

  try {
    // 1 recherche Tavily ciblée
    var raw = await searchTavily('"' + nom + '" tennis ' + yr + ' stats first serve percentage second serve aces double faults break points saved converted tiebreaks won matches wins losses');
    if(!raw) throw new Error('Aucun resultat Tavily');

    var resume = raw.substring(0, 400);
    var stats = {g: null, t: null, h: null, gr: null, s1: null, s2sets: null, brk: null, brks: null, aces: null, tb: null, jeux: null};

    // Groq extrait les chiffres + traduit
    if(groqKey) {
      var prompt = 'Donnees sur ' + nom + ' saison ' + yr + ': ' + raw.substring(0, 800) + ' Extrait UNIQUEMENT ces stats si presentes. Reponds: RESUME|||{"matchs":null,"victoires":null,"defaites":null,"pct_1er_service":null,"pts_1er_service":null,"pct_2e_service":null,"pts_2e_service":null,"aces":null,"doubles_fautes":null,"brk_sauves_n":null,"brk_sauves_total":null,"brk_sauves_pct":null,"brk_conv_n":null,"brk_conv_total":null,"brk_conv_pct":null,"tiebreaks_gagnes":null,"tiebreaks_joues":null} RESUME=1 phrase francais. Valeurs: matchs/victoires/defaites=entier, pourcentages=40-85, aces=1-20, df=0-8, breaks=entiers. Null si absent.' ;

      var r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + groqKey},
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{role: 'user', content: prompt}],
          max_tokens: 300,
          temperature: 0
        })
      });
      var d = await r.json();
      var reply = d.choices[0].message.content.trim();

      var sep = reply.indexOf('|||');
      if(sep >= 0) {
        resume = reply.substring(0, sep).trim();
        try {
          var jm = reply.substring(sep + 3).match(/\{[\s\S]*\}/);
          if(jm) {
            var parsed = JSON.parse(jm[0]);
            // Valider chaque valeur — rejeter si > 100 pour les %
            Object.keys(parsed).forEach(function(k) {
              var v = parseFloat(parsed[k]);
              if(isNaN(v)) { stats[k] = null; return; }
              if(k !== 'aces' && k !== 'jeux' && v > 100) { stats[k] = null; return; }
              stats[k] = v;
            });
          }
        } catch(je) {}
      } else {
        resume = reply.substring(0, 300);
      }
    }

    // ── Resume ──
    html += '<div class="cwrap" style="margin-bottom:8px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:6px;">' + nom + ' — ' + yr + '</div>';
    html += '<div style="font-size:11px;color:var(--t1);line-height:1.7;">' + resume + '</div>';
    html += '</div>';

  } catch(e) {
    html += '<div style="color:var(--t3);font-size:11px;padding:10px;text-align:center;">Donnees non disponibles — consulte Tennis Abstract directement.</div>';
  }

  // ── Avertissement ──
  html += '<div style="display:flex;align-items:center;gap:8px;background:rgba(240,176,32,.08);border:1px solid rgba(240,176,32,.25);border-radius:8px;padding:8px 12px;margin-bottom:8px;">';
  html += '<span style="font-size:16px;">⚠️</span>';
  html += '<div style="font-size:10px;color:#f0b020;">Stats issues du web. Verifie sur Tennis Abstract avant de parier !</div>';
  html += '</div>';

  // ── Boutons ──
  html += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;">';
  html += '<a href="' + taUrl + '" target="_blank" style="flex:1;min-width:80px;padding:8px 4px;background:rgba(77,132,255,.1);border:1px solid rgba(77,132,255,.3);border-radius:6px;color:#4d84ff;font-size:9px;font-weight:700;text-decoration:none;text-align:center;">📊 Tennis Abstract</a>';
  html += '<a href="https://www.atptour.com/en/players/' + nom.toLowerCase().replace(/ /g, '-') + '/overview" target="_blank" style="flex:1;min-width:80px;padding:8px 4px;background:rgba(240,176,32,.1);border:1px solid rgba(240,176,32,.3);border-radius:6px;color:#f0b020;font-size:9px;font-weight:700;text-decoration:none;text-align:center;">🎾 ATP Tour</a>';
  html += '<a href="https://www.sofascore.com/search#q=' + encodeURIComponent(nom) + '" target="_blank" style="flex:1;min-width:80px;padding:8px 4px;background:rgba(255,123,84,.1);border:1px solid rgba(255,123,84,.3);border-radius:6px;color:#ff7b54;font-size:9px;font-weight:700;text-decoration:none;text-align:center;">⚡ Sofascore</a>';
  html += '</div>';

  res.innerHTML = html;
}



async function loadNbaSaisons(el, nom) {
  var resolvedKey = resolveNbaTeam(nom);
  var teamInfo = resolvedKey ? NBA_TEAMS[resolvedKey] : null;
  if(teamInfo) nom = resolvedKey; // utiliser le nom complet pour la suite
  if(!teamInfo) {
    el.innerHTML = '<div style="color:var(--t3);text-align:center;padding:20px;">Équipe NBA non reconnue.</div>';
    return;
  }
  el.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:20px;color:var(--t3);"><div style="width:14px;height:14px;border:2px solid rgba(77,132,255,.2);border-top-color:#4d84ff;border-radius:50%;animation:spin .8s linear infinite;"></div>Chargement NBA...</div>';

  try {
    var bdlId = teamInfo.bdlId;
    // balldontlie API — résultats + prochains matchs
    var today2 = new Date().toISOString().split('T')[0];
    var past2 = new Date(Date.now()-90*24*3600*1000).toISOString().split('T')[0];
    var future2 = new Date(Date.now()+14*24*3600*1000).toISOString().split('T')[0];

    // ESPN API — publique sans clé
    var espnId = teamInfo.espnId || bdlId;
    var espnAbbr = teamInfo.abbr.toLowerCase();
    var espnResp = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/'+espnAbbr+'/schedule?season=2026');
    var espnData = await espnResp.json();
    var espnEvents = (espnData.events||[]);

    var allGames = espnEvents.filter(function(e){
      return e.competitions&&e.competitions[0]&&e.competitions[0].status&&e.competitions[0].status.type&&e.competitions[0].status.type.completed;
    }).map(function(e){
      var c = e.competitions[0];
      var home = c.competitors.find(function(t){return t.homeAway==='home';})||c.competitors[0];
      var away = c.competitors.find(function(t){return t.homeAway==='away';})||c.competitors[1];
      var isOurHome = home.team&&(home.team.displayName===nom||home.team.abbreviation===teamInfo.abbr||home.team.id==espnId);
      // ESPN score peut être dans score.value ou score (string)
      var homeScore = parseInt((home.score&&home.score.value)||home.score||0)||0;
      var awayScore = parseInt((away.score&&away.score.value)||away.score||0)||0;
      return {
        home_team:{id:isOurHome?bdlId:0, full_name:home.team&&home.team.displayName||'?', abbreviation:home.team&&home.team.abbreviation||'?'},
        visitor_team:{id:!isOurHome?bdlId:0, full_name:away.team&&away.team.displayName||'?', abbreviation:away.team&&away.team.abbreviation||'?'},
        home_team_score:homeScore,
        visitor_team_score:awayScore,
        date:e.date||'',
        status:'Final'
      };
    });

    var nextGames = espnEvents.filter(function(e){
      return e.competitions&&e.competitions[0]&&e.competitions[0].status&&e.competitions[0].status.type&&!e.competitions[0].status.type.completed;
    }).map(function(e){
      var c = e.competitions[0];
      var home = c.competitors.find(function(t){return t.homeAway==='home';})||c.competitors[0];
      var away = c.competitors.find(function(t){return t.homeAway==='away';})||c.competitors[1];
      return {
        home_team:{id:0, full_name:home.team&&home.team.displayName||'?'},
        visitor_team:{id:0, full_name:away.team&&away.team.displayName||'?'},
        home_team_score:0, visitor_team_score:0,
        date:e.date||'', status:'Scheduled'
      };
    });
    var last5 = allGames.slice(-5).reverse();
    var n = allGames.length;

    var html = '<div style="padding:4px 0;">';

    // Bilan
    var wins=0, losses=0, pts=0, ptsA=0;
    allGames.forEach(function(g){
      var isDom = g.home_team&&g.home_team.id===bdlId;
      var ts = isDom?g.home_team_score:g.visitor_team_score;
      var os = isDom?g.visitor_team_score:g.home_team_score;
      if(ts>os) wins++; else losses++;
      pts+=ts; ptsA+=os;
    });

    if(n>0) {
      html += '<div class="cwrap" style="margin-bottom:10px;">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">🏀 Saison 2025-26</div>';
      html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">';
      [{l:'Victoires',v:wins,c:'#1ed760'},{l:'Défaites',v:losses,c:'#ff4545'},{l:'% victoires',v:Math.round(wins/n*100)+'%',c:'#f0b020'},
       {l:'Pts/match',v:(pts/n).toFixed(1),c:'#4d84ff'},{l:'Pts encaissés',v:(ptsA/n).toFixed(1),c:'#ff7b54'},{l:'Diff.',v:((pts-ptsA)/n>0?'+':'')+((pts-ptsA)/n).toFixed(1),c:pts>=ptsA?'#1ed760':'#ff4545'}
      ].forEach(function(s){
        html += '<div style="text-align:center;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px 4px;">';
        html += '<div style="font-size:16px;font-weight:800;color:'+s.c+';">'+s.v+'</div>';
        html += '<div style="font-size:8px;color:var(--t3);">'+s.l+'</div></div>';
      });
      html += '</div></div>';
    }

    // Forme récente + Over/Under NBA
    if(last5.length) {
      html += '<div class="cwrap" style="margin-bottom:10px;">';
      // Filtre Global/Dom/Ext NBA — AVANT les calculs
      html += '<div style="display:flex;gap:6px;margin-bottom:10px;">';
      ['global','dom','ext'].forEach(function(f){
        var lbl=f==='global'?'🌐 Global':f==='dom'?'🏠 Dom':'🚌 Ext';
        var isOn=f===window._nbaFilter;
        html += '<button onclick="_nbaFilter=\''+f+'\';loadTeamSaisons();" style="flex:1;padding:6px 4px;border-radius:6px;border:1px solid rgba(255,255,255,'+(isOn?'.3':'.08')+');background:rgba(255,255,255,'+(isOn?'.12':'.04')+');color:'+(isOn?'var(--t1)':'var(--t3)')+';font-size:10px;font-weight:'+(isOn?'700':'400')+';cursor:pointer;">'+lbl+'</button>';
      });
      html += '</div>';
      if(window._nbaFilter==='dom') allGames=allGames.filter(function(g){return g.home_team&&g.home_team.id===bdlId;});
      else if(window._nbaFilter==='ext') allGames=allGames.filter(function(g){return g.visitor_team&&g.visitor_team.id===bdlId;});

      var over210=0, over220=0, over230=0;
      var over200=0;
      allGames.forEach(function(g){ var tot=g.home_team_score+g.visitor_team_score; if(tot>200)over200++; if(tot>210) over210++; if(tot>220) over220++; if(tot>230) over230++; });
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">Forme récente</div>';
      html += '<div style="display:flex;gap:5px;margin-bottom:12px;">';
      last5.forEach(function(g){
        var isDom = g.home_team&&g.home_team.id===bdlId;
        var ts=isDom?g.home_team_score:g.visitor_team_score;
        var os=isDom?g.visitor_team_score:g.home_team_score;
        var opp=isDom?(g.visitor_team&&g.visitor_team.abbreviation||'?'):(g.home_team&&g.home_team.abbreviation||'?');
        var won=ts>os; var col=won?'#1ed760':'#ff4545';
        var ds=(g.date||'').split('T')[0].substring(5);
        var tot=ts+os;
        html += '<div style="flex:1;text-align:center;background:var(--s1);border-radius:10px;padding:7px 3px;border-top:3px solid '+col+';border:1px solid rgba(255,255,255,.06);">';
        html += '<div style="font-size:10px;">'+(isDom?'🏠':'🚌')+'</div>';
        html += '<div style="font-size:14px;font-weight:800;color:'+col+';">'+ts+'-'+os+'</div>';
        html += '<div style="font-size:9px;color:var(--t2);">'+opp+'</div>';
        html += '<div style="font-size:8px;color:var(--t3);">'+ds+'</div>';
        if(tot>220) html += '<div style="font-size:8px;color:#f0b020;">O220</div>';
        html += '</div>';
      });
      html += '</div>';

      if(n>0) {
        var under210=0,under220=0,under230=0;
        allGames.forEach(function(g){ var tot=g.home_team_score+g.visitor_team_score; if(tot<=210)under210++; if(tot<=220)under220++; if(tot<=230)under230++; });
        var winsN=0,lossesN=0; allGames.forEach(function(g){var id=g.home_team&&g.home_team.id===bdlId;var ts2=id?g.home_team_score:g.visitor_team_score;var os2=id?g.visitor_team_score:g.home_team_score;if(ts2>os2)winsN++;else lossesN++;});
        var NBA_STATS=[
          {key:'O200',label:'Over 200',v:Math.round(over200/n*100)||0,color:'#4d84ff'},
          {key:'O210',label:'Over 210',v:Math.round(over210/n*100),color:'#1ed760'},
          {key:'O220',label:'Over 220',v:Math.round(over220/n*100),color:'#f0b020'},
          {key:'O230',label:'Over 230',v:Math.round(over230/n*100),color:'#ff7b54'},
          {key:'U210',label:'Under 210',v:Math.round(under210/n*100),color:'#22d3ee'},
          {key:'U220',label:'Under 220',v:Math.round(under220/n*100),color:'#67e8f9'},
          {key:'U230',label:'Under 230',v:Math.round(under230/n*100),color:'#a5f3fc'},
          {key:'WIN',label:'Victoire',v:Math.round(winsN/n*100),color:'#1ed760'},
          {key:'LOSE',label:'Défaite',v:Math.round(lossesN/n*100),color:'#ff4545'},
        ];
        if(!window._nbaQuickStats) window._nbaQuickStats=['O210','O220'];
        html += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">';
        NBA_STATS.forEach(function(s){ var isOn=window._nbaQuickStats.indexOf(s.key)>=0; html += '<button data-bqs="'+s.key+'" onclick="var a=window._nbaQuickStats,i=a.indexOf(this.dataset.bqs);i>=0?a.splice(i,1):a.push(this.dataset.bqs);loadTeamSaisons();" style="padding:3px 8px;border-radius:10px;border:1px solid rgba(255,255,255,'+(isOn?'.3':'.08')+');background:rgba(255,255,255,'+(isOn?'.12':'.04')+');color:'+(isOn?'var(--t1)':'var(--t3)')+';font-size:9px;font-weight:'+(isOn?'700':'400')+';cursor:pointer;">'+s.key+'</button>'; });
        html += '</div>';
        NBA_STATS.filter(function(s){return window._nbaQuickStats.indexOf(s.key)>=0;}).forEach(function(o){
          html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">';
          html += '<div style="font-size:10px;color:var(--t2);width:100px;flex-shrink:0;">'+o.label+'</div>';
          html += '<div style="flex:1;height:7px;background:rgba(255,255,255,.06);border-radius:4px;"><div style="height:7px;border-radius:4px;background:'+o.color+';width:'+o.v+'%;"></div></div>';
          html += '<div style="font-size:11px;font-weight:800;color:'+o.color+';width:34px;text-align:right;">'+o.v+'%</div></div>';
        });
      }
      html += '</div>';

      // Résultats complets
      html += '<div class="cwrap" style="margin-bottom:10px;">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">📅 Résultats ('+n+' matchs)</div>';
      html += '<div style="display:flex;flex-direction:column;gap:3px;">';
      allGames.slice().reverse().forEach(function(g){
        var isDom=g.home_team&&g.home_team.id===bdlId;
        var ts=isDom?g.home_team_score:g.visitor_team_score;
        var os=isDom?g.visitor_team_score:g.home_team_score;
        var hName=g.home_team&&g.home_team.full_name||'?';
        var aName=g.visitor_team&&g.visitor_team.full_name||'?';
        var won=ts>os; var rc=won?'#1ed760':'#ff4545';
        var tot=ts+os;
        var ds=(g.date||'').split('T')[0].substring(5);
        var bKey='b_'+Math.random().toString(36).substr(2,6); _usMatchCache[bKey]={sport:'🏀',h:hName,a:aName,hs:g.home_team_score,as:g.visitor_team_score,d:(g.date||'').split('T')[0]};
        var bqlqs=window._nbaQuickStats||['O210','O220'];
        var nbaChk={'O200':tot>200,'O210':tot>210,'O220':tot>220,'O230':tot>230,'U210':tot<=210,'U220':tot<=220,'U230':tot<=230,'WIN':ts>os,'LOSE':ts<os};
        var nbaAllOk=bqlqs.every(function(k){return nbaChk[k]!==undefined?nbaChk[k]:true;});
        var nbaBar=nbaAllOk?'#1ed760':'#ff4545';
        html += '<div onclick="_callUS(\''+bKey+'\')" style="display:grid;grid-template-columns:32px 1fr auto 1fr 40px;gap:4px;align-items:center;padding:5px 8px;background:'+(isDom?'rgba(255,255,255,.04)':'rgba(255,255,255,.02)')+';border-radius:6px;border-left:3px solid '+nbaBar+';cursor:pointer;">';
        html += '<div style="font-size:9px;color:var(--t3);text-align:center;">'+ds+'</div>';
        html += '<div style="font-size:10px;font-weight:'+(isDom?'800':'400')+';color:'+(isDom?'var(--t1)':'var(--t2)')+';text-align:right;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">'+hName+'</div>';
        html += '<div style="font-size:11px;font-weight:800;color:'+rc+';text-align:center;min-width:50px;">'+g.home_team_score+' - '+g.visitor_team_score+'</div>';
        html += '<div style="font-size:10px;font-weight:'+(!isDom?'800':'400')+';color:'+(!isDom?'var(--t1)':'var(--t2)')+';overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">'+aName+'</div>';
        html += '<div style="font-size:8px;text-align:right;">🏀<br>'+(tot>220?'<span style="color:#f0b020;">O220</span>':'')+'</div>';
        html += '</div>';
      });
      html += '</div></div>';
    }

    // Prochain match NBA
    if(nextGames.length) {
      var ng = nextGames[0];
      var isDomN = ng.home_team&&ng.home_team.id===bdlId;
      var oppN = isDomN ? (ng.visitor_team&&ng.visitor_team.full_name||'?') : (ng.home_team&&ng.home_team.full_name||'?');
      var oppIdN = isDomN ? (ng.visitor_team&&ng.visitor_team.id) : (ng.home_team&&ng.home_team.id);
      var dsN = new Date(ng.date||'').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'});

      html += '<div class="cwrap" style="margin-bottom:10px;">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4d84ff;margin-bottom:8px;">📅 Prochain match</div>';
      html += renderProchainMatch(nom, oppN, dsN, isDomN?'Domicile':'Extérieur', '🏀');

      // Forme adversaire
      if(oppIdN) {
        try {
          // Pas de fetch adversaire NBA — on affiche juste le prochain match
          var oppGames3 = [];
          if(oppGames3.length) {
            html += '<div style="margin-top:8px;">';
            html += '<div style="font-size:9px;color:#4f5d88;margin-bottom:4px;">Forme '+oppN.split(' ').pop()+' :</div>';
            html += renderFormeUS(oppGames3, oppN, 'NBA', false, false);
            var oO220=0;
            oppGames3.forEach(function(g){ if(g.home_team_score+g.visitor_team_score>220) oO220++; });
            html += '<div style="font-size:10px;color:var(--t3);">Over 220 : <span style="color:#f0b020;font-weight:700;">'+Math.round(oO220/oppGames3.length*100)+'%</span></div>';
            html += '</div>';
          }
        } catch(e4){}
      }
      html += '</div>';
    }

    html += '</div>';
    // Bouton effectif (api-sports)
    html += '<div class="cwrap" style="margin-bottom:10px;">';
    html += '<button onclick="loadNbaEffectif(\''+nom.replace(/'/g,"\\'")+'\')" id="nba-eff-btn" style="width:100%;padding:10px;background:rgba(77,132,255,.12);border:1px solid rgba(77,132,255,.3);border-radius:8px;color:#4d84ff;font-size:12px;font-weight:700;cursor:pointer;">👥 Voir l\'effectif & stats joueurs</button>';
    html += '<div id="nba-effectif"></div>';
    html += '</div>';

    el.innerHTML = html;
  } catch(e) {
    el.innerHTML = '<div style="color:#ff4545;text-align:center;padding:20px;">Erreur NBA : '+e.message+'<br><small>Vérifier la connexion</small></div>';
  }
}

/* ══ NBA API-SPORTS (effectif + stats) ══ */
function nbaApiFetch(path) {
  var key = getApiSportsKey();
  if(!key) return Promise.reject(new Error('Clé api-sports manquante (Outils → Clés API)'));
  var url = FD_PROXY + '?key=' + encodeURIComponent(key) + '&host=nba&path=' + encodeURIComponent(path);
  return fetch(url).then(function(r){ return r.json(); });
}

// Saison NBA courante : la saison démarre en octobre. api-sports utilise l'année de début.
// NB : plan FREE api-sports NBA limité aux saisons 2022-2024 → on plafonne à 2024.
function nbaCurrentSeason() {
  var d = new Date();
  var s = (d.getMonth() >= 9) ? d.getFullYear() : d.getFullYear() - 1;
  return Math.min(s, 2024); // plafond free plan
}

async function loadNbaEffectif(nom) {
  var box = document.getElementById('nba-effectif');
  var btn = document.getElementById('nba-eff-btn');
  if(!box) return;
  if(box.innerHTML.trim()) { box.innerHTML = ''; if(btn) btn.style.opacity='1'; return; } // toggle

  var key = resolveNbaTeam(nom);
  var info = key ? NBA_TEAMS[key] : null;
  if(!info || !info.asId) { box.innerHTML = '<div style="color:var(--t3);font-size:11px;text-align:center;padding:10px;">Équipe non mappée</div>'; return; }

  box.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:14px;color:var(--t3);font-size:11px;"><div style="width:12px;height:12px;border:2px solid rgba(77,132,255,.2);border-top-color:#4d84ff;border-radius:50%;animation:spin .8s linear infinite;"></div>Chargement de l\'effectif…</div>';

  try {
    var season = nbaCurrentSeason();
    // Cache localStorage 24h
    var cacheKey = 'nba_squad_' + info.asId + '_' + season;
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem(cacheKey) || 'null'); } catch(e){}
    var players;
    if(cached && cached.ts && (Date.now() - cached.ts < 24*3600*1000) && cached.players) {
      players = cached.players;
    } else {
      var resp = await nbaApiFetch('/players?team=' + info.asId + '&season=' + season);
      players = (resp && resp.response) ? resp.response : [];
      if(players.length) localStorage.setItem(cacheKey, JSON.stringify({ts:Date.now(), players:players}));
    }

    if(!players.length) {
      box.innerHTML = '<div style="color:var(--t3);font-size:11px;text-align:center;padding:10px;">Aucun joueur trouvé pour la saison '+season+'-'+(season+1)+'</div>';
      return;
    }

    var html = '<div style="margin-top:10px;border-top:1px solid var(--b1);padding-top:10px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">👥 Effectif '+season+'-'+(season+1)+' ('+players.length+')</div>';

    players.forEach(function(p){
      var num = (p.leagues && p.leagues.standard && p.leagues.standard.jersey != null) ? p.leagues.standard.jersey : '';
      var pos = (p.leagues && p.leagues.standard && p.leagues.standard.pos) ? p.leagues.standard.pos : '';
      var nameStr = (p.firstname||'') + ' ' + (p.lastname||'');
      html += '<div onclick="loadNbaPlayerStats('+p.id+',\''+(nameStr.replace(/[^a-zA-Z ]/g,'').trim())+'\')" style="display:flex;align-items:center;gap:8px;padding:7px 6px;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer;border-radius:5px;" onmouseover="this.style.background=\'rgba(255,255,255,.03)\'" onmouseout="this.style.background=\'transparent\'">';
      html += '<div style="width:26px;height:26px;border-radius:50%;background:rgba(77,132,255,.12);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#4d84ff;flex-shrink:0;">'+(num!==''?num:'—')+'</div>';
      html += '<div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:600;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+nameStr+'</div>';
      html += '<div style="font-size:9px;color:var(--t3);">'+(pos||'')+(p.height&&p.height.meters?' · '+p.height.meters+'m':'')+'</div></div>';
      html += '<div style="font-size:14px;color:var(--t3);">📊</div>';
      html += '</div>';
      html += '<div id="nba-pstat-'+p.id+'"></div>';
    });
    html += '</div>';
    box.innerHTML = html;
  } catch(e) {
    box.innerHTML = '<div style="color:#ff4545;font-size:11px;text-align:center;padding:10px;">Erreur : '+e.message+'</div>';
  }
}

async function loadNbaPlayerStats(playerId, name) {
  var box = document.getElementById('nba-pstat-' + playerId);
  if(!box) return;
  if(box.innerHTML.trim()) { box.innerHTML = ''; return; } // toggle

  box.innerHTML = '<div style="padding:8px;color:var(--t3);font-size:10px;">⏳ Stats…</div>';
  try {
    var season = nbaCurrentSeason();
    var cacheKey = 'nba_pstat_' + playerId + '_' + season;
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem(cacheKey) || 'null'); } catch(e){}
    var games;
    if(cached && cached.ts && (Date.now() - cached.ts < 24*3600*1000)) {
      games = cached.games;
    } else {
      var resp = await nbaApiFetch('/players/statistics?id=' + playerId + '&season=' + season);
      games = (resp && resp.response) ? resp.response : [];
      localStorage.setItem(cacheKey, JSON.stringify({ts:Date.now(), games:games}));
    }

    if(!games.length) { box.innerHTML = '<div style="padding:8px;color:var(--t3);font-size:10px;">Pas de stats cette saison</div>'; return; }

    // Moyennes
    var n = games.length;
    var sum = {points:0, totReb:0, assists:0, steals:0, blocks:0, min:0, fgp:0, tpp:0, ftp:0};
    var minCount = 0;
    games.forEach(function(g){
      sum.points += g.points||0;
      sum.totReb += g.totReb||0;
      sum.assists += g.assists||0;
      sum.steals += g.steals||0;
      sum.blocks += g.blocks||0;
      sum.fgp += parseFloat(g.fgp)||0;
      sum.tpp += parseFloat(g.tpp)||0;
      sum.ftp += parseFloat(g.ftp)||0;
    });
    var avg = function(x){ return (x/n).toFixed(1); };

    var html = '<div style="background:rgba(77,132,255,.05);border-radius:8px;padding:10px;margin:4px 0 8px 34px;">';
    html += '<div style="font-size:9px;color:var(--t3);margin-bottom:8px;">Moyennes sur '+n+' matchs</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">';
    [['PTS',avg(sum.points),'#4d84ff'],['REB',avg(sum.totReb),'#1ed760'],['PAS',avg(sum.assists),'#f0b020'],['INT',avg(sum.steals),'#a78bfa'],
     ['CTR',avg(sum.blocks),'#22d3ee'],['FG%',(sum.fgp/n).toFixed(1),'#ff7b54'],['3P%',(sum.tpp/n).toFixed(1),'#ec4899'],['LF%',(sum.ftp/n).toFixed(1),'#84cc16']
    ].forEach(function(s){
      html += '<div style="text-align:center;"><div style="font-size:14px;font-weight:800;color:'+s[2]+';">'+s[1]+'</div><div style="font-size:8px;color:var(--t3);">'+s[0]+'</div></div>';
    });
    html += '</div></div>';
    box.innerHTML = html;
  } catch(e) {
    box.innerHTML = '<div style="padding:8px;color:#ff4545;font-size:10px;">Erreur stats</div>';
  }
}

async function loadNflSaisons(el, nom) {
  var teamInfo = NFL_TEAMS[nom];
  if(!teamInfo) { el.innerHTML='<div style="color:var(--t3);text-align:center;padding:20px;">Equipe NFL non reconnue.</div>'; return; }
  el.innerHTML='<div style="padding:20px;color:var(--t3);text-align:center;">🏈 Stats NFL — Saison 2025-2026<br><br><a href="https://www.nfl.com/teams" target="_blank" style="color:#4d84ff;font-size:12px;">Voir sur NFL.com</a><br><br><a href="https://www.pro-football-reference.com/teams/'+teamInfo.id.toLowerCase()+'/2025.htm" target="_blank" style="color:#f0b020;font-size:12px;">Stats sur Pro-Football-Reference</a></div>';
}

async function loadRugbySaisons(el, nom) {
  var isNRL = nom && (
    ['Melbourne Storm','Sydney Roosters','Penrith Panthers','Brisbane Broncos','South Sydney Rabbitohs',
     'Parramatta Eels','Cronulla Sharks','Manly Sea Eagles','Canterbury Bulldogs','New Zealand Warriors',
     'Gold Coast Titans','Canberra Raiders'].indexOf(nom) >= 0
  );

  var lienStyle = 'display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;margin-bottom:6px;text-decoration:none;';
  var labelStyle = 'font-size:12px;font-weight:700;flex:1;';
  var arr = 'color:var(--t3);';

  var html = '<div style="padding:4px 0;">';

  if(isNRL) {
    // ── NRL ──
    html += '<div class="cwrap" style="margin-bottom:10px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">🏉🇦🇺 NRL — ' + nom + '</div>';
    html += '<a href="https://www.nrl.com/draw/" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#f0b020;">📅 Programme NRL</div><div style="'+arr+'">→</div></a>';
    html += '<a href="https://www.nrl.com/ladder/" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#4d84ff;">🏆 Classement NRL</div><div style="'+arr+'">→</div></a>';
    html += '<a href="https://www.nrl.com/stats/" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#1ed760;">📊 Stats NRL</div><div style="'+arr+'">→</div></a>';
    html += '<a href="https://www.foxsports.com.au/nrl" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#ff7b54;">🦊 Fox Sports NRL</div><div style="'+arr+'">→</div></a>';
    html += '<a href="https://www.sofascore.com/rugby-league/australia-nrl" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#a78bfa;">⚡ Sofascore NRL</div><div style="'+arr+'">→</div></a>';
    html += '</div>';
  } else {
    // ── Rugby Union ──
    // Bloc Top 14 / Pro D2
    html += '<div class="cwrap" style="margin-bottom:10px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">🏉 Rugby XV — Saison 2025-26</div>';
    html += '<a href="https://www.lnr.fr/top-14/classement" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#f0b020;">🏆 Classement Top 14</div><div style="'+arr+'">→</div></a>';
    html += '<a href="https://www.lnr.fr/top-14/calendrier-et-resultats" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#4d84ff;">📅 Calendrier Top 14</div><div style="'+arr+'">→</div></a>';
    html += '<a href="https://www.lnr.fr/top-14/stats" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#1ed760;">📊 Stats Top 14</div><div style="'+arr+'">→</div></a>';
    html += '</div>';

    // Bloc Coupes d'Europe
    html += '<div class="cwrap" style="margin-bottom:10px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">🏆 Coupes d\'Europe</div>';
    html += '<a href="https://www.epcrugby.com/champions-cup/fixtures-results/" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#f0b020;">🌍 Champions Cup — Résultats</div><div style="'+arr+'">→</div></a>';
    html += '<a href="https://www.epcrugby.com/champions-cup/standings/" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#4d84ff;">🏆 Champions Cup — Classement</div><div style="'+arr+'">→</div></a>';
    html += '<a href="https://www.epcrugby.com/challenge-cup/fixtures-results/" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#a78bfa;">🥈 Challenge Cup</div><div style="'+arr+'">→</div></a>';
    html += '</div>';

    // Bloc Équipes nationales
    html += '<div class="cwrap" style="margin-bottom:10px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">🌍 Équipes nationales</div>';
    html += '<a href="https://www.sixnationsrugby.com/standings/" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#4d84ff;">6️⃣ Six Nations — Classement</div><div style="'+arr+'">→</div></a>';
    html += '<a href="https://www.world.rugby/rankings/mru" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#f0b020;">🌐 World Rugby Rankings</div><div style="'+arr+'">→</div></a>';
    html += '<a href="https://www.rugbyworldcup.com/2027" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#1ed760;">🏆 Coupe du Monde 2027</div><div style="'+arr+'">→</div></a>';
    html += '</div>';

    // Bloc Stats & Suivi
    html += '<div class="cwrap">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">📊 Stats & Suivi</div>';
    html += '<a href="https://www.sofascore.com/rugby-union" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#ff7b54;">⚡ Sofascore Rugby</div><div style="'+arr+'">→</div></a>';
    html += '<a href="https://www.rugbypass.com/fixtures/" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#a78bfa;">📡 RugbyPass — Matchs en direct</div><div style="'+arr+'">→</div></a>';
    html += '<a href="https://www.espn.com/rugby/" target="_blank" style="'+lienStyle+'"><div style="'+labelStyle+'color:#22d3ee;">🎙 ESPN Rugby</div><div style="'+arr+'">→</div></a>';
    html += '</div>';
  }

  html += '</div>';
  el.innerHTML = html;
}


/* ── NATIONS : afficher/cacher onglet Mondial ── */
var NATIONS_MONDIALES = ['France','Espagne','Allemagne','Angleterre','Brésil','Argentine','Portugal','Pays-Bas','Belgique','Italie','Croatie','Maroc','Sénégal','Colombie','Uruguay','Japon','Suisse','Norvège','Danemark','Mexique','Canada','États-Unis','Australie','Iran','Corée du Sud','Équateur','Autriche','Algérie','Égypte','Qatar','Tunisie','Côte d\'Ivoire','Ouzbékistan','Écosse','Paraguay','Haïti','Afrique du Sud','Cap-Vert','Ghana','Arabie saoudite','Jordanie','Curaçao','Nouvelle-Zélande','Panama','RD Congo','Suède','Ukraine','Turquie','Irak','Bolivie','Suriname'];

function showOngletMondialIfNational(nom) {
  var isNat = NATIONS_MONDIALES.indexOf(nom) >= 0;
  var btn = document.getElementById('itab-mondial');
  if(btn) btn.style.display = isNat ? '' : 'none';
}


function getLiensPerso(nom) {
  var all = JSON.parse(localStorage.getItem('g45_liens_perso')||'{}');
  return all[nom] || [];
}
function saveLiensPerso(nom, liens) {
  var all = JSON.parse(localStorage.getItem('g45_liens_perso')||'{}');
  all[nom] = liens;
  localStorage.setItem('g45_liens_perso', JSON.stringify(all));
  saveToDropbox();
}

function loadLiensEquipe() {
  var el = document.getElementById('ip-liens-equipe');
  if(!el) return;
  var nom = _currentTeam || '';
  var u = (typeof state !== 'undefined' && state.u) ? state.u.find(function(x){return x.n===nom;}) : null;

  var sofaUrl  = (u&&u.link) || (u&&u.sofascore) || SOFASCORE_LINKS[nom] || ('https://www.sofascore.com/search#q='+encodeURIComponent(nom));
  var flashUrl = (u&&u.link2) || (u&&u.flashscore) || FAV_LINKS[nom] || ('https://www.flashscore.fr/recherche/?q='+encodeURIComponent(nom));
  var tmUrl    = 'https://www.transfermarkt.fr/schnellsuche/ergebnis/schnellsuche?query='+encodeURIComponent(nom);
  var fbrefUrl = 'https://fbref.com/fr/search/search.fcgi?search='+encodeURIComponent(nom);
  var wikiUrl  = 'https://fr.wikipedia.org/wiki/'+encodeURIComponent(nom.replace(/ /g,'_'));
  var ytUrl    = 'https://www.youtube.com/results?search_query='+encodeURIComponent(nom+' 2026 highlights');
  var col = u ? u.color : '#4d84ff';
  var liensPerso = getLiensPerso(nom);

  var ls = 'display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;margin-bottom:8px;text-decoration:none;';
  var lsBtn = 'display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;margin-bottom:8px;';

  var html = '<div style="padding:4px 0;">';

  // Header
  html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">';
  html += logoHtml(nom, col, u?u.abbr:nom.substring(0,3), 40);
  html += '<div><div style="font-size:16px;font-weight:800;color:var(--t1);">'+nom+'</div>';
  html += '<div style="font-size:10px;color:var(--t3);">Liens & ressources</div></div>';
  html += '</div>';

  // Liens par défaut
  var DEFAULT_LIENS = [
    {url:sofaUrl,  ico:'⚡', label:'Sofascore',     desc:'Stats live, compos, cotes',    col:'#ff7b54', key:'sofa'},
    {url:flashUrl, ico:'⚡', label:'Flashscore',    desc:'Résultats, cotes, H2H',         col:'#f0b020', key:'flash'},
    {url:fbrefUrl, ico:'📈', label:'FBref',          desc:'Stats avancées xG, passes',    col:'#4d84ff', key:'fbref'},
    {url:tmUrl,    ico:'💰', label:'Transfermarkt',  desc:'Valeurs, transferts, contrats', col:'#1ed760', key:'tm'},
    {url:wikiUrl,  ico:'📖', label:'Wikipedia',      desc:'Histoire, palmarès, stade',    col:'#a78bfa', key:'wiki'},
    {url:ytUrl,    ico:'▶️', label:'YouTube',        desc:'Highlights & résumés',          col:'#ff0000', key:'yt'},
  ];

  // Liens masqués par l'utilisateur
  var hidden = JSON.parse(localStorage.getItem('g45_liens_hidden_'+nom)||'[]');

  // Liens actifs
  var actifs = DEFAULT_LIENS.filter(function(l){ return hidden.indexOf(l.key)<0; });

  if(actifs.length) {
    html += '<div class="cwrap" style="margin-bottom:10px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">Liens</div>';
    actifs.forEach(function(l){
      html += '<div style="'+lsBtn+'">';
      html += '<a href="'+l.url+'" target="_blank" style="display:flex;align-items:center;gap:12px;flex:1;text-decoration:none;">';
      html += '<div style="font-size:20px;">'+l.ico+'</div>';
      html += '<div style="flex:1;"><div style="font-size:13px;font-weight:700;color:'+l.col+';">'+l.label+'</div>';
      html += '<div style="font-size:10px;color:var(--t3);">'+l.desc+'</div></div>';
      html += '<div style="color:var(--t3);">→</div></a>';
      html += '<button onclick="toggleLienHidden(\''+nom+'\',\''+l.key+'\')" style="background:rgba(255,69,69,.1);border:1px solid rgba(255,69,69,.2);border-radius:6px;color:#ff4545;font-size:10px;padding:4px 8px;cursor:pointer;flex-shrink:0;">🗑</button>';
      html += '</div>';
    });
    html += '</div>';
  }

  // Liens perso
  if(liensPerso.length) {
    html += '<div class="cwrap" style="margin-bottom:10px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">⭐ Mes liens</div>';
    liensPerso.forEach(function(l, i){
      html += '<div style="'+lsBtn+'">';
      html += '<a href="'+l.url+'" target="_blank" style="display:flex;align-items:center;gap:12px;flex:1;text-decoration:none;">';
      html += '<div style="font-size:20px;">'+l.ico+'</div>';
      html += '<div style="flex:1;"><div style="font-size:13px;font-weight:700;color:#7aaaff;">'+l.label+'</div>';
      html += '<div style="font-size:10px;color:var(--t3);">'+l.url.substring(0,40)+'...</div></div>';
      html += '<div style="color:var(--t3);">→</div></a>';
      html += '<button onclick="supprimerLienPerso(\''+nom+'\','+i+')" style="background:rgba(255,69,69,.1);border:1px solid rgba(255,69,69,.2);border-radius:6px;color:#ff4545;font-size:10px;padding:4px 8px;cursor:pointer;flex-shrink:0;">🗑</button>';
      html += '</div>';
    });
    html += '</div>';
  }

  // Liens masqués — réactiver
  if(hidden.length) {
    html += '<div class="cwrap" style="margin-bottom:10px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">Liens masqués</div>';
    DEFAULT_LIENS.filter(function(l){return hidden.indexOf(l.key)>=0;}).forEach(function(l){
      html += '<button onclick="toggleLienHidden(\''+nom+'\',\''+l.key+'\')" style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:8px;color:var(--t3);font-size:11px;cursor:pointer;width:100%;margin-bottom:4px;text-align:left;">+ Réafficher '+l.label+'</button>';
    });
    html += '</div>';
  }

  // Ajouter un lien perso
  html += '<div class="cwrap">';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">➕ Ajouter un lien</div>';
  html += '<input id="lien-perso-label" class="fi" placeholder="Nom (ex: Stats officiel)" style="margin-bottom:6px;font-size:12px;">';
  html += '<input id="lien-perso-url" class="fi" placeholder="https://..." style="margin-bottom:6px;font-size:12px;">';
  html += '<div style="display:flex;gap:6px;margin-bottom:6px;">';
  ['⭐','📊','📰','🎥','🔗','🏆','💡','📱'].forEach(function(ico){
    html += '<button onclick="document.getElementById(\'lien-perso-ico\').value=\''+ico+'\';document.querySelectorAll(\'.ico-btn\').forEach(function(b){b.style.opacity=\'.4\'});this.style.opacity=\'1\';" class="ico-btn" style="font-size:18px;background:none;border:none;cursor:pointer;opacity:.4;padding:2px;">'+ico+'</button>';
  });
  html += '</div>';
  html += '<input id="lien-perso-ico" type="hidden" value="⭐">';
  html += '<button onclick="ajouterLienPerso(\''+nom+'\')" style="width:100%;padding:10px;background:rgba(77,132,255,.15);border:1px solid rgba(77,132,255,.3);border-radius:8px;color:#4d84ff;font-size:12px;font-weight:700;cursor:pointer;">➕ Ajouter</button>';
  html += '</div>';

  html += '</div>';
  el.innerHTML = html;
}

function toggleLienHidden(nom, key) {
  var hidden = JSON.parse(localStorage.getItem('g45_liens_hidden_'+nom)||'[]');
  var i = hidden.indexOf(key);
  if(i>=0) hidden.splice(i,1); else hidden.push(key);
  localStorage.setItem('g45_liens_hidden_'+nom, JSON.stringify(hidden));
  loadLiensEquipe();
}

function ajouterLienPerso(nom) {
  var label = (document.getElementById('lien-perso-label')||{}).value||'';
  var url   = (document.getElementById('lien-perso-url')||{}).value||'';
  var ico   = (document.getElementById('lien-perso-ico')||{}).value||'⭐';
  if(!label||!url) { alert('Nom et URL requis'); return; }
  if(url.indexOf('http')<0) url = 'https://'+url;
  var liens = getLiensPerso(nom);
  liens.push({label:label, url:url, ico:ico});
  saveLiensPerso(nom, liens);
  loadLiensEquipe();
}

function supprimerLienPerso(nom, idx) {
  var liens = getLiensPerso(nom);
  liens.splice(idx, 1);
  saveLiensPerso(nom, liens);
  loadLiensEquipe();
}

function loadMondial2026() {
  var el = document.getElementById('ip-mondial');
  if(!el) return;

  var GROUPES = [
    {id:'A', teams:['Mexique','Corée du Sud','Afrique du Sud','Tchéquie']},
    {id:'B', teams:['Canada','Suisse','Qatar','Bosnie-Herzégovine']},
    {id:'C', teams:['Brésil','Maroc','Écosse','Haïti']},
    {id:'D', teams:['États-Unis','Paraguay','Australie','Turquie']},
    {id:'E', teams:['Allemagne','Équateur','Côte d\'Ivoire','Curaçao']},
    {id:'F', teams:['Pays-Bas','Japon','Tunisie','Suède']},
    {id:'G', teams:['Belgique','Iran','Égypte','Nouvelle-Zélande']},
    {id:'H', teams:['Espagne','Uruguay','Cap-Vert','Arabie saoudite']},
    {id:'I', teams:['France','Sénégal','Norvège','Irak']},
    {id:'J', teams:['Argentine','Algérie','Autriche','Jordanie']},
    {id:'K', teams:['Portugal','Colombie','RD Congo','Ouzbékistan']},
    {id:'L', teams:['Angleterre','Croatie','Ghana','Panama']}
  ];

  // Classement par groupe stocké localement
  function getStandings(gid) {
    var s = localStorage.getItem('wc2026_standings_'+gid);
    return s ? JSON.parse(s) : null;
  }
  function getResults(gid) {
    var s = localStorage.getItem('wc2026_results_'+gid);
    return s ? JSON.parse(s) : null;
  }

  var MY_TEAMS = (typeof state !== 'undefined' && state.u) ? state.u.map(function(u){return u.n;}) : [];
  var ls = 'display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;margin-bottom:6px;text-decoration:none;';

  var html = '<div style="padding:4px 0;" id="mondial-main">';

  // Header
  html += '<div style="background:linear-gradient(135deg,rgba(30,119,255,.15),rgba(30,215,96,.1));border:1px solid rgba(77,132,255,.3);border-radius:12px;padding:16px;margin-bottom:14px;text-align:center;">';
  html += '<div style="font-size:22px;">🌍</div>';
  html += '<div style="font-size:16px;font-weight:800;color:var(--t1);">Coupe du Monde 2026</div>';
  html += '<div style="font-size:10px;color:var(--t3);">🇺🇸🇨🇦🇲🇽 USA · Canada · Mexique</div>';
  html += '<div style="font-size:11px;color:#4d84ff;font-weight:700;margin-top:5px;">11 juin — 19 juillet 2026</div>';
  html += '<button onclick="fetchMondialLive()" style="margin-top:10px;padding:6px 14px;background:rgba(77,132,255,.2);border:1px solid rgba(77,132,255,.4);border-radius:6px;color:#4d84ff;font-size:11px;font-weight:700;cursor:pointer;">🔄 Mettre à jour les résultats</button>';
  html += '<div id="mondial-update-status" style="font-size:10px;color:var(--t3);margin-top:4px;"></div>';
  html += '</div>';

  // Matchs France
  html += '<div class="cwrap" style="margin-bottom:10px;border:1px solid rgba(0,100,255,.3);background:rgba(0,85,255,.06);">';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4d84ff;margin-bottom:10px;">🇫🇷 France — Groupe I</div>';
  var fMatchs = [
    {d:'16 juin', h:'21h00', adv:'Sénégal 🇸🇳', lieu:'MetLife, New York'},
    {d:'22 juin', h:'23h00', adv:'Irak 🇮🇶', lieu:'Philadelphia'},
    {d:'26 juin', h:'21h00', adv:'Norvège 🇳🇴', lieu:'Gillette, Boston'}
  ];
  var frResults = getResults('I');
  fMatchs.forEach(function(m, i){
    var score = frResults && frResults[i] ? frResults[i] : null;
    html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);">';
    html += '<div style="font-size:16px;">🇫🇷</div>';
    html += '<div style="flex:1;"><div style="font-size:11px;font-weight:700;color:var(--t1);">France vs '+m.adv+'</div>';
    html += '<div style="font-size:9px;color:var(--t3);">'+m.d+' · '+m.h+' · '+m.lieu+'</div></div>';
    if(score) {
      var col = score.w==='F'?'#1ed760':score.w==='N'?'#f0b020':'#ff4545';
      html += '<div style="font-size:13px;font-weight:800;color:'+col+';">'+score.s+'</div>';
    } else {
      html += '<div style="font-size:9px;color:#4f5d88;">À venir</div>';
    }
    html += '</div>';
  });
  html += '</div>';

  // Les 12 groupes — cliquables
  html += '<div class="cwrap" style="margin-bottom:10px;">';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">🏆 Les 12 Groupes — cliquer pour les résultats</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">';

  GROUPES.forEach(function(g){
    var isFr = g.id === 'I';
    var standings = getStandings(g.id);
    var teams = standings ? standings : g.teams.map(function(t){return {name:t,pts:0,j:0,g:0,n:0,p:0};});
    html += '<div onclick="showGroupDetail(\''+g.id+'\')" style="background:'+(isFr?'rgba(77,132,255,.08)':'rgba(255,255,255,.02)')+';border:1px solid '+(isFr?'rgba(77,132,255,.5)':'rgba(255,255,255,.07)')+';border-radius:8px;padding:8px;cursor:pointer;transition:border-color .2s;" onmouseover="this.style.borderColor=\'rgba(77,132,255,.4)\'" onmouseout="this.style.borderColor=\''+(isFr?'rgba(77,132,255,.5)':'rgba(255,255,255,.07)')+'\'">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">';
    html += '<div style="font-size:9px;font-weight:800;color:'+(isFr?'#4d84ff':'#4f5d88')+';">GROUPE '+g.id+(isFr?' 🇫🇷':'')+'</div>';
    html += '<div style="font-size:9px;color:#4f5d88;">Pts</div></div>';
    teams.forEach(function(t, idx){
      var tName = typeof t === 'string' ? t : t.name;
      var pts = typeof t === 'object' ? t.pts : 0;
      var isMine = MY_TEAMS.indexOf(tName) >= 0;
      var isFrance = tName === 'France';
      var qual = standings && idx < 2;
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:2px 0;">';
      html += '<div style="display:flex;align-items:center;font-size:10px;color:'+(isFrance?'#4d84ff':isMine?'#1ed760':qual?'var(--t1)':'var(--t2)')+';font-weight:'+(isFrance||isMine||qual?'700':'400')+';white-space:nowrap;overflow:hidden;max-width:95px;padding:1px 0;">'+flagImg(tName,13)+(isMine&&!isFrance?'⭐ ':idx<2&&standings?'✅ ':'')+tName+'</div>';
      html += '<div style="font-size:10px;font-weight:700;color:'+(pts>0?'#f0b020':'var(--t3)')+';">'+pts+'</div>';
      html += '</div>';
    });
    html += '</div>';
  });
  html += '</div></div>';

  // Tableau knockout dynamique
  var ROUNDS = [
    {key:'r32',  label:'16e de finale', date:'29 juin – 2 juil.', col:'#4f5d88'},
    {key:'r16',  label:'8e de finale', date:'4 – 7 juillet',     col:'#4d84ff'},
    {key:'qf',   label:'Quarts de finale', date:'9 – 10 juillet', col:'#a78bfa'},
    {key:'sf',   label:'Demi-finales',  date:'14 – 15 juillet',   col:'#f0b020'},
    {key:'f',    label:'🏆 Finale',     date:'19 juillet · MetLife NY', col:'#1ed760'}
  ];
  html += '<div class="cwrap" style="margin-bottom:10px;">';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">🏟️ Tableau knockout</div>';
  ROUNDS.forEach(function(r){
    var matches = JSON.parse(localStorage.getItem('wc2026_ko_'+r.key)||'[]');
    html += '<div style="border:1px solid rgba(255,255,255,.06);border-left:3px solid '+r.col+';border-radius:6px;margin-bottom:6px;overflow:hidden;">';
    html += '<div style="padding:7px 10px;background:rgba(255,255,255,.03);display:flex;align-items:center;justify-content:space-between;">';
    html += '<div><div style="font-size:11px;font-weight:700;color:'+r.col+';">'+r.label+'</div><div style="font-size:9px;color:var(--t3);">'+r.date+'</div></div>';
    html += '<div style="font-size:9px;color:#4f5d88;">'+matches.length+' matchs</div></div>';
    if(matches.length) {
      matches.forEach(function(m){
        var played = m.score !== null;
        var isFrance = m.home==='France'||m.away==='France';
        var bg = isFrance?'rgba(77,132,255,.08)':'rgba(255,255,255,.02)';
        html += '<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:'+bg+';border-top:1px solid rgba(255,255,255,.04);">';
        html += '<div style="flex:1;font-size:10px;font-weight:'+(isFrance?'700':'500')+';color:'+(m.home==='France'?'#4d84ff':'var(--t1)')+';text-align:right;">'+m.home+'</div>';
        if(played){
          var parts = m.score.split(' - ');
          var hw=parseInt(parts[0]),aw=parseInt(parts[1]);
          var hcol=hw>aw?'#1ed760':hw<aw?'#ff4545':'#f0b020';
          var acol=aw>hw?'#1ed760':aw<hw?'#ff4545':'#f0b020';
          html += '<div style="font-size:12px;font-weight:800;min-width:50px;text-align:center;"><span style="color:'+hcol+';">'+hw+'</span><span style="color:var(--t3);"> - </span><span style="color:'+acol+';">'+aw+'</span></div>';
        } else {
          html += '<div style="font-size:9px;color:#4f5d88;min-width:50px;text-align:center;">'+m.date+'</div>';
        }
        html += '<div style="display:flex;align-items:center;flex:1;font-size:10px;font-weight:'+(isFrance?'700':'500')+';color:'+(m.away==='France'?'#4d84ff':'var(--t1)')+';">'+flagImg(m.away,15)+m.away+'</div>';
        html += '</div>';
      });
    } else {
      html += '<div style="padding:8px 10px;font-size:10px;color:#4f5d88;text-align:center;">À venir</div>';
    }
    html += '</div>';
  });
  html += '</div>';

  // Liens
  html += '<div class="cwrap">';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">🔗 Liens</div>';
  [['https://www.fifa.com/fr/tournaments/mens/worldcup/canadamexicousa2026','#4d84ff','🌐 FIFA officiel'],['https://www.lequipe.fr/Football/Coupe-du-monde/','#f0b020',"📰 L'Équipe"],['https://www.sofascore.com/tournament/football/world/fifa-world-cup/16','#ff7b54','⚡ Sofascore'],['https://www.flashscore.fr/football/monde/coupe-du-monde/','#22d3ee','⚡ Flashscore']].forEach(function(l){
    html += '<a href="'+l[0]+'" target="_blank" style="'+ls+'"><div style="font-size:12px;font-weight:700;color:'+l[1]+';flex:1;">'+l[2]+'</div><div style="color:var(--t3);">→</div></a>';
  });
  html += '</div></div>';

  el.innerHTML = html;
}

function showGroupDetail(gid) {
  var el = document.getElementById('ip-mondial');
  if(!el) return;

  var GROUPES = {
    'A':{teams:['Mexique','Corée du Sud','Afrique du Sud','Tchéquie']},
    'B':{teams:['Canada','Suisse','Qatar','Bosnie-Herzégovine']},
    'C':{teams:['Brésil','Maroc','Écosse','Haïti']},
    'D':{teams:['États-Unis','Paraguay','Australie','Turquie']},
    'E':{teams:['Allemagne','Équateur','Côte d\'Ivoire','Curaçao']},
    'F':{teams:['Pays-Bas','Japon','Tunisie','Suède']},
    'G':{teams:['Belgique','Iran','Égypte','Nouvelle-Zélande']},
    'H':{teams:['Espagne','Uruguay','Cap-Vert','Arabie saoudite']},
    'I':{teams:['France','Sénégal','Norvège','Irak']},
    'J':{teams:['Argentine','Algérie','Autriche','Jordanie']},
    'K':{teams:['Portugal','Colombie','RD Congo','Ouzbékistan']},
    'L':{teams:['Angleterre','Croatie','Ghana','Panama']}
  };

  var g = GROUPES[gid];
  var standings = JSON.parse(localStorage.getItem('wc2026_standings_'+gid)||'null');
  var matches = JSON.parse(localStorage.getItem('wc2026_matches_'+gid)||'null');
  var teams = standings || g.teams.map(function(t){return {name:t,pts:0,j:0,g:0,n:0,p:0,gf:0,ga:0};});

  var html = '<div style="padding:4px 0;">';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">';
  html += '<button onclick="loadMondial2026()" style="padding:6px 12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:6px;color:var(--t2);font-size:11px;cursor:pointer;">← Retour</button>';
  html += '<div style="font-size:15px;font-weight:800;color:var(--t1);">GROUPE '+gid+'</div>';
  html += '</div>';

  // Classement
  html += '<div class="cwrap" style="margin-bottom:10px;">';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">Classement</div>';
  html += '<div style="display:grid;grid-template-columns:auto 1fr repeat(5,28px);gap:4px;align-items:center;font-size:9px;color:#4f5d88;font-weight:700;padding:0 4px;margin-bottom:4px;">';
  html += '<div>#</div><div>Équipe</div><div style="text-align:center;">J</div><div style="text-align:center;">G</div><div style="text-align:center;">N</div><div style="text-align:center;">P</div><div style="text-align:center;">Pts</div></div>';
  teams.forEach(function(t, i){
    var qual = i < 2;
    var name = typeof t === 'string' ? t : t.name;
    var bg = qual ? 'rgba(30,215,96,.06)' : 'rgba(255,255,255,.02)';
    html += '<div style="display:grid;grid-template-columns:auto 1fr repeat(5,28px);gap:4px;align-items:center;background:'+bg+';border-radius:6px;padding:6px 4px;margin-bottom:3px;">';
    html += '<div style="font-size:10px;font-weight:700;color:'+(qual?'#1ed760':'#4f5d88')+';width:16px;">'+(i+1)+'</div>';
    html += '<div style="display:flex;align-items:center;font-size:10px;font-weight:'+(qual?'700':'400')+';color:'+(name==='France'?'#4d84ff':qual?'var(--t1)':'var(--t2)')+';">'+flagImg(name,14)+name+'</div>';
    ['j','g','n','p','pts'].forEach(function(k){
      var v = typeof t === 'object' ? (t[k]||0) : 0;
      html += '<div style="text-align:center;font-size:10px;font-weight:'+(k==='pts'?'800':'400')+';color:'+(k==='pts'&&v>0?'#f0b020':'var(--t2)')+';">'+v+'</div>';
    });
    html += '</div>';
  });
  html += '</div>';

  // Résultats
  html += '<div class="cwrap">';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">Matchs</div>';
  if(matches && matches.length) {
    matches.forEach(function(m){
      var played = m.score !== null;
      html += '<div style="display:flex;align-items:center;gap:8px;padding:8px;background:rgba(255,255,255,.03);border-radius:6px;margin-bottom:4px;">';
      html += '<div style="display:flex;align-items:center;justify-content:flex-end;flex:1;font-size:10px;font-weight:600;color:var(--t1);">'+flagImg(m.home,14)+m.home+'</div>';
      if(played) {
        var col = '#f0b020';
        html += '<div style="font-size:13px;font-weight:800;color:'+col+';min-width:40px;text-align:center;">'+m.score+'</div>';
      } else {
        html += '<div style="font-size:10px;color:#4f5d88;min-width:40px;text-align:center;">'+m.date+'</div>';
      }
      html += '<div style="display:flex;align-items:center;flex:1;font-size:10px;font-weight:600;color:var(--t1);">'+flagImg(m.away,14)+m.away+'</div>';
      html += '</div>';
    });
  } else {
    // Générer les matchs à jouer depuis les équipes
    var ts = g.teams;
    for(var i=0;i<ts.length;i++){
      for(var j=i+1;j<ts.length;j++){
        html += '<div style="display:flex;align-items:center;gap:8px;padding:8px;background:rgba(255,255,255,.03);border-radius:6px;margin-bottom:4px;">';
        html += '<div style="display:flex;align-items:center;justify-content:flex-end;flex:1;font-size:10px;font-weight:600;color:var(--t1);">'+flagImg(ts[i],14)+ts[i]+'</div>';
        html += '<div style="font-size:10px;color:#4f5d88;min-width:40px;text-align:center;">vs</div>';
        html += '<div style="display:flex;align-items:center;flex:1;font-size:10px;font-weight:600;color:var(--t1);">'+flagImg(ts[j],14)+ts[j]+'</div>';
        html += '</div>';
      }
    }
  }
  html += '</div></div>';
  el.innerHTML = html;
}

async function fetchMondialLive() {
  var status = document.getElementById('mondial-update-status');
  if(status) status.innerText = '⏳ Récupération des résultats...';
  try {
    // TheSportsDB — league 4429 = FIFA World Cup
    var res = await fetch('https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=4429&s=2026-2027');
    var data = await res.json();
    var events = (data && data.events) ? data.events : [];

    if(!events.length) {
      if(status) status.innerText = '⏳ Tournoi pas encore commencé — données disponibles le 11 juin';
      return;
    }

    // Organiser par groupe
    var groupMap = {
      'Group A':'A','Group B':'B','Group C':'C','Group D':'D',
      'Group E':'E','Group F':'F','Group G':'G','Group H':'H',
      'Group I':'I','Group J':'J','Group K':'K','Group L':'L'
    };

    var groupMatches = {};
    var groupStandings = {};

    events.forEach(function(e){
      var round = e.strRound || '';
      var gid = null;
      for(var k in groupMap){ if(round.indexOf(k)>=0){ gid=groupMap[k]; break; } }
      if(!gid) return;

      if(!groupMatches[gid]) groupMatches[gid] = [];
      var played = e.intHomeScore !== null && e.intHomeScore !== '';
      var match = {
        home: e.strHomeTeam,
        away: e.strAwayTeam,
        score: played ? e.intHomeScore+' - '+e.intAwayScore : null,
        date: e.dateEvent ? e.dateEvent.substring(5) : '?'
      };
      groupMatches[gid].push(match);

      // Calculer classements
      if(played){
        var hs = parseInt(e.intHomeScore), as = parseInt(e.intAwayScore);
        if(!groupStandings[gid]) groupStandings[gid] = {};
        [e.strHomeTeam, e.strAwayTeam].forEach(function(t){
          if(!groupStandings[gid][t]) groupStandings[gid][t]={name:t,pts:0,j:0,g:0,n:0,p:0,gf:0,ga:0};
        });
        groupStandings[gid][e.strHomeTeam].j++;
        groupStandings[gid][e.strAwayTeam].j++;
        groupStandings[gid][e.strHomeTeam].gf+=hs;
        groupStandings[gid][e.strHomeTeam].ga+=as;
        groupStandings[gid][e.strAwayTeam].gf+=as;
        groupStandings[gid][e.strAwayTeam].ga+=hs;
        if(hs>as){ groupStandings[gid][e.strHomeTeam].g++; groupStandings[gid][e.strHomeTeam].pts+=3; groupStandings[gid][e.strAwayTeam].p++; }
        else if(hs<as){ groupStandings[gid][e.strAwayTeam].g++; groupStandings[gid][e.strAwayTeam].pts+=3; groupStandings[gid][e.strHomeTeam].p++; }
        else { groupStandings[gid][e.strHomeTeam].n++; groupStandings[gid][e.strHomeTeam].pts++; groupStandings[gid][e.strAwayTeam].n++; groupStandings[gid][e.strAwayTeam].pts++; }
      }
    });

    // Récupérer matchs knockout
    var koMap = {
      'Round of 32':  'r32',
      'Round of 16':  'r16',
      'Quarter-Final':'qf',
      'Quarter-Finals':'qf',
      'Semi-Final':   'sf',
      'Semi-Finals':  'sf',
      'Final':        'f'
    };
    var koMatches = {};
    events.forEach(function(e){
      var round = e.strRound || '';
      var koKey = null;
      for(var k in koMap){ if(round.indexOf(k)>=0 && round.indexOf('Group')<0){ koKey=koMap[k]; break; } }
      if(!koKey) return;
      if(!koMatches[koKey]) koMatches[koKey]=[];
      var played = e.intHomeScore!==null && e.intHomeScore!=='';
      koMatches[koKey].push({
        home: e.strHomeTeam,
        away: e.strAwayTeam,
        score: played ? e.intHomeScore+' - '+e.intAwayScore : null,
        date: e.dateEvent ? e.dateEvent.substring(5) : '?'
      });
    });
    for(var k in koMatches){
      localStorage.setItem('wc2026_ko_'+k, JSON.stringify(koMatches[k]));
    }

    // Sauvegarder groupes en localStorage
    for(var gid in groupMatches){
      localStorage.setItem('wc2026_matches_'+gid, JSON.stringify(groupMatches[gid]));
    }
    for(var gid in groupStandings){
      var sorted = Object.values(groupStandings[gid]).sort(function(a,b){return b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga);});
      localStorage.setItem('wc2026_standings_'+gid, JSON.stringify(sorted));
    }

    if(status) { status.innerText = '✅ Mis à jour !'; status.style.color='var(--g)'; }
    setTimeout(function(){ loadMondial2026(); }, 800);

  } catch(e) {
    if(status) { status.innerText = '❌ Erreur réseau'; status.style.color='var(--r)'; }
  }
}


/* ══════════════════════════════════════
   SIMULATION COUPE DU MONDE 2026
══════════════════════════════════════ */
var SIMU_GROUPES = [
  {id:'A', teams:['Mexique','Corée du Sud','Afrique du Sud','Tchéquie']},
  {id:'B', teams:['Canada','Suisse','Qatar','Bosnie-Herzégovine']},
  {id:'C', teams:['Brésil','Maroc','Écosse','Haïti']},
  {id:'D', teams:['États-Unis','Paraguay','Australie','Turquie']},
  {id:'E', teams:['Allemagne','Équateur','Côte d\'Ivoire','Curaçao']},
  {id:'F', teams:['Pays-Bas','Japon','Tunisie','Suède']},
  {id:'G', teams:['Belgique','Iran','Égypte','Nouvelle-Zélande']},
  {id:'H', teams:['Espagne','Uruguay','Cap-Vert','Arabie saoudite']},
  {id:'I', teams:['France','Sénégal','Norvège','Irak']},
  {id:'J', teams:['Argentine','Algérie','Autriche','Jordanie']},
  {id:'K', teams:['Portugal','Colombie','RD Congo','Ouzbékistan']},
  {id:'L', teams:['Angleterre','Croatie','Ghana','Panama']}
];

// Paires de matchs par groupe (6 matchs)
function getGroupPairs(teams) {
  var pairs = [];
  for(var i=0;i<teams.length;i++)
    for(var j=i+1;j<teams.length;j++)
      pairs.push([teams[i],teams[j]]);
  return pairs;
}

function simuKey(gid) { return 'simu2026_g'+gid; }
function pickedThirds(exceptKey){
  var picks = {}; try{ picks = JSON.parse(localStorage.getItem('simu2026_thirdpicks')||'{}'); }catch(e){}
  var used = [];
  Object.keys(picks).forEach(function(k){ if(k!==exceptKey && picks[k]) used.push(picks[k]); });
  return used;
}

function simuTeamCell(value, side, rkey, idx){
  var alignLeft = (side==='away');
  var col = (value==='France')?'#4d84ff':'var(--t1)';
  if(typeof value==='string' && value.indexOf('T:')===0){
    var groups = value.slice(2);
    var best8 = []; try{ best8 = JSON.parse(localStorage.getItem('simu2026_best8thirds')||'[]'); }catch(e){}
    var picks = {}; try{ picks = JSON.parse(localStorage.getItem('simu2026_thirdpicks')||'{}'); }catch(e){}
    var slotKey = rkey+'_'+idx+'_'+side;
    var chosen = picks[slotKey] || '';
    var used = pickedThirds(slotKey);
    var opts = best8.filter(function(t){
      return used.indexOf(t.name)<0 || t.name===chosen;
    });
    // Trier : éligibles (groupe dans la liste) en premier, puis les autres
    opts.sort(function(a,b){
      var ea = groups.indexOf(a.group)>=0 ? 0 : 1;
      var eb = groups.indexOf(b.group)>=0 ? 0 : 1;
      return ea - eb;
    });
    var sel = '<select onchange="pickThird(\''+rkey+'\','+idx+',\''+side+'\',this.value)" style="font-size:9px;background:var(--bg3);border:1px solid var(--b2);border-radius:4px;color:'+(chosen?'var(--t1)':'#f0b020')+';padding:3px 4px;max-width:120px;'+(alignLeft?'':'text-align:right;')+'">';
    sel += '<option value="">3e '+groups+'…</option>';
    opts.forEach(function(t){
      var elig = groups.indexOf(t.group)>=0;
      sel += '<option value="'+t.name+'"'+(t.name===chosen?' selected':'')+'>'+(elig?'★ ':'')+t.name+' ('+t.group+')</option>';
    });
    sel += '</select>';
    return '<div style="font-size:10px;'+(alignLeft?'':'text-align:right;')+'">'+sel+'</div>';
  }
  // Équipe normale → cliquable pour désigner le vainqueur (option B)
  var matches_ = JSON.parse(localStorage.getItem(simuKoKey(rkey))||'[]');
  var m_ = matches_[idx] || {};
  var isWinner = m_.koWinner === side;
  var winStyle = isWinner ? 'background:rgba(30,215,96,.18);border:1px solid rgba(30,215,96,.4);' : 'border:1px solid transparent;';
  var check = isWinner ? '✓ ' : '';
  return '<div onclick="pickKoWinner(\''+rkey+'\','+idx+',\''+side+'\')" title="Cliquer pour qualifier" style="font-size:10px;font-weight:700;color:'+(isWinner?'#1ed760':col)+';'+(alignLeft?'':'text-align:right;')+'cursor:pointer;padding:3px 6px;border-radius:5px;'+winStyle+'">'+check+value+'</div>';
}

function pickThird(rkey, idx, side, name){
  var picks = {}; try{ picks = JSON.parse(localStorage.getItem('simu2026_thirdpicks')||'{}'); }catch(e){}
  var slotKey = rkey+'_'+idx+'_'+side;
  if(name) picks[slotKey] = name; else delete picks[slotKey];
  localStorage.setItem('simu2026_thirdpicks', JSON.stringify(picks));
  var matches = JSON.parse(localStorage.getItem(simuKoKey(rkey))||'[]');
  if(matches[idx]){
    if(side==='home') matches[idx].homeName = name; else matches[idx].awayName = name;
    localStorage.setItem(simuKoKey(rkey), JSON.stringify(matches));
  }
  var el = getSimuContainer(); if(el) renderSimuMain(el);
}

function simuDisplayName(m, side){
  var raw = side==='home'?m.home:m.away;
  var picked = side==='home'?m.homeName:m.awayName;
  if(typeof raw==='string' && raw.indexOf('T:')===0) return picked || raw;
  return raw;
}

function simuKoKey(round) { return 'simu2026_ko_'+round; }

function getSimuGroupScores(gid) {
  return JSON.parse(localStorage.getItem(simuKey(gid))||'{}');
}
function saveSimuGroupScore(gid, matchKey, h, a) {
  var scores = getSimuGroupScores(gid);
  scores[matchKey] = {h:h, a:a};
  localStorage.setItem(simuKey(gid), JSON.stringify(scores));
}

function calcSimuStandings(gid) {
  var g = SIMU_GROUPES.find(function(x){return x.id===gid;});
  if(!g) return [];
  var scores = getSimuGroupScores(gid);
  var pairs = getGroupPairs(g.teams);
  var st = {};
  g.teams.forEach(function(t){ st[t]={name:t,pts:0,j:0,g:0,n:0,p:0,gf:0,ga:0}; });
  pairs.forEach(function(p){
    var k = p[0]+'_'+p[1];
    var s = scores[k];
    if(!s||s.h===''||s.a==='') return;
    var h=parseInt(s.h), a=parseInt(s.a);
    if(isNaN(h)||isNaN(a)) return;
    st[p[0]].j++; st[p[1]].j++;
    st[p[0]].gf+=h; st[p[0]].ga+=a;
    st[p[1]].gf+=a; st[p[1]].ga+=h;
    if(h>a){ st[p[0]].g++; st[p[0]].pts+=3; st[p[1]].p++; }
    else if(h<a){ st[p[1]].g++; st[p[1]].pts+=3; st[p[0]].p++; }
    else { st[p[0]].n++; st[p[0]].pts++; st[p[1]].n++; st[p[1]].pts++; }
  });
  return Object.values(st).sort(function(a,b){
    if(b.pts!==a.pts) return b.pts-a.pts;
    if((b.gf-b.ga)!==(a.gf-a.ga)) return (b.gf-b.ga)-(a.gf-a.ga);
    return b.gf-a.gf;
  });
}


function loadSimuTab() {
  var el = document.getElementById('t-simu');
  if(!el) return;
  // Créer un wrapper qui utilise renderSimuMain
  if(!el.querySelector('#simu-main')) {
    el.innerHTML = '<div style="max-width:700px;margin:0 auto;padding:12px 8px;" id="simu-tab-wrap"></div>';
  }
  var wrap = document.getElementById('simu-tab-wrap');
  if(wrap) renderSimuMain(wrap);
}

function loadSimu2026() {
  var el = getSimuContainer();
  if(!el) return;
  renderSimuMain(el);
}

function getSimuContainer() {
  // Priorité au tab principal, sinon ip-simu dans la fiche équipe
  var tab = document.getElementById('simu-tab-wrap');
  if(tab && document.getElementById('t-simu') && document.getElementById('t-simu').classList.contains('on')) return tab;
  return document.getElementById('ip-simu') || tab;
}
function renderSimuMain(el) {
  if(!el) el = getSimuContainer();
  if(!el) return;
  var html = '<div style="padding:4px 0;" id="simu-main">';

  // Header
  html += '<div style="background:linear-gradient(135deg,rgba(167,139,250,.15),rgba(240,176,32,.1));border:1px solid rgba(167,139,250,.3);border-radius:12px;padding:14px;margin-bottom:14px;text-align:center;">';
  html += '<div style="font-size:20px;">🎮</div>';
  html += '<div style="font-size:15px;font-weight:800;color:var(--t1);">Simulation Coupe du Monde 2026</div>';
  html += '<div style="font-size:10px;color:var(--t3);margin-top:3px;">Entre les scores — les qualifiés avancent automatiquement</div>';
  html += '<div style="display:flex;gap:8px;justify-content:center;margin-top:10px;">';
  html += '<button onclick="partagerSimu()" style="padding:8px 16px;background:rgba(37,211,102,.2);border:1px solid rgba(37,211,102,.4);border-radius:8px;color:#25d366;font-size:12px;font-weight:800;cursor:pointer;">📱 Partager sur WhatsApp</button>';
  html += '<button onclick="resetSimu2026()" style="padding:8px 12px;background:rgba(255,69,69,.15);border:1px solid rgba(255,69,69,.3);border-radius:8px;color:#ff4545;font-size:11px;font-weight:700;cursor:pointer;">🗑</button>';
  html += '</div>';
  html += '</div>';

  // Liste des simulations reçues (cliquables)
  html += renderRecuesList();

  // Groupes
  html += '<div class="cwrap" style="margin-bottom:10px;">';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">📊 Phase de groupes</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">';

  SIMU_GROUPES.forEach(function(g){
    var standings = calcSimuStandings(g.id);
    var isFr = g.id==='I';
    var allPlayed = standings.every(function(t){return t.j===3;});
    html += '<div onclick="renderSimuGroup(\''+g.id+'\')" style="background:'+(isFr?'rgba(77,132,255,.08)':'rgba(255,255,255,.02)')+';border:1px solid '+(isFr?'rgba(77,132,255,.4)':'rgba(255,255,255,.07)')+';border-radius:8px;padding:8px;cursor:pointer;" onmouseover="this.style.opacity=\'.8\'" onmouseout="this.style.opacity=\'1\'">';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">';
    html += '<div style="font-size:9px;font-weight:800;color:'+(isFr?'#4d84ff':'#4f5d88')+';">GROUPE '+g.id+(isFr?' 🇫🇷':'')+'</div>';
    html += '<div style="font-size:9px;color:'+(allPlayed?'#1ed760':'#4f5d88')+'">'+(allPlayed?'✅':'✏️')+'</div>';
    html += '</div>';
    standings.forEach(function(t,i){
      var qual = i<2;
      var third = i===2;
      var col = t.name==='France'?'#4d84ff':qual?'var(--t1)':third?'#f0b020':'var(--t2)';
      var prefix = allPlayed?(qual?'✅ ':third?'❓ ':''):'';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:2px 0;">';
      html += '<div style="display:flex;align-items:center;font-size:9px;color:'+col+';font-weight:'+(qual||third?700:400)+';max-width:95px;overflow:hidden;white-space:nowrap;">'+flagImg(t.name,14)+prefix+t.name+'</div>';
      var _db=t.gf-t.ga; html += '<div style="display:flex;align-items:center;gap:6px;"><span style="font-size:8px;font-weight:600;color:'+(_db>0?'#1ed760':_db<0?'#ff7b7b':'var(--t3)')+';">'+(_db>0?'+':'')+_db+'</span><span style="font-size:9px;font-weight:700;color:'+(t.pts>0?'#f0b020':'var(--t3)')+';">'+t.pts+'pts</span></div>';
      html += '</div>';
    });
    html += '</div>';
  });
  html += '</div>';
  html += '<div style="font-size:9px;color:#4f5d88;text-align:center;margin-top:6px;">✅ Qualifié direct · ❓ 3e potentiellement qualifiable (8 meilleurs sur 12)</div>';
  html += '</div>';

  // Knockout
  var KO_ROUNDS = [
    {key:'r32', label:'16e de finale', col:'#4f5d88', next:'r16'},
    {key:'r16', label:'8e de finale', col:'#4d84ff', next:'qf'},
    {key:'qf',  label:'Quarts',        col:'#a78bfa', next:'sf'},
    {key:'sf',  label:'Demi-finales',  col:'#f0b020', next:'f'},
    {key:'f',   label:'🏆 Finale',     col:'#1ed760', next:null}
  ];

  KO_ROUNDS.forEach(function(r){
    var matches = JSON.parse(localStorage.getItem(simuKoKey(r.key))||'[]');
    if(!matches.length) return;
    html += '<div class="cwrap" style="margin-bottom:8px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:'+r.col+';margin-bottom:4px;">'+r.label+'</div>';
    html += '<div style="font-size:8px;color:var(--t3);margin-bottom:8px;">👆 Clique une équipe pour la qualifier, ou saisis le score</div>';
    matches.forEach(function(m, idx){
      var isFr = simuDisplayName(m,'home')==='France'||simuDisplayName(m,'away')==='France';
      html += '<div style="display:grid;grid-template-columns:1fr auto auto auto 1fr;gap:6px;align-items:center;padding:6px;background:'+(isFr?'rgba(77,132,255,.06)':'rgba(255,255,255,.02)')+';border-radius:6px;margin-bottom:4px;">';
      html += simuTeamCell(m.home,'home',r.key,idx);
      html += '<input type="number" min="0" max="20" value="'+(m.sh!==undefined?m.sh:'')+'" placeholder="-" style="width:32px;text-align:center;background:var(--bg3);border:1px solid var(--b2);border-radius:4px;color:var(--t1);font-size:13px;font-weight:800;padding:4px;" oninput="saveSimuKo(\''+r.key+'\','+idx+',this.value,null)">';
      html += '<div style="font-size:10px;color:var(--t3);">-</div>';
      html += '<input type="number" min="0" max="20" value="'+(m.sa!==undefined?m.sa:'')+'" placeholder="-" style="width:32px;text-align:center;background:var(--bg3);border:1px solid var(--b2);border-radius:4px;color:var(--t1);font-size:13px;font-weight:800;padding:4px;" oninput="saveSimuKo(\''+r.key+'\','+idx+',null,this.value)">';
      html += simuTeamCell(m.away,'away',r.key,idx);
      html += '</div>';
    });

    // Bouton générer le tour suivant
    if(r.next) {
      var allDone = matches.every(function(m){return m.sh!==undefined&&m.sa!==undefined&&m.sh!==''&&m.sa!=='';});
      var thirdsResolved = matches.every(function(m){
        var hOk = !(typeof m.home==='string'&&m.home.indexOf('T:')===0) || m.homeName;
        var aOk = !(typeof m.away==='string'&&m.away.indexOf('T:')===0) || m.awayName;
        return hOk && aOk;
      });
      if(allDone && !thirdsResolved){
        html += '<div style="text-align:center;padding:6px;font-size:9px;color:#f0b020;">⚠️ Choisis les 3es dans les menus déroulants</div>';
      }
      if(allDone && thirdsResolved) {
        html += '<button onclick="generateNextRound(\''+r.key+'\',\''+r.next+'\')" style="width:100%;margin-top:6px;padding:8px;background:rgba(77,132,255,.15);border:1px solid rgba(77,132,255,.3);border-radius:6px;color:#4d84ff;font-size:11px;font-weight:700;cursor:pointer;">→ Générer les '+({r16:'8es',qf:'quarts',sf:'demies',f:'finale'}[r.next]||r.next.toUpperCase())+'</button>';
      }
    } else {
      // Finale — afficher le vainqueur
      var fin = matches[0];
      if(fin&&fin.sh!==undefined&&fin.sa!==undefined&&fin.sh!==''&&fin.sa!=='') {
        var winner = parseInt(fin.sh)>parseInt(fin.sa)?fin.home:parseInt(fin.sh)<parseInt(fin.sa)?fin.away:'?';
        html += '<div style="margin-top:10px;text-align:center;padding:14px;background:rgba(240,176,32,.1);border:1px solid rgba(240,176,32,.3);border-radius:8px;">';
        html += '<div style="font-size:24px;">🏆</div>';
        html += '<div style="font-size:16px;font-weight:800;color:#f0b020;">'+winner+'</div>';
        html += '<div style="font-size:10px;color:var(--t3);margin-top:3px;">Champion du Monde 2026</div>';
        html += '</div>';
      }
    }
    html += '</div>';
  });

  // Bouton générer 32es depuis groupes si pas encore fait
  var r32 = JSON.parse(localStorage.getItem(simuKoKey('r32'))||'[]');
  if(!r32.length) {
    var groupsComplete = SIMU_GROUPES.every(function(g){
      return calcSimuStandings(g.id).every(function(t){return t.j===3;});
    });
    if(groupsComplete) {
      html += renderThirdsRanking();
      html += '<div class="cwrap">';
      html += '<button onclick="generateR32()" style="width:100%;padding:12px;background:rgba(30,215,96,.15);border:1px solid rgba(30,215,96,.3);border-radius:8px;color:#1ed760;font-size:13px;font-weight:800;cursor:pointer;">🚀 Générer les 16e de finale !</button>';
      html += '</div>';
    } else {
      html += '<div style="text-align:center;padding:10px;font-size:10px;color:#4f5d88;">Complète tous les groupes pour générer les 16es de finale</div>';
    }
  }

  html += '</div>';
  el.innerHTML = html;
}

function renderSimuGroup(gid) {
  var el = getSimuContainer();
  if(!el) return;
  var g = SIMU_GROUPES.find(function(x){return x.id===gid;});
  var pairs = getGroupPairs(g.teams);
  var scores = getSimuGroupScores(gid);
  var isFr = gid==='I';

  var html = '<div style="padding:4px 0;">';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">';
  html += '<button onclick="loadSimu2026()" style="padding:6px 12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:6px;color:var(--t2);font-size:11px;cursor:pointer;">← Retour</button>';
  html += '<div style="font-size:15px;font-weight:800;color:'+(isFr?'#4d84ff':'var(--t1)')+';">GROUPE '+gid+(isFr?' 🇫🇷':'')+'</div>';
  html += '</div>';

  // Matchs à scorer
  html += '<div class="cwrap" style="margin-bottom:10px;">';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">⚽ Scores</div>';
  pairs.forEach(function(p){
    var k = p[0]+'_'+p[1];
    var kEsc = k.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    var s = scores[k]||{h:'',a:''};
    var isFrMatch = p[0]==='France'||p[1]==='France';
    html += '<div style="display:grid;grid-template-columns:1fr auto auto auto 1fr;gap:8px;align-items:center;padding:8px;background:'+(isFrMatch?'rgba(77,132,255,.06)':'rgba(255,255,255,.02)')+';border-radius:8px;margin-bottom:6px;border:1px solid '+(isFrMatch?'rgba(77,132,255,.2)':'rgba(255,255,255,.05)')+'">';
    html += '<div style="display:flex;align-items:center;justify-content:flex-end;font-size:11px;font-weight:700;color:'+(p[0]==='France'?'#4d84ff':'var(--t1)')+';">'+flagImg(p[0],16)+p[0]+'</div>';
    html += '<input type="number" min="0" max="20" value="'+s.h+'" placeholder="-" id="simu_'+gid+'_'+k+'_h" style="width:36px;text-align:center;background:var(--bg3);border:1px solid var(--b2);border-radius:6px;color:var(--t1);font-size:16px;font-weight:800;padding:6px 2px;" oninput="onSimuScore(\''+gid+'\',\''+kEsc+'\',true,this.value)">';
    html += '<div style="font-size:12px;color:var(--t3);font-weight:700;">—</div>';
    html += '<input type="number" min="0" max="20" value="'+s.a+'" placeholder="-" id="simu_'+gid+'_'+k+'_a" style="width:36px;text-align:center;background:var(--bg3);border:1px solid var(--b2);border-radius:6px;color:var(--t1);font-size:16px;font-weight:800;padding:6px 2px;" oninput="onSimuScore(\''+gid+'\',\''+kEsc+'\',false,this.value)">';
    html += '<div style="display:flex;align-items:center;font-size:11px;font-weight:700;color:'+(p[1]==='France'?'#4d84ff':'var(--t1)')+';">'+flagImg(p[1],16)+p[1]+'</div>';
    html += '</div>';
    // Boutons rapides vainqueur/nul
    var win = (s.h!==''&&s.a!=='')?(parseInt(s.h)>parseInt(s.a)?'home':parseInt(s.h)<parseInt(s.a)?'away':'draw'):'';
    html += '<div style="display:flex;gap:4px;margin:-2px 0 8px 0;">';
    html += '<button onclick="quickResult(\''+gid+'\',\''+kEsc+'\',\'home\')" style="flex:1;padding:4px;border-radius:5px;border:1px solid '+(win==='home'?'rgba(30,215,96,.5)':'rgba(255,255,255,.1)')+';background:'+(win==='home'?'rgba(30,215,96,.18)':'rgba(255,255,255,.03)')+';color:'+(win==='home'?'#1ed760':'var(--t3)')+';font-size:9px;font-weight:700;cursor:pointer;">'+p[0]+'</button>';
    html += '<button onclick="quickResult(\''+gid+'\',\''+kEsc+'\',\'draw\')" style="padding:4px 10px;border-radius:5px;border:1px solid '+(win==='draw'?'rgba(240,176,32,.5)':'rgba(255,255,255,.1)')+';background:'+(win==='draw'?'rgba(240,176,32,.18)':'rgba(255,255,255,.03)')+';color:'+(win==='draw'?'#f0b020':'var(--t3)')+';font-size:9px;font-weight:700;cursor:pointer;">Nul</button>';
    html += '<button onclick="quickResult(\''+gid+'\',\''+kEsc+'\',\'away\')" style="flex:1;padding:4px;border-radius:5px;border:1px solid '+(win==='away'?'rgba(30,215,96,.5)':'rgba(255,255,255,.1)')+';background:'+(win==='away'?'rgba(30,215,96,.18)':'rgba(255,255,255,.03)')+';color:'+(win==='away'?'#1ed760':'var(--t3)')+';font-size:9px;font-weight:700;cursor:pointer;">'+p[1]+'</button>';
    html += '</div>';
  });
  html += '</div>';

  // Classement live
  html += '<div class="cwrap" id="simu-standings-'+gid+'">';
  html += renderSimuStandings(gid);
  html += '</div>';
  html += '</div>';
  el.innerHTML = html;
}

function renderSimuStandings(gid) {
  var standings = calcSimuStandings(gid);
  var html = '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">📊 Classement</div>';
  html += '<div style="display:grid;grid-template-columns:20px 1fr 24px 24px 24px 24px 30px 30px;gap:3px;font-size:9px;color:#4f5d88;font-weight:700;padding:0 4px;margin-bottom:4px;">';
  html += '<div>#</div><div>Équipe</div><div style="text-align:center">J</div><div style="text-align:center">G</div><div style="text-align:center">N</div><div style="text-align:center">P</div><div style="text-align:center">DB</div><div style="text-align:center">Pts</div></div>';
  standings.forEach(function(t,i){
    var qual = i<2;
    var third = i===2;
    var bg = qual?'rgba(30,215,96,.06)':third?'rgba(240,176,32,.04)':'rgba(255,255,255,.02)';
    var numCol = qual?'#1ed760':third?'#f0b020':'#4f5d88';
    html += '<div style="display:grid;grid-template-columns:20px 1fr 24px 24px 24px 24px 30px 30px;gap:3px;align-items:center;background:'+bg+';border-radius:6px;padding:6px 4px;margin-bottom:3px;">';
    html += '<div style="font-size:10px;font-weight:700;color:'+numCol+'">'+(i+1)+'</div>';
    html += '<div style="display:flex;align-items:center;font-size:10px;font-weight:'+(qual||third?700:400)+';color:'+(t.name==='France'?'#4d84ff':qual?'var(--t1)':third?'#f0b020':'var(--t2)')+';overflow:hidden;white-space:nowrap;">'+flagImg(t.name,16)+(third?'❓ ':'')+t.name+'</div>';
    ['j','g','n','p'].forEach(function(k){ html += '<div style="text-align:center;font-size:10px;color:var(--t2);">'+t[k]+'</div>'; });
    var db = t.gf-t.ga;
    html += '<div style="text-align:center;font-size:10px;font-weight:700;color:'+(db>0?'#1ed760':db<0?'#ff7b7b':'var(--t3)')+';">'+(db>0?'+':'')+db+'</div>';
    html += '<div style="text-align:center;font-size:11px;font-weight:800;color:'+(t.pts>0?'#f0b020':'var(--t3)')+';">'+t.pts+'</div>';
    html += '</div>';
  });
  return html;
}

function quickResult(gid, k, result) {
  var scores = getSimuGroupScores(gid);
  if(result==='home') scores[k]={h:1,a:0};
  else if(result==='away') scores[k]={h:0,a:1};
  else scores[k]={h:1,a:1};
  localStorage.setItem(simuKey(gid), JSON.stringify(scores));
  renderSimuGroup(gid);
}

function onSimuScore(gid, matchKey, isHome, val) {
  var scores = getSimuGroupScores(gid);
  if(!scores[matchKey]) scores[matchKey]={h:'',a:''};
  if(isHome) scores[matchKey].h=val; else scores[matchKey].a=val;
  localStorage.setItem(simuKey(gid), JSON.stringify(scores));
  // Mettre à jour classement live
  var el = document.getElementById('simu-standings-'+gid);
  if(el) el.innerHTML = renderSimuStandings(gid);
}

function saveSimuKo(round, idx, sh, sa) {
  var matches = JSON.parse(localStorage.getItem(simuKoKey(round))||'[]');
  if(!matches[idx]) return;
  if(sh!==null) matches[idx].sh=sh;
  if(sa!==null) matches[idx].sa=sa;
  // Si un score est saisi manuellement, il prime → on efface le vainqueur "clic"
  if((sh!==null && sh!=='') || (sa!==null && sa!=='')) { delete matches[idx].koWinner; }
  localStorage.setItem(simuKoKey(round), JSON.stringify(matches));
  // Re-render
  var el = getSimuContainer();
  if(el) renderSimuMain(el);
}

// Option B : désigner le vainqueur d'un match KO d'un simple clic
function pickKoWinner(round, idx, side) {
  var matches = JSON.parse(localStorage.getItem(simuKoKey(round))||'[]');
  if(!matches[idx]) return;
  // Toggle : reclic sur le même vainqueur = annule
  if(matches[idx].koWinner === side) {
    delete matches[idx].koWinner;
    matches[idx].sh = ''; matches[idx].sa = '';
  } else {
    matches[idx].koWinner = side;
    // Score symbolique 1-0 pour le gagnant (compatibilité avec generateNextRound)
    if(side === 'home') { matches[idx].sh = 1; matches[idx].sa = 0; }
    else { matches[idx].sh = 0; matches[idx].sa = 1; }
  }
  localStorage.setItem(simuKoKey(round), JSON.stringify(matches));
  var el = getSimuContainer();
  if(el) renderSimuMain(el);
}

function getAllThirds() {
  // Récupère les 12 troisièmes (un par groupe) avec leur classement par défaut
  var thirds = [];
  SIMU_GROUPES.forEach(function(g){
    var st = calcSimuStandings(g.id);
    if(st[2]) thirds.push({name:st[2].name, pts:st[2].pts, gd:st[2].gf-st[2].ga, gf:st[2].gf, group:g.id});
  });
  thirds.sort(function(a,b){ return b.pts-a.pts||b.gd-a.gd||b.gf-a.gf; });
  // Appliquer l'ordre manuel s'il existe
  var manual = null; try{ manual = JSON.parse(localStorage.getItem('simu2026_thirdsorder')||'null'); }catch(e){}
  if(manual && manual.length){
    var byName = {}; thirds.forEach(function(t){ byName[t.name]=t; });
    var ordered = [];
    manual.forEach(function(n){ if(byName[n]){ ordered.push(byName[n]); delete byName[n]; } });
    // Ajouter les éventuels nouveaux 3es pas encore dans l'ordre manuel
    thirds.forEach(function(t){ if(byName[t.name]) ordered.push(t); });
    return ordered;
  }
  return thirds;
}

function moveThird(idx, dir) {
  var thirds = getAllThirds();
  var ni = idx + dir;
  if(ni<0 || ni>=thirds.length) return;
  var tmp = thirds[idx]; thirds[idx] = thirds[ni]; thirds[ni] = tmp;
  localStorage.setItem('simu2026_thirdsorder', JSON.stringify(thirds.map(function(t){return t.name;})));
  var el = getSimuContainer(); if(el) renderSimuMain(el);
}

function renderThirdsRanking() {
  var thirds = getAllThirds();
  if(thirds.length < 12) return '';
  var html = '<div class="cwrap" style="margin-bottom:10px;">';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#f0b020;margin-bottom:4px;">🥉 Classement des 3es — glisse avec les flèches</div>';
  html += '<div style="font-size:9px;color:#4f5d88;margin-bottom:8px;">Les 8 premiers sont qualifiés pour les 16es</div>';
  thirds.forEach(function(t,i){
    var qual = i<8;
    var bg = qual?'rgba(30,215,96,.06)':'rgba(255,69,69,.04)';
    var numCol = qual?'#1ed760':'#ff7b7b';
    html += '<div style="display:flex;align-items:center;gap:8px;padding:7px 8px;background:'+bg+';border-radius:6px;margin-bottom:3px;'+(i===8?'margin-top:8px;border-top:2px dashed rgba(255,69,69,.3);padding-top:12px;':'')+'">';
    html += '<div style="font-size:11px;font-weight:800;color:'+numCol+';min-width:18px;">'+(i+1)+'</div>';
    html += '<div style="flex:1;font-size:11px;font-weight:'+(qual?700:400)+';color:'+(t.name==='France'?'#4d84ff':qual?'var(--t1)':'var(--t3)')+';">'+flagImg(t.name,16)+t.name+' <span style="font-size:8px;color:#4f5d88;">('+t.group+' · '+t.pts+'pts · '+(t.gd>0?'+':'')+t.gd+')</span></div>';
    html += '<button onclick="moveThird('+i+',-1)" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:4px;color:var(--t2);font-size:13px;width:26px;height:26px;cursor:pointer;'+(i===0?'opacity:.25;':'')+'">↑</button>';
    html += '<button onclick="moveThird('+i+',1)" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:4px;color:var(--t2);font-size:13px;width:26px;height:26px;cursor:pointer;'+(i===thirds.length-1?'opacity:.25;':'')+'">↓</button>';
    html += '</div>';
  });
  html += '</div>';
  return html;
}

function generateR32() {
  // Les 32 qualifiés : top 2 de chaque groupe + 8 meilleurs 3es (ordre manuel respecté)
  var qualifieds = {};
  SIMU_GROUPES.forEach(function(g){
    var st = calcSimuStandings(g.id);
    qualifieds['1'+g.id] = st[0].name;
    qualifieds['2'+g.id] = st[1].name;
  });
  var best8 = getAllThirds().slice(0,8);

  // Vrai bracket officiel FIFA 2026 (matchs 73-88).
  // Les emplacements 3es sont des placeholders 'T:groupes' à choisir via menu déroulant.
  // Format home/away : soit un nom (qualifié direct), soit 'T:ABCDF' (3e d'un des groupes listés)
  var r32 = [
    {m:73, home:qualifieds['1F'], away:qualifieds['2C'], sh:'', sa:''},
    {m:74, home:qualifieds['1E'], away:'T:ABCDF', sh:'', sa:''},
    {m:75, home:qualifieds['1I'], away:'T:CDFGH', sh:'', sa:''},
    {m:76, home:qualifieds['1C'], away:qualifieds['2F'], sh:'', sa:''},
    {m:77, home:qualifieds['2E'], away:qualifieds['2I'], sh:'', sa:''},
    {m:78, home:qualifieds['1A'], away:'T:CEFHI', sh:'', sa:''},
    {m:79, home:qualifieds['1L'], away:'T:EHIJK', sh:'', sa:''},
    {m:80, home:qualifieds['1D'], away:'T:BEFIJ', sh:'', sa:''},
    {m:81, home:qualifieds['1G'], away:'T:AEHIJ', sh:'', sa:''},
    {m:82, home:qualifieds['2K'], away:qualifieds['2L'], sh:'', sa:''},
    {m:83, home:qualifieds['1H'], away:qualifieds['2J'], sh:'', sa:''},
    {m:84, home:qualifieds['1B'], away:'T:EFGIJ', sh:'', sa:''},
    {m:85, home:qualifieds['1J'], away:qualifieds['2H'], sh:'', sa:''},
    {m:86, home:qualifieds['1K'], away:'T:DEIJL', sh:'', sa:''},
    {m:87, home:qualifieds['2A'], away:qualifieds['2B'], sh:'', sa:''},
    {m:88, home:qualifieds['2D'], away:qualifieds['2G'], sh:'', sa:''}
  ];
  // Mémoriser les 8 meilleurs 3es disponibles pour les menus déroulants
  localStorage.setItem('simu2026_best8thirds', JSON.stringify(best8.map(function(t){return {name:t.name, group:t.group};})));
  localStorage.setItem('simu2026_thirdpicks', JSON.stringify({}));
  localStorage.setItem(simuKoKey('r32'), JSON.stringify(r32));
  var el = getSimuContainer();
  if(el) renderSimuMain(el);
}

function generateNextRound(currentKey, nextKey) {
  var matches = JSON.parse(localStorage.getItem(simuKoKey(currentKey))||'[]');
  var nextMatches = [];
  for(var i=0;i<matches.length;i+=2){
    var m1=matches[i], m2=matches[i+1]||{home:'TBD',away:'TBD',sh:0,sa:0};
    var h1=simuDisplayName(m1,'home'), a1=simuDisplayName(m1,'away');
    var h2=simuDisplayName(m2,'home'), a2=simuDisplayName(m2,'away');
    var w1 = parseInt(m1.sh)>parseInt(m1.sa)?h1:parseInt(m1.sh)<parseInt(m1.sa)?a1:h1+' (pen)';
    var w2 = m2 ? (parseInt(m2.sh)>parseInt(m2.sa)?h2:parseInt(m2.sh)<parseInt(m2.sa)?a2:h2+' (pen)') : 'TBD';
    nextMatches.push({home:w1,away:w2,sh:'',sa:''});
  }
  localStorage.setItem(simuKoKey(nextKey), JSON.stringify(nextMatches));
  var el = getSimuContainer();
  if(el) renderSimuMain(el);
}


/* ══ PARTAGE SIMULATION ══ */
function exportSimuData() {
  // Collecter toutes les données de la simu
  var data = {v:1, groups:{}, ko:{}};
  SIMU_GROUPES.forEach(function(g){
    var scores = getSimuGroupScores(g.id);
    if(Object.keys(scores).length) data.groups[g.id] = scores;
  });
  ['r32','r16','qf','sf','f'].forEach(function(k){
    var m = localStorage.getItem(simuKoKey(k));
    if(m) data.ko[k] = JSON.parse(m);
  });
  return data;
}

function getSimuWinner() {
  var fin = JSON.parse(localStorage.getItem(simuKoKey('f'))||'[]');
  if(!fin.length) return null;
  var m = fin[0];
  if(m.sh===''||m.sa===''||m.sh===undefined) return null;
  return parseInt(m.sh)>parseInt(m.sa)?m.home:parseInt(m.sh)<parseInt(m.sa)?m.away:null;
}


/* ══ PARTAGE PROFIL ══ */
function partagerProfil() {
  var prenom = prompt('Ton prénom :', '');
  if(!prenom) return;

  // Données légères à partager
  var total = Object.values(state.b||{}).reduce(function(a,v){return a+parseFloat(v||0);},0);
  var archive = (state.a||[]).slice(-100); // 100 derniers paris max
  var enCours = (state.p||[]).slice(0,20);

  var data = {
    v: 1,
    nom: prenom.trim(),
    date: new Date().toLocaleDateString('fr-FR'),
    capital: total,
    bankroll: state.b||{},
    a: archive,
    p: enCours,
    u: (state.u||[]).map(function(u){return {n:u.n,color:u.color,abbr:u.abbr,sport:u.sport,s:u.s,l:u.l};})
  };

  var json = JSON.stringify(data);
  var b64 = btoa(unescape(encodeURIComponent(json)));
  var url = window.location.origin + window.location.pathname + '#profil=' + b64;

  // Stats rapides
  var wins = archive.filter(function(h){return h.win&&!h.isCashout;}).length;
  var pct = archive.length ? Math.round(wins/archive.length*100) : 0;
  var profit = archive.reduce(function(a,h){return a+(h.profit||0);},0);

  var msg = '🎯 ' + prenom + ' — Mon profil GONES45\n';
  msg += '💰 Capital : ' + total.toFixed(2) + '€\n';
  msg += '📊 ' + archive.length + ' paris · ' + pct + '% réussite · ' + (profit>=0?'+':'') + profit.toFixed(2) + '€\n';
  msg += '👉 Voir mon profil : ' + url;

  var waUrl = 'https://wa.me/?text=' + encodeURIComponent(msg);

  // Modal
  var modal = document.getElementById('profil-share-modal');
  if(!modal) {
    modal = document.createElement('div');
    modal.id = 'profil-share-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
    document.body.appendChild(modal);
  }

  modal.innerHTML = '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:16px;padding:20px;max-width:420px;width:100%;">'
    +'<div style="text-align:center;margin-bottom:16px;">'
    +'<div style="font-size:28px;">📤</div>'
    +'<div style="font-size:15px;font-weight:800;color:var(--t1);margin-top:6px;">Partager mon profil</div>'
    +'<div style="font-size:11px;color:var(--t3);margin-top:4px;">'+prenom+' · '+archive.length+' paris · '+total.toFixed(2)+'€</div>'
    +'</div>'
    +'<textarea readonly style="width:100%;height:60px;background:rgba(255,255,255,.04);border:1px solid var(--b2);border-radius:8px;color:var(--t3);font-size:10px;padding:8px;resize:none;margin-bottom:12px;box-sizing:border-box;">'+url+'</textarea>'
    +'<div style="display:flex;flex-direction:column;gap:8px;">'
    +'<a href="'+waUrl+'" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;background:#25d366;border-radius:10px;color:#fff;font-size:14px;font-weight:800;text-decoration:none;">📱 Envoyer sur WhatsApp</a>'
    +'<button onclick="var t=this.parentNode.previousSibling;t.select();document.execCommand(\'copy\');this.innerText=\'✅ Copié !\';" style="padding:12px;background:rgba(255,255,255,.06);border:1px solid var(--b2);border-radius:10px;color:var(--t1);font-size:13px;font-weight:700;cursor:pointer;">📋 Copier le lien</button>'
    +'<button onclick="document.getElementById(\'profil-share-modal\').style.display=\'none\'" style="padding:10px;background:none;border:none;color:var(--t3);font-size:12px;cursor:pointer;">Fermer</button>'
    +'</div></div>';

  modal.style.display = 'flex';
  modal.onclick = function(e){ if(e.target===modal) modal.style.display='none'; };
}

function chargerProfilDepuisUrl() {
  var hash = window.location.hash;
  if(!hash || hash.indexOf('#profil=') < 0) return false;
  try {
    var b64 = hash.replace('#profil=','');
    var json = decodeURIComponent(escape(atob(b64)));
    var data = JSON.parse(json);
    if(!data || !data.nom) return false;

    history.replaceState(null, '', window.location.pathname);

    // Afficher dans une vue lecture seule
    setTimeout(function(){
      afficherProfilInvite(data);
    }, 500);
    return true;
  } catch(e) { return false; }
}

function afficherProfilInvite(data) {
  var modal = document.getElementById('profil-invite-modal');
  if(!modal) {
    modal = document.createElement('div');
    modal.id = 'profil-invite-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:16px;overflow-y:auto;';
    document.body.appendChild(modal);
  }

  var archive = data.a || [];
  var wins = archive.filter(function(h){return h.win&&!h.isCashout;}).length;
  var pct = archive.length ? Math.round(wins/archive.length*100) : 0;
  var profit = archive.reduce(function(a,h){return a+(h.profit||0);},0);
  var capital = data.capital || 0;
  var enCours = data.p || [];

  var html = '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:16px;padding:20px;max-width:500px;width:100%;margin:16px auto;">';

  // Header
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">';
  html += '<div><div style="font-size:18px;font-weight:800;color:var(--t1);">🎯 '+data.nom+'</div>';
  html += '<div style="font-size:10px;color:var(--t3);">Profil partagé · '+data.date+'</div></div>';
  html += '<button onclick="document.getElementById(\'profil-invite-modal\').style.display=\'none\'" style="background:rgba(255,255,255,.06);border:1px solid var(--b2);border-radius:8px;color:var(--t2);font-size:12px;padding:6px 12px;cursor:pointer;">✕ Fermer</button>';
  html += '</div>';

  // Stats principales
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">';
  [{l:'Capital',v:capital.toFixed(2)+'€',c:'#f0b020'},{l:'Réussite',v:pct+'%',c:pct>=55?'#1ed760':pct>=45?'#f0b020':'#ff4545'},{l:'Profit',v:(profit>=0?'+':'')+profit.toFixed(2)+'€',c:profit>=0?'#1ed760':'#ff4545'}].forEach(function(s){
    html += '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:12px;text-align:center;">';
    html += '<div style="font-size:18px;font-weight:800;color:'+s.c+';">'+s.v+'</div>';
    html += '<div style="font-size:9px;color:var(--t3);margin-top:2px;">'+s.l+'</div></div>';
  });
  html += '</div>';

  // Paris en cours
  if(enCours.length) {
    html += '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:12px;margin-bottom:12px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">🔴 Paris en cours ('+enCours.length+')</div>';
    enCours.slice(0,5).forEach(function(p){
      html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);">';
      html += '<div style="font-size:10px;font-weight:700;color:var(--t1);flex:1;">'+(p.n||p.nom||'?')+'</div>';
      html += '<div style="font-size:10px;color:#4d84ff;">@'+(p.cote||'?')+'</div>';
      html += '<div style="font-size:10px;color:var(--t3);">'+(p.mise||'?')+'€</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  // Derniers paris
  if(archive.length) {
    html += '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:12px;margin-bottom:12px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">📊 Derniers paris</div>';
    archive.slice(-10).reverse().forEach(function(h){
      var rc = h.win?'#1ed760':h.nul?'#f0b020':'#ff4545';
      var rl = h.win?'V':h.nul?'N':'D';
      html += '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);">';
      html += '<div style="width:18px;height:18px;border-radius:50%;background:'+rc+';display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#fff;flex-shrink:0;">'+rl+'</div>';
      html += '<div style="font-size:10px;font-weight:700;color:var(--t1);flex:1;">'+(h.n||'?')+'</div>';
      html += '<div style="font-size:10px;color:'+rc+';">'+(h.profit>=0?'+':'')+parseFloat(h.profit||0).toFixed(2)+'€</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  // CTA télécharger l'app
  html += '<div style="text-align:center;padding:12px;background:rgba(77,132,255,.08);border:1px solid rgba(77,132,255,.2);border-radius:10px;">';
  html += '<div style="font-size:12px;color:var(--t1);font-weight:700;margin-bottom:6px;">🎮 Essaie GONES45 !</div>';
  html += '<div style="font-size:10px;color:var(--t3);">L\'app de suivi de paris sportifs</div>';
  html += '</div>';

  html += '</div>';
  modal.innerHTML = html;
  modal.style.display = 'flex';
  modal.onclick = function(e){ if(e.target===modal) modal.style.display='none'; };
}

/* Génère un identifiant court aléatoire de 6 caractères */
function genSimuId() {
  var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var id = '';
  for(var i=0;i<6;i++) id += chars[Math.floor(Math.random()*chars.length)];
  return id;
}

/* Sauvegarde la simu sur GitHub dans données/simulations/{id}.json */
async function githubSaveSimu(id, data) {
  // Passe par le Worker Cloudflare — le token GitHub est côté serveur
  // Aucun token nécessaire côté client, fonctionne pour tous les utilisateurs
  try {
    var workerUrl = 'https://fd-proxy.touraine-antoine.workers.dev/?host=github-simu&id='+encodeURIComponent(id);
    var r = await fetch(workerUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    return r.ok;
  } catch(e) { console.warn('githubSaveSimu error:', e); return false; }
}

function partagerSimu() {
  // Demander le prénom
  var prenom = prompt('Ton prénom (pour identifier ta simulation) :', '');
  if(!prenom) return;

  var data = exportSimuData();
  var groupCount = Object.keys(data.groups).length;
  if(!groupCount) { alert('Ta simulation est vide ! Entre des scores d\'abord.'); return; }

  data.nom = prenom.trim();
  data.date = new Date().toLocaleDateString('fr-FR');

  // Trouver le champion simulé
  var winner = getSimuWinner();

  // Afficher modal de partage
  var modal = document.getElementById('simu-share-modal');
  if(!modal) {
    modal = document.createElement('div');
    modal.id = 'simu-share-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
    document.body.appendChild(modal);
  }

  // Afficher état "en cours de sauvegarde"
  modal.innerHTML = '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:16px;padding:20px;max-width:420px;width:100%;text-align:center;">'
    +'<div style="font-size:28px;margin-bottom:12px;">⏳</div>'
    +'<div style="font-size:14px;font-weight:700;color:var(--t1);">Sauvegarde en cours…</div>'
    +'<div style="font-size:11px;color:var(--t3);margin-top:6px;">Publication sur GitHub</div>'
    +'</div>';
  modal.style.display = 'flex';

  var id = genSimuId();
  var url = window.location.origin + window.location.pathname + '?sim=' + id;
  var msg = '🏆 ' + prenom + ' — Ma simulation Coupe du Monde 2026 !\n';
  if(winner) msg += '🥇 Mon champion : ' + winner + '\n';
  msg += '👉 Voir ma simu : ' + url;

  function showShareModal(saved) {
    var waUrl2 = 'https://wa.me/?text=' + encodeURIComponent(msg);
    modal.innerHTML = '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:16px;padding:20px;max-width:420px;width:100%;max-height:80vh;overflow-y:auto;">'
      +'<div style="text-align:center;margin-bottom:16px;">'
      +'<div style="font-size:28px;">📤</div>'
      +'<div style="font-size:15px;font-weight:800;color:var(--t1);margin-top:6px;">Partager ta simulation</div>'
      +'<div style="font-size:11px;color:var(--t3);margin-top:4px;">'+prenom+' · '+groupCount+'/12 groupes remplis'+(winner?' · 🏆 '+winner:'')+'</div>'
      +(saved?'<div style="font-size:10px;color:var(--g);margin-top:4px;">✅ Sauvegardé sur GitHub</div>':'<div style="font-size:10px;color:var(--r);margin-top:4px;">❌ Échec sauvegarde — réessaie</div>')
      +'</div>'
      +'<textarea id="simu-share-url" readonly style="width:100%;height:52px;background:rgba(255,255,255,.04);border:1px solid var(--b2);border-radius:8px;color:var(--t3);font-size:11px;padding:8px;resize:none;margin-bottom:12px;box-sizing:border-box;">'+url+'</textarea>'
      +'<div style="display:flex;flex-direction:column;gap:8px;">'
      +'<a href="'+waUrl2+'" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;background:#25d366;border-radius:10px;color:#fff;font-size:14px;font-weight:800;text-decoration:none;">📱 Envoyer sur WhatsApp</a>'
      +'<button onclick="var t=document.getElementById(\'simu-share-url\');t.select();document.execCommand(\'copy\');this.innerText=\'✅ Copié !\';" style="padding:12px;background:rgba(255,255,255,.06);border:1px solid var(--b2);border-radius:10px;color:var(--t1);font-size:13px;font-weight:700;cursor:pointer;">📋 Copier le lien</button>'
      +'<button onclick="document.getElementById(\'simu-share-modal\').style.display=\'none\'" style="padding:10px;background:none;border:none;color:var(--t3);font-size:12px;cursor:pointer;">Fermer</button>'
      +'</div>'
      +'</div>';
  }

  // Sauvegarder via Worker Cloudflare (token côté serveur, fonctionne pour tous)
  githubSaveSimu(id, data).then(function(ok) {
    showShareModal(ok);
  });

  modal.onclick = function(e){ if(e.target===modal) modal.style.display='none'; };
}

function _traiterDataSimuRecue(data) {
  if(!data || !data.groups) return false;
  var recues = JSON.parse(localStorage.getItem('simu2026_recues')||'[]');
  var nom = data.nom || 'Joueur';
  var existe = recues.find(function(r){ return r.nom===nom && r.date===data.date; });
  if(!existe) {
    recues.unshift({nom:nom, date:data.date||'', data:data, recu:new Date().toLocaleDateString('fr-FR')});
    if(recues.length > 20) recues = recues.slice(0,20);
    localStorage.setItem('simu2026_recues', JSON.stringify(recues));
  }
  history.replaceState(null, '', window.location.pathname);
  setTimeout(function(){
    var btn = document.querySelector('[onclick*="t-simu"]');
    if(btn) btn.click();
    setTimeout(function(){
      alert('📥 Simulation de ' + nom + ' reçue et sauvegardée !\nTa propre simulation n\'a pas été modifiée.\nElle apparaît en haut de l\'onglet SIMU (section "Simis reçues").');
      renderSimuMain(null);
    }, 300);
  }, 500);
  return true;
}

function chargerSimuDepuisUrl() {
  // Nouveau système : ?sim=id6chars → fetch depuis GitHub Pages
  var params = new URLSearchParams(window.location.search);
  var simId = params.get('sim');
  if(simId && /^[a-z0-9]{6}$/.test(simId)) {
    var simUrl = encodeURI('https://gones45140.github.io/gones45/données/simulations/'+simId+'.json') + '?t=' + Date.now();
    fetch(simUrl).then(function(r){
      if(!r.ok) throw new Error('HTTP '+r.status);
      return r.json();
    }).then(function(data){
      _traiterDataSimuRecue(data);
    }).catch(function(e){
      console.warn('Impossible de charger la simu '+simId+':', e);
      alert('❌ Simulation introuvable ou expirée (id: '+simId+')');
      history.replaceState(null, '', window.location.pathname);
    });
    return true;
  }
  // Fallback : ancien système #simu=base64 (compatibilité liens existants)
  var hash = window.location.hash;
  if(!hash || hash.indexOf('#simu=') < 0) return false;
  try {
    var b64 = hash.replace('#simu=','');
    var json = decodeURIComponent(escape(atob(b64)));
    var data = JSON.parse(json);
    return _traiterDataSimuRecue(data);
  } catch(e) { return false; }
}

function renderRecuesList() {
  var recues = JSON.parse(localStorage.getItem('simu2026_recues')||'[]');
  if(!recues.length) return '';
  var html = '<div class="cwrap" style="margin-bottom:10px;">';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#f0b020;margin-bottom:10px;">📥 Simis reçues ('+recues.length+')</div>';
  recues.forEach(function(r,i){
    var winner = null;
    if(r.data&&r.data.ko&&r.data.ko.f&&r.data.ko.f[0]){
      var fm=r.data.ko.f[0];
      if(fm.sh!==''&&fm.sh!==undefined&&fm.sa!==undefined) winner=parseInt(fm.sh)>parseInt(fm.sa)?fm.home:parseInt(fm.sh)<parseInt(fm.sa)?fm.away:null;
    }
    html += '<div onclick="voirSimuRecue('+i+')" style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:8px;margin-bottom:6px;cursor:pointer;">';
    html += '<div style="font-size:20px;">🏆</div>';
    html += '<div style="flex:1;">';
    html += '<div style="font-size:12px;font-weight:800;color:var(--t1);">'+r.nom+'</div>';
    html += '<div style="font-size:10px;color:var(--t3);">Reçu le '+r.recu+(winner?' · Champion : '+winner:'')+'</div>';
    html += '</div>';
    html += '<div style="font-size:11px;color:#4d84ff;">Voir →</div>';
    html += '<button onclick="event.stopPropagation();supprSimuRecue('+i+')" style="background:rgba(255,69,69,.1);border:1px solid rgba(255,69,69,.3);border-radius:5px;color:#ff7b7b;font-size:10px;padding:4px 8px;cursor:pointer;">✕</button>';
    html += '</div>';
  });
  html += '</div>';
  return html;
}

function supprSimuRecue(i){
  var recues = JSON.parse(localStorage.getItem('simu2026_recues')||'[]');
  recues.splice(i,1);
  localStorage.setItem('simu2026_recues', JSON.stringify(recues));
  var el = getSimuContainer(); if(el) renderSimuMain(el);
}

function voirMatchsGroupeRecue(idxSimu, gid) {
  var recues = JSON.parse(localStorage.getItem('simu2026_recues')||'[]');
  var r = recues[idxSimu];
  if(!r || !r.data || !r.data.groups) return;
  var g = SIMU_GROUPES.find(function(x){return x.id===gid;});
  if(!g) return;
  var scores = r.data.groups[gid] || {};
  var pairs = getGroupPairs(g.teams);
  var lines = [];
  pairs.forEach(function(p){
    var k = p[0]+'_'+p[1];
    var s = scores[k];
    if(s && s.h!=='' && s.a!=='' && s.h!==undefined && s.a!==undefined){
      lines.push(p[0]+'  '+s.h+' - '+s.a+'  '+p[1]);
    } else {
      lines.push(p[0]+'  - : -  '+p[1]);
    }
  });
  alert('🏆 '+r.nom+' — Groupe '+gid+'\n\n'+lines.join('\n'));
}

function voirSimuRecue(idx) {
  var recues = JSON.parse(localStorage.getItem('simu2026_recues')||'[]');
  var r = recues[idx];
  if(!r) return;
  var el = getSimuContainer();
  if(!el) return;

  var data = r.data;
  var html = '<div style="padding:4px 0;">';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">';
  html += '<button onclick="renderSimuMain(null)" style="padding:6px 12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:6px;color:var(--t2);font-size:11px;cursor:pointer;">← Retour</button>';
  html += '<div style="font-size:15px;font-weight:800;color:var(--t1);">🏆 Simu de '+r.nom+'</div>';
  html += '<div style="font-size:10px;color:var(--t3);">'+r.date+'</div>';
  html += '</div>';

  // Afficher les groupes en lecture seule
  html += '<div class="cwrap" style="margin-bottom:10px;">';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">📊 Phase de groupes</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">';

  SIMU_GROUPES.forEach(function(g){
    // Recalculer le classement depuis les scores reçus
    var savedScores = data.groups[g.id] || {};
    var origScores = getSimuGroupScores(g.id);
    // Temporairement utiliser les scores reçus
    localStorage.setItem(simuKey(g.id), JSON.stringify(savedScores));
    var standings = calcSimuStandings(g.id);
    // Restaurer les scores originaux
    localStorage.setItem(simuKey(g.id), JSON.stringify(origScores));

    var isFr = g.id==='I';
    html += '<div style="background:'+(isFr?'rgba(77,132,255,.08)':'rgba(255,255,255,.02)')+';border:1px solid '+(isFr?'rgba(77,132,255,.4)':'rgba(255,255,255,.07)')+';border-radius:8px;padding:8px;">';
    html += '<div onclick="voirMatchsGroupeRecue('+idx+',\''+g.id+'\')" style="font-size:9px;font-weight:800;color:'+(isFr?'#4d84ff':'#4f5d88')+';margin-bottom:5px;cursor:pointer;">GROUPE '+g.id+' <span style="color:#4d84ff;">▾ matchs</span></div>';
    standings.forEach(function(t,i){
      var qual = i<2;
      html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:1px 0;">';
      html += '<div style="display:flex;align-items:center;font-size:9px;color:'+(t.name==='France'?'#4d84ff':qual?'var(--t1)':'var(--t2)')+';font-weight:'+(qual?700:400)+';">'+flagImg(t.name,12)+(qual?'✅ ':'')+t.name+'</div>';
      var _db=t.gf-t.ga; html += '<div style="display:flex;align-items:center;gap:6px;"><span style="font-size:8px;font-weight:600;color:'+(_db>0?'#1ed760':_db<0?'#ff7b7b':'var(--t3)')+';">'+(_db>0?'+':'')+_db+'</span><span style="font-size:9px;font-weight:700;color:'+(t.pts>0?'#f0b020':'var(--t3)')+';">'+t.pts+'pts</span></div>';
      html += '</div>';
    });
    html += '</div>';
  });
  html += '</div></div>';

  // Knockout reçu
  var KO_ROUNDS = [
    {key:'r32',label:'16e de finale',col:'#4f5d88'},
    {key:'r16',label:'8e de finale',col:'#4d84ff'},
    {key:'qf', label:'Quarts',col:'#a78bfa'},
    {key:'sf', label:'Demi-finales',col:'#f0b020'},
    {key:'f',  label:'🏆 Finale',col:'#1ed760'}
  ];
  KO_ROUNDS.forEach(function(r){
    var matches = (data.ko||{})[r.key]||[];
    if(!matches.length) return;
    html += '<div class="cwrap" style="margin-bottom:8px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:'+r.col+';margin-bottom:8px;">'+r.label+'</div>';
    matches.forEach(function(m){
      var played = m.sh!==''&&m.sh!==undefined&&m.sa!==''&&m.sa!==undefined;
      var isFr = m.home==='France'||m.away==='France';
      html += '<div style="display:flex;align-items:center;gap:6px;padding:6px;background:'+(isFr?'rgba(77,132,255,.06)':'rgba(255,255,255,.02)')+';border-radius:6px;margin-bottom:4px;">';
      html += '<div style="display:flex;align-items:center;justify-content:flex-end;flex:1;font-size:10px;font-weight:'+(isFr?700:500)+';color:'+(m.home==='France'?'#4d84ff':'var(--t1)')+';">'+flagImg(m.home,14)+m.home+'</div>';
      if(played){
        var hw=parseInt(m.sh),aw=parseInt(m.sa);
        html += '<div style="font-size:12px;font-weight:800;min-width:50px;text-align:center;"><span style="color:'+(hw>aw?'#1ed760':hw<aw?'#ff4545':'#f0b020')+';">'+hw+'</span><span style="color:var(--t3);"> - </span><span style="color:'+(aw>hw?'#1ed760':aw<hw?'#ff4545':'#f0b020')+';">'+aw+'</span></div>';
        if(r.key==='f'&&hw!==aw){
          var winner=hw>hw?m.home:m.away;
        }
      } else {
        html += '<div style="font-size:9px;color:#4f5d88;min-width:50px;text-align:center;">vs</div>';
      }
      html += '<div style="display:flex;align-items:center;flex:1;font-size:10px;font-weight:'+(isFr?700:500)+';color:'+(m.away==='France'?'#4d84ff':'var(--t1)')+';">'+flagImg(m.away,14)+m.away+'</div>';
      html += '</div>';
    });
    // Champion final
    if(r.key==='f'&&matches[0]&&matches[0].sh!==''&&matches[0].sh!==undefined){
      var fm=matches[0];
      var w=parseInt(fm.sh)>parseInt(fm.sa)?fm.home:parseInt(fm.sh)<parseInt(fm.sa)?fm.away:null;
      if(w) html += '<div style="text-align:center;padding:12px;background:rgba(240,176,32,.1);border:1px solid rgba(240,176,32,.3);border-radius:8px;margin-top:8px;"><div style="font-size:20px;">🏆</div><div style="font-size:14px;font-weight:800;color:#f0b020;">'+flagImg(w,18)+w+'</div><div style="font-size:10px;color:var(--t3);">Champion du Monde selon '+r.nom+'</div></div>';
    }
    html += '</div>';
  });

  // Simis reçues
  var recues = JSON.parse(localStorage.getItem('simu2026_recues')||'[]');
  if(recues.length) {
    html += '<div class="cwrap" style="margin-top:10px;">';
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">📥 Simis reçues ('+recues.length+')</div>';
    recues.forEach(function(r,i){
      var winner = null;
      if(r.data&&r.data.ko&&r.data.ko.f&&r.data.ko.f[0]){
        var fm=r.data.ko.f[0];
        if(fm.sh!==''&&fm.sh!==undefined&&fm.sa!==undefined) winner=parseInt(fm.sh)>parseInt(fm.sa)?fm.home:parseInt(fm.sh)<parseInt(fm.sa)?fm.away:null;
      }
      html += '<div onclick="voirSimuRecue('+i+')" style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:8px;margin-bottom:6px;cursor:pointer;">';
      html += '<div style="font-size:20px;">🏆</div>';
      html += '<div style="flex:1;">';
      html += '<div style="font-size:12px;font-weight:800;color:var(--t1);">'+r.nom+'</div>';
      html += '<div style="font-size:10px;color:var(--t3);">Reçu le '+r.recu+(winner?' · Champion : '+winner:'')+'</div>';
      html += '</div>';
      html += '<div style="font-size:11px;color:#4d84ff;">Voir →</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  html += '</div>';
  el.innerHTML = html;
}

function resetSimu2026() {
  if(!confirm('Réinitialiser toute la simulation ?')) return;
  SIMU_GROUPES.forEach(function(g){ localStorage.removeItem(simuKey(g.id)); });
  ['r32','r16','qf','sf','f'].forEach(function(k){ localStorage.removeItem(simuKoKey(k)); });
  var el = getSimuContainer();
  if(el) renderSimuMain(el);
}

async function loadTeamSaisons() {
  var el = document.getElementById('ip-saisons');
  if(!el) return;

  // Récupérer nom depuis le titre affiché
  var nom = (typeof _currentTeam !== 'undefined' ? _currentTeam : '') || _currentUnitNom || '';
  if(!nom) { el.innerHTML = '<div class="empty">Equipe non trouvee</div>'; return; }

  // Détection sport
  var uObj2 = state.u.find(function(u){ return u.n === nom; }) || {};
  var sport2 = uObj2.sport || '⚽';
  if(sport2==='🏒'||sport2==='🏒🇺🇸'||NHL_TEAMS[nom]) { loadNhlSaisons(el, nom); return; }
  if(sport2==='⚾'||sport2==='⚾🇺🇸'||MLB_TEAMS[nom]) { loadMlbSaisons(el, nom); return; }
  if(sport2==='🏀'||sport2==='🏀🇺🇸'||NBA_TEAMS[nom]||resolveNbaTeam(nom)) { loadNbaSaisons(el, nom); return; }
  if(sport2==='🏎️'||sport2==='🏎'||F1_TEAMS[nom]||F1_DRIVERS[nom]) { loadF1Saisons(el, nom); return; }
  if(sport2==='🎾'||TENNIS_PLAYERS[nom]) { loadTennisSaisons(el, nom); return; }
  if(sport2==='🏈'||sport2==='🏈🇺🇸'||NFL_TEAMS[nom]) { loadNflSaisons(el, nom); return; }
  if(sport2==='🏉'||sport2==='🏉🇦🇺') { loadRugbySaisons(el, nom); return; }

  // Trouver ID football
  var teamId = null;
  for(var k in TEAM_IDS) {
    if(k.toLowerCase()===nom.toLowerCase() || nom.toLowerCase().indexOf(k.toLowerCase())>=0 || k.toLowerCase().indexOf(nom.toLowerCase())>=0) {
      teamId = TEAM_IDS[k]; break;
    }
  }

  if(!teamId) {
    el.innerHTML = '<div class="fc" style="text-align:center;color:var(--t3);padding:20px;">&#9888;&#65039; Equipe non trouvee dans la base.<br><small>Verifie le nom exact.</small></div>';
    return;
  }

  // Cache
  if(_saisonsCache[teamId]) { renderSaisonsChart(el, _saisonsCache[teamId], nom); return; }

  el.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:20px;color:var(--t3);"><div style="width:16px;height:16px;border:2px solid rgba(77,132,255,.2);border-top-color:#4d84ff;border-radius:50%;animation:spin .8s linear infinite;"></div>Chargement des 2 dernières saisons...</div>';

  // Charger saison en cours + saison précédente
  // Charger les 50 derniers matchs et séparer par saison
  var results = {};
  var allData = await fdFetch('/v4/teams/'+teamId+'/matches?status=FINISHED&limit=60');
  
  if(allData && allData.matches && allData.matches.length) {
    var matches2526 = []; // saison 2025-2026 : après août 2025
    var matches2425 = []; // saison 2024-2025 : entre août 2024 et juillet 2025
    
    allData.matches.forEach(function(m) {
      var d = new Date(m.utcDate);
      var y = d.getFullYear();
      var mo = d.getMonth(); // 0=jan, 7=août
      // Saison 2025-2026 : août 2025 (mois 7, année 2025) à juillet 2026
      if((y === 2025 && mo >= 7) || y === 2026) {
        matches2526.push(m);
      }
      // Saison 2024-2025 : août 2024 à juillet 2025
      else if((y === 2024 && mo >= 7) || (y === 2025 && mo < 7)) {
        matches2425.push(m);
      }
    });
    
    if(matches2526.length) results['2025'] = matches2526;
    if(matches2425.length) results['2024'] = matches2425;
  }
  
  var saisons = Object.keys(results).sort().reverse();

  if(!Object.keys(results).length) {
    var sofaFb = SOFASCORE_LINKS[nom] || ('https://www.sofascore.com/search#q=' + encodeURIComponent(nom));
    var flashFb = FAV_LINKS[nom] || ('https://www.flashscore.fr/recherche/?q=' + encodeURIComponent(nom));
    var ls = 'display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;margin-bottom:6px;text-decoration:none;';
    el.innerHTML = '<div style="padding:4px 0;">'
      +'<div class="cwrap" style="margin-bottom:10px;">'
      +'<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:6px;">⚽ ' + nom + ' — Accès direct</div>'
      +'<div style="font-size:10px;color:var(--t3);margin-bottom:12px;">Données non disponibles via football-data.org. Consulter directement :</div>'
      +'<a href="'+sofaFb+'" target="_blank" style="'+ls+'"><div style="font-size:12px;font-weight:700;color:#ff7b54;flex:1;">⚡ Sofascore — Stats & résultats</div><div style="color:var(--t3);">→</div></a>'
      +'<a href="'+flashFb+'" target="_blank" style="'+ls+'"><div style="font-size:12px;font-weight:700;color:#f0b020;flex:1;">⚡ Flashscore — Résultats live</div><div style="color:var(--t3);">→</div></a>'
      +'<a href="https://fbref.com/fr/search/search.fcgi?search='+encodeURIComponent(nom)+'" target="_blank" style="'+ls+'"><div style="font-size:12px;font-weight:700;color:#4d84ff;flex:1;">📊 FBref — Stats avancées</div><div style="color:var(--t3);">→</div></a>'
      +'</div></div>';
    return;
  }

  _saisonsCache[teamId] = results;
  renderSaisonsChart(el, results, nom);
}


// ── FILTRES ONGLET SAISONS ──
function updateSaisonFilter() {
  var allChk = document.getElementById('sf-all');
  if(!allChk) return;
  // Si on coche "Toutes" → décocher les autres
  if(allChk.checked) {
    ['Championnat','Coupe_Europe','Coupe_Nationale','Autre'].forEach(function(g){
      var el=document.getElementById('sf-'+g); if(el) el.checked=false;
    });
    localStorage.setItem('g45_saison_filters', JSON.stringify({all:true}));
  } else {
    // Si on coche un groupe → décocher "Toutes"
    localStorage.setItem('g45_saison_filters', JSON.stringify({
      all: false,
      'sf-Championnat': !!(document.getElementById('sf-Championnat')&&document.getElementById('sf-Championnat').checked),
      'sf-Coupe_Europe': !!(document.getElementById('sf-Coupe_Europe')&&document.getElementById('sf-Coupe_Europe').checked),
      'sf-Coupe_Nationale': !!(document.getElementById('sf-Coupe_Nationale')&&document.getElementById('sf-Coupe_Nationale').checked),
      'sf-Autre': !!(document.getElementById('sf-Autre')&&document.getElementById('sf-Autre').checked),
    }));
  }
  // Recharger les saisons
  _saisonsCache = {};
  loadTeamSaisons();
}


var COMP_ICONS = {
  'Bundesliga': '🇩🇪',
  'Brasileirao': '🇧🇷',
  'Serie A Brasileira': '🇧🇷',
  'Brasileirão': '🇧🇷',
  'Liga Profesional': '🇦🇷',
  'Superliga Argentina': '🇦🇷',
  'Eredivisie': '🇳🇱',
  'Primeira Liga': '🇵🇹',
  'Pro League': '🇧🇪',
  'Super League': '🇨🇭',
  'Super Lig': '🇹🇷',
  'Allsvenskan': '🇸🇪',
  'Ekstraklasa': '🇵🇱',
  'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Primera Division': '🇪🇸',
  'Serie A': '🇮🇹',
  'Ligue 1': '🇫🇷',
  'Eredivisie': '🇳🇱',
  'Primeira Liga': '🇵🇹',
  'UEFA Champions League': '⭐',
  'UEFA Europa League': '🟠',
  'UEFA Europa Conference League': '🟢',
  'DFB-Pokal': '🏆',
  'FA Cup': '🏆',
  'Coupe de France': '🏆',
  'Coppa Italia': '🏆',
  'Copa del Rey': '🏆',
  'Taca de Portugal': '🏆',
  'KNVB Beker': '🏆',
};

var COMP_FLAGS = {
  'Bundesliga':'de','Brasileirao':'br','Serie A Brasileira':'br','Brasileirão':'br',
  'Liga Profesional':'ar','Superliga Argentina':'ar','Eredivisie':'nl',
  'Primeira Liga':'pt','Pro League':'be','Super League':'ch','Super Lig':'tr',
  'Allsvenskan':'se','Ekstraklasa':'pl','Premier League':'gb-eng',
  'Primera Division':'es','Serie A':'it','Ligue 1':'fr',
  'UEFA Champions League':null,'UEFA Europa League':null,'UEFA Europa Conference League':null
};
function getCompIcon(name) {
  if(!name) return '⚽';
  for(var k in COMP_FLAGS) {
    if(name.indexOf(k) >= 0) {
      var cc = COMP_FLAGS[k];
      if(cc) return '<img src="https://flagcdn.com/w20/'+cc+'.png" style="width:18px;height:12px;object-fit:cover;border-radius:2px;vertical-align:middle;" loading="lazy">';
      // Compétitions européennes
      if(name.indexOf('Champions')>=0) return '⭐';
      if(name.indexOf('Europa')>=0&&name.indexOf('Conference')<0) return '🟠';
      if(name.indexOf('Conference')>=0) return '🟢';
    }
  }
  if(name.indexOf('Cup')>=0||name.indexOf('Pokal')>=0||name.indexOf('Coupe')>=0||name.indexOf('Copa')>=0||name.indexOf('Taca')>=0||name.indexOf('KNVB')>=0) return '🏆';
  if(name.indexOf('League')>=0||name.indexOf('Liga')>=0||name.indexOf('Division')>=0) return '🏟️';
  return '⚽';
}

function filterMatchesByComp(matches, filters) {
  if(!filters || filters.all) return matches;
  return matches.filter(function(m){
    var ct = m.competition&&m.competition.type||'';
    var cn = m.competition&&m.competition.name||'';
    if(filters['sf-Championnat'] && ct==='LEAGUE') return true;
    if(filters['sf-Coupe_Europe'] && ct==='CUP' && (cn.indexOf('Champion')>=0||cn.indexOf('Europa')>=0||cn.indexOf('UEFA')>=0||cn.indexOf('Conference')>=0)) return true;
    if(filters['sf-Coupe_Nationale'] && ct==='CUP' && !(cn.indexOf('Champion')>=0||cn.indexOf('Europa')>=0||cn.indexOf('UEFA')>=0||cn.indexOf('Conference')>=0)) return true;
    if(filters['sf-Autre'] && ct!=='LEAGUE' && ct!=='CUP') return true;
    return false;
  });
}

function calcSaisonStats(matchesRaw, teamId) {
  // Trier du plus récent au plus ancien
  var matches = matchesRaw.slice().sort(function(a,b){ return new Date(b.utcDate)-new Date(a.utcDate); });
  var stats = {
    n:0, over05:0, over15:0, over25:0, over35:0, over45:0, bts:0,
    domW:0, domD:0, domL:0, domN:0, extW:0, extD:0, extL:0, extN:0,
    butsM:0, butsE:0,
    cleanSheet:0, failedToScore:0, scoredFirst:0,
    btsFH:0, over15FH:0,
    last5:[], serie:0, serieType:'',
    byComp:{}
  };

  matches.forEach(function(m) {
    var hg = (m.score&&m.score.regularTime?m.score.regularTime.home:m.score&&m.score.fullTime?m.score.fullTime.home:0)||0;
    var ag = (m.score&&m.score.regularTime?m.score.regularTime.away:m.score&&m.score.fullTime?m.score.fullTime.away:0)||0;
    var hh = m.score&&m.score.halfTime ? (m.score.halfTime.home||0) : 0;
    var ah = m.score&&m.score.halfTime ? (m.score.halfTime.away||0) : 0;
    var total = hg+ag;
    var isDom = m.homeTeam && m.homeTeam.id === teamId;
    var teamGoals = isDom ? hg : ag;
    var oppGoals = isDom ? ag : hg;
    var teamHT = isDom ? hh : ah;
    var oppHT = isDom ? ah : hh;

    stats.n++;
    if(total>0.5){stats.over05++;}else{stats.under05=(stats.under05||0)+1;}
    if(total>1.5){stats.over15++;}else{stats.under15=(stats.under15||0)+1;}
    if(total>2.5){stats.over25++;}else{stats.under25=(stats.under25||0)+1;}
    if(total>3.5){stats.over35++;}else{stats.under35=(stats.under35||0)+1;}
    if(total>4.5){stats.over45++;}else{stats.under45=(stats.under45||0)+1;}
    if(hg>0&&ag>0) stats.bts++;
    if(oppGoals===0) stats.cleanSheet++;
    if(teamGoals===0) stats.failedToScore++;
    if(hh>0&&ah>0) stats.btsFH++;
    if(hh+ah>1.5) stats.over15FH++;
    stats.butsM += teamGoals;
    stats.butsE += oppGoals;

    // Score en premier
    if(isDom && hh>0 && hh>ah) stats.scoredFirst++;
    else if(!isDom && ah>0 && ah>hh) stats.scoredFirst++;

    var won = teamGoals>oppGoals, draw = teamGoals===oppGoals;
    if(isDom) {
      stats.domN++;
      if(won) stats.domW++; else if(draw) stats.domD++; else stats.domL++;
      if(total>0.5) stats.domOver05=(stats.domOver05||0)+1;
      if(total>1.5) stats.domOver15=(stats.domOver15||0)+1;
      if(total>2.5) stats.domOver25=(stats.domOver25||0)+1;
      if(total>3.5) stats.domOver35=(stats.domOver35||0)+1;
      if(total>4.5) stats.domOver45=(stats.domOver45||0)+1;
      if(hg>0&&ag>0) stats.domBts=(stats.domBts||0)+1;
    } else {
      stats.extN++;
      if(won) stats.extW++; else if(draw) stats.extD++; else stats.extL++;
      if(total>0.5) stats.extOver05=(stats.extOver05||0)+1;
      if(total>1.5) stats.extOver15=(stats.extOver15||0)+1;
      if(total>2.5) stats.extOver25=(stats.extOver25||0)+1;
      if(total>3.5) stats.extOver35=(stats.extOver35||0)+1;
      if(total>4.5) stats.extOver45=(stats.extOver45||0)+1;
      if(hg>0&&ag>0) stats.extBts=(stats.extBts||0)+1;
    }

    // 5 derniers matchs
    if(stats.last5.length < 5) {
      var mDate = new Date(m.utcDate);
      var mDateStr = mDate.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
      stats.last5.push({
        id: m.id||null,
        w: won, d: draw,
        score: (isDom ? hg+'-'+ag : ag+'-'+hg),
        adv: isDom ? (m.awayTeam&&m.awayTeam.name||'?') : (m.homeTeam&&m.homeTeam.name||'?'),
        isDom: isDom,
        comp: m.competition&&m.competition.name||'',
        compIcon: getCompIcon(m.competition&&m.competition.name||''),
        date: mDateStr
      });
    }

    // Par compétition
    var cn = m.competition&&m.competition.name||'Autre';
    if(!stats.byComp[cn]) stats.byComp[cn]={n:0,w:0,over25:0,buts:0};
    stats.byComp[cn].n++;
    if(won) stats.byComp[cn].w++;
    if(total>2.5) stats.byComp[cn].over25++;
    stats.byComp[cn].buts += total;
  });

  // Série en cours
  var sortedM = matches.slice().sort(function(a,b){ return new Date(b.utcDate)-new Date(a.utcDate); });
  var serieCount = 0, serieT = '';
  for(var i=0;i<sortedM.length;i++){
    var m=sortedM[i];
    var hg=(m.score&&m.score.regularTime?m.score.regularTime.home:m.score&&m.score.fullTime?m.score.fullTime.home:0)||0;
    var ag=(m.score&&m.score.regularTime?m.score.regularTime.away:m.score&&m.score.fullTime?m.score.fullTime.away:0)||0;
    var isDom=m.homeTeam&&m.homeTeam.id===teamId;
    var tg=isDom?hg:ag, og=isDom?ag:hg;
    var r=tg>og?'W':tg===og?'D':'L';
    if(i===0){serieT=r;}
    if(r===serieT){serieCount++;}else{break;}
  }
  stats.serie=serieCount; stats.serieType=serieT;

  return stats;
}

function pct(v,n) { return n ? Math.round(v/n*100) : 0; }


/* ══ CLASSEMENT LIGUE ══ */
async function loadStandings(nom, teamId, filteredMatches) {
  // Trouver le code de la ligue depuis les matchs
  var leagueCode = null;
  var LEAGUE_CODES = ['PL','PD','BL1','SA','FL1','PPL','CL','EL'];
  for(var i=0;i<filteredMatches.length;i++){
    var m = filteredMatches[i];
    var code = m.competition && m.competition.code;
    if(code && LEAGUE_CODES.indexOf(code)>=0 && code!=='CL' && code!=='EL') {
      leagueCode = code;
      break;
    }
  }
  if(!leagueCode) return null;

  try {
    var data = await fdFetch('/v4/competitions/'+leagueCode+'/standings');
    if(!data || !data.standings || !data.standings.length) return null;
    var table = data.standings[0].table || [];
    var compName = data.competition && data.competition.name || '';
    return {table: table, compName: compName, leagueCode: leagueCode};
  } catch(e) { return null; }
}

function renderStandingsTable(standData, teamId) {
  if(!standData || !standData.table) return '';
  var table = standData.table;
  var html = '';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin:12px 0 8px;">'+getCompIcon(standData.compName)+' Classement '+standData.compName+'</div>';
  html += '<div style="display:grid;grid-template-columns:24px 1fr 28px 28px 28px 28px 32px;gap:3px;align-items:center;font-size:8px;color:#4f5d88;font-weight:700;padding:3px 4px;margin-bottom:4px;">';
  html += '<div>#</div><div>Équipe</div><div style="text-align:center">J</div><div style="text-align:center">G</div><div style="text-align:center">N</div><div style="text-align:center">P</div><div style="text-align:center">Pts</div>';
  html += '</div>';

  // Zone affichée : équipe ±5 ou top 6 + équipe
  var teamRow = table.find(function(r){ return r.team && r.team.id === teamId; });
  var teamPos = teamRow ? teamRow.position : 0;

  // Afficher tout le tableau
  var showAll = false;
  var showBtn = table.length > 12;
  var displayTable = showAll ? table : table;

  table.forEach(function(r){
    var isOur = r.team && r.team.id === teamId;
    var pos = r.position;
    var cl = pos<=4?'rgba(30,215,96,.08)':pos>=table.length-2?'rgba(255,69,69,.06)':'rgba(255,255,255,.02)';
    var posCol = pos<=4?'#1ed760':pos>=table.length-2?'#ff4545':'#4f5d88';
    var bg = isOur ? 'rgba(77,132,255,.15)' : cl;
    var border = isOur ? 'border:1px solid rgba(77,132,255,.4);' : 'border:1px solid rgba(255,255,255,.04);';

    html += '<div style="display:grid;grid-template-columns:24px 1fr 28px 28px 28px 28px 32px;gap:3px;align-items:center;background:'+bg+';'+border+'border-radius:5px;padding:5px 4px;margin-bottom:2px;">';
    html += '<div style="font-size:10px;font-weight:700;color:'+posCol+';">'+pos+'</div>';
    // Logo équipe + nom
    var teamName = r.team&&r.team.name||'?';
    var shortName = r.team&&r.team.shortName||teamName;
    var logo = r.team&&r.team.crest||'';
    html += '<div style="display:flex;align-items:center;gap:5px;overflow:hidden;">';
    if(logo) html += '<img src="'+logo+'" style="width:16px;height:16px;object-fit:contain;" loading="lazy" onerror="this.style.display=\'none\'">';
    html += '<div style="font-size:10px;font-weight:'+(isOur?'800':'400')+';color:'+(isOur?'#4d84ff':'var(--t1)')+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+shortName+'</div>';
    html += '</div>';
    // Stats
    ['playedGames','won','draw','lost'].forEach(function(k){
      html += '<div style="text-align:center;font-size:10px;color:var(--t2);">'+(r[k]||0)+'</div>';
    });
    html += '<div style="text-align:center;font-size:11px;font-weight:800;color:'+(isOur?'#4d84ff':r.points>0?'#f0b020':'var(--t3)')+';">'+(r.points||0)+'</div>';
    html += '</div>';
  });

  return html;
}
function renderSaisonsChart(el, results, nom) {
  var saisons = Object.keys(results).sort().reverse();
  var teamId = null;
  for(var k in TEAM_IDS) {
    if(k.toLowerCase()===nom.toLowerCase() || nom.toLowerCase().indexOf(k.toLowerCase())>=0) { teamId=TEAM_IDS[k]; break; }
  }

  // Détecter toutes les compétitions disponibles
  var allComps = {};
  saisons.forEach(function(s){
    (results[s]||[]).forEach(function(m){
      var cn = m.competition&&m.competition.name||'Autre';
      var ct = m.competition&&m.competition.type||'';
      if(!allComps[cn]) allComps[cn] = {type:ct, count:0};
      allComps[cn].count++;
    });
  });

  // Grouper par type
  var compGroups = {
    'Championnat': [],
    'Coupe Europe': [],
    'Coupe Nationale': [],
    'Autre': []
  };
  Object.keys(allComps).forEach(function(cn){
    var ct = allComps[cn].type;
    if(ct==='LEAGUE') compGroups['Championnat'].push(cn);
    else if(ct==='CUP' && (cn.indexOf('Champion')+cn.indexOf('Europa')+cn.indexOf('UEFA')+cn.indexOf('Conference'))>-3) compGroups['Coupe Europe'].push(cn);
    else if(ct==='CUP') compGroups['Coupe Nationale'].push(cn);
    else compGroups['Autre'].push(cn);
  });

  // Filtres actifs (par défaut tout coché)
  var _saisonFilters = JSON.parse(localStorage.getItem('g45_saison_filters')||'null') || {all:true};

  var html = '<div style="padding:4px 0;">';

  // Barre de filtres
  html += '<div class="cwrap" style="margin-bottom:10px;">';
  html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:10px;">Filtrer par compétition</div>';
  html += '<div style="display:flex;gap:6px;flex-wrap:wrap;" id="saison-filter-chips">';

  // Chip "Toutes"
  var allActive = !_saisonFilters || _saisonFilters.all;
  html += '<label style="display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:12px;border:1px solid '+(allActive?'rgba(77,132,255,.5)':'rgba(255,255,255,.1)')+';background:'+(allActive?'rgba(77,132,255,.12)':'none')+';cursor:pointer;font-size:10px;font-weight:700;color:'+(allActive?'#7aaaff':'var(--t3)')+';">'
    +'<input type="checkbox" id="sf-all" '+(allActive?'checked':'')+' onchange="updateSaisonFilter()" style="accent-color:var(--a);">Toutes</label>';

  // Chips par groupe
  var groupColors = {'Championnat':'#1ed760','Coupe Europe':'#f0b020','Coupe Nationale':'#ff7b54','Autre':'#a78bfa'};
  Object.keys(compGroups).forEach(function(g){
    if(!compGroups[g].length) return;
    var key = 'sf-'+g.replace(/ /g,'_');
    var active = _saisonFilters.all || (_saisonFilters[key]);
    var col = groupColors[g]||'#7aaaff';
    html += '<label style="display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:12px;border:1px solid '+(active?col.replace('#','rgba(').replace(/(..)(..)(..)/, function(m,r,g2,b){ return parseInt(r,16)+','+parseInt(g2,16)+','+parseInt(b,16); })+',.4)':'rgba(255,255,255,.1)')+';background:'+(active?'rgba(77,132,255,.08)':'none')+';cursor:pointer;font-size:10px;font-weight:700;color:'+(active?col:'var(--t3)')+';">'
      +'<input type="checkbox" id="'+key+'" '+(active?'checked':'')+' onchange="updateSaisonFilter()" style="accent-color:'+col+';">'+g+'</label>';
    // Tooltip avec les compétitions
    html += '';
  });
  html += '</div></div>';

  saisons.forEach(function(s) {
    var matches = results[s];
    var filters = JSON.parse(localStorage.getItem('g45_saison_filters')||'null');
    var filteredMatches = filterMatchesByComp(matches, filters);
    if(!filteredMatches.length) filteredMatches = matches; // fallback si filtre vide
    // Filtre dom/ext
    if(_statFilter==='dom') filteredMatches = filteredMatches.filter(function(m){return m.homeTeam&&m.homeTeam.id===teamId;});
    else if(_statFilter==='ext') filteredMatches = filteredMatches.filter(function(m){return m.awayTeam&&m.awayTeam.id===teamId;});
    var st = calcSaisonStats(filteredMatches, teamId);
    var champMatches = matches.filter(function(m){ return m.competition && (m.competition.type==='LEAGUE' || m.competition.code==='BL1'||m.competition.code==='PL'||m.competition.code==='PD'||m.competition.code==='SA'||m.competition.code==='FL1'||m.competition.code==='PPL'); });
    var stC = champMatches.length ? calcSaisonStats(champMatches, teamId) : null;

    html += '<div class="cwrap" style="margin-bottom:12px;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
    html += '<div style="font-size:13px;font-weight:800;color:var(--t1);">Saison '+s+'-'+(parseInt(s)+1)+'</div>';
    html += '<div style="font-size:10px;color:var(--t3);">'+st.n+' matchs'+(stC?' · '+champMatches.length+' champ.':'')+'</div>';
    html += '</div>';
    // Sélecteur stats rapides
    var QUICK_STATS = ['O0.5','O1.5','O2.5','O3.5','O4.5','U0.5','U1.5','U2.5','U3.5','U4.5','BTS','CS','WIN','LOSE'];
    if(!window._quickStats) window._quickStats = ['O2.5','BTS'];
    html += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">';
    QUICK_STATS.forEach(function(qs){
      var isOn = window._quickStats.indexOf(qs)>=0;
      html += '<button data-qs="'+qs+'" style="padding:4px 8px;border-radius:12px;border:1px solid rgba(255,255,255,'+(isOn?'.3':'.08')+');background:rgba(255,255,255,'+(isOn?'.15':'.04')+');color:'+(isOn?'var(--t1)':'var(--t3)')+';font-size:9px;font-weight:'+(isOn?'700':'400')+';cursor:pointer;" onclick="toggleQuickStat(this)">'+qs+'</button>';
    });
    html += '</div>';

    // ── Série + derniers matchs ──
    if(st.last5.length) {
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">Forme récente</div>';
      html += '<div style="display:grid;grid-template-columns:repeat('+st.last5.length+',1fr)'+(st.serie>1?' auto':'')+';gap:4px;margin-bottom:8px;">';
      st.last5.forEach(function(m){
        var col = m.w?'#1ed760':m.d?'#f0b020':'#ff4545';
        var advWords = (m.adv||'').split(' ');
        var skipWords = ['1.','FC','SC','VfL','VfB','SV','RB','TSG','SSC','AS','AC','RC','OGC','LOSC','AFC','CFR'];
        var advMain = advWords.filter(function(w){ return skipWords.indexOf(w)<0 && w.length>1; });
        var advShort = (advMain[0]||advWords[0]||'?').substring(0,7);
        var cmid = m.id||'';
        html += '<div onclick="ouvrirDetailMatch('+cmid+')" style="text-align:center;background:var(--s1);border-radius:8px;padding:6px 2px;border-top:3px solid '+col+';border:1px solid rgba(255,255,255,.06);border-top:3px solid '+col+';cursor:pointer;min-width:0;">';
        html += '<div style="font-size:10px;line-height:1.2;">'+(m.isDom?'🏠':'🚌')+'</div>';
        html += '<div style="font-size:16px;font-weight:800;color:'+col+';line-height:1.2;">'+m.score+'</div>';
        html += '<div style="font-size:8px;color:var(--t2);font-weight:600;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:0 2px;">'+advShort+'</div>';
        html += '<div style="font-size:8px;color:var(--t3);">'+m.date+'</div>';
        html += '</div>';
      });
      if(st.serie>1){
        var sc=st.serieType==='W'?'#1ed760':st.serieType==='D'?'#f0b020':'#ff4545';
        var sl=st.serieType==='W'?'V consec.':'Sans V';
        html += '<div style="padding:4px 8px;background:rgba(255,255,255,.04);border-radius:8px;text-align:center;display:flex;flex-direction:column;justify-content:center;">';
        html += '<div style="font-size:18px;font-weight:800;color:'+sc+';">'+st.serie+'</div>';
        html += '<div style="font-size:8px;color:rgba(255,255,255,.4);">'+sl+'</div></div>';
      }
      html += '</div>';
    }

    // ── Filtre Global / Dom / Ext ──
    
    html += '<div style="display:flex;gap:6px;margin-bottom:14px;">';
    ['global','dom','ext'].forEach(function(f){
      var lbl = f==='global'?'🌐 Global':f==='dom'?'🏠 Domicile':'🚌 Extérieur';
      var isOn = f===_statFilter;
      html += '<button onclick="_statFilter=\''+f+'\';document.getElementById(\'ip-saisons\').scrollTop=0;loadTeamSaisons();" style="flex:1;padding:7px 4px;border-radius:6px;border:1px solid rgba(255,255,255,'+(isOn?'.3':'.08')+');background:rgba(255,255,255,'+(isOn?'.12':'.04')+');color:'+(isOn?'var(--t1)':'var(--t3)')+';font-size:10px;font-weight:'+(isOn?'700':'400')+';cursor:pointer;">'+lbl+'</button>';
    });
    html += '</div>';
    // Stats filtrées
    var sf = _statFilter==='dom' ? {n:st.domN, over05:st.domOver05||0, over15:st.domOver15||0, over25:st.domOver25||0, over35:st.domOver35||0, over45:st.domOver45||0, under05:st.domUnder05||0, under15:st.domUnder15||0, under25:st.domUnder25||0, under35:st.domUnder35||0, under45:st.domUnder45||0, bts:st.domBts||0}
           : _statFilter==='ext' ? {n:st.extN, over05:st.extOver05||0, over15:st.extOver15||0, over25:st.extOver25||0, over35:st.extOver35||0, over45:st.extOver45||0, under05:st.extUnder05||0, under15:st.extUnder15||0, under25:st.extUnder25||0, under35:st.extUnder35||0, under45:st.extUnder45||0, bts:st.extBts||0}
           : st;
    var sfN = sf.n||1;

    // ── Over/Under bars avec sélecteur ──
    var ALL_STAT_ROWS = [
      {key:'O0.5',  label:'Over 0.5',  v:pct(sf.over05,sfN),         color:'#1ed760'},
      {key:'O1.5',  label:'Over 1.5',  v:pct(sf.over15,sfN),         color:'#4d84ff'},
      {key:'O2.5',  label:'Over 2.5',  v:pct(sf.over25,sfN),         color:'#f0b020'},
      {key:'O3.5',  label:'Over 3.5',  v:pct(sf.over35,sfN),         color:'#ff7b54'},
      {key:'O4.5',  label:'Over 4.5',  v:pct(sf.over45,sfN),         color:'#ff4545'},
      {key:'U0.5',  label:'Under 0.5', v:pct(sf.under05||0,sfN),     color:'#22d3ee'},
      {key:'U1.5',  label:'Under 1.5', v:pct(sf.under15||0,sfN),     color:'#67e8f9'},
      {key:'U2.5',  label:'Under 2.5', v:pct(sf.under25||0,sfN),     color:'#a5f3fc'},
      {key:'U3.5',  label:'Under 3.5', v:pct(sf.under35||0,sfN),     color:'#bae6fd'},
      {key:'U4.5',  label:'Under 4.5', v:pct(sf.under45||0,sfN),     color:'#e0f2fe'},
      {key:'BTS',   label:'BTS Oui',   v:pct(sf.bts,sfN),            color:'#a78bfa'},
      {key:'CS',    label:'Clean Sheet',v:pct(st.cleanSheet,st.n),   color:'#1ed760'},
    ];
    var activeRows = ALL_STAT_ROWS.filter(function(r){ return !window._quickStats || window._quickStats.length===0 || window._quickStats.indexOf(r.key)>=0; });
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">Stats sélectionnées</div>';
    html += '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px;">';
    activeRows.forEach(function(o){
      html += '<div style="display:flex;align-items:center;gap:8px;">';
      html += '<div style="font-size:10px;font-weight:700;color:var(--t2);width:78px;flex-shrink:0;">'+o.label+'</div>';
      html += '<div style="flex:1;height:8px;background:rgba(255,255,255,.06);border-radius:4px;">';
      html += '<div style="height:8px;border-radius:4px;background:'+o.color+';width:'+o.v+'%;transition:width .4s;"></div></div>';
      html += '<div style="font-size:11px;font-weight:800;color:'+o.color+';width:36px;text-align:right;">'+o.v+'%</div>';
      html += '</div>';
    });
    html += '</div>';

    // ── Dom vs Ext ──
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">Domicile vs Extérieur</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">';
    // Dom
    html += '<div style="background:rgba(30,215,96,.08);border:1px solid rgba(30,215,96,.2);border-radius:8px;padding:10px;text-align:center;">';
    html += '<div style="font-size:10px;color:var(--t3);margin-bottom:4px;">🏠 Domicile ('+st.domN+')</div>';
    html += '<div style="font-size:11px;color:#1ed760;font-weight:700;">'+st.domW+'V '+st.domD+'N '+st.domL+'D</div>';
    html += '<div style="font-size:18px;font-weight:800;color:#1ed760;margin-top:2px;">'+pct(st.domW,st.domN)+'%</div>';
    html += '</div>';
    // Ext
    html += '<div style="background:rgba(77,132,255,.08);border:1px solid rgba(77,132,255,.2);border-radius:8px;padding:10px;text-align:center;">';
    html += '<div style="font-size:10px;color:var(--t3);margin-bottom:4px;">🚌 Extérieur ('+st.extN+')</div>';
    html += '<div style="font-size:11px;color:#4d84ff;font-weight:700;">'+st.extW+'V '+st.extD+'N '+st.extL+'D</div>';
    html += '<div style="font-size:18px;font-weight:800;color:#4d84ff;margin-top:2px;">'+pct(st.extW,st.extN)+'%</div>';
    html += '</div>';
    html += '</div>';

    // ── Buts moyens ──
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">Buts par match</div>';
    html += '<div style="display:flex;gap:8px;">';
    html += '<div style="flex:1;background:rgba(30,215,96,.08);border:1px solid rgba(30,215,96,.2);border-radius:8px;padding:10px;text-align:center;">';
    html += '<div style="font-size:10px;color:var(--t3);">Marqués</div>';
    html += '<div style="font-size:22px;font-weight:800;color:#1ed760;">'+(st.butsM/st.n).toFixed(1)+'</div>';
    html += '</div>';
    html += '<div style="flex:1;background:rgba(255,69,69,.08);border:1px solid rgba(255,69,69,.2);border-radius:8px;padding:10px;text-align:center;">';
    html += '<div style="font-size:10px;color:var(--t3);">Encaissés</div>';
    html += '<div style="font-size:22px;font-weight:800;color:#ff4545;">'+(st.butsE/st.n).toFixed(1)+'</div>';
    html += '</div>';
    html += '<div style="flex:1;background:rgba(240,176,32,.08);border:1px solid rgba(240,176,32,.2);border-radius:8px;padding:10px;text-align:center;">';
    html += '<div style="font-size:10px;color:var(--t3);">Total/match</div>';
    html += '<div style="font-size:22px;font-weight:800;color:#f0b020;">'+((st.butsM+st.butsE)/st.n).toFixed(1)+'</div>';
    html += '</div>';
    html += '</div>';

    // ── Stats offensives/défensives ──
    html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin:12px 0 8px;">Stats clés</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px;">';
    var statCards = [
      {l:'Clean Sheets', v:st.cleanSheet, t:st.n, c:'#1ed760'},
      {l:'Marque 1er', v:st.scoredFirst, t:st.n, c:'#4d84ff'},
      {l:'Sans marquer', v:st.failedToScore, t:st.n, c:'#ff4545'},
      {l:'BTS 1ère MT', v:st.btsFH, t:st.n, c:'#a78bfa'},
      {l:'Over 1.5 MT', v:st.over15FH, t:st.n, c:'#f0b020'},
      {l:'Moy buts/match', v:(st.butsM/st.n).toFixed(1), t:null, c:'#22d3ee'},
    ];
    statCards.forEach(function(sc){
      html += '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px;text-align:center;">';
      html += '<div style="font-size:17px;font-weight:800;color:'+sc.c+';">'+(sc.t?pct(sc.v,sc.t)+'%':sc.v)+'</div>';
      html += '<div style="font-size:8px;color:rgba(255,255,255,.4);margin-top:2px;">'+sc.l+(sc.t?' ('+sc.v+'/'+sc.t+')':'')+'</div>';
      html += '</div>';
    });
    html += '</div>';

    // ── Par compétition ──
    var comps = Object.entries(st.byComp).sort(function(a,b){return b[1].n-a[1].n;});
    if(comps.length > 1) {
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">Par compétition</div>';
      html += '<div style="display:flex;flex-direction:column;gap:5px;margin-bottom:8px;">';
      comps.forEach(function(e){
        var cn=e[0], cd=e[1];
        var wr=pct(cd.w,cd.n), o25=pct(cd.over25,cd.n), bpm=(cd.buts/cd.n).toFixed(1);
        html += '<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:rgba(255,255,255,.03);border-radius:6px;border:1px solid rgba(255,255,255,.06);">';
        html += '<div style="font-size:10px;font-weight:700;color:var(--t1);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+cn+'</div>';
        html += '<div style="font-size:9px;color:var(--t3);">'+cd.n+' matchs</div>';
        html += '<div style="font-size:10px;font-weight:700;color:#1ed760;min-width:30px;text-align:right;">'+wr+'%V</div>';
        html += '<div style="font-size:10px;font-weight:700;color:#f0b020;min-width:40px;text-align:right;">O2.5:'+o25+'%</div>';
        html += '<div style="font-size:10px;color:#22d3ee;min-width:30px;text-align:right;">'+bpm+'⚽</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    // ── Résultats complets de la saison ──
    var allMatchesSorted = filteredMatches.slice().sort(function(a,b){ return new Date(b.utcDate)-new Date(a.utcDate); });
    if(allMatchesSorted.length) {
      // Calculer le compteur de matchs qui remplissent TOUTES les conditions cochées
      var qs0 = window._quickStats || ['O2.5','BTS'];
      var matchCount = 0;
      allMatchesSorted.forEach(function(m){
        var hg0 = (m.score&&m.score.regularTime?m.score.regularTime.home:m.score&&m.score.fullTime?m.score.fullTime.home:0)||0;
        var ag0 = (m.score&&m.score.regularTime?m.score.regularTime.away:m.score&&m.score.fullTime?m.score.fullTime.away:0)||0;
        var isDom0 = m.homeTeam && m.homeTeam.id === teamId;
        var tg0 = isDom0?hg0:ag0, og0 = isDom0?ag0:hg0;
        var tot0 = hg0+ag0;
        var CHK0 = {'O0.5':tot0>0.5,'O1.5':tot0>1.5,'O2.5':tot0>2.5,'O3.5':tot0>3.5,'O4.5':tot0>4.5,'U0.5':tot0<=0.5,'U1.5':tot0<=1.5,'U2.5':tot0<=2.5,'U3.5':tot0<=3.5,'U4.5':tot0<=4.5,'BTS':hg0>0&&ag0>0,'CS':tg0===0||og0===0,'WIN':tg0>og0,'LOSE':tg0<og0};
        if(qs0.every(function(k){ return CHK0[k]!==undefined ? CHK0[k] : true; })) matchCount++;
      });
      var condLabel = qs0.join(' + ');
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin:12px 0 8px;">';
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;">📅 Résultats ('+allMatchesSorted.length+' matchs)</div>';
      html += '<div style="font-size:10px;font-weight:800;color:'+(matchCount>0?'#1ed760':'#ff4545')+';">✅ '+matchCount+'/'+allMatchesSorted.length+' — '+condLabel+'</div>';
      html += '</div>';
      html += '<div style="display:flex;flex-direction:column;gap:3px;">';
      allMatchesSorted.forEach(function(m){
        var hg = (m.score&&m.score.regularTime?m.score.regularTime.home:m.score&&m.score.fullTime?m.score.fullTime.home:0)||0;
        var ag = (m.score&&m.score.regularTime?m.score.regularTime.away:m.score&&m.score.fullTime?m.score.fullTime.away:0)||0;
        var isDom = m.homeTeam && m.homeTeam.id === teamId;
        var tg = isDom?hg:ag, og = isDom?ag:hg;
        var won = tg>og, draw = tg===og;
        var rc = won?'#1ed760':draw?'#f0b020':'#ff4545';
        var rl = won?'V':draw?'N':'D';
        var total = hg+ag;
        var d = new Date(m.utcDate);
        var dateStr = d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
        var comp = m.competition&&m.competition.name||'';
        var compIco = getCompIcon(comp);
        var homeName = m.homeTeam&&m.homeTeam.name||'?';
        var awayName = m.awayTeam&&m.awayTeam.name||'?';
        var isOurHome = isDom;

        var mid = m.id||'';
        // Barre combinée — vert si TOUTES les conditions cochées sont vraies
        var MATCH_CHECKS = {
          'O0.5': total>0.5, 'O1.5': total>1.5, 'O2.5': total>2.5,
          'O3.5': total>3.5, 'O4.5': total>4.5,
          'U0.5': total<=0.5, 'U1.5': total<=1.5, 'U2.5': total<=2.5, 'U3.5': total<=3.5, 'U4.5': total<=4.5,
          'BTS': hg>0&&ag>0, 'CS': tg===0||og===0, 'WIN': tg>og, 'LOSE': tg<og
        };
        var qs = window._quickStats || ['O2.5','BTS'];
        var allOk = qs.every(function(k){ return MATCH_CHECKS[k]!==undefined ? MATCH_CHECKS[k] : true; });
        var barColor = allOk ? '#1ed760' : '#ff4545';
        html += '<div onclick="ouvrirDetailMatch('+mid+')" style="display:grid;grid-template-columns:32px 1fr auto 1fr 36px;gap:4px;align-items:center;padding:5px 8px;background:'+(isOurHome?'rgba(255,255,255,.04)':'rgba(255,255,255,.02)')+';border-radius:6px;border-left:3px solid '+barColor+';cursor:pointer;" onmouseover="this.style.opacity=\'0.8\'" onmouseout="this.style.opacity=\'1\'">';
        // Date
        html += '<div style="font-size:9px;color:var(--t3);text-align:center;">'+dateStr+'</div>';
        // Equipe dom
        html += '<div style="font-size:10px;font-weight:'+(isOurHome?'800':'400')+';color:'+(isOurHome?'var(--t1)':'var(--t2)')+';text-align:right;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">'+homeName+'</div>';
        // Score
        html += '<div style="font-size:11px;font-weight:800;color:'+rc+';text-align:center;min-width:40px;">'+hg+' - '+ag+'</div>';
        // Equipe ext
        html += '<div style="font-size:10px;font-weight:'+(!isOurHome?'800':'400')+';color:'+(!isOurHome?'var(--t1)':'var(--t2)')+';overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">'+awayName+'</div>';
        // Over/BTS
        var badges = '';
        var qs = window._quickStats || ['O2.5','BTS'];
        var MATCH_CHECKS = {
          'O0.5': total>0.5, 'O1.5': total>1.5, 'O2.5': total>2.5,
          'O3.5': total>3.5, 'O4.5': total>4.5,
          'U0.5': total<=0.5, 'U1.5': total<=1.5, 'U2.5': total<=2.5, 'U3.5': total<=3.5, 'U4.5': total<=4.5,
          'BTS': hg>0&&ag>0, 'CS': tg===0&&og>0||tg>0&&og===0,
          'WIN': tg>og, 'LOSE': tg<og
        };
        var BADGE_COLORS = {
          'O0.5':'#1ed760','O1.5':'#4d84ff','O2.5':'#f0b020','O3.5':'#ff7b54','O4.5':'#ff4545',
          'U0.5':'#22d3ee','U1.5':'#67e8f9','U2.5':'#a5f3fc','U3.5':'#bae6fd','U4.5':'#e0f2fe',
          'BTS':'#a78bfa','CS':'#1ed760','WIN':'#1ed760','LOSE':'#ff4545','WIN':'#1ed760','LOSE':'#ff4545'
        };
        qs.forEach(function(k){
          if(MATCH_CHECKS[k]) badges += '<span style="color:'+BADGE_COLORS[k]+';">'+k+'</span> ';
        });
        html += '<div style="font-size:8px;text-align:right;min-width:40px;">'+compIco+'<br>'+badges+'</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    // ── Classement de la ligue ──
    if(!_standingsCache) _standingsCache = {};
    var cacheKey = nom + '_' + s;
    if(_standingsCache[cacheKey]) {
      html += renderStandingsTable(_standingsCache[cacheKey], teamId);
    } else {
      html += '<div id="std-'+s+'" data-nom="'+nom+'" data-tid="'+teamId+'" data-saison="'+s+'" style="font-size:10px;color:var(--t3);text-align:center;padding:8px;cursor:pointer;background:rgba(255,255,255,.03);border-radius:6px;" onclick="_loadStd(this)">📊 Charger le classement →</div>';
    }

    // ── Top buteurs ──
    html += '<div id="scorers-placeholder-'+s+'" data-nom="'+nom+'" data-saison="'+s+'" style="font-size:10px;color:var(--t3);text-align:center;padding:8px;cursor:pointer;background:rgba(255,255,255,.03);border-radius:6px;margin-top:8px;" onclick="_loadScorers(this)">⚽ Charger les top buteurs →</div>';

    html += '</div>'; // cwrap
  });

  html += '</div>';
  el.innerHTML = html;
}

async function loadTeamAI(nom) {
  var box = document.getElementById('team-ai-content');
  if (!box) return;
  // Brancher le bouton refresh
  var btn = document.getElementById('team-ai-refresh');
  if (btn) { btn.onclick = function(){ loadTeamAI(nom); }; }
  box.innerHTML = '<div style="display:flex;align-items:center;gap:8px;color:#4f5d88;"><div style="width:12px;height:12px;border:2px solid rgba(77,132,255,.2);border-top-color:#4d84ff;border-radius:50%;animation:spin .8s linear infinite;flex-shrink:0;"></div>Recherche en cours…</div>';

  var groqKey = getGeminiKey();
  var tavilyKey = getTavilyKey();

  // Stats perso
  var paris = state.a.filter(function(h){ return h.n === nom; });
  var wins = paris.filter(function(h){ return h.win&&!h.isCashout; }).length;
  var wr = paris.length ? (wins/paris.length*100).toFixed(0) : 0;
  var profit = paris.reduce(function(a,h){ return a+(h.win?(h.m*h.cote)-h.m:-h.m); }, 0);
  var cote = paris.length ? (paris.reduce(function(a,h){ return a+h.cote; },0)/paris.length).toFixed(2) : '—';
  var last5 = paris.slice(0,5).map(function(h){ return h.win?'V':'D'; }).join(' ');
  var statsPerso = nom+' : '+paris.length+' paris, '+wr+'% réussite, profit '+profit.toFixed(2)+'€, cote moy '+cote+', derniers résultats : '+last5;

  // Stats réelles via football-data proxy
  box.innerHTML = '<div style="display:flex;align-items:center;gap:8px;color:#4f5d88;"><div style="width:12px;height:12px;border:2px solid rgba(77,132,255,.2);border-top-color:#4d84ff;border-radius:50%;animation:spin .8s linear infinite;flex-shrink:0;"></div>Calcul des stats réelles…</div>';

  var teamId = null;
  for(var k in TEAM_IDS){ if(k.toLowerCase()===nom.toLowerCase()||nom.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(nom.toLowerCase())>=0){teamId=TEAM_IDS[k];break;} }

  // Utiliser uniquement les vraies stats football-data
  if(teamId && getFdorgKey()) {
    var matchData = await fdFetch('/v4/teams/'+teamId+'/matches?status=FINISHED&limit=10');
    if(matchData && matchData.matches && matchData.matches.length) {
      var st = calcSaisonStats(matchData.matches, teamId);
      var n = st.n;

      // Identifier les paris les plus solides
      var paris = [
        {label:'Over 2.5', val:pct(st.over25,n), n:st.over25+'/'+n},
        {label:'Over 3.5', val:pct(st.over35,n), n:st.over35+'/'+n},
        {label:'BTS Oui', val:pct(st.bts,n), n:st.bts+'/'+n},
        {label:'Victoire Dom', val:pct(st.domW,st.domN||1), n:st.domW+'/'+(st.domN||0)},
        {label:'Victoire Ext', val:pct(st.extW,st.extN||1), n:st.extW+'/'+(st.extN||0)},
        {label:'Clean Sheet', val:pct(st.cleanSheet,n), n:st.cleanSheet+'/'+n},
      ].sort(function(a,b){return b.val-a.val;});

      var html = '<div style="margin-bottom:10px;">';
      // Top 3 paris recommandés
      html += '<div style="font-size:9px;font-weight:700;letter-spacing:1px;color:#4f5d88;text-transform:uppercase;margin-bottom:8px;">Top paris — '+n+' derniers matchs</div>';
      paris.slice(0,4).forEach(function(p){
        var col = p.val>=70?'#1ed760':p.val>=50?'#f0b020':'#ff7b54';
        var badge = p.val>=70?'🔥':p.val>=50?'✓':'';
        html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">';
        html += '<div style="font-size:11px;font-weight:700;color:var(--t1);width:90px;flex-shrink:0;">'+badge+' '+p.label+'</div>';
        html += '<div style="flex:1;height:6px;background:rgba(255,255,255,.06);border-radius:3px;">';
        html += '<div style="height:6px;border-radius:3px;background:'+col+';width:'+p.val+'%;"></div></div>';
        html += '<div style="font-size:11px;font-weight:800;color:'+col+';min-width:36px;text-align:right;">'+p.val+'%</div>';
        html += '<div style="font-size:10px;color:var(--t3);min-width:32px;">'+p.n+'</div>';
        html += '</div>';
      });
      html += '</div>';
      html += '<div style="font-size:10px;color:#4f5d88;text-align:right;">Source : football-data.org ✓</div>';
      box.innerHTML = html;
      return;
    }
  }

  // Si pas de clé football-data — message simple
  var webCtx = '';

  if (!groqKey) {
    box.innerHTML = '<span style="color:#ff4545;">Configure ta clé Groq dans Outils.</span>';
    return;
  }

  var u = state.u.find(function(x){ return x.n===nom; });
  var isJoueur = u && u.type === 'joueur';
  var prompt = 'Tu es un expert paris sportifs. Voici mes stats personnelles sur '+nom+' : '+statsPerso+'.';
  if (isJoueur) prompt = 'Tu es un expert paris sportifs spécialisé dans les stats de joueurs. Voici mes stats de paris sur le joueur '+nom+' : '+statsPerso+'.';
  if (webCtx) prompt += ' Infos récentes sur cette équipe : '+webCtx+'.';
  if (isJoueur) {
    prompt += ' En 3-4 phrases max : stats recentes du joueur (buts, passes), forme actuelle, et 1-2 types de paris pertinents. Sois direct. En francais.';
  } else {
    prompt += ' Ces stats sont EXACTES. Utilise UNIQUEMENT ces chiffres. En 3 phrases : analyse la forme, identifie les paris les plus solides avec les vrais pourcentages, et donne une recommandation concrete. En francais.';
  }

  try {
    var r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {'Content-Type':'application/json','Authorization':'Bearer '+groqKey},
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{role:'user', content: prompt}],
        max_tokens: 200,
        temperature: 0.4
      })
    });
    var d = await r.json();
    if (d.error) throw new Error(d.error.message);
    var reply = d.choices[0].message.content.trim();
    // Mettre en gras les chiffres et % 
    reply = reply.replace(/(\d+[%€]|\d+\.\d+)/g, '<strong style="color:#e8eeff;">$1</strong>');
    box.innerHTML = reply;
  } catch(e) {
    box.innerHTML = '<span style="color:#ff4545;">Erreur : '+e.message+'</span>';
  }
}

window.onload=function(){if(!state.bkColors)state.bkColors={};loadCustomLinks();
// Lecture publique des stats partagées au démarrage (pour les amis sans token)
if(!localStorage.getItem('gones45_github_token')){ try { loadPublicStats(); } catch(e){} }_typeColors=JSON.parse(localStorage.getItem('g45_typecolors')||'{}');var _n=localStorage.getItem('gones45_note');var _ni=$i('pc-note');if(_ni&&_n)_ni.innerHTML=_n;var tk=localStorage.getItem('gones45_tavily_key');var tki=$i('tavily-key-input');if(tki&&tk)tki.value=tk;var ask=localStorage.getItem('gones45_apisports_key');var aski=$i('apisports-key-input');if(aski&&ask)aski.value=ask;
  /* Listener unique pour évolution bankroll — survivant aux re-renders */
  document.addEventListener('touchend',function(e){
    var cv=e.target;
    if(!cv||cv.id!=='cg')return;
    if(!GC)return;
    var t=e.changedTouches[0];
    var r=cv.getBoundingClientRect();
    var x=t.clientX-r.left;var y=t.clientY-r.top;
    try{
      var pts=GC.getElementsAtEventForMode({offsetX:x,offsetY:y},'nearest',{intersect:false},false);
      if(pts.length){
        var idx=pts[0].index;
        var lbl=GC.data.labels?GC.data.labels[idx]:'';
        var val=GC.data.datasets[0].data[idx];
        var parts=(lbl||'').split('||');
        var bar=$i('cib-global');var txt=$i('cib-global-txt');var v=$i('cib-global-val');
        if(bar&&txt&&v){
          bar.style.display='flex';
          txt.textContent=parts[0]||'Départ';
          v.textContent=parts[1]||(val!==null?(val>=0?'+':'')+parseFloat(val).toFixed(2)+'€':'');
          v.style.color=val>=0?'var(--g)':'var(--r)';
        }
      }
    }catch(err){}
  },{passive:true});
  var saved=localStorage.getItem('g45_dbx');
  /* token chargé via getValidToken() */
  var inp=$i('dbx-key-input');var saved=localStorage.getItem('gones45_dbx_token');if(inp)inp.value=saved?'(token enregistré)':'';
  var gk=localStorage.getItem('gones45_gemini_key');var gki=$i('gemini-key-input');if(gki&&gk)gki.value=gk;var fdk=localStorage.getItem('gones45_fdorg_key');var fdki=$i('fdorg-key-input');if(fdki&&fdk)fdki.value='(clé enregistrée)';var afk=localStorage.getItem('gones45_apifootball_key');var afki=$i('apifootball-key-input');if(afki&&afk)afki.value='(clé enregistrée)';var rapk=localStorage.getItem('gones45_rapidapi_key');var rapki=$i('rapidapi-key-input');if(rapki&&rapk)rapki.value='(clé enregistrée)';var ghk=localStorage.getItem('gones45_github_token');var ghki=$i('github-token-input');if(ghki&&ghk)ghki.value='(token enregistré)';

// ── APPARENCE — halo cartes ──
var _apStyle = 'halo';
var _apIntensity = 40;

function _applyCardStyle() {
  var root = document.documentElement;
  var p = _apIntensity / 100;
  var border, glow;
  if (_apStyle === 'off') {
    border = 'rgba(255,255,255,.06)';
    glow = 'none';
  } else if (_apStyle === 'fin') {
    border = 'rgba(77,132,255,' + Math.min(0.9,(0.1 + 0.8*p)).toFixed(2) + ')';
    glow = 'none';
  } else if (_apStyle === 'halo') {
    border = 'rgba(77,132,255,' + Math.min(0.9,(0.1 + 0.8*p)).toFixed(2) + ')';
    glow = '0 0 ' + Math.round(4+26*p) + 'px rgba(77,132,255,' + Math.min(0.7,(0.04+0.66*p)).toFixed(2) + '), 0 0 ' + Math.round(1+9*p) + 'px rgba(77,132,255,' + Math.min(0.9,(0.08+0.82*p)).toFixed(2) + ')';
  } else {
    border = 'rgba(77,132,255,' + Math.min(0.95,(0.15+0.8*p)).toFixed(2) + ')';
    glow = '0 0 ' + Math.round(8+34*p) + 'px rgba(77,132,255,' + Math.min(0.7,(0.06+0.64*p)).toFixed(2) + '), 0 0 ' + Math.round(3+15*p) + 'px rgba(77,132,255,' + Math.min(0.9,(0.1+0.8*p)).toFixed(2) + '), inset 0 0 ' + Math.round(3+17*p) + 'px rgba(77,132,255,' + Math.min(0.15,(0.008+0.142*p)).toFixed(2) + ')';
  }
  root.style.setProperty('--card-border', border);
  root.style.setProperty('--card-glow', glow);
  var prev = document.getElementById('ap-preview');
  if (prev) {
    prev.style.border = '1px solid ' + border;
    prev.style.boxShadow = glow;
  }
}

function setCardStyle(s) {
  _apStyle = s;
  localStorage.setItem('g45_ap_style', s);
  var labels = {off:'Aucun', fin:'Fin', halo:'Halo', intense:'Intense'};
  ['off','fin','halo','intense'].forEach(function(k) {
    var b = document.getElementById('ap-' + k);
    if (!b) return;
    if (k === s) {
      b.style.borderColor = 'rgba(77,132,255,.7)';
      b.style.background = 'rgba(77,132,255,.18)';
      b.style.color = '#7aaaff';
      b.textContent = labels[k] + ' ✓';
    } else {
      b.style.borderColor = 'rgba(255,255,255,.08)';
      b.style.background = 'var(--bg3)';
      b.style.color = 'var(--t3)';
      b.textContent = labels[k];
    }
  });
  _applyCardStyle();
}

function updateCardIntensity(v) {
  _apIntensity = parseInt(v);
  localStorage.setItem('g45_ap_intensity', v);
  var el = document.getElementById('ap-intensity-val');
  if (el) el.textContent = v + '%';
  _applyCardStyle();
}
  

// ── TYPE UNITÉ ──
var _unitType = 'club';
function setUnitType(t) {
  _unitType = t;
  var cb = document.getElementById('u-type-club');
  var jb = document.getElementById('u-type-joueur');
  var inp = document.getElementById('u-type');
  if (inp) inp.value = t;
  if (cb && jb) {
    if (t === 'club') {
      cb.style.borderColor='rgba(77,132,255,.5)';cb.style.background='rgba(77,132,255,.12)';cb.style.color='#7aaaff';
      jb.style.borderColor='var(--b2)';jb.style.background='var(--bg3)';jb.style.color='var(--t3)';
    } else {
      jb.style.borderColor='rgba(240,176,32,.5)';jb.style.background='rgba(240,176,32,.1)';jb.style.color='#f0b020';
      cb.style.borderColor='var(--b2)';cb.style.background='var(--bg3)';cb.style.color='var(--t3)';
    }
  }
}

// ── PARAMÈTRES CHAT ──
// déclaré plus haut
// _CP_TYPES et _chatParams déclarés en haut


function toggleChatParamsPC() {
  var p = document.getElementById('chat-params-panel-pc');
  if (!p) return;
  if (p.style.display === 'none') { p.style.display = 'block'; initChatParamsPC(); }
  else p.style.display = 'none';
}
function initChatParamsPC() {
  var sel = document.getElementById('cp-equipe-pc');
  if (sel) {
    sel.innerHTML = '<option value="">Toutes les équipes</option>' +
      state.u.map(function(u){ return '<option value="'+u.n+'"'+(u.n===_chatParams.equipe?' selected':'')+'>'+u.n+'</option>'; }).join('');
    sel.onchange = function(){ _chatParams.equipe = this.value; };
  }
  var ct = document.getElementById('cp-types-pc');
  if (ct) {
    ct.innerHTML = _CP_TYPES.map(function(t){
      var on = _chatParams.types.indexOf(t) >= 0;
      var s = on ? 'border:1px solid rgba(77,132,255,.5);background:rgba(77,132,255,.12);color:#7aaaff;' : 'border:1px solid rgba(255,255,255,.1);background:none;color:var(--t3);';
      var isDefault = ['Victoire','Nul','Défaite','Over 2.5','Under 2.5','BTS Oui','BTS Non','HC -1','HC +1','Mi-temps','1er buteur'].indexOf(t) >= 0;
      var delBtn = isDefault ? '' : '<span data-deltype="'+t+'" onclick="delCpType(this)" style="margin-left:4px;opacity:.6;cursor:pointer;">✕</span>';
      return '<button data-cptype="'+t+'" data-action="cp-type" style="display:inline-flex;align-items:center;padding:3px 7px;border-radius:12px;'+s+'font-size:9px;font-weight:700;cursor:pointer;">'+t+delBtn+'</button>';
    }).join('');
  }
  var chk = document.getElementById('cp-champ-only-pc');
  if (chk) { chk.checked = _chatParams.champOnly; chk.onchange = function(){ _chatParams.champOnly = this.checked; }; }
}
function setCpLieuPC(btn) {
  document.querySelectorAll('.cp-lieu-btn-pc').forEach(function(b){
    b.style.borderColor='var(--b2)';b.style.background='none';b.style.color='var(--t3)';
  });
  btn.style.borderColor='rgba(30,215,96,.4)';btn.style.background='rgba(30,215,96,.1)';btn.style.color='#1ed760';
  _chatParams.lieu = btn.dataset.val;
}


function addCpType(src) {
  var inp = document.getElementById(src === 'pc' ? 'cp-new-type-pc' : 'cp-new-type');
  if (!inp) return;
  var val = inp.value.trim();
  if (!val || _CP_TYPES.indexOf(val) >= 0) return;
  _CP_TYPES.push(val);
  _chatParams.types.push(val);
  inp.value = '';
  // Rafraîchir les deux panneaux
  initChatParams();
  initChatParamsPC();
}

function delCpType(span) {
  var t = span.dataset.deltype;
  var idx = _CP_TYPES.indexOf(t);
  if (idx >= 0) _CP_TYPES.splice(idx, 1);
  var idx2 = _chatParams.types.indexOf(t);
  if (idx2 >= 0) _chatParams.types.splice(idx2, 1);
  initChatParams();
  initChatParamsPC();
}

function toggleChatParams() {
  var p = document.getElementById('chat-params-panel');
  if (!p) return;
  if (p.style.display === 'none') {
    p.style.display = 'block';
    initChatParams();
  } else {
    p.style.display = 'none';
  }
}

function initChatParams() {
  // Select équipes
  var sel = document.getElementById('cp-equipe');
  if (sel) {
    sel.innerHTML = '<option value="">Toutes les équipes</option>' +
      state.u.map(function(u){ return '<option value="'+u.n+'"'+(u.n===_chatParams.equipe?' selected':'')+'>'+u.n+'</option>'; }).join('');
    sel.onchange = function(){ _chatParams.equipe = this.value; };
  }
  // Types de paris
  var ct = document.getElementById('cp-types');
  if (ct) {
    ct.innerHTML = _CP_TYPES.map(function(t){
      var on = _chatParams.types.indexOf(t) >= 0;
      var s = on ? 'border:1px solid rgba(77,132,255,.5);background:rgba(77,132,255,.12);color:#7aaaff;' : 'border:1px solid rgba(255,255,255,.1);background:none;color:var(--t3);';
      var isDefault = ['Victoire','Nul','Défaite','Over 2.5','Under 2.5','BTS Oui','BTS Non','HC -1','HC +1','Mi-temps','1er buteur'].indexOf(t) >= 0;
      var delBtn = isDefault ? '' : '<span data-deltype="'+t+'" onclick="delCpType(this)" style="margin-left:4px;opacity:.6;cursor:pointer;">✕</span>';
      return '<button data-cptype="'+t+'" data-action="cp-type" style="display:inline-flex;align-items:center;padding:4px 8px;border-radius:12px;'+s+'font-size:9px;font-weight:700;cursor:pointer;">'+t+delBtn+'</button>';
    }).join('');
  }
  // Checkbox championnat
  var chk = document.getElementById('cp-champ-only');
  if (chk) { chk.checked = _chatParams.champOnly; chk.onchange = function(){ _chatParams.champOnly = this.checked; }; }
}

function setCpLieu(btn) {
  document.querySelectorAll('.cp-lieu-btn').forEach(function(b){
    b.style.borderColor='var(--b2)';b.style.background='none';b.style.color='var(--t3)';
  });
  btn.style.borderColor='rgba(30,215,96,.4)';btn.style.background='rgba(30,215,96,.1)';btn.style.color='#1ed760';
  _chatParams.lieu = btn.dataset.val;
}

function toggleCpType(btn) {
  var t = btn.dataset.cptype;
  var idx = _chatParams.types.indexOf(t);
  if (idx >= 0) {
    _chatParams.types.splice(idx,1);
    btn.style.border='1px solid rgba(255,255,255,.1)';btn.style.background='none';btn.style.color='var(--t3)';
  } else {
    _chatParams.types.push(t);
    btn.style.border='1px solid rgba(77,132,255,.5)';btn.style.background='rgba(77,132,255,.12)';btn.style.color='#7aaaff';
  }
}

// ── BUILDCONTEXT AMÉLIORÉ ──



// ── GENERATEUR PARI DU JOUR ──

// ── CALENDRIER GLOBAL ──
var _calCache = null;
async function loadCalendrier() {
  var el = document.getElementById('cal-content');
  var btn = document.getElementById('btn-refresh-cal');
  if(!el) return;
  if(!getFdorgKey()) {
    el.innerHTML = '<div class="fc" style="color:var(--t3);text-align:center;">Configure ta clé Football-Data dans Outils pour voir le calendrier.</div>';
    return;
  }
  el.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:20px;color:var(--t3);"><div style="width:14px;height:14px;border:2px solid rgba(77,132,255,.2);border-top-color:#4d84ff;border-radius:50%;animation:spin .8s linear infinite;"></div>Chargement du calendrier...</div>';
  if(btn) btn.onclick = loadCalendrier;

  // Équipes avec ID football-data
  var teamsWithId = state.u.filter(function(u){
    for(var k in TEAM_IDS){ if(k.toLowerCase()===u.n.toLowerCase()||u.n.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(u.n.toLowerCase())>=0) return true; }
    return false;
  }).slice(0,6);

  if(!teamsWithId.length) {
    el.innerHTML = '<div class="fc" style="color:var(--t3);text-align:center;">Aucune de tes equipes reconnue dans football-data.<br><small>Bayern Munich, Inter Milan, PSG, Real Madrid, Lyon...</small></div>';
    return;
  }

  var allMatches = [];
  for(var i=0; i<teamsWithId.length; i++) {
    var u = teamsWithId[i];
    var tid = null;
    for(var k in TEAM_IDS){ if(k.toLowerCase()===u.n.toLowerCase()||u.n.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(u.n.toLowerCase())>=0){tid=TEAM_IDS[k];break;} }
    if(!tid) continue;
    var data = await fdFetch('/v4/teams/'+tid+'/matches?status=SCHEDULED&limit=3');
    if(data&&data.matches) {
      data.matches.forEach(function(m){
        m._teamName = u.n;
        m._teamColor = u.color||'#4d84ff';
        m._teamId = tid;
        allMatches.push(m);
      });
    }
  }

  // Trier par date
  allMatches.sort(function(a,b){ return new Date(a.utcDate)-new Date(b.utcDate); });

  if(!allMatches.length) {
    el.innerHTML = '<div class="fc" style="color:var(--t3);text-align:center;">Aucun match a venir trouve.</div>';
    return;
  }

  // Grouper par date
  var byDate = {};
  allMatches.forEach(function(m){
    var d = new Date(m.utcDate);
    var key = d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
    if(!byDate[key]) byDate[key] = [];
    byDate[key].push(m);
  });

  var html = '';
  Object.keys(byDate).forEach(function(dateKey){
    html += '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin:12px 0 6px;">'+dateKey+'</div>';
    byDate[dateKey].forEach(function(m){
      var isDom = m.homeTeam&&m.homeTeam.id===m._teamId;
      var adv = isDom?(m.awayTeam&&m.awayTeam.name||'?'):(m.homeTeam&&m.homeTeam.name||'?');
      var d = new Date(m.utcDate);
      var time = d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
      var comp = m.competition&&m.competition.name||'';
      var compIco3 = getCompIcon(comp);
      html += '<div style="display:flex;align-items:center;padding:10px 12px;background:var(--s1);border-radius:var(--r6);margin-bottom:6px;border-left:3px solid '+m._teamColor+';">';
      html += '<div style="flex:1;">';
      html += '<div style="font-size:12px;font-weight:700;color:var(--t1);">'+m._teamName+' '+(isDom?'vs':'@')+' '+adv+'</div>';
      html += '<div style="font-size:10px;color:var(--t3);margin-top:2px;">'+compIco3+' '+comp+'</div>';
      html += '</div>';
      html += '<div style="text-align:right;"><div style="font-size:12px;font-weight:700;color:var(--a);">'+time+'</div></div>';
      html += '</div>';
    });
  });
  el.innerHTML = html;
}

// ── COMPARATEUR ──
function initComparateur() {
  var s1 = document.getElementById('comp-team1');
  var s2 = document.getElementById('comp-team2');
  var btn = document.getElementById('btn-comparer');
  if(!s1||!s2) return;
  var knownTeams = state.u.filter(function(u){
    for(var k in TEAM_IDS){ if(k.toLowerCase()===u.n.toLowerCase()||u.n.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(u.n.toLowerCase())>=0) return true; }
    return false;
  });
  var opts = knownTeams.map(function(u){ return '<option value="'+u.n+'">'+u.n+'</option>'; }).join('');
  s1.innerHTML = opts;
  s2.innerHTML = opts;
  if(knownTeams.length>1) s2.selectedIndex=1;
  if(btn) btn.onclick = runComparateur;
}

async function runComparateur() {
  var s1 = document.getElementById('comp-team1');
  var s2 = document.getElementById('comp-team2');
  var cont = document.getElementById('comp-content');
  if(!s1||!s2||!cont) return;
  var n1=s1.value, n2=s2.value;
  if(n1===n2){cont.innerHTML='<div style="color:#f0b020;text-align:center;padding:12px;">Choisis deux equipes differentes !</div>';return;}

  cont.innerHTML='<div style="display:flex;align-items:center;gap:8px;padding:20px;color:var(--t3);"><div style="width:14px;height:14px;border:2px solid rgba(77,132,255,.2);border-top-color:#4d84ff;border-radius:50%;animation:spin .8s linear infinite;"></div>Chargement des stats...</div>';

  var getId=function(n){ for(var k in TEAM_IDS){ if(k.toLowerCase()===n.toLowerCase()||n.toLowerCase().indexOf(k.toLowerCase())>=0||k.toLowerCase().indexOf(n.toLowerCase())>=0) return TEAM_IDS[k]; } return null; };
  var id1=getId(n1), id2=getId(n2);
  if(!id1||!id2){cont.innerHTML='<div style="color:#ff4545;">Equipe non trouvee dans football-data.</div>';return;}

  var d1=await fdFetch('/v4/teams/'+id1+'/matches?status=FINISHED&limit=20');
  var d2=await fdFetch('/v4/teams/'+id2+'/matches?status=FINISHED&limit=20');
  if(!d1||!d2){cont.innerHTML='<div style="color:#ff4545;">Erreur de chargement.</div>';return;}

  var s1s=calcSaisonStats(d1.matches||[],id1);
  var s2s=calcSaisonStats(d2.matches||[],id2);

  var u1=state.u.find(function(u){return u.n===n1;})||{color:'#4d84ff'};
  var u2=state.u.find(function(u){return u.n===n2;})||{color:'#f0b020'};
  var c1=u1.color||'#4d84ff', c2=u2.color||'#f0b020';

  var rows=[
    {l:'Matchs analysés',v1:s1s.n,v2:s2s.n,unit:''},
    {l:'Over 2.5',v1:pct(s1s.over25,s1s.n),v2:pct(s2s.over25,s2s.n),unit:'%'},
    {l:'Over 3.5',v1:pct(s1s.over35,s1s.n),v2:pct(s2s.over35,s2s.n),unit:'%'},
    {l:'BTS Oui',v1:pct(s1s.bts,s1s.n),v2:pct(s2s.bts,s2s.n),unit:'%'},
    {l:'Clean Sheets',v1:pct(s1s.cleanSheet,s1s.n),v2:pct(s2s.cleanSheet,s2s.n),unit:'%'},
    {l:'Victoires Dom',v1:pct(s1s.domW,s1s.domN),v2:pct(s2s.domW,s2s.domN),unit:'%'},
    {l:'Victoires Ext',v1:pct(s1s.extW,s1s.extN),v2:pct(s2s.extW,s2s.extN),unit:'%'},
    {l:'Buts marqués/match',v1:(s1s.butsM/s1s.n).toFixed(1),v2:(s2s.butsM/s2s.n).toFixed(1),unit:''},
    {l:'Buts encaissés/match',v1:(s1s.butsE/s1s.n).toFixed(1),v2:(s2s.butsE/s2s.n).toFixed(1),unit:''},
    {l:'Marque en 1er',v1:pct(s1s.scoredFirst,s1s.n),v2:pct(s2s.scoredFirst,s2s.n),unit:'%'},
    {l:'BTS 1ère MT',v1:pct(s1s.btsFH,s1s.n),v2:pct(s2s.btsFH,s2s.n),unit:'%'},
  ];

  var html='<div class="cwrap">';
  html+='<div style="display:grid;grid-template-columns:1fr 80px 1fr;gap:4px;margin-bottom:12px;text-align:center;">';
  html+='<div style="font-size:13px;font-weight:800;color:'+c1+';">'+n1+'</div>';
  html+='<div style="font-size:11px;color:var(--t3);">vs</div>';
  html+='<div style="font-size:13px;font-weight:800;color:'+c2+';">'+n2+'</div>';
  html+='</div>';

  rows.forEach(function(r){
    var v1=parseFloat(r.v1), v2=parseFloat(r.v2);
    var w1=v1>v2?'font-weight:800;':'opacity:.7;';
    var w2=v2>v1?'font-weight:800;':'opacity:.7;';
    html+='<div style="display:grid;grid-template-columns:1fr 120px 1fr;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04);">';
    html+='<div style="font-size:13px;color:'+c1+';text-align:right;'+w1+'">'+r.v1+r.unit+'</div>';
    html+='<div style="font-size:10px;color:var(--t3);text-align:center;padding:0 8px;">'+r.l+'</div>';
    html+='<div style="font-size:13px;color:'+c2+';'+w2+'">'+r.v2+r.unit+'</div>';
    html+='</div>';
  });
  html+='</div>';
  cont.innerHTML=html;
}

var _pariEquipeFocus = '';
var _tennisYear = '2026';

function initPariChips() {
  var chipsEl = document.getElementById('pari-equipe-chips');
  if(!chipsEl||!state.u||!state.u.length) return;
  var html = '<span style="font-size:10px;color:var(--t3);align-self:center;flex-shrink:0;">Focus :</span>';
  html += '<div data-equipe="" data-action="pari-equipe" style="padding:4px 10px;border-radius:12px;border:1px solid rgba(77,132,255,.5);background:rgba(77,132,255,.12);color:#7aaaff;font-size:10px;font-weight:700;cursor:pointer;">Toutes</div>';
  state.u.slice(0,8).forEach(function(u){
    html += '<div data-equipe="'+u.n+'" data-action="pari-equipe" style="padding:4px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:none;color:var(--t3);font-size:10px;font-weight:700;cursor:pointer;">'+u.n+'</div>';
  });
  chipsEl.innerHTML = html;
}

function setPariEquipe(el) {
  _pariEquipeFocus = el.dataset.equipe || '';
  document.querySelectorAll('#pari-equipe-chips [data-equipe]').forEach(function(c){
    c.style.borderColor='rgba(255,255,255,.08)';
    c.style.background='none';
    c.style.color='var(--t3)';
  });
  el.style.borderColor='rgba(77,132,255,.5)';
  el.style.background='rgba(77,132,255,.12)';
  el.style.color='#7aaaff';
}

async function generatePariDuJour() {
  var btn = document.getElementById('btn-generate-pari');
  var cont = document.getElementById('pari-du-jour-content');
  if(!btn||!cont) return;

  btn.textContent = '⏳ Analyse...';
  btn.disabled = true;
  cont.style.display = 'block';
  cont.innerHTML = '<div style="display:flex;align-items:center;gap:8px;color:var(--t3);font-size:11px;padding:8px 0;"><div style="width:12px;height:12px;border:2px solid rgba(77,132,255,.2);border-top-color:#4d84ff;border-radius:50%;animation:spin .8s linear infinite;flex-shrink:0;"></div>Analyse en cours...</div>';

  var groqKey = getGeminiKey();
  var fdKey = getFdorgKey();
  if(!groqKey) {
    cont.innerHTML = '<div style="color:#ff4545;font-size:11px;">Configure ta clé Groq dans Outils.</div>';
    btn.textContent = '⚡ Générer'; btn.disabled = false; return;
  }

  // Filtrer selon équipe focus
  var unitesToAnalyze = _pariEquipeFocus
    ? state.u.filter(function(u){ return u.n === _pariEquipeFocus; })
    : state.u.slice(0,8);

  var today = new Date();
  var dateStr = today.toLocaleDateString('fr-FR');
  var equipes = unitesToAnalyze.map(function(u){
    var paris = state.a.filter(function(h){return h.n===u.n;});
    var wins = paris.filter(function(h){return h.win;}).length;
    var profit = paris.reduce(function(a,h){return a+(h.win?(h.m*h.cote)-h.m:-h.m);},0);
    var wr = paris.length ? Math.round(wins/paris.length*100) : 0;
    return u.n+' ('+paris.length+' paris, '+wr+'% réussite, '+(profit>=0?'+':'')+profit.toFixed(0)+'€)';
  }).join(' | ');

  // Récupérer les prochains matchs via football-data pour les équipes connues
  var upcomingInfo = '';
  if(fdKey) {
    cont.innerHTML = cont.innerHTML.replace('Analyse de tes équipes en cours...', 'Récupération du calendrier...');
    var knownTeams = unitesToAnalyze.filter(function(u){
      for(var k in TEAM_IDS){ if(k.toLowerCase()===u.n.toLowerCase()||u.n.toLowerCase().indexOf(k.toLowerCase())>=0) return true; }
      return false;
    });
    var matchInfos = [];
    for(var i=0;i<Math.min(knownTeams.length,4);i++){
      var u = knownTeams[i];
      var tid = null;
      for(var k in TEAM_IDS){ if(k.toLowerCase()===u.n.toLowerCase()||u.n.toLowerCase().indexOf(k.toLowerCase())>=0){tid=TEAM_IDS[k];break;} }
      if(!tid) continue;
      var data = await fdFetch('/v4/teams/'+tid+'/matches?status=SCHEDULED&limit=2');
      if(data&&data.matches&&data.matches.length){
        var m = data.matches[0];
        var isDom = m.homeTeam&&m.homeTeam.id===tid;
        var adv = isDom?(m.awayTeam&&m.awayTeam.name||'?'):(m.homeTeam&&m.homeTeam.name||'?');
        var md = new Date(m.utcDate);
        var mdate = md.toLocaleDateString('fr-FR');
        var mtime = md.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
        matchInfos.push(u.n+' joue '+(isDom?'à domicile':'à l exterieur')+' contre '+adv+' le '+mdate+' à '+mtime+' ('+( m.competition&&m.competition.name||'')+')');
      }
    }
    if(matchInfos.length) upcomingInfo = 'Prochains matchs de ses equipes : '+matchInfos.join(' | ')+'. ';
  }

  // Prompt Groq
  cont.innerHTML = cont.innerHTML.replace('Récupération du calendrier...', 'Groq analyse...').replace('Analyse de tes équipes en cours...','Groq analyse...');

  var prompt = 'Tu es un expert paris sportifs. Nous sommes le '+dateStr+'. '
    + 'Voici les equipes favorites de l utilisateur avec ses stats perso : '+equipes+'. '
    + (upcomingInfo||'')
    + 'En te basant sur les prochains matchs et les stats de l utilisateur, propose 2-3 paris concrets pour les prochains jours. '
    + 'Pour chaque pari : equipe, type de pari (Victoire/Over 2.5/BTS/etc), cote recommandee (fourchette), et une phrase de justification. '
    + 'Format: "⚽ EQUIPE — TYPE @cote : justification". Sois direct et precis. En francais. Max 4 lignes.';

  try {
    var r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+groqKey},
      body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:[{role:'user',content:prompt}],max_tokens:300,temperature:0.4})
    });
    var d = await r.json();
    if(d.error) throw new Error(d.error.message);
    var reply = d.choices[0].message.content.trim();

    // Formater la réponse
    var lines = reply.split('\n').filter(function(l){return l.trim();});
    var html = '<div style="display:flex;flex-direction:column;gap:8px;">';
    lines.forEach(function(line){
      var isMain = line.indexOf('⚽')>=0||line.indexOf('🏆')>=0||line.indexOf('@')>=0;
      if(isMain) {
        // Mettre en valeur la cote
        line = line.replace(/@([\d.,]+)/g, '<span style="color:#f0b020;font-weight:800;">@$1</span>');
        html += '<div style="background:rgba(77,132,255,.06);border:1px solid rgba(77,132,255,.2);border-radius:8px;padding:10px 12px;font-size:12px;color:var(--t1);line-height:1.6;">'+line+'</div>';
      }
    });
    html += '</div>';
    html += '<div style="text-align:right;margin-top:6px;"><button onclick="generatePariDuJour()" style="background:none;border:none;color:var(--t3);font-size:10px;cursor:pointer;">↻ Régénérer</button></div>';
    cont.innerHTML = html;

  } catch(e) {
    cont.innerHTML = '<div style="color:#ff4545;font-size:11px;">Erreur : '+e.message+'</div>';
  }

  btn.textContent = '⚡ Générer'; btn.disabled = false;
}

// ── ARCHIVE — filtres ──
function setArchFilter(f, el) {
  _archFilter = f;
  document.querySelectorAll('#arch-f-all,#arch-f-w,#arch-f-l,#arch-f-p').forEach(function(b){b.classList.remove('on');});
  if(el) el.classList.add('on');
  buildArjelRows && renderArchive && renderArchive();
}
// ── BANK — total ──
function updateBankTotal() {
  var total = 0;
  if(state.books) {
    state.books.forEach(function(b){ total += (b.balance||0); });
  }
  var el = document.getElementById('bank-total');
  if(el) el.textContent = total.toFixed(2) + ' €';
}

var _bcp=document.getElementById('btn-chat-params-pc');if(_bcp)_bcp.onclick=function(){toggleChatParamsPC();};var _bcm=document.getElementById('btn-chat-params-mobile');if(_bcm)_bcm.onclick=function(){toggleChatParams();};
  var _bgen=document.getElementById('btn-generate-pari');if(_bgen)_bgen.onclick=function(){generatePariDuJour();};
  var _bsaisons=document.getElementById('itab-saisons');if(_bsaisons)_bsaisons.onclick=function(){swInner('saisons',this);};
  var _bmondial=document.getElementById('itab-mondial');if(_bmondial)_bmondial.onclick=function(){swInner('mondial',this);loadMondial2026();};
  var _brcal=document.getElementById('btn-refresh-cal');if(_brcal)_brcal.onclick=loadCalendrier;
  var _bcomp=document.getElementById('btn-comparer');if(_bcomp)_bcomp.onclick=runComparateur;
  document.querySelectorAll('[data-action-comp="init"]').forEach(function(b){
    b.addEventListener('click', function(){ setTimeout(initComparateur, 100); });
  });
  setTimeout(initComparateur, 300);

  // Listener global pour les paramètres chat
  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-action]');
    if(!el) return;
    var action = el.dataset.action;
    if(action === 'cp-lieu') { setCpLieu(el); }
    else if(action === 'cp-lieu-pc') { setCpLieuPC(el); }
    else if(action === 'cp-type') { toggleCpType(el); }
    else if(action === 'cp-add-mobile') { addCpType('mobile'); }
    else if(action === 'cp-add-pc') { addCpType('pc'); }
    else if(action === 'pari-equipe') { setPariEquipe(el); }
    else if(action === 'unit-type-club') { setUnitType('club'); }
    else if(action === 'unit-type-joueur') { setUnitType('joueur'); }
  });
  render();updMise();buildSbRows();setTimeout(initPariChips,100);buildDtRows();buildArjelRows();renderCrash();renderMmRows();renderMmRowsSimple();updateCompList();calcVb();calcLay();calcFreebet();renderArchive();updateBankTotal();setTimeout(initPariChips,200);_apStyle=localStorage.getItem('g45_ap_style')||'halo';_apIntensity=parseInt(localStorage.getItem('g45_ap_intensity')||'40');var _apInp=document.getElementById('ap-intensity');if(_apInp)_apInp.value=_apIntensity;setCardStyle(_apStyle);};

