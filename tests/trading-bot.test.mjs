import test from 'node:test';
import assert from 'node:assert/strict';
import { rsi } from '../projects/crypto-trading-bot/js/indicators.js';
import { RsiStrategy } from '../projects/crypto-trading-bot/js/strategy.js';
import { PaperPortfolio } from '../projects/crypto-trading-bot/js/portfolio.js';
import { TradingBot } from '../projects/crypto-trading-bot/js/bot.js';
import {
  BinanceMarket, SimulatedMarket, parseRestKline, parseStreamKline,
} from '../projects/crypto-trading-bot/js/market.js';

// Wilder's worked example (as used by StockCharts), with values computed exactly.
const EXAMPLE = [44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28,
  46.00, 46.03, 46.41, 46.22, 45.64, 46.21, 46.25, 45.71, 46.45, 45.78, 45.35, 44.03, 44.18, 44.22, 44.57, 43.42, 42.66, 43.13];
const EXPECTED = [70.46, 66.25, 66.48, 69.35, 66.29, 57.92, 62.88, 63.21, 56.01, 62.34, 54.67, 50.39, 40.02, 41.49,
  41.9, 45.5, 37.32, 33.09, 37.79];

const close = (a, b, tolerance = 0.01) => Math.abs(a - b) <= tolerance;

test('RSI matches the reference values', () => {
  const values = rsi(EXAMPLE, 14);
  assert.equal(values.length, EXAMPLE.length);
  assert.ok(values.slice(0, 14).every((v) => v === null));
  values.slice(14).forEach((v, i) => assert.ok(close(v, EXPECTED[i]), `index ${i + 14}: ${v} vs ${EXPECTED[i]}`));
});

test('RSI edge cases', () => {
  assert.equal(rsi([1, 2, 3], 14).every((v) => v === null), true);
  assert.equal(rsi(Array(20).fill(5), 14)[19], 50);
  assert.equal(rsi(Array.from({ length: 20 }, (_, i) => i), 14)[19], 100);
  assert.equal(rsi(Array.from({ length: 20 }, (_, i) => 20 - i), 14)[19], 0);
});

test('strategy signals on crossings only', () => {
  const s = new RsiStrategy();
  assert.equal(s.signal(35, 29), 'buy');
  assert.equal(s.signal(29, 25), null);
  assert.equal(s.signal(65, 71), 'sell');
  assert.equal(s.signal(75, 72), null);
  assert.equal(s.signal(null, 20), null);
  assert.equal(s.zone(20), 'oversold');
  assert.equal(s.zone(80), 'overbought');
  assert.equal(s.zone(50), 'neutral');
  assert.throws(() => new RsiStrategy({ oversold: 70, overbought: 30 }), RangeError);
});

test('portfolio buys a fraction of cash and sells everything, with fees', () => {
  const p = new PaperPortfolio({ startingCash: 1000, feeRate: 0.001, tradeFraction: 0.5 });
  const buy = p.buy(100, { reason: 'test' });
  assert.equal(buy.side, 'buy');
  assert.equal(buy.reason, 'test');
  assert.ok(close(p.cash, 500));
  assert.ok(close(p.holdings, 4.995, 1e-9)); // 500 minus 0.1% fee, at 100
  const sell = p.sell(120);
  assert.ok(close(sell.value, 599.4));
  assert.ok(close(p.cash, 500 + 599.4 - 0.5994));
  assert.equal(p.holdings, 0);
  assert.ok(close(p.feesPaid, 0.5 + 0.5994));
  assert.ok(close(p.profit(120), p.cash - 1000));
  assert.equal(p.sell(120), null, 'nothing to sell');
  assert.equal(p.trades.length, 2);
  assert.ok(Object.isFrozen(p.trades[0]));
});

test('portfolio refuses orders below the minimum', () => {
  const p = new PaperPortfolio({ startingCash: 30, tradeFraction: 0.25, minimumOrder: 10 });
  assert.equal(p.buy(100), null);
});

