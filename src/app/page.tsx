/**
 * @fileoverview Home page component
 * Main entry point for the Voronoi visualization application
 */

import { VoronoiCanvas } from "./components/VoronoiCanvas";

/**
 * Home page component - renders the main layout
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 sm:px-10 lg:px-16">
        <header className="flex flex-col gap-3 text-white">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Atelier interactif de graphes 2D
            </h1>
            <a
              href="/documentation"
              className="inline-flex rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:border-cyan-300/50 hover:bg-cyan-300/20"
            >
              Documentation
            </a>
          </div>
          <p className="max-w-2xl text-base text-white/70 sm:text-lg">
            Composez un diagramme de Voronoï, un alpha-shape, un alpha-complex, des graphes
            de proximité (Gabriel, RNG, NN-crust) ou un arbre de recouvrement minimal.
            Ajoutez et déplacez des points pour explorer la géométrie en temps réel.
          </p>
        </header>
        <VoronoiCanvas />
      </section>
      
      <footer className="border-t border-white/10 bg-slate-950/80 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-center text-sm text-white/50 sm:flex-row sm:justify-between sm:text-left">
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
