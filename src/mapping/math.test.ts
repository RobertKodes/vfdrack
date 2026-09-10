import { describe, expect, it } from "vitest";
import type { ChainSample } from "../types";
import { clamp, formatDigits, litSegments, logNorm, meterNorm, percentile, sampleToTubes } from "./math";

const base: ChainSample = {
  t: 1_000,
  slot: 100,
  slotDelta: 3,
  lagMs: 1400,
  slotsPerSec: 2.2,
  tps: 2100,
  txPerSlot: 540,
  feeP90: 80_000,
  feePressure: 0.3,
};

describe("mapping", () => {
  it("clamps and logs into 0..1", () => {
    expect(clamp(12, 0, 3)).toBe(3);
    expect(logNorm(0, 100)).toBe(0);
    expect(logNorm(100, 100)).toBe(1);
  });

  it("takes a percentile without exploding on shorts", () => {
    expect(percentile([], 0.9)).toBe(0);
    expect(percentile([4], 0.9)).toBe(4);
    expect(percentile([1, 2, 3, 4], 1)).toBe(4);
  });

  it("maps a hotter fee into a brighter FEE tube", () => {
    const quiet = sampleToTubes({ ...base, feeP90: 0, feePressure: 0 });
    const hot = sampleToTubes({ ...base, feeP90: 1_800_000, feePressure: 0.8 });
    expect(hot.feeNorm).toBeGreaterThan(quiet.feeNorm);
  });

  it("raises LOAD bars when TPS climbs", () => {
    const slow = sampleToTubes({ ...base, tps: 200 });
    const busy = sampleToTubes({ ...base, tps: 4500 });
    expect(busy.loadNorm).toBeGreaterThan(slow.loadNorm);
    expect(litSegments(busy.loadNorm, 16)).toBeGreaterThan(litSegments(slow.loadNorm, 16));
  });

  it("turns lag / stall into SLOT flicker pressure", () => {
    const tight = sampleToTubes({ ...base, lagMs: 200, slotDelta: 4 });
    const late = sampleToTubes({ ...base, lagMs: 5000, slotDelta: 0 });
    expect(late.lagNorm).toBeGreaterThan(tight.lagNorm);
    expect(late.stall).toBeGreaterThan(tight.stall);
  });

  it("gains typical load so the LOAD tube is not a stub", () => {
    const mid = sampleToTubes({ ...base, tps: 1648 });
    expect(meterNorm(mid.loadNorm)).toBeGreaterThan(0.45);
    expect(meterNorm(mid.loadNorm)).toBeLessThan(1);
  });

  it("pads and clips 7-seg digit strings", () => {
    expect(formatDigits(42, 6)).toBe("    42");
    expect(formatDigits(1234567, 6)).toBe("234567");
    expect(formatDigits(Number.NaN, 4)).toBe("    ");
  });
});
