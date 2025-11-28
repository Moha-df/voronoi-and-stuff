/**
 * @fileoverview Mathematical utility functions
 * Provides core computational functions for geometry calculations and transformations
 */

import { EPSILON, SLIDER_RANGES } from "./constants";
import { Point } from "./types";

/**
 * Clamps a numeric value between min and max bounds
 * @param value - The value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped value between [min, max]
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Pseudo-random number generator using sine-based hash
 * Provides deterministic random values based on seed (useful for reproducible layouts)
 * @param seed - Input seed value
 * @returns Pseudo-random float in range [0, 1]
 */
export const pseudoRandom = (seed: number): number => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Converts slider value [0-1] to alpha radius with non-linear mapping
 * Provides finer control at small radii and faster range coverage at large radii
 * @param t - Slider value in range [0, 1]
 * @returns Radius value in pixels
 */
export const sliderToRadius = (t: number): number => {
  if (t <= SLIDER_RANGES.FIRST_RANGE.sliderMax) {
    // First half: 12 to 500
    const localT = t / SLIDER_RANGES.FIRST_RANGE.sliderMax;
    return (
      SLIDER_RANGES.FIRST_RANGE.radiusMin +
      localT *
        (SLIDER_RANGES.FIRST_RANGE.radiusMax -
          SLIDER_RANGES.FIRST_RANGE.radiusMin)
    );
  } else if (t <= SLIDER_RANGES.SECOND_RANGE.sliderMax) {
    // Third quarter: 500 to 1000
    const localT = (t - SLIDER_RANGES.FIRST_RANGE.sliderMax) / 0.25;
    return (
      SLIDER_RANGES.SECOND_RANGE.radiusMin +
      localT *
        (SLIDER_RANGES.SECOND_RANGE.radiusMax -
          SLIDER_RANGES.SECOND_RANGE.radiusMin)
    );
  } else {
    // Last quarter: 1000 to 5000
    const localT = (t - SLIDER_RANGES.SECOND_RANGE.sliderMax) / 0.25;
    return (
      SLIDER_RANGES.THIRD_RANGE.radiusMin +
      localT *
        (SLIDER_RANGES.THIRD_RANGE.radiusMax -
          SLIDER_RANGES.THIRD_RANGE.radiusMin)
    );
  }
};

/**
 * Inverse operation: converts radius to slider value
 * Used for initializing slider position from a known radius
 * @param r - Radius value in pixels
 * @returns Slider value in range [0, 1]
 */
export const radiusToSlider = (r: number): number => {
  if (r <= SLIDER_RANGES.FIRST_RANGE.radiusMax) {
    return (
      ((r - SLIDER_RANGES.FIRST_RANGE.radiusMin) /
        (SLIDER_RANGES.FIRST_RANGE.radiusMax -
          SLIDER_RANGES.FIRST_RANGE.radiusMin)) *
      SLIDER_RANGES.FIRST_RANGE.sliderMax
    );
  } else if (r <= SLIDER_RANGES.SECOND_RANGE.radiusMax) {
    return (
      SLIDER_RANGES.FIRST_RANGE.sliderMax +
      ((r - SLIDER_RANGES.SECOND_RANGE.radiusMin) /
        (SLIDER_RANGES.SECOND_RANGE.radiusMax -
          SLIDER_RANGES.SECOND_RANGE.radiusMin)) *
        0.25
    );
  } else {
    return (
      SLIDER_RANGES.SECOND_RANGE.sliderMax +
      ((r - SLIDER_RANGES.THIRD_RANGE.radiusMin) /
        (SLIDER_RANGES.THIRD_RANGE.radiusMax -
          SLIDER_RANGES.THIRD_RANGE.radiusMin)) *
        0.25
    );
  }
};

/**
 * Calculates squared Euclidean distance between two points
 * Used for comparisons to avoid expensive square root calculations
 * @param a - First point
 * @param b - Second point
 * @returns Squared distance
 */
export const distanceSquared = (a: Point, b: Point): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};

/**
 * Calculates Euclidean distance between two points
 * @param a - First point
 * @param b - Second point
 * @returns Distance value
 */
export const distance = (a: Point, b: Point): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Calculates area of a triangle defined by three vertices using cross product
 * @param ax - X coordinate of first vertex
 * @param ay - Y coordinate of first vertex
 * @param bx - X coordinate of second vertex
 * @param by - Y coordinate of second vertex
 * @param cx - X coordinate of third vertex
 * @param cy - Y coordinate of third vertex
 * @returns Absolute area value
 */
export const triangleArea = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
): number => Math.abs(ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) * 0.5;

/**
 * Calculates circumradius of a triangle defined by three vertices
 * The circumradius is the radius of the circumscribed circle
 * Formula: R = (a*b*c) / (4*A) where a,b,c are side lengths and A is area
 * @param ax - X coordinate of first vertex
 * @param ay - Y coordinate of first vertex
 * @param bx - X coordinate of second vertex
 * @param by - Y coordinate of second vertex
 * @param cx - X coordinate of third vertex
 * @param cy - Y coordinate of third vertex
 * @returns Circumradius value
 */
export const circumradius = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
): number => {
  const a = Math.hypot(bx - cx, by - cy);
  const b = Math.hypot(ax - cx, ay - cy);
  const c = Math.hypot(ax - bx, ay - by);
  const area = triangleArea(ax, ay, bx, by, cx, cy);
  if (area === 0) {
    return Number.POSITIVE_INFINITY;
  }
  return (a * b * c) / (4 * area);
};

/**
 * Point-in-polygon test using ray casting algorithm
 * Counts intersections of a ray from point to infinity with polygon edges
 * @param px - X coordinate of test point
 * @param py - Y coordinate of test point
 * @param polygon - Array of polygon vertices
 * @returns True if point is inside polygon
 */
export const isPointInPolygon = (
  px: number,
  py: number,
  polygon: Array<[number, number]>
): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    if (
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
};

/**
 * Checks if a value is approximately equal to another within EPSILON tolerance
 * Used for floating-point comparisons
 * @param a - First value
 * @param b - Second value
 * @returns True if values are approximately equal
 */
export const approxEqual = (a: number, b: number): boolean =>
  Math.abs(a - b) < EPSILON;

/**
 * Checks if a value is approximately zero within EPSILON tolerance
 * @param value - Value to check
 * @returns True if value is approximately zero
 */
export const approxZero = (value: number): boolean => Math.abs(value) < EPSILON;
