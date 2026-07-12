# workspace

Repo « maison » de NestorJarvis. Ce dépôt est mon espace de travail personnel :
**le repo est mon repo, chaque dossier à l'intérieur est un sous-projet indépendant.**

## Architecture

```
workspace/
├── README.md          <- ce fichier (conventions du repo)
├── <projet-1>/        <- sous-projet autonome (sa propre logique, ses propres deps)
├── <projet-2>/
└── <projet-n>/
```

- **Chaque dossier = un projet indépendant.** Aucun couplage attendu entre dossiers :
  pas d'imports croisés, pas de dépendance partagée hors de son propre dossier.
- Un sous-projet peut être de n'importe quelle nature (web statique, app, script, etc.).
- Chaque dossier porte sa propre documentation locale si besoin
  (ex. `<projet>/README.md`), mais ce `README.md` racine définit les règles communes.

## GitHub Pages

Le site statique est publié automatiquement depuis ce repo.
Chaque sous-projet web est accessible publiquement à l'adresse :

```
https://nestorjarvis.github.io/workspace/<dossier>/
```

> ⚠️ **Délai de propagation GitHub Pages** : après un `push`, le site peut mettre
> **jusqu'à ~1 minute (souvent quelques secondes, parfois plus)** à se mettre à jour.
> Si une modif ne se voit pas immédiatement en ligne, patienter puis recharger
> (avec cache navigateur vidé — voir stratégie cache busting ci-dessous).

## Stratégie de cache busting (projets web)

**Règle stricte : tout `import` / chargement de ressource dans un projet web doit
utiliser une stratégie agressive de cache busting.** GitHub Pages sert les fichiers
avec un cache HTTP ; sans versionnage des assets, une ancienne version peut rester
servie au navigateur même après mise à jour du site.

Stratégies acceptées (du meilleur au plus simple) :

1. **Hachage de contenu dans le nom de fichier** (recommandé) :
   `app.4f3a9c.js`, `style.a1b2c3.css`. Garanti unique par contenu, jamais de stale.
2. **Query string versionnée** sur l'URL d'import :
   `import('./module.js?v=1.4.2')` ou `app.js?ts=1690000000`.
   À incrémenter/re-générer à chaque changement.
3. **Version globale partagée** : un fichier `version.json` ou une constante
   injectée dans toutes les URLs d'assets.

Interdits :
- ❌ URLs sans version (`<script src="app.js">` nu sur un asset qui change).
- ❌ `?v=latest` / `?cache=no` qui ne change pas réellement entre builds.

> Note : les navigateurs ignorent la query string pour le cache de certains modules
> ES (`import`). Pour les modules ES, **privilégier le hachage de nom de fichier**.

## Sécurité / confidentialité

⚠️ **Le repo est PUBLIC.** Jamais de donnée sensible poussée :

- ❌ tokens, clés API, secrets, mots de passe
- ❌ emails privés, infos personnelles, données clients
- ❌ clés privées SSH (la clé du bot est sur la machine, jamais dans le repo)

En cas de **doute** sur la nature d'une info à pousser → **je demande avant**,
je ne pousse pas aveuglément.

## Workflow de push

- Branche par défaut : `main`.
- Le bot travaille dans `/opt/data/workspace` puis `commit` + `push` sur `main`
  (ou sur une branche feature → PR si le projet le justifie).
- Convention de commit : `-m "type: description"` (ex. `feat:`, `fix:`, `docs:`).

---
*Repo public — n'y pousse que du contenu non sensible.*
