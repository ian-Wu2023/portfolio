import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Font;
import java.awt.GridLayout;
import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.SwingConstants;

/**
 * Swing user interface for a {@link Calculator}.
 *
 * The panel only forwards button presses to the calculator and redraws the
 * display; all arithmetic and state live in the Calculator class, so the
 * interface can be replaced without touching the logic.
 */
public class CalculatorPanel extends JPanel
{
    private static final long serialVersionUID = 1L;

    private static final Color BACKGROUND = new Color(0x111827);
    private static final Color KEY = new Color(0x1F2937);
    private static final Color OPERATOR_KEY = new Color(0x2563EB);
    private static final Color TEXT = new Color(0xF3F4F6);
    private static final Color MUTED_TEXT = new Color(0x9CA3AF);

    private final Calculator calculator = new Calculator();
    private final JLabel expressionLabel = new JLabel(" ", SwingConstants.RIGHT);
    private final JLabel displayLabel = new JLabel("0", SwingConstants.RIGHT);

    public CalculatorPanel()
    {
        super(new BorderLayout(0, 12));
        setBackground(BACKGROUND);
        setBorder(BorderFactory.createEmptyBorder(16, 16, 16, 16));

        expressionLabel.setForeground(MUTED_TEXT);
        expressionLabel.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 16));
        displayLabel.setForeground(TEXT);
        displayLabel.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 36));

        JPanel screen = new JPanel(new GridLayout(2, 1));
        screen.setOpaque(false);
        screen.add(expressionLabel);
        screen.add(displayLabel);
        add(screen, BorderLayout.NORTH);
        add(createKeypad(), BorderLayout.CENTER);
    }

    private JPanel createKeypad()
    {
        JPanel keypad = new JPanel(new GridLayout(5, 4, 8, 8));
        keypad.setOpaque(false);

        keypad.add(key("AC", KEY, () -> calculator.clear()));
        keypad.add(key("±", KEY, () -> calculator.toggleSign()));
        keypad.add(key("⌫", KEY, () -> calculator.backspace()));
        keypad.add(operatorKey(new Division()));

        int[][] digitRows = { { 7, 8, 9 }, { 4, 5, 6 }, { 1, 2, 3 } };
        Operation[] rowOperations = { new Multiplication(), new Subtraction(), new Addition() };
        for (int row = 0; row < digitRows.length; row++) {
            for (int digit : digitRows[row]) {
                keypad.add(digitKey(digit));
            }
            keypad.add(operatorKey(rowOperations[row]));
        }

        keypad.add(digitKey(0));
        keypad.add(key(".", KEY, () -> calculator.inputDecimalPoint()));
        keypad.add(new JLabel());
        keypad.add(key("=", OPERATOR_KEY, () -> calculator.equals()));
        return keypad;
    }

    private JButton digitKey(int digit)
    {
        return key(String.valueOf(digit), KEY, () -> calculator.inputDigit(digit));
    }

    private JButton operatorKey(Operation operation)
    {
        return key(operation.getSymbol(), OPERATOR_KEY, () -> calculator.chooseOperation(operation));
    }

    private JButton key(String label, Color colour, Runnable action)
    {
        JButton button = new JButton(label);
        button.setName(label);
        button.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 20));
        button.setForeground(TEXT);
        button.setBackground(colour);
        button.setFocusPainted(false);
        button.setBorder(BorderFactory.createEmptyBorder(12, 12, 12, 12));
        button.addActionListener(event -> {
            action.run();
            refresh();
        });
        return button;
    }

    private void refresh()
    {
        String expression = calculator.getExpression();
        expressionLabel.setText(expression.isEmpty() ? " " : expression);
        displayLabel.setText(calculator.getDisplay());
    }

    /** The text currently shown on the display (used by the tests). */
    public String getDisplayText()
    {
        return displayLabel.getText();
    }
}
