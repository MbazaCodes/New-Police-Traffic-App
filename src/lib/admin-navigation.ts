export function getAdminBasePath(pathname: string): "/admin" | "/command" {
  return pathname.startsWith("/command") ? "/command" : "/admin";
}

export function getOfficerProfilePath(pathname: string, officerId: string): string {
  return `${getAdminBasePath(pathname)}/officers/${encodeURIComponent(officerId)}`;
}

export function getAdminEntityPath(
  pathname: string,
  entity: "users" | "stations" | "posts" | "assignments" | "incidents" | "citations",
  id: string
): string {
  return `${getAdminBasePath(pathname)}/${entity}/${encodeURIComponent(id)}`;
}

export function getAdminCreatePath(
  pathname: string,
  entity: "users" | "posts"
): string {
  return `${getAdminBasePath(pathname)}/${entity}/create`;
}
