import { litSegments } from "../mapping/math";

type Props = {
  value: number;
  lit: boolean;
  count?: number;
  vertical?: boolean;
  warnFrom?: number;
};

export function Bargraph({
  value,
  lit,
  count = 16,
  vertical = false,
  warnFrom = 0.82,
}: Props) {
  const n = lit ? litSegments(value, count) : 0;
  const warnAt = Math.floor(count * warnFrom);
  return (
    <div className={`bargraph ${vertical ? "vert" : "horiz"}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const idx = vertical ? count - 1 - i : i;
        const on = idx < n;
        const warn = idx >= warnAt;
        return <i key={idx} className={`cell ${on ? "on" : ""} ${warn ? "warn" : ""}`} />;
      })}
    </div>
  );
}

type AmpProps = {
  value: number;
  lit: boolean;
  columns?: number;
  rows?: number;
};

/** Classic VFD amplitude stack — envelope plus a slight column stagger. */
export function AmplitudeBars({ value, lit, columns = 10, rows = 14 }: AmpProps) {
  return (
    <div className="amp-bars" aria-hidden="true">
      {Array.from({ length: columns }, (_, col) => {
        const stagger = 1 - Math.abs(col - (columns - 1) * 0.42) / columns;
        const colVal = lit ? value * (0.55 + 0.45 * stagger) : 0;
        return (
          <Bargraph
            key={col}
            value={colVal}
            lit={lit}
            count={rows}
            vertical
            warnFrom={0.78}
          />
        );
      })}
    </div>
  );
}
