export function numberRange(
  base: number,
  step: number,
  count: number,
): number[] {
  const range: number[] = [];
  range.push(base);

  for (let i = 1; i <= count; i++) {
    range.push(parseFloat((base - step * i).toFixed(1)));
  }
  for (let i = 1; i <= count; i++) {
    range.push(parseFloat((base + step * i).toFixed(1)));
  }
  return range.sort((a, b) => a - b);
}
