// @tz-police/maps — GPS, geocoding, and map utilities

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  position: LatLng;
  title: string;
  type: "incident" | "patrol" | "station" | "post";
  color?: string;
}

// Calculate distance between two points (Haversine formula)
export function calculateDistance(p1: LatLng, p2: LatLng): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Format coordinates for display
export function formatCoords(pos: LatLng): string {
  return `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`;
}

// Get bounding box for a set of markers
export function getBounds(markers: MapMarker[]): { north: number; south: number; east: number; west: number } | null {
  if (markers.length === 0) return null;
  const lats = markers.map((m) => m.position.lat);
  const lngs = markers.map((m) => m.position.lng);
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };
}

// Dar es Salaam default center
export const DSM_CENTER: LatLng = { lat: -6.8235, lng: 39.2695 };

// Mock geocoding (replace with Google Maps / Mapbox API)
export async function geocode(address: string): Promise<LatLng | null> {
  // Mock: return DSM center for any address
  console.log("[Maps] Geocode (mock):", address);
  return DSM_CENTER;
}

// Mock reverse geocoding
export async function reverseGeocode(pos: LatLng): Promise<string> {
  console.log("[Maps] Reverse geocode (mock):", pos);
  return "Dar es Salaam, Tanzania";
}
