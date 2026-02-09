// ATB (Active Time Battle) System
// Manages gauge filling, ready states, and timing

import type { ATBState } from "../types";

export const ATB_MAX = 100;
export const BASE_FILL_RATE = 1;
export const TICK_RATE = 16; // ~60fps

/**
 * Calculate how fast an ATB gauge fills based on speed stat
 * Higher speed = faster gauge fill
 */
export function calculateFillRate(speed: number): number {
  return ((speed + 20) / 16) * BASE_FILL_RATE;
}

/**
 * Create initial ATB state for a combatant
 */
export function createATBState(speed: number, startFull: boolean = false): ATBState {
  return {
    gauge: startFull ? ATB_MAX : Math.random() * 30, // Random starting position
    maxGauge: ATB_MAX,
    fillRate: calculateFillRate(speed),
    isReady: startFull,
    isActing: false,
  };
}

/**
 * Update ATB gauge by one tick
 * @param atb - Current ATB state
 * @param deltaTime - Time since last update (ms)
 * @param speedModifier - Multiplier from status effects (1 = normal, 1.5 = haste, 0.5 = slow)
 */
export function updateGauge(
  atb: ATBState,
  deltaTime: number = TICK_RATE,
  speedModifier: number = 1
): ATBState {
  if (atb.isReady || atb.isActing) {
    return atb;
  }

  const timeFactor = deltaTime / TICK_RATE;
  const modifiedFillRate = atb.fillRate * speedModifier;
  const newGauge = Math.min(ATB_MAX, atb.gauge + modifiedFillRate * timeFactor);
  const isReady = newGauge >= ATB_MAX;

  return {
    ...atb,
    gauge: newGauge,
    isReady,
  };
}

/**
 * Check if a combatant is ready to act
 */
export function isReady(atb: ATBState): boolean {
  return atb.gauge >= ATB_MAX && !atb.isActing;
}

/**
 * Reset ATB gauge after taking an action
 */
export function resetGauge(atb: ATBState): ATBState {
  return {
    ...atb,
    gauge: 0,
    isReady: false,
    isActing: false,
  };
}

/**
 * Set acting state (pause gauge during action execution)
 */
export function setActing(atb: ATBState, isActing: boolean): ATBState {
  return {
    ...atb,
    isActing,
    isReady: !isActing && atb.gauge >= ATB_MAX,
  };
}

/**
 * Apply speed buff/debuff to fill rate
 */
export function modifyFillRate(atb: ATBState, multiplier: number): ATBState {
  return {
    ...atb,
    fillRate: calculateFillRate(atb.fillRate * multiplier),
  };
}

/**
 * Get gauge as percentage for UI display
 */
export function getGaugePercent(atb: ATBState): number {
  return (atb.gauge / atb.maxGauge) * 100;
}
