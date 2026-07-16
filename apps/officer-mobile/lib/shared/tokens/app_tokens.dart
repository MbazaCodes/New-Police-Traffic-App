// ===== TZ Police Digital Platform — Shared UI Design Tokens (Dart mirror) =====
//
// Mirror of `packages/ui-tokens/src/index.ts`.
// Single source of truth for colors, typography, spacing, radius, gradients.
// Used by: PWA (Next.js), Web (Next.js), Flutter (Dart — this file).
//
// All values are static `const` so they can be tree-shaken by the Dart compiler
// and resolve at compile-time, exactly like the TypeScript `as const` literals.
import 'package:flutter/material.dart';

/// Top-level container — mirrors the TypeScript `COLORS`, `TYPOGRAPHY`,
/// `SPACING`, `RADIUS`, `SHADOWS` and `STATUS_COLORS` exports.
class AppTokens {
  AppTokens._();

  // ===== Brand — Navy =====
  static const Color navy = Color(0xFF1A237E);
  static const Color navyDark = Color(0xFF002B5C);
  static const Color navyLight = Color(0xFF0D1B3D);

  // ===== Primary blues =====
  static const Color blue = Color(0xFF2196F3);
  static const Color bluePrimary = Color(0xFF0070C0);
  static const Color blueBright = Color(0xFF3B82F6);
  static const Color blueDark = Color(0xFF1976D2);
  static const Color blueIndigo = Color(0xFF1E3A8A);
  static const Color blueLink = Color(0xFF2563EB);

  // ===== Status colors =====
  static const Color green = Color(0xFF4CAF50);
  static const Color greenBright = Color(0xFF10B981);
  static const Color orange = Color(0xFFFF9800);
  static const Color orangeBright = Color(0xFFF97316);
  static const Color red = Color(0xFFF44336);
  static const Color redBright = Color(0xFFEF4444);
  static const Color purple = Color(0xFF9C27B0);
  static const Color purpleBright = Color(0xFF8B5CF6);

  // ===== Neutrals — gray =====
  static const Color gray = Color(0xFF9E9E9E);
  static const Color slate = Color(0xFF607D8B);

  // ===== Soft tints (backgrounds for badges / chips) =====
  static const Color greenSoft = Color(0xFFE8F5E9);
  static const Color redSoft = Color(0xFFFFEBEE);
  static const Color orangeSoft = Color(0xFFFFF3E0);
  static const Color blueSoft = Color(0xFFE3F2FD);
  static const Color purpleSoft = Color(0xFFF3E5F5);
  static const Color yellowSoft = Color(0xFFFFFBEB);

  /// Parse an arbitrary hex string ("#RRGGBB" or "AARRGGBB" with/without #).
  static Color fromHex(String hex) {
    var h = hex.replaceFirst('#', '');
    if (h.length == 6) h = 'FF$h';
    final v = int.parse(h, radix: 16);
    return Color(v);
  }

  /// Tint a color to roughly 8-10% opacity (mimics Tailwind `${color}15`).
  static Color tint(String hex, [double alpha = 0.10]) {
    return fromHex(hex).withValues(alpha: alpha);
  }
}

/// All colors from the TypeScript `COLORS` constant.
/// Mirrors `packages/ui-tokens/src/index.ts` → `COLORS`.
class AppColors {
  AppColors._();

  // Brand
  static const Color navy = AppTokens.navy;
  static const Color navyDark = AppTokens.navyDark;
  static const Color navyLight = AppTokens.navyLight;

  // Primary blues
  static const Color blue = AppTokens.blue;
  static const Color bluePrimary = AppTokens.bluePrimary;
  static const Color blueBright = AppTokens.blueBright;
  static const Color blueDark = AppTokens.blueDark;
  static const Color blueIndigo = AppTokens.blueIndigo;
  static const Color blueLink = AppTokens.blueLink;

  // Status
  static const Color green = AppTokens.green;
  static const Color greenBright = AppTokens.greenBright;
  static const Color orange = AppTokens.orange;
  static const Color orangeBright = AppTokens.orangeBright;
  static const Color red = AppTokens.red;
  static const Color redBright = AppTokens.redBright;
  static const Color purple = AppTokens.purple;
  static const Color purpleBright = AppTokens.purpleBright;

