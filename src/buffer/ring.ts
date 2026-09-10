export class TimeRing<T extends { t: number }> {
  private items: T[] = [];

  constructor(private readonly windowMs: number) {}

  push(item: T): T[] {
    this.items.push(item);
    const cutoff = item.t - this.windowMs;
    while (this.items.length > 0 && this.items[0].t < cutoff) {
      this.items.shift();
    }
    return this.snapshot();
  }

  snapshot(): T[] {
    return this.items.slice();
  }

  span(): { start: number; end: number } | null {
    if (this.items.length === 0) return null;
    return { start: this.items[0].t, end: this.items[this.items.length - 1].t };
  }
}
