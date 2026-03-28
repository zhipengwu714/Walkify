export interface Restroom {
  id: string;
  name: string;
  source: 'openstreetmap' | 'nyc-open-data' | string;
  lat: number;
  lng: number;
  distanceMetres: number;
  accessible: boolean;
  openNow: boolean | null;
  hours: string;
  lastVerified: string | null;
}
