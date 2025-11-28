/**
 * @fileoverview Global constants for the Voronoi visualization toolkit
 * Contains configuration values, initial data, and mode definitions
 */

import { GraphMode, GraphModeOption } from "./types";

/**
 * Graph mode options with UI metadata and descriptions
 * Includes enabled/disabled states for planned features
 */
export const GRAPH_MODE_OPTIONS: GraphModeOption[] = [
  {
    value: "voronoi",
    label: "Voronoï",
    description: "Cellules colorées et animées",
  },
  {
    value: "alpha-shape",
    label: "Alpha-shape",
    description: "Arêtes filtrées par rayon α",
  },
  {
    value: "alpha-complex",
    label: "Alpha-complex",
    description: "Triangles satisfaisant la contrainte α",
  },
  {
    value: "nn-crust",
    label: "NN-crust",
    description: "Arêtes vers le plus proche voisin",
    disabled: true,
  },
  {
    value: "gabriel",
    label: "Gabriel",
    description: "Disques de diamètre sans point intérieur",
    disabled: true,
  },
  {
    value: "rng",
    label: "RNG",
    description: "Voisinages relatifs",
    disabled: true,
  },
  {
    value: "mst",
    label: "ARM / MST",
    description: "Arbre de recouvrement minimal",
    disabled: true,
  },
];

/**
 * Base hue values for each visualization mode
 * Used to generate harmonious color schemes
 */
export const MODE_BASE_HUE: Record<GraphMode, number> = {
  voronoi: 215,
  "alpha-shape": 195,
  "alpha-complex": 275,
  "nn-crust": 345,
  gabriel: 255,
  rng: 35,
  mst: 175,
};

/**
 * Initial seed positions for the default 10 points
 * Coordinates are normalized [0-1] and then scaled to canvas size
 */
export const INITIAL_SEEDS: Array<[number, number]> = [
  [0.18, 0.25],
  [0.38, 0.18],
  [0.62, 0.22],
  [0.82, 0.34],
  [0.22, 0.54],
  [0.46, 0.46],
  [0.68, 0.52],
  [0.14, 0.78],
  [0.44, 0.76],
  [0.74, 0.78],
];

/**
 * Default canvas dimensions (16:10 aspect ratio)
 */
export const DEFAULT_WIDTH = 960;
export const DEFAULT_HEIGHT = 600;

/**
 * Animation frame rate (frames per second)
 */
export const FPS = 30;

/**
 * Radius of visual points on the canvas
 */
export const POINT_RADIUS = 10;

/**
 * Corner rounding radius for Voronoi cells
 */
export const CELL_ROUNDING = 28;

/**
 * Gap/spacing between Voronoi cells in pixels (visual shrinking effect)
 */
export const CELL_GAP = 3;

/**
 * Default alpha slider value (maps to ~250px radius)
 */
export const ALPHA_SLIDER_DEFAULT = 0.25;

/**
 * Slider to radius mapping configuration
 * The slider range [0-1] maps non-linearly to:
 * - [0.0 - 0.5]   → [12 - 500] px
 * - [0.5 - 0.75]  → [500 - 1000] px
 * - [0.75 - 1.0]  → [1000 - 5000] px
 *
 * This provides fine control at small radii and quick access to larger values
 */
export const SLIDER_RANGES = {
  FIRST_RANGE: { sliderMax: 0.5, radiusMin: 12, radiusMax: 500 },
  SECOND_RANGE: { sliderMax: 0.75, radiusMin: 500, radiusMax: 1000 },
  THIRD_RANGE: { sliderMax: 1.0, radiusMin: 1000, radiusMax: 5000 },
} as const;

/**
 * Minimum distance tolerance for floating-point comparisons
 */
export const EPSILON = 1e-6;

/**
 * Minimum canvas dimension to prevent rendering issues
 */
export const MIN_CANVAS_DIMENSION = 320;

/**
 * Maximum hit distance for point selection (in screen pixels)
 */
export const HIT_DISTANCE_MULTIPLIER = 2;
