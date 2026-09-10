import { clamp, lerp } from "../mapping/math";

type Props = {
  value: number;
  lit: boolean;
};

export function Needle({ value, lit }: Props) {
  const t = lit ? clamp(value, 0, 1) : 0;
  const angle = lerp(-48, 48, t);
  return (
    <div className={`needle-meter ${lit ? "lit" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 120 72">
        <path
          className="arc-ghost"
          d="M16 62 A44 44 0 0 1 104 62"
          fill="none"
        />
        <path
          className="arc-lit"
          d="M16 62 A44 44 0 0 1 104 62"
          fill="none"
          pathLength={100}
          strokeDasharray={`${t * 100} 100`}
        />
        <line
          className="needle"
          x1="60"
          y1="62"
          x2="60"
          y2="22"
          transform={`rotate(${angle} 60 62)`}
        />
        <circle className="hub" cx="60" cy="62" r="3.5" />
      </svg>
      <div className="needle-ticks">
        <span>0</span>
        <span>FEE</span>
        <span>HOT</span>
      </div>
    </div>
  );
}
