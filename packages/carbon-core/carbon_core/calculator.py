from decimal import Decimal
from typing import Union

class CarbonCalculator:
    """
    Performs deterministic calculations for carbon emissions.
    Formula: Emission = Quantity * Factor Value
    """
    @staticmethod
    def calculate(quantity: Union[int, float, Decimal], factor_value: Union[int, float, Decimal]) -> Decimal:
        """
        Calculates carbon emissions as a Decimal.
        Ensures input types are coerced to Decimal for precision.
        Raises ValueError if quantity is negative or if inputs are invalid.
        """
        try:
            qty_dec = Decimal(str(quantity)) if not isinstance(quantity, Decimal) else quantity
            factor_dec = Decimal(str(factor_value)) if not isinstance(factor_value, Decimal) else factor_value
        except (ValueError, TypeError, ArithmeticError) as e:
            raise ValueError(f"Invalid numeric input: {str(e)}")

        if qty_dec < Decimal('0'):
            raise ValueError("Quantity cannot be negative")

        result = qty_dec * factor_dec
        if result < Decimal('0'):
            raise ValueError("Calculated emission cannot be negative")

        return result
