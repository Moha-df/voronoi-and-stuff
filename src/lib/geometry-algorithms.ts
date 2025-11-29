/**
 * @fileoverview Geometric algorithms for graph structures
 * Implements computational geometry algorithms:
 * - Delaunay triangulation edge collection
 * - Alpha shapes and alpha complexes
 * - Proximity graphs (Gabriel, RNG, NN-crust)
 * - Minimum spanning tree
 */

import { Delaunay } from "d3-delaunay";
import { EPSILON, INITIAL_SEEDS } from "./constants";
import { Point, EdgeIndex, TriangleIndex, AlphaData, DerivedStructures } from "./types";
import type { GraphMode } from "./types";
import {
  clamp,
  pseudoRandom,
  distance,
  distanceSquared,
  circumradius,
  isPointInPolygon,
} from "./math-utils";

/**
 * Gets the next halfedge index in a triangle mesh
 * Used for traversing the halfedge data structure from d3-delaunay
 * @param index - Current halfedge index
 * @returns Next halfedge index
 */
const nextHalfedge = (index: number): number =>
  index % 3 === 2 ? index - 2 : index + 1;

/**
 * Creates a canonical edge key for deduplication
 * Ensures edges are always represented in a consistent order (min < max)
 * @param a - First point index
 * @param b - Second point index
 * @returns Canonical string key for the edge
 */
const edgeKey = (a: number, b: number): string =>
  a < b ? `${a}-${b}` : `${b}-${a}`;

/**
 * Decodes an edge key back into index pair
 * @param key - Edge key string (format: "a-b")
 * @returns Edge index pair [a, b]
 */
const decodeEdgeKey = (key: string): EdgeIndex => {
  const [a, b] = key.split("-").map((value) => Number.parseInt(value, 10));
  return [a, b];
};

/**
 * Removes duplicate closing point from polygon if present
 * Polygons often have their first point repeated at the end; this cleans that up
 * @param polygon - Polygon vertex array
 * @returns Polygon without duplicate closing point
 */
export const polygonWithoutDuplicate = (
  polygon: Array<[number, number]>
): Array<[number, number]> => {
  if (
    polygon.length &&
    polygon[0][0] === polygon[polygon.length - 1][0] &&
    polygon[0][1] === polygon[polygon.length - 1][1]
  ) {
    return polygon.slice(0, -1);
  }
  return polygon;
};

/**
 * Shrinks a polygon inward by moving vertices toward the centroid
 * Used to create visual gaps between Voronoi cells
 * @param polygon - Polygon to shrink
 * @param amount - Distance to move vertices inward (pixels)
 * @returns Shrunk polygon
 */
export const shrinkPolygon = (
  polygon: Array<[number, number]>,
  amount: number
): Array<[number, number]> => {
  if (polygon.length < 3 || amount <= 0) {
    return polygon;
  }

  // Calculate centroid
  let cx = 0;
  let cy = 0;
  for (const [x, y] of polygon) {
    cx += x;
    cy += y;
  }
  cx /= polygon.length;
  cy /= polygon.length;

  // Shrink each vertex toward centroid
  return polygon.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) {
      return [x, y] as [number, number];
    }
    const shrinkDist = Math.max(0, dist - amount);
    return [
      cx + (dx / dist) * shrinkDist,
      cy + (dy / dist) * shrinkDist,
    ] as [number, number];
  });
};

/**
 * Creates initial point distribution with pseudo-random jitter
 * Ensures points are distributed across the canvas with reproducible randomness
 * @param width - Canvas width
 * @param height - Canvas height
 * @returns Array of initial points
 */
export const createInitialPoints = (width: number, height: number): Point[] =>
  INITIAL_SEEDS.map(([u, v], index) => {
    const jitter = (pseudoRandom(index) - 0.5) * 0.12;
    const jitterY = (pseudoRandom(index + 42) - 0.5) * 0.12;
    return {
      id: index,
      x: clamp((u + jitter) * width, 40, width - 40),
      y: clamp((v + jitterY) * height, 40, height - 40),
    };
  });

/**
 * Collects all unique edges from a Delaunay triangulation
 * Each edge is stored only once in canonical form
 * @param delaunay - D3-Delaunay triangulation object
 * @returns Array of unique edges as index pairs
 */
export const collectDelaunayEdges = (delaunay: Delaunay<Point>): EdgeIndex[] => {
  const { triangles, halfedges } = delaunay;
  const seen = new Set<string>();
  const edges: EdgeIndex[] = [];

  for (let edgeIndex = 0; edgeIndex < halfedges.length; edgeIndex += 1) {
    const opposite = halfedges[edgeIndex];
    if (opposite >= 0 && opposite < edgeIndex) {
      continue;
    }

    const p = triangles[edgeIndex];
    const q = triangles[nextHalfedge(edgeIndex)];
    if (p === q || p === undefined || q === undefined) {
      continue;
    }

    const key = edgeKey(p, q);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    edges.push([Math.min(p, q), Math.max(p, q)]);
  }

  return edges;
};

