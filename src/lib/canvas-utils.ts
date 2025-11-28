/**
 * @fileoverview Canvas rendering utilities
 * Handles all drawing operations including polygons, gradients, and visualization rendering
 */

import { POINT_RADIUS, CELL_ROUNDING, CELL_GAP, MODE_BASE_HUE } from "./constants";
import { Point, DerivedStructures, GraphMode, RGBColor } from "./types";
import { shrinkPolygon, polygonWithoutDuplicate } from "./geometry-algorithms";
import { isPointInPolygon } from "./math-utils";

/**
 * Draws a polygon with rounded corners using quadratic curves
 * Automatically handles edge cases (degenerate polygons, etc.)
 * @param ctx - 2D canvas context
 * @param polygon - Array of vertex coordinates
 * @param radius - Corner rounding radius in pixels
 */
export const drawRoundedPolygon = (
  ctx: CanvasRenderingContext2D,
  polygon: Array<[number, number]>,
  radius: number
): void => {
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

/**
 * Calculates average color of pixels inside a polygon from an image
 * Samples pixels within the polygon bounds and returns their mean RGB
 * Used for image-based Voronoi cell coloring
 * @param imageData - Canvas ImageData object containing pixel data
 * @param polygon - Polygon defining the region to sample
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @returns Average RGB color
 */
export const getAverageColorInPolygon = (
  imageData: ImageData,
  polygon: Array<[number, number]>,
  canvasWidth: number,
  canvasHeight: number
): RGBColor => {
  if (polygon.length < 3) {
    return { r: 128, g: 128, b: 128 };
  }

  // Calculate bounding box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of polygon) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  // Clamp to canvas bounds
  minX = Math.max(0, Math.floor(minX));
  minY = Math.max(0, Math.floor(minY));
  maxX = Math.min(canvasWidth - 1, Math.ceil(maxX));
  maxY = Math.min(canvasHeight - 1, Math.ceil(maxY));

  // Scale factor from canvas to image dimensions
  const scaleX = imageData.width / canvasWidth;
  const scaleY = imageData.height / canvasHeight;

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;

  // Sample pixels inside polygon at regular intervals
  const step = Math.max(1, Math.floor(Math.min(maxX - minX, maxY - minY) / 20));
  for (let y = minY; y <= maxY; y += step) {
    for (let x = minX; x <= maxX; x += step) {
      if (isPointInPolygon(x, y, polygon)) {
        const imgX = Math.floor(x * scaleX);
        const imgY = Math.floor(y * scaleY);
        if (
          imgX >= 0 &&
          imgX < imageData.width &&
          imgY >= 0 &&
          imgY < imageData.height
        ) {
          const idx = (imgY * imageData.width + imgX) * 4;
          totalR += imageData.data[idx];
          totalG += imageData.data[idx + 1];
          totalB += imageData.data[idx + 2];
          count++;
        }
      }
    }
  }

  if (count === 0) {
    return { r: 128, g: 128, b: 128 };
  }

  return {
    r: Math.round(totalR / count),
    g: Math.round(totalG / count),
    b: Math.round(totalB / count),
  };
};

/**
 * Main scene drawing function
 * Renders the entire visualization including background, cells, edges, and points
 * @param ctx - 2D canvas context
 * @param width - Canvas width
 * @param height - Canvas height
 * @param points - Array of points
 * @param timestamp - Current animation timestamp
 * @param derived - Precomputed geometric structures
 * @param mode - Current visualization mode
 * @param ghostPoint - Optional ghost point for previewing placement
 * @param alphaRadius - Current alpha radius
 * @param backgroundImage - Optional background image data for coloring
 */
export const drawScene = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  points: Point[],
  timestamp: number,
  derived: DerivedStructures,
  mode: GraphMode,
  ghostPoint: { x: number; y: number } | null,
  alphaRadius: number,
  backgroundImage: ImageData | null
): void => {
  ctx.clearRect(0, 0, width, height);

  // Calculate animated background glow
  const t = timestamp * 0.001;
  const glowShiftX = Math.sin(t * 0.6) * width * 0.1;
  const glowShiftY = Math.cos(t * 0.4) * height * 0.1;

  // Draw animated radial gradient background
  const background = ctx.createRadialGradient(
    width * 0.5 + glowShiftX,
    height * 0.5 + glowShiftY,
    Math.min(width, height) * 0.1,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.8
  );
  background.addColorStop(0, "#101422");
  background.addColorStop(1, "#04050a");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  if (points.length === 0) {
    return;
  }

  // Dynamic rounding based on canvas size
  const dynamicRoundness = Math.min(
    CELL_ROUNDING,
    Math.max(14, Math.hypot(width, height) * 0.025)
  );
  const baseHue = MODE_BASE_HUE[mode];

  // Mode-specific rendering
  if (mode === "voronoi") {
    drawVoronoiCells(ctx, derived, points, t, width, height, backgroundImage);
  } else {
    drawBackgroundCells(ctx, derived, mode, t, baseHue, dynamicRoundness);
    if (mode === "alpha-complex" && derived.alphaTriangles.length) {
      drawAlphaTriangles(ctx, derived, points, mode, t, baseHue);
    }
    if (derived.graphEdges.length) {
      drawGraphEdges(ctx, derived, points, mode, t, baseHue);
    }
  }

  // Draw point spheres
  drawPoints(ctx, points, mode, t, baseHue);

  // Draw ghost point if present
  if (ghostPoint !== null) {
    drawGhostPoint(ctx, ghostPoint, alphaRadius, mode, t, baseHue);
  }
};

