import { Calculator, Addition, Subtraction, Multiplication, Division } from './calculator.js';

const calculator = new Calculator();
const operations = {
  add: new Addition(),
  subtract: new Subtraction(),
  multiply: new Multiplication(),
  divide: new Division(),
};

const display = document.getElementById('display');
const expression = document.getElementById('expression');
const announcer = document.getElementById('announcer');
const keypad = document.getElementById('keypad');
const history = document.getElementById('history');
const historyEmpty = document.getElementById('history-empty');

function render() {
  display.textContent = calculator.display;
  expression.textContent = calculator.expression;
  display.classList.toggle('text-rose-300', calculator.hasError);
  display.classList.toggle('text-2xl', calculator.display.length > 12);
  display.classList.toggle('text-4xl', calculator.display.length <= 12);
}

function addToHistory(line, result) {
  const item = document.createElement('li');
  item.className = 'flex justify-between gap-4 border-b border-gray-800 pb-1.5';
  const left = document.createElement('span');
  left.className = 'truncate text-gray-400';
  left.textContent = line;
  const right = document.createElement('span');
  right.className = 'font-semibold text-white';
  right.textContent = result;
  item.append(left, right);
  history.prepend(item);
  historyEmpty.hidden = true;
}

function press(key) {
  if (key.digit !== undefined) {
    calculator.inputDigit(key.digit);
  } else if (key.operation) {
    calculator.chooseOperation(operations[key.operation]);
  } else {
    switch (key.action) {
      case 'clear': calculator.clear(); break;
      case 'sign': calculator.toggleSign(); break;
      case 'backspace': calculator.backspace(); break;
      case 'decimal': calculator.inputDecimalPoint(); break;
      case 'equals': {
        calculator.equals();
        if (calculator.hasError) {
          announcer.textContent = calculator.display;
        } else if (calculator.expression.endsWith('=')) {
          addToHistory(calculator.expression, calculator.display);
          announcer.textContent = `${calculator.expression} ${calculator.display}`;
        }
        break;
      }
      default: return;
    }
  }
  render();
}

function keyFromButton(button) {
  if (button.dataset.digit !== undefined) return { digit: Number(button.dataset.digit) };
  if (button.dataset.operation) return { operation: button.dataset.operation };
  return { action: button.dataset.action };
}

keypad.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  press(keyFromButton(button));
  // A mouse or touch click (detail > 0) shouldn't leave focus on the key, or a
  // later Enter would press that key again instead of "=". Keyboard users who
  // Tab to a key keep focus as normal.
  if (event.detail > 0) button.blur();
});

const keyboardMap = {
  '+': '[data-operation="add"]',
  '-': '[data-operation="subtract"]',
  '*': '[data-operation="multiply"]',
  x: '[data-operation="multiply"]',
  '/': '[data-operation="divide"]',
  Enter: '[data-action="equals"]',
  '=': '[data-action="equals"]',
  '.': '[data-action="decimal"]',
  ',': '[data-action="decimal"]',
  Backspace: '[data-action="backspace"]',
  Escape: '[data-action="clear"]',
  Delete: '[data-action="clear"]',
};

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const selector = /^[0-9]$/.test(event.key) ? `[data-digit="${event.key}"]` : keyboardMap[event.key];
  if (!selector) return;
  // Enter means "=", except on a key the user reached with Tab, which Enter activates.
  if (event.key === 'Enter' && document.activeElement?.closest('#keypad')) return;
  const button = keypad.querySelector(selector);
  event.preventDefault();
  press(keyFromButton(button));
  button.classList.add('is-pressed');
  setTimeout(() => button.classList.remove('is-pressed'), 120);
});

document.getElementById('clear-history').addEventListener('click', () => {
  history.replaceChildren();
  historyEmpty.hidden = false;
});

render();
