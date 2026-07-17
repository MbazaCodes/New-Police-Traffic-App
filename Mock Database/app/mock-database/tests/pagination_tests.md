# Pagination Tests

## Objective
Ensure stable and performant pagination for large listing endpoints.

## Baseline Query Pattern

```sql
SELECT id, fine_number, issued_at
FROM fines
ORDER BY issued_at DESC, id DESC
LIMIT 50 OFFSET 0;
```

## Test Cases

1. Page 1, 2, 3 return non-overlapping records.
2. Last page returns remaining records only.
3. Sorting remains deterministic when timestamps are equal (id tie-breaker).
4. Large OFFSET behavior remains acceptable under load.
5. Cursor-based alternative validates no duplicates/misses during inserts.

## Acceptance Criteria

- No duplicate IDs across page boundaries.
- No skipped IDs during deterministic snapshot tests.
- Query latency remains within SLA for page sizes 20, 50, 100.

