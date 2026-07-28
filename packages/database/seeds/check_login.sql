-- Check seeded users can login
SELECT name, role, badge_no, id_number, username, email, status
FROM users
WHERE id LIKE '5%'
ORDER BY role, name
LIMIT 20;

-- Verify the login lookup works for each
SELECT
  name, role, badge_no, id_number,
  CASE
    WHEN id_number IS NOT NULL THEN 'Login via: ' || id_number
    WHEN username IS NOT NULL THEN 'Login via: ' || username
    WHEN email IS NOT NULL THEN 'Login via: ' || email
    ELSE '❌ NO LOGIN METHOD'
  END as login_method,
  status
FROM users
WHERE id LIKE '5%'
ORDER BY role;
