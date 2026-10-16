// Decimal GB. These are explanatory arithmetic models, not benchmarks.
export function transferSeconds(gigabytes: number, utilization: number) {
  return gigabytes / (300 * utilization / 100);
}
export function memoryRegions(carveout: number) {
  const remaining = 128 - carveout;
  const shared = Math.min(remaining * .8, Math.max(remaining * .5, remaining - 16));
  return { dedicated: carveout, shared, cpuOnly: remaining - shared, gpuVisible: carveout + shared };
}
export function weightGigabytes(parametersBillions: number, bits: number) {
  return parametersBillions * bits / 8;
}
