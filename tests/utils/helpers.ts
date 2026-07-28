/**
 * Test utilities and shared helpers for the TZ Police Digital Platform.
 */

/** Generate a mock officer user for testing */
export function createMockOfficer(overrides = {}) {
  return {
    id: 'test-officer-001',
    badge_number: 'TPF-TEST-001',
    rank: 'Constable',
    station_id: 'station-001',
    first_name: 'Test',
    last_name: 'Officer',
    email: 'test.officer@tzpolice.go.tz',
    role: 'officer',
    is_active: true,
    ...overrides,
  };
}

/** Generate a mock citizen for testing */
export function createMockCitizen(overrides = {}) {
  return {
    id: 'test-citizen-001',
    national_id: 'TEST123456',
    first_name: 'Test',
    last_name: 'Citizen',
    phone: '+255700000000',
    email: 'test.citizen@example.com',
    ...overrides,
  };
}

/** Generate a mock citation for testing */
export function createMockCitation(overrides = {}) {
  return {
    id: 'test-citation-001',
    citation_number: 'CIT-2026-TEST-001',
    officer_id: 'test-officer-001',
    citizen_id: 'test-citizen-001',
    violation_type: 'speeding',
    fine_amount: 30000,
    status: 'pending',
    issued_at: new Date().toISOString(),
    ...overrides,
  };
}
