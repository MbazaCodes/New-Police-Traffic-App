// ============================================================
// POLICE HELPERS — input validation + search stubs
// No mock data. Validation is real; search hits Supabase.
// ============================================================

interface ValidationResult { valid: boolean; error?: string }

export function validatePlate(v: string): ValidationResult {
  if (!v?.trim()) return { valid: false, error: "Nambari ya gari inahitajika" };
  return { valid: true };
}
export function validateNida(v: string): ValidationResult {
  if (!v?.trim()) return { valid: false, error: "NIDA inahitajika" };
  if (!/^\d{20}$/.test(v.replace(/\s/g, ""))) return { valid: false, error: "NIDA lazima iwe nambari 20" };
  return { valid: true };
}
export function validateMobile(v: string): ValidationResult {
  if (!v?.trim()) return { valid: false, error: "Nambari ya simu inahitajika" };
  const d = v.replace(/\D/g, "");
  if (d.length < 9 || d.length > 12) return { valid: false, error: "Nambari ya simu si sahihi" };
  return { valid: true };
}
export function validateLicense(v: string): ValidationResult {
  if (!v?.trim()) return { valid: false, error: "Nambari ya leseni inahitajika" };
  return { valid: true };
}
export function validateName(v: string): ValidationResult {
  if (!v?.trim() || v.trim().length < 2) return { valid: false, error: "Jina linahitajika" };
  return { valid: true };
}
export function validateSerial(v: string): ValidationResult {
  if (!v?.trim() || v.trim().length < 4) return { valid: false, error: "S/N inahitajika" };
  return { valid: true };
}

// Search suggestions — returns empty; real autocomplete from Supabase
export function getSuggestions(_value: string, _type: string): string[] { return []; }

// Citizen lookup stub — real lookup via /api/search/citizen
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lookupCitizen(_query: string): any { return null; }

// Session-scoped new-record counters (resets on page reload)
export const newCitizenRecords: { id: string; name: string }[] = [];
export const newVehicleRecords: { id: string; plate: string }[] = [];

export function saveNewCitizen(data: { name: string; nida?: string; mobile?: string; [k: string]: unknown }) {
  const rec = { id: `CIT-${Date.now()}`, name: data.name };
  newCitizenRecords.unshift(rec);
  return rec;
}
export function saveNewVehicle(data: { plate: string; [k: string]: unknown }) {
  const rec = { id: `VEH-${Date.now()}`, plate: data.plate };
  newVehicleRecords.unshift(rec);
  return rec;
}
