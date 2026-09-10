import { describe, expect, it } from "vitest";
import { humanErr } from "./errors";

describe("humanErr", () => {
  it("speaks 403 / 429 in bench English", () => {
    expect(humanErr(new Error("403 Access forbidden"))).toMatch(/blocked/i);
    expect(humanErr("429 Too Many Requests")).toMatch(/sit still/i);
  });

  it("does not dump JSON-RPC bodies", () => {
    const dumped = humanErr('{"jsonrpc":"2.0","error":{"code":-32005,"message":"x"}}');
    expect(dumped).not.toContain("{");
    expect(dumped).toMatch(/mess/i);
  });
});
