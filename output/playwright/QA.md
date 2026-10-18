# Galerie cinématique — vérification du 18 octobre 2026

## Vérifié

- TypeScript : `./node_modules/.bin/tsc --noEmit` passe.
- Production : `npm run build -- --outDir /tmp/portfolio-cinema-build --emptyOutDir` passe. Le dossier dist suivi par Git reste inchangé.
- Parcours : `npm run check:ui` passe, 72 contrôles Playwright (43 parcours + 16 motion + 13 introduction).
- Galerie : sélection des trois projets, suivant/précédent et retour au début/à la fin.
- Ouverture depuis le hero, URL de démonstration Aurora conservée, fermeture avec Échap, retour navigateur, focus restauré.
- Filtres Django, réinitialisation, état accessible des sélections.
- FR/EN, attribut lang du document, menu mobile et thèmes clair/sombre.
- Absence de débordement horizontal à 1440, 768 et 390 px.
- Effets de profondeur à la souris et au scroll ; suppression avec prefers-reduced-motion, y compris après changement de préférence en cours de session.
- Navigation Contact depuis /realisations : section positionnée à environ 80 px du haut.
- Les deux CV répondent 200 avec un type PDF.
- Captures desktop, tablette, mobile, sections et fiche projet inspectées visuellement.
- Pas d'erreur console dans la session contrôlée. Motion émet son avertissement de développement attendu quand la préférence de mouvement réduit est simulée.

## Captures

- desktop-dark.png, desktop-light.png
- tablet-dark.png
- mobile-dark.png, mobile-light.png, mobile-projects.png, mobile-dialog.png
- section-about.png, section-skills.png, section-activite.png, section-hobbies.png, section-contact.png

## Limites

- Safari, appareils mobiles physiques et 60 FPS sur matériel cible : non vérifiés.
- Disponibilité des sites externes et navigation dans la démonstration Aurora : non vérifiées ; URL conservée et contrôlée.
- npm signale 19 vulnérabilités de dépendances à l'installation (1 faible, 2 modérées, 16 élevées). Aucun correctif global de dépendances appliqué dans cette refonte.
- Pas de déploiement effectué. Aperçu local sur http://localhost:3000.

## Assets

Les quatre images utilisées dans le nouveau parcours passent d'environ 4,31 Mo à 336 Ko (environ 92 % de moins). Les fichiers originaux sont conservés.

## Navigation active — correction

- Fond taupe #b8b2b0 et texte marine #151621 dans les deux thèmes, également sur mobile.
- Route /realisations prioritaire sur le scroll de la vue accueil conservée en mémoire.
- Suppression des verrous temporels empêchant le recalcul de la capsule.
- Détection des sections à partir de leur position réelle, recalcul au défilement et aux changements de taille.
- Régression vérifiée : Compétences → Projets, retour/avance navigateur, Projets → Contact, scroll manuel, chargement direct des projets, FR/EN, mobile → desktop.
- Cinq allers-retours rapides À Propos / Projets contrôlés : Projets actif et contenu visible à la fin.
- Captures inspectées : nav-projects-light-v2.png, nav-projects-dark-v2.png, nav-mobile-light-v2.png. Autres captures : nav-active-light-v2.png, nav-mobile-dark-v2.png.
- TypeScript, build de production et git diff --check passent après la correction.

## Finition motion — 18 octobre 2026

- Design, palette, contenus, liens et dimensions conservés ; aucune dépendance ajoutée.
- Titres hero/À propos révélés par mots avec masques, entrée hero une seule fois.
- Reveals natifs WAAPI avec IntersectionObserver : translations de 18 px, 550–650 ms, stagger plafonné à 240 ms, aucun rejeu des éléments déjà vus.
- Contenus visibles par défaut, y compris sans IntersectionObserver ; plus de will-change permanent ni de révélation forcée de toutes les sections lors des changements de route.
- Barres de compétences animées avec scaleX, valeurs accessibles conservées.
- Projets : informations et technologies révélées progressivement, zoom 1,025 sur 300 ms au pointeur précis.
- CTA principal : magnétisme limité à 3 px sur le contenu, surface cliquable stable. Soulignements, flèches, icônes loisirs et CV : feedback discret.
- Modales : sortie de 150 ms depuis leur état visuel courant, verrou du fond maintenu jusqu'au retrait, focus restauré. Fermeture sans mouvement avec reduced-motion.
- Réduction du mouvement en cours d'animation : animations WAAPI annulées ; contexte GSAP restauré. Effets de souris désactivés au tactile.
- 59 contrôles passent dans la suite complète. Les 16 contrôles motion repassent après le dernier ajustement de l'interruption des modales.
- TypeScript, build de production hors dist suivi et git diff --check passent.
- Captures desktop et mobile inspectées, thèmes clair/sombre, modales et menu mobile. Comparaisons : motion-before-hero.png / motion-after-hero.png ; motion-before-about.png / motion-after-about.png ; motion-before-projects.png / motion-after-projects.png ; motion-before-mobile.png / motion-after-mobile.png.
- Autres captures : motion-after-skills.png, motion-after-activite.png, motion-after-hobbies.png, motion-after-contact.png, motion-after-modal.png, motion-after-light.png, motion-after-mobile-menu.png, motion-after-mobile-modal.png, motion-after-mobile-light.png.
- Aucun décalage de layout pendant le reveal du titre dans le contrôle géométrique ; aucune erreur runtime dans le parcours motion, dont le contexte tactile avec observateur indisponible.
- Safari, mobiles physiques et mesure des 60 FPS sur matériel cible : non testés. Aucun déploiement effectué.

