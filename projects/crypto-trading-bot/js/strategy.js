/**
 * RSI strategy: buy when RSI falls below the oversold level, sell when it
 * rises above the overbought level. Signals are only taken on closed
 * candles, so a signal never disappears after it has been acted on.
 */
export class RsiStrategy {
  constructor({ period = 14, oversold = 30, overbought = 70 } = {}) {
    if (!(oversold < overbought)) throw new RangeError('oversold must be below overbought');
    this.period = period;
    this.oversold = oversold;
    this.overbought = overbought;
  }

  /** 'buy', 'sell' or null, from the RSI of the previous and the latest closed candle. */
  signal(previous, current) {
    if (previous == null || current == null) return null;
    if (previous >= this.oversold && current < this.oversold) return 'buy';
    if (previous <= this.overbought && current > this.overbought) return 'sell';
    return null;
  }

  /** Describes where an RSI value sits: 'oversold', 'overbought' or 'neutral'. */
  zone(value) {
    if (value == null) return 'neutral';
    if (value < this.oversold) return 'oversold';
    if (value > this.overbought) return 'overbought';
    return 'neutral';
  }
}
