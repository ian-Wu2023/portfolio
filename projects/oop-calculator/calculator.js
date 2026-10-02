/*
 * Browser port of the Java classes in ./java/. The class design is the same:
 * Operation is an abstract base class, each operation is a subclass, and
 * Calculator keeps its state in private fields that the UI cannot touch.
 */

export class Operation {
  #symbol;

  constructor(symbol) {
    if (new.target === Operation) {
      throw new TypeError('Operation is abstract; use a subclass such as Addition');
    }
    this.#symbol = symbol;
  }

  get symbol() {
    return this.#symbol;
  }

  /** @abstract */
  apply(left, right) {
    throw new Error(`${this.constructor.name} must implement apply()`);
  }
}

export class Addition extends Operation {
  constructor() { super('+'); }
  apply(left, right) { return left + right; }
}

export class Subtraction extends Operation {
  constructor() { super('−'); }
  apply(left, right) { return left - right; }
}

export class Multiplication extends Operation {
  constructor() { super('×'); }
  apply(left, right) { return left * right; }
}

export class Division extends Operation {
  constructor() { super('÷'); }
  apply(left, right) {
    if (right === 0) throw new RangeError('Cannot divide by zero');
    return left / right;
  }
}

/** Formats a number for display, rounded to 12 significant digits. */
export function format(value) {
  if (!Number.isFinite(value)) return 'Error';
  if (value === 0) return '0';
  const rounded = Number(value.toPrecision(12));
  const magnitude = Math.abs(rounded);
  if (magnitude >= 1e12 || magnitude < 1e-9) {
    return rounded.toExponential().replace(/\.?0+e/, 'e');
  }
  return String(rounded);
}

export class Calculator {
  static MAX_DIGITS = 12;

  #accumulator;
  #pendingOperation;
  #entry;
  #typingNumber;
  #expression;
  #error;

  constructor() {
    this.#reset();
  }

  /** Resets the calculator to its starting state (the AC key). */
  clear() {
    this.#reset();
  }

  #reset() {
    this.#accumulator = 0;
    this.#pendingOperation = null;
    this.#entry = '0';
    this.#typingNumber = false;
    this.#expression = '';
    this.#error = null;
  }

  inputDigit(digit) {
    if (!Number.isInteger(digit) || digit < 0 || digit > 9) {
      throw new RangeError(`Digit must be between 0 and 9: ${digit}`);
    }
    if (this.#error) this.clear();
    if (!this.#typingNumber) {
      this.#entry = String(digit);
      this.#typingNumber = true;
    } else if (this.#entry.replace(/\D/g, '').length < Calculator.MAX_DIGITS) {
      if (this.#entry === '0') this.#entry = String(digit);
      else if (this.#entry === '-0') this.#entry = `-${digit}`;
      else this.#entry += digit;
    }
  }

  inputDecimalPoint() {
    if (this.#error) this.clear();
    if (!this.#typingNumber) {
      this.#entry = '0.';
      this.#typingNumber = true;
    } else if (!this.#entry.includes('.')) {
      this.#entry += '.';
    }
  }

  chooseOperation(operation) {
    if (this.#error) return;
    if (this.#pendingOperation === null) {
      this.#accumulator = this.#currentValue();
    } else if (this.#typingNumber && !this.#applyPending()) {
      return;
    }
    this.#pendingOperation = operation;
    this.#typingNumber = false;
    this.#expression = `${format(this.#accumulator)} ${operation.symbol}`;
  }

  equals() {
    if (this.#error || this.#pendingOperation === null) return;
    const left = format(this.#accumulator);
    const right = format(this.#currentValue());
    const symbol = this.#pendingOperation.symbol;
    if (this.#applyPending()) {
      this.#expression = `${left} ${symbol} ${right} =`;
      this.#pendingOperation = null;
    }
  }

  backspace() {
    if (this.#error || !this.#typingNumber) return;
    this.#entry = this.#entry.slice(0, -1);
    if (this.#entry === '' || this.#entry === '-') this.#entry = '0';
  }

  toggleSign() {
    if (this.#error) return;
    if (this.#pendingOperation !== null && !this.#typingNumber) {
      this.#entry = '0';
      this.#typingNumber = true;
    }
    this.#entry = this.#entry.startsWith('-') ? this.#entry.slice(1) : `-${this.#entry}`;
  }

  get display() {
    if (this.#error) return this.#error;
    if (this.#pendingOperation !== null && !this.#typingNumber) return format(this.#accumulator);
    return this.#entry;
  }

  get expression() {
    return this.#expression;
  }

  get hasError() {
    return this.#error !== null;
  }

  #applyPending() {
    try {
      const result = this.#pendingOperation.apply(this.#accumulator, this.#currentValue());
      if (!Number.isFinite(result)) throw new RangeError('Result is too large');
      this.#accumulator = result;
      this.#entry = format(result);
      this.#typingNumber = false;
      return true;
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      this.#error = error.message;
      this.#pendingOperation = null;
      this.#expression = '';
      this.#typingNumber = false;
      return false;
    }
  }

  #currentValue() {
    return Number(this.#entry);
  }
}
