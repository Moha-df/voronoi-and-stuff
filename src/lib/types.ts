/**
 * @fileoverview Type definitions for the Voronoi visualization toolkit
 * Centralizes all TypeScript types and interfaces used throughout the application
 */

/**
 * Represents a 2D point in the visualization
 */
export type Point = {
  id: number;
  x: number;
  y: number;
};

/**
 * Represents an edge as an index pair [pointA, pointB]
 */
export type EdgeIndex = [number, number];

/**
 * Represents a triangle as an index triplet [pointA, pointB, pointC]
 */
export type TriangleIndex = [number, number, number];

/**
 * Available visualization modes for the 2D graph toolkit
 * - voronoi: Animated Voronoi diagram with colored cells
 * - alpha-shape: Alpha shape with boundary edges only
 * - alpha-complex: Full alpha complex with all triangles
 * - nn-crust: Nearest neighbor crust edges
 * - gabriel: Gabriel graph (requires circumcircle test)
 * - rng: Relative neighborhood graph
 * - mst: Minimum spanning tree (Arbre de Recouvrement Minimal)
 */
export type GraphMode =
  | "voronoi"
  | "alpha-shape"
  | "alpha-complex"
  | "nn-crust"
  | "gabriel"
  | "rng"
  | "mst";

/**
 * Configuration for a graph mode option in the UI
 */
export type GraphModeOption = {
  value: GraphMode;
  label: string;
  description: string;
  disabled?: boolean;
};

/**
 * Computed geometric structures for rendering
 * Contains all derived data needed to draw the visualization
 */
export type DerivedStructures = {
  /** Voronoi cells represented as polygon vertices */
  voronoiCells: Array<Array<[number, number]>>;
  /** Graph edges (varies by mode) */
  graphEdges: EdgeIndex[];
  /** Alpha complex triangles (only populated in alpha-complex mode) */
  alphaTriangles: TriangleIndex[];
};

/**
 * Result from alpha-shape/complex computation
 */
export type AlphaData = {
  /** Triangles satisfying the alpha constraint */
  triangles: TriangleIndex[];
  /** All edges in the alpha complex */
  allEdges: EdgeIndex[];
  /** Boundary edges (alpha-shape) */
  boundaryEdges: EdgeIndex[];
};

/**
 * RGB color components
 */
export type RGBColor = {
  r: number;
  g: number;
  b: number;
};

/**
 * Drag state for pointer interactions
 */
export type DragState = {
  pointerId: number;
  index: number;
  offsetX: number;
  offsetY: number;
};

/**
 * Ghost point drag state
 */
export type GhostDragState = {
  pointerId: number;
  offsetX: number;
  offsetY: number;
};

/**
 * Canvas size dimensions
 */
export type CanvasSize = {
  width: number;
  height: number;
};
