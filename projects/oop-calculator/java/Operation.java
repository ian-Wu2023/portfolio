/**
 * A binary arithmetic operation, such as addition.
 *
 * Each concrete operation is a subclass that supplies its own symbol and
 * implementation of {@link #apply(double, double)}. Adding a new operation
 * means adding a new subclass; the {@link Calculator} does not change.
 */
public abstract class Operation
{
    private final String symbol;

    protected Operation(String symbol)
    {
        this.symbol = symbol;
    }

    /** The symbol shown on the calculator button and in the expression line. */
    public String getSymbol()
    {
        return symbol;
    }

    /**
     * Applies this operation to two operands.
     *
     * @throws ArithmeticException if the result is undefined, such as division by zero
     */
    public abstract double apply(double left, double right);

    @Override
    public String toString()
    {
        return symbol;
    }
}
