 /**
 * Formats a given number or string to a currency string representation.
 * @param value - The number or string value to be formatted.
 * @param currency - The currency code to format the value into.
 * @param decimal - A boolean indicating if the formatted value should have decimal points.
 */
export function formatCurrency(
  value: number | string,
  currency: string = "NGN",
  decimal: boolean = true,
): string {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  const safeValue = isNaN(numericValue) ? 0 : numericValue;

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: decimal ? 2 : 0,
    maximumFractionDigits: decimal ? 2 : 0,
  });

  return formatter.format(safeValue);
}
