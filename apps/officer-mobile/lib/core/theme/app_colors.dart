import 'package:flutter/material.dart';

/// Central color palette for the TZ Police Digital Platform.
/// Extracted from the Next.js PWA (src/lib/police-data.ts + screen files).
class AppColors {
  AppColors._();

  // Brand — Navy
  static const Color navy = Color(0xFF1A237E);
  static const Color navyDeep = Color(0xFF002B5C);
  static const Color navyDark = Color(0xFF0A3D62);

  // Brand — Blue
  static const Color blue = Color(0xFF2196F3);
  static const Color blueDark = Color(0xFF1976D2);
  static const Color bluePrimary = Color(0xFF0070C0);
  static const Color blueBright = Color(0xFF3B82F6);
  static const Color blueIndigo = Color(0xFF1E3A8A);
  static const Color blueLink = Color(0xFF2563EB);

  // Status colors
  static const Color green = Color(0xFF4CAF50);
  static const Color greenEmerald = Color(0xFF10B981);
  static const Color orange = Color(0xFFFF9800);
  static const Color orangeBright = Color(0xFFF97316);
  static const Color red = Color(0xFFF44336);
  static const Color redBright = Color(0xFFEF4444);
  static const Color purple = Color(0xFF9C27B0);
  static const Color purpleViolet = Color(0xFF8B5CF6);

  // Neutrals
  static const Color gray = Color(0xFF9E9E9E);
  static const Color grayText = Color(0xFF757575);
  static const Color grayLight = Color(0xFFF5F5F5);
  static const Color grayField = Color(0xFFF9FAFB);
  static const Color grayBorder = Color(0xFFE5E7EB);
  static const Color gray100 = Color(0xFFF3F4F6);
  static const Color ink = Color(0xFF1A1A1A);

  // Soft backgrounds (light tints)
  static const Color greenSoft = Color(0xFFE8F5E9);
  static const Color greenSoftLight = Color(0xFFE8F5E9);
  static const Color redSoft = Color(0xFFFFEBEE);
  static const Color orangeSoft = Color(0xFFFFF3E0);
  static const Color blueSoft = Color(0xFFE3F2FD);
  static const Color yellowSoft = Color(0xFFFFFBEB);

  /// Parse an arbitrary hex string ("#RRGGBB" or "AARRGGBB" with/without #).
  static Color fromHex(String hex) {
    var h = hex.replaceFirst('#', '');
    if (h.length == 6) h = 'FF$h';
    final v = int.parse(h, radix: 16);
    return Color(v);
  }

  /// Tint a color to roughly 8-10% opacity (mimics Tailwind `${color}15` and `${color}18`).
  static Color tint(String hex, [double alpha = 0.10]) {
    return fromHex(hex).withValues(alpha: alpha);
  }
}
