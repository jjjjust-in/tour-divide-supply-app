export type MeasurementSystem = 'metric' | 'imperial';

/**
 * The app's one number format: whole numbers, no comma up to four digits
 * (1300, 7985), commas from five digits up (11,958 and 200,000).
 */
export function formatNumber(value: number): string {
  const n = Math.round(value);
  return Math.abs(n) < 10000 ? String(n) : n.toLocaleString('en-US');
}

function roundToNearest5(num: number): number {
  return Math.round(num / 5) * 5;
}

export function milesToKm(miles: number): number {
  return roundToNearest5(miles * 1.60934);
}

export function feetToMeters(feet: number): number {
  return roundToNearest5(feet * 0.3048);
}

export function formatDistance(miles: number, system: MeasurementSystem): string {
  if (system === 'metric') {
    return `${formatNumber(milesToKm(miles))} km`;
  }
  return `${formatNumber(roundToNearest5(miles))} mi`;
}

export function formatElevation(feet: number, system: MeasurementSystem): string {
  if (system === 'metric') {
    return `${formatNumber(feetToMeters(feet))} m`;
  }
  return `${formatNumber(roundToNearest5(feet))}'`;
}

export function getDistanceLabel(system: MeasurementSystem): string {
  return system === 'metric' ? 'km' : 'mi';
}

export function getElevationLabel(system: MeasurementSystem): string {
  return system === 'metric' ? 'm' : 'ft';
}