test('parses Binance REST and stream candles', () => {
  const row = [1700000000000, '100.5', '101', '99', '100.75', '12.3', 1700000059999, '0', 0, '0', '0', '0'];
  const candle = parseRestKline(row, 1700000060000);
  assert.deepEqual(candle, { openTime: 1700000000000, open: 100.5, high: 101, low: 99, close: 100.75, volume: 12.3, closeTime: 1700000059999, closed: true });
  assert.equal(parseRestKline(row, 1700000030000).closed, false, 'the in-progress candle is not closed');
  const message = { e: 'kline', k: { t: 1, T: 2, o: '1', h: '2', l: '0.5', c: '1.5', v: '3', x: true } };
  assert.deepEqual(parseStreamKline(message), { openTime: 1, open: 1, high: 2, low: 0.5, close: 1.5, volume: 3, closeTime: 2, closed: true });
});

// Builds closed one-minute candles from a list of closing prices.
function candlesFrom(closes, start = 0) {
  return closes.map((price, i) => ({
    openTime: start + i * 60_000, open: price, high: price, low: price, close: price, volume: 0,
    closeTime: start + i * 60_000 + 59_999, closed: true,
  }));
}
const fall = Array.from({ length: 20 }, (_, i) => 100 - i * 0.5 + (i % 2) * 0.3);
const rise = Array.from({ length: 20 }, (_, i) => 90 + i * 0.6 - (i % 2) * 0.3);

test('bot replays history: buys on the fall and sells on the rise', () => {
  const bot = new TradingBot();
  bot.loadHistory(candlesFrom([...Array(15).fill(100).map((p, i) => p + (i % 2)), ...fall, ...rise]));
  const sides = bot.portfolio.trades.map((t) => t.side);
  assert.ok(sides.includes('buy') && sides.includes('sell'), sides.join(','));
  assert.ok(bot.portfolio.trades.every((t) => t.source === 'history' && t.candleTime !== undefined));
  assert.equal(bot.lastSignal.side, 'sell');
});

test('bot updates the live candle and evaluates each closed candle once', () => {
  const bot = new TradingBot();
  const history = candlesFrom([...Array(15).fill(100).map((p, i) => p + (i % 2)), ...rise.slice(0, 5)]);
  bot.loadHistory(history);
  const before = bot.portfolio.trades.length;
  const nextTime = history.at(-1).openTime + 60_000;

  // A falling live candle: updating it repeatedly must not trade until it closes.
  let price = 92;
  for (let i = 0; i < 5; i += 1) {
    assert.equal(bot.update({ openTime: nextTime, open: 100, high: 100, low: price, close: price, closed: false }), null);
    price -= 1;
  }
  assert.equal(bot.candles.length, history.length + 1, 'the live candle is updated in place');
  const trade = bot.update({ openTime: nextTime, open: 100, high: 100, low: 80, close: 80, closed: true });
  assert.equal(trade?.side, 'buy');
  assert.equal(trade.source, 'live');
  assert.equal(bot.update({ openTime: nextTime, open: 100, high: 100, low: 80, close: 80, closed: true }), null, 'a repeated close is ignored');
  assert.equal(bot.update({ openTime: history[0].openTime, close: 1, closed: true }), null, 'out-of-date candles are ignored');
  assert.equal(bot.portfolio.trades.length, before + 1);
});

test('auto-trading off records the signal without trading; manual orders work', () => {
  const bot = new TradingBot();
  const history = candlesFrom([...Array(15).fill(100).map((p, i) => p + (i % 2)), ...rise.slice(0, 5)]);
  bot.loadHistory(history);
  bot.autoTrade = false;
  const count = bot.portfolio.trades.length;
  const trade = bot.update({ openTime: history.at(-1).openTime + 60_000, close: 70, closed: true });
  assert.equal(trade, null);
  assert.equal(bot.lastSignal.side, 'buy');
  assert.equal(bot.lastSignal.traded, false);
  assert.equal(bot.portfolio.trades.length, count);
  assert.equal(bot.manualTrade('buy').reason, 'Manual order');
  assert.equal(bot.manualTrade('sell').side, 'sell');
});

