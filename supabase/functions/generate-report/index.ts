// ===== TZ Police — Edge Function: generate-report =====
// Generates a PDF report for a given resource type + id (or aggregate).
// Mock implementation: writes a placeholder PDF to Supabase Storage and
// returns a signed URL. Real impl: use a PDF library (e.g. pdfkit, jsPDF,
// or a Chromium-based renderer) to produce the actual document.
//
// Trigger: POST /functions/v1/generate-report
// Body: {
//   type: "citation" | "incident" | "patrol" | "pf3" | "inspection" | "dashboard",
//   id?:   string,        // required for everything except "dashboard"
//   range?: { from: string, to: string }, // required for "dashboard"
//   format?: "pdf" | "csv"
// }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type ReportType =
  | "citation"
  | "incident"
  | "patrol"
  | "pf3"
  | "inspection"
  | "dashboard";

interface GenerateReportBody {
  type?: ReportType;
  id?: string;
  range?: { from?: string; to?: string };
  format?: "pdf" | "csv";
}

const BUCKET = "reports";

// Build a tiny valid PDF (single blank page) so the URL is actually openable.
function buildMinimalPdf(): Uint8Array {
  const header = "%PDF-1.4\n";
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    "4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td (TZ Police Report) Tj ET\nendstream\nendobj\n",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];
  const xrefOffsets: number[] = [];
  let pdf = header;
  for (const obj of objects) {
    xrefOffsets.push(new TextEncoder().encode(pdf).length);
    pdf += obj;
  }
  const xrefStart = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of xrefOffsets) {
    pdf += `${off.toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: GenerateReportBody = {};
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.type) {
    return new Response(
      JSON.stringify({ error: "Missing 'type' field" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (body.type !== "dashboard" && !body.id) {
    return new Response(
      JSON.stringify({ error: `Missing 'id' for type=${body.type}` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Server missing Supabase credentials" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // ===== Gather source data (mock summary) =====
  let summary = "";
  if (body.type === "dashboard") {
    const from = body.range?.from ?? "1970-01-01";
    const to = body.range?.to ?? new Date().toISOString().slice(0, 10);
    const { count: incidents } = await supabase
      .from("incidents").select("*", { count: "exact", head: true })
      .gte("date", from).lte("date", to);
    const { count: citations } = await supabase
      .from("citations").select("*", { count: "exact", head: true })
      .gte("date", from).lte("date", to);
    summary = `Dashboard report from ${from} to ${to} | incidents=${incidents ?? 0} | citations=${citations ?? 0}`;
  } else {
    summary = `${body.type} report for id=${body.id}`;
  }

  // ===== Build PDF =====
  const format = body.format ?? "pdf";
  const filename = `${body.type}-${body.id ?? "summary"}-${Date.now()}.${format}`;
  const bytes = buildMinimalPdf();

  const { error: uploadErr } = await supabase
    .storage
    .from(BUCKET)
    .upload(filename, bytes, {
      contentType: format === "csv" ? "text/csv" : "application/pdf",
      upsert: true,
    });

  if (uploadErr) {
    return new Response(
      JSON.stringify({ error: "Upload failed", details: String(uploadErr) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // Create a 1-hour signed URL
  const { data: signed, error: signedErr } = await supabase
    .storage
    .from(BUCKET)
    .createSignedUrl(filename, 3600);

  if (signedErr || !signed?.signedUrl) {
    return new Response(
      JSON.stringify({ error: "Could not sign URL", details: String(signedErr) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      type: body.type,
      id: body.id ?? null,
      summary,
      url: signed.signedUrl,
      filename,
      expires_in: 3600,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
