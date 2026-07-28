// ===== TZ Police — Shared Utilities =====

export function formatCurrency(amount: number): string {
  return `TZS ${amount.toLocaleString()}`;
}

export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d+(\d{2})/, "$1•••••$2");
}

export function maskNida(nida: string): string {
  if (nida.length <= 4) return nida;
  return nida.slice(0, 4) + "••••••" + nida.slice(-2);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    active: "#4CAF50",
    paid: "#4CAF50",
    resolved: "#4CAF50",
    sahihi: "#4CAF50",
    nzuri: "#4CAF50",
    break: "#FF9800",
    pending: "#FF9800",
    inasubiri: "#FF9800",
    maintenance: "#FF9800",
    "on-leave": "#FF9800",
    urgent: "#F44336",
    unpaid: "#F44336",
    inactive: "#F44336",
    "off-duty": "#9CA3AF",
    investigating: "#8B5CF6",
  };
  return map[status.toLowerCase()] || "#9CA3AF";
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "sasa hivi";
  if (seconds < 3600) return `dakika ${Math.floor(seconds / 60)} zilizopita`;
  if (seconds < 86400) return `saa ${Math.floor(seconds / 3600)} zilizopita`;
  return `siku ${Math.floor(seconds / 86400)} zilizopita`;
}