  // Neutrals — light mode
  static const Color bg = Color(0xFFF5F5F5);
  static const Color card = Color(0xFFFFFFFF);
  static const Color cardMuted = Color(0xFFF9FAFB);
  static const Color text = Color(0xFF1A1A1A);
  static const Color textMuted = Color(0xFF6B7280);
  static const Color textFaint = Color(0xFF9CA3AF);
  static const Color border = Color(0xFFE5E7EB);
  static const Color borderSoft = Color(0xFFF3F4F6);
  static const Color input = Color(0xFFF9FAFB);

  // Neutrals — dark mode
  static const Color darkBg = Color(0xFF0B1120);
  static const Color darkCard = Color(0xFF1E293B);
  static const Color darkCardMuted = Color(0xFF334155);
  static const Color darkText = Color(0xFFF1F5F9);
  static const Color darkTextMuted = Color(0xFF94A3B8);
  static const Color darkTextFaint = Color(0xFF64748B);
  static const Color darkBorder = Color(0xFF334155);
  static const Color darkBorderSoft = Color(0xFF1E293B);
  static const Color darkInput = Color(0xFF0F172A);
}

/// Gradient definitions used by the Home and Patrol screens.
/// Mirrors `COLORS.gradientHome` / `COLORS.gradientPatrol`.
class AppGradients {
  AppGradients._();

  /// Home header — indigo → bright blue.
  static const Color homeFrom = AppTokens.blueIndigo; // #1E3A8A
  static const Color homeTo = AppTokens.blueBright; //   #3B82F6

  /// Patrol header — blue → dark blue.
  static const Color patrolFrom = AppTokens.blue; //   #2196F3
  static const Color patrolTo = AppTokens.blueDark; // #1976D2

  /// Admin sidebar (web).
  static const Color sidebarBg = AppTokens.navyLight; // #0d1b3d

  /// Material `LinearGradient` builders.
  static const LinearGradient home = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [homeFrom, homeTo],
  );

  static const LinearGradient patrol = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [patrolFrom, patrolTo],
  );
}

/// 4 / 8 spacing scale mirroring `SPACING`.
class AppSpacing {
  AppSpacing._();

  static const double s0 = 0;
  static const double s1 = 4;
  static const double s2 = 8;
  static const double s3 = 12;
  static const double s4 = 16;
  static const double s5 = 20;
  static const double s6 = 24;
  static const double s8 = 32;
  static const double s10 = 40;
  static const double s12 = 48;
  static const double s16 = 64;

  /// Convenience EdgeInsets for the 4-px base grid.
  static const EdgeInsets all0 = EdgeInsets.all(s0);
  static const EdgeInsets all1 = EdgeInsets.all(s1);
  static const EdgeInsets all2 = EdgeInsets.all(s2);
  static const EdgeInsets all3 = EdgeInsets.all(s3);
  static const EdgeInsets all4 = EdgeInsets.all(s4);
  static const EdgeInsets all5 = EdgeInsets.all(s5);
  static const EdgeInsets all6 = EdgeInsets.all(s6);
  static const EdgeInsets all8 = EdgeInsets.all(s8);
}

/// Border radius values mirroring `RADIUS`.
class AppRadius {
  AppRadius._();

  static const double none = 0;
  static const double sm = 6;
  static const double md = 8;
  static const double lg = 12;
  static const double xl = 16;
  static const double x2xl = 20;
  static const double x3xl = 24;
  static const double full = 9999;

  /// Ready-to-use `Radius` objects (handy for `BorderRadius.circular`).
  static const Radius rSm = Radius.circular(sm);
  static const Radius rMd = Radius.circular(md);
  static const Radius rLg = Radius.circular(lg);
  static const Radius rXl = Radius.circular(xl);
  static const Radius r2xl = Radius.circular(x2xl);
  static const Radius r3xl = Radius.circular(x3xl);
  static const Radius rFull = Radius.circular(full);

