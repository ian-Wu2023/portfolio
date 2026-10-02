/** Adds the right operand to the left operand. */
public class Addition extends Operation
{
    public Addition()
    {
        super("+");
    }

    @Override
    public double apply(double left, double right)
    {
        return left + right;
    }
}
