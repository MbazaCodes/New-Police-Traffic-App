const { Document, Packer, Paragraph, TextRun, Header, Footer,
        AlignmentType, HeadingLevel, PageNumber, Table, TableRow, TableCell,
        WidthType, BorderStyle, ShadingType } = require("docx");
const fs = require("fs");

// Palette: Technical Diagnostic (Cool + Heavy + Active)
const P = { primary: "#1A2332", body: "#2C3E50", secondary: "#5D6D7E", accent: "#E74C3C", surface: "#F8F9FA" };
const c = (hex) => hex.replace("#", "");

// Helper functions
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : 280, after: 160 },
    children: [new TextRun({ text, bold: true, color: c(P.primary), font: { ascii: "Calibri", eastAsia: "SimHei" }, size: level === HeadingLevel.HEADING_1 ? 32 : (level === HeadingLevel.HEADING_2 ? 28 : 26) })]
  });
}

function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Calibri", eastAsia: "SimSun" } })]
  });
}

function bullet(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80, line: 312 },
    indent: { left: 720 },
    children: [
      new TextRun({ text: "\u2022 ", size: 24, color: c(P.accent), font: "Calibri" }),
      new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Calibri", eastAsia: "SimSun" } })
    ]
  });
}

function codeBlock(text) {
  return new Paragraph({
    spacing: { before: 120, after: 120, line: 276 },
    shading: { type: ShadingType.CLEAR, color: c("#F0F0F0") },
    indent: { left: 480, right: 480 },
    children: [new TextRun({ text, size: 20, color: c("#C0392B"), font: "Consolas" })]
  });
}

function criticalBox(text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 16, color: c(P.accent) },
          bottom: { style: BorderStyle.SINGLE, size: 16, color: c(P.accent) },
          left: { style: BorderStyle.SINGLE, size: 16, color: c(P.accent) },
          right: { style: BorderStyle.SINGLE, size: 16, color: c(P.accent) }
        },
        shading: { type: ShadingType.CLEAR, color: c("#FDEDEC") },
        children: [new Paragraph({
          spacing: { before: 120, after: 120, line: 300 },
          children: [
            new TextRun({ text: "CRITICAL: ", bold: true, size: 22, color: c(P.accent), font: "Calibri" }),
            new TextRun({ text, size: 22, color: c(P.body), font: { ascii: "Calibri", eastAsia: "SimSun" } })
          ]
        })]
      })]
    })]
  });
}

function infoTable(headers, rows) {
  const headerCells = headers.map(h => new TableCell({
    width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, color: c(P.primary) },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 80 },
      children: [new TextRun({ text: h, bold: true, size: 20, color: c("#FFFFFF"), font: "Calibri" })]
    })]
  }));
  
  const dataRows = rows.map(row => new TableRow({
    children: row.map((cell, i) => new TableCell({
      width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
      shading: { type: ShadingType.CLEAR, color: rows.indexOf(row) % 2 === 0 ? c("#FFFFFF") : c(P.surface) },
      children: [new Paragraph({
        spacing: { before: 60, after: 60, line: 260 },
        children: [new TextRun({ text: cell, size: 20, color: c(P.body), font: { ascii: "Calibri", eastAsia: "SimSun" } })]
      })]
    }))
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells, tableHeader: true }), ...dataRows]
  });
}

