# Search Scenarios

## 1) Citizen Global Search

```sql
SELECT c.id, c.nida, c.first_name, c.last_name, c.phone_number
FROM citizens c
WHERE c.nida = '19850517123456789012'
	OR c.phone_number = '+255712345678'
	OR LOWER(c.last_name) = LOWER('Mushi');
```

## 2) Vehicle Lookup by Plate

```sql
SELECT v.id, v.plate_number, v.make, v.model, c.first_name, c.last_name
FROM vehicles v
JOIN citizens c ON c.id = v.citizen_id
WHERE v.plate_number = 'T001ABC';
```

## 3) Fine Lookup by Fine Number

```sql
SELECT f.fine_number, f.amount, f.status, f.issued_at, c.nida, o.mmic_number
FROM fines f
JOIN citizens c ON c.id = f.citizen_id
JOIN officers o ON o.id = f.officer_id
WHERE f.fine_number = 'FN-2026-000001';
```

## 4) Case Timeline by Citizen

```sql
SELECT cs.case_number, cs.case_type, cs.status, cs.opened_at, st.station_code
FROM cases cs
JOIN stations st ON st.id = cs.station_id
WHERE cs.citizen_id = 100
ORDER BY cs.opened_at DESC;
```

## 5) Wanted Person Search

```sql
SELECT wp.id, wp.risk_level, wp.active, c.nida, c.first_name, c.last_name
FROM wanted_persons wp
JOIN citizens c ON c.id = wp.citizen_id
WHERE wp.active = TRUE
ORDER BY wp.risk_level DESC, wp.listed_at DESC;
```

