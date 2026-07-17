// User detail API — patch (update role, suspend), delete
// PATCH  /api/users/[id]  -> update user (role, status)
// DELETE /api/users/[id]  -> delete user

import { NextResponse } from "next/server";
import { ADMIN_USERS } from "@/lib/admin-data";
import { MOCK_USERS } from "@/lib/auth";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";

const usersStore: typeof ADMIN_USERS = [...ADMIN_USERS];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "users", "update");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const idx = usersStore.findIndex((u) => u.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const updated = { ...usersStore[idx], ...body, id: usersStore[idx].id };
    usersStore[idx] = updated;

    // Mirror changes in the auth mock users table
    const authIdx = MOCK_USERS.findIndex((u) => u.id === id);
    if (authIdx !== -1) {
      if (body.role) MOCK_USERS[authIdx].role = body.role;
      if (body.status) {
        MOCK_USERS[authIdx].status = body.status === "suspended" ? "suspended" : "active";
      }
      if (body.station) MOCK_USERS[authIdx].station = body.station;
      if (body.email) MOCK_USERS[authIdx].email = body.email;
      if (body.name) MOCK_USERS[authIdx].name = body.name;
    }

    logAction(
      session!.user.id,
      "update",
      "users",
      id,
      { changes: body },
      session!.user.name,
    );

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update user", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "users", "delete");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const idx = usersStore.findIndex((u) => u.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const [removed] = usersStore.splice(idx, 1);

    // Also remove from auth mock users table
    const authIdx = MOCK_USERS.findIndex((u) => u.id === id);
    if (authIdx !== -1) {
      MOCK_USERS.splice(authIdx, 1);
    }

    logAction(
      session!.user.id,
      "delete",
      "users",
      id,
      { user: removed },
      session!.user.name,
    );

    return NextResponse.json({ data: { id, deleted: true } }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete user", detail: String(err) },
      { status: 500 },
    );
  }
}
