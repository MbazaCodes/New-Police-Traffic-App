-- Add missing TPF roles to user_role enum
-- Based on Tanzania Police Force Organization Structure

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'igp';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'deputy-igp';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'prison-liaison';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'regional-clerk';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'station-commander';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'regional-commissioner';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super-admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'system-admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'viewer';

-- Internal Audit Unit
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'chief-internal-auditor';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'internal-auditor';

-- Communication & PR Unit
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'communications-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'pr-officer';

-- Legal Services Unit
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'legal-officer';

-- Internal Monitoring & Evaluation
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'monitoring-officer';

-- ICT Unit
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ict-officer';

-- Procurement
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'procurement-officer';

-- TPF Corporation
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'corporation-officer';

-- Operations & Training
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operations-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'training-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'specialized-operations-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'traffic-management-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'development-officer';

-- Criminal Investigation (CID expanded)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'state-security-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'crimes-against-persons-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'property-crimes-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'special-investigation-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'financial-crimes-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'firearms-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'terrorism-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'interpol-officer';

-- Bureau of Criminal Intelligence
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'criminal-intelligence-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'criminal-analysis-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'integrity-officer';

-- Forensic Bureau
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'forensic-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'cyber-forensic-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'forensic-science-officer';

-- Community Policing
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'community-engagement-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'gender-child-protection-officer';

-- Finance & Logistics
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'finance-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'accounts-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'quartermaster';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'planning-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'transport-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'estate-officer';

-- HR Management & Administration
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'hr-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'administration-officer';

-- Zanzibar Police Division
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'zanzibar-hr-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'zanzibar-operations-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'zanzibar-cid-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'zanzibar-intelligence-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'zanzibar-finance-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'zanzibar-community-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'zanzibar-forensic-officer';
