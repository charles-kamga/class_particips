/**
 * Hackathon Team Balancer — Script de démo « fidèle à l'usage réel ».
 * À coller dans la console Chrome (F12 > Console), connecté en Organisateur.
 *
 * Pour chaque participant, le script reproduit le geste d'un organisateur :
 *   1. tape le pseudo GitHub caractère par caractère dans le champ d'auto-complétion ;
 *   2. attend l'apparition des suggestions et clique sur le bon profil ;
 *   3. attend que l'app calcule et affiche les commits d'octobre (badge 🗓️) ;
 *   4. choisit le genre (aléatoire) sur le switch ♂ / ♀ ;
 *   5. clique sur « Ajouter & suivant » et attend la confirmation + la nouvelle ligne.
 */
(async () => {
  // ─── Configuration ──────────────────────────────────────────────────────────
  const PSEUDOS = [
    'torvalds', 'gaearon', 'sindresorhus', 'yyx990803', 'tj', 'addyosmani',
    'kentcdodds', 'getify', 'mojombo', 'defunkt', 'jeresig', 'paulirish',
    'rauchg', 'leerob', 'shadcn', 't3dotgg', 'wesbos', 'mdo',
    'mrdoob', 'Rich-Harris', 'antfu', 'mitchellh', 'fabpot', 'taylorotwell',
    'dhh', 'kamranahmedse', 'ThePrimeagen', 'bradtraversy', 'cassidoo', 'fat',
  ];
  const FEMALE_RATIO = 0.4;             // probabilité de « Femme »
  const TYPING_DELAY = [55, 130];       // ms entre deux frappes (humain rapide)
  const THINK_DELAY = [250, 600];       // ms d'hésitation entre deux gestes
  const SUGGESTION_TIMEOUT = 6000;      // attente max des suggestions GitHub
  const COMMITS_TIMEOUT = 15000;        // attente max du calcul des commits d'octobre
  const SETTLE_MS = 900;                // stabilisation de la sync Firestore

  // ─── Utilitaires ────────────────────────────────────────────────────────────
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = ([min, max]) => min + Math.floor(Math.random() * (max - min));
  const think = () => sleep(rand(THINK_DELAY));

  const waitFor = async (fn, label, timeout = 8000) => {
    const start = performance.now();
    while (performance.now() - start < timeout) {
      const res = fn();
      if (res) return res;
      await sleep(50);
    }
    throw new Error(`Timeout : ${label}`);
  };
  const tryWaitFor = (fn, label, timeout) => waitFor(fn, label, timeout).catch(() => null);

  // React ignore une affectation directe de .value : setter natif + événement input.
  const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  const setReactValue = (input, value) => {
    nativeSetter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  // Frappe caractère par caractère (keydown → input → keyup), comme au clavier.
  const typeText = async (input, text) => {
    input.focus();
    setReactValue(input, '');
    for (const char of text) {
      const opts = { key: char, bubbles: true, cancelable: true };
      input.dispatchEvent(new KeyboardEvent('keydown', opts));
      setReactValue(input, input.value + char);
      input.dispatchEvent(new KeyboardEvent('keyup', opts));
      await sleep(rand(TYPING_DELAY));
    }
  };

  // Clic « complet » (pointer + mouse + click) comme un vrai pointeur.
  const realClick = (el) => {
    const opts = { bubbles: true, cancelable: true, view: window };
    el.dispatchEvent(new PointerEvent('pointerdown', opts));
    el.dispatchEvent(new MouseEvent('mousedown', opts));
    el.dispatchEvent(new PointerEvent('pointerup', opts));
    el.dispatchEvent(new MouseEvent('mouseup', opts));
    el.click();
  };

  const buttonByText = (root, text) =>
    [...root.querySelectorAll('button')].find((b) => b.textContent.includes(text));
  const rowCount = () => document.querySelectorAll('#table-participants-ranking tbody tr').length;

  // ─── Vérifications ──────────────────────────────────────────────────────────
  const openBtn = document.getElementById('btn-open-register-modal');
  if (!openBtn) {
    console.error('❌ Bouton « Nouveau » introuvable : connectez-vous en Organisateur.');
    return;
  }
  if (!confirm(`Saisir ${PSEUDOS.length} participants (pseudos GitHub réels) ?\nEn prod, ils seront synchronisés pour tous les visiteurs.`)) return;

  // ─── Ouverture de la modale ─────────────────────────────────────────────────
  const getDialog = () => document.querySelector('[role="dialog"][aria-labelledby="modal-title"]');
  if (!getDialog()) realClick(openBtn);
  const dialog = await waitFor(getDialog, 'ouverture de la modale');
  await sleep(300);

  const $ = {
    github: () => dialog.querySelector('input[aria-label="Pseudo GitHub"]'),
    name: () => dialog.querySelector('input[placeholder="ex: Alex Martin"]'),
    commits: () => dialog.querySelector('input[type="number"]'),
    genderGroup: () => dialog.querySelector('[role="group"][aria-label="Sélection du sexe"]'),
    addNext: () => buttonByText(dialog, 'Ajouter & suivant'),
    spinner: () => dialog.textContent.includes("Calcul d'octobre"),
    badge: () => [...dialog.querySelectorAll('span.font-semibold')].find((s) => /commits? en octobre/.test(s.textContent)),
    error: () => [...dialog.querySelectorAll('span')].find((s) => s.textContent.includes('introuvable')),
    suggestion: (login) =>
      [...dialog.querySelectorAll('ul button')].find(
        (b) => b.querySelector('img')?.alt.toLowerCase() === login.toLowerCase()
      ),
  };

  // ─── Boucle de saisie ───────────────────────────────────────────────────────
  const report = [];
  console.time('⏱️ Saisie démo');

  for (const [i, pseudo] of PSEUDOS.entries()) {
    const tag = `${i + 1}/${PSEUDOS.length} @${pseudo}`;
    const before = rowCount();
    let source = 'suggestion';

    try {
      // 1. Saisie du pseudo
      await typeText($.github(), pseudo);

      // 2. Choix du profil dans l'auto-complétion
      const suggestion = await tryWaitFor(() => $.suggestion(pseudo), 'suggestion', SUGGESTION_TIMEOUT);
      await think();
      if (suggestion) {
        realClick(suggestion);
      } else {
        // Pas de suggestion (quota GitHub, profil absent) : bouton « Recalculer octobre »
        source = 'recalcul';
        const recalc = await tryWaitFor(() => buttonByText(dialog, 'Recalculer octobre'), 'recalcul', 2000);
        if (recalc) realClick(recalc);
      }

      // 3. Attente de l'affichage des commits d'octobre
      await tryWaitFor(() => $.spinner() || $.badge() || $.error(), 'démarrage calcul', 2000);
      await waitFor(() => !$.spinner() && ($.badge() || $.error()), 'commits d\'octobre', COMMITS_TIMEOUT);
      const commits = Number($.commits().value) || 0;
      const displayName = $.name().value;
      if ($.error()) console.warn(`⚠️ ${tag} : profil introuvable, saisi avec 0 commit.`);

      // 4. Genre
      await think();
      const gender = Math.random() < FEMALE_RATIO ? 'Femme' : 'Homme';
      realClick(buttonByText($.genderGroup(), gender));
      await waitFor(
        () => buttonByText($.genderGroup(), gender).getAttribute('aria-pressed') === 'true',
        'switch genre', 2000
      );

      // 5. Validation
      await think();
      realClick($.addNext());
      await waitFor(() => dialog.textContent.includes('enregistré !') && $.github().value === '', 'confirmation');
      await waitFor(() => rowCount() > before, 'nouvelle ligne dans le tableau');
      await sleep(SETTLE_MS);

      report.push({ '#': i + 1, pseudo, nom: displayName, commits, genre: gender === 'Femme' ? '♀' : '♂', source });
      console.log(`✅ ${tag} → ${displayName} — ${commits} commits — ${gender}`);
    } catch (err) {
      console.error(`❌ ${tag} : ${err.message} — participant ignoré.`);
      report.push({ '#': i + 1, pseudo, nom: '—', commits: '—', genre: '—', source: 'ÉCHEC' });
      // Remise à zéro du champ pour repartir proprement
      const clear = dialog.querySelector('button[aria-label="Effacer le pseudo"]');
      if (clear) realClick(clear);
      await sleep(500);
    }
  }

  console.timeEnd('⏱️ Saisie démo');
  realClick(dialog.querySelector('button[aria-label="Fermer la modale"]'));
  console.table(report);
  const failed = report.filter((r) => r.source === 'ÉCHEC').length;
  console.log(failed ? `⚠️ ${failed} échec(s), voir le tableau ci-dessus.` : `🎉 ${PSEUDOS.length} participants saisis.`);
})();
