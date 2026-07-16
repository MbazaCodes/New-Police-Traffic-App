// Users (admin users) API — list & create
// GET  /api/users  -> list admin users
// POST /api/users  -> create user

import { NextResponse } from "next/server";
import { ADMIN_USERS } from "@/lib/admin-data";
import { MOCK_USERS } from "@/lib/auth";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";

const usersStore: typeof ADMIN_USERS = [...ADMIN_USERS];

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "users", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const url = new URL(request.url);
    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";

    let result = [...usersStore];
    if (role && role !== "all") {
      result = result.filter((u) => u.role === role);
    }
    if (status && status !== "all") {
      result = result.filter((u) => u.status === status);
    }
    if (search) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.id.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.station.toLowerCase().includes(search),
      );
    }

    return NextResponse.json({ data: result, total: result.length }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list users", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "users", "create");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await request.json().catch(() => ({}));
    for (const field of ["name", "email", "role", "rank", "station"]) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const id = body.id ?? `ADM-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const newUser = {
      id,
      name: String(body.name),
      role: String(body.role),
      rank: String(body.rank),
      email: String(body.email),
      station: String(body.station),
      status: body.status ?? "active",
      lastLogin: now.toLocaleString("sw-TZ"),
    };
    usersStore.unshift(newUser);

    // Also push to the auth mock users table so the new user can log in.
    MOCK_USERS.push({
      id,
      name: newUser.name,
      email: newUser.email,
      phone: body.phone ?? "",
      idNumber: body.idNumber ?? id,
      station: newUser.station,
      role: body.role,
      password: body.password ?? "officer123",
      status: body.status === "suspended" ? "suspended" : "active",
    });

    logAction(
      session!.user.id,
      "create",
      "users",
      id,
      { user: newUser },
      session!.user.name,
    );

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create user", detail: String(err) },
      { status: 500 },
    );
  }
}
