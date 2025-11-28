# Atelier interactif de graphes 2D — Voronoi et structures dérivées

*Mohamed De Franceschi*

Un outil interactif de visualisation et d'exploration des structures géométriques complexes basées sur la triangulation de Delaunay.

## À propos du projet

Ce projet a été réalisé dans le cadre du **Master IM (Informatique Multimédia)** à l'**Université de Haute Alsace**, pour la matière **"Algorithme Géométrique Appliqué à l'Image"**.

Il permet d'explorer en temps réel plusieurs structures géométriques :

- **Diagramme de Voronoï** : Partitionnement du plan basé sur la proximité aux points
- **Alpha-shape** : Contour filtré d'un ensemble de points
- **Alpha-complex** : Triangulation complète filtrée par un paramètre alpha
- **Graphes de proximité** : Gabriel, RNG, MST, NN-crust (présents dans le code, actuellement désactivés)

## Accès en ligne

L'application est disponible à l'adresse : **https://voronoi.moha-df.fr**

La documentation complète est consultable à : **https://voronoi.moha-df.fr/documentation**

## Installation et exécution

### Prérequis

- **Node.js** 18+ 
- **npm** 9+

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/Moha-df/voronoi-and-stuff.git
cd voronoi-and-stuff

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible à `http://localhost:3000`

## Guide d'interaction

### Interactions avec les points

#### Clic gauche

- **Sur la zone vide** : Ajoute un nouveau point à cette position
- **Maintenir sur un point** : Permet de le déplacer avec la souris. Le point suit votre curseur en temps réel

#### Clic droit

- **Sur la zone vide** : Crée un point fantôme qui affiche un cercle avec le rayon α actuel
- **Sur le point fantôme** : Le supprime

### Point fantôme (preview)

Le point fantôme est un outil de prévisualisation puissant :

- **Affiche un cercle pointillé** avec le rayon α actuel
- **Permet de voir l'impact** qu'aurait un nouveau point avant de l'ajouter
- **Vous pouvez le déplacer** avec clic gauche pour explorer différentes positions
- **Le supprimer** avec clic droit quand vous en avez terminé

### Contrôles supplémentaires

- **Slider α (alpha)** : Ajuste le rayon de filtrage pour les modes Alpha-shape et Alpha-complex
- **Boutons de mode** : Sélectionnez le type de graphe à visualiser
- **Slider d'image** : Chargez une image pour colorier les cellules selon les pixels

## Fonctionnalités principales

### Modes de visualisation

1. **Voronoï** : Diagramme complet avec cellules colorées animées
2. **Alpha-shape** : Arêtes limites filtrées par le rayon α
3. **Alpha-complex** : Tous les triangles filtrés (incluant les arêtes internes)

### Animation fluide

- Boucle d'animation via `requestAnimationFrame`
- Dégradés de couleurs animés en HSL
- Points et arêtes visibles à chaque frame

### Système de couleurs

- **Palette animée** : Teinte qui change progressivement avec le temps
- **Image coloring** : Moyenne des couleurs RGB dans chaque cellule Voronoï
- **Contraste adaptatif** : Luminosité variée pour la lisibilité

### Export

Exportez le résultat courant en image PNG haute qualité

## Architecture technique

Le projet est construit avec :

- **Next.js** : Framework React moderne avec App Router
- **React** : Composants interactifs
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styling responsive
- **d3-delaunay** : Triangulation de Delaunay performante
- **Canvas 2D** : Rendu graphique optimisé


## Documentation détaillée

Pour une documentation complète incluant :

- Guide utilisateur avec captures d'écran
- Guide développeur et architecture
- Explications techniques des algorithmes
- Optimisations et performance

Consultez : **https://voronoi.moha-df.fr/documentation**

## Contributions

Les contributions sont les bienvenues ! Si vous avez des idées d'améliorations, de corrections ou des nouveautés à proposer :

Les domaines d'amélioration potentiels incluent :

- Activation des modes Gabriel, RNG, MST, NN-crust
- Optimisations de performance supplémentaires
- Interface d'exportation améliorée
- Support du mode sombre/clair
- Nouvelles structures géométriques


## Auteur

**Mohamed De Franceschi**  
Master IM — Université de Haute Alsace  
Portfolio : https://moha-df.fr

## Ressources

- [d3-delaunay Documentation](https://github.com/d3/d3-delaunay)

