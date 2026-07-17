# Search Tests

## Objective
Validate correctness and speed of key search paths used in traffic enforcement workflows.

## Test Cases

1. Search citizen by NIDA returns exactly one record.
2. Search citizen by last name returns ordered list with pagination.
3. Search vehicle by plate returns owner details.
4. Search fine by fine_number returns fine + officer + citizen.
5. Search case by case_number returns station and officer links.
6. Search wanted persons by active and risk level returns expected ordering.

## Validation

- Confirm no false positives on exact key searches.
- Confirm joins return non-null foreign records.
- Confirm indexes are used on high-cardinality lookups using EXPLAIN ANALYZE.

