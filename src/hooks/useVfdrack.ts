import { useCallback, useRef, useState } from "react";
import { TimeRing } from "../buffer/ring";
import { sampleToTubes } from "../mapping/math";
import { ChainPoller, DEFAULT_RPC, RPC_CANDIDATES } from "../solana/poller";
import type { ChainSample, ChannelId, MuteState, PollHealth, TubeParams } from "../types";

const HISTORY_MS = 45_000;

export function useVfdrack() {
  const pollerRef = useRef<ChainPoller | null>(null);
  const ringRef = useRef(new TimeRing<ChainSample>(HISTORY_MS));

  const [powered, setPowered] = useState(false);
  const [health, setHealth] = useState<PollHealth>("idle");
  const [note, setNote] = useState("click POWER / ARM — tubes stay dark until then");
  const [sample, setSample] = useState<ChainSample | null>(null);
  const [params, setParams] = useState<TubeParams | null>(null);
  const [history, setHistory] = useState<ChainSample[]>([]);
  const [mutes, setMutes] = useState<MuteState>({ fee: false, load: false, slot: false });
  const [rpcHost, setRpcHost] = useState(() => {
    try {
      return new URL(DEFAULT_RPC).host;
    } catch {
      return DEFAULT_RPC;
    }
  });

  const applyLive = useCallback((next: ChainSample) => {
    setSample(next);
    setParams(sampleToTubes(next));
  }, []);

  const powerOn = useCallback(() => {
    if (pollerRef.current) return;
    const poller = new ChainPoller(RPC_CANDIDATES, {
      onSample: (next) => {
        setRpcHost(poller.rpcHost());
        setHistory(ringRef.current.push(next));
        applyLive(next);
      },
      onHealth: (h, text) => {
        setHealth(h);
        setNote(text);
        setRpcHost(poller.rpcHost());
      },
    });
    pollerRef.current = poller;
    poller.start();
    setPowered(true);
    setNote("filaments warming…");
  }, [applyLive]);

  const powerOff = useCallback(() => {
    pollerRef.current?.stop();
    pollerRef.current = null;
    ringRef.current = new TimeRing<ChainSample>(HISTORY_MS);
    setPowered(false);
    setHealth("idle");
    setNote("click POWER / ARM — tubes stay dark until then");
    setSample(null);
    setParams(null);
    setHistory([]);
  }, []);

  const togglePower = useCallback(() => {
    if (powered) powerOff();
    else powerOn();
  }, [powerOff, powerOn, powered]);

  const toggleMute = useCallback((id: ChannelId) => {
    setMutes((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return {
    powered,
    health,
    note,
    sample,
    params,
    history,
    mutes,
    rpcHost,
    togglePower,
    toggleMute,
  };
}
