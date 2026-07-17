# Data Standards

## Number Formats

1. NIDA
- Exactly 20 numeric digits.
- Regex: ^[0-9]{20}$
- Example: 19850517123456789012

2. Driver License
- Exactly 10 digits.
- Must start with 4.
- Regex: ^4[0-9]{9}$
- Example: 4000000001

3. Vehicle Plate
- No spaces.
- Format: T001ABC
- Regex: ^T[0-9]{3}[A-Z]{3}$
- Sequence logic:
	- Numeric segment increments 001..999.
	- After 999, letter suffix increments: ABC -> ABD -> ABE ...

4. Officer MMIC
- Tanzania-style letter + 4 digits.
- Allowed prefix letters: F, G, H, J, K.
- Regex: ^[FGHJK][0-9]{4}$
- Example: F3456

5. Fine Number
- Format: FN-2026-000001
- Regex: ^FN-2026-[0-9]{6}$

6. Case Number
- Format: TZP-2026-000001
- Regex: ^TZP-2026-[0-9]{6}$

7. IMEI
- Exactly 15 digits.
- Regex: ^[0-9]{15}$
- Example: 358423091234567

## Data Quality Rules

- All keys and references are generated to satisfy foreign key constraints.
- Date ranges are realistic and internally consistent.
- Status fields use controlled values only.
- Seed generation is deterministic for reproducible test runs.

