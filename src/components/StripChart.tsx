import { useEffect, useRef } from "react";
import { sampleToTubes } from "../mapping/math";
import type { ChainSample, MuteState } from "../types";

type Props = {
  history: ChainSample[];
  mutes: MuteState;
  powered: boolean;
};

export function StripChart({ history, mutes, powered }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#050807";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(111,255,224,0.08)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i += 1) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (!powered || history.length < 2) return;

    const start = history[0].t;
    const end = history[history.length - 1].t;
    const span = Math.max(1, end - start);

    const traces: Array<{ key: keyof MuteState; color: string; pick: (s: ChainSample) => number }> = [
      { key: "fee", color: "#6fffe0", pick: (s) => sampleToTubes(s).feeNorm },
      { key: "load", color: "#9dff8a", pick: (s) => sampleToTubes(s).loadNorm },
      { key: "slot", color: "#e8b44a", pick: (s) => sampleToTubes(s).lagNorm },
    ];

    for (const trace of traces) {
      if (mutes[trace.key]) continue;
      ctx.beginPath();
      ctx.strokeStyle = trace.color;
      ctx.lineWidth = 1.4;
      ctx.shadowColor = trace.color;
      ctx.shadowBlur = 6;
      history.forEach((sample, i) => {
        const x = ((sample.t - start) / span) * width;
        const y = height - 4 - trace.pick(sample) * (height - 8);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }, [history, mutes, powered]);

  return <canvas ref={canvasRef} className="strip-canvas" />;
}
