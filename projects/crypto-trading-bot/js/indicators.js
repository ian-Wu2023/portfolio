/**
 * Relative Strength Index using Wilder's smoothing.
 *
 * Returns an array the same length as `closes`. The first `period` entries
 * are null because RSI needs `period` price changes before it has a value.
 */
export function rsi(closes, period = 14) {
  const values = new Array(closes.length).fill(null);
  if (closes.length <= period) return values;

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i += 1) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  let averageGain = gains / period;
  let averageLoss = losses / period;
  values[period] = fromAverages(averageGain, averageLoss);

  for (let i = period + 1; i < closes.length; i += 1) {
    const change = closes[i] - closes[i - 1];
    averageGain = (averageGain * (period - 1) + Math.max(change, 0)) / period;
    averageLoss = (averageLoss * (period - 1) + Math.max(-change, 0)) / period;
    values[i] = fromAverages(averageGain, averageLoss);
  }
  return values;
}

function fromAverages(averageGain, averageLoss) {
  if (averageLoss === 0) return averageGain === 0 ? 50 : 100;
  return 100 - 100 / (1 + averageGain / averageLoss);
}