## Accent bleu ardoise — 18 octobre 2026

- À la demande de l'utilisateur, le beige #b8b2b0 est remplacé par #8da9c4 sur les surfaces, CTA, navigation active, illustrations de projets et accents de l'interface. Les couleurs des logos et données GitHub restent propres à leur contenu.
- Variante de lien clair #486581 ; secondaires clair #546170, sombre #aab8c7.
- Contrastes calculés : texte marine sur bleu 7,36:1 ; lien bleu sur blanc 6,08:1 ; accent bleu sur fond sombre 7,52:1.
- Les 59 contrôles Playwright passent avec la nouvelle couleur attendue. TypeScript et build de production passent.
- Captures inspectées : blue-accent-dark.png, blue-accent-light.png, blue-modal-light.png, blue-nav-mobile.png. Capture complémentaire : blue-projects-light.png.
- Safari et appareils physiques non revérifiés.

## Direction pétrole appliquée — 18 octobre 2026

- Choix final de l'utilisateur : pétrole, remplaçant le bleu ardoise ; cuivre non appliqué.
- Accent sombre #45b7aa avec texte marine #151621 ; accent clair #12645d avec texte blanc. Textes secondaires neutres #aab0ba / #5c626e.
- Titres principaux dans la couleur du texte du thème, fonds des illustrations #dde3ea ; composition et motion conservées.
- Navigation active, CTA, filtres, icônes, hovers et sélection adaptés à la nouvelle palette.
- Les 59 contrôles Playwright passent, dont navigation active dans les deux thèmes et 16 contrôles motion. TypeScript, build de production hors dist et git diff --check passent.
- Captures inspectées : petrol-final-dark.png, petrol-final-light.png, petrol-filters-light.png, petrol-mobile-light.png. Capture complémentaire : petrol-modal-light.png.
- Contrastes principaux issus des paires de couleurs : blanc/pétrole clair 6,98:1 ; marine/turquoise sombre 7,37:1.
- Safari, appareils physiques et 60 FPS sur matériel cible non revérifiés ; aucun déploiement effectué.

## Introduction JC — 18 octobre 2026

- Écran d'ouverture d'environ 1,15 s : tracé du cercle, apparition des lettres JC, signature Jason Chris, sortie douce puis entrée du portfolio.
- Palette pétrole existante, logo 160 px sur desktop / 128 px sur mobile, centre horizontal vérifié à 720 / 195 px. Aucun débordement dans les vues 1440 / 390 px.
- Une lecture par session d'onglet, mémorisée seulement à la fin ou lors du passage. Routes et rechargements suivants sans rejeu. Le portfolio commence son entrée après l'introduction.
- Bouton Passer, touche Échap, préférence de mouvement réduit au chargement ou en cours de lecture. Repli à 1,5 s si les animations CSS ne déclenchent pas leurs événements. Stockage indisponible : aucun blocage.
- Lien direct /realisations?project=aurora-management-v2 vérifié : introduction puis fiche Cyber Aurora Management, fermeture par Échap.
- Suite complète : 43 parcours + 16 motion + 11 introduction passés. Les 13 contrôles introduction repassent après ajout des cas lien direct et stockage indisponible, soit 72 contrôles distincts validés.
- TypeScript, build de production hors dist et git diff --check passent. Aucune dépendance ajoutée.
- Captures inspectées : jc-intro-dark.png, jc-intro-light.png, jc-intro-mobile.png. Captures après entrée : jc-intro-after-dark.png, jc-intro-after-light.png, jc-intro-after-mobile.png.
- Une requête Google Fonts a échoué (ERR_CONNECTION_CLOSED) et ralenti la première tentative de tests. Les contrôles fonctionnels isolent désormais ce CDN et vérifient le site avec sa police de secours ; la configuration des polices de l'application reste inchangée.
- Safari et appareils mobiles physiques non testés. Aucun déploiement effectué.

## Transitions Accueil / Projets — 18 octobre 2026

- Défaut confirmé avant correction : les deux pages se superposaient pendant la transition, le scroll changeait après le début de l'entrée et le footer changeait brutalement de position.
- Une seule page visible à la fois : sortie de 120 ms, positionnement de la destination à opacité nulle, puis entrée de 260 ms avec déplacement de 12 px. Le footer suit la même animation ; la navigation reste fixe.
- Pages conservées pour préserver les filtres. Le hero suit la visibilité effective de la page. Les changements de paramètres des modales n'interrompent plus la transition.
- Dernière navigation prioritaire : annulation propre de l'animation précédente, y compris un retour vers Contact avant la fin du départ vers Projets. La navigation mémorise immédiatement la route demandée pour gérer deux clics avant le rendu React.
- Vérifié : suite complète de 85 contrôles (43 fonctionnels, 16 motion, 13 introduction, 13 transitions), TypeScript, build de production dans /tmp et git diff --check.
- Vérifié dans Chromium : absence de superposition, scroll de sortie stable, destination positionnée avant son reveal, filtres conservés, modales, clics rapides, 404, mobile à 390 px et changement de préférence de mouvement réduit en cours d'animation.
- Captures desktop avant/après inspectées : transition-projects-before.png et transition-projects-after.png. Captures mobile inspectées : transition-projects-mobile.png et transition-contact-mobile.png. Design et palette conservés.
- Les contrôles fonctionnels isolent le CDN Google Fonts comme auparavant. Safari, appareils physiques et mesure des 60 FPS sur matériel cible non testés. Aucun déploiement effectué.
