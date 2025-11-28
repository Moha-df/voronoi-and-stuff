/**
 * @fileoverview Documentation page
 * Comprehensive documentation for both users and developers
 * Includes guides, API references, and architecture documentation
 */

"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Documentation sections structure
 * Defines the table of contents and navigation
 */
const DOCUMENTATION_SECTIONS = [
  {
    id: "getting-started",
    title: "Guide Utilisateur",
    sections: [
      { id: "introduction", label: "Introduction" },
      { id: "interface-overview", label: "Aperçu de l'interface" },
      { id: "adding-points", label: "Ajouter et déplacer les points" },
      { id: "visualization-modes", label: "Modes de visualisation" },
      { id: "alpha-radius", label: "Contrôle du rayon α" },
      { id: "image-coloring", label: "Coloration par image" },
      { id: "exporting", label: "Exporter les résultats" },
    ],
  },
  {
    id: "developer-guide",
    title: "Guide Développeur",
    sections: [
      { id: "project-overview", label: "Vue d'ensemble du projet" },
      { id: "architecture", label: "Architecture modulaire" },
      { id: "file-structure", label: "Structure des fichiers" },
      { id: "types-system", label: "Système de types" },
      { id: "constants", label: "Constantes et configuration" },
      { id: "math-utils", label: "Utilitaires mathématiques" },
      { id: "geometry-algorithms", label: "Algorithmes géométriques" },
      { id: "canvas-utils", label: "Utilitaires Canvas/Rendu" },
      { id: "voronoi-component", label: "Composant VoronoiCanvas" },
    ],
  },
  {
    id: "technical",
    title: "Documentation Technique",
    sections: [
      { id: "technologies", label: "Technologies utilisées" },
      { id: "alpha-shape-algorithm", label: "Algorithme Alpha-Shape" },
      { id: "alpha-complex-algorithm", label: "Algorithme Alpha-Complex" },
      { id: "visual-effects", label: "Effets visuels" },
      { id: "performance", label: "Optimisations et Performance" },
      { id: "interactive-features", label: "Interactions utilisateur" },
      { id: "color-system", label: "Système de couleurs animées" },
    ],
  },
];

/**
 * Main documentation page component
 * Features:
 * - Two-column layout with navigation sidebar
 * - Table of contents
 * - Scrollable content area
 * - Responsive design
 */