test('simulated market produces history and live candles', async () => {
  const market = new SimulatedMarket('ETHUSDT', { candleMs: 40, tickMs: 10 });
  const history = await market.loadHistory();
  assert.equal(history.length, 300);
  assert.ok(history.every((c, i) => c.close > 0 && c.high >= c.low && (i === 0 || c.openTime > history[i - 1].openTime)));
  const received = [];
  const statuses = [];
  market.connect({ lastOpenTime: history.at(-1).openTime, onStatus: (s) => statuses.push(s), onCandle: (c) => received.push(c) });
  await new Promise((resolve) => setTimeout(resolve, 130));
  market.close();
  assert.deepEqual(statuses, ['simulated']);
  assert.ok(received.some((c) => c.closed), 'at least one candle closed');
  assert.ok(received[0].openTime > history.at(-1).openTime);
});

test('Binance market falls back to the second host and parses history', async () => {
  const urls = [];
  const rows = Array.from({ length: 40 }, (_, i) => [i * 60_000, '1', '1', '1', String(100 + i), '0', i * 60_000 + 59_999]);
  const fetchImpl = async (url) => {
    urls.push(url);
    if (urls.length === 1) return { ok: false, status: 451 };
    return { ok: true, json: async () => rows };
  };
  const market = new BinanceMarket('BTCUSDT', { fetchImpl });
  const candles = await market.loadHistory();
  assert.equal(candles.length, 40);
  assert.match(urls[0], /^https:\/\/data-api\.binance\.vision\/api\/v3\/klines\?symbol=BTCUSDT&interval=1m&limit=300$/);
  assert.match(urls[1], /^https:\/\/api\.binance\.com\//);

  const failing = new BinanceMarket('BTCUSDT', { fetchImpl: async () => { throw new TypeError('Failed to fetch'); } });
  await assert.rejects(failing.loadHistory(), /Could not load Binance market data/);
});

class FakeSocket {
  static instances = [];
  constructor(url) { this.url = url; FakeSocket.instances.push(this); }
  close() {}
  emit(data) { this.onmessage?.({ data: JSON.stringify(data) }); }
  drop() { this.onclose?.(); }
}

test('Binance stream reports live data and gives up if it never connects', async () => {
  FakeSocket.instances = [];
  const statuses = [];
  const candles = [];
  const market = new BinanceMarket('SOLUSDT', { WebSocketImpl: FakeSocket, retryDelay: () => 0 });
  market.connect({ onStatus: (s) => statuses.push(s), onCandle: (c) => candles.push(c) });
  assert.equal(FakeSocket.instances[0].url, 'wss://data-stream.binance.vision/ws/solusdt@kline_1m');
  FakeSocket.instances[0].emit({ e: 'kline', k: { t: 1, T: 2, o: '1', h: '1', l: '1', c: '1', v: '0', x: false } });
  FakeSocket.instances[0].emit({ e: 'something-else' });
  assert.equal(candles.length, 1);
  assert.deepEqual(statuses, ['connecting', 'live']);
  market.close();

  FakeSocket.instances = [];
  const statuses2 = [];
  const failing = new BinanceMarket('SOLUSDT', { WebSocketImpl: FakeSocket, retryDelay: () => 0 });
  failing.connect({ onStatus: (s) => statuses2.push(s), onCandle: () => {} });
  for (let i = 0; i < 4; i += 1) {
    FakeSocket.instances.at(-1).drop();
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  assert.equal(statuses2.at(-1), 'failed');
  assert.match(FakeSocket.instances[1].url, /^wss:\/\/stream\.binance\.com:9443\//, 'alternates hosts');
  failing.close();
});
