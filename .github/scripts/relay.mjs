/* ═══════════════════════════════════════════════════════════════════════════
   GONES45 — relais ESPN (GitHub Actions)
   ───────────────────────────────────────────────────────────────────────────
   POURQUOI CE FICHIER EXISTE
   Akamai, le CDN d'ESPN, renvoie 403 aux IP de sortie des datacenters :
   Cloudflare Workers et Deno Deploy sont bloques (teste le 05/08/2026). Les
   runners GitHub, eux, passent (200). Le Worker garde donc toute la logique
   — diff des scores, etat en D1, signature VAPID, gestion des abonnements —
   et ce script ne fait que lui apporter les donnees.

   BOUCLE, toutes les 60 s :
     1. POST /relay/tick avec les reponses ESPN deja en cache local
     2. le Worker deroule son cron UNE fois et renvoie les URL manquantes
     3. on va les chercher chez ESPN, on les garde pour le tick suivant

   Une URL decouverte au tick N est servie au tick N+1. En regime etabli tout
   est deja en cache et rafraichi a chaque tick : latence de 60 s.

   Le cron d'Actions ne descend pas sous 5 minutes et traine souvent 10 a 15,
   ce qui serait inutilisable pour une alerte de but. D'ou ce job LONG : une
   execution boucle pendant ~5 h 45 (le plafond GitHub est de 6 h).
   ═══════════════════════════════════════════════════════════════════════════ */

const WORKER = (process.env.WORKER_URL || '').replace(/\/$/, '');
const CLE = process.env.RELAY_KEY || '';
const DUREE_MS = Number(process.env.DUREE_MIN || 345) * 60 * 1000;  // 5 h 45
const PERIODE_MS = 60 * 1000;

/* Liste blanche : ce script ne doit jamais devenir un proxy ouvert, meme si
   le Worker etait compromis et renvoyait des URL arbitraires. */
const HOTES_OK = new Set([
  'site.api.espn.com',
  'site.web.api.espn.com',
  'sports.core.api.espn.com',
]);

const ENTETES_ESPN = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.espn.com/',
};

const MAX_CACHE = 120;              // nombre d'URL gardees
const PEREMPTION_MS = 5 * 60 * 1000; // au-dela, on oublie une URL plus demandee
const PLAFOND_OCTETS = 8 * 1024 * 1024;

const cache = new Map();  // url -> { status, body, ts }

if (!WORKER || !CLE) {
  console.error('WORKER_URL et RELAY_KEY sont obligatoires.');
  process.exit(1);
}

const dodo = (ms) => new Promise((r) => setTimeout(r, ms));
const horo = () => new Date().toISOString().slice(11, 19);

function elaguer() {
  const maintenant = Date.now();
  for (const [url, v] of cache) {
    if (maintenant - v.ts > PEREMPTION_MS) cache.delete(url);
  }
  while (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value);

  let total = 0;
  for (const v of cache.values()) total += v.body.length;
  while (total > PLAFOND_OCTETS && cache.size) {
    const k = cache.keys().next().value;
    total -= cache.get(k).body.length;
    cache.delete(k);
  }
}

async function recupererEspn(url) {
  let cible;
  try { cible = new URL(url); } catch { return null; }
  if (cible.protocol !== 'https:' || !HOTES_OK.has(cible.hostname)) {
    console.warn(`  hote refuse : ${cible.hostname}`);
    return null;
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch(url, { headers: ENTETES_ESPN, signal: ctrl.signal });
    clearTimeout(t);
    const body = await r.text();
    /* On memorise meme un statut d'erreur : le Worker verra un r.ok faux et
       passera son tour, au lieu de redemander la meme URL a chaque tick. */
    return { status: r.status, body, ts: Date.now() };
  } catch (e) {
    console.warn(`  echec ${url.slice(0, 80)} : ${e.message}`);
    return null;
  }
}

async function parLots(liste, taille, tache) {
  for (let i = 0; i < liste.length; i += taille) {
    await Promise.all(liste.slice(i, i + taille).map(tache));
  }
}

async function tick() {
  const items = [];
  for (const [url, v] of cache) items.push({ url, status: v.status, body: v.body });

  let rep;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 45000);
    const r = await fetch(`${WORKER}/relay/tick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Relay-Key': CLE },
      body: JSON.stringify({ items }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (r.status === 401) { console.error('Cle de relais refusee — arret.'); process.exit(1); }
    if (!r.ok) { console.warn(`${horo()} worker ${r.status}`); return; }
    rep = await r.json();
  } catch (e) {
    console.warn(`${horo()} worker injoignable : ${e.message}`);
    return;
  }

  const wanted = Array.isArray(rep.wanted) ? rep.wanted : [];
  console.log(`${horo()} envoye ${items.length} | cron ${rep.ms} ms | manquant ${wanted.length}` +
              (rep.erreur ? ` | ERREUR ${rep.erreur}` : ''));

  if (!wanted.length) return;

  let ok = 0;
  await parLots(wanted, 6, async (url) => {
    const res = await recupererEspn(url);
    if (res) { cache.set(url, res); if (res.status === 200) ok++; }
  });
  console.log(`  recupere ${ok}/${wanted.length} chez ESPN`);
  elaguer();
}

(async function principal() {
  const fin = Date.now() + DUREE_MS;
  console.log(`Relais demarre — worker ${WORKER} — jusqu'a ${new Date(fin).toISOString()}`);

  /* Amorce : on verifie tout de suite qu'ESPN repond depuis ce runner. */
  const sonde = await recupererEspn('https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/teams');
  console.log(`Sonde ESPN : ${sonde ? sonde.status : 'echec'}`);
  if (!sonde || sonde.status !== 200) {
    console.error('ESPN ne repond pas depuis ce runner — le relais ne servirait a rien.');
    process.exit(1);
  }

  while (Date.now() < fin) {
    const debut = Date.now();
    try { await tick(); } catch (e) { console.warn(`tick : ${e.message}`); }
    const reste = PERIODE_MS - (Date.now() - debut);
    if (reste > 0) await dodo(reste);
  }
  console.log('Duree atteinte — arret propre.');
})();
