# Bit Monk Signal — MCP Servers

Market-timing **bottom/top signal** MCP servers for AI agents. Ten independent remote servers, one per market.

Each server answers one question: **is this asset at a bottom or a top right now?** — returning a verdict
(`strong_buy` · `buy` · `neutral` · `sell` · `strong_sell`) and a **-100..+100 score**, aggregated from a
locked technical-indicator engine across weekly and monthly timeframes, plus market-wide bottom/top rankings.

> Published on the official [MCP Registry](https://registry.modelcontextprotocol.io) under the `com.airblockfz/*` namespace.

## Servers

| Market | Endpoint (Streamable HTTP) | Universe | Sample symbol |
|---|---|---|---|
| **Crypto** | `https://coin-signal.airblock2026.workers.dev/mcp` | BTC-USD, ETH-USD, SOL-USD … (197 coins) | `BTC-USD` |
| **US stocks** | `https://stock-signal-us.airblock2026.workers.dev/mcp` | NVDA, AAPL, ^IXIC, QQQ … (S&P500 + indexes/ETFs, 535) | `NVDA` |
| **Korea stocks** | `https://stock-signal-kr.airblock2026.workers.dev/mcp` | 005930.KS, ^KS11 … (KOSPI/KOSDAQ, 103) | `005930.KS` |
| **China stocks** | `https://china-signal.airblock2026.workers.dev/mcp` | 600519.SS, 000001.SZ … (Shanghai/Shenzhen A-shares + indexes, 24) | `600519.SS` |
| **Hong Kong stocks** | `https://hk-signal.airblock2026.workers.dev/mcp` | 0700.HK, ^HSI … (HSI + H-shares, 22) | `0700.HK` |
| **Commodities** | `https://commodity-signal.airblock2026.workers.dev/mcp` | GC=F gold, CL=F oil, HG=F copper, ZC=F corn … (28 futures) | `GC=F` |
| **Foreign exchange** | `https://fx-signal.airblock2026.workers.dev/mcp` | EURUSD=X, USDKRW=X, JPYKRW=X … (48 pairs) | `EURUSD=X` |
| **Inflation & liquidity** | `https://inflation-signal.airblock2026.workers.dev/mcp` | US-CPI, US-PCE, US-FED, KR-CPI … (47 official series) | `US-CPI` |
| **Seoul apartments** | `https://seoul-apt-signal.airblock2026.workers.dev/mcp` | Gangnam, Nowon, Mapo … (25 districts) | `Gangnam` |
| **Dubai property** | `https://dubai-property-signal.airblock2026.workers.dev/mcp` | downtown, marina, palm … (42 areas) | `downtown` |

## Tools

| Tool | Cost | Description |
|---|---|---|
| `pitch` | **free** | Start here. Introduces the indicator lineup, value, a live sample and subscription terms. |
| `evaluate_symbol` | paid | Bottom/top verdict + score for one symbol, with daily/weekly/monthly breakdown. |
| `scan_bottoms` | paid | Rank the market — what is at a bottom right now. |
| `scan_tops` | paid | Rank the market — what is overheated right now. |
| `subscribe` | **free** | Subscription terms and sign-up. Present on the crypto, commodity and Seoul-apartment servers only. |
| `rate` | **free** | Leave feedback (score 1-10 + pros/cons) after acting on a signal. |

Every server exposes `pitch`, `evaluate_symbol`, `scan_bottoms`, `scan_tops` and `rate`.

## Payment

Signal calls are **pay-per-call via [x402](https://web3.okx.com)** — **0.01 USDT** on X Layer (chain `eip155:196`).
An unpaid call returns `402` with a `PAYMENT-REQUIRED` challenge; retry with the `PAYMENT-SIGNATURE` header.
`pitch` and `rate` are always free, so an agent can evaluate the service before paying anything.

## Quick start

Add to your MCP client config (example — Claude Desktop / Cursor):

```json
{
  "mcpServers": {
    "bit-monk-coin": {
      "type": "http",
      "url": "https://coin-signal.airblock2026.workers.dev/mcp"
    }
  }
}
```

All ten at once: [`docs/client-config.json`](docs/client-config.json). Machine-readable catalog: [`servers.json`](servers.json).

Then call the free `pitch` tool first. Health check for any server: `GET /health`.

### stdio clients

For clients that only speak stdio, this repository ships a dependency-free proxy that forwards
JSON-RPC to the remote endpoint:

```json
{
  "mcpServers": {
    "bit-monk-coin": {
      "command": "npx",
      "args": ["-y", "github:airblock2026/bit-monk-signal-mcp"],
      "env": { "BIT_MONK_MARKET": "coin" }
    }
  }
}
```

`BIT_MONK_MARKET` selects the market — `coin` (default), `us`, `kr`, `cn`, `hk`, `commodity`, `fx`,
`inflation`, `seoul`, `dubai`. `BIT_MONK_URL` overrides the endpoint outright. Requires Node 18+;
a [`Dockerfile`](Dockerfile) is included for sandboxed runs.

## Data sources

Each market is powered by the same engine that ships in our flagship apps, fed by market-appropriate data:
official exchange feeds (crypto), Yahoo Finance (stocks, commodities, FX), FRED/OECD/IMF/Eurostat and the
Federal Reserve H.4.1/H.15 releases (inflation & liquidity), the Korean Ministry of Land actual-transaction
records (Seoul apartments), and DLD/Bayut published indexes (Dubai property).

## Links

- Website: [airblockfz.com](https://airblockfz.com)
- Registry: `com.airblockfz/coin-signal` … [search the MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=com.airblockfz)
- Also listed on OKX Onchain OS as ERC-8004 agents (`Bit Monk` #3894 and siblings)

## Disclaimer

Informational indicator output — **not financial, investment or real-estate advice**. Historical statistics do
not guarantee future results. Real-estate series include modeled interpolation where official data is monthly
or quarterly; this is disclosed in each response.

## About

Built by **Air Block FZ** (Meydan, Dubai). The signal engine itself is proprietary and not published here —
this repository documents the public MCP endpoints and their contracts, and ships the stdio proxy that
reaches them.

## License

[MIT](LICENSE) — covers the contents of this repository: the stdio proxy (`src/proxy.js`) and the
documentation. It does **not** grant any rights to the signal engine, indicator implementations or data
pipelines behind the endpoints, which are proprietary and are not distributed here. Use of the endpoints
themselves is subject to their pay-per-call terms (see [Payment](#payment)).
