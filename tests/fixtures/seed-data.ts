/**
 * Seed data for integration/e2e tests.
 * Use these fixtures instead of hitting production data.
 */

export const TEST_REGIONS = [
  { id: 'region-dar', name: 'Dar es Salaam', code: 'DAR' },
  { id: 'region-dodoma', name: 'Dodoma', code: 'DOD' },
];

export const TEST_STATIONS = [
  { id: 'station-001', name: 'Central Police Station', region_id: 'region-dar', post_code: 'TPF-CENTRAL' },
  { id: 'station-002', name: 'Kinondoni Police Station', region_id: 'region-dar', post_code: 'TPF-KINONDONI' },
];

export const TEST_OFFICERS = [
  { id: 'officer-001', badge_number: 'TPF-001', rank: 'Inspector', station_id: 'station-001', role: 'station_commander' },
  { id: 'officer-002', badge_number: 'TPF-002', rank: 'Sergeant', station_id: 'station-001', role: 'officer' },
];

export const TEST_VIOLATION_TYPES = [
  { code: 'SPEEDING', label: 'Speeding', base_fine: 30000 },
  { code: 'NO_LICENSE', label: 'No Valid License', base_fine: 50000 },
  { code: 'DUI', label: 'Driving Under Influence', base_fine: 100000 },
  { code: 'NO_HELMET', label: 'No Helmet', base_fine: 10000 },
];
