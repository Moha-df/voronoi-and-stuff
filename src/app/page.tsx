"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Delaunay } from "d3-delaunay";

type Point = {
  id: number;
  x: number;
  y: number;
};

type EdgeIndex = [number, number];
type TriangleIndex = [number, number, number];

type GraphMode =
  | "voronoi"
  | "alpha-shape"
  | "alpha-complex"
  | "nn-crust"
  | "gabriel"
  | "rng"
  | "mst";

const GRAPH_MODE_OPTIONS: Array<{
  value: GraphMode;
  label: string;
  description: string;
}> = [
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
  },
  {
    value: "gabriel",
    label: "Gabriel",
    description: "Disques de diamètre sans point intérieur",
  },
  {
    value: "rng",
    label: "RNG",
    description: "Voisinages relatifs",
  },
  {
    value: "mst",
    label: "ARM / MST",
    description: "Arbre de recouvrement minimal",
  },
];

const MODE_BASE_HUE: Record<GraphMode, number> = {
  voronoi: 215,
  "alpha-shape": 195,
  "alpha-complex": 275,
  "nn-crust": 345,
  gabriel: 255,
  rng: 35,
  mst: 175,
};

const ALPHA_RANGE = { min: 0.04, max: 0.32 };
const ALPHA_DEFAULT = 0.18;

const INITIAL_SEEDS: Array<[number, number]> = [
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

const DEFAULT_WIDTH = 960;
const DEFAULT_HEIGHT = 600;
const FPS = 30;
const POINT_RADIUS = 10;
const CELL_ROUNDING = 28;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const createInitialPoints = (width: number, height: number): Point[] =>
  INITIAL_SEEDS.map(([u, v], index) => {
    const jitter = (pseudoRandom(index) - 0.5) * 0.12;
    const jitterY = (pseudoRandom(index + 42) - 0.5) * 0.12;
    return {
      id: index,
      x: clamp((u + jitter) * width, 40, width - 40),
      y: clamp((v + jitterY) * height, 40, height - 40),
    };
  });

const polygonWithoutDuplicate = (polygon: Array<[number, number]>) => {
  if (
    polygon.length &&
    polygon[0][0] === polygon[polygon.length - 1][0] &&
    polygon[0][1] === polygon[polygon.length - 1][1]
  ) {
    return polygon.slice(0, -1);
  }
  return polygon;
};

const drawRoundedPolygon = (
  ctx: CanvasRenderingContext2D,
  polygon: Array<[number, number]>,
  radius: number,
) => {
  const points = polygonWithoutDuplicate(polygon);
  const count = points.length;

  if (count === 0) {
    return;
  }

  if (count === 1) {
    const [cx, cy] = points[0];
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.closePath();
    return;
  }

  ctx.beginPath();

  for (let index = 0; index < count; index += 1) {
    const [cx, cy] = points[index];
    const [prevX, prevY] = points[(index - 1 + count) % count];
    const [nextX, nextY] = points[(index + 1) % count];

    const vPrevX = prevX - cx;
    const vPrevY = prevY - cy;
    const vNextX = nextX - cx;
    const vNextY = nextY - cy;

    const lenPrev = Math.hypot(vPrevX, vPrevY);
    const lenNext = Math.hypot(vNextX, vNextY);

    if (lenPrev === 0 || lenNext === 0) {
      if (index === 0) {
        ctx.moveTo(cx, cy);
      } else {
        ctx.lineTo(cx, cy);
      }
      continue;
    }

    const offset = Math.min(radius, lenPrev / 2, lenNext / 2);
    const startX = cx + (vPrevX / lenPrev) * offset;
    const startY = cy + (vPrevY / lenPrev) * offset;
    const endX = cx + (vNextX / lenNext) * offset;
    const endY = cy + (vNextY / lenNext) * offset;

    if (index === 0) {
      ctx.moveTo(startX, startY);
    } else {
      ctx.lineTo(startX, startY);
    }

    ctx.quadraticCurveTo(cx, cy, endX, endY);
  }

  ctx.closePath();
};

const nextHalfedge = (index: number) => (index % 3 === 2 ? index - 2 : index + 1);

const edgeKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

const decodeEdgeKey = (key: string): EdgeIndex => {
  const [a, b] = key.split("-").map((value) => Number.parseInt(value, 10));
  return [a, b];
};

const distanceSquared = (a: Point, b: Point) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const triangleArea = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
) => Math.abs(ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) * 0.5;

