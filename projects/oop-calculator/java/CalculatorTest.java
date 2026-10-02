import java.awt.Component;
import java.awt.Container;
import javax.swing.JButton;

/**
 * Tests for the calculator. Run with: java CalculatorTest
 * (No test framework is required, so it also runs directly in BlueJ.)
 */
public class CalculatorTest
{
    private static int passed;
    private static int failed;

    public static void main(String[] args)
    {
        testBasicOperations();
        testOperationsChainFromLeftToRight();
        testChoosingAnotherOperationReplacesThePreviousOne();
        testDecimalsAreRoundedForDisplay();
        testDivisionByZeroShowsErrorAndRecovers();
        testBackspaceAndSignToggle();
        testDigitLimit();
        testTypingAfterEqualsStartsANewNumber();
        testFormatting();
        testOperationsUseInheritance();
        testSwingPanelForwardsButtonPresses();

        System.out.println(passed + " passed, " + failed + " failed");
        if (failed > 0) {
            System.exit(1);
        }
    }

    private static void testBasicOperations()
    {
        assertEquals("12", press("7+5="), "addition");
        assertEquals("2", press("7-5="), "subtraction");
        assertEquals("35", press("7*5="), "multiplication");
        assertEquals("1.4", press("7/5="), "division");
        assertEquals("7 + 5 =", expressionAfter("7+5="), "expression line after equals");
    }

    private static void testOperationsChainFromLeftToRight()
    {
        assertEquals("57", press("12+7*3="), "12 + 7 × 3 = evaluates left to right");
        assertEquals("19", press("12+7*"), "pending result shown when the next operation is chosen");
        assertEquals("19 ×", expressionAfter("12+7*"), "expression line shows the pending operation");
    }

    private static void testChoosingAnotherOperationReplacesThePreviousOne()
    {
        assertEquals("2", press("5+-3="), "5 + then − gives 5 − 3");
        assertEquals("10", press("5+="), "5 + = reuses the shown number");
    }

    private static void testDecimalsAreRoundedForDisplay()
    {
        assertEquals("0.3", press("0.1+0.2="), "0.1 + 0.2 = 0.3, not 0.30000000000000004");
        assertEquals("0.5", press(".5"), "a leading decimal point becomes 0.5");
        assertEquals("1.5", press("1..5"), "a second decimal point is ignored");
        assertEquals("0.333333333333", press("1/3="), "12 significant digits");
    }

    private static void testDivisionByZeroShowsErrorAndRecovers()
    {
        Calculator calculator = run("8/0=");
        assertEquals("Cannot divide by zero", calculator.getDisplay(), "division by zero message");
        assertTrue(calculator.hasError(), "error state is set");
        type(calculator, "4");
        assertEquals("4", calculator.getDisplay(), "typing a digit clears the error");
        assertTrue(!calculator.hasError(), "error state is cleared");
    }

    private static void testBackspaceAndSignToggle()
    {
        assertEquals("12", press("123<"), "backspace removes the last digit");
        assertEquals("0", press("5<<"), "backspacing everything leaves 0");
        assertEquals("-5", press("5n"), "± negates the entry");
        assertEquals("5", press("5nn"), "± twice restores the sign");
        assertEquals("-3", press("5+n8="), "± after an operator starts a negative entry");
    }

    private static void testDigitLimit()
    {
        assertEquals("123456789012", press("1234567890123"), "entries are limited to 12 digits");
    }

    private static void testTypingAfterEqualsStartsANewNumber()
    {
        assertEquals("4", press("2+2=4"), "a digit after = starts a new number");
        assertEquals("8", press("2+2=*2="), "an operation after = continues from the result");
    }

    private static void testFormatting()
    {
        assertEquals("0", Calculator.format(-0.0), "negative zero shows as 0");
        assertEquals("1e+15", Calculator.format(1e15), "large numbers use scientific notation");
        assertEquals("-2.5", Calculator.format(-2.5), "negative decimals");
        assertEquals("Error", Calculator.format(Double.POSITIVE_INFINITY), "infinity is an error");
        assertEquals("999998000001", press("999999*999999="), "12-digit results stay in plain notation");
        assertEquals("9.999998e+13", press("9999999*9999999="), "larger results switch to scientific notation");
    }

    private static void testOperationsUseInheritance()
    {
        Operation[] operations = { new Addition(), new Subtraction(), new Multiplication(), new Division() };
        double[] expected = { 8, 4, 12, 3 };
        for (int i = 0; i < operations.length; i++) {
            assertEquals(String.valueOf(expected[i]), String.valueOf(operations[i].apply(6, 2)),
                operations[i].getClass().getSimpleName() + " is used through the Operation type");
        }
    }

    private static void testSwingPanelForwardsButtonPresses()
    {
        CalculatorPanel panel = new CalculatorPanel();
        for (String label : new String[] { "9", "×", "4", "=" }) {
            findButton(panel, label).doClick();
        }
        assertEquals("36", panel.getDisplayText(), "Swing buttons drive the calculator");
    }

    // ---- helpers ----

    /** Keys: digits, '.', + - * /, '=', '<' (backspace), 'n' (±), 'c' (clear). */
    private static String press(String keys)
    {
        return run(keys).getDisplay();
    }

    private static String expressionAfter(String keys)
    {
        return run(keys).getExpression();
    }

    private static Calculator run(String keys)
    {
        Calculator calculator = new Calculator();
        type(calculator, keys);
        return calculator;
    }

    private static void type(Calculator calculator, String keys)
    {
        for (char key : keys.toCharArray()) {
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
                default: calculator.inputDigit(key - '0');
            }
        }
    }

    private static JButton findButton(Container container, String label)
    {
        for (Component component : container.getComponents()) {
            if (component instanceof JButton && label.equals(component.getName())) {
                return (JButton) component;
            }
            if (component instanceof Container) {
                JButton found = findButton((Container) component, label);
                if (found != null) {
                    return found;
                }
            }
        }
        return null;
    }

    private static void assertEquals(String expected, String actual, String description)
    {
        if (expected.equals(actual)) {
            passed++;
        }
        else {
            failed++;
            System.out.println("FAIL: " + description + " — expected \"" + expected + "\" but was \"" + actual + "\"");
        }
    }

    private static void assertTrue(boolean condition, String description)
    {
        assertEquals("true", String.valueOf(condition), description);
    }
}
