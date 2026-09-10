import type { ReactNode } from "react";
import { AmplitudeBars, Bargraph } from "./components/Bargraph";
import { Needle } from "./components/Needle";
import { Screws } from "./components/Screws";
import { SevenSeg } from "./components/SevenSeg";
import { StripChart } from "./components/StripChart";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { useVfdrack } from "./hooks/useVfdrack";
import { formatDigits, meterNorm } from "./mapping/math";
import type { ChannelId } from "./types";
import "./App.css";

const CHANNELS: { id: ChannelId; tag: string; legend: string }[] = [
  { id: "fee", tag: "CH-A", legend: "prioritization · busy programs" },
  { id: "load", tag: "CH-B", legend: "non-vote tps · tx / slot" },
  { id: "slot", tag: "CH-C", legend: "slot Δ · poll lag" },
];

export default function App() {
  const rack = useVfdrack();
  const reduced = usePrefersReducedMotion();
  const live = Boolean(rack.powered && rack.sample && rack.params);
  const flicker =
    live &&
    !reduced &&
    !rack.mutes.slot &&
    ((rack.params?.lagNorm ?? 0) > 0.35 || (rack.params?.stall ?? 0) > 0);
  const spanSec =
    rack.history.length >= 2
      ? Math.round((rack.history[rack.history.length - 1].t - rack.history[0].t) / 1000)
      : 0;

  return (
    <div className={`bench ${rack.powered ? "powered" : "dark"} ${flicker ? "mains-flicker" : ""}`}>
      <div className="rack">
        <Screws />
        <header className="nameplate">
          <div className="plate-left">
            <p className="kicker">lab bench · mainnet-beta</p>
            <h1>VFDRACK</h1>
          </div>
          <p className="plate-serial">
            SN VFD-2609 · companion to Hearslot (visual bench)
            <br />
            no wallet · no trade · tubes only
          </p>
        </header>

        <aside className="power-bay">
          <Screws />
          <p className="mod-tag">PWR</p>
          <button
            type="button"
            className={`rocker ${rack.powered ? "on" : ""}`}
            onClick={rack.togglePower}
          >
            <span className="rocker-face">
              <span className={`led ${rack.powered ? "on" : ""}`} />
              <span className="rocker-label">
                {rack.powered ? "POWERED" : "POWER / ARM"}
              </span>
            </span>
          </button>
          <dl className="lamps">
            <Lamp k="PWR" on={rack.powered} />
            <Lamp k="RPC" on={rack.health === "ok" || rack.health === "listening"} warn={rack.health === "waiting" || rack.health === "error"} />
            <Lamp k="LAG" on={live && (rack.params?.lagNorm ?? 0) > 0.28} warn />
          </dl>
          <p className={`status-copy ${rack.health}`}>{rack.note}</p>
        </aside>

        <Module
          id="fee"
          title="FEE"
          unit="µL / CU  p90"
          muted={rack.mutes.fee}
          onMute={() => rack.toggleMute("fee")}
        >
          <div className="tube-glass">
            <SevenSeg
              value={formatDigits(rack.sample?.feeP90 ?? 0, 6)}
              lit={live && !rack.mutes.fee}
              size="lg"
            />
            <div className="fee-aux">
              <Needle value={meterNorm(rack.params?.feeNorm ?? 0, 1.15)} lit={live && !rack.mutes.fee} />
              <Bargraph value={meterNorm(rack.params?.feeNorm ?? 0, 1.15)} lit={live && !rack.mutes.fee} count={18} />
            </div>
          </div>
          <p className="read-line">
            press {live ? `${Math.round((rack.params?.feeNorm ?? 0) * 100)}` : "—"} ·
            busy {(rack.sample?.feePressure ?? 0).toFixed(2)}
          </p>
        </Module>

        <Module
          id="load"
          title="LOAD"
          unit="non-vote · tps"
          muted={rack.mutes.load}
          onMute={() => rack.toggleMute("load")}
        >
          <div className="tube-glass load-glass">
            <AmplitudeBars
              value={meterNorm(rack.params?.loadNorm ?? 0)}
              lit={live && !rack.mutes.load}
              columns={8}
              rows={10}
            />
            <div className="load-digits">
              <SevenSeg
                value={formatDigits(rack.sample?.tps ?? 0, 5)}
                lit={live && !rack.mutes.load}
                size="sm"
              />
              <span className="unit-chip">TPS</span>
              <SevenSeg
                value={formatDigits(rack.sample?.txPerSlot ?? 0, 4)}
                lit={live && !rack.mutes.load}
                size="sm"
              />
              <span className="unit-chip">TX/Δ</span>
            </div>
          </div>
        </Module>

        <Module
          id="slot"
          title="SLOT"
          unit="confirmed"
          muted={rack.mutes.slot}
          onMute={() => rack.toggleMute("slot")}
        >
          <div className={`tube-glass ${flicker && !rack.mutes.slot ? "lag-glass" : ""}`}>
            <SevenSeg
              value={formatDigits(rack.sample?.slot ?? 0, 10)}
              lit={live && !rack.mutes.slot}
              size="md"
            />
            <div className="slot-row">
              <Pulse
                rate={rack.params?.pulseNorm ?? 0}
                on={live && !rack.mutes.slot && (rack.sample?.slotDelta ?? 0) > 0}
                reduced={reduced}
              />
              <div className="lag-stack">
                <span className="unit-chip">LAG ms</span>
                <Bargraph
                  value={meterNorm(rack.params?.lagNorm ?? 0, 1.4)}
                  lit={live && !rack.mutes.slot}
                  count={14}
                />
                <span className="lag-read">
                  {live ? `${Math.round(rack.sample?.lagMs ?? 0)}` : "—"}
                </span>
              </div>
            </div>
          </div>
          <p className="read-line">
            Δ {live ? rack.sample?.slotDelta : "—"} ·
            {live ? ` ${rack.sample?.slotsPerSec.toFixed(2)} /s` : " — /s"}
          </p>
        </Module>

        <section className="chart-well">
          <Screws />
          <div className="well-head">
            <span>STRIP · mapped params</span>
            <span>{rack.powered ? (spanSec ? `−${spanSec}s` : "warming") : "dark"}</span>
          </div>
          <div className="strip-frame">
            <StripChart history={rack.history} mutes={rack.mutes} powered={rack.powered} />
            {!rack.powered && <div className="strip-empty">power the rack to roll the strip</div>}
          </div>
          <ul className="legend">
            <li className="fee">FEE</li>
            <li className="load">LOAD</li>
            <li className="slot">SLOT lag</li>
          </ul>
        </section>

        <footer className="footplate">
          <p>
            rpc {rack.rpcHost} · official mainnet-beta 403s browsers · PublicNode or{" "}
            <code>VITE_RPC_URL</code>
          </p>
          <p className="fine">
            {CHANNELS.map((c) => `${c.tag} ${c.legend}`).join("  ·  ")}
          </p>
        </footer>
      </div>
    </div>
  );
}

