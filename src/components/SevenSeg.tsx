const MASK: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abged",
  "3": "abcdg",
  "4": "fgbc",
  "5": "afgcd",
  "6": "afgcde",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
  "-": "g",
  " ": "",
  ".": "",
};

const SEGS = ["a", "b", "c", "d", "e", "f", "g"] as const;

type Props = {
  value: string;
  lit: boolean;
  size?: "lg" | "md" | "sm";
};

export function SevenSeg({ value, lit, size = "md" }: Props) {
  const chars = value.split("");
  return (
    <div className={`seg-row ${size}`} aria-hidden="true">
      {chars.map((ch, i) => {
        if (ch === ".") {
          return <span key={`${ch}-${i}`} className={`seg-dot ${lit ? "on" : ""}`} />;
        }
        const on = MASK[ch] ?? "";
        return (
          <span key={`${ch}-${i}`} className="digit">
            {SEGS.map((seg) => (
              <i
                key={seg}
                className={`s ${seg} ${lit && on.includes(seg) ? "on" : ""}`}
              />
            ))}
          </span>
        );
      })}
    </div>
  );
}
