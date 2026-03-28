export interface RouteSegment {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  safetyScore?: number;
}
