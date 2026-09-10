# vfdrack

Live Solana mainnet as a vacuum-fluorescent instrument rack. Companion spirit to [Hearslot](https://robertkodes.github.io/hearslot/) (audio). This one is visual tubes.

Click **POWER / ARM** first. The chassis stays dark until that gesture. After that it polls public RPC and drives three VFD channels.

Live: https://robertkodes.github.io/vfdrack/

Not an explorer. No wallet. No seeds. No trading.

## Channels

- **FEE** — recent prioritization fees on busy programs (system, token, compute budget, USDC, Jupiter, Raydium). 7-segment µL/CU + needle / bar brightness.
- **LOAD** — non-vote TPS and tx/slot from `getRecentPerformanceSamples`. Amplitude bars. Public RPC will not cheaply give a per-slot CU total, so load is the stand-in.
- **SLOT** — `getSlot` deltas + poll lag. Pulse lamp, lag bar, and a soft 60 Hz flicker when the poll is late.

A ~45s strip under the meters plots the three mapped params. **BLANK** a channel to mute that tube.

## Design tokens

Late-lab bench. Warm VFD phosphor on charcoal chassis. Worn silk-screen, not a dashboard.

| Token | Hex | Role |
| --- | --- | --- |
| chassis | `#141614` | charcoal rack plate |
| bezel | `#2c302e` | module edges / recessed wells |
| chrome | `#8a908c` | screw heads, hubs |
| phosphor | `#6fffe0` | lit VFD segments, bloom |
| warn | `#e8b44a` | lag / fault amber |
| silk | `#b7b09a` | etched legends |

Type: **Antonio** for stamped labels and the nameplate. **Share Tech Mono** for bench copy and status. Digits are drawn 7-segment, not a webfont.

## Run it

```bash
npm i
npm run dev
```

Open the `/vfdrack/` path Vite prints (`base` is set for GitHub Pages).

```bash
npm run build
npm run preview
npm test
```

## RPC

Default is `https://solana-rpc.publicnode.com`. Official `api.mainnet-beta.solana.com` 403s browser Origins (this Pages site, localhost), so the rack starts on PublicNode and hops if an endpoint blocks us. It also backs off on 429s. Errors are bench English, not JSON dumps.

If you have a free Helius / Triton / etc URL:

```bash
cp .env.example .env
# edit VITE_RPC_URL
```

## Pages

`vite.config.ts` has `base: '/vfdrack/'`. The `gh-pages` branch is the built `dist/` plus `.nojekyll`.

Repo Settings → Pages → Deploy from branch → `gh-pages` / root.

If that radio is already set, a push to `gh-pages` is enough.

## Smoke

1. Load the site. Tubes are dark. Power LED is off.
2. Click **POWER / ARM**. Filaments come up; FEE digits / LOAD bars / SLOT number move with live mainnet.
3. **BLANK** a channel — that tube goes ghost. Others keep moving.
4. Wait through a few polls. The strip traces three params. Slot lag high → soft 60 Hz flicker (unless `prefers-reduced-motion`).
5. If an RPC 403/429s, the status line speaks English and hops / waits. No JSON on the panel.
