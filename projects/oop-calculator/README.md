# OOP Calculator (Java)

A calculator built to practise object-oriented design in Java: **inheritance**
for the arithmetic operations and **encapsulation** for the calculator's
state, with the user interface kept separate from the logic.

**Live demo:** https://ianwu.co.uk/projects/oop-calculator/ (a JavaScript port
of these classes, so it runs in the browser).

## Classes

| Class | Role |
| --- | --- |
| `Operation` | Abstract base class: a symbol and an `apply(left, right)` method |
| `Addition`, `Subtraction`, `Multiplication`, `Division` | Subclasses of `Operation`; `Division` rejects division by zero |
| `Calculator` | The calculator's state and rules, in private fields; evaluates left to right like a pocket calculator |
| `CalculatorPanel` | Swing interface that forwards button presses to a `Calculator` |
| `CalculatorApp` | Opens the window (`main`) |
| `CalculatorTest` | Tests with no external dependencies |

Adding an operation (for example, powers) means writing one new subclass of
`Operation` and adding a button; `Calculator` does not change.

## Run it

With Java 17 or later, from the `java` folder:

```sh
javac *.java
java CalculatorApp        # opens the calculator window
java CalculatorTest       # runs the tests
```

In **BlueJ**, choose *Project → Open Non BlueJ…*, select the `java` folder,
then right-click `CalculatorApp` and run `main`.

## Browser version

`calculator.js` mirrors the Java classes (`Operation` and its subclasses, and
`Calculator` with private `#fields`), and `app.js` connects it to the page.
Its tests are in `tests/calculator.test.mjs` at the repository root
(`npm test`).
