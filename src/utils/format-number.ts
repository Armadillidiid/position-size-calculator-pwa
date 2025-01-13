/**
 * Formats a number according to the specified locale and options.
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions & { disableDecimal?: boolean },
  locale: string = "en-NG",
): string {
  const { disableDecimal, ...intlOptions } = options || {};

  if (disableDecimal) {
    intlOptions.minimumFractionDigits = 0;
    intlOptions.maximumFractionDigits = 0;
  } else {
    intlOptions.minimumFractionDigits = 2;
  }

  return new Intl.NumberFormat(locale, intlOptions).format(value);
}
