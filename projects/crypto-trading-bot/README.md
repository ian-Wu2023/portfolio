# Real-Time Crypto Trading Bot

A JavaScript app that streams live Binance market data over WebSockets,
computes RSI-based buy/sell signals and paper-trades them, with a price chart,
holdings and trade history.

**Live demo:** https://ianwu.co.uk/projects/crypto-trading-bot/

> **Paper trading only.** It reads Binance's public market data and trades a
> simulated $10,000 balance. No account or API key is needed, no real orders are
> placed, and nothing here is financial advice.

## How it works

1. **History:** on load, the last 300 one-minute candles come from Binance's
   REST API (`/api/v3/klines`), and the bot replays its strategy over them so
   there are trades to look at straight away.
2. **Live data:** new candles stream over a WebSocket
   (`<symbol>@kline_1m`). The chart and figures update on every message; the
   strategy only acts when a candle closes, so a signal never disappears after
   it has been traded.
3. **Strategy:** RSI(14) with Wilder's smoothing. Buy when RSI falls below 30
   (spending 25% of the cash); sell the whole position when it rises above 70.
   A 0.1% fee is charged on each trade.

If Binance can't be reached (offline, or blocked in the visitor's region), the
page switches to a clearly labelled simulated market with the same interface,
compressing each one-minute candle into two seconds.

## Code

| File | Contents |
| --- | --- |
| `js/indicators.js` | `rsi(closes, period)` |
| `js/strategy.js` | `RsiStrategy`: crossing signals and RSI zones |
| `js/portfolio.js` | `PaperPortfolio`: cash, holdings, fees and trade log, in private fields |
| `js/bot.js` | `TradingBot`: candles, RSI, history replay, live updates and manual orders |
| `js/market.js` | `BinanceMarket` (REST + WebSocket, reconnects with back-off, falls back between Binance hosts) and `SimulatedMarket` |
| `js/chart.js` | `MarketChart`: price and RSI on a canvas, with trade markers and a hover tooltip |
| `js/app.js` | Connects everything to the page |

The trading logic has no DOM code, so it is unit-tested in Node:
`tests/trading-bot.test.mjs` at the repository root (`npm test`). The tests
check RSI against reference values, portfolio maths and fees, signal handling,
history replay, live candle updates, and the market classes using fake
`fetch` and `WebSocket` implementations.

## Run locally

From the repository root, run `python -m http.server 8000` and open
http://localhost:8000/projects/crypto-trading-bot/. The page uses ES modules,
so it must be served over HTTP rather than opened as a file.
