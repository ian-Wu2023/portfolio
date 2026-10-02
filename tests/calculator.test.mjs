// Mirrors the Java tests in projects/oop-calculator/java/CalculatorTest.java.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  Calculator, Operation, Addition, Subtraction, Multiplication, Division, format,
} from '../projects/oop-calculator/calculator.js';

function run(keys) {
  const calculator = new Calculator();
  for (const key of keys) {
    switch (key) {
      case '+': calculator.chooseOperation(new Addition()); break;
      case '-': calculator.chooseOperation(new Subtraction()); break;
      case '*': calculator.chooseOperation(new Multiplication()); break;
      case '/': calculator.chooseOperation(new Division()); break;
      case '=': calculator.equals(); break;
      case '.': calculator.inputDecimalPoint(); break;
      case '<': calculator.backspace(); break;
      case 'n': calculator.toggleSign(); break;
      case 'c': calculator.clear(); break;
      default: calculator.inputDigit(Number(key));
    }
  }
  return calculator;
}
const press = (keys) => run(keys).display;

test('basic operations', () => {
  assert.equal(press('7+5='), '12');
  assert.equal(press('7-5='), '2');
  assert.equal(press('7*5='), '35');
  assert.equal(press('7/5='), '1.4');
  assert.equal(run('7+5=').expression, '7 + 5 =');
});

test('operations chain from left to right', () => {
  assert.equal(press('12+7*3='), '57');
  assert.equal(press('12+7*'), '19');
  assert.equal(run('12+7*').expression, '19 ×');
});

test('choosing another operation replaces the previous one', () => {
  assert.equal(press('5+-3='), '2');
  assert.equal(press('5+='), '10');
});

test('decimals are rounded for display', () => {
  assert.equal(press('0.1+0.2='), '0.3');
  assert.equal(press('.5'), '0.5');
  assert.equal(press('1..5'), '1.5');
  assert.equal(press('1/3='), '0.333333333333');
});

test('division by zero shows an error and recovers', () => {
  const calculator = run('8/0=');
  assert.equal(calculator.display, 'Cannot divide by zero');
  assert.equal(calculator.hasError, true);
  calculator.inputDigit(4);
  assert.equal(calculator.display, '4');
  assert.equal(calculator.hasError, false);
});

test('backspace and sign toggle', () => {
  assert.equal(press('123<'), '12');
  assert.equal(press('5<<'), '0');
  assert.equal(press('5n'), '-5');
  assert.equal(press('5nn'), '5');
  assert.equal(press('5+n8='), '-3');
});

test('entries are limited to 12 digits', () => {
  assert.equal(press('1234567890123'), '123456789012');
});

test('typing after equals starts a new number', () => {
  assert.equal(press('2+2=4'), '4');
  assert.equal(press('2+2=*2='), '8');
});

test('formatting matches the Java version', () => {
  assert.equal(format(-0), '0');
  assert.equal(format(1e15), '1e+15');
  assert.equal(format(-2.5), '-2.5');
  assert.equal(format(Infinity), 'Error');
  assert.equal(press('999999*999999='), '999998000001');
  assert.equal(press('9999999*9999999='), '9.999998e+13');
});

test('operations use inheritance', () => {
  const operations = [new Addition(), new Subtraction(), new Multiplication(), new Division()];
  assert.deepEqual(operations.map((op) => op.apply(6, 2)), [8, 4, 12, 3]);
  assert.ok(operations.every((op) => op instanceof Operation));
  assert.throws(() => new Operation('?'), TypeError);
});

test('state is encapsulated', () => {
  const calculator = run('42');
  assert.deepEqual(Object.keys(calculator), []);
  assert.throws(() => { calculator.display = '7'; }, TypeError);
});
