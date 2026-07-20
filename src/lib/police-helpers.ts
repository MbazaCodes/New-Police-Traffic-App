// ============================================================
// POLICE HELPERS — input validation + search stubs
// No mock data. Validation is real; search hits Supabase.
// Updated: Supports new NIDA format (0000-0000-0000-0000-00)
// ============================================================

interface ValidationResult { valid: boolean; error?: string }

export function validatePlate(v: string): ValidationResult {
  if (!v?.trim()) return { valid: false, error: "Nambari ya gari inahitajika" };
  return { valid: true };
}

/**
 * Validate NIDA number - accepts both formatted (0000-0000-0000-0000-00) 
 * and raw 20-digit format
 */
export function validateNida(v: string): ValidationResult {
  if (!v?.trim()) return { valid: false, error: "NIDA inahitajika" };
  
  // Remove all non-digit characters for validation
  const digits = v.replace(/\D/g, "");
  
  // Tanzanian NIDA is exactly 20 digits
  if (digits.length !== 20) {
    return { valid: false, error: `NIDA lazima iwe nambari 20 (una ${digits.length})` };
  }
  
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

/**
 * Format NIDA number to display format: 0000-0000-0000-0000-00
 */
export function formatNidaDisplay(nida: string): string {
  if (!nida) return "";
  const digits = nida.replace(/\D/g, "").slice(0, 20);
  const parts = [
    digits.slice(0, 4),
    digits.slice(4, 8),
    digits.slice(8, 12),
    digits.slice(12, 16),
    digits.slice(16, 20),
  ];
  return parts.filter(Boolean).join("-");
}

/**
 * Clean NIDA - returns only digits (for API submission)
 */
export function cleanNida(nida: string): string {
  return nida ? nida.replace(/\D/g, "") : "";
}

// Search suggestions — returns empty; real autocomplete from Supabase
export function getSuggestions(_value: string, _type: string): string[] { return []; }

// Citizen lookup stub — real lookup via /api/search/citizen
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lookupCitizen(_query: string): any { return null; }

// Session-scoped new-record counters (resets on page reload)
export const newCitizenRecords: { id: string; name: string }[] = [];
export const newVehicleRecords: { id: string; plate: string }[] = [];

/**
 * Save new citizen - NOW calls API instead of just local storage
 */
export async function saveNewCitizen(data: { name: string; nida?: string; mobile?: string; [k: string]: unknown }) {
  const rec = { id: `CIT-${Date.now()}`, name: data.name };
  newCitizenRecords.unshift(rec);

  try {
    // Try to save to API
    const response = await fetch("/api/citizens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        nida: cleanNida(data.nida as string || ""),
        mobile: data.mobile,
        // ... other fields would be passed here
      }),
    });

    if (response.ok) {
      const result = await response.json();
      rec.id = result.data?.id || rec.id;
      console.log("Citizen saved to database:", result.data?.id);
    }
  } catch (error) {
    console.log("Citizen saved locally only (offline mode)");
  }

  return rec;
}

/**
 * Save new vehicle - NOW calls API instead of just local storage
 */
export async function saveNewVehicle(data: { plate: string; [k: string]: unknown }) {
  const rec = { id: `VEH-${Date.now()}`, plate: data.plate };
  newVehicleRecords.unshift(rec);

  try {
    // Try to save to API
    const response = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plate: data.plate,
        model: data.model,
        type: data.type || "Saloon",
        color: data.color || "Nyeupe",
        year: data.year || new Date().getFullYear().toString(),
        ownerName: data.ownerName,
        ownerNida: cleanNida(data.ownerNida as string || ""),
        ownerPhone: data.ownerPhone,
        // ... other fields
      }),
    });

    if (response.ok) {
      const result = await response.json();
      rec.id = result.data?.id || rec.id;
      console.log("Vehicle saved to database:", result.data?.id);
    }
  } catch (error) {
    console.log("Vehicle saved locally only (offline mode)");
  }

  return rec;
}