// Document content
const doc = new Document({
  styles: { default: { document: {
    run: { font: { ascii: "Calibri", eastAsia: "SimSun" }, size: 24, color: c(P.body) },
    paragraph: { spacing: { line: 312 } }
  }}},
  sections: [{
    properties: {
      page: { margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 } }
    },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 20, color: c(P.secondary) })] })] }) },
    children: [
      // Title
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "TZ POLICE DIGITAL PLATFORM", bold: true, size: 40, color: c(P.primary), font: { ascii: "Calibri", eastAsia: "SimHei" } })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "Database Diagnostic Report", bold: true, size: 32, color: c(P.accent), font: { ascii: "Calibri", eastAsia: "SimHei" } })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: "Issue: Data Not Recording Despite No Errors | Root Cause Analysis & Fixes", size: 22, color: c(P.secondary), font: "Calibri" })]
      }),
      
      // Executive Summary
      heading("1. EXECUTIVE SUMMARY"),
      body("This report presents a comprehensive diagnosis of the TZ Police Digital Platform database system. The primary issue reported is that data submissions across multiple entities (Users, Officers, Vehicles, Citations, Incidents, Patrols, Properties, Citizen Fines, Bail Requests) appear to complete successfully without throwing any errors, yet the records are not persisted to the database. After thorough analysis of all 23 migration files, RLS policies, triggers, and application query code, this report identifies the root causes and provides actionable remediation steps."),
      
      criticalBox("ROW-LEVEL SECURITY (RLS) IS SILENTLY BLOCKING ALL INSERT OPERATIONS FOR NON-ADMIN USERS"),
      
      body("The core issue stems from Supabase's Row-Level Security implementation combined with missing or misconfigured policies. When RLS is enabled on a table but no INSERT policy exists (or the policy conditions are not met), Supabase does NOT return an error - it simply inserts zero rows. This is the expected PostgreSQL behavior but creates significant confusion for developers who expect errors to be thrown."),
      
      // Scope
      heading("2. ANALYSIS SCOPE"),
      body("The following database entities were scanned as part of this investigation:"),
      bullet("USERS / OFFICERS - Authentication and personnel records"),
      bullet("VEHICLES / DRIVERS / CITIZENS - Lookup entities for traffic operations"),
      bullet("CITATIONS / INCIDENTS / PATROLS - Operational transaction records"),
      bullet("PF3_FORMS / VEHICLE_INSPECTIONS - Accident reports and inspections"),
      bullet("PROPERTIES / PROPERTY_OWNERS - Property management module"),
      bullet("ARRESTS / WARNINGS / CRIMINAL_RECORDS - Law enforcement records"),
      bullet("CITIZEN_FINES / BAIL_REQUESTS - Financial processing tables"),
      bullet("MISSING_RECORDS / DEVICES / WANTED - Investigation support tables"),
      bullet("ALERTS / AUDIT_LOGS - System logging and notifications"),
      
      // Root Cause Analysis
      heading("3. ROOT CAUSE ANALYSIS"),
      
      heading("3.1 Critical Issue #1: RLS Silent Failure Pattern", HeadingLevel.HEADING_2),
      body("All 15+ core tables have Row-Level Security enabled with a 'DENY BY DEFAULT' configuration. The initial schema migration (00000000000000_initial_schema.sql) enables RLS on all tables without creating corresponding INSERT policies. While subsequent migrations add policies, several critical gaps exist where officers cannot insert their own operational data."),
      
      codeBlock("-- Example: Citations INSERT Policy requires officer_id match"),
      codeBlock("CREATE POLICY citations_insert_officer ON citations"),
      codeBlock("  FOR INSERT TO authenticated"),
      codeBlock("  WITH CHECK (officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid()));"),
      body("If the authenticated user has no matching record in the officers table, or if auth.uid() returns NULL (unauthenticated session), this policy evaluates to FALSE. Supabase then silently discards the insert without returning an error to the client application."),
      
      heading("3.2 Critical Issue #2: Missing auth_user_id Linkage", HeadingLevel.HEADING_2),
      body("The v2 schema extension (migration 0008) adds an auth_user_id column to the users table to link Supabase Auth users to application users. However, many RLS policies still reference the original pattern of comparing users.id directly with auth.uid(). If these values don't match (which they won't unless explicitly set during user creation), all policy checks fail silently."),
      
      codeBlock("-- Migration 0008 adds this column:"),
      codeBlock("ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;"),
      codeBlock("-- But RLS policies still check:"),
      codeBlock("id = auth.uid()  -- This compares users.id, NOT auth_user_id!"),
      
      heading("3.3 Critical Issue #3: Column Name Mismatches in Functions", HeadingLevel.HEADING_2),
      body("Several database functions reference columns that either don't exist or have different names than what's defined in the schema. These cause runtime failures that may be caught differently depending on the client context:"),
      
      infoTable(
        ["Function", "References", "Actual Column", "Impact"],
        [
          ["search_citizen()", "citizens.first_name || ' ' || citizens.last_name", "citizens.name only", "Fuzzy name search fails"],
          ["search_vehicle()", "vehicles.plate_number", "vehicles.plate", "Vehicle search returns NULL"],
          ["update_vehicle_fines()", "vehicles.plate_number", "vehicles.plate", "Trigger fails on citation insert"],
          ["get_dashboard_stats()", "citations.station_id", "Column added in v2", "Returns NULL if migration not run"]
        ]
      ),
      
      heading("3.4 Critical Issue #4: Missing RLS Policies on New Tables", HeadingLevel.HEADING_2),
      body("Several tables created in later migrations lack proper INSERT policies for regular officers. The following tables have RLS enabled but restrictive or missing write policies:"),
      
      infoTable(
        ["Table", "INSERT Policy Status", "Who Can Write", "Risk Level"],
        [
          ["properties", "Requires is_commander() OR is_investigator()", "Admins only", "HIGH"],
          ["property_owners", "Requires is_commander() OR is_investigator()", "Admins only", "HIGH"],
          ["criminal_records", "Requires is_commander() OR is_investigator()", "CID/Admins only", "MEDIUM"],
          ["warnings", "Requires is_officer() OR is_commander()", "Officers + Admins", "LOW"],
          ["otp_codes", "No authenticated policies defined", "Service role only", "BY DESIGN"],
          ["patrol_track_points", "Requires patrol ownership check", "Patrol owner", "MEDIUM"]
        ]
      ),
      
      // Entity-Specific Issues
      heading("4. ENTITY-SPECIFIC FINDINGS"),
      
      heading("4.1 Users & Officers", HeadingLevel.HEADING_2),
      body("The users table allows self-insert only for admin/commander roles. New officer registration through the application will fail silently because the inserting user is not yet an admin. The officers table similarly restricts INSERT to administrators only, meaning the officer creation workflow must use a service_role client or an edge function with elevated privileges."),
      
      heading("4.2 Vehicles & Citizens", HeadingLevel.HEADING_2),
      body("Both vehicles and citizens tables allow SELECT for all authenticated users (correct for lookup functionality) but restrict INSERT/UPDATE to admins and commanders only. Field officers attempting to register new vehicles or create citizen records during traffic stops will find their submissions silently dropped. This is likely intentional for data quality control but should be documented or handled via edge functions."),
      
      heading("4.3 Citations & Incidents", HeadingLevel.HEADING_2),
      body("These operational tables have properly scoped INSERT policies that allow officers to create records linked to their own officer_id. However, if the officer's user_id doesn't have a corresponding entry in the officers table, or if the officer_id passed in the insert doesn't match, the policy blocks the insert. The application code in packages/database/src/queries.ts correctly passes officer_id, so this should work if the officer record exists."),
      
      heading("4.4 Properties (RAIA)", HeadingLevel.HEADING_2),
      body("The property management module (migration 14) introduces 10 new tables with complex RLS policies. The properties table write policy references helper functions is_commander(), is_investigator(), and is_officer() that are defined in migration 0009. If migrations are applied out of order, these functions won't exist when the policy is created, causing the CREATE POLICY statement to fail silently or the policy to be invalid."),
      
      codeBlock("-- Property write policy depends on functions from migration 0009:"),
      codeBlock("CREATE POLICY prop_write ON properties FOR ALL TO authenticated"),
      codeBlock("  USING (is_commander() OR is_investigator() OR is_officer())"),
      codeBlock("  WITH CHECK (TRUE);"),
      codeBlock("-- If is_officer() doesn't exist: POLICY CREATION FAILS"),
      
      heading("4.5 Citizen Fines & Bail (CAB RECORD)", HeadingLevel.HEADING_2),
      body("Migration 19 introduces citizen_fines and bail_requests tables with TEXT primary keys (not UUID). These tables have permissive RLS policies allowing any authenticated user to read/write. However, they also include service_role policies. A potential issue arises if the application uses the anon key instead of the user's authenticated token - the authenticated role policies won't apply, and the service_role policies require a service_role key which shouldn't be exposed to clients."),
      
      // Recommended Fixes
      heading("5. RECOMMENDED FIXES"),
      
      heading("5.1 Immediate Fix: Verify Migration Order", HeadingLevel.HEADING_2),
      body("Ensure all migrations are applied in strict numerical order. The dependency chain is critical:"),
      bullet("Migration 0000-0003: Core schema + RLS base + Triggers"),
      bullet("Migration 0005-0006: Extended schema + DB functions"),
      bullet("Migration 0008-0009: v2 extensions + Helper functions (is_commander, etc.)"),
      bullet("Migration 0010+: Features that depend on above"),
      
      heading("5.2 Fix auth_user_id Linkage", HeadingLevel.HEADING_2),
      body("When creating a new user record (during registration or admin creation), always set the auth_user_id field to the Supabase Auth UUID:"),
      
      codeBlock("-- During user creation, link auth user to app user:"),
      codeBlock("INSERT INTO users (name, id_number, auth_user_id, role, ...)"),
      codeBlock("VALUES ($1, $2, auth.uid(), $3, ...);"),
      codeBlock("-- Then update RLS policies to check BOTH:"),
      codeBlock("id = auth.uid() OR auth_user_id = auth.uid()"),
      
      heading("5.3 Fix Column References in Functions", HeadingLevel.HEADING_2),
      body("Update the following functions to use correct column names:"),
      
      codeBlock("-- Fix search_vehicle(): change plate_number to plate"),
      codeBlock("WHERE UPPER(REPLACE(v.plate,' ','')) = UPPER(REPLACE(p_plate,' ',''))"),
      codeBlock(""),
      codeBlock("-- Fix update_vehicle_fines(): change plate_number to plate"),
      codeBlock("WHERE plate = NEW.plate"),
      codeBlock(""),
      codeBlock("-- Fix search_citizen(): handle both name patterns"),
      codeBlock("WHERE (c.name ILIKE '%' || p_query || '%')"),
      codeBlock("   OR ((c.first_name || ' ' || c.last_name) ILIKE '%' || p_query || '%')"),
      
      heading("5.4 Add Comprehensive RLS Policies", HeadingLevel.HEADING_2),
      body("For tables where officers need to create records, ensure explicit INSERT policies exist. Example for properties table to allow officer property registrations:"),
      
      codeBlock("DROP POLICY IF EXISTS prop_insert_officer ON properties;"),
      codeBlock("CREATE POLICY prop_insert_officer ON properties FOR INSERT TO authenticated"),
      codeBlock("  WITH CHECK (is_commander() OR is_investigator() OR is_officer());"),
      
      heading("5.5 Add Error Handling in Application Code", HeadingLevel.HEADING_2),
      body("Modify the query wrapper functions in packages/database/src/queries.ts to detect silent failures by checking the returned row count:"),
      
      codeBlock("// Current code (misses silent failures):"),
      codeBlock("const { data, error } = await client.from(TABLES.CITATIONS).insert(...);"),
      codeBlock("if (error) console.error(error);  // Only catches thrown errors"),
      codeBlock(""),
      codeBlock("// Fixed code (catches silent RLS blocks):"),
      codeBlock("const { data, error, count } = await client.from(TABLES.CITATIONS)"),
      codeBlock("  .insert(..., { count: 'exact' });"),
      codeBlock("if (error || count === 0) {"),
      codeBlock("  console.error('Insert blocked - possible RLS issue', { error, count });"),
      codeBlock("}"),
      
      // Verification Steps
      heading("6. VERIFICATION CHECKLIST"),
      body("After applying fixes, verify each entity with these steps:"),
      bullet("Connect to Supabase SQL Editor with service_role key"),
      bullet("Run: SELECT * FROM pg_policies WHERE tablename = 'table_name';"),
      bullet("Verify INSERT policy exists and uses correct function references"),
      bullet("Test insert as authenticated officer (not admin)"),
      bullet("Check that returned row count equals number of inserted rows"),
      bullet("Verify audit_logs table shows the new entry (if triggers are active)"),
      
      // Summary Table
      heading("7. ISSUE SUMMARY MATRIX"),
      infoTable(
        ["Issue", "Affected Tables", "Severity", "Fix Complexity"],
        [
          ["RLS Silent Failure", "ALL tables", "CRITICAL", "Medium"],
          ["auth_user_id mismatch", "users, officers", "CRITICAL", "Low"],
          ["Wrong column names", "vehicles, citizens", "HIGH", "Low"],
          ["Missing INSERT policies", "properties, devices", "HIGH", "Medium"],
          ["Migration order deps", "properties, arrests", "MEDIUM", "Low"],
          ["No client-side checks", "Application layer", "MEDIUM", "Low"]
        ]
      ),
      
      // Conclusion
      heading("8. CONCLUSION"),
      body("The root cause of 'no error but not recorded' behavior in the TZ Police Digital Platform is definitively identified as Row-Level Security silently blocking INSERT operations. When RLS policies evaluate to FALSE for an insert operation, PostgreSQL (and by extension Supabase) returns success with zero rows affected rather than throwing an error. This is working as designed but creates a poor developer experience when policies are misconfigured or when the authentication context doesn't match expectations."),
      body("The recommended fix sequence is: (1) verify and reorder migrations if needed, (2) fix the auth_user_id linkage in user creation flows, (3) correct column name references in search/update functions, (4) review and expand RLS policies for tables where officers need write access, and (5) enhance client-side code to detect and report silent failures. With these fixes applied, all data submission workflows should correctly persist records to the database while maintaining proper security boundaries between user roles."),
      
      new Paragraph({ spacing: { before: 400 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 200 },
        children: [new TextRun({ text: "Report Generated: " + new Date().toISOString().split('T')[0], size: 20, color: c(P.secondary), font: "Calibri", italics: true })]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/home/z/my-project/download/TZ_Police_DB_Diagnostic_Report.docx", buf);
  console.log("Report generated: /home/z/my-project/download/TZ_Police_DB_Diagnostic_Report.docx");
});