/**
 * Renders Voronoi cells with gradients and image-based coloring
 * @param ctx - 2D canvas context
 * @param derived - Geometric structures
 * @param points - Array of points
 * @param t - Normalized time for animation
 * @param width - Canvas width
 * @param height - Canvas height
 * @param backgroundImage - Optional background image
 */
const drawVoronoiCells = (
  ctx: CanvasRenderingContext2D,
  derived: DerivedStructures,
  points: Point[],
  t: number,
  width: number,
  height: number,
  backgroundImage: ImageData | null
): void => {
  derived.voronoiCells.forEach((polygon, index) => {
    if (!polygon.length) {
      return;
    }

    const shrunkPolygon = shrinkPolygon(polygon, CELL_GAP);
    const point = points[index];

    if (backgroundImage) {
      // Use colors sampled from image
      drawRoundedPolygon(ctx, shrunkPolygon, CELL_ROUNDING);
      const avgColor = getAverageColorInPolygon(
        backgroundImage,
        polygon,
        width,
        height
      );
      ctx.fillStyle = `rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})`;
      ctx.fill();

      // Adaptive border based on image brightness
      const borderLightness = (avgColor.r + avgColor.g + avgColor.b) / 3;
      ctx.strokeStyle =
        borderLightness > 128
          ? `rgba(0, 0, 0, 0.15)`
          : `rgba(255, 255, 255, 0.15)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      // Animated gradient cells
      const hue = (index * 47 + (t * 40) % 360) % 360;
      const lightness = 58 + Math.sin(t * 2 + index) * 8;
      const accentHue = (hue + 28) % 360;
      const gradient = ctx.createLinearGradient(
        point.x,
        point.y,
        width - point.x,
        height - point.y
      );
      gradient.addColorStop(
        0,
        `hsla(${hue}, 82%, ${lightness + 6}%, 0.95)`
      );
      gradient.addColorStop(
        0.5,
        `hsla(${accentHue}, 78%, ${lightness - 6}%, 0.85)`
      );
      gradient.addColorStop(
        1,
        `hsla(${(hue + 300) % 360}, 70%, ${Math.max(
          lightness - 10,
          32
        )}%, 0.78)`
      );

      drawRoundedPolygon(ctx, shrunkPolygon, CELL_ROUNDING);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = `hsla(${hue}, 90%, 80%, 0.22)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });
};

/**
 * Renders background Voronoi cells as faint overlay
 * @param ctx - 2D canvas context
 * @param derived - Geometric structures
 * @param mode - Visualization mode
 * @param t - Normalized time
 * @param baseHue - Base hue for the mode
 * @param dynamicRoundness - Rounded corner radius
 */
const drawBackgroundCells = (
  ctx: CanvasRenderingContext2D,
  derived: DerivedStructures,
  mode: GraphMode,
  t: number,
  baseHue: number,
  dynamicRoundness: number
): void => {
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
};

/**
 * Renders alpha-complex triangles
 * @param ctx - 2D canvas context
 * @param derived - Geometric structures
 * @param points - Array of points
 * @param mode - Visualization mode
 * @param t - Normalized time
 * @param baseHue - Base hue for the mode
 */
const drawAlphaTriangles = (
  ctx: CanvasRenderingContext2D,
  derived: DerivedStructures,
  points: Point[],
  mode: GraphMode,
  t: number,
  baseHue: number
): void => {
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
};

/**
 * Renders graph edges with glow effect
 * @param ctx - 2D canvas context
 * @param derived - Geometric structures
 * @param points - Array of points
 * @param mode - Visualization mode
 * @param t - Normalized time
 * @param baseHue - Base hue for the mode
 */
const drawGraphEdges = (
  ctx: CanvasRenderingContext2D,
  derived: DerivedStructures,
  points: Point[],
  mode: GraphMode,
  t: number,
  baseHue: number
): void => {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = `hsla(${baseHue}, 90%, 65%, 0.6)`;
  ctx.shadowBlur = 18;
  const baseWidth =
    mode === "mst" ? 4.4 : mode === "nn-crust" ? 3.6 : 3.1;

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

    // Draw shadow
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
};

/**
 * Renders interactive points
 * @param ctx - 2D canvas context
 * @param points - Array of points
 * @param mode - Visualization mode
 * @param t - Normalized time
 * @param baseHue - Base hue for the mode
 */
const drawPoints = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  mode: GraphMode,
  t: number,
  baseHue: number
): void => {
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

    // Inner highlight
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.shadowBlur = 0;
    ctx.arc(point.x, point.y, POINT_RADIUS * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

/**
 * Renders ghost point preview with alpha radius circle
 * @param ctx - 2D canvas context
 * @param ghostPoint - Ghost point position
 * @param alphaRadius - Alpha radius to visualize
 * @param mode - Visualization mode
 * @param t - Normalized time
 * @param baseHue - Base hue for the mode
 */
const drawGhostPoint = (
  ctx: CanvasRenderingContext2D,
  ghostPoint: { x: number; y: number },
  alphaRadius: number,
  mode: GraphMode,
  t: number,
  baseHue: number
): void => {
  const hue = (baseHue + t * 26) % 360;

  // Draw alpha radius circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(ghostPoint.x, ghostPoint.y, alphaRadius, 0, Math.PI * 2);
  ctx.strokeStyle = `hsla(${hue}, 90%, 70%, 0.8)`;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 6]);
  ctx.stroke();

  // Fill with light color
  ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.08)`;
  ctx.fill();
  ctx.restore();

  // Draw ghost point
  ctx.save();
  ctx.beginPath();
  ctx.arc(ghostPoint.x, ghostPoint.y, POINT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a2e";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner dot
  ctx.beginPath();
  ctx.arc(
    ghostPoint.x,
    ghostPoint.y,
    POINT_RADIUS * 0.4,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fill();
  ctx.restore();
};