/**
 * Computes alpha-shape and alpha-complex structures
 * Alpha-shape: only boundary edges (triangles with circumradius ≤ α)
 * Alpha-complex: all edges from triangles with circumradius ≤ α
 * @param points - Point set
 * @param delaunay - Delaunay triangulation
 * @param alpha - Alpha radius threshold
 * @returns Alpha data with triangles and edges
 */
export const computeAlphaData = (
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
      i0 === i1 ||
      i1 === i2 ||
      i2 === i0
    ) {
      continue;
    }

    const p0 = points[i0];
    const p1 = points[i1];
    const p2 = points[i2];

    const radius = circumradius(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y);
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
};

/**
 * Computes nearest neighbor edges from each point to its closest neighbor
 * Used for NN-crust visualization
 * @param points - Point set
 * @returns Array of nearest neighbor edges
 */
export const computeNearestNeighborEdges = (points: Point[]): EdgeIndex[] => {
  if (points.length < 2) {
    return [];
  }
  const edges = new Set<string>();

  for (let i = 0; i < points.length; i += 1) {
    let nearestIndex = -1;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (let j = 0; j < points.length; j += 1) {
      if (i === j) {
        continue;
      }
      const d = distanceSquared(points[i], points[j]);
      if (d < nearestDistance) {
        nearestDistance = d;
        nearestIndex = j;
      }
    }

    if (nearestIndex >= 0) {
      edges.add(edgeKey(i, nearestIndex));
    }
  }

  return Array.from(edges, decodeEdgeKey);
};

/**
 * Filters edges to keep only Gabriel graph edges
 * Gabriel graph: edge is included if no other point lies inside the
 * circle with the edge as diameter (circumcircle with edge as diameter)
 * @param points - Point set
 * @param candidateEdges - Edges to filter
 * @returns Gabriel graph edges
 */
export const computeGabrielEdges = (
  points: Point[],
  candidateEdges: EdgeIndex[]
): EdgeIndex[] => {
  const result: EdgeIndex[] = [];

  for (const [aIndex, bIndex] of candidateEdges) {
    const a = points[aIndex];
    const b = points[bIndex];
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const radiusSquared = distanceSquared(a, b) / 4;
    let isGabriel = true;

    for (let k = 0; k < points.length; k += 1) {
      if (k === aIndex || k === bIndex) {
        continue;
      }
      const pk = points[k];
      const dx = pk.x - midX;
      const dy = pk.y - midY;
      const inside = dx * dx + dy * dy < radiusSquared - EPSILON;
      if (inside) {
        isGabriel = false;
        break;
      }
    }

    if (isGabriel) {
      result.push([aIndex, bIndex]);
    }
  }

  return result;
};

/**
 * Filters edges to keep only relative neighborhood graph edges
 * RNG: edge is included if no other point is closer to both endpoints
 * than the endpoints are to each other
 * @param points - Point set
 * @param candidateEdges - Edges to filter
 * @returns Relative neighborhood graph edges
 */
export const computeRelativeNeighborhoodEdges = (
  points: Point[],
  candidateEdges: EdgeIndex[]
): EdgeIndex[] => {
  const result: EdgeIndex[] = [];

  for (const [aIndex, bIndex] of candidateEdges) {
    const ab = distance(points[aIndex], points[bIndex]);
    let isRelativeNeighbor = true;

    for (let k = 0; k < points.length; k += 1) {
      if (k === aIndex || k === bIndex) {
        continue;
      }
      const ak = distance(points[aIndex], points[k]);
      const bk = distance(points[bIndex], points[k]);
      if (Math.max(ak, bk) < ab - EPSILON) {
        isRelativeNeighbor = false;
        break;
      }
    }

    if (isRelativeNeighbor) {
      result.push([aIndex, bIndex]);
    }
  }

  return result;
};

/**
 * Computes minimum spanning tree using Prim's algorithm
 * Finds the tree of minimum total edge length connecting all points
 * Time complexity: O(n²)
 * @param points - Point set
 * @returns MST edges
 */
