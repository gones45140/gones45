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
const REGLAGES = { min: 1.5, pmin: 0.5 };
const SPORTS = ['foot', 'hockey', 'nba', 'nfl'];
const FORCE = process.env.FORCE === '1';

const parisH = () => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).find((x) => x.type === 'hour').value);
const parisJour = () => new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());   // AAAA-MM-JJ

let J = { maj: null, dernier: null, reglages: REGLAGES, t: [] };
try { J = Object.assign(J, JSON.parse(fs.readFileSync(FICHIER, 'utf8'))); } catch (e) {}

/* Deux crons (8 h et 9 h UTC) couvrent l'heure d'été et l'heure d'hiver : on ne
   travaille qu'à partir de 10 h à Paris, et une seule fois par jour. */
if (!FORCE && (parisH() < 10 || J.dernier === parisJour())) {
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
  } catch (e) {}
}, REGLAGES);
if (FAUX_INIT) await page.addInitScript(FAUX_INIT);
await page.goto(SITE + '?robot=' + Date.now(), { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(6000);

const nouvelles = await page.evaluate(async ({ R, SPORTS }) => {
  const pris = [];
  const orig = window._g45TrSuivNoter;
  window._g45TrSuivNoter = function (liste) { (liste || []).forEach((x) => pris.push(x)); try { return orig.apply(this, arguments); } catch (e) {} };
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
        const k = _g45TrSuivType(x.m.m, x.hN, x.aN); if (!k) return;
        const cle = x.id + '|' + k; if (vu[cle]) return; vu[cle] = 1;
        const t = Date.parse(x.d); if (isNaN(t) || t < Date.now()) return;   // match déjà commencé : pas noté
        sortie.push({ id: String(x.id), sl: x.slug, t: t, h: x.hN, a: x.aN, m: x.m.m, k: k,
          p: Math.round(x.m.p * 1000) / 1000,
          c: x.m.cote > 1 ? Math.round(x.m.cote * 100) / 100 : null,
          cd: x.m.coteDk > 1 ? Math.round(x.m.coteDk * 100) / 100 : null,   // 20261015o : cote DraftKings d'origine ; c = ≈ books FR (− 5 %)
          f: x.m.fair > 0 ? Math.round(x.m.fair * 1000) / 1000 : null,
          d: x.m.desac ? 1 : 0, r: null });
      });
      console.log(sp + ' : ' + pris.length + ' affichées');
    } catch (e) { console.log(sp + ' : erreur ' + (e && e.message)); }
  }
  return sortie;
}, { R: REGLAGES, SPORTS });

/* Ajout : une tendance (match + pari) n'est notée qu'UNE fois — la NFL lit 7 jours d'avance. */
const deja = new Set(J.t.map((x) => x.id + '|' + x.k));
const note = new Date().toISOString();
let ajout = 0;
nouvelles.forEach((x) => { if (deja.has(x.id + '|' + x.k)) return; deja.add(x.id + '|' + x.k); x.n = note; J.t.push(x); ajout++; });

/* Vérification des matchs finis (score final), par ligue et par jour. */
const att = J.t.filter((x) => x.r == null && x.t < Date.now() - 3 * 3600e3);
const grp = {};
att.forEach((x) => {
  if (Date.now() - x.t > 10 * 864e5) { x.r = -1; return; }   // 10 jours sans score : abandonné
  const d = new Date(x.t), ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
  (grp[x.sl + '|' + ymd] = grp[x.sl + '|' + ymd] || []).push(x);
});
let juge = 0;
for (const g of Object.keys(grp)) {
  const [sl, ymd] = g.split('|');
  const sp = { nhl: 'hockey', nba: 'basketball', nfl: 'football' }[sl] || 'soccer';
  const tous = [];
  for (const dd of [ymd, ymdDecale(ymd, -1)]) {   // ESPN range les matchs par jour AMÉRICAIN : un match du soir peut être la veille
    const r = await curl('https://site.api.espn.com/apis/site/v2/sports/' + sp + '/' + sl + '/scoreboard?dates=' + dd);
    try { (JSON.parse(r.body).events || []).forEach((e) => tous.push(e)); } catch (e) {}
  }
  for (const x of grp[g]) {
    const e = tous.find((ev) => String(ev.id) === x.id); if (!e) continue;
    const c = (e.competitions && e.competitions[0]) || {}, st = (c.status && c.status.type) || {};
    if (!st.completed) { if (/postpon|cancel|abandon/i.test(st.name || st.description || '')) x.r = -1; continue; }
    const ho = (c.competitors || []).find((q) => q.homeAway === 'home'), aw = (c.competitors || []).find((q) => q.homeAway === 'away');
    const sh = parseInt(ho && ho.score, 10), sa = parseInt(aw && aw.score, 10);
    if (isNaN(sh) || isNaN(sa)) continue;
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
