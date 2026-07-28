// Ownership History API — migrated to withAuthAny() for centralized auth + audit
// GET  /api/ownership?type=vehicle|device|property&id=UUID → full history
// POST /api/ownership → transfer/update ownership (auto-audited)
import { withAuthAny } from "@/lib/api-guard";
import { query, isDbEnabled } from "@/lib/db/client";

const TABLE: Record<string, string> = {
  vehicle:  "vehicle_ownership",
  device:   "device_ownership",
  property: "property_ownership_log",
};

const ID_COL: Record<string, string> = {
  vehicle:  "vehicle_id",
  device:   "device_id",
  property: "property_id",
};

// GET /api/ownership → list ownership history for an asset
export const GET = withAuthAny("ownership", async ({ searchParams }) => {
  if (!isDbEnabled()) return { ok: true, data: [] };

  const type = searchParams.get("type") ?? "vehicle";
  const id   = searchParams.get("id") ?? "";
  if (!id) return { ok: false, error: "ID inahitajika", status: 400 };

  const table = TABLE[type] ?? TABLE.vehicle;
  const idCol = ID_COL[type] ?? "vehicle_id";

  const rows = await query(
    `SELECT * FROM ${table} WHERE ${idCol} = $1 ORDER BY created_at DESC`,
    [id]
  );
  return { ok: true, data: rows, total: rows.length };
});

// POST /api/ownership → transfer ownership (auto-audited)
export const POST = withAuthAny("ownership", async ({ body, session }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const {
    type, asset_id, owner_name, owner_nida, owner_phone,
    owner_citizen_id, status, transfer_reason, notes, attachments,
  } = body;

  if (!type || !asset_id || !owner_name || !status) {
    return {
      ok: false,
      error: "type, asset_id, owner_name, status vinahitajika",
      status: 400,
    };
  }

  const recordedById   = session.user.id;
  const recordedByName = session.user.name ?? "";
  const recordedByRole = session.user.role ?? "";

  if (type === "vehicle") {
    const rows = await query(
      `SELECT transfer_vehicle_ownership($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [asset_id, owner_name, owner_nida ?? null, owner_phone ?? null,
       owner_citizen_id ?? null, transfer_reason ?? "other", status,
       notes ?? null, recordedById, recordedByName, recordedByRole]
    );
    return { ok: true, data: rows[0], status: 201 };
  }

  if (type === "device") {
    const rows = await query(
      `SELECT transfer_device_ownership($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [asset_id, owner_name, owner_nida ?? null, owner_phone ?? null,
       owner_citizen_id ?? null, transfer_reason ?? "other", status,
       notes ?? null, recordedById, recordedByName, recordedByRole]
    );
    return { ok: true, data: rows[0], status: 201 };
  }

  if (type === "property") {
    // Close previous, insert new
    await query(
      `UPDATE property_ownership_log
       SET is_current_owner=FALSE, owned_until=CURRENT_DATE,
           status='transferred', transfer_reason=$2, updated_at=NOW()
       WHERE property_id=$1 AND is_current_owner=TRUE`,
      [asset_id, transfer_reason ?? "other"]
    );
    const rows = await query(
      `INSERT INTO property_ownership_log
       (property_id,owner_citizen_id,owner_name,owner_nida,owner_phone,
        status,transfer_reason,notes,recorded_by_id,recorded_by_name,
        recorded_by_role,attachments,is_current_owner)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,TRUE) RETURNING *`,
      [asset_id, owner_citizen_id ?? null, owner_name,
       owner_nida ?? null, owner_phone ?? null,
       status, transfer_reason ?? "other", notes ?? null,
       recordedById, recordedByName, recordedByRole,
       JSON.stringify(attachments ?? [])]
    );
    return { ok: true, data: rows[0], status: 201 };
  }

  return { ok: false, error: "Aina batili: vehicle | device | property", status: 400 };
});
