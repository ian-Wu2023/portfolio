import { rsi } from './indicators.js';
import { PaperPortfolio } from './portfolio.js';
import { RsiStrategy } from './strategy.js';

/**
 * The trading logic, independent of the page: keeps the candles, works out
 * RSI, turns signals into paper trades and replays recent history on start.
 */
export class TradingBot {
  constructor({ strategy = new RsiStrategy(), portfolioOptions = {}, maxCandles = 500 } = {}) {
    this.strategy = strategy;
    this.portfolioOptions = portfolioOptions;
    this.maxCandles = maxCandles;
    this.autoTrade = true;
    this.candles = [];
    this.rsi = [];
    this.lastSignal = null;
    this.portfolio = new PaperPortfolio(portfolioOptions);
    this.lastEvaluated = null;
  }

  /** Load recent candles, then replay the strategy over the closed ones. */
  loadHistory(candles) {
    this.candles = candles.slice(-this.maxCandles);
    this.#recalculate();
    this.reset();
  }

  /** Start a fresh portfolio and replay the strategy over the loaded history. */
  reset() {
    this.portfolio = new PaperPortfolio(this.portfolioOptions);
    this.lastSignal = null;
    this.lastEvaluated = null;
    for (let i = 1; i < this.candles.length; i += 1) {
      if (!this.candles[i].closed) break;
      this.#evaluate(i, 'history');
    }
  }

  /**
   * Add or update a candle from the live feed. Returns the trade made on a
   * candle close, if any.
   */
  update(candle) {
    const last = this.candles[this.candles.length - 1];
    if (last && candle.openTime === last.openTime) {
      this.candles[this.candles.length - 1] = candle;
    } else if (!last || candle.openTime > last.openTime) {
      this.candles.push(candle);
      if (this.candles.length > this.maxCandles) this.candles.shift();
    } else {
      return null; // an out-of-date message
    }
    this.#recalculate();
    if (candle.closed && candle.openTime !== this.lastEvaluated) {
      return this.#evaluate(this.candles.length - 1, 'live');
    }
    return null;
  }

  /** A manual buy or sell at the latest price. */
  manualTrade(side) {
    const candle = this.candles[this.candles.length - 1];
    if (!candle) return null;
    const details = { time: Date.now(), candleTime: candle.openTime, reason: 'Manual order', source: 'manual' };
    return side === 'buy' ? this.portfolio.buy(candle.close, details) : this.portfolio.sell(candle.close, details);
  }

  get lastPrice() {
    return this.candles[this.candles.length - 1]?.close ?? null;
  }

  get lastRsi() {
    return this.rsi[this.rsi.length - 1] ?? null;
  }

  #recalculate() {
    this.rsi = rsi(this.candles.map((c) => c.close), this.strategy.period);
  }

  #evaluate(index, source) {
    const candle = this.candles[index];
    this.lastEvaluated = candle.openTime;
    const current = this.rsi[index];
    const signal = this.strategy.signal(this.rsi[index - 1], current);
    if (!signal) return null;

    const reason = signal === 'buy'
      ? `RSI ${current.toFixed(1)} fell below ${this.strategy.oversold}`
      : `RSI ${current.toFixed(1)} rose above ${this.strategy.overbought}`;
    this.lastSignal = { side: signal, time: candle.closeTime, reason, traded: false };
    if (!this.autoTrade && source === 'live') return null;

    const details = { time: candle.closeTime, candleTime: candle.openTime, reason, source };
    const trade = signal === 'buy' ? this.portfolio.buy(candle.close, details) : this.portfolio.sell(candle.close, details);
    this.lastSignal.traded = Boolean(trade);
    return trade;
  }
}
