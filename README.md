# portfolio
My developer portfolio

`npm run check:github-cache` compare les deux fichiers `public/github-*.json` aux données récupérées depuis GitHub, sans modifier les fichiers ni le cache du navigateur. Authentification : variables de jeton des scripts existants ou `gh auth login`. La date de génération est ignorée dans la comparaison ; les champs différents sont signalés. Codes de sortie : 0 = identique à la source, 1 = à actualiser, 2 = vérification impossible. Pour actualiser : `npm run fetch:github-data`, puis reconstruire et déployer le site. Ce contrôle ne vérifie pas les fichiers du site déployé ni les délais de mise à jour de GitHub.

## Données GitHub

`npm run fetch:github-data` actualise le profil, les langages et le calendrier des douze derniers mois dans `public/`. Les scripts utilisent le secret `GH_CONTRIBUTIONS_TOKEN` (également pour `GH_PROFILE_TOKEN` dans Actions), ou l'authentification locale `gh`.

Les statistiques des dépôts incluent les dépôts personnels publics et privés accessibles au jeton, hors forks. Le calendrier provient de GitHub GraphQL ; aucun jeton n'est envoyé au navigateur.

Le workflow `.github/workflows/update-github-contributions.yml` est installé sur `main` (branche par défaut nécessaire à la planification) et `dev_version`. Toutes les six heures, à la minute 17 UTC, il récupère les données officielles avec le secret existant `GH_CONTRIBUTIONS_TOKEN`, les valide, puis pousse uniquement les deux fichiers JSON sur `dev_version`. Le push utilise le jeton stocké dans le secret via le gestionnaire d'identifiants `gh`, sans le persister dans le checkout, afin de déclencher le build Cloudflare de `portfolio-dev`. Le jeton doit autoriser la lecture des dépôts concernés et l'écriture du contenu de `portfolio`. Le jeton interne `GITHUB_TOKEN` reste en lecture seule. Le même workflow peut être lancé manuellement depuis Actions ; les modifications des scripts sur `dev_version` le déclenchent aussi. Les exécutions sont sérialisées et un échec empêche toute publication de données partielles. Aucun jeton Cloudflare supplémentaire n'est nécessaire.

Seuls les détails des dépôts publics sont exportés ; les dépôts privés contribuent aux totaux et aux langages sans publier leur nom ou leur URL. Le jeton reste dans les étapes de collecte et publication GitHub Actions, jamais dans le navigateur ni dans les JSON.

Le navigateur recharge les fichiers de son propre domaine sans cache HTTP au chargement, au retour sur l'onglet et toutes les quinze minutes tant que l'onglet est visible. Il conserve les données les plus récentes en cas d'erreur et affiche leur date. Aucun service tiers de contributions n'est appelé. La fréquence de collecte est de six heures, puis il faut attendre la file GitHub Actions et le build Cloudflare : ce n'est pas une synchronisation instantanée.

`npm run test:github` vérifie la collecte avec des réponses simulées (dont la confidentialité des dépôts privés et la conservation des fichiers en cas d'erreur). Le workflow exécute aussi `node scripts/test-github-data.mjs --snapshots` avant publication.
