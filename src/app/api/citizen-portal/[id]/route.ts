// Citizen portal main route — full profile with all fields
// UPDATED: Now fetches citizen_conduct_points and driver_points from proper tables
import { NextResponse } from "next/server";
import { getDbAdmin, query } from "@/lib/db/client";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const accountId = (await params).id;
    const admin = getDbAdmin() as any;

    // Fetch account
    const { data: account } = await admin
      .from("citizen_accounts").select("*").eq("id", accountId).maybeSingle();

    if (!account) return NextResponse.json({ error: "Akaunti haipatikani" }, { status: 404 });

    let citizenId = account.citizen_id;

    // Auto-create citizen record if missing
    if (!citizenId) {
      try {
        const name = account.cached_name || account.phone || "Raia";
        const parts = name.trim().split(" ");
        // Try to find existing citizen by phone/nida first
        let existingCit = null;
        if (account.phone) {
          const { data: byPhone } = await admin.from("citizens").select("id").eq("mobile", account.phone).maybeSingle();
          existingCit = byPhone;
        }
        if (!existingCit && account.nida) {
          const { data: byNida } = await admin.from("citizens").select("id").eq("nida", account.nida).maybeSingle();
          existingCit = byNida;
        }
        if (existingCit?.id) {
          citizenId = existingCit.id;
          await admin.from("citizen_accounts").update({ citizen_id: citizenId }).eq("id", accountId);
        } else {
          // Create new citizen — only use columns that definitely exist
          const insertData: any = {
            name,
            first_name: parts[0] || null,
            last_name: parts.slice(1).join(" ") || null,
            mobile: account.phone || null,
          };
          if (account.nida) insertData.nida = account.nida;
          if (account.email) insertData.email = account.email;
          const { data: newCit, error: citErr } = await admin.from("citizens").insert(insertData).select("id").single();
          if (citErr) console.warn("[AUTO CREATE CITIZEN ERROR]", citErr.message);
          if (newCit?.id) {
            citizenId = newCit.id;
            await admin.from("citizen_accounts").update({ citizen_id: citizenId }).eq("id", accountId);
          }
        }
      } catch (e) { console.warn("[AUTO CREATE CITIZEN]", e); }
    }

    // Fetch full citizen profile
    let citizen: any = null;
    if (citizenId) {
      const { data } = await admin.from("citizens").select("*").eq("id", citizenId).maybeSingle();
      citizen = data;
    }

    const currentYear = new Date().getFullYear();

    // ── Fetch points from proper tables ────────────────────────────────────────
    let citizenPointsData: any = null;
    let driverPointsData: any = null;
    let pointsDeductions: any[] = [];

    if (citizenId) {
      // Citizen conduct points
      const { data: cpData } = await admin
        .from("citizen_conduct_points").select("*")
        .eq("citizen_id", citizenId).eq("year", currentYear).maybeSingle();
      citizenPointsData = cpData;

      // Driver points
      const { data: dpData } = await admin
        .from("driver_points").select("*")
        .eq("citizen_id", citizenId).eq("year", currentYear).maybeSingle();
      driverPointsData = dpData;

      // Recent deductions
      try {
        pointsDeductions = await query(
          `SELECT id, deduction_type, offense, points_deducted, points_before, points_after,
                  source_type, officer_name, location, deduction_date
           FROM points_deductions WHERE citizen_id=$1 AND year=$2
           ORDER BY deduction_date DESC LIMIT 20`, [citizenId, currentYear]
        );
      } catch (e) { pointsDeductions = []; }
    }

    // ── Build citizen points object ────────────────────────────────────────────
    const citizenPoints = {
      current:   citizenPointsData?.points_current ?? 100,
      start:     citizenPointsData?.points_start ?? 100,
      deducted:  Number(citizenPointsData?.points_deducted ?? 0),
      incidents: citizenPointsData?.incidents_count ?? 0,
      status:    citizenPointsData?.status ?? "good",
      percentage: Math.round((citizenPointsData?.points_current ?? 100) * 100 / (citizenPointsData?.points_start ?? 100)),
      lastIncident: citizenPointsData?.last_incident_date ?? null,
    };

    const hasDriverRecord = driverPointsData !== null || !!citizen?.license_no || account.is_driver;
    const driverPoints = hasDriverRecord ? {
      current:   driverPointsData?.points_current ?? 100,
      start:     driverPointsData?.points_start ?? 100,
      deducted:  Number(driverPointsData?.points_deducted ?? 0),
      violations: driverPointsData?.violations_count ?? 0,
      status:    driverPointsData?.status ?? "good",
      percentage: Math.round((driverPointsData?.points_current ?? 100) * 100 / (driverPointsData?.points_start ?? 100)),
      lastViolation: driverPointsData?.last_violation_date ?? null,
    } : null;

    // Count stats using direct SQL
    const [complaints, applications, payments, vehicles, devices, properties, licenses] = await Promise.all([
      query<{count:string}>(`SELECT COUNT(*) FROM citizen_complaints WHERE account_id=$1`, [accountId]),
      query<{count:string}>(`SELECT COUNT(*) FROM citizen_applications WHERE account_id=$1`, [accountId]),
      query<{count:string}>(`SELECT COUNT(*) FROM citizen_payments WHERE account_id=$1`, [accountId]),
      citizenId ? query<{count:string}>(`SELECT COUNT(*) FROM vehicles WHERE owner_citizen_id=$1`, [citizenId]) : [{count:"0"}],
      citizenId ? query<{count:string}>(`SELECT COUNT(*) FROM devices WHERE owner_citizen_id=$1`, [citizenId]) : [{count:"0"}],
      citizenId ? query<{count:string}>(`SELECT COUNT(*) FROM property_owners WHERE citizen_id=$1`, [citizenId]) : [{count:"0"}],
      citizenId ? query<{count:string}>(`SELECT COUNT(*) FROM licenses WHERE citizen_id=$1`, [citizenId]) : [{count:"0"}],
    ]);

    // Recent citations / fines
    let citations: any[] = [];
    if (citizenId) {
      citations = await query(
        `SELECT id, offense, citation_number, status, fine_amount, total_amount, base_amount,
                fine_type, citation_type, plate, created_at
         FROM citizen_fines WHERE citizen_id=$1 ORDER BY created_at DESC LIMIT 5`, [citizenId]
      ).catch(() => []);
    }

    const stats = {
      complaints:   parseInt(complaints[0]?.count ?? "0"),
      applications: parseInt(applications[0]?.count ?? "0"),
      payments:     parseInt(payments[0]?.count ?? "0"),
      vehicles:     parseInt(vehicles[0]?.count ?? "0"),
      devices:      parseInt(devices[0]?.count ?? "0"),
      properties:   parseInt(properties[0]?.count ?? "0"),
      licenses:     parseInt(licenses[0]?.count ?? "0"),
    };

    return NextResponse.json({
      ok: true,
      data: {
        // Account info
        id:                account.id,
        accountId:         account.id,
        citizenId,
        name:              citizen?.name || account.cached_name || account.phone || "Raia",
        phone:             account.phone || citizen?.mobile || "",
        email:             account.email || citizen?.email || "",
        nida:              account.nida  || citizen?.nida  || "",
        // Citizen profile fields
        gender:            citizen?.gender       || null,
        dob:               citizen?.dob          || null,
        occupation:        citizen?.occupation   || null,
        address:           citizen?.address      || null,
        tribe:             citizen?.tribe        || null,
        region:            citizen?.region       || null,
        district:          citizen?.district     || null,
        ward:              citizen?.ward         || null,
        nationality:       citizen?.nationality  || "Mtanzania",
        religion:          citizen?.religion     || null,
        marital_status:    citizen?.marital_status || null,
        blood_group:       citizen?.blood_group  || null,
        photo_url:         citizen?.photo_url    || null,
        license_no:        citizen?.license_no   || null,
        street:            citizen?.street       || null,
        mobile:            citizen?.mobile       || account.phone || null,
        // Extended fields (from migration 34)
        home_address:      (citizen as any)?.home_address   || null,
        home_region:       (citizen as any)?.home_region    || null,
        home_district:     (citizen as any)?.home_district  || null,
        home_ward:         (citizen as any)?.home_ward      || null,
        work_address:      (citizen as any)?.work_address   || null,
        work_employer:     (citizen as any)?.work_employer  || null,
        medical_conditions:(citizen as any)?.medical_conditions || null,
        allergies:         (citizen as any)?.allergies      || null,
        disability:        (citizen as any)?.disability     || null,
        blood_group:       (citizen as any)?.blood_group    || null,
        nationality:       (citizen as any)?.nationality    || citizen?.nationality || "Mtanzania",
        religion:          (citizen as any)?.religion       || null,
        marital_status:    (citizen as any)?.marital_status || null,
        kin_name:          (citizen as any)?.kin_name       || null,
        kin_phone:         (citizen as any)?.kin_phone      || null,
        kin_relationship:  (citizen as any)?.kin_relationship || null,
        kin_address:       (citizen as any)?.kin_address    || null,
        emergency2_name:   (citizen as any)?.emergency2_name || null,
        emergency2_phone:  (citizen as any)?.emergency2_phone || null,
        emergency2_relationship: (citizen as any)?.emergency2_relationship || null,
        // Driver/license info — from proper points tables
        isDriver:          hasDriverRecord || !!account.is_driver,
        driverPoints:      driverPoints?.current ?? 100,
        driverPointsDetail: driverPoints,
        goodConductPoints: citizenPoints.current,
        citizenPointsDetail: citizenPoints,
        pointsDeductions:  pointsDeductions,
        profileComplete:   account.profile_complete   ?? false,
        // Account status
        is_verified:       account.is_verified  ?? false,
        approved:          account.approved     ?? false,
        approved_at:       account.approved_at  ?? null,
        approved_by:       account.approved_by  ?? null,
        status:            account.status       ?? "active",
        last_login:        account.last_login   ?? null,
        created_at:        account.created_at   ?? null,
        // Stats
        stats,
        citations,
        citizen,
      },
    });
  } catch (err: any) {
    console.error("[CITIZEN PORTAL GET]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const accountId = (await params).id;
    const body = await _req.json().catch(() => ({}));
    const admin = getDbAdmin() as any;

    const { data: account } = await admin.from("citizen_accounts").select("citizen_id").eq("id", accountId).maybeSingle();
    if (!account) return NextResponse.json({ error: "Akaunti haipatikani" }, { status: 404 });

    // Update citizen profile fields
    if (account.citizen_id && body.citizen) {
      const allowed = ["name","first_name","last_name","middle_name","gender","dob","age","occupation",
                       "tribe","status","nida","mobile","license_no","photo_url",
                       "address","region","district","ward","street",
                       // Extended (added by migration 34)
                       "blood_group","religion","marital_status","nationality","email",
                       "home_address","home_region","home_district","home_ward","work_address","work_employer",
                       "medical_conditions","allergies","disability",
                       "kin_name","kin_phone","kin_relationship","kin_address",
                       "emergency2_name","emergency2_phone","emergency2_relationship"];
      const update: Record<string,unknown> = {};
      for (const k of allowed) if (body.citizen[k] !== undefined) update[k] = body.citizen[k];
      if (Object.keys(update).length) {
        await admin.from("citizens").update(update).eq("id", account.citizen_id);
        // Sync name to cached_name
        if (update.name) await admin.from("citizen_accounts").update({ cached_name: update.name }).eq("id", accountId);
      }
    }

    // Update account fields
    if (body.account) {
      const allowedAcc = ["is_driver","profile_complete"];
      const updateAcc: Record<string,unknown> = {};
      for (const k of allowedAcc) if (body.account[k] !== undefined) updateAcc[k] = k === "is_driver" ? body.account[k] : body.account[k];
      if (Object.keys(updateAcc).length) await admin.from("citizen_accounts").update(updateAcc).eq("id", accountId);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
