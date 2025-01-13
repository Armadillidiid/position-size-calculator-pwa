export function calculatePositionSize(
  riskPercentage: number,
  stopLoss: number,
  pipValue: number,
): number {
  return riskPercentage / (stopLoss * pipValue);
}
