# Tests

This directory contains all test suites for the TZ Police Digital Platform.

## Structure

```
tests/
├── unit/              # Isolated unit tests (no external dependencies)
│   ├── auth/           # Authentication logic tests
│   ├── database/       # Query builder and schema tests
│   ├── permissions/    # RBAC permission tests
│   ├── analytics/      # Analytics calculation tests
│   ├── maps/           # Geocoding/location tests
│   ├── notifications/  # Notification dispatch tests
│   └── sdk/            # SDK integration tests
├── integration/        # Multi-module integration tests
│   ├── api/            # API route integration tests
│   ├── auth-flow/      # Full authentication flow tests
│   ├── database-sync/  # Database synchronization tests
│   └── offline-sync/   # Offline sync reconciliation tests
├── e2e/                # End-to-end browser tests
│   ├── admin-portal/   # Admin dashboard E2E
│   ├── officer-pwa/    # Officer mobile app E2E
│   └── citizen-portal/ # Citizen portal E2E
├── fixtures/           # Test seed data and mock objects
└── utils/              # Shared test helpers and setup
```

## Running Tests

```bash
# All tests
npm run test

# Specific suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```
