"use client";

import { useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";

type WebPetIdleAction = {
  name: string;
  baseDuration: number;
  extraDuration: number;
};

type WebPetMovementAction = {
  name: string;
  speedMultiplier: number;
};

type WebPetConfig = {
  name: string;
  mediaFolder: string;
  defaultColor: string;
  spriteSize: { w: number; h: number };
  scale?: number;
  speed: number;
  idleDist: number;
  hoverAction: string;
  hoverDist: number;
  idlePauseMs: { min: number; max: number };
  followMouse: boolean;
  actions: string[];
  idleActions: WebPetIdleAction[];
  movementActions: WebPetMovementAction[];
};

export type WebPetProps = {
  animal: string;
  color?: string;
  position?: "fixed" | "absolute";
  speed?: number;
  scale?: number;
  followMouse?: boolean;
};

const DEFAULT_WEB_PET = {
  actions: ["idle", "run", "swipe", "walk", "walk_fast", "with_ball"],
  hoverAction: "swipe",
  hoverDist: 50,
  idleActions: [
    { name: "idle", baseDuration: 2500, extraDuration: 2000 },
    { name: "swipe", baseDuration: 1200, extraDuration: 800 },
  ],
  idleDist: 48,
  idlePauseMs: { min: 1500, max: 2200 },
  movementActions: [
    { name: "walk", speedMultiplier: 1.0 },
    { name: "walk_fast", speedMultiplier: 1.35 },
    { name: "run", speedMultiplier: 1.8 },
  ],
  speed: 4.5,
  scale: 0.5,
  spriteSize: { w: 100, h: 100 },
  followMouse: false,
} satisfies Omit<WebPetConfig, "name" | "mediaFolder" | "defaultColor">;

// One entry per animal that has sprites in public/media. To add another,
// drop its six <color>_<action>_8fps.gif files in a folder there and add a
// speed here.
const WEB_PET_SPEEDS: Record<string, number> = {
  cat: 4.6,
  panda: 3.6,
};

export function getWebPetSpeed(animal: string, fallback: number): number {
  return WEB_PET_SPEEDS[animal] ?? fallback;
}

function resolveAction(config: WebPetConfig, action: string): string {
  if (config.actions.includes(action)) return action;
  return config.actions[0] ?? action;
}

function getGifUrl(
  config: WebPetConfig,
  action: string,
  colorOverride?: string,
): string {
  const resolvedColor = colorOverride ?? config.defaultColor;
  const resolvedAction = resolveAction(config, action);
  return `/media/${config.mediaFolder}/${resolvedColor}_${resolvedAction}_8fps.gif`;
}

function useWebPetAnimation(
  ref: RefObject<HTMLDivElement | null>,
  config: WebPetConfig | null,
  colorOverride?: string,
): void {
  const mousePos = useRef({ x: 0, y: 0 });
  const animalPos = useRef({ x: 10, y: 0 });
  const animationId = useRef<number | null>(null);
  const idleAction = useRef<string>("idle");
  const idleActionUntil = useRef(0);
  const idleCooldownUntil = useRef(0);
  const movementAction = useRef<string>("walk");
  const movementSpeedMultiplier = useRef(1);
  const movementPauseUntil = useRef(0);
  const movementTargetX = useRef<number | null>(null);
  const facingDir = useRef<1 | -1>(1);
  const lastStepTime = useRef(0);
  // Last values actually written to the DOM, so we can skip no-op style writes.
  const lastGif = useRef("");
  const lastTransform = useRef("");
  const lastLeft = useRef(Number.NaN);

  useEffect(() => {
    if (!config) return;
    const activeConfig = config;

    const {
      speed,
      idleDist,
      hoverAction,
      hoverDist,
      idlePauseMs,
      scale: configScale,
      idleActions,
      movementActions,
      followMouse,
    } = activeConfig;
    const scale = configScale ?? 1;

    if (idleActions.length > 0) {
      idleAction.current = idleActions[0].name;
    }

    // The three setters below all bail when the value hasn't changed. Without
    // this the loop rewrote backgroundImage and transform on every tick with
    // identical strings, dirtying style 8x a second for no visual change.
    function setGif(name: string) {
      if (!ref.current) return;
      const src = getGifUrl(activeConfig, name, colorOverride);
      if (src === lastGif.current) return;
      lastGif.current = src;
      ref.current.style.backgroundImage = `url("${src}")`;
    }

    function setTransform() {
      if (!ref.current) return;
      const next = `scale(${scale}) scaleX(${facingDir.current})`;
      if (next === lastTransform.current) return;
      lastTransform.current = next;
      ref.current.style.transform = next;
    }

    function setLeft(px: number) {
      if (!ref.current) return;
      // Sub-pixel changes aren't visible; round so we skip pointless writes.
      const rounded = Math.round(px);
      if (rounded === lastLeft.current) return;
      lastLeft.current = rounded;
      ref.current.style.left = `${rounded}px`;
    }

    function pickIdleAction(ts: number) {
      const index = Math.floor(Math.random() * idleActions.length);
      const action = idleActions[index];
      if (!action) return;
      idleAction.current = action.name;
      idleActionUntil.current =
        ts + action.baseDuration + Math.random() * action.extraDuration;
      idleCooldownUntil.current = idleActionUntil.current + idlePauseMs.min / 8;
    }

    function pickMovementAction() {
      const index = Math.floor(Math.random() * movementActions.length);
      const action = movementActions[index];
      if (!action) return;
      movementAction.current = action.name;
      movementSpeedMultiplier.current = action.speedMultiplier;
    }

    function scheduleMovementPause(ts: number) {
      const extra = Math.max(0, idlePauseMs.max - idlePauseMs.min);
      movementPauseUntil.current = ts + idlePauseMs.min + Math.random() * extra;
    }

    function pickMovementTarget(x: number, boundsWidth: number) {
      const margin = 16;
      const maxX = Math.max(margin, boundsWidth - margin);
      const availableLeft = Math.max(0, x - margin);
      const availableRight = Math.max(0, maxX - x);
      const minDist = boundsWidth * 0.2;
      const maxDist = boundsWidth * 0.55;
      const dist = minDist + Math.random() * Math.max(0, maxDist - minDist);

      const canLeft = availableLeft >= dist;
      const canRight = availableRight >= dist;

      let dir: 1 | -1;
      if (canLeft && canRight) {
        dir = Math.random() < 0.5 ? -1 : 1;
      } else if (canLeft) {
        dir = -1;
      } else if (canRight) {
        dir = 1;
      } else {
        dir = availableLeft > availableRight ? -1 : 1;
      }

      movementTargetX.current = Math.min(
        maxX,
        Math.max(margin, x + dir * dist),
      );
    }

    function animate(ts: number) {
      // The sprites are 8fps, so there's nothing to gain from stepping more
      // often than that — every extra frame would draw the same GIF frame.
      const stepMs = 125;

      // First frame: seed the clock instead of treating ts as a huge elapsed.
      if (lastStepTime.current === 0) {
        lastStepTime.current = ts;
        animationId.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = ts - lastStepTime.current;
      if (elapsed < stepMs) {
        animationId.current = requestAnimationFrame(animate);
        return;
      }
      // Carry the remainder rather than snapping to ts, otherwise the cadence
      // drifts a little later every tick (125ms of work starting at 141ms...).
      lastStepTime.current = ts - (elapsed % stepMs);

      // Scale movement by real elapsed time so a janky frame doesn't slow the
      // pet down, but cap it: rAF is paused while the tab is hidden, and
      // without a cap the pet would teleport across the screen on return.
      const steps = Math.min(elapsed / stepMs, 3);

      let { x } = animalPos.current;
      const rect = ref.current?.getBoundingClientRect();
      const parentRect =
        ref.current?.parentElement?.getBoundingClientRect() ??
        ({ left: 0, width: window.innerWidth } as DOMRect);
      const parentWidth = parentRect.width;
      const spriteWidth = rect?.width ?? activeConfig.spriteSize.w;

      let targetX: number;

      if (followMouse) {
        targetX = mousePos.current.x - parentRect.left;
      } else {
        if (ts < movementPauseUntil.current) {
          targetX = x;
        } else {
          if (movementTargetX.current === null) {
            pickMovementAction();
            pickMovementTarget(x, parentWidth);
          }
          targetX = movementTargetX.current ?? x;
        }
      }

      const diffX = targetX - x;
      const distX = Math.abs(diffX) || 0.0001;
      const idle = distX < idleDist;
      if (Math.abs(diffX) > 0.5) {
        facingDir.current = diffX < 0 ? -1 : 1;
      }

      const centerX = rect ? rect.left + rect.width / 2 : x;
      const centerY = rect
        ? rect.top + rect.height / 2
        : window.innerHeight - 1;
      const distToMouse = Math.hypot(
        mousePos.current.x - centerX,
        mousePos.current.y - centerY,
      );
      const hoverTriggered = distToMouse <= hoverDist;

      if (hoverTriggered) {
        setGif(hoverAction);
        setTransform();
      } else if (idle) {
        idleAction.current = resolveAction(activeConfig, idleAction.current);
        if (!followMouse && movementTargetX.current !== null) {
          movementTargetX.current = null;
          scheduleMovementPause(ts);
        }
        if (ts > idleCooldownUntil.current && ts > idleActionUntil.current) {
          pickIdleAction(ts);
        }
        setGif(idleAction.current);
        setTransform();
      } else {
        x += (diffX / distX) * speed * movementSpeedMultiplier.current * steps;
        x = Math.min(Math.max(16, x), parentWidth - 16);
        animalPos.current = { x, y: 0 };
        if (
          !followMouse &&
          movementTargetX.current !== null &&
          distX <= idleDist
        ) {
          movementTargetX.current = null;
          scheduleMovementPause(ts);
        }

        if (idleActions.length > 0) {
          idleAction.current = resolveAction(activeConfig, idleActions[0].name);
        }
        idleActionUntil.current = 0;
        idleCooldownUntil.current = 0;

        setGif(movementAction.current);
        setTransform();
      }

      setLeft(x - spriteWidth / 2);

      animationId.current = requestAnimationFrame(animate);
    }

    function handleMouseMove(e: MouseEvent) {
      mousePos.current = { x: e.clientX, y: e.clientY };
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function start() {
      if (animationId.current !== null) return;
      lastStepTime.current = 0;
      animationId.current = requestAnimationFrame(animate);
    }

    function stop() {
      if (animationId.current === null) return;
      cancelAnimationFrame(animationId.current);
      animationId.current = null;
    }

    // Respond to the setting being toggled, not just its value at mount.
    function handleMotionChange() {
      if (motionQuery.matches) stop();
      else start();
    }

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    motionQuery.addEventListener("change", handleMotionChange);
    if (!motionQuery.matches) start();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      motionQuery.removeEventListener("change", handleMotionChange);
      stop();
    };
  }, [config, colorOverride, ref]);
}

export function WebPet({
  animal,
  color = "brown",
  position = "fixed",
  speed,
  scale,
  followMouse = false,
}: WebPetProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Memoised because it's an effect dependency: a fresh object literal every
  // render would restart the animation loop (and reset the pet's position and
  // idle timers) each time the parent re-rendered.
  const config = useMemo<WebPetConfig>(
    () => ({
      name: animal,
      mediaFolder: animal,
      defaultColor: color,
      actions: DEFAULT_WEB_PET.actions,
      hoverAction: DEFAULT_WEB_PET.hoverAction,
      hoverDist: DEFAULT_WEB_PET.hoverDist,
      idleActions: DEFAULT_WEB_PET.idleActions,
      idleDist: DEFAULT_WEB_PET.idleDist,
      idlePauseMs: DEFAULT_WEB_PET.idlePauseMs,
      movementActions: DEFAULT_WEB_PET.movementActions,
      speed: speed ?? getWebPetSpeed(animal, DEFAULT_WEB_PET.speed),
      scale: scale ?? DEFAULT_WEB_PET.scale,
      spriteSize: DEFAULT_WEB_PET.spriteSize,
      followMouse,
    }),
    [animal, color, speed, scale, followMouse],
  );

  useWebPetAnimation(ref, config, color);
  const initialGif = getGifUrl(config, config.hoverAction, color);

  return (
    <div
      ref={ref}
      style={{
        position,
        bottom: "0px",
        height: `${config.spriteSize.h}px`,
        width: `${config.spriteSize.w}px`,
        zIndex: 9999,
        backgroundImage: `url("${initialGif}")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom center",
        backgroundSize: "contain",
        imageRendering: "pixelated",
        pointerEvents: "none",
        transform: `scale(${config.scale ?? 1})`,
        transformOrigin: "bottom center",
      }}
    />
  );
}
