/**
 * @fileoverview VoronoiCanvas component
 * Main interactive canvas component handling user interactions, state management, and rendering
 * Integrates all geometry algorithms and canvas utilities
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  FPS,
  POINT_RADIUS,
  ALPHA_SLIDER_DEFAULT,
  GRAPH_MODE_OPTIONS,
  MIN_CANVAS_DIMENSION,
  HIT_DISTANCE_MULTIPLIER,
} from "@/lib/constants";
import {
  clamp,
  sliderToRadius,
  radiusToSlider,
} from "@/lib/math-utils";
import {
  computeDerivedStructures,
  createInitialPoints,
} from "@/lib/geometry-algorithms";
import { drawScene, getAverageColorInPolygon } from "@/lib/canvas-utils";
import { Point, GraphMode, DragState, GhostDragState, CanvasSize } from "@/lib/types";

/**
 * VoronoiCanvas - Main interactive canvas component
 * Features:
 * - Interactive point placement and dragging
 * - Multiple visualization modes (Voronoi, Alpha-shape, Gabriel, RNG, MST, etc.)
 * - Alpha radius control via slider
 * - Ghost point preview with right-click
 * - Image-based cell coloring
 * - Canvas download functionality
 * - Responsive sizing
 */
export const VoronoiCanvas = () => {
  // ============================================================================
  // Refs
  // ============================================================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pointsRef = useRef<Point[]>([]);
  const modeRef = useRef<GraphMode>("voronoi");
  const derivedRef = useRef({
    voronoiCells: [] as Array<Array<[number, number]>>,
    graphEdges: [] as Array<[number, number]>,
    alphaTriangles: [] as Array<[number, number, number]>,
  });
  const alphaRadiusRef = useRef<number>(0);
  const ghostPointRef = useRef<{ x: number; y: number } | null>(null);
  const backgroundImageRef = useRef<ImageData | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const ghostDragRef = useRef<GhostDragState | null>(null);
  const idCounterRef = useRef<number>(GRAPH_MODE_OPTIONS.length); // Start after initial points
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const previousSizeRef = useRef<CanvasSize>({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });

  // ============================================================================
  // State
  // ============================================================================
  const [size, setSize] = useState<CanvasSize>({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });
  const [points, setPoints] = useState<Point[]>(() =>
    createInitialPoints(DEFAULT_WIDTH, DEFAULT_HEIGHT)
  );
  const [mode, setMode] = useState<GraphMode>("voronoi");
  const [alphaSlider, setAlphaSlider] = useState<number>(ALPHA_SLIDER_DEFAULT);
  const [ghostPoint, setGhostPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [backgroundImage, setBackgroundImage] = useState<ImageData | null>(null);

  // ==========================================================================
  // State for Random Seed Control
  // ==========================================================================
  const [seedCount, setSeedCount] = useState<number>(10); // Default number of seeds

  // ==========================================================================
  // Effect: Adjust Points Based on Seed Count
  // ==========================================================================
  useEffect(() => {
    setPoints((prevPoints) => {
      const currentCount = prevPoints.length;
      if (currentCount === seedCount) return prevPoints; // No change needed

      if (currentCount < seedCount) {
        // Add random points
        const newPoints = Array.from({ length: seedCount - currentCount }, () => ({
          id: idCounterRef.current++,
          x: Math.random() * size.width,
          y: Math.random() * size.height,
        }));
        return [...prevPoints, ...newPoints];
      } else {
        // Remove excess points
        return prevPoints.slice(0, seedCount);
      }
    });
  }, [seedCount, size.width, size.height]);

  // ============================================================================
  // Derived State
  // ============================================================================
  const isAlphaMode =
    mode === "alpha-shape" || mode === "alpha-complex";
  const alphaRadius = sliderToRadius(alphaSlider);

  const derived = useMemo(
    () =>
      computeDerivedStructures(points, size.width, size.height, alphaRadius, mode),
    [points, size.width, size.height, alphaRadius, mode]
  );

  // ============================================================================
  // Ref Syncing (for use in event handlers)
  // ============================================================================
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  useEffect(() => {
    alphaRadiusRef.current = alphaRadius;
  }, [alphaRadius]);

  useEffect(() => {
    ghostPointRef.current = ghostPoint;
  }, [ghostPoint]);

  useEffect(() => {
    backgroundImageRef.current = backgroundImage;
  }, [backgroundImage]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    derivedRef.current = derived;
  }, [derived]);

  // ============================================================================
  // Canvas Resize Observer
  // ============================================================================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize((previous) => {
          const nextWidth = Math.max(MIN_CANVAS_DIMENSION, Math.floor(width));
          const nextHeight = Math.max(MIN_CANVAS_DIMENSION, Math.floor(height));
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

  // ============================================================================
  // Canvas Setup
  // ============================================================================
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

  // ============================================================================
  // Point Scaling on Resize
  // ============================================================================
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

  // ============================================================================
  // Animation Loop
  // ============================================================================
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
          ghostPointRef.current,
          alphaRadiusRef.current,
          backgroundImageRef.current
        );
      }
      animationRef.current = requestAnimationFrame(renderFrame);
    };

    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    lastFrameRef.current = now - frameInterval;
    drawScene(
      ctx,
      size.width,
      size.height,
      pointsRef.current,
      now,
      derivedRef.current,
      modeRef.current,
      ghostPointRef.current,
      alphaRadiusRef.current,
      backgroundImageRef.current
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

  // ============================================================================
  // Pointer Interaction Handlers
  // ============================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    /**
     * Updates points state while keeping ref in sync
     */
    const updatePoints = (updater: (value: Point[]) => Point[]) => {
      setPoints((previous) => {
        const next = updater(previous);
        pointsRef.current = next;
        return next;
      });
    };

    /**
     * Gets mouse position relative to canvas
     */
    const getRelativePosition = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      return {
        x: clamp(x, 0, rect.width),
        y: clamp(y, 0, rect.height),
      };
    };

    /**
     * Finds point under mouse cursor
     */
    const findPointByPosition = (x: number, y: number) => {
      const currentPoints = pointsRef.current;
      const hitDistance = POINT_RADIUS * HIT_DISTANCE_MULTIPLIER;
      for (let index = currentPoints.length - 1; index >= 0; index -= 1) {
        const point = currentPoints[index];
        const distanceValue = Math.hypot(point.x - x, point.y - y);
        if (distanceValue <= hitDistance) {
          return index;
        }
      }
      return -1;
    };

    /**
     * Handles pointer down on regular points
     */
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button === 2) return; // Right-click
      if (ghostDragRef.current !== null) return; // Ghost drag active

      // Check if clicking on ghost point
      const currentGhost = ghostPointRef.current;
      if (currentGhost !== null) {
        const { x, y } = getRelativePosition(event);
        const distToGhost = Math.hypot(currentGhost.x - x, currentGhost.y - y);
        if (distToGhost <= POINT_RADIUS * HIT_DISTANCE_MULTIPLIER) {
          return;
        }
      }

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

      // Add new point
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

    /**
     * Handles pointer move for dragging points
     */
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

    /**
     * Releases pointer for point dragging
     */
    const releasePointer = (event: PointerEvent) => {
      const dragState = dragRef.current;
      if (dragState && dragState.pointerId === event.pointerId) {
        dragRef.current = null;
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
      }
    };

    /**
     * Handles right-click context menu
     */
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const currentGhost = ghostPointRef.current;
      if (currentGhost !== null) {
        const distToGhost = Math.hypot(currentGhost.x - x, currentGhost.y - y);
        if (distToGhost <= POINT_RADIUS * HIT_DISTANCE_MULTIPLIER) {
          setGhostPoint(null);
          return;
        }
      }

      setGhostPoint({ x, y });
    };

    /**
     * Handles pointer down on ghost point
     */
    const handleGhostPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      const currentGhost = ghostPointRef.current;
      if (currentGhost === null) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const distToGhost = Math.hypot(currentGhost.x - x, currentGhost.y - y);
      if (distToGhost <= POINT_RADIUS * HIT_DISTANCE_MULTIPLIER) {
        ghostDragRef.current = {
          pointerId: event.pointerId,
          offsetX: currentGhost.x - x,
          offsetY: currentGhost.y - y,
        };
        canvas.setPointerCapture(event.pointerId);
        event.preventDefault();
        event.stopPropagation();
      }
    };

    /**
     * Handles pointer move for ghost point dragging
     */
    const handleGhostPointerMove = (event: PointerEvent) => {
      const ghostDrag = ghostDragRef.current;
      if (!ghostDrag || ghostDrag.pointerId !== event.pointerId) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newX = clamp(x + ghostDrag.offsetX, 0, rect.width);
      const newY = clamp(y + ghostDrag.offsetY, 0, rect.height);

      setGhostPoint({ x: newX, y: newY });
    };

    /**
     * Releases pointer for ghost point dragging
     */
    const releaseGhostPointer = (event: PointerEvent) => {
      const ghostDrag = ghostDragRef.current;
      if (ghostDrag && ghostDrag.pointerId === event.pointerId) {
        ghostDragRef.current = null;
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
      }
    };

    // Register event listeners
    canvas.addEventListener("pointerdown", handleGhostPointerDown, true);
    canvas.addEventListener("pointermove", handleGhostPointerMove);
    canvas.addEventListener("pointerup", releaseGhostPointer);
    canvas.addEventListener("pointercancel", releaseGhostPointer);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", releasePointer);
    canvas.addEventListener("pointercancel", releasePointer);
    canvas.addEventListener("pointerleave", releasePointer);
    canvas.addEventListener("contextmenu", handleContextMenu);

    return () => {
      canvas.removeEventListener("pointerdown", handleGhostPointerDown, true);
      canvas.removeEventListener("pointermove", handleGhostPointerMove);
      canvas.removeEventListener("pointerup", releaseGhostPointer);
      canvas.removeEventListener("pointercancel", releaseGhostPointer);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", releasePointer);
      canvas.removeEventListener("pointercancel", releasePointer);
      canvas.removeEventListener("pointerleave", releasePointer);
      canvas.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [size.width, size.height]);

  // ============================================================================
  // Image Handling
  // ============================================================================
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      tempCtx.drawImage(img, 0, 0);
      const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
      setBackgroundImage(imageData);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleClearImage = () => {
    setBackgroundImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================================
  // Download Handling
  // ============================================================================
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || (mode !== "voronoi" && mode !== "voronoi-bruteforce")) return;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = size.width;
    exportCanvas.height = size.height;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#04050a";
    ctx.fillRect(0, 0, size.width, size.height);

    // Brute force mode: render pixel by pixel
    if (mode === "voronoi-bruteforce") {
      const imageData = ctx.createImageData(size.width, size.height);
      const data = imageData.data;

      // Pre-calculate colors for each cell
      const cellColors: Array<{ r: number; g: number; b: number }> = [];
      
      if (backgroundImage) {
        // Calculate average color for each cell from background image
        const cellColorSums: Array<{ r: number; g: number; b: number; count: number }> = 
          points.map(() => ({ r: 0, g: 0, b: 0, count: 0 }));
        
        const scaleX = backgroundImage.width / size.width;
        const scaleY = backgroundImage.height / size.height;
        
        for (let y = 0; y < size.height; y++) {
          for (let x = 0; x < size.width; x++) {
            let closestIndex = 0;
            let closestDistance = Number.MAX_VALUE;

            for (let i = 0; i < points.length; i++) {
              const seedX = Math.round(points[i].x);
              const seedY = Math.round(points[i].y);
              const dx = x - seedX;
              const dy = y - seedY;
              const distSquared = dx * dx + dy * dy;

              if (distSquared < closestDistance) {
                closestDistance = distSquared;
                closestIndex = i;
              }
            }

            const imgX = Math.floor(x * scaleX);
            const imgY = Math.floor(y * scaleY);
            const imgIndex = (imgY * backgroundImage.width + imgX) * 4;
            
            cellColorSums[closestIndex].r += backgroundImage.data[imgIndex];
            cellColorSums[closestIndex].g += backgroundImage.data[imgIndex + 1];
            cellColorSums[closestIndex].b += backgroundImage.data[imgIndex + 2];
            cellColorSums[closestIndex].count++;
          }
        }
        
        for (let i = 0; i < points.length; i++) {
          const sum = cellColorSums[i];
          if (sum.count > 0) {
            cellColors.push({
              r: Math.round(sum.r / sum.count),
              g: Math.round(sum.g / sum.count),
              b: Math.round(sum.b / sum.count),
            });
          } else {
            cellColors.push({ r: 128, g: 128, b: 128 });
          }
        }
      } else {
        for (let i = 0; i < points.length; i++) {
          const hue = (i * 137.5) % 360;
          const saturation = 85;
          const lightness = 55;

          const h = hue / 60;
          const c = ((100 - Math.abs(2 * lightness - 100)) * saturation) / 100;
          const xc = c * (1 - Math.abs((h % 2) - 1));
          let r = 0, g = 0, b = 0;

          if (h < 1) [r, g, b] = [c, xc, 0];
          else if (h < 2) [r, g, b] = [xc, c, 0];
          else if (h < 3) [r, g, b] = [0, c, xc];
          else if (h < 4) [r, g, b] = [0, xc, c];
          else if (h < 5) [r, g, b] = [xc, 0, c];
          else [r, g, b] = [c, 0, xc];

          const m = (lightness / 100) - c / 2;
          cellColors.push({
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255),
          });
        }
      }

      // Render each pixel
      for (let y = 0; y < size.height; y++) {
        for (let x = 0; x < size.width; x++) {
          let closestIndex = 0;
          let closestDistance = Number.MAX_VALUE;

          for (let i = 0; i < points.length; i++) {
            const seedX = Math.round(points[i].x);
            const seedY = Math.round(points[i].y);
            const dx = x - seedX;
            const dy = y - seedY;
            const distSquared = dx * dx + dy * dy;

            if (distSquared < closestDistance) {
              closestDistance = distSquared;
              closestIndex = i;
            }
          }

          const color = cellColors[closestIndex];
          const pixelIndex = (y * size.width + x) * 4;
          data[pixelIndex] = color.r;
          data[pixelIndex + 1] = color.g;
          data[pixelIndex + 2] = color.b;
          data[pixelIndex + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    } else {
      // Continuous Voronoi mode: render polygons
      derived.voronoiCells.forEach((polygon, index) => {
        if (!polygon.length) return;

        ctx.beginPath();
        ctx.moveTo(polygon[0][0], polygon[0][1]);
        for (let i = 1; i < polygon.length; i++) {
          ctx.lineTo(polygon[i][0], polygon[i][1]);
        }
        ctx.closePath();

        if (backgroundImage) {
          const avgColor = getAverageColorInPolygon(
            backgroundImage,
            polygon,
            size.width,
            size.height
          );
          ctx.fillStyle = `rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})`;
        } else {
          const hue = (index * 47) % 360;
          const lightness = 58;
          ctx.fillStyle = `hsl(${hue}, 82%, ${lightness}%)`;
        }
        ctx.fill();
      });
    }

    const link = document.createElement("a");
    link.download = "voronoi-artwork.png";
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };

  const modeMeta = GRAPH_MODE_OPTIONS.find((option) => option.value === mode);

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <div className="flex flex-col gap-4">
      {/* Mode Selector */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 backdrop-blur">
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-300/80">
              Modes de visualisation
            </p>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-8">
              {GRAPH_MODE_OPTIONS.map((option) => {
                const isActive = option.value === mode;
                const isDisabled = option.disabled === true;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setMode(option.value)}
                    className={`rounded-lg border px-2 py-1.5 text-left text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 ${
                      isDisabled
                        ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/30"
                        : isActive
                          ? "border-cyan-300/70 bg-cyan-300/15 text-white"
                          : "border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {option.label}
                      {isDisabled && (
                        <span className="ml-1 text-[9px] font-normal opacity-60">
                          (bientôt)
                        </span>
                      )}
                    </span>
                    <span
                      className={`mt-0.5 block text-[10px] leading-tight ${
                        isDisabled ? "text-white/30" : "text-white/60"
                      }`}
                    >
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {isAlphaMode ? (
            <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-xs text-white/70">Rayon α</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.005}
                value={alphaSlider}
                onChange={(event) =>
                  setAlphaSlider(Number(event.target.value))
                }
                className="flex-1 accent-cyan-300"
              />
              <span className="min-w-[70px] text-right text-xs font-medium text-white">
                {Math.round(alphaRadius)} px
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative flex h-full w-full min-h-[520px] flex-1 items-stretch justify-stretch"
      >
        <canvas
          ref={canvasRef}
          onContextMenu={(e) => e.preventDefault()}
          className="h-full w-full rounded-[36px] border border-white/10 bg-transparent shadow-[0_40px_120px_-60px_rgba(56,189,248,0.45)]"
        />
        <div className="pointer-events-none absolute inset-0 rounded-[36px] bg-gradient-to-br from-white/6 via-transparent to-white/3 opacity-40 mix-blend-screen" />

        {/* Info Overlay */}
        <div className="pointer-events-none absolute left-6 top-6 max-w-xs text-xs leading-relaxed text-slate-200/70">
          Cliquez pour ajouter un point, maintenez et déplacez pour ajuster la
          géométrie.
        </div>

        {/* Stats Overlay */}
        <div className="pointer-events-none absolute bottom-6 right-6 flex flex-col items-end gap-1 text-xs text-white/60">
          <span>Mode : {modeMeta?.label ?? ""}</span>
          {isAlphaMode ? (
            <span>Rayon α ≈ {Math.round(alphaRadius)} px</span>
          ) : null}
          <span>Points : {points.length}</span>
          {mode === "voronoi" || mode === "voronoi-bruteforce" ? (
            <span>Cellules : {derived.voronoiCells.length}</span>
          ) : mode === "alpha-complex" ? (
            <span>Triangles : {derived.alphaTriangles.length}</span>
          ) : (
            <span>Arêtes : {derived.graphEdges.length}</span>
          )}
          <span>Animation : 30 fps</span>
          {backgroundImage ? (
            <span className="text-cyan-300/80">Image chargée</span>
          ) : null}
        </div>
      </div>

      {/* Random Seed Slider */}
      <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <span className="text-xs text-white/70">Nombre de germes</span>
        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={seedCount}
          onChange={(event) => setSeedCount(Number(event.target.value))}
          className="flex-1 accent-cyan-300"
        />
        <span className="min-w-[70px] text-right text-xs font-medium text-white">
          {seedCount}
        </span>
      </div>

      {/* Image Controls */}
      {(mode === "voronoi" || mode === "voronoi-bruteforce") && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10"
            >
              Charger une image
            </label>

            {backgroundImage && (
              <button
                type="button"
                onClick={handleClearImage}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:border-red-500/50 hover:bg-red-500/20"
              >
                Supprimer l&apos;image
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-300 transition hover:border-cyan-300/50 hover:bg-cyan-300/20"
            >
              Télécharger
            </button>

            <span className="ml-auto text-xs text-white/50">
              {backgroundImage
                ? "Les couleurs des cellules sont calculées depuis l'image"
                : "Chargez une image pour colorier les cellules Voronoï"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
