export function numberRange(base: number, step: number, count: number): number[] {
  const range: number[] = [];
  const precision = Math.max(
    (base.toString().split(".")[1]?.length || 0),
    (step.toString().split(".")[1]?.length || 0)
  );

  range.push(base);

  for (let i = 1; i <= count; i++) {
    range.push(parseFloat((base - step * i).toFixed(precision)));
  }
  for (let i = 1; i <= count; i++) {
    range.push(parseFloat((base + step * i).toFixed(precision)));
  }

  return range.sort((a, b) => a - b);
}