export const computeMinimumSpanningTreeEdges = (points: Point[]): EdgeIndex[] => {
  const count = points.length;
  if (count < 2) {
    return [];
  }

  const visited = new Array<boolean>(count).fill(false);
  const distances = new Array<number>(count).fill(Number.POSITIVE_INFINITY);
  const parent = new Array<number>(count).fill(-1);

  visited[0] = true;
  for (let i = 1; i < count; i += 1) {
    distances[i] = distance(points[0], points[i]);
    parent[i] = 0;
  }

  const edges: EdgeIndex[] = [];

  for (let iteration = 1; iteration < count; iteration += 1) {
    let bestIndex = -1;
    let bestDistance = Number.POSITIVE_INFINITY;

    // Find nearest unvisited point
    for (let j = 0; j < count; j += 1) {
      if (visited[j]) {
        continue;
      }
      if (distances[j] < bestDistance) {
        bestDistance = distances[j];
        bestIndex = j;
      }
    }

    if (bestIndex === -1) {
      break;
    }

    visited[bestIndex] = true;
    const parentIndex = parent[bestIndex];
    if (parentIndex >= 0) {
      edges.push([
        Math.min(bestIndex, parentIndex),
        Math.max(bestIndex, parentIndex),
      ]);
    }

    // Update distances to remaining unvisited points
    for (let j = 0; j < count; j += 1) {
      if (visited[j]) {
        continue;
      }
      const d = distance(points[bestIndex], points[j]);
      if (d < distances[j]) {
        distances[j] = d;
        parent[j] = bestIndex;
      }
    }
  }

  return edges;
};

/**
 * Computes discrete Voronoi diagram using brute force algorithm
 * For each pixel, finds the closest seed point
 * @param points - Point set (seeds)
 * @param width - Canvas width
 * @param height - Canvas height
 * @returns Voronoi cells represented as pixel groups
 */
const computeVoronoiBruteForce = (
  points: Point[],
  width: number,
  height: number
): Array<Array<[number, number]>> => {
  // Initialize cells for each point
  const cells: Array<Array<[number, number]>> = points.map(() => []);

  // For each pixel in the canvas
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let closestIndex = 0;
      let closestDistance = Number.MAX_VALUE;

      // Find the closest seed point (brute force)
      for (let i = 0; i < points.length; i++) {
        const dx = x - points[i].x;
        const dy = y - points[i].y;
        const distSquared = dx * dx + dy * dy;

        if (distSquared < closestDistance) {
          closestDistance = distSquared;
          closestIndex = i;
        }
      }

      // Add pixel to the closest seed's cell
      cells[closestIndex].push([x, y]);
    }
  }

  return cells;
};

/**
 * Computes all geometric structures needed for rendering based on visualization mode
 * This is the main entry point for computing derived data
 * @param points - Point set
 * @param width - Canvas width
 * @param height - Canvas height
 * @param alpha - Alpha radius (only used in alpha modes)
 * @param mode - Visualization mode
 * @returns Computed geometric structures ready for rendering
 */
export const computeDerivedStructures = (
  points: Point[],
  width: number,
  height: number,
  alpha: number,
  mode: GraphMode
): DerivedStructures => {
  if (points.length === 0) {
    return {
      voronoiCells: [],
      graphEdges: [],
      alphaTriangles: [],
    };
  }

  // Brute force Voronoi mode (discrete)
  if (mode === "voronoi-bruteforce") {
    const cells = computeVoronoiBruteForce(points, width, height);
    return {
      voronoiCells: cells,
      graphEdges: [],
      alphaTriangles: [],
    };
  }

  // Compute Delaunay triangulation and Voronoi diagram
  const delaunay = Delaunay.from(points, (p) => p.x, (p) => p.y);
  const voronoi = delaunay.voronoi([0, 0, width, height]);
  const voronoiCells = points.map((_, index) => {
    const polygon = voronoi.cellPolygon(index) ?? [];
    return polygonWithoutDuplicate(polygon as Array<[number, number]>);
  });

  // Voronoi mode only needs cells
  if (mode === "voronoi") {
    return {
      voronoiCells,
      graphEdges: [],
      alphaTriangles: [],
    };
  }

  // Get candidate edges from Delaunay triangulation
  const candidateEdges = collectDelaunayEdges(delaunay);

  // Compute mode-specific structures
  if (mode === "alpha-shape" || mode === "alpha-complex") {
    const alphaData = computeAlphaData(points, delaunay, alpha);
    return {
      voronoiCells,
      graphEdges:
        mode === "alpha-shape" ? alphaData.boundaryEdges : alphaData.allEdges,
      alphaTriangles: mode === "alpha-complex" ? alphaData.triangles : [],
    };
  }

  if (mode === "nn-crust") {
    return {
      voronoiCells,
      graphEdges: computeNearestNeighborEdges(points),
      alphaTriangles: [],
    };
  }

  if (mode === "gabriel") {
    return {
      voronoiCells,
      graphEdges: computeGabrielEdges(points, candidateEdges),
      alphaTriangles: [],
    };
  }

  if (mode === "rng") {
    return {
      voronoiCells,
      graphEdges: computeRelativeNeighborhoodEdges(points, candidateEdges),
      alphaTriangles: [],
    };
  }

  // MST mode
  return {
    voronoiCells,
    graphEdges: computeMinimumSpanningTreeEdges(points),
    alphaTriangles: [],
  };
};
