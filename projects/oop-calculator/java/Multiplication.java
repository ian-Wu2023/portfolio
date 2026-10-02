/** Multiplies the two operands. */
public class Multiplication extends Operation
{
    public Multiplication()
    {
        super("×");
    }

    @Override
    public double apply(double left, double right)
    {
        return left * right;
    }
}
