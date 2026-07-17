# RBAC — Role-Based Access Control

## Role Hierarchy (8 roles)

```
SUPER_ADMIN (100)
  └── COMMANDER (90)
       └── REGIONAL_COMMANDER (80)
            └── DISTRICT_COMMANDER (70)
                 └── OFFICER (50)
                      ├── TRAFFIC_OFFICER (40)
                      └── INVESTIGATOR (40)
                           └── VIEWER (10)
```

## Permission Matrix

| Resource | SUPER_ADMIN | COMMANDER | REGIONAL | DISTRICT | OFFICER | TRAFFIC | INVESTIGATOR | VIEWER |
|----------|-------------|-----------|----------|----------|---------|---------|--------------|--------|
| Users | CRUD | R | — | — | — | — | — | — |
| Officers | CRUD | CRU | RU | RU | R | R | R | R |
| Stations | CRUD | CRU | R | R | R | R | R | R |
| Posts | CRUD | CRU | R | R | R | R | R | R |
| Assignments | CRUD | CRUD | CRU | CRU | R | R | R | R |
| Citations | CRUD | CRU | CRU | CRU | CRU | CRU | R | R |
| Incidents | CRUD | CRUD+assign | CRUD+assign | CRUD+assign | CRU | CR | CRU | R |
| Patrols | CRUD | CRU | CRU | CRU | CRU | CRU | R | R |
| Alerts | R+broadcast | R+broadcast | R+broadcast | R+broadcast | R | R | R | R |
| PF3 | CRUD | CRU | CRU | CRU | CR | CR | CRU | R |
| Reports | R | R | R | R | — | — | — | R |
| Audit Logs | R | R | — | — | — | — | — | — |
| Settings | RU | RU | R | R | R | R | R | R |

## Permission Functions

```typescript
import { canAccess } from "@tz-police/permissions";

// Check if user can perform action on resource
const allowed = canAccess("OFFICER", "citations", "create"); // true
const denied = canAccess("VIEWER", "incidents", "delete"); // false
```