export default function Documentation() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Helper component to create internal section links
   */
  const SectionLink = ({ sectionId, children }: { sectionId: string; children: React.ReactNode }) => (
    <button
      onClick={() => setActiveSection(sectionId)}
      className="text-cyan-300 hover:text-cyan-200 hover:underline transition cursor-pointer"
    >
      {children}
    </button>
  );

  /**
   * Flattens the nested section structure to find active section details
   */
  const getAllSections = () => {
    const all: Array<{ id: string; label: string; categoryTitle: string }> = [];
    DOCUMENTATION_SECTIONS.forEach((category) => {
      category.sections.forEach((section) => {
        all.push({
          id: section.id,
          label: section.label,
          categoryTitle: category.title,
        });
      });
    });
    return all;
  };

  const allSections = getAllSections();
  const activeSectionData = allSections.find((s) => s.id === activeSection);
  const currentSectionIndex = allSections.findIndex((s) => s.id === activeSection);
  const previousSection = currentSectionIndex > 0 ? allSections[currentSectionIndex - 1] : null;
  const nextSection = currentSectionIndex < allSections.length - 1 ? allSections[currentSectionIndex + 1] : null;

  return (
    <main className="flex min-h-screen flex-col bg-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 py-6 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              ← Retour
            </Link>
            <h1 className="text-2xl font-semibold text-white">Documentation</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-white/50 sm:block">Guide utilisateur et developpeur</p>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              {mobileMenuOpen ? "✕ Fermer" : "☰ Menu"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:block md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-slate-900/50 px-4 py-8`}>
          <nav className="space-y-6">
            {DOCUMENTATION_SECTIONS.map((category) => (
              <div key={category.id}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {category.title}
                </h2>
                <ul className="space-y-1">
                  {category.sections.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => {
                          setActiveSection(section.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                          activeSection === section.id
                            ? "border border-cyan-300/50 bg-cyan-300/10 font-medium text-cyan-300"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {section.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <article className="mx-auto max-w-4xl px-6 py-12 sm:px-8 lg:px-12">
            {/* Section Header */}
            <div className="mb-8 border-b border-white/10 pb-8">
              <p className="text-sm text-cyan-300/80">
                {activeSectionData?.categoryTitle}
              </p>
              <h1 className="mt-2 text-4xl font-semibold text-white">
                {activeSectionData?.label}
              </h1>
            </div>

            {/* Content Sections */}
            <div className="space-y-6 text-white/80">
              {activeSection === "introduction" && (
                <section className="space-y-6">
                  <p className="text-lg leading-relaxed text-white/80">
                    Bienvenue dans l'<strong>Atelier Interactif de Graphes 2D</strong>, une application
                    web interactive pour explorer et visualiser des structures géométriques complexes.
                  </p>

                  <div>
                    <h2 className="mb-3 text-2xl font-semibold text-white">
                      Qu'est-ce que vous pouvez faire ?
                    </h2>
                    <ul className="space-y-2 text-white/70">
                      <li className="flex gap-3">
                        <span className="text-cyan-300">•</span>
                        <span>
                          <strong className="text-white">Créer des diagrammes de Voronoï</strong> en ajoutant et en déplaçant des points
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-cyan-300">•</span>
                        <span>
                          <strong className="text-white">Visualiser plusieurs types de graphes</strong> : Voronoï, <SectionLink sectionId="alpha-shape-algorithm">Alpha-shape</SectionLink>, <SectionLink sectionId="alpha-complex-algorithm">Alpha-complex</SectionLink>
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-cyan-300">•</span>
                        <span>
                          <strong className="text-white">Colorer les cellules</strong> en fonction d'une image uploadée
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-cyan-300">•</span>
                        <span>
                          <strong className="text-white">Exporter vos créations</strong> en tant qu'image PNG
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-cyan-300">•</span>
                        <span>
                          <strong className="text-white">Contrôler les paramètres</strong> avec un slider alpha pour affiner les résultats
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="mb-3 text-2xl font-semibold text-white">
                      Utilisation en temps réel
                    </h2>
                    <p className="leading-relaxed text-white/70">
                      Tous les calculs sont effectués en temps réel (30 fps) dans votre navigateur.
                      Les visualisations sont animées avec des dégradés de couleurs dynamiques et
                      des effets lumineux pour une meilleure compréhension des structures géométriques.
                    </p>
                  </div>
                </section>
              )}

              {activeSection === "interface-overview" && (
                <section className="space-y-6">
                  <p className="text-lg leading-relaxed text-white/80">
                    L'interface est composée de plusieurs zones principales :
                  </p>

                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-white">
                      1. Zone de sélection des modes
                    </h3>
                    <p className="mb-3 text-white/70">
                      Au-dessus de la zone de visualisation, vous trouvez 7 boutons représentant les
                      différents modes de visualisation :
                    </p>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li>
                        <strong className="text-cyan-300">Voronoï</strong> : Diagramme de Voronoï avec cellules colorées animées
                      </li>
                      <li>
                        <button onClick={() => setActiveSection("alpha-shape-algorithm")} className="hover:underline">
                          <strong className="text-cyan-300">Alpha-shape</strong>
                        </button> : Arêtes filtrées par rayon α
                      </li>
                      <li>
                        <button onClick={() => setActiveSection("alpha-complex-algorithm")} className="hover:underline">
                          <strong className="text-cyan-300">Alpha-complex</strong>
                        </button> : Triangles satisfaisant la contrainte α
                      </li>
                      <li>
                        <strong className="text-cyan-300">Gabriel, RNG, MST, NN-crust</strong> : Autres graphes (actuellement désactivés)
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-white">
                      2. Zone de visualisation principale
                    </h3>
                    <p className="text-white/70">
                      La grande zone noire où s'affiche la géométrie. C'est ici que vous interagissez
                      avec les points et explorez les différentes structures.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-white">
                      3. Contrôles supplémentaires
                    </h3>
                    <p className="text-white/70">
                      En bas de l'interface : boutons pour charger une image, supprimer l'image ou
                      télécharger votre création.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-white">
                      4. Infos en temps réel
                    </h3>
                    <p className="text-white/70">
                      En bas à droite : affichage du mode actuel, du rayon α, du nombre de points,
                      de cellules/triangles/arêtes et du taux de rafraîchissement (30 fps).
                    </p>
                  </div>
                </section>
              )}

              {activeSection === "adding-points" && (
                <section className="space-y-6">
                  <p className="text-lg leading-relaxed text-white/80">
                    Les points sont le cœur du système. Voici comment les manipuler :
                  </p>

                  <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-6">
                    <h3 className="mb-4 text-xl font-semibold text-cyan-300">
                      Interaction avec les points
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 font-semibold text-white">
                          <span className="rounded bg-cyan-300/20 px-2 py-1 text-sm text-cyan-300">
                            Clic gauche
                          </span>
                        </h4>
                        <ul className="space-y-2 text-white/70 ml-4">
                          <li className="flex gap-2">
                            <span>→</span>
                            <span>
                              <strong className="text-white">Sur la zone vide</strong> : Ajoute un nouveau point à cette position
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span>→</span>
                            <span>
                              <strong className="text-white">Maintenir sur un point</strong> : Permet de le déplacer avec la souris.
                              Le point suit votre curseur en temps réel
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="mb-2 flex items-center gap-2 font-semibold text-white">
                          <span className="rounded bg-purple-300/20 px-2 py-1 text-sm text-purple-300">
                            Clic droit
                          </span>
                        </h4>
                        <ul className="space-y-2 text-white/70 ml-4">
                          <li className="flex gap-2">
                            <span>→</span>
                            <span>
                              <strong className="text-white">Sur la zone vide</strong> : Crée un <strong>point fantôme</strong> qui affiche
                              un cercle avec le rayon α actuel
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span>→</span>
                            <span>
                              <strong className="text-white">Sur le point fantôme</strong> : Le supprime
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-purple-300/20 bg-purple-300/5 p-6">
                    <h3 className="mb-4 text-xl font-semibold text-purple-300">
                      Point fantôme (preview)
                    </h3>

                    <div className="space-y-3 text-white/70">
                      <p>
                        Le point fantôme est un outil de prévisualisation puissant :
                      </p>
                      <ul className="space-y-2 ml-4">
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>
                            Affiche un <strong className="text-white">cercle pointillé</strong> avec le rayon α actuel
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>
                            Permet de voir l'impact qu'aurait un nouveau point <strong className="text-white">avant de l'ajouter</strong>
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>
                            Vous pouvez le <strong className="text-white">déplacer avec clic gauche</strong> pour explorer différentes positions
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>
                            Le <strong className="text-white">supprimer avec clic droit</strong> quand vous en avez terminé
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">
                      Conseils pratiques
                    </h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>
                          Vous pouvez ajouter autant de points que vous le souhaitez (démarre avec 10)
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>
                          Les points sont maintenus à une certaine distance des bords pour éviter les artefacts
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>
                          Les points restent visibles même en mode non-Voronoï
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>
                          Essayez de créer des motifs réguliers ou aléatoires pour voir différents résultats
                        </span>
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {activeSection === "visualization-modes" && (
                <section className="space-y-6">
                  <p className="text-lg leading-relaxed text-white/80">
                    Chaque mode de visualisation révèle une facette différente de la géométrie computationnelle.
                  </p>

                  <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-6">
                    <h3 className="mb-3 text-xl font-semibold text-cyan-300">
                      Voronoï (Mode par défaut)
                    </h3>
                    <p className="mb-3 text-white/70">
                      Le diagramme de Voronoï divise l'espace en cellules. Chaque cellule correspond à un
                      point et contient tous les pixels plus proches de ce point que de tout autre.
                    </p>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Les cellules sont <strong className="text-white">colorées avec dégradés animés</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Peut être <strong className="text-white">colorié avec une image</strong> uploadée</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Petit espacement entre les cellules pour améliorer la lisibilité</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-blue-300/20 bg-blue-300/5 p-6">
                    <h3 className="mb-3 text-xl font-semibold text-blue-300">
                      Alpha-shape
                    </h3>
                    <p className="mb-3 text-white/70">
                      Affiche uniquement les arêtes frontières d'une forme alpha. Contrôlez le rayon α
                      avec le slider pour voir comment la forme change.
                    </p>
                    <p className="text-white/70 ml-4">
                      Les cellules Voronoï restent visibles en arrière-plan avec faible opacité.
                    </p>
                  </div>

                  <div className="rounded-lg border border-indigo-300/20 bg-indigo-300/5 p-6">
                    <h3 className="mb-3 text-xl font-semibold text-indigo-300">
                      Alpha-complex
                    </h3>
                    <p className="mb-3 text-white/70">
                      Affiche les triangles qui satisfont la contrainte alpha, avec illumination additive
                      pour créer un effet de superposition lumineux.
                    </p>
                    <p className="text-white/70 ml-4">
                      Combinez cela avec un rayon α variable pour explorer différentes structures.
                    </p>
                  </div>

                  <div className="text-sm text-white/60 rounded-lg border border-white/10 bg-white/5 p-4">
                    <p>
                      <strong>Note :</strong> Les modes Gabriel, RNG, NN-crust et MST seront activés dans les prochaines versions.
                      Ils permettront d'explorer d'autres types de graphes géométriques.
                    </p>
                  </div>
                </section>
              )}

              {activeSection === "alpha-radius" && (
                <section className="space-y-6">
                  <p className="text-lg leading-relaxed text-white/80">
                    Le rayon α (alpha) est un paramètre clé pour les modes <SectionLink sectionId="alpha-shape-algorithm">Alpha-shape</SectionLink> et <SectionLink sectionId="alpha-complex-algorithm">Alpha-complex</SectionLink>.
                  </p>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">
                      Contrôle du slider
                    </h3>
                    <p className="mb-3 text-white/70">
                      Le slider en haut varie de <strong className="text-white">0 à 1</strong> et correspond à des rayons :
                    </p>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4 font-mono text-sm text-white/70">
                      <div>0.0 - 0.5   → 12 - 500 px</div>
                      <div>0.5 - 0.75 → 500 - 1000 px</div>
                      <div>0.75 - 1.0 → 1000 - 5000 px</div>
                    </div>
                    <p className="mt-3 text-white/70">
                      Cette <strong className="text-white">cartographie non-linéaire</strong> permet un contrôle fin aux petits
                      rayons et un accès rapide aux grands rayons.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">
                      Point fantôme et visualisation
                    </h3>
                    <p className="text-white/70">
                      Utilisez le point fantôme (clic droit) pour voir le cercle du rayon α actuel.
                      Cela vous aide à comprendre l'impact du rayon sur la géométrie.
                    </p>
                  </div>

                  <div className="rounded-lg border border-violet-300/20 bg-violet-300/5 p-6">
                    <h3 className="mb-3 text-xl font-semibold text-violet-300">
                      Expérimentez !
                    </h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>
                          Petit rayon (&lt; 0.1) : Structure très détaillée, peu de cellules fusionnées
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>
                          Rayon moyen (0.3 - 0.5) : Équilibre entre détail et simplification
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>
                          Grand rayon (&gt; 0.8) : Structure très simplifiée, formes géométriques principales
                        </span>
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {activeSection === "image-coloring" && (
                <section className="space-y-6">
                  <p className="text-lg leading-relaxed text-white/80">
                    Transformez vos diagrammes de Voronoï en utilisant les couleurs d'une image.
                  </p>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">
                      Comment ça marche
                    </h3>
                    <ol className="space-y-3 text-white/70 ml-4">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 rounded-full bg-cyan-300/20 w-6 h-6 flex items-center justify-center text-cyan-300 text-sm">1</span>
                        <span>
                          Cliquez sur <strong className="text-white">"Charger une image"</strong> en bas de la page
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 rounded-full bg-cyan-300/20 w-6 h-6 flex items-center justify-center text-cyan-300 text-sm">2</span>
                        <span>
                          Sélectionnez une image JPG, PNG, ou tout format d'image supporté
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 rounded-full bg-cyan-300/20 w-6 h-6 flex items-center justify-center text-cyan-300 text-sm">3</span>
                        <span>
                          Les cellules Voronoï adoptent la couleur moyenne de l'image à leur position
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 rounded-full bg-cyan-300/20 w-6 h-6 flex items-center justify-center text-cyan-300 text-sm">4</span>
                        <span>
                          Modifiez les points pour voir les couleurs changer en temps réel
                        </span>
                      </li>
                    </ol>
                  </div>

                  <div className="rounded-lg border border-purple-300/20 bg-purple-300/5 p-6">
                    <h3 className="mb-3 text-xl font-semibold text-purple-300">
                      Algorithme de coloration
                    </h3>
                    <p className="text-white/70">
                      Pour chaque cellule, on extrait les pixels de l'image qui se trouvent à l'intérieur
                      et on calcule la couleur moyenne. Les cellules plus proches de zones claires de
                      l'image seront plus claires, et inversement.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">
                      Exporter avec couleurs
                    </h3>
                    <p className="text-white/70">
                      Une fois l'image chargée, vous pouvez télécharger votre création. L'export
                      préserve les couleurs de l'image sans les artefacts d'animation.
                    </p>
                  </div>

                  <div className="rounded-lg border border-violet-300/20 bg-violet-300/5 p-6">
                    <h3 className="mb-3 text-xl font-semibold text-violet-300">
                      Idées créatives
                    </h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Utilisez des photos de paysages pour créer des tableaux géométriques</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Essayez des dégradés ou des motifs pour des effets abstraits</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Combinez avec différents modes de visualisation</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Ajustez les points pour créer des compositions équilibrées</span>
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {activeSection === "exporting" && (
                <section className="space-y-6">
                  <p className="text-lg leading-relaxed text-white/80">
                    Téléchargez et partagez vos créations géométriques.
                  </p>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">
                      Comment exporter
                    </h3>
                    <ol className="space-y-3 text-white/70 ml-4">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 rounded-full bg-cyan-300/20 w-6 h-6 flex items-center justify-center text-cyan-300 text-sm">1</span>
                        <span>
                          Sélectionnez le mode <strong className="text-white">Voronoï</strong> (l'export est disponible uniquement dans ce mode)
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 rounded-full bg-cyan-300/20 w-6 h-6 flex items-center justify-center text-cyan-300 text-sm">2</span>
                        <span>
                          Cliquez sur le bouton <strong className="text-white">"Télécharger"</strong>
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 rounded-full bg-cyan-300/20 w-6 h-6 flex items-center justify-center text-cyan-300 text-sm">3</span>
                        <span>
                          L'image sera téléchargée sous le nom <code className="bg-white/10 px-2 py-1">voronoi-artwork.png</code>
                        </span>
                      </li>
                    </ol>
                  </div>

                  <div className="rounded-lg border border-blue-300/20 bg-blue-300/5 p-6">
                    <h3 className="mb-3 text-xl font-semibold text-blue-300">
                      Format d'export
                    </h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>
                          <strong className="text-white">Format PNG</strong> pour une qualité sans perte
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>
                          <strong className="text-white">Résolution native</strong> de votre viewport (adaptatif)
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>
                          L'export est <strong className="text-white">statique</strong> (pas d'animation)
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>
                          Pas de décalage entre les cellules ni de coins arrondis dans l'export
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">
                      Cas d'usage
                    </h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Créer des backgrounds pour des projets artistiques</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Générer des patterns géométriques uniques</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Partager vos explorations géométriques</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Incorporer dans des présentations ou projets</span>
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {/* Guide Développeur */}
              {activeSection === "project-overview" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Vue d'ensemble du projet</h2>
                    <p className="mb-4 text-white/70 leading-relaxed">
                      Ce projet est une application interactive de visualisation de diagrammes de Voronoï construite avec Next.js 16,
                      React et TypeScript. Elle permet aux utilisateurs de manipuler des points en temps réel et d'explorer différentes structures
                      géométriques dérivées du diagramme de Delaunay.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Objectif principal</h3>
                    <p className="text-white/70 leading-relaxed">
                      Fournir une plateforme interactive et performante pour comprendre et explorer les diagrammes de Voronoï
                      et autres structures géométriques, avec support pour le coloring d'image et l'export haute résolution.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Architecture générale</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Frontend</strong> : Next.js 16 avec React, TypeScript et Tailwind CSS</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Rendu</strong> : Canvas 2D pour les performances</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Géométrie</strong> : Bibliothèque d3-delaunay pour Delaunay/Voronoï</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">État</strong> : Gestion via React Hooks (useState, useRef, useMemo)</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Principes de conception</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Modularité</strong> : Séparation stricte des responsabilités en modules indépendants</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Pureté fonctionnelle</strong> : Fonctions sans effets secondaires dans les utilitaires</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Réutilisabilité</strong> : Code partagé dans des modules dédiés</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Documentation</strong> : Commentaires JSDoc complets sur toutes les fonctions</span>
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {activeSection === "architecture" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Architecture modulaire</h2>
                    <p className="mb-4 text-white/70 leading-relaxed">
                      Le projet suit une architecture modulaire où chaque fichier a une responsabilité précise et bien définie.
                      Les dépendances sont unidirectionnelles et hiérarchiques.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Couches architecturales</h3>
                    <ul className="space-y-3 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">Couche 1 - Types & Constants</strong>
                          <p className="text-sm mt-1">Définitions de types et valeurs constantes utilisées par tous les autres modules</p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">Couche 2 - Utilitaires mathématiques</strong>
                          <p className="text-sm mt-1">Fonctions mathématiques pures (clamp, distance, approximation, etc.)</p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">Couche 3 - Algorithmes géométriques</strong>
                          <p className="text-sm mt-1">Implémentation des structures géométriques (Voronoï, alpha-shape, graphes)</p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">Couche 4 - Rendu Canvas</strong>
                          <p className="text-sm mt-1">Fonctions de dessin et d'animation sur le canvas</p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">Couche 5 - Composant React</strong>
                          <p className="text-sm mt-1">Composant VoronoiCanvas orchestrant les interactions et l'animation</p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">Couche 6 - Pages React</strong>
                          <p className="text-sm mt-1">Pages Next.js (homepage, documentation)</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Flux de données</h3>
                    <p className="text-white/70 leading-relaxed mb-3">
                      Le flux de données suit un modèle unidirectionnel :
                    </p>
                    <p className="text-white/70 text-sm leading-relaxed italic">
                      Événements utilisateur → État React → Calcul des structures → Rendu Canvas
                    </p>
                  </div>
                </section>
              )}

              {activeSection === "file-structure" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Structure des fichiers</h2>
                    <p className="mb-4 text-white/70 leading-relaxed">
                      Organisation du code source avec une séparation claire entre les utilitaires réutilisables et les composants React.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">src/lib/ - Modules utilitaires</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">types.ts</strong>
                          <p className="text-sm text-white/50">Définitions TypeScript pour l'application (Point, GraphMode, etc.)</p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">constants.ts</strong>
                          <p className="text-sm text-white/50">Constantes globales (dimensions, rayons, FPS, etc.)</p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">math-utils.ts</strong>
                          <p className="text-sm text-white/50">Utilitaires mathématiques (distance, clamp, trigonométrie)</p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">geometry-algorithms.ts</strong>
                          <p className="text-sm text-white/50">Algorithmes géométriques (Voronoï, alpha-shape, alpha-complex)</p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">canvas-utils.ts</strong>
                          <p className="text-sm text-white/50">Fonctions de rendu et d'animation sur le canvas</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">src/app/components/ - Composants React</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">VoronoiCanvas.tsx</strong>
                          <p className="text-sm text-white/50">Composant principal avec gestion des interactions et de l'animation</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">src/app/ - Pages Next.js</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">page.tsx</strong>
                          <p className="text-sm text-white/50">Page d'accueil avec le composant VoronoiCanvas</p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">documentation/page.tsx</strong>
                          <p className="text-sm text-white/50">Documentation complète avec navigation par sections</p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">layout.tsx</strong>
                          <p className="text-sm text-white/50">Layout global avec styles globaux et métadonnées</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {activeSection === "types-system" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Système de types</h2>
                    <p className="mb-4 text-white/70 leading-relaxed">
                      TypeScript fournit une sécurité de type complète. Voici les types principaux utilisés dans l'application.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Types géométriques fondamentaux</h3>
                    <ul className="space-y-2 text-white/70 ml-4 font-mono text-sm">
                      <li><strong className="text-cyan-300">Point</strong> : {`{ x: number; y: number }`}</li>
                      <li><strong className="text-cyan-300">EdgeIndex</strong> : [number, number]</li>
                      <li><strong className="text-cyan-300">TriangleIndex</strong> : [number, number, number]</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Types de modes de visualisation</h3>
                    <ul className="space-y-2 text-white/70 ml-4 font-mono text-sm">
                      <li><strong className="text-cyan-300">GraphMode</strong> : "voronoi" | "alpha-shape" | "alpha-complex" | "gabriel" | "rng" | "mst" | "nn-crust"</li>
                      <li><strong className="text-cyan-300">DerivedStructures</strong> : Toutes les structures de graphes calculées</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Types d'interaction</h3>
                    <ul className="space-y-2 text-white/70 ml-4 font-mono text-sm">
                      <li><strong className="text-cyan-300">DragState</strong> : Point en cours de déplacement</li>
                      <li><strong className="text-cyan-300">GhostDragState</strong> : Aperçu du point fantôme au clic-droit</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Types de configuration</h3>
                    <ul className="space-y-2 text-white/70 ml-4 font-mono text-sm">
                      <li><strong className="text-cyan-300">CanvasSize</strong> : {`{ width: number; height: number }`}</li>
                      <li><strong className="text-cyan-300">RGBColor</strong> : {`{ r: number; g: number; b: number }`}</li>
                      <li><strong className="text-cyan-300">AlphaData</strong> : Résultats du calcul d'alpha-shape</li>
                    </ul>
                  </div>
                </section>
              )}

              {activeSection === "constants" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Constantes et configuration</h2>
                    <p className="mb-4 text-white/70 leading-relaxed">
                      Tous les paramètres configurables sont centralisés dans constants.ts pour une maintenance facile.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Dimensions par défaut</h3>
                    <ul className="space-y-2 text-white/70 ml-4 font-mono text-sm">
                      <li><strong className="text-cyan-300">DEFAULT_WIDTH</strong> : 960 pixels</li>
                      <li><strong className="text-cyan-300">DEFAULT_HEIGHT</strong> : 600 pixels</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Paramètres de rendu</h3>
                    <ul className="space-y-2 text-white/70 ml-4 font-mono text-sm">
                      <li><strong className="text-cyan-300">FPS</strong> : 30 images par seconde</li>
                      <li><strong className="text-cyan-300">POINT_RADIUS</strong> : 10 pixels (rayon des points)</li>
                      <li><strong className="text-cyan-300">ALPHA_SLIDER_DEFAULT</strong> : 0.25 (rayon alpha initial)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Points initiaux</h3>
                    <p className="text-white/70 leading-relaxed">
                      INITIAL_SEEDS contient 10 points pré-définis distribuées sur le canvas pour le chargement initial du visualiseur.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Plages de sliders</h3>
                    <ul className="space-y-2 text-white/70 ml-4 font-mono text-sm">
                      <li><strong className="text-cyan-300">SLIDER_RANGES</strong> : Mappage non-linéaire du slider (0-1) vers le rayon (12-5000 px)</li>
                    </ul>
                  </div>
                </section>
              )}

              {activeSection === "math-utils" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Utilitaires mathématiques</h2>
                    <p className="mb-4 text-white/70 leading-relaxed">
                      Fonctions mathématiques pures pour les calculs géométriques et numériques.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Fonctions de base</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">clamp(value, min, max)</strong> : Restreint une valeur entre min et max</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">pseudoRandom(seed)</strong> : Générateur de nombres aléatoires déterministes</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">approxEqual(a, b)</strong> : Égalité avec tolérance numérique</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Fonctions de distance</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">distance(p1, p2)</strong> : Distance euclidienne entre deux points</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">distanceSquared(p1, p2)</strong> : Distance² (plus rapide, pas de sqrt)</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Géométrie</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">triangleArea(p1, p2, p3)</strong> : Aire d'un triangle</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">circumradius(p1, p2, p3)</strong> : Rayon du cercle circonscrit</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">isPointInPolygon(point, polygon)</strong> : Test de point dans polygone</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Sliders</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">sliderToRadius(value)</strong> : Convertit slider (0-1) en rayon (12-5000 px)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">radiusToSlider(radius)</strong> : Conversion inverse</span>
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {activeSection === "geometry-algorithms" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Algorithmes géométriques</h2>
                    <p className="mb-4 text-white/70 leading-relaxed">
                      Implémentation des structures géométriques complexes basées sur la triangulation de Delaunay.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Fonction principale</h3>
                    <p className="text-white/70 leading-relaxed mb-3">
                      <strong className="text-white">computeDerivedStructures(points, radius, mode)</strong> orchestre le calcul de toutes les structures.
                    </p>
                    <p className="text-white/70 text-sm">
                      Elle retourne un objet contenant les arêtes de Voronoï, les cellules, et toutes les structures de graphes demandées.
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Structures calculées</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Voronoi</strong> : Diagramme de Voronoï complet avec cellules</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><SectionLink sectionId="alpha-shape-algorithm"><strong className="text-white">Alpha-shape</strong></SectionLink> : Filtre les arêtes par rayon alpha</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><SectionLink sectionId="alpha-complex-algorithm"><strong className="text-white">Alpha-complex</strong></SectionLink> : Triangles satisfaisant la contrainte alpha</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Optimisations</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Utilisation de <strong className="text-white">d3-delaunay</strong> pour la triangulation performante</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Distances au carré</strong> pour éviter les sqrt coûteux</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Mémoïsation</strong> des structures avec useMemo dans le composant</span>
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {activeSection === "canvas-utils" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Utilitaires Canvas/Rendu</h2>
                    <p className="mb-4 text-white/70 leading-relaxed">
                      Fonctions de rendu 2D optimisées pour les performances à 30 FPS avec des couleurs animées en HSL.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Fonction principale de rendu</h3>
                    <p className="text-white/70 leading-relaxed mb-3">
                      <strong className="text-white">drawScene()</strong> est le point d'entrée principal qui :
                    </p>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>1.</span>
                        <span>Efface le canvas avec un fond semi-transparent</span>
                      </li>
                      <li className="flex gap-2">
                        <span>2.</span>
                        <span>Dessine les cellules Voronoï de fond</span>
                      </li>
                      <li className="flex gap-2">
                        <span>3.</span>
                        <span>Dessine les triangles alpha si applicable</span>
                      </li>
                      <li className="flex gap-2">
                        <span>4.</span>
                        <span>Dessine les arêtes des graphes</span>
                      </li>
                      <li className="flex gap-2">
                        <span>5.</span>
                        <span>Dessine les points</span>
                      </li>
                      <li className="flex gap-2">
                        <span>6.</span>
                        <span>Dessine le point fantôme s'il existe</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Fonctions de dessin</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">drawVoronoiCells()</strong> : Remplit les cellules Voronoï avec des couleurs</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">drawAlphaTriangles()</strong> : Remplit les triangles alpha</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">drawGraphEdges()</strong> : Trace les arêtes des graphes</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">drawPoints()</strong> : Dessine les points interactifs</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">drawGhostPoint()</strong> : Aperçu du point fantôme</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><SectionLink sectionId="visual-effects"><strong className="text-white">drawRoundedPolygon()</strong></SectionLink> : Remplit un polygone avec coins arrondis</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Système de couleurs</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Teinte (Hue) animée</strong> : Change progressivement avec le temps</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Saturation</strong> : 70% par défaut</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Luminosité</strong> : Varie selon la cellule pour le contraste</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><SectionLink sectionId="color-system"><strong className="text-white">Image coloring</strong></SectionLink> : Moyenne des couleurs RGB dans chaque cellule</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Optimisations de performance</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Utilisation d'un <strong className="text-white">ImageData cache</strong> pour l'échantillonnage rapide d'image</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Réutilisation des objets</strong> (path2D, contextes)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Boucle d'animation requestAnimationFrame</strong> à 30 FPS cible</span>
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {activeSection === "voronoi-component" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Composant VoronoiCanvas</h2>
                    <p className="mb-4 text-white/70 leading-relaxed">
                      Composant React principal qui orchestre toutes les interactions utilisateur, le calcul des structures géométriques et le rendu.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Gestion d'état</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">points</strong> : Liste des points Voronoï actuels</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">graphMode</strong> : Mode de visualisation actuel</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">alphaRadius</strong> : Rayon alpha (0-1)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">dragState</strong> : Point en cours de déplacement</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">ghostDragState</strong> : Aperçu du point fantôme</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">uploadedImage</strong> : Image chargée pour le coloring</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Interactions utilisateur</h3>
                    <ul className="space-y-3 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">Clic gauche</strong> : Ajouter point ou commencer le déplacement
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">Déplacement de souris</strong> : Déplacer le point actif ou afficher le point fantôme
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">Relâche souris</strong> : Finaliser le déplacement
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <div>
                          <strong className="text-white">Clic droit</strong> : Afficher le point fantôme à cette position
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Cycle de vie et effets</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">useRef</strong> : Canvas et contexte 2D</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">useMemo</strong> : Structures géométriques (recalculées seulement si points ou radius changent)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">useEffect</strong> : Boucle d'animation (requestAnimationFrame)</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Fonctionnalités clés</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span>Upload d'image pour coloring automatique</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span>Sélection du mode de visualisation (6 modes)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span>Contrôle du rayon alpha avec slider interactif</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span>Export PNG haute résolution</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span>Animation fluide à 30 FPS</span>
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {/* Documentation Technique */}
              {activeSection === "technologies" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Technologies utilisées</h2>
                    <p className="mb-4 text-white/70 leading-relaxed">
                      Stack technologique moderne optimisée pour les performances et la maintenabilité.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Frontend</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Next.js 16</strong> avec Turbopack pour builds ultra-rapides</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">React 19</strong> avec App Router et Server Components</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">TypeScript</strong> pour la sécurité de type</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Tailwind CSS</strong> pour le styling utilitaire</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Géométrie et mathématiques</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">d3-delaunay</strong> (v7) : Triangulation de Delaunay et diagrammes de Voronoï</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Rendu</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Canvas 2D API</strong> : Rendu bas-niveau optimisé</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">requestAnimationFrame</strong> : Boucle d'animation synchronisée avec l'écran</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Développement</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">ESLint</strong> : Linting et qualité du code</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">npm</strong> : Gestion des dépendances</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">VS Code</strong> : Environnement de développement</span>
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {activeSection === "performance" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Optimisations et Performance</h2>
                    <p className="mb-4 text-white/70 leading-relaxed">
                      L'application est optimisée pour maintenir 30 FPS même avec des centaines de points.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Optimisations mathématiques</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span><strong className="text-white">Distances au carré</strong> : Évite les sqrt coûteux</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span><strong className="text-white">Early exit</strong> : Abandonne les calculs inutiles tôt</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span><strong className="text-white">Caching de valeurs</strong> : Réutilise les résultats</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Optimisations React</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span><strong className="text-white">useMemo</strong> : Structures géométriques recalculées uniquement si points ou radius changent</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span><strong className="text-white">useRef</strong> : Canvas et contexte 2D non-réactifs</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span><strong className="text-white">Pas de re-renders</strong> : Gestion d'état minimale</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Optimisations Canvas</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span><strong className="text-white">FPS cible</strong> : 30 FPS = équilibre perfs/fluidité</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span><strong className="text-white">Batch drawing</strong> : Tous les éléments dessinés en un seul rendu</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span><strong className="text-white">ImageData cache</strong> : Échantillonnage d'image rapide</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Scalabilité</h3>
                    <p className="text-white/70 leading-relaxed">
                      L'application est optimisée pour gérer :
                    </p>
                    <ul className="space-y-2 text-white/70 ml-4 mt-2">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Nombreux points</strong> grâce aux optimisations mathématiques</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Résolutions variables</strong> du Canvas selon la taille de la fenêtre</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Images uploadées</strong> pour le coloring (utilisées en taille originale)</span>
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {activeSection === "interactive-features" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Interactions utilisateur</h2>
                    <p className="mb-4 text-white/70 leading-relaxed">
                      Architecture complète pour gérer les interactions souris fluides et intuitives.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Détection de collision</h3>
                    <p className="text-white/70 leading-relaxed mb-3">
                      Pour chaque action souris, l'application détecte quel point (si existe) est sous le curseur :
                    </p>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Rayon de détection : <strong className="text-white">POINT_RADIUS × HIT_DISTANCE_MULTIPLIER</strong> (20 pixels)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Utilise <strong className="text-white">distanceSquared</strong> pour performance</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Boucle optimisée pour petits nombres de points</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Gestion du drag-and-drop</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>1.</span>
                        <span>Stocke le point en cours et l'offset souris</span>
                      </li>
                      <li className="flex gap-2">
                        <span>2.</span>
                        <span>Met à jour en temps réel la position du point</span>
                      </li>
                      <li className="flex gap-2">
                        <span>3.</span>
                        <span>Recalcule les structures géométriques (via useMemo)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>4.</span>
                        <span>Finalise l'état au relâchement de la souris</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Point fantôme (Ghost point)</h3>
                    <p className="text-white/70 leading-relaxed mb-3">
                      Affiche un aperçu du point avant de l'ajouter :
                    </p>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Activé au <strong className="text-white">clic-droit</strong> ou <strong className="text-white">déplacement</strong> sans point actif</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Suit le curseur en temps réel</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Style semi-transparent pour distinction</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Minimum de points requis</h3>
                    <p className="text-white/70 leading-relaxed">
                      L'application requiert un minimum de 3 points pour afficher un diagramme de Voronoï valide.
                    </p>
                  </div>
                </section>
              )}

              {activeSection === "color-system" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Système de couleurs animées</h2>
                    <p className="mb-4 text-white/70 leading-relaxed">
                      Système de couleurs HSL avec animation fluide et support du coloring par image.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Palette HSL animée</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Teinte (H)</strong> : Change progressivement (0-360°)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Saturation (S)</strong> : Fixée à 70% pour vivacité constante</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Luminosité (L)</strong> : Varie par cellule pour le contraste</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Animation de teinte</h3>
                    <p className="text-white/70 leading-relaxed mb-3">
                      La teinte globale change progressivement en fonction du temps (voir <SectionLink sectionId="smooth-animation">Animation fluide</SectionLink>) :
                    </p>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Facteur de vitesse : <strong className="text-white">40 degrés par frame</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>À 30 FPS, une rotation complète prend ~0.3 secondes</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Coloring par image</h3>
                    <p className="text-white/70 leading-relaxed mb-3">
                      Remplace les couleurs animées par les moyennes de couleur de l'image :
                    </p>
                    <ul className="space-y-3 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>1.</span>
                        <div>
                          <strong className="text-white">Upload d'image</strong> : Utilisateur charge une image PNG/JPG
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>2.</span>
                        <div>
                          <strong className="text-white">Extraction pixels</strong> : getImageData() récupère les pixels de l'image
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>3.</span>
                        <div>
                          <strong className="text-white">Moyenne par cellule</strong> : Moyenne RGB des pixels in-cell
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span>4.</span>
                        <div>
                          <strong className="text-white">Moyenne par cellule</strong> : Moyenne RGB des pixels in-cell
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Palettes de couleurs</h3>
                    <p className="text-white/70 leading-relaxed">
                      Deux palettes principales :
                    </p>
                    <ul className="space-y-2 text-white/70 ml-4 mt-2">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Palette animée</strong> : Teinte changeante avec luminosité fixe</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Palette image</strong> : Couleurs tirées de l'image uploadée</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Contraste et lisibilité</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Luminosité adaptée selon la cellule pour éviter les couleurs trop claires/foncées</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Points et arêtes toujours visibles sur fond coloré</span>
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {activeSection === "visual-effects" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Effets visuels</h2>
                    <p className="mb-4 text-white/70 leading-relaxed">
                      Implémentation technique des effets visuels distinctifs : gaps entre les cellules et coins arrondis des polygones.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">CELL_GAP : Espacement entre cellules</h3>
                    <p className="text-white/70 leading-relaxed mb-4">
                      Les cellules Voronoï sont légèrement réduites pour créer un effet d'espacement visuel de <strong className="text-white">3 pixels</strong> entre les régions adjacentes.
                    </p>

                    <p className="text-white/70 leading-relaxed mb-3">
                      <strong className="text-white">Algorithme :</strong>
                    </p>
                    <ol className="space-y-2 text-white/70 ml-4 mb-4">
                      <li className="flex gap-2">
                        <span>1.</span>
                        <span>Calculer le centroïde du polygone (moyenne de tous les sommets)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>2.</span>
                        <span>Pour chaque sommet, calculer le vecteur du centroïde vers le sommet</span>
                      </li>
                      <li className="flex gap-2">
                        <span>3.</span>
                        <span>Réduire la distance du vecteur de CELL_GAP (3px)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>4.</span>
                        <span>Ramener le sommet à sa nouvelle position réduite</span>
                      </li>
                    </ol>

                    <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4 mb-4">
                      <p className="text-white/70 text-sm mb-3 font-mono">
                        <strong className="text-cyan-300">Code : shrinkPolygon() — geometry-algorithms.ts (lines 78-106)</strong>
                      </p>
                      <pre className="text-xs text-white/60 overflow-x-auto whitespace-pre-wrap break-words">
{`export const shrinkPolygon = (
  polygon: Array<[number, number]>,
  amount: number
): Array<[number, number]> => {
  // Calculate centroid
  const cx = polygon.reduce((sum, [x]) => sum + x, 0) / polygon.length;
  const cy = polygon.reduce((sum, [, y]) => sum + y, 0) / polygon.length;

  // Shrink each vertex toward the centroid
  return polygon.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy);
    
    if (dist === 0) return [x, y];
    
    // Move vertex closer to centroid by 'amount'
    const shrinkDist = Math.max(0, dist - amount);
    return [
      cx + (dx / dist) * shrinkDist,
      cy + (dy / dist) * shrinkDist
    ];
  });
};`}
                      </pre>
                    </div>

                    <p className="text-white/70 leading-relaxed mb-3">
                      <strong className="text-white">Formule mathématique :</strong>
                    </p>
                    <p className="text-white/70 text-sm leading-relaxed">
                      Pour chaque vertex V_i, sa nouvelle position V'_i est : 
                    </p>
                    <p className="text-white/70 text-sm text-center my-3 font-mono bg-slate-900/50 p-3 rounded">
                      V'_i = C + (V_i - C) × max(0, ||V_i - C|| - CELL_GAP) / ||V_i - C||
                    </p>
                    <p className="text-white/70 text-sm leading-relaxed">
                      où C est le centroïde du polygone.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">CELL_ROUNDING : Coins arrondis</h3>
                    <p className="text-white/70 leading-relaxed mb-4">
                      Les cellules ont des coins arrondis de <strong className="text-white">28 pixels</strong> de rayon pour un rendu lisse et moderne.
                    </p>

                    <p className="text-white/70 leading-relaxed mb-3">
                      <strong className="text-white">Algorithme :</strong>
                    </p>
                    <ol className="space-y-2 text-white/70 ml-4 mb-4">
                      <li className="flex gap-2">
                        <span>1.</span>
                        <span>Pour chaque sommet du polygone, identifier ses 2 voisins (précédent et suivant)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>2.</span>
                        <span>Calculer l'offset de rondeur depuis le sommet selon les 2 arêtes adjacentes</span>
                      </li>
                      <li className="flex gap-2">
                        <span>3.</span>
                        <span>Tracer une courbe quadratique Bézier (quadraticCurveTo) pour chaque coin</span>
                      </li>
                    </ol>

                    <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4 mb-4">
                      <p className="text-white/70 text-sm mb-3 font-mono">
                        <strong className="text-cyan-300">Code : drawRoundedPolygon() — canvas-utils.ts (lines 18-84)</strong>
                      </p>
                      <pre className="text-xs text-white/60 overflow-x-auto whitespace-pre-wrap break-words">
{`export const drawRoundedPolygon = (
  ctx: CanvasRenderingContext2D,
  polygon: Array<[number, number]>,
  radius: number
): void => {
  if (polygon.length < 3) return;

  const n = polygon.length;
  
  // Start from the first vertex
  const [x0, y0] = polygon[0];
  const [x1, y1] = polygon[1];
  
  // Calculate offset for the starting corner
  const dx1 = x1 - x0;
  const dy1 = y1 - y0;
  const len1 = Math.hypot(dx1, dy1);
  
  // Move starting point along the first edge
  const offset1 = Math.min(
    radius,
    len1 / 2,
    Math.hypot(...polygon[n - 1]) / 2
  );
  
  ctx.moveTo(
    x0 + (dx1 / len1) * offset1,
    y0 + (dy1 / len1) * offset1
  );

  // Draw rounded corners using quadratic curves
  for (let i = 0; i < n; i++) {
    const prev = polygon[(i - 1 + n) % n];
    const curr = polygon[i];
    const next = polygon[(i + 1) % n];

    const dxPrev = curr[0] - prev[0];
    const dyPrev = curr[1] - prev[1];
    const lenPrev = Math.hypot(dxPrev, dyPrev);

    const dxNext = next[0] - curr[0];
    const dyNext = next[1] - curr[1];
    const lenNext = Math.hypot(dxNext, dyNext);

    // Calculate radius for this corner
    const cornerRadius = Math.min(
      radius,
      lenPrev / 2,
      lenNext / 2
    );

    // Start of the curve (on edge before vertex)
    const startX = curr[0] - (dxPrev / lenPrev) * cornerRadius;
    const startY = curr[1] - (dyPrev / lenPrev) * cornerRadius;

    // End of the curve (on edge after vertex)
    const endX = curr[0] + (dxNext / lenNext) * cornerRadius;
    const endY = curr[1] + (dyNext / lenNext) * cornerRadius;

    // Quadratic Bézier curve through the vertex
    ctx.quadraticCurveTo(curr[0], curr[1], endX, endY);
  }

  ctx.closePath();
};`}
                      </pre>
                    </div>

                    <p className="text-white/70 leading-relaxed mb-3">
                      <strong className="text-white">Propriétés :</strong>
                    </p>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Rayon dynamique : min(CELL_ROUNDING, distances_arêtes_adjacentes / 2)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Les courbes Bézier créent des coins lisses et sans arêtes vives</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Tous les coins sont fermés avec closePath() pour un remplissage uniforme</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Rendu séquentiel</h3>
                    <p className="text-white/70 leading-relaxed mb-3">
                      Les deux effets sont appliqués de manière séquentielle :
                    </p>
                    <ol className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>1.</span>
                        <span>Calculer les cellules Voronoï (avec d3-delaunay)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>2.</span>
                        <span>Appliquer shrinkPolygon() pour créer CELL_GAP</span>
                      </li>
                      <li className="flex gap-2">
                        <span>3.</span>
                        <span>Appliquer drawRoundedPolygon() sur le résultat réduit</span>
                      </li>
                    </ol>
                  </div>
                </section>
              )}

              {activeSection === "alpha-shape-algorithm" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Algorithme Alpha-Shape</h2>
                    <p className="mb-4 text-white/70 leading-relaxed">
                      L'alpha-shape est une structure géométrique qui représente le <strong className="text-white">contour</strong> d'un ensemble de points, filtré par un paramètre alpha.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Concept mathématique</h3>
                    <p className="text-white/70 leading-relaxed mb-3">
                      Pour chaque triangle de la triangulation de Delaunay :
                    </p>
                    <ol className="space-y-2 text-white/70 ml-4 mb-4">
                      <li className="flex gap-2">
                        <span>1.</span>
                        <span>Calculer le <strong className="text-white">rayon du cercle circonscrit</strong> (circumradius)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>2.</span>
                        <span>Si circumradius ≤ α : le triangle fait partie de l'alpha-complex</span>
                      </li>
                      <li className="flex gap-2">
                        <span>3.</span>
                        <span>Extraire les <strong className="text-white">arêtes au contour</strong> (arêtes limites)</span>
                      </li>
                    </ol>

                    <p className="text-white/70 leading-relaxed mt-4 mb-3">
                      <strong className="text-white">Arête au contour :</strong> une arête qui n'existe que dans UN seul triangle du sous-ensemble alpha-complex
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Implémentation</h3>

                    <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4 mb-4">
                      <p className="text-white/70 text-sm mb-3 font-mono">
                        <strong className="text-cyan-300">Code : computeAlphaData() — geometry-algorithms.ts (lines 165-230)</strong>
                      </p>
                      <pre className="text-xs text-white/60 overflow-x-auto whitespace-pre-wrap break-words">
{`export const computeAlphaData = (
  points: Point[],
  delaunay: Delaunay<Point>,
  alpha: number
): AlphaData => {
  const triangles = delaunay.triangles;
  const alphaTriangles: TriangleIndex[] = [];
  const edgeCount = new Map<string, number>();

  // Collect triangles within alpha threshold
  for (let index = 0; index < triangles.length; index += 3) {
    const i0 = triangles[index];
    const i1 = triangles[index + 1];
    const i2 = triangles[index + 2];

    if (
      i0 === undefined ||
      i1 === undefined ||
      i2 === undefined ||
      i0 === i1 || i1 === i2 || i2 === i0
    ) {
      continue;
    }

    const p0 = points[i0];
    const p1 = points[i1];
    const p2 = points[i2];

    // Calculate circumradius of the triangle
    const radius = circumradius(
      p0.x, p0.y,
      p1.x, p1.y,
      p2.x, p2.y
    );

    // Filter by alpha threshold
    if (!Number.isFinite(radius) || radius > alpha) {
      continue;
    }

    alphaTriangles.push([i0, i1, i2]);

    // Count edge occurrences in alpha triangles
    const e1 = edgeKey(i0, i1);
    const e2 = edgeKey(i1, i2);
    const e3 = edgeKey(i2, i0);
    edgeCount.set(e1, (edgeCount.get(e1) ?? 0) + 1);
    edgeCount.set(e2, (edgeCount.get(e2) ?? 0) + 1);
    edgeCount.set(e3, (edgeCount.get(e3) ?? 0) + 1);
  }

  // All edges in the alpha-complex
  const allEdges = Array.from(edgeCount.keys(), decodeEdgeKey);

  // Boundary edges (alpha-shape): edges in exactly one triangle
  const boundaryEdges = Array.from(edgeCount.entries())
    .filter(([, count]) => count === 1)
    .map(([key]) => decodeEdgeKey(key));

  return {
    triangles: alphaTriangles,
    allEdges,
    boundaryEdges,
  };
};`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Calcul du circumradius</h3>
                    <p className="text-white/70 leading-relaxed mb-3">
                      La fonction <strong className="text-white">circumradius()</strong> calcule le rayon du cercle passant par les 3 sommets du triangle :
                    </p>
                    <p className="text-white/70 text-sm text-center my-3 font-mono bg-slate-900/50 p-3 rounded">
                      circumradius = (a × b × c) / (4 × Area)
                    </p>
                    <p className="text-white/70 text-sm leading-relaxed">
                      où a, b, c sont les longueurs des 3 côtés et Area est l'aire du triangle.
                    </p>
                  </div>

                </section>
              )}

              {activeSection === "alpha-complex-algorithm" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">Algorithme Alpha-Complex</h2>
                    <p className="mb-4 text-white/70 leading-relaxed">
                      L'alpha-complex est une généralization de l'alpha-shape qui inclut <strong className="text-white">tous les triangles</strong> respectant la contrainte alpha, pas seulement les arêtes au contour.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Différence avec <button onClick={() => setActiveSection("alpha-shape-algorithm")} className="text-cyan-300 hover:text-cyan-200 hover:underline">Alpha-Shape</button></h3>

                    <div className="rounded-lg border border-blue-300/20 bg-blue-300/5 p-4 mb-4">
                      <p className="text-white/70 text-sm mb-3">
                        <button onClick={() => setActiveSection("alpha-shape-algorithm")} className="text-blue-300 hover:text-blue-200 hover:underline">
                          <strong>Alpha-Shape</strong>
                        </button>
                      </p>
                      <ul className="space-y-2 text-white/70 ml-4 text-sm">
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Affiche <strong className="text-white">uniquement les arêtes limites</strong></span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Structure fermée creuse</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Représente le "contour" du nuage</span>
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4 mb-4">
                      <p className="text-white/70 text-sm mb-3">
                        <strong className="text-cyan-300">Alpha-Complex</strong>
                      </p>
                      <ul className="space-y-2 text-white/70 ml-4 text-sm">
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Affiche <strong className="text-white">tous les triangles filtrés</strong></span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Inclut les arêtes internes (dans 2 triangles)</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Représente la triangulation complète filtrée</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Implémentation</h3>
                    <p className="text-white/70 leading-relaxed mb-3">
                      L'alpha-complex utilise la même fonction <strong className="text-white">computeAlphaData()</strong> que l'alpha-shape, mais utilise la liste <strong className="text-white">allEdges</strong> au lieu de <strong className="text-white">boundaryEdges</strong> :
                    </p>

                    <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4 mb-4">
                      <p className="text-white/70 text-sm mb-3 font-mono">
                        <strong className="text-cyan-300">Extrait pertinent du résultat AlphaData</strong>
                      </p>
                      <pre className="text-xs text-white/60 overflow-x-auto whitespace-pre-wrap break-words">
{`return {
  triangles: alphaTriangles,      // All triangles with circumradius ≤ α
  allEdges,                       // All edges from these triangles (ALPHA-COMPLEX)
  boundaryEdges,                  // Only boundary edges (ALPHA-SHAPE)
};`}
                      </pre>
                    </div>

                    <p className="text-white/70 leading-relaxed mb-3">
                      <strong className="text-white">Sélection d'arêtes :</strong>
                    </p>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Alpha-Shape mode</strong> : Utilise boundaryEdges (count === 1)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Alpha-Complex mode</strong> : Utilise allEdges (count ≥ 1)</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Résultat visuel</h3>
                    <p className="text-white/70 leading-relaxed mb-3">
                      L'alpha-complex affiche un remplissage triangulaire plus dense :
                    </p>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Tous les triangles internes et limites qui passent le filtre</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Ressemble à une triangulation partielle de Delaunay</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Permet de visualiser la "masse" de points plutôt que juste le contour</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-white">Cas d'usage</h3>
                    <ul className="space-y-2 text-white/70 ml-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Alpha-Shape</strong> : Nettoyage d'un contour bruyant, extraction de limites</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong className="text-white">Alpha-Complex</strong> : Analyse spatiale, mesure de compacité</span>
                      </li>
                    </ul>
                  </div>
                </section>
              )}
            </div>

            {/* Navigation between sections */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 border-t border-white/10 pt-8">
              <button
                onClick={() => previousSection && setActiveSection(previousSection.id)}
                disabled={!previousSection}
                className={`rounded-lg border px-4 py-2 text-sm transition ${
                  previousSection
                    ? "border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white cursor-pointer"
                    : "border-white/5 bg-white/0 text-white/30 cursor-not-allowed"
                }`}
              >
                ← Section précédente
              </button>
              <button
                onClick={() => nextSection && setActiveSection(nextSection.id)}
                disabled={!nextSection}
                className={`sm:ml-auto rounded-lg border px-4 py-2 text-sm transition ${
                  nextSection
                    ? "border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white cursor-pointer"
                    : "border-white/5 bg-white/0 text-white/30 cursor-not-allowed"
                }`}
              >
                Section suivante →
              </button>
            </div>
          </article>
        </div>
      </div>

      <footer className="border-t border-white/10 bg-slate-950/80 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-6 text-center text-sm text-white/50 sm:flex-row sm:justify-between sm:text-left">
          <a
            href="https://moha-df.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 transition hover:text-cyan-300"
          >
            De Franceschi Mohamed — Master IM
          </a>
          <a
            href="https://github.com/Moha-df/voronoi-and-stuff"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 transition hover:text-cyan-300"
          >
            github.com/Moha-df/voronoi-and-stuff
          </a>
        </div>
      </footer>
    </main>
  );
}
