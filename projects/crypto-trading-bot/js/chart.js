/**
 * Price and RSI chart drawn on a <canvas>: closing prices with buy and sell
 * markers on top, RSI with its overbought/oversold levels below, and a
 * crosshair with a tooltip on hover.
 */

const COLOURS = {
  grid: '#1f2937',
  axis: '#9ca3af',
  price: '#d1d5db',
  rsi: '#8b5cf6',
  buy: '#0d9488',
  sell: '#ea580c',
  level: '#4b5563',
  zone: 'rgba(139, 92, 246, 0.08)',
  surface: '#111827',
  crosshair: 'rgba(209, 213, 219, 0.45)',
};
const FONT = '12px Inter, ui-sans-serif, system-ui, sans-serif';

export class MarketChart {
  #canvas;
  #ctx;
  #tooltip;
  #data = null;
  #hoverIndex = null;
  #layout = null;

  constructor(canvas, tooltip, { formatPrice, formatTime }) {
    this.#canvas = canvas;
    this.#ctx = canvas.getContext('2d');
    this.#tooltip = tooltip;
    this.formatPrice = formatPrice;
    this.formatTime = formatTime;

    const move = (event) => this.#hover(event);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerdown', move);
    canvas.addEventListener('pointerleave', () => this.#clearHover());
    if ('ResizeObserver' in window) new ResizeObserver(() => this.draw()).observe(canvas);
  }

  /** candles: closed + live candles; rsi: matching values; trades: portfolio trades. */
  setData({ candles, rsi, trades, oversold, overbought, visible = 150 }) {
    const start = Math.max(0, candles.length - visible);
    this.#data = {
      candles: candles.slice(start),
      rsi: rsi.slice(start),
      trades,
      oversold,
      overbought,
    };
    this.draw();
  }

  draw() {
    const data = this.#data;
    const canvas = this.#canvas;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!data || data.candles.length < 2 || !width || !height) {
      this.#layout = null;
      this.#ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    const ctx = this.#ctx;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.font = FONT;

    const { candles, rsi } = data;
    const left = 8;
    const right = width - 70;
    const priceTop = 12;
    const rsiHeight = Math.max(70, Math.round(height * 0.26));
    const timeAxis = 22;
    const rsiBottom = height - timeAxis;
    const rsiTop = rsiBottom - rsiHeight;
    const priceBottom = rsiTop - 22;
    const step = candles.length > 1 ? (right - left) / (candles.length - 1) : 0;
    const x = (i) => left + i * step;

    const closes = candles.map((c) => c.close);
    let min = Math.min(...closes);
    let max = Math.max(...closes);
    const padding = (max - min) * 0.1 || max * 0.001;
    min -= padding;
    max += padding;
    const priceY = (price) => priceBottom - ((price - min) / (max - min)) * (priceBottom - priceTop);
    const rsiY = (value) => rsiBottom - (value / 100) * (rsiBottom - rsiTop);
    this.#layout = { left, right, step, count: candles.length, x, priceY, rsiY, priceTop, rsiBottom };

    // Price gridlines and axis labels (right-hand side, like most trading charts).
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    for (let i = 0; i <= 4; i += 1) {
      const value = min + ((max - min) * i) / 4;
      const y = Math.round(priceY(value)) + 0.5;
      line(ctx, left, y, right, y, COLOURS.grid, 1);
      ctx.fillStyle = COLOURS.axis;
      ctx.fillText(this.formatPrice(value), right + 8, y);
    }

    // RSI pane: overbought/oversold zones, level lines and the RSI line.
    ctx.fillStyle = COLOURS.zone;
    ctx.fillRect(left, rsiY(100), right - left, rsiY(data.overbought) - rsiY(100));
    ctx.fillRect(left, rsiY(data.oversold), right - left, rsiY(0) - rsiY(data.oversold));
    for (const level of [data.overbought, 50, data.oversold]) {
      const y = Math.round(rsiY(level)) + 0.5;
      line(ctx, left, y, right, y, level === 50 ? COLOURS.grid : COLOURS.level, 1);
      ctx.fillStyle = COLOURS.axis;
      ctx.fillText(String(level), right + 8, y);
    }
    ctx.fillStyle = COLOURS.axis;
    ctx.textBaseline = 'top';
    ctx.fillText('RSI (14)', left + 4, rsiTop - 18);

    // Time labels.
    ctx.textAlign = 'center';
    const every = Math.max(1, Math.ceil(candles.length / Math.max(2, Math.floor((right - left) / 80))));
    for (let i = candles.length - 1; i >= 0; i -= every) {
      ctx.fillText(this.formatTime(candles[i].openTime), x(i), rsiBottom + 6);
    }

    // Lines.
    path(ctx, closes.map((c, i) => [x(i), priceY(c)]), COLOURS.price);
    path(ctx, rsi.map((v, i) => (v == null ? null : [x(i), rsiY(v)])), COLOURS.rsi);

    // Trade markers: ▲ below the price for buys, ▼ above it for sells.
    const firstTime = candles[0].openTime;
    for (const trade of data.trades) {
      if (trade.candleTime < firstTime) continue;
      const index = candles.findIndex((c) => c.openTime === trade.candleTime);
      if (index < 0) continue;
      const px = x(index);
      const py = priceY(trade.price);
      triangle(ctx, px, trade.side === 'buy' ? py + 12 : py - 12, trade.side === 'buy' ? 'up' : 'down', COLOURS[trade.side]);
    }

    // Latest price: end dot and a label on the axis.
    const last = closes.length - 1;
    dot(ctx, x(last), priceY(closes[last]), COLOURS.price);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const labelY = priceY(closes[last]);
    const label = this.formatPrice(closes[last]);
    ctx.fillStyle = '#f3f4f6';
    roundedRect(ctx, right + 4, labelY - 9, ctx.measureText(label).width + 8, 18, 4);
    ctx.fillStyle = COLOURS.surface;
    ctx.fillText(label, right + 8, labelY);

    // Crosshair for the hovered candle.
    if (this.#hoverIndex !== null && this.#hoverIndex < candles.length) {
      const i = this.#hoverIndex;
      const hx = Math.round(x(i)) + 0.5;
      line(ctx, hx, priceTop, hx, rsiBottom, COLOURS.crosshair, 1);
      dot(ctx, x(i), priceY(closes[i]), COLOURS.price);
      if (rsi[i] != null) dot(ctx, x(i), rsiY(rsi[i]), COLOURS.rsi);
    }
  }

