import javax.swing.JFrame;
import javax.swing.SwingUtilities;

/** Opens the calculator window. In BlueJ, right-click this class and run main. */
public class CalculatorApp
{
    public static void main(String[] args)
    {
        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("OOP Calculator");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setContentPane(new CalculatorPanel());
            frame.setSize(340, 460);
            frame.setLocationRelativeTo(null);
            frame.setVisible(true);
        });
    }
}
