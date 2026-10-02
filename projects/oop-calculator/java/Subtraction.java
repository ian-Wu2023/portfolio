/** Subtracts the right operand from the left operand. */
public class Subtraction extends Operation
{
    public Subtraction()
    {
        super("−");
    }

    @Override
    public double apply(double left, double right)
    {
        return left - right;
    }
}
