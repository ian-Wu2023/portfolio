/**
 * A paper-trading account: simulated money only, no real orders are placed.
 * Buys spend a fixed fraction of the available cash; sells close the whole
 * position. A trading fee is charged on every trade, like a real exchange.
 */
export class PaperPortfolio {
  #cash;
  #holdings = 0;
  #feesPaid = 0;
  #trades = [];

  constructor({ startingCash = 10_000, feeRate = 0.001, tradeFraction = 0.25, minimumOrder = 10 } = {}) {
    this.startingCash = startingCash;
    this.feeRate = feeRate;
    this.tradeFraction = tradeFraction;
    this.minimumOrder = minimumOrder;
    this.#cash = startingCash;
  }

  get cash() { return this.#cash; }
  get holdings() { return this.#holdings; }
  get feesPaid() { return this.#feesPaid; }
  get trades() { return this.#trades.slice(); }

  equity(price) {
    return this.#cash + this.#holdings * price;
  }

  profit(price) {
    return this.equity(price) - this.startingCash;
  }

  /**
   * Buy with tradeFraction of the cash. `details` (time, reason, ...) is stored
   * with the trade. Returns the trade, or null if there is too little cash.
   */
  buy(price, details = {}) {
    const spend = this.#cash * this.tradeFraction;
    if (spend < this.minimumOrder) return null;
    const fee = spend * this.feeRate;
    const quantity = (spend - fee) / price;
    this.#cash -= spend;
    this.#holdings += quantity;
    this.#feesPaid += fee;
    return this.#record({ ...details, side: 'buy', price, quantity, value: spend, fee });
  }

  /** Sell the whole position. Returns the trade, or null if nothing is held. */
  sell(price, details = {}) {
    if (this.#holdings <= 0) return null;
    const quantity = this.#holdings;
    const value = quantity * price;
    const fee = value * this.feeRate;
    this.#cash += value - fee;
    this.#holdings = 0;
    this.#feesPaid += fee;
    return this.#record({ ...details, side: 'sell', price, quantity, value, fee });
  }

  #record(trade) {
    const frozen = Object.freeze({ id: this.#trades.length + 1, ...trade });
    this.#trades.push(frozen);
    return frozen;
  }
}
