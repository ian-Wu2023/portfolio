import { BinanceMarket, SimulatedMarket, SYMBOLS } from './market.js';
import { TradingBot } from './bot.js';
import { MarketChart } from './chart.js';

const $ = (id) => document.getElementById(id);
const els = {
  symbol: $('symbol'), status: $('status'), statusDot: $('status-dot'), statusText: $('status-text'),
  autoTrade: $('auto-trade'), reset: $('reset'), notice: $('notice'), retry: $('retry-live'),
  price: $('price'), change: $('change'), rsi: $('rsi'), zone: $('zone'), signal: $('signal'), signalDetail: $('signal-detail'),
  equity: $('equity'), profit: $('profit'), cash: $('cash'), holdings: $('holdings'), holdingsLabel: $('holdings-label'),
  positionValue: $('position-value'), fees: $('fees'), tradeCount: $('trade-count'), buy: $('buy'), sell: $('sell'),
  trades: $('trades'), tradesEmpty: $('trades-empty'), announcer: $('announcer'), chartLabel: $('chart-label'), source: $('source'),
};

const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });
const formatTime = (ms) => timeFormat.format(new Date(ms));

function formatPrice(value) {
  if (value == null || !Number.isFinite(value)) return '—';
  const digits = value >= 1000 ? 2 : value >= 1 ? 3 : 6;
  return value.toLocaleString('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function formatQuantity(value) {
  return value.toLocaleString('en-GB', { maximumFractionDigits: 6 });
}

function signed(value, formatter) {
  return `${value >= 0 ? '+' : '−'}${formatter(Math.abs(value))}`;
}

const chart = new MarketChart($('chart'), $('chart-tooltip'), { formatPrice, formatTime });
let bot = null;
let market = null;
let generation = 0;
let renderQueued = false;
let forceSimulated = false;

const STATUS = {
  connecting: ['Connecting to Binance…', 'bg-amber-400'],
  live: ['Live · Binance', 'bg-teal-400'],
  reconnecting: ['Reconnecting…', 'bg-amber-400'],
  simulated: ['Simulated data', 'bg-gray-400'],
};

function setStatus(state) {
  const [text, dot] = STATUS[state] ?? STATUS.connecting;
  els.statusText.textContent = text;
  els.statusDot.className = `h-2 w-2 rounded-full ${dot} ${state === 'live' ? 'motion-safe:animate-pulse' : ''}`;
}

async function start(symbol) {
  const id = ++generation;
  market?.close();
  bot = new TradingBot();
  bot.autoTrade = els.autoTrade.checked;
  setStatus('connecting');
  els.notice.hidden = true;
  els.trades.replaceChildren();
  renderNow();

  let candles;
  if (!forceSimulated) {
    const live = new BinanceMarket(symbol);
    try {
      candles = await live.loadHistory();
      market = live;
    } catch (error) {
      console.info(error.message);
    }
  }
  if (id !== generation) return;
  if (!candles) {
    market = new SimulatedMarket(symbol);
    candles = await market.loadHistory();
  }
  els.notice.hidden = market.live;

  bot.loadHistory(candles);
  els.source.textContent = market.live
    ? 'Live 1-minute candles from Binance. On load, the bot replays the last few hours, then keeps trading as new candles close.'
    : 'Simulated prices (not real market data): each 1-minute candle is compressed into 2 seconds so you can watch the bot trade.';
  renderNow();

  market.connect({
    lastOpenTime: candles[candles.length - 1].openTime,
    onStatus: (state) => {
      if (id !== generation) return;
      if (state === 'failed') {
        // Live prices loaded but the stream never connected: use simulated data until "Retry".
        forceSimulated = true;
        start(symbol);
        return;
      }
      setStatus(state);
    },
    onCandle: (candle) => {
      if (id !== generation) return;
      const trade = bot.update(candle);
      if (trade) announce(trade);
      queueRender();
    },
  });
}

function announce(trade) {
  const base = SYMBOLS[els.symbol.value].base;
  els.announcer.textContent = `${trade.side === 'buy' ? 'Bought' : 'Sold'} ${formatQuantity(trade.quantity)} ${base} at ${formatPrice(trade.price)}. ${trade.reason}.`;
}

function queueRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    renderNow();
  });
}