function Module({
  id,
  title,
  unit,
  muted,
  onMute,
  children,
}: {
  id: ChannelId;
  title: string;
  unit: string;
  muted: boolean;
  onMute: () => void;
  children: ReactNode;
}) {
  return (
    <section className={`module ${id} ${muted ? "blanked" : ""}`}>
      <Screws />
      <header className="mod-head">
        <div>
          <p className="mod-tag">{CHANNELS.find((c) => c.id === id)?.tag}</p>
          <h2>{title}</h2>
          <p className="mod-unit">{unit}</p>
        </div>
        <button type="button" className={`blank ${muted ? "on" : ""}`} onClick={onMute}>
          {muted ? "BLANKED" : "BLANK"}
        </button>
      </header>
      {children}
    </section>
  );
}

function Lamp({ k, on, warn }: { k: string; on: boolean; warn?: boolean }) {
  return (
    <div className={`lamp ${on ? "on" : ""} ${warn ? "warn" : ""}`}>
      <i />
      <span>{k}</span>
    </div>
  );
}

function Pulse({ rate, on, reduced }: { rate: number; on: boolean; reduced: boolean }) {
  const period = reduced || !on ? 0 : Math.max(0.18, 1.15 - rate * 0.85);
  return (
    <div className={`pulse ${on ? "on" : ""}`}>
      <i style={period ? { animationDuration: `${period}s` } : undefined} />
      <span>PULSE</span>
    </div>
  );
}
