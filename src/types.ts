export type ChannelId = "fee" | "load" | "slot";

export type MuteState = Record<ChannelId, boolean>;

export type PollHealth = "idle" | "listening" | "ok" | "waiting" | "error";

export type ChainSample = {
  t: number;
  slot: number;
  slotDelta: number;
  lagMs: number;
  slotsPerSec: number;
  tps: number;
  txPerSlot: number;
  feeP90: number;
  feePressure: number;
};

export type TubeParams = {
  feeNorm: number;
  loadNorm: number;
  pulseNorm: number;
  lagNorm: number;
  stall: number;
};
