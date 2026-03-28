export interface DensityPoint {
  lat: number;
  lng: number;
  density: number;
}

const HOTSPOTS = [
  { lat: 40.7580, lng: -73.9855, base: 1.00 }, // Times Square
  { lat: 40.7527, lng: -73.9772, base: 0.95 }, // Grand Central
  { lat: 40.7506, lng: -73.9971, base: 0.90 }, // Penn Station
  { lat: 40.7549, lng: -73.9840, base: 0.85 }, // Rockefeller Center
  { lat: 40.7501, lng: -73.9878, base: 0.80 }, // Herald Square
  { lat: 40.7614, lng: -73.9776, base: 0.70 }, // Midtown East
  { lat: 40.7127, lng: -74.0059, base: 0.85 }, // City Hall / Fulton
  { lat: 40.7069, lng: -74.0113, base: 0.80 }, // Wall Street
  { lat: 40.7234, lng: -73.9987, base: 0.65 }, // Soho
  { lat: 40.7359, lng: -73.9911, base: 0.85 }, // Union Square
  { lat: 40.7411, lng: -73.9897, base: 0.70 }, // Flatiron
  { lat: 40.7465, lng: -74.0014, base: 0.65 }, // Chelsea
  { lat: 40.7379, lng: -74.0022, base: 0.70 }, // Meatpacking
  { lat: 40.7681, lng: -73.9819, base: 0.75 }, // Columbus Circle
  { lat: 40.7264, lng: -73.9815, base: 0.65 }, // East Village
  { lat: 40.7135, lng: -73.9613, base: 0.75 }, // Williamsburg
  { lat: 40.7308, lng: -74.0028, base: 0.55 }, // Washington Square
];

const HOURLY_MULTIPLIER = [
  0.05, 0.04, 0.03, 0.03, 0.05, 0.12,
  0.30, 0.65, 0.85, 0.80, 0.70, 0.75,
  0.85, 0.80, 0.70, 0.72, 0.85, 0.95,
  0.90, 0.75, 0.65, 0.55, 0.40, 0.20,
];

// Returns one weighted point per hotspot — Google Maps heatmap handles the blur.
export function getMockDensityPoints(hour: number): DensityPoint[] {
  const multiplier = HOURLY_MULTIPLIER[hour] ?? 0.1;
  return HOTSPOTS.map((h) => ({
    lat: h.lat,
    lng: h.lng,
    density: Math.round(h.base * multiplier * 100) / 100,
  }));
}
