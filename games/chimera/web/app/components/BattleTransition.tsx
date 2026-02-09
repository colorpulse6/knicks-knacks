"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface BattleTransitionProps {
  isActive: boolean;
  onComplete: () => void;
  type?: "swirl" | "flash" | "shatter" | "glitch";
}

const TRANSITION_DURATION = 1200; // Total duration in ms

export default function BattleTransition({
  isActive,
  onComplete,
  type = "swirl",
}: BattleTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const hasCompletedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref updated without triggering re-renders
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isActive) {
      hasCompletedRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    startTimeRef.current = Date.now();
    hasCompletedRef.current = false;

    const width = canvas.width;
    const height = canvas.height;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / TRANSITION_DURATION, 1);

      ctx.clearRect(0, 0, width, height);

      switch (type) {
        case "swirl":
          drawSwirlTransition(ctx, width, height, progress);
          break;
        case "flash":
          drawFlashTransition(ctx, width, height, progress);
          break;
        case "shatter":
          drawShatterTransition(ctx, width, height, progress);
          break;
        case "glitch":
          drawGlitchTransition(ctx, width, height, progress);
          break;
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        // Small delay before calling complete to ensure final frame renders
        setTimeout(() => {
          onCompleteRef.current();
        }, 50);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive, type]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
      />
    </div>
  );
}

/**
 * FF6-style swirl transition
 */
function drawSwirlTransition(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number
): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

  // Phase timing: 0-0.4 = spiral in, 0.4-0.7 = hold with flashes, 0.7-1 = solid black
  if (progress < 0.4) {
    const spiralProgress = progress / 0.4;
    const numSpirals = 6;

    for (let i = 0; i < numSpirals; i++) {
      const startAngle = (i / numSpirals) * Math.PI * 2 + spiralProgress * Math.PI * 4;
      const radius = maxRadius * (1 - spiralProgress * 0.8);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);

      for (let j = 0; j <= 50; j++) {
        const angle = startAngle + (j / 50) * Math.PI;
        const r = (j / 50) * radius;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        ctx.lineTo(x, y);
      }

      ctx.closePath();
      const alpha = 0.3 + spiralProgress * 0.7;
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fill();
    }
  } else if (progress < 0.7) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    const flashProgress = ((progress - 0.4) / 0.3) * Math.PI * 3;
    const flashIntensity = Math.abs(Math.sin(flashProgress)) * 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Quick flash transition
 */
function drawFlashTransition(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number
): void {
  if (progress < 0.15) {
    const alpha = progress / 0.15;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(0, 0, width, height);
  } else if (progress < 0.3) {
    const localProgress = (progress - 0.15) / 0.15;
    const v = Math.floor(255 * (1 - localProgress));
    ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Shatter/break apart transition
 */
function drawShatterTransition(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number
): void {
  const tileSize = 40;
  const cols = Math.ceil(width / tileSize);
  const rows = Math.ceil(height / tileSize);
  const centerX = width / 2;
  const centerY = height / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * tileSize;
      const y = row * tileSize;

      const dx = x + tileSize / 2 - centerX;
      const dy = y + tileSize / 2 - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
      const delay = (distance / maxDistance) * 0.4;

      const localProgress = Math.max(0, Math.min(1, (progress - delay) / 0.6));

      if (localProgress > 0) {
        const fallY = y + localProgress * localProgress * 200;
        const rotation = localProgress * Math.PI * 2;
        const scale = 1 - localProgress * 0.5;
        const alpha = 1 - localProgress;

        ctx.save();
        ctx.translate(x + tileSize / 2, fallY + tileSize / 2);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#000000";
        ctx.fillRect(-tileSize / 2, -tileSize / 2, tileSize, tileSize);
        ctx.restore();
      }
    }
  }

  if (progress > 0.6) {
    const overlayAlpha = (progress - 0.6) / 0.4;
    ctx.fillStyle = `rgba(0, 0, 0, ${overlayAlpha})`;
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Glitch-style transition (fits Chimera's sci-fi theme)
 */
function drawGlitchTransition(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number
): void {
  // Horizontal slice distortion
  const numSlices = 20;
  const sliceHeight = height / numSlices;

  ctx.globalAlpha = 1;

  for (let i = 0; i < numSlices; i++) {
    const y = i * sliceHeight;
    const offset = Math.sin(progress * Math.PI * 10 + i) * (50 * progress);

    ctx.fillStyle = i % 3 === 0 ? "#00ffff" : i % 3 === 1 ? "#ff00ff" : "#000000";
    ctx.globalAlpha = 0.3 + progress * 0.7;
    ctx.fillRect(offset - 50, y, width + 100, sliceHeight);
  }

  // Scanlines
  ctx.globalAlpha = 0.1;
  for (let y = 0; y < height; y += 4) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, y, width, 1);
  }

  // Final black overlay - start earlier and go full black
  if (progress > 0.4) {
    ctx.globalAlpha = Math.min(1, (progress - 0.4) / 0.4);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.globalAlpha = 1;
}

/**
 * Hook for managing battle transition state
 */
export function useBattleTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<"swirl" | "flash" | "shatter" | "glitch">("swirl");
  const callbackRef = useRef<(() => void) | null>(null);

  const startTransition = useCallback((callback: () => void, type: "swirl" | "flash" | "shatter" | "glitch" = "swirl") => {
    callbackRef.current = callback;
    setTransitionType(type);
    setIsTransitioning(true);
  }, []);

  const handleComplete = useCallback(() => {
    setIsTransitioning(false);
    const cb = callbackRef.current;
    callbackRef.current = null;
    cb?.();
  }, []);

  return {
    isTransitioning,
    transitionType,
    startTransition,
    handleComplete,
  };
}
