function rawErr(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export function isRateLimited(err: unknown): boolean {
  const text = rawErr(err).toLowerCase();
  return text.includes("429") || text.includes("too many") || text.includes("rate limit");
}

export function isForbidden(err: unknown): boolean {
  const text = rawErr(err).toLowerCase();
  return text.includes("403") || text.includes("access forbidden") || text.includes("forbidden");
}

/** Bench copy, never a JSON dump. */
export function humanErr(err: unknown): string {
  const text = rawErr(err);
  const lower = text.toLowerCase();
  if (isForbidden(err)) return "this rpc blocked the browser origin";
  if (isRateLimited(err)) return "rpc asked us to sit still";
  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network request failed")
  ) {
    return "could not reach rpc — check the bench connection";
  }
  if (text.trim().startsWith("{") || lower.includes('"jsonrpc"') || lower.includes("jsonrpc")) {
    return "rpc answered with a mess instead of a slot";
  }
  return text.replace(/\s+/g, " ").slice(0, 140);
}