const circumradius = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
) => {
  const a = Math.hypot(bx - cx, by - cy);
  const b = Math.hypot(ax - cx, ay - cy);
  const c = Math.hypot(ax - bx, ay - by);
  const area = triangleArea(ax, ay, bx, by, cx, cy);
  if (area === 0) {
    return Number.POSITIVE_INFINITY;
  }
  return (a * b * c) / (4 * area);
};

const collectDelaunayEdges = (delaunay: Delaunay<Point>): EdgeIndex[] => {
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

const computeAlphaData = (
  points: Point[],
  delaunay: Delaunay<Point>,
  alpha: number,
) => {
  const triangles = delaunay.triangles;
  const alphaTriangles: TriangleIndex[] = [];
  const edges = new Set<string>();

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
    edges.add(edgeKey(i0, i1));
    edges.add(edgeKey(i1, i2));
    edges.add(edgeKey(i2, i0));
  }

  return {
    triangles: alphaTriangles,
    edges: Array.from(edges, decodeEdgeKey),
  };
};

const computeNearestNeighborEdges = (points: Point[]): EdgeIndex[] => {
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

const computeGabrielEdges = (
  points: Point[],
  candidateEdges: EdgeIndex[],
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
      const inside = dx * dx + dy * dy < radiusSquared - 1e-6;
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

const computeRelativeNeighborhoodEdges = (
  points: Point[],
  candidateEdges: EdgeIndex[],
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
      if (Math.max(ak, bk) < ab - 1e-6) {
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

const computeMinimumSpanningTreeEdges = (points: Point[]): EdgeIndex[] => {
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
      edges.push([Math.min(bestIndex, parentIndex), Math.max(bestIndex, parentIndex)]);
    }

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

type DerivedStructures = {
  voronoiCells: Array<Array<[number, number]>>;
  graphEdges: EdgeIndex[];
  alphaTriangles: TriangleIndex[];
};

const computeDerivedStructures = (
  points: Point[],
  width: number,
  height: number,
  alpha: number,
  mode: GraphMode,
): DerivedStructures => {
  if (points.length === 0) {
    return {
      voronoiCells: [],
      graphEdges: [],
      alphaTriangles: [],
    };
  }

  const delaunay = Delaunay.from(points, (p) => p.x, (p) => p.y);
  const voronoi = delaunay.voronoi([0, 0, width, height]);
  const voronoiCells = points.map((_, index) => {
    const polygon = voronoi.cellPolygon(index) ?? [];
    return polygonWithoutDuplicate(polygon as Array<[number, number]>);
  });

  const candidateEdges = collectDelaunayEdges(delaunay);

  if (mode === "voronoi") {
    return {
      voronoiCells,
      graphEdges: [],
      alphaTriangles: [],
    };
  }

  if (mode === "alpha-shape" || mode === "alpha-complex") {
    const alphaData = computeAlphaData(points, delaunay, alpha);
    return {
      voronoiCells,
      graphEdges: alphaData.edges,
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

  return {
    voronoiCells,
    graphEdges: computeMinimumSpanningTreeEdges(points),
    alphaTriangles: [],
  };
};

const drawScene = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  points: Point[],
  timestamp: number,
  derived: DerivedStructures,
  mode: GraphMode,
) => {
  ctx.clearRect(0, 0, width, height);

  const t = timestamp * 0.001;
  const glowShiftX = Math.sin(t * 0.6) * width * 0.1;
  const glowShiftY = Math.cos(t * 0.4) * height * 0.1;

  const background = ctx.createRadialGradient(
    width * 0.5 + glowShiftX,
    height * 0.5 + glowShiftY,
    Math.min(width, height) * 0.1,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.8,
  );
  background.addColorStop(0, "#101422");
  background.addColorStop(1, "#04050a");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  if (points.length === 0) {
    return;
  }

  const dynamicRoundness = Math.min(
    CELL_ROUNDING,
    Math.max(14, Math.hypot(width, height) * 0.025),
  );
  const baseHue = MODE_BASE_HUE[mode];

  if (mode === "voronoi") {
    derived.voronoiCells.forEach((polygon, index) => {
      if (!polygon.length) {
        return;
      }

      const point = points[index];
      const hue = (index * 47 + (t * 40) % 360) % 360;
      const lightness = 58 + Math.sin(t * 2 + index) * 8;
      const accentHue = (hue + 28) % 360;
      const gradient = ctx.createLinearGradient(
        point.x,
        point.y,
        width - point.x,
        height - point.y,
      );
      gradient.addColorStop(0, `hsla(${hue}, 82%, ${lightness + 6}%, 0.95)`);
      gradient.addColorStop(0.5, `hsla(${accentHue}, 78%, ${lightness - 6}%, 0.85)`);
      gradient.addColorStop(
        1,
        `hsla(${(hue + 300) % 360}, 70%, ${Math.max(lightness - 10, 32)}%, 0.78)`,
      );

      drawRoundedPolygon(ctx, polygon, dynamicRoundness);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = `hsla(${hue}, 90%, 80%, 0.22)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  } else {
    ctx.save();
    ctx.globalAlpha = 0.32;
    derived.voronoiCells.forEach((polygon, index) => {
      if (!polygon.length) {
        return;
      }
      drawRoundedPolygon(ctx, polygon, dynamicRoundness);
      const hue = (baseHue + index * 12 + t * 24) % 360;
      ctx.fillStyle = `hsla(${hue}, 48%, 18%, 1)`;
      ctx.fill();
    });
    ctx.restore();

    if (mode === "alpha-complex" && derived.alphaTriangles.length) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      derived.alphaTriangles.forEach((triangle, index) => {
        const [ai, bi, ci] = triangle;
        const a = points[ai];
        const b = points[bi];
        const c = points[ci];
        if (!a || !b || !c) {
          return;
        }
        const hue = (baseHue + index * 13 + t * 32) % 360;
        const gradient = ctx.createLinearGradient(a.x, a.y, c.x, c.y);
        gradient.addColorStop(0, `hsla(${hue}, 85%, 68%, 0.24)`);
        gradient.addColorStop(1, `hsla(${(hue + 32) % 360}, 92%, 58%, 0.34)`);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      ctx.restore();
    }

    if (derived.graphEdges.length) {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = `hsla(${baseHue}, 90%, 65%, 0.6)`;
      ctx.shadowBlur = 18;
      const baseWidth = mode === "mst" ? 4.4 : mode === "nn-crust" ? 3.6 : 3.1;

      derived.graphEdges.forEach(([ai, bi], index) => {
        const a = points[ai];
        const b = points[bi];
        if (!a || !b) {
          return;
        }
        const hue = (baseHue + index * 11 + t * 28) % 360;
        ctx.strokeStyle = `hsla(${hue}, 85%, 78%, 0.88)`;
        ctx.lineWidth = baseWidth;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.lineWidth = Math.max(1.4, baseWidth - 1.8);
        ctx.strokeStyle = `hsla(${hue}, 92%, 24%, 0.55)`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.shadowBlur = 18;
      });

      ctx.restore();
    }
  }

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const hue = (baseHue + index * 17 + t * 26) % 360;
    ctx.beginPath();
    ctx.fillStyle = `hsla(${hue}, 95%, 92%, 0.92)`;
    ctx.shadowColor = `hsla(${hue}, 95%, 65%, 0.7)`;
    ctx.shadowBlur = 25;
    ctx.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.shadowBlur = 0;
    ctx.arc(point.x, point.y, POINT_RADIUS * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

const VoronoiCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>(
    () => ({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }),
  );
  const [points, setPoints] = useState<Point[]>(() =>
    createInitialPoints(DEFAULT_WIDTH, DEFAULT_HEIGHT),
  );
  const [mode, setMode] = useState<GraphMode>("voronoi");
  const [alphaValue, setAlphaValue] = useState<number>(ALPHA_DEFAULT);

  const isAlphaMode = mode === "alpha-shape" || mode === "alpha-complex";
  const alphaScale = Math.max(120, Math.min(size.width, size.height));
  const alphaRadius = alphaScale * alphaValue;

  const derived = useMemo(
    () => computeDerivedStructures(points, size.width, size.height, alphaRadius, mode),
    [points, size.width, size.height, alphaRadius, mode],
  );

  const pointsRef = useRef(points);
  const modeRef = useRef(mode);
  const derivedRef = useRef(derived);
  const dragRef = useRef<{
    pointerId: number;
    index: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const idCounterRef = useRef<number>(INITIAL_SEEDS.length);
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const previousSizeRef = useRef(size);

  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    derivedRef.current = derived;
  }, [derived]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize((previous) => {
          const nextWidth = Math.max(320, Math.floor(width));
          const nextHeight = Math.max(320, Math.floor(height));
          if (
            Math.abs(previous.width - nextWidth) < 1 &&
            Math.abs(previous.height - nextHeight) < 1
          ) {
            return previous;
          }
          return { width: nextWidth, height: nextHeight };
        });
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, [size]);

  useEffect(() => {
    const previous = previousSizeRef.current;
    if (previous.width === size.width && previous.height === size.height) {
      return;
    }

    const scaleX = size.width / previous.width;
    const scaleY = size.height / previous.height;
    if (!Number.isFinite(scaleX) || !Number.isFinite(scaleY)) {
      previousSizeRef.current = size;
      return;
    }

    setPoints((prevPoints) => {
      const next = prevPoints.map((point) => ({
        ...point,
        x: point.x * scaleX,
        y: point.y * scaleY,
      }));
      pointsRef.current = next;
      return next;
    });

    previousSizeRef.current = size;
  }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const frameInterval = 1000 / FPS;

    const renderFrame = (time: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = time;
      }

      const elapsed = time - lastFrameRef.current;
      if (elapsed >= frameInterval) {
        lastFrameRef.current = time - (elapsed % frameInterval);
        drawScene(
          ctx,
          size.width,
          size.height,
          pointsRef.current,
          time,
          derivedRef.current,
          modeRef.current,
        );
      }
      animationRef.current = requestAnimationFrame(renderFrame);
    };

    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    lastFrameRef.current = now - frameInterval;
    drawScene(
      ctx,
      size.width,
      size.height,
      pointsRef.current,
      now,
      derivedRef.current,
      modeRef.current,
    );
    animationRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      lastFrameRef.current = null;
    };
  }, [size.width, size.height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const updatePoints = (updater: (value: Point[]) => Point[]) => {
      setPoints((previous) => {
        const next = updater(previous);
        pointsRef.current = next;
        return next;
      });
    };

    const getRelativePosition = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      return {
        x: clamp(x, 0, rect.width),
        y: clamp(y, 0, rect.height),
      };
    };

    const findPointByPosition = (x: number, y: number) => {
      const currentPoints = pointsRef.current;
      const hitDistance = POINT_RADIUS * 2;
      for (let index = currentPoints.length - 1; index >= 0; index -= 1) {
        const point = currentPoints[index];
        const distanceValue = Math.hypot(point.x - x, point.y - y);
        if (distanceValue <= hitDistance) {
          return index;
        }
      }
      return -1;
    };

    const handlePointerDown = (event: PointerEvent) => {
      event.preventDefault();
      const { x, y } = getRelativePosition(event);
      const hitIndex = findPointByPosition(x, y);

      if (hitIndex >= 0) {
        const point = pointsRef.current[hitIndex];
        dragRef.current = {
          pointerId: event.pointerId,
          index: hitIndex,
          offsetX: point.x - x,
          offsetY: point.y - y,
        };
        canvas.setPointerCapture(event.pointerId);
        return;
      }

      updatePoints((previous) => [
        ...previous,
        {
          id: idCounterRef.current,
          x,
          y,
        },
      ]);
      idCounterRef.current += 1;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      const { x, y } = getRelativePosition(event);

      updatePoints((previous) => {
        const next = previous.slice();
        const point = next[dragState.index];
        if (!point) {
          return previous;
        }
        next[dragState.index] = {
          ...point,
          x: clamp(x + dragState.offsetX, 0, size.width),
          y: clamp(y + dragState.offsetY, 0, size.height),
        };
        return next;
      });
    };

    const releasePointer = (event: PointerEvent) => {
      const dragState = dragRef.current;
      if (dragState && dragState.pointerId === event.pointerId) {
        dragRef.current = null;
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
      }
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", releasePointer);
    canvas.addEventListener("pointercancel", releasePointer);
    canvas.addEventListener("pointerleave", releasePointer);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", releasePointer);
      canvas.removeEventListener("pointercancel", releasePointer);
      canvas.removeEventListener("pointerleave", releasePointer);
    };
  }, [size.width, size.height]);

  const modeMeta = GRAPH_MODE_OPTIONS.find((option) => option.value === mode);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full min-h-[520px] flex-1 items-stretch justify-stretch"
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full rounded-[36px] border border-white/10 bg-transparent shadow-[0_40px_120px_-60px_rgba(56,189,248,0.45)]"
      />
      <div className="pointer-events-none absolute inset-0 rounded-[36px] bg-gradient-to-br from-white/6 via-transparent to-white/3 opacity-40 mix-blend-screen" />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-8">
        <div className="flex flex-col gap-4 text-sm text-slate-100/85">
          <div className="pointer-events-auto max-w-sm rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300/80">
              Modes de visualisation
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
              {GRAPH_MODE_OPTIONS.map((option) => {
                const isActive = option.value === mode;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMode(option.value)}
                    className={`rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 ${
                      isActive
                        ? "border-cyan-300/70 bg-cyan-300/15 text-white"
                        : "border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs text-white/70">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
            {isAlphaMode ? (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>Rayon α</span>
                  <span className="font-medium text-white">
                    ≈ {Math.round(alphaRadius)} px
                  </span>
                </div>
                <input
                  type="range"
                  min={ALPHA_RANGE.min}
                  max={ALPHA_RANGE.max}
                  step={0.01}
                  value={alphaValue}
                  onChange={(event) => setAlphaValue(Number(event.target.value))}
                  className="w-full accent-cyan-300"
                />
              </div>
            ) : null}
          </div>

          <div className="pointer-events-none max-w-sm text-xs leading-relaxed text-slate-200/80">
            Cliquez pour ajouter un point, maintenez et déplacez pour ajuster la géométrie.
            Les graphes sont recomputés à 30&nbsp;fps pour une animation fluide.
          </div>
        </div>

        <div className="pointer-events-none flex flex-col items-end gap-1 text-xs text-white/60">
          <span>Mode : {modeMeta?.label ?? ""}</span>
          {isAlphaMode ? (
            <span>Rayon α ≈ {Math.round(alphaRadius)} px</span>
          ) : null}
          <span>Points : {points.length}</span>
          {mode === "voronoi" ? (
            <span>Cellules : {derived.voronoiCells.length}</span>
          ) : mode === "alpha-complex" ? (
            <span>Triangles : {derived.alphaTriangles.length}</span>
          ) : (
            <span>Arêtes : {derived.graphEdges.length}</span>
          )}
          <span>Animation : 30 fps ciblés</span>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 sm:px-10 lg:px-16">
        <header className="flex flex-col gap-3 text-white">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Atelier interactif de graphes 2D
          </h1>
          <p className="max-w-2xl text-base text-white/70 sm:text-lg">
            Composez un diagramme de Voronoï, un alpha-shape, un alpha-complex, des graphes
            de proximité (Gabriel, RNG, NN-crust) ou un arbre de recouvrement minimal.
            Ajoutez et déplacez des points pour explorer la géométrie en temps réel.
          </p>
        </header>
        <VoronoiCanvas />
      </section>
    </main>
  );
}
