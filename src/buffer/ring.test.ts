import { describe, expect, it } from "vitest";
import { TimeRing } from "./ring";

describe("TimeRing", () => {
  it("drops samples older than the window", () => {
    const ring = new TimeRing<{ t: number; n: number }>(1_000);
    ring.push({ t: 1000, n: 1 });
    ring.push({ t: 1500, n: 2 });
    ring.push({ t: 2200, n: 3 });
    expect(ring.snapshot().map((x) => x.n)).toEqual([2, 3]);
  });

  it("reports the live span", () => {
    const ring = new TimeRing<{ t: number }>(10_000);
    expect(ring.span()).toBeNull();
    ring.push({ t: 10 });
    ring.push({ t: 40 });
    expect(ring.span()).toEqual({ start: 10, end: 40 });
  });
});
