# Atelier de graphes 2D

Un terrain de jeu interactif pour explorer différents graphes de proximité (Voronoï, alpha-shape, alpha-complex, Gabriel, RNG, NN-crust, MST) animés en Next.js.

## ✨ Fonctionnalités

- Animation fluide à 30 fps avec fond dynamique et cellules aux bords arrondis.
- Ajout de points par simple clic dans la scène.
- Déplacement des points en glisser-déposer avec recalcul instantané des structures.
- Palette de couleurs évolutive et halo lumineux pour un rendu esthétique.
- Palette de modes activable :
	- **Voronoï** (cellules arrondies)
		- **Alpha-shape** (arêtes filtrées par rayon $\alpha$)
		- **Alpha-complex** (triangles répondant à $\alpha$)
	- **NN-crust** (plus proche voisin)
	- **Graphe de Gabriel**
	- **Graphe de voisinages relatifs (RNG)**
	- **Arbre de recouvrement minimal (ARM / MST)**

## 🧰 Pile technique

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [d3-delaunay](https://github.com/d3/d3-delaunay) pour le calcul du diagramme de Voronoï

## 🚀 Mise en route

```bash
npm install
npm run dev
```

Ensuite, ouvrez [http://localhost:3000](http://localhost:3000) pour visualiser et manipuler le diagramme.

## 🕹️ Contrôles

- **Clic** : ajoute un nouveau point à la position du curseur.
- **Cliquer-glisser** : attrape un point existant et déplace-le en temps réel.
- **Sélecteur de mode** : choisissez le graphe de proximité à visualiser.
- **Curseur α** : ajustez le rayon pour les modes alpha-shape / alpha-complex.

## 📦 Scripts disponibles

- `npm run dev` – lance le serveur de développement avec rechargement à chaud.
- `npm run lint` – exécute ESLint.
- `npm run build` – génère la version de production.
- `npm run start` – démarre la build de production.

## 📄 Licence

Projet livré tel quel pour expérimentation académique.
