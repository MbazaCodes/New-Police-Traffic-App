// ===== TZ Police Digital Platform — Shared UI Design Tokens =====
// Single source of truth for colors, typography, spacing, radius, shadows.
// Used by: PWA (Next.js), Web (Next.js), Flutter (Dart via tokens.json)

export const COLORS = {
  // Brand
  navy: "#1A237E",
  navyDark: "#002B5C",
  navyLight: "#0d1b3d",

  // Primary blues
  blue: "#2196F3",
  bluePrimary: "#0070C0",
  blueBright: "#3B82F6",
  blueDark: "#1976D2",

  // Gradients (PWA + Flutter)
  gradientHome: { from: "#1E3A8A", to: "#3B82F6" },
  gradientPatrol: { from: "#2196F3", to: "#1976D2" },
  gradientSidebar: { bg: "#0d1b3d" },

  // Status colors
  green: "#4CAF50",
  greenBright: "#10B981",
  orange: "#FF9800",
  orangeBright: "#F97316",
  red: "#F44336",
  redBright: "#EF4444",
  purple: "#9C27B0",
  purpleBright: "#8B5CF6",

  // Neutrals (light mode)
  bg: "#F5F5F5",
  card: "#FFFFFF",
  cardMuted: "#F9FAFB",
  text: "#1A1A1A",
  textMuted: "#6B7280",
  textFaint: "#9CA3AF",
  border: "#E5E7EB",
  borderSoft: "#F3F4F6",
  input: "#F9FAFB",

  // Neutrals (dark mode)
  darkBg: "#0B1120",
  darkCard: "#1E293B",
  darkCardMuted: "#334155",
  darkText: "#F1F5F9",
  darkTextMuted: "#94A3B8",
  darkTextFaint: "#64748B",
  darkBorder: "#334155",
  darkBorderSoft: "#1E293B",
  darkInput: "#0F172A",
} as const;

// Status color helper
export const STATUS_COLORS = {
  active: COLORS.green,
  paid: COLORS.green,
  resolved: COLORS.green,
  sahihi: COLORS.green,
  nzuri: COLORS.green,
  break: COLORS.orange,
  pending: COLORS.orange,
  inasubiri: COLORS.orange,
  maintenance: COLORS.orange,
  onleave: COLORS.orange,
  urgent: COLORS.red,
  unpaid: COLORS.red,
  inactive: COLORS.red,
  important: COLORS.red,
  offduty: COLORS.textFaint,
  investigating: COLORS.purpleBright,
} as const;

export const TYPOGRAPHY = {
  fontFamily: "Inter, system-ui, sans-serif",
  sizes: {
    xs: "10px",
    sm: "11px",
    base: "12px",
    md: "13px",
    lg: "14px",
    xl: "15px",
    "2xl": "16px",
    "3xl": "17px",
    "4xl": "18px",
    "5xl": "20px",
    "6xl": "22px",
    "7xl": "24px",
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
} as const;

export const SPACING = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
} as const;

export const RADIUS = {
  none: "0px",
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "20px",
  "3xl": "24px",
  full: "9999px",
} as const;

export const SHADOWS = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  md: "0 4px 6px rgba(0,0,0,0.07)",
  lg: "0 4px 12px rgba(0,0,0,0.08)",
  xl: "0 8px 24px rgba(0,0,0,0.12)",
  card: "0 2px 6px rgba(0,0,0,0.05)",
  cardHover: "0 4px 12px rgba(0,0,0,0.08)",
} as const;

// ===== Full theme definition =====
export const THEME = {
  light: {
    bg: COLORS.bg,
    card: COLORS.card,
    cardMuted: COLORS.cardMuted,
    text: COLORS.text,
    textMuted: COLORS.textMuted,
    textFaint: COLORS.textFaint,
    border: COLORS.border,
    borderSoft: COLORS.borderSoft,
    input: COLORS.input,
    navy: COLORS.navy,
    navyDark: COLORS.navyDark,
  },
  dark: {
    bg: COLORS.darkBg,
    card: COLORS.darkCard,
    cardMuted: COLORS.darkCardMuted,
    text: COLORS.darkText,
    textMuted: COLORS.darkTextMuted,
    textFaint: COLORS.darkTextFaint,
    border: COLORS.darkBorder,
    borderSoft: COLORS.darkBorderSoft,
    input: COLORS.darkInput,
    navy: "#93C5FD", // lighter navy for dark mode headers
    navyDark: "#BFDBFE",
  },
} as const;
