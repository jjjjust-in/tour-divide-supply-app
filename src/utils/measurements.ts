export type MeasurementSystem = 'metric' | 'imperial';

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
    return `${milesToKm(miles)} km`;
  }
  return `${roundToNearest5(miles)} mi`;
}

export function formatElevation(feet: number, system: MeasurementSystem): string {
  if (system === 'metric') {
    return `${feetToMeters(feet)} m`;
  }
  return `${roundToNearest5(feet)}'`;
}

export function getDistanceLabel(system: MeasurementSystem): string {
  return system === 'metric' ? 'km' : 'mi';
}

export function getElevationLabel(system: MeasurementSystem): string {
  return system === 'metric' ? 'm' : 'ft';
}
