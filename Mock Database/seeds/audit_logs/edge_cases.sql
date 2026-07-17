-- Auto-generated edge case injections
BEGIN;
UPDATE citizens SET nida = '99999999999999999999', quality_status = 'CORRUPTED' WHERE id % 500 = 0;
UPDATE citizens SET phone_number = '000', quality_status = 'WARNING' WHERE id % 70 = 0;
UPDATE vehicles SET registration_status = 'STOLEN', quality_status = 'WARNING' WHERE id % 300 = 0;
UPDATE insurance_policies SET policy_status = 'EXPIRED' WHERE id % 40 = 0;
UPDATE officers SET is_corrupt_flag = TRUE WHERE id % 45 = 0;
UPDATE citizens SET is_deleted = TRUE WHERE id % 1000 = 0;
UPDATE vehicle_ownership_history SET is_circular_edge_case = TRUE WHERE id % 200 = 0;
UPDATE licenses SET status = 'FAKE', quality_status = 'CORRUPTED' WHERE id % 120 = 0;
COMMIT;
