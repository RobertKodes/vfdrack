import type { ChainSample, TubeParams } from "../types";

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (sorted.length - 1) * clamp(p, 0, 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] * (hi - idx) + sorted[hi] * (idx - lo);
}

export function logNorm(value: number, max: number): number {
  if (value <= 0) return 0;
  return clamp(Math.log1p(value) / Math.log1p(max), 0, 1);
}

/** Same 0..1 family as Hearslot, mapped onto tubes instead of oscillators. */
export function sampleToTubes(sample: ChainSample): TubeParams {
  const feeNorm = clamp(
    0.62 * logNorm(sample.feeP90, 2_000_000) + 0.38 * sample.feePressure,
    0,
    1,
  );
  const loadNorm = clamp((sample.tps - 400) / 4200, 0, 1);
  const pulseNorm = clamp((sample.slotsPerSec - 0.4) / 3.2, 0, 1);
  const lagNorm = clamp((sample.lagMs - 350) / 4500, 0, 1);
  const stall = sample.slotDelta === 0 ? 0.55 : 0;

  return { feeNorm, loadNorm, pulseNorm, lagNorm, stall };
}

export function formatDigits(value: number, width: number): string {
  if (!Number.isFinite(value)) return "".padStart(width, " ");
  const rounded = Math.max(0, Math.round(value));
  const raw = String(rounded);
  if (raw.length > width) return raw.slice(raw.length - width);
  return raw.padStart(width, " ");
}

export function litSegments(norm: number, count: number): number {
  return Math.round(clamp(norm, 0, 1) * count);
}

/** Instrument face scale — typical mainnet sits mid-tube, not on the floor. */
export function meterNorm(norm: number, gain = 1.75): number {
  return clamp(norm * gain, 0, 1);
}
