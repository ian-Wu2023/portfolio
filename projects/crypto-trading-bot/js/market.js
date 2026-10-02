/**
 * Market data sources. Both classes have the same interface, so the app can
 * switch between them:
 *   await market.loadHistory()  -> recent candles
 *   market.connect({ onCandle, onStatus })
 *   market.close()
 */

export const SYMBOLS = {
  BTCUSDT: { label: 'BTC/USDT', base: 'BTC', simulatedStart: 60_000 },
  ETHUSDT: { label: 'ETH/USDT', base: 'ETH', simulatedStart: 3_000 },
  SOLUSDT: { label: 'SOL/USDT', base: 'SOL', simulatedStart: 150 },
  BNBUSDT: { label: 'BNB/USDT', base: 'BNB', simulatedStart: 550 },
};

// Binance's public market-data endpoints need no API key. The *.binance.vision
// hosts serve market data only; the main hosts are a fallback.
const REST_HOSTS = ['https://data-api.binance.vision', 'https://api.binance.com'];
const STREAM_HOSTS = ['wss://data-stream.binance.vision', 'wss://stream.binance.com:9443'];

/** Converts a candle from Binance's REST API ([openTime, open, high, low, close, volume, closeTime, ...]). */
export function parseRestKline(row, now = Date.now()) {
  return {
    openTime: row[0],
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5]),
    closeTime: row[6],
    closed: row[6] < now,
  };
}

/** Converts a kline message from Binance's WebSocket stream. */
export function parseStreamKline(message) {
  const k = message.k;
  return {
    openTime: k.t,
    open: Number(k.o),
    high: Number(k.h),
    low: Number(k.l),
    close: Number(k.c),
    volume: Number(k.v),
    closeTime: k.T,
    closed: Boolean(k.x),
  };
}

export class BinanceMarket {
  #socket = null;
  #stopped = false;
  #attempts = 0;
  #hostIndex = 0;
  #receivedData = false;
  #retryTimer = null;

  constructor(symbol, {
    interval = '1m',
    limit = 300,
    fetchImpl = globalThis.fetch?.bind(globalThis),
    WebSocketImpl = globalThis.WebSocket,
    retryDelay = (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
  } = {}) {
    this.symbol = symbol;
    this.retryDelay = retryDelay;
    this.interval = interval;
    this.limit = limit;
    this.fetch = fetchImpl;
    this.WebSocket = WebSocketImpl;
    this.live = true;
  }

  async loadHistory() {
    let lastError;
    for (const host of REST_HOSTS) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const url = `${host}/api/v3/klines?symbol=${this.symbol}&interval=${this.interval}&limit=${this.limit}`;
        const response = await this.fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const rows = await response.json();
        if (!Array.isArray(rows) || rows.length < 30) throw new Error('Not enough market data');
        return rows.map((row) => parseRestKline(row));
      } catch (error) {
        lastError = error;
      } finally {
        clearTimeout(timeout);
      }
    }
    throw new Error(`Could not load Binance market data (${lastError?.message ?? 'unknown error'})`);
  }

  connect({ onCandle, onStatus }) {
    this.#stopped = false;
    const open = () => {
      const host = STREAM_HOSTS[this.#hostIndex % STREAM_HOSTS.length];
      const socket = new this.WebSocket(`${host}/ws/${this.symbol.toLowerCase()}@kline_${this.interval}`);
      this.#socket = socket;
      onStatus('connecting');

      socket.onmessage = (event) => {
        let message;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }
        if (message.e !== 'kline') return;
        if (!this.#receivedData) onStatus('live');
        this.#receivedData = true;
        this.#attempts = 0;
        onCandle(parseStreamKline(message));
      };

      socket.onclose = () => {
        if (this.#stopped || socket !== this.#socket) return;
        this.#attempts += 1;
        this.#hostIndex += 1;
        // Give up on live data if it never worked; otherwise keep reconnecting.
        if (!this.#receivedData && this.#attempts >= 4) {
          onStatus('failed');
          return;
        }
        this.#receivedData = false;
        onStatus('reconnecting');
        this.#retryTimer = setTimeout(open, this.retryDelay(this.#attempts));
      };
    };
    open();
  }

  close() {
    this.#stopped = true;
    clearTimeout(this.#retryTimer);
    if (this.#socket) {
      this.#socket.onclose = null;
      this.#socket.onmessage = null;
      this.#socket.close();
      this.#socket = null;
    }
  }
}

/**
 * A simulated market for when Binance is unreachable (offline, or blocked in
 * the visitor's region). Prices follow a random walk with drifting momentum,
 * and each one-minute candle is compressed into a couple of seconds.
 */
export class SimulatedMarket {
  #timer = null;
  #price;
  #drift = 0;
  #candle = null;

  constructor(symbol, { random = Math.random, limit = 300, candleMs = 2000, tickMs = 250 } = {}) {
    this.symbol = symbol;
    this.random = random;
    this.limit = limit;
    this.candleMs = candleMs;
    this.tickMs = tickMs;
    this.live = false;
    this.#price = SYMBOLS[symbol]?.simulatedStart ?? 100;
  }

  #normal() {
    const u = 1 - this.random();
    const v = this.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /** Momentum changes once per candle, so trends last a few minutes. */
  #updateDrift() {
    this.#drift = 0.85 * this.#drift + this.#normal() * 0.0006;
  }

  /** Move the price by `fraction` of a candle's worth of change. */
  #step(fraction) {
    this.#price *= Math.exp(this.#drift * fraction + this.#normal() * 0.0012 * Math.sqrt(fraction));
    return this.#price;
  }

  async loadHistory() {
    const minute = 60_000;
    const start = Math.floor(Date.now() / minute) * minute - this.limit * minute;
    const candles = [];
    for (let i = 0; i < this.limit; i += 1) {
      this.#updateDrift();
      const open = this.#price;
      let high = open;
      let low = open;
      for (let t = 0; t < 4; t += 1) {
        const price = this.#step(0.25);
        high = Math.max(high, price);
        low = Math.min(low, price);
      }
      const openTime = start + i * minute;
      candles.push({ openTime, open, high, low, close: this.#price, volume: 0, closeTime: openTime + minute - 1, closed: true });
    }
    return candles;
  }

  connect({ onCandle, onStatus, lastOpenTime }) {
    const minute = 60_000;
    const ticksPerCandle = Math.max(1, Math.round(this.candleMs / this.tickMs));
    let tick = 0;
    let openTime = (lastOpenTime ?? Date.now()) + minute;
    onStatus('simulated');
    this.#timer = setInterval(() => {
      if (!this.#candle) {
        this.#updateDrift();
        this.#candle = { openTime, open: this.#price, high: this.#price, low: this.#price, close: this.#price, volume: 0, closeTime: openTime + minute - 1, closed: false };
      }
      const price = this.#step(1 / ticksPerCandle);
      Object.assign(this.#candle, { close: price, high: Math.max(this.#candle.high, price), low: Math.min(this.#candle.low, price) });
      tick += 1;
      if (tick % ticksPerCandle === 0) {
        onCandle({ ...this.#candle, closed: true });
        this.#candle = null;
        openTime += minute;
      } else {
        onCandle({ ...this.#candle });
      }
    }, this.tickMs);
  }

  close() {
    clearInterval(this.#timer);
    this.#timer = null;
  }
}
