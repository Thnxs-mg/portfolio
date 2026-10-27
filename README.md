# portfolio
My developer portfolio

`npm run check:github-cache` compare les deux fichiers `public/github-*.json` aux données récupérées depuis GitHub, sans modifier les fichiers ni le cache du navigateur. Authentification : variables de jeton des scripts existants ou `gh auth login`. La date de génération est ignorée dans la comparaison ; les champs différents sont signalés. Codes de sortie : 0 = identique à la source, 1 = à actualiser, 2 = vérification impossible. Pour actualiser : `npm run fetch:github-data`, puis reconstruire et déployer le site. Ce contrôle ne vérifie pas les fichiers du site déployé ni les délais de mise à jour de GitHub.
