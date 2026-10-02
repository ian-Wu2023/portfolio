/** Divides the left operand by the right operand. */
public class Division extends Operation
{
    public Division()
    {
        super("÷");
    }

    @Override
    public double apply(double left, double right)
    {
        if (right == 0) {
            throw new ArithmeticException("Cannot divide by zero");
        }
        return left / right;
    }
}