function renderNow() {
  const base = SYMBOLS[els.symbol.value].base;
  const price = bot?.lastPrice;
  const first = bot?.candles[0]?.close;

  els.price.textContent = formatPrice(price);
  if (price != null && first) {
    const change = (price / first - 1) * 100;
    const hours = Math.round((bot.candles.length) / 60);
    els.change.textContent = `${signed(change, (v) => v.toFixed(2))}% over ${hours} h`;
  } else {
    els.change.textContent = '';
  }

  const value = bot?.lastRsi;
  els.rsi.textContent = value == null ? '—' : value.toFixed(1);
  const zone = bot ? bot.strategy.zone(value) : 'neutral';
  els.zone.textContent = { oversold: 'Oversold (below 30)', overbought: 'Overbought (above 70)', neutral: 'Neutral (30–70)' }[zone];

  const signal = bot?.lastSignal;
  els.signal.textContent = signal ? (signal.side === 'buy' ? '▲ Buy' : '▼ Sell') : 'None yet';
  els.signal.className = `mt-1 block text-2xl font-semibold ${signal ? (signal.side === 'buy' ? 'text-teal-300' : 'text-orange-300') : 'text-white'}`;
  els.signalDetail.textContent = signal
    ? `${formatTime(signal.time)} · ${signal.reason}${signal.traded ? '' : bot.autoTrade ? ' (no cash or position)' : ' (auto-trading off)'}`
    : 'Waiting for RSI to cross 30 or 70';

  if (!bot) return;
  const portfolio = bot.portfolio;
  const equity = price == null ? portfolio.cash : portfolio.equity(price);
  const profit = equity - portfolio.startingCash;
  els.equity.textContent = money.format(equity);
  els.profit.textContent = `${signed(profit, (v) => money.format(v))} (${signed(profit / portfolio.startingCash * 100, (v) => v.toFixed(2))}%)`;
  els.profit.className = `text-sm ${profit >= 0 ? 'text-teal-300' : 'text-orange-300'}`;
  els.cash.textContent = money.format(portfolio.cash);
  els.holdingsLabel.textContent = `${base} held`;
  els.holdings.textContent = formatQuantity(portfolio.holdings);
  els.positionValue.textContent = money.format(price == null ? 0 : portfolio.holdings * price);
  els.fees.textContent = money.format(portfolio.feesPaid);
  const trades = portfolio.trades;
  els.tradeCount.textContent = String(trades.length);
  els.sell.disabled = portfolio.holdings <= 0;
  els.buy.disabled = portfolio.cash * portfolio.tradeFraction < portfolio.minimumOrder;

  renderTrades(trades.slice(-50).reverse(), base);
  chart.setData({ candles: bot.candles, rsi: bot.rsi, trades, oversold: bot.strategy.oversold, overbought: bot.strategy.overbought });
  els.chartLabel.textContent = `${SYMBOLS[els.symbol.value].label} price over the last ${Math.min(bot.candles.length, 150)} minutes with RSI below; ${trades.length} trades marked.`;
}

let renderedTradeKey = '';
function renderTrades(trades, base) {
  const key = trades.map((t) => t.id).join(',') + base;
  if (key === renderedTradeKey) return;
  renderedTradeKey = key;
  els.tradesEmpty.hidden = trades.length > 0;
  els.trades.replaceChildren(...trades.map((trade) => {
    const row = document.createElement('tr');
    row.className = 'border-b border-gray-800';
    const cells = [
      formatTime(trade.time),
      `${trade.side === 'buy' ? '▲ Buy' : '▼ Sell'}`,
      formatPrice(trade.price),
      `${formatQuantity(trade.quantity)} ${base}`,
      money.format(trade.value),
      `${trade.reason}${trade.source === 'history' ? ' · replay' : ''}`,
    ];
    cells.forEach((text, i) => {
      const cell = document.createElement('td');
      cell.className = i === 5 ? 'py-2 pl-3 text-gray-400' : `py-2 pl-3 tabular-nums ${i === 1 ? (trade.side === 'buy' ? 'text-teal-300' : 'text-orange-300') : 'text-gray-200'}`;
      cell.textContent = text;
      row.append(cell);
    });
    return row;
  }));
}

els.symbol.addEventListener('change', () => start(els.symbol.value));
els.autoTrade.addEventListener('change', () => {
  if (bot) bot.autoTrade = els.autoTrade.checked;
  renderNow();
});
els.reset.addEventListener('click', () => {
  bot?.reset();
  renderNow();
});
els.retry.addEventListener('click', () => {
  forceSimulated = false;
  start(els.symbol.value);
});
els.buy.addEventListener('click', () => {
  const trade = bot?.manualTrade('buy');
  if (trade) announce(trade);
  renderNow();
});
els.sell.addEventListener('click', () => {
  const trade = bot?.manualTrade('sell');
  if (trade) announce(trade);
  renderNow();
});

start(els.symbol.value);
