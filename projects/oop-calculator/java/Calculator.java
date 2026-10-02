import java.math.BigDecimal;
import java.math.MathContext;

/**
 * The calculator's state and rules, independent of any user interface.
 *
 * It works like a pocket calculator: each operation is applied as soon as the
 * next one is chosen, so 12 + 7 × 3 = gives 57. All fields are private; the
 * user interface can only press keys and read the display, which keeps the
 * state consistent (encapsulation).
 */
public class Calculator
{
    /** Maximum number of digits that can be typed into one number. */
    public static final int MAX_DIGITS = 12;

    private static final MathContext DISPLAY_PRECISION = new MathContext(12);

    private double accumulator;
    private Operation pendingOperation;
    private String entry;
    private boolean typingNumber;
    private String expression;
    private String error;

    public Calculator()
    {
        reset();
    }

    /** Resets the calculator to its starting state (the AC key). */
    public void clear()
    {
        reset();
    }

    private void reset()
    {
        accumulator = 0;
        pendingOperation = null;
        entry = "0";
        typingNumber = false;
        expression = "";
        error = null;
    }

    /** Types a digit from 0 to 9. */
    public void inputDigit(int digit)
    {
        if (digit < 0 || digit > 9) {
            throw new IllegalArgumentException("Digit must be between 0 and 9: " + digit);
        }
        if (error != null) {
            clear();
        }
        if (!typingNumber) {
            entry = String.valueOf(digit);
            typingNumber = true;
        }
        else if (countDigits(entry) < MAX_DIGITS) {
            entry = entry.equals("0") ? String.valueOf(digit)
                  : entry.equals("-0") ? "-" + digit
                  : entry + digit;
        }
    }

    /** Types a decimal point, if the current number does not already have one. */
    public void inputDecimalPoint()
    {
        if (error != null) {
            clear();
        }
        if (!typingNumber) {
            entry = "0.";
            typingNumber = true;
        }
        else if (!entry.contains(".")) {
            entry = entry + ".";
        }
    }

    /**
     * Chooses the next operation. Any pending operation is applied first, so
     * operations are evaluated from left to right. Choosing an operation twice
     * in a row replaces the first choice.
     */
    public void chooseOperation(Operation operation)
    {
        if (error != null) {
            return;
        }
        if (pendingOperation == null) {
            accumulator = currentValue();
        }
        else if (typingNumber) {
            if (!applyPending()) {
                return;
            }
        }
        pendingOperation = operation;
        typingNumber = false;
        expression = format(accumulator) + " " + operation.getSymbol();
    }

    /** Applies the pending operation and shows the result (the = key). */
    public void equals()
    {
        if (error != null || pendingOperation == null) {
            return;
        }
        String left = format(accumulator);
        String right = format(currentValue());
        String symbol = pendingOperation.getSymbol();
        if (applyPending()) {
            expression = left + " " + symbol + " " + right + " =";
            pendingOperation = null;
        }
    }

    /** Removes the last typed character of the current number. */
    public void backspace()
    {
        if (error != null || !typingNumber) {
            return;
        }
        entry = entry.substring(0, entry.length() - 1);
        if (entry.isEmpty() || entry.equals("-")) {
            entry = "0";
        }
    }

    /** Changes the sign of the number on the display (the ± key). */
    public void toggleSign()
    {
        if (error != null) {
            return;
        }
        if (pendingOperation != null && !typingNumber) {
            entry = "0";
            typingNumber = true;
        }
        entry = entry.startsWith("-") ? entry.substring(1) : "-" + entry;
    }

    /** The text to show on the main display. */
    public String getDisplay()
    {
        if (error != null) {
            return error;
        }
        if (pendingOperation != null && !typingNumber) {
            return format(accumulator);
        }
        return entry;
    }

    /** The smaller expression line above the display, for example "12 + 7 =". */
    public String getExpression()
    {
        return expression;
    }

    /** Whether the calculator is showing an error, such as division by zero. */
    public boolean hasError()
    {
        return error != null;
    }

    /** Formats a number for display, rounded to 12 significant digits. */
    public static String format(double value)
    {
        if (Double.isNaN(value) || Double.isInfinite(value)) {
            return "Error";
        }
        if (value == 0) {
            return "0";
        }
        BigDecimal rounded = new BigDecimal(value).round(DISPLAY_PRECISION).stripTrailingZeros();
        double magnitude = Math.abs(rounded.doubleValue());
        if (magnitude >= 1e12 || magnitude < 1e-9) {
            return rounded.toString().replace("E+", "e+").replace("E-", "e-");
        }
        return rounded.toPlainString();
    }

    private boolean applyPending()
    {
        try {
            double result = pendingOperation.apply(accumulator, currentValue());
            if (Double.isNaN(result) || Double.isInfinite(result)) {
                throw new ArithmeticException("Result is too large");
            }
            accumulator = result;
            entry = format(result);
            typingNumber = false;
            return true;
        }
        catch (ArithmeticException e) {
            error = e.getMessage();
            pendingOperation = null;
            expression = "";
            typingNumber = false;
            return false;
        }
    }

    private double currentValue()
    {
        return Double.parseDouble(entry);
    }

    private static int countDigits(String text)
    {
        int count = 0;
        for (char c : text.toCharArray()) {
            if (Character.isDigit(c)) {
                count++;
            }
        }
        return count;
    }
}
