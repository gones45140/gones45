# Statut « soutien » dans Supabase (bet45)

Ce dossier explique comment marquer quelqu'un comme **soutien** (après un pourboire).
Un compte « soutien » ne voit plus la carte « ☕ Pense à soutenir BET45 » et n'a plus
la limite des 30 jours sur les fonctions IA.

⚠️ Projet Supabase à ouvrir : celui de **bet45**, dont l'adresse commence par
`ofcizjaynonjtiusdwgi`. **Pas** celui des Potes (`vbsdewuvycaekfkixynh`).

---

## Méthode 1 : à la souris (la plus simple)

1. Menu de gauche → **Authentication** → **Users**.
2. Cherche l'adresse mail de la personne.
3. Copie son **ID** (la longue suite de chiffres et de lettres, ex. `3f2a…-…`).
4. Menu de gauche → **Table Editor** → table **`user_supporter`**.
5. Bouton **Insert** → **Insert row**.
   - `user_id` : colle l'ID
   - `soutien` : **true**
6. **Save**.

Si la personne est déjà dans la table avec `soutien = false`, change juste la case en **true**.

La personne voit le changement **à sa prochaine ouverture de l'appli**.

---

## Méthode 2 : avec l'adresse mail (SQL Editor)

Menu de gauche → **SQL Editor** → **New query**, colle le fichier
`2-ajouter-un-soutien.sql`, remplace l'adresse mail, puis **Run**.

## Voir la liste des soutiens

Même chose avec `3-liste-des-soutiens.sql`.

## Retirer un soutien

Dans Table Editor, passe `soutien` à **false** (ou supprime la ligne).

---

## Et si la table `user_supporter` n'existe pas ?

Si Table Editor ne montre aucune table `user_supporter`, lance **une seule fois**
`1-creer-la-table.sql` dans le SQL Editor. Il crée la table avec la bonne
protection : chacun peut LIRE son propre statut, personne ne peut le MODIFIER
depuis l'appli (seulement toi, depuis Supabase). Si la table existe déjà, le
fichier ne casse rien.

---

Si `2-ajouter-un-soutien.sql` affiche une erreur « there is no unique or exclusion constraint »,
c'est que ta table a été créée autrement : utilise simplement la **méthode 1** (à la souris).