  #hover(event) {
    if (!this.#layout || !this.#data) return;
    const box = this.#canvas.getBoundingClientRect();
    const px = event.clientX - box.left;
    const { left, right, step, count } = this.#layout;
    if (px < left - 10 || px > right + 10 || count === 0) return this.#clearHover();
    const index = Math.max(0, Math.min(count - 1, Math.round((px - left) / (step || 1))));
    this.#hoverIndex = index;
    this.draw();
    this.#showTooltip(index, box);
  }

  #clearHover() {
    this.#hoverIndex = null;
    this.#tooltip.hidden = true;
    this.draw();
  }

  #showTooltip(index, box) {
    const { candles, rsi, trades } = this.#data;
    const candle = candles[index];
    const tradesHere = trades.filter((t) => t.candleTime === candle.openTime);
    const rows = [
      ['Time', this.formatTime(candle.openTime)],
      ['Close', this.formatPrice(candle.close)],
      ['RSI', rsi[index] == null ? '—' : rsi[index].toFixed(1)],
      ...tradesHere.map((t) => [t.side === 'buy' ? '▲ Buy' : '▼ Sell', this.formatPrice(t.price)]),
    ];
    this.#tooltip.replaceChildren(...rows.map(([name, value]) => {
      const row = document.createElement('div');
      row.className = 'flex justify-between gap-4';
      const a = document.createElement('span');
      a.className = 'text-gray-400';
      a.textContent = name;
      const b = document.createElement('span');
      b.className = 'font-medium tabular-nums text-gray-100';
      b.textContent = value;
      row.append(a, b);
      return row;
    }));
    this.#tooltip.hidden = false;
    const tipWidth = this.#tooltip.offsetWidth;
    const xPos = this.#layout.x(index);
    const placeLeft = xPos + 16 + tipWidth > box.width;
    this.#tooltip.style.left = `${placeLeft ? xPos - 16 - tipWidth : xPos + 16}px`;
    this.#tooltip.style.top = '12px';
  }
}

function line(ctx, x1, y1, x2, y2, colour, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.stroke();
}

function path(ctx, points, colour) {
  ctx.beginPath();
  let started = false;
  for (const point of points) {
    if (!point) continue;
    if (started) ctx.lineTo(point[0], point[1]);
    else ctx.moveTo(point[0], point[1]);
    started = true;
  }
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

function dot(ctx, x, y, colour) {
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fillStyle = colour;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = COLOURS.surface;
  ctx.stroke();
}

function triangle(ctx, x, y, direction, colour) {
  const size = 7;
  ctx.beginPath();
  if (direction === 'up') {
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y + size);
    ctx.lineTo(x - size, y + size);
  } else {
    ctx.moveTo(x, y + size);
    ctx.lineTo(x + size, y - size);
    ctx.lineTo(x - size, y - size);
  }
  ctx.closePath();
  ctx.fillStyle = colour;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = COLOURS.surface;
  ctx.stroke();
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, width, height, radius);
  else ctx.rect(x, y, width, height);
  ctx.fill();
}