  static const BorderRadius smAll = BorderRadius.all(rSm);
  static const BorderRadius mdAll = BorderRadius.all(rMd);
  static const BorderRadius lgAll = BorderRadius.all(rLg);
  static const BorderRadius xlAll = BorderRadius.all(rXl);
  static const BorderRadius x2xlAll = BorderRadius.all(r2xl);
  static const BorderRadius x3xlAll = BorderRadius.all(r3xl);
  static const BorderRadius fullAll = BorderRadius.all(rFull);
}

/// Typography scale mirroring `TYPOGRAPHY`.
class AppTypography {
  AppTypography._();

  static const String fontFamily = 'Inter';
  static const String fontFamilyFallback = 'system-ui, sans-serif';

  // Font sizes (px → logical pixels in Flutter)
  static const double xs = 10;
  static const double sm = 11;
  static const double base = 12;
  static const double md = 13;
  static const double lg = 14;
  static const double xl = 15;
  static const double x2xl = 16;
  static const double x3xl = 17;
  static const double x4xl = 18;
  static const double x5xl = 20;
  static const double x6xl = 22;
  static const double x7xl = 24;

  // Weights
  static const FontWeight normal = FontWeight.w400;
  static const FontWeight medium = FontWeight.w500;
  static const FontWeight semibold = FontWeight.w600;
  static const FontWeight bold = FontWeight.w700;
  static const FontWeight extrabold = FontWeight.w800;

  // Line heights
  static const double lineHeightTight = 1.2;
  static const double lineHeightNormal = 1.5;
  static const double lineHeightRelaxed = 1.6;
}

/// Maps status strings (lowercase, Swahili + English) to a `Color`,
/// mirroring `STATUS_COLORS` in the TypeScript tokens.
class AppStatusColors {
  AppStatusColors._();

  static const Color active = AppTokens.green;
  static const Color paid = AppTokens.green;
  static const Color resolved = AppTokens.green;
  static const Color sahihi = AppTokens.green;
  static const Color nzuri = AppTokens.green;

  static const Color break_ = AppTokens.orange; // 'break' is a Dart keyword
  static const Color pending = AppTokens.orange;
  static const Color inasubiri = AppTokens.orange;
  static const Color maintenance = AppTokens.orange;
  static const Color onleave = AppTokens.orange;

  static const Color urgent = AppTokens.red;
  static const Color unpaid = AppTokens.red;
  static const Color inactive = AppTokens.red;
  static const Color important = AppTokens.red;

  static const Color offduty = AppColors.textFaint;
  static const Color investigating = AppTokens.purpleBright;

  /// Lookup helper. Accepts any of the keys above (case-insensitive).
  /// Falls back to [fallback] (default: textFaint gray) when the status
  /// is not recognised.
  static Color of(String status, {Color fallback = AppColors.textFaint}) {
    switch (status.toLowerCase()) {
      case 'active':
      case 'paid':
      case 'resolved':
      case 'sahihi':
      case 'nzuri':
        return active;
      case 'break':
      case 'pending':
      case 'inasubiri':
      case 'maintenance':
      case 'on-leave':
      case 'onleave':
        return pending;
      case 'urgent':
      case 'unpaid':
      case 'inactive':
      case 'important':
        return urgent;
      case 'off-duty':
      case 'offduty':
        return offduty;
      case 'investigating':
        return investigating;
      default:
        return fallback;
    }
  }
}

/// Material 3 `BoxShadow` equivalents of `SHADOWS`.
class AppShadows {
  AppShadows._();

  static const List<BoxShadow> none = [];

  static const List<BoxShadow> sm = [
    BoxShadow(color: Color(0x0D000000), blurRadius: 2, offset: Offset(0, 1)),
  ];

  static const List<BoxShadow> md = [
    BoxShadow(color: Color(0x12000000), blurRadius: 6, offset: Offset(0, 4)),
  ];

  static const List<BoxShadow> lg = [
    BoxShadow(color: Color(0x14000000), blurRadius: 12, offset: Offset(0, 4)),
  ];

  static const List<BoxShadow> xl = [
    BoxShadow(color: Color(0x1F000000), blurRadius: 24, offset: Offset(0, 8)),
  ];

  static const List<BoxShadow> card = [
    BoxShadow(color: Color(0x0D000000), blurRadius: 6, offset: Offset(0, 2)),
  ];
}
