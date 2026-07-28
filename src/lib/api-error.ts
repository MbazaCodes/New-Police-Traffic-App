// Turn any thrown value (Error, Supabase PostgrestError, plain object)
// into a human-readable message. Previously routes did String(err),
// which renders Supabase error objects as "[object Object]".

type AnyErr = {
  message?: string; details?: string; hint?: string; code?: string;
} | Error | string | unknown;

export function errMsg(err: AnyErr): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const e = err as { message?: string; details?: string; hint?: string; code?: string };
    const parts = [e.message, e.details, e.hint].filter(Boolean);
    if (parts.length) return parts.join(" — ") + (e.code ? ` (${e.code})` : "");
    try { return JSON.stringify(err); } catch { /* circular */ }
  }
  return String(err);
}

/** Postgres unique_violation → friendly Swahili message */
export function uniqueViolationMsg(err: AnyErr): string | null {
  const e = err as { code?: string; message?: string; details?: string };
  if (e?.code !== "23505") return null;
  const src = `${e.message ?? ""} ${e.details ?? ""}`.toLowerCase();
  if (src.includes("badge"))     return "Namba ya badge tayari ipo kwenye mfumo.";
  if (src.includes("id_number")) return "Namba ya kitambulisho tayari ipo kwenye mfumo.";
  if (src.includes("phone"))     return "Namba ya simu tayari imesajiliwa.";
  if (src.includes("email"))     return "Barua pepe tayari imesajiliwa.";
  if (src.includes("username"))  return "Username tayari ipo.";
  return "Taarifa hii tayari ipo kwenye mfumo (rudufu).";
}
