// src/app/api/search/route.ts
// NO PostgREST embeds, NO RPC dependency. Everything joined in JS.
// GET /api/search?q=...&type=plate|name|nida|mobile|license|passport|nssf|nhif|ppf|enec|tin
//
// UPDATED: Now includes government IDs, citizen_conduct_points, driver_points,
// service_prices, and full fines list in citizen search results.
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

const clean = (s: any) => String(s ?? "").trim();
const digits = (s: any) => String(s ?? "").replace(/\D/g, "");
const lc = (s: any) => String(s ?? "").toLowerCase();

/** All plausible spellings of a TZ phone number. */
function phoneVariants(input: string): string[] {
  const d = digits(input);
  if (d.length < 9) return [clean(input)].filter(Boolean);
  const core = d.startsWith("255") ? d.slice(3) : d.startsWith("0") ? d.slice(1) : d;
  return [...new Set([`+255${core}`, `255${core}`, `0${core}`, core, clean(input)])];
}

const plateKey = (s: any) => String(s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

async function safeSelect(admin: any, table: string, limit = 1000): Promise<any[]> {
  try {
    const { data, error } = await admin.from(table).select("*").limit(limit);
    if (error) { console.error(`[SEARCH ${table}]`, error.message); return []; }
    return data ?? [];
  } catch (e) {
    console.error(`[SEARCH ${table}] threw`, e);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "search", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const { searchParams } = new URL(req.url);
    const q    = clean(searchParams.get("q"));
    const type = searchParams.get("type") || "name";
    if (!q) return NextResponse.json({ error: "Query inahitajika" }, { status: 400 });

    if (!isDbEnabled()) return NextResponse.json({ found: false, error: "DB haijawezeshwa" }, { status: 503 });
    const admin = getDbAdmin() as any;
    if (!admin) return NextResponse.json({ found: false, error: "DB haijawezeshwa" }, { status: 503 });

    const currentYear = new Date().getFullYear();

    const [citizens, accounts, vehicles, devices, owners, properties, fines, govIds, govIdTypes, servicePrices, citizenPoints, driverPoints, pointsDeductions] = await Promise.all([
      safeSelect(admin, "citizens"),
      safeSelect(admin, "citizen_accounts"),
      safeSelect(admin, "vehicles"),
      safeSelect(admin, "devices"),
      safeSelect(admin, "property_owners"),
      safeSelect(admin, "properties"),
      safeSelect(admin, "citizen_fines"),
      safeSelect(admin, "citizen_government_ids"),
      safeSelect(admin, "government_id_types"),
      safeSelect(admin, "service_prices"),
      safeSelect(admin, "citizen_conduct_points"),
      safeSelect(admin, "driver_points"),
      safeSelect(admin, "points_deductions"),
    ]);

    // ── Build lookup maps ─────────────────────────────────────────────────────
    const govIdTypesByCode = new Map<string, any>();
    for (const t of govIdTypes) if (t.is_active) govIdTypesByCode.set(t.code, t);

    const govIdsByCitizenId = new Map<string, any[]>();
    for (const g of govIds) {
      const cid = String(g.citizen_id ?? "");
      if (!govIdsByCitizenId.has(cid)) govIdsByCitizenId.set(cid, []);
      govIdsByCitizenId.get(cid)!.push({
        ...g,
        type_name_en: govIdTypesByCode.get(g.id_type_code)?.name_en ?? g.id_type_code,
        type_name_sw: govIdTypesByCode.get(g.id_type_code)?.name_sw ?? g.id_type_code,
        type_description: govIdTypesByCode.get(g.id_type_code)?.description ?? null,
      });
    }

    // Points maps — keyed by citizen_id for current year
    const citizenPointsByCitizenId = new Map<string, any>();
    for (const cp of citizenPoints) {
      if (cp.year === currentYear) citizenPointsByCitizenId.set(String(cp.citizen_id), cp);
    }

    const driverPointsByCitizenId = new Map<string, any>();
    for (const dp of driverPoints) {
      if (dp.year === currentYear) driverPointsByCitizenId.set(String(dp.citizen_id), dp);
    }

    // Deductions map — keyed by citizen_id for current year
    const deductionsByCitizenId = new Map<string, any[]>();
    for (const pd of pointsDeductions) {
      if (pd.year === currentYear) {
        const cid = String(pd.citizen_id ?? "");
        if (!deductionsByCitizenId.has(cid)) deductionsByCitizenId.set(cid, []);
        deductionsByCitizenId.get(cid)!.push(pd);
      }
    }

    const accByCitizenId = new Map<string, any>();
    for (const a of accounts) if (a.citizen_id) accByCitizenId.set(String(a.citizen_id), a);

    const phones = phoneVariants(q);
    const phoneSet = new Set(phones.map(digits).filter(Boolean));
    const qDigits = digits(q);
    const qLower = lc(q);
    const qPlate = plateKey(q);

    // ── VEHICLE lookup ───────────────────────────────────────────────────────
    if (type === "plate" || type === "vehicle") {
      const vehicle =
        vehicles.find((v: any) => plateKey(v.plate) === qPlate) ??
        vehicles.find((v: any) =>
          plateKey(v.plate).includes(qPlate) ||
          lc(v.chassis_no).includes(qLower) ||
          lc(v.chassis_number).includes(qLower) ||
          lc(v.engine_number).includes(qLower));

      if (!vehicle) return NextResponse.json({ found: false, type: "vehicle", query: q, data: null });

      let citizen: any = null;
      if (vehicle.owner_citizen_id) {
        citizen = citizens.find((c: any) => String(c.id) === String(vehicle.owner_citizen_id)) ?? null;
      }
      if (!citizen && vehicle.owner_phone) {
        const vp = digits(vehicle.owner_phone);
        citizen = citizens.find((c: any) => digits(c.mobile) === vp) ?? null;
      }

      return NextResponse.json({
        found: true, type: "vehicle", query: q,
        data: { ...vehicle, chassis_no: vehicle.chassis_no || vehicle.chassis_number || null },
        citizen: citizen ? build(citizen) : null,
      });
    }

    // ── CITIZEN lookup ───────────────────────────────────────────────────────
    let citizen: any = null;

    const qNorm = q.replace(/[^A-Z0-9]/gi, "").toUpperCase();

    // Also try to match via government IDs (passport, NSSF, NHIF, PPF, ENEC, etc.)
    const matchesGovId = (c: any) => {
      const cid = String(c.id ?? "");
      const myGovIds = govIdsByCitizenId.get(cid) ?? [];
      for (const g of myGovIds) {
        const norm = (g.id_number_norm ?? g.id_number ?? "").replace(/[^A-Z0-9]/gi, "").toUpperCase();
        if (norm === qNorm || norm.includes(qNorm)) return true;
        // Also match by type-specific search
        if (type === "passport" && g.id_type_code === "passport" && norm.includes(qNorm)) return true;
        if (type === "nssf" && g.id_type_code === "nssf" && norm.includes(qNorm)) return true;
        if (type === "nhif" && g.id_type_code === "nhif" && norm.includes(qNorm)) return true;
        if (type === "ppf" && g.id_type_code === "ppf" && norm.includes(qNorm)) return true;
        if (type === "enec" && g.id_type_code === "enec" && norm.includes(qNorm)) return true;
        if (type === "tin" && g.id_type_code === "tin" && norm.includes(qNorm)) return true;
      }
      return false;
    };

    const matchesCitizen = (c: any) => {
      const acc = accByCitizenId.get(String(c.id));
      // Check government IDs first (passport, NSSF, NHIF, PPF, ENEC, TIN, etc.)
      if (matchesGovId(c)) return true;
      switch (type) {
        case "nida":
          return qDigits.length > 0 && (digits(c.nida) === qDigits || digits(acc?.nida) === qDigits);
        case "mobile":
          return phoneSet.has(digits(c.mobile)) || phoneSet.has(digits(acc?.phone));
        case "license":
          return (lc(c.license_no).includes(qLower) && qLower.length > 2) ||
                 (lc(acc?.driving_license).includes(qLower) && qLower.length > 2);
        case "passport": // Also handled by matchesGovId above, but fall through to name search
        case "nssf":
        case "nhif":
        case "ppf":
        case "enec":
        case "tin":
          return matchesGovId(c); // Pure government ID search
        default: {
          const full = lc([c.name, c.first_name, c.last_name, acc?.cached_name].filter(Boolean).join(" "));
          return full.includes(qLower) ||
                 (qDigits.length > 5 && (digits(c.nida) === qDigits || phoneSet.has(digits(c.mobile)))) ||
                 (qLower.length > 2 && lc(c.license_no).includes(qLower));
        }
      }
    };

    citizen = citizens.find(matchesCitizen) ?? null;

    // Fall back to an account that has no citizens row yet
    if (!citizen) {
      const acc = accounts.find((a: any) =>
        phoneSet.has(digits(a.phone)) ||
        (qDigits.length > 5 && digits(a.nida) === qDigits) ||
        lc(a.cached_name).includes(qLower));
      if (acc) {
        citizen = {
          id: acc.citizen_id ?? acc.id,
          name: acc.cached_name, mobile: acc.phone, nida: acc.nida,
          license_no: acc.driving_license, __accountOverride: acc,
        };
      }
    }

    if (!citizen) return NextResponse.json({ found: false, type, query: q, data: null });

    return NextResponse.json({ found: true, type: "citizen", query: q, data: build(citizen) });

    // ── Build the full citizen payload ───────────────────────────────────────
    function build(c: any) {
      const acc = c.__accountOverride ?? accByCitizenId.get(String(c.id)) ?? null;
      const cid = String(c.id ?? "");
      const cPhones = new Set(
        [c.mobile, acc?.phone].filter(Boolean).flatMap(p => phoneVariants(String(p))).map(digits)
      );

      const ownsVehicle = (v: any) =>
        (v.owner_citizen_id && String(v.owner_citizen_id) === cid) ||
        (v.owner_phone && cPhones.has(digits(v.owner_phone)));

      const ownsDevice = (d: any) =>
        (d.owner_citizen_id && String(d.owner_citizen_id) === cid) ||
        (d.owner_phone && cPhones.has(digits(d.owner_phone)));

      const myVehicles = vehicles.filter(ownsVehicle).map((v: any) => ({
        id: v.id, plate: v.plate, make: v.make, model: v.model, color: v.color,
        year: v.year, type: v.type,
        chassis_no: v.chassis_no || v.chassis_number || null,
        insurance_valid: !!v.insurance_valid,
        insurance_expires: v.insurance_expires ?? null,
        insurance_company: v.insurance_company ?? null,
        inspection_expires: v.inspection_expires ?? null,
        registration_expires: v.registration_expires ?? null,
        outstanding_fines: v.outstanding_fines ?? 0,
        accident_count: v.accident_count ?? 0,
      }));

      const myDevices = devices.filter(ownsDevice).map((d: any) => ({
        id: d.id, serial_no: d.serial_no || d.imei || null, imei: d.imei ?? null,
        category: d.category ?? null, description: d.description ?? null,
        color: d.color ?? null, status: d.status ?? "active",
        blacklisted: !!d.blacklisted,
      }));

      const myProperties = owners
        .filter((o: any) => String(o.citizen_id ?? "") === cid)
        .map((o: any) => {
          const p = properties.find((pp: any) => String(pp.id) === String(o.property_id)) ?? {};
          return {
            id: o.id, property_id: p.id ?? null,
            title: p.description || p.address || p.property_number || "Mali",
            property_type: p.land_use ?? null,
            region: p.region ?? null, district: p.district ?? null, ward: p.ward ?? null,
            title_deed_no: p.title_deed || p.survey_number || null,
            area_sqm: p.area_sqm ?? null, status: p.status ?? "active",
            ownership_type: o.ownership_type ?? "sole",
          };
        });

      const myFines = fines
        .filter((f: any) => String(f.citizen_id ?? "") === cid || String(f.driver_nida ?? "") === digits(c.nida))
        .map((f: any) => ({
          id: f.id, offense: f.offense ?? null, amount: f.total_amount ?? f.amount ?? 0,
          base_amount: f.base_amount ?? null,
          penalty_amount: f.penalty_amount ?? null,
          status: f.status ?? "unpaid", citation_number: f.citation_number ?? null,
          fine_type: f.fine_type ?? "traffic",
          citation_type: f.citation_type ?? "traffic",
          plate: f.plate ?? null, created_at: f.created_at ?? null,
        }))
        .sort((a: any, b: any) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));

      const unpaid = myFines.filter((f: any) => f.status !== "paid");

      // ── POINTS from proper tables ──────────────────────────────────────────
      const cpData = citizenPointsByCitizenId.get(cid);
      const dpData = driverPointsByCitizenId.get(cid);

      const citizenPointsCurrent = cpData?.points_current ?? 100;
      const citizenPointsStart   = cpData?.points_start ?? 100;
      const citizenPointsStatus  = cpData?.status ?? "good";
      const citizenIncidents      = cpData?.incidents_count ?? 0;
      const citizenPointsDeducted = cpData?.points_deducted ?? 0;

      const driverPointsCurrent  = dpData?.points_current ?? 100;
      const driverPointsStart    = dpData?.points_start ?? 100;
      const driverPointsStatus   = dpData?.status ?? "good";
      const driverViolations     = dpData?.violations_count ?? 0;
      const driverPointsDeducted = dpData?.points_deducted ?? 0;
      const hasDriverRecord      = dpData !== undefined || !!c.license_no;

      // Deductions history
      const myDeductions = (deductionsByCitizenId.get(cid) ?? [])
        .sort((a: any, b: any) => String(b.deduction_date ?? b.created_at ?? "").localeCompare(String(a.deduction_date ?? a.created_at ?? "")))
        .slice(0, 20);

      const dobYear = c.dob ? new Date(c.dob).getFullYear() : null;
      const age = c.age ?? (dobYear ? new Date().getFullYear() - dobYear : null);

      return {
        // Identity
        id: c.id ?? null,
        name: c.name || [c.first_name, c.last_name].filter(Boolean).join(" ") || acc?.cached_name || "—",
        first_name: c.first_name ?? null,
        last_name:  c.last_name ?? null,
        mobile: c.mobile || acc?.phone || "—",
        phone:  c.mobile || acc?.phone || "—",
        nida:   c.nida || acc?.nida || "—",
        gender: c.gender ?? "—",
        dob:    c.dob ?? null,
        age,
        address:     c.address ?? "—",
        occupation:  c.occupation ?? "—",
        tribe:       c.tribe ?? "—",
        nationality: c.nationality ?? "Mtanzania",
        religion:    c.religion ?? "—",
        blood_group: c.blood_group ?? "—",
        marital_status: c.marital_status ?? "—",
        photo_url:   c.photo_url ?? null,
        license_no:  c.license_no || acc?.driving_license || "—",
        notes:       c.notes ?? null,
        // Status / risk
        status:   c.status ?? "active",
        verified: !!c.verified,
        has_criminal_record: !!c.has_criminal_record,
        cases_count:       c.cases_count ?? 0,
        convictions_count: c.convictions_count ?? 0,
        risk_score:        c.risk_score ?? 0,
        // Portal account
        account_id:          acc?.id ?? null,
        has_portal_account:  !!acc,
        is_driver:           hasDriverRecord || !!acc?.is_driver,
        // ── POINTS (from proper citizen_conduct_points & driver_points tables) ──
        good_conduct_points: citizenPointsCurrent,
        citizen_points: {
          current:   citizenPointsCurrent,
          start:     citizenPointsStart,
          deducted:  Number(citizenPointsDeducted),
          incidents: citizenIncidents,
          status:    citizenPointsStatus,
          percentage: Math.round(citizenPointsCurrent * 100 / citizenPointsStart),
        },
        driver_points: hasDriverRecord ? driverPointsCurrent : null,
        driver_points_detail: hasDriverRecord ? {
          current:   driverPointsCurrent,
          start:     driverPointsStart,
          deducted:  Number(driverPointsDeducted),
          violations: driverViolations,
          status:    driverPointsStatus,
          percentage: Math.round(driverPointsCurrent * 100 / driverPointsStart),
        } : null,
        points_deductions: myDeductions,
        is_verified:         !!acc?.is_verified,
        profile_complete:    !!acc?.profile_complete,
        approved:            !!acc?.approved,
        last_login:          acc?.last_login ?? null,
        created_at:          c.created_at ?? acc?.created_at ?? null,
        // Government IDs (passport, ENEC, NSSF/PPF, NHIF, etc.)
        government_ids: govIdsByCitizenId.get(cid) ?? [],
        // Assets
        vehicles:   myVehicles,
        devices:    myDevices,
        properties: myProperties,
        fines:      myFines,
        counts: {
          vehicles:   myVehicles.length,
          devices:    myDevices.length,
          properties: myProperties.length,
          fines:      myFines.length,
          unpaid_fines: unpaid.length,
          government_ids: (govIdsByCitizenId.get(cid) ?? []).length,
          points_deductions: myDeductions.length,
        },
        outstanding_amount: unpaid.reduce((s: number, f: any) => s + Number(f.amount ?? 0), 0),
        // Service prices for reference
        service_prices: servicePrices.filter((sp: any) => sp.is_active),
      };
    }
  } catch (err) {
    console.error("[SEARCH]", errMsg(err));
    return NextResponse.json({ found: false, error: errMsg(err) }, { status: 500 });
  }
}
