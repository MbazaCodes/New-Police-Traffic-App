# API Routes

## Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/send-otp` | Send OTP to phone/email | None |
| POST | `/api/auth/verify-otp` | Verify OTP code | None |
| GET | `/api/auth/session` | Get current session | None |
| POST | `/api/auth/signout` | Sign out | Required |

## Officers

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/officers` | List all officers | ADMIN+ |
| GET | `/api/officers/:id` | Get officer by ID | ADMIN+ |
| POST | `/api/officers` | Create officer | SUPER_ADMIN, COMMANDER |
| PATCH | `/api/officers/:id` | Update officer | SUPER_ADMIN, COMMANDER |
| DELETE | `/api/officers/:id` | Delete officer | SUPER_ADMIN |

## Citations

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/citations` | List citations (filter by status/officer) | All authenticated |
| GET | `/api/citations/:id` | Get citation by ID | All authenticated |
| POST | `/api/citations` | Create citation | OFFICER+ |
| PATCH | `/api/citations/:id` | Update citation status | OFFICER+ |

## Incidents

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/incidents` | List incidents (filter by status) | All authenticated |
| GET | `/api/incidents/:id` | Get incident by ID | All authenticated |
| POST | `/api/incidents` | Create incident | OFFICER+ |
| PATCH | `/api/incidents/:id` | Update/assign incident | OFFICER+ |

## Stations & Posts

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/stations` | List stations | All authenticated |
| POST | `/api/stations` | Create station | SUPER_ADMIN, COMMANDER |
| PATCH | `/api/stations/:id` | Update station | SUPER_ADMIN, COMMANDER |
| DELETE | `/api/stations/:id` | Delete station | SUPER_ADMIN |
| GET | `/api/posts` | List posts | All authenticated |
| POST | `/api/posts` | Create post | SUPER_ADMIN, COMMANDER |

## Assignments

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/assignments` | List assignments | All authenticated |
| POST | `/api/assignments` | Assign officer to station/post | COMMANDER+ |
| DELETE | `/api/assignments/:id` | Unassign officer | COMMANDER+ |

## Search

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/search/vehicle?plate=T123ABC` | Search vehicle by plate | OFFICER+ |
| GET | `/api/search/citizen?query=Juma&type=name` | Search citizen by name/nida/mobile | OFFICER+ |

## Alerts & Patrols

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/alerts` | List alerts | All authenticated |
| POST | `/api/alerts` | Broadcast alert | COMMANDER+ |
| GET | `/api/patrols` | List active patrols | All authenticated |
| POST | `/api/patrols` | Start patrol | OFFICER+ |
| PATCH | `/api/patrols/:id` | End patrol | OFFICER+ |

## Reports & Audit

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/reports/summary` | Dashboard KPIs, trends | COMMANDER+ |
| GET | `/api/audit-logs` | Audit logs | SUPER_ADMIN, COMMANDER |
