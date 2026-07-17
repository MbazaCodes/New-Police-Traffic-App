# Performance Tests

## Objective
Validate indexed query performance for common operational reports.

## Setup

1. Load full dataset.
2. Run ANALYZE on all tables.
3. Execute each query 5 times and capture median latency.

## Benchmarks

### 1) Daily Fine Summary

```sql
EXPLAIN ANALYZE
SELECT DATE(issued_at) AS day, COUNT(*) AS fine_count, SUM(amount) AS total_amount
FROM fines
GROUP BY DATE(issued_at)
ORDER BY day DESC;
```

### 2) Officer Productivity

```sql
EXPLAIN ANALYZE
SELECT officer_id, COUNT(*) AS cases_opened
FROM cases
GROUP BY officer_id
ORDER BY cases_opened DESC;
```

### 3) Citizen Compliance View

```sql
EXPLAIN ANALYZE
SELECT c.id, c.nida, COUNT(f.id) AS total_fines
FROM citizens c
LEFT JOIN fines f ON f.citizen_id = c.id
GROUP BY c.id, c.nida
ORDER BY total_fines DESC
LIMIT 100;
```

## Acceptance Criteria

- Indexed lookups should stay sub-100ms on local test environments.
- Aggregation queries should remain stable and avoid full-table sort spill.
- Query plans should prefer existing btree indexes where applicable.

