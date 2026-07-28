// ===== TZ Police Digital Platform — Shared Material 3 Theme =====
//
// Builds light + dark `ThemeData` from the shared `AppTokens` so the Flutter
// app and the PWA / web app use identical color values, radii, and typography.
//
// This file mirrors the spirit of `core/theme/app_theme.dart` already used by
// the officer-mobile app, but pulls every color from `AppTokens` / `AppColors`
// so there is exactly one source of truth.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../tokens/app_tokens.dart';

export '../tokens/app_tokens.dart' show AppTokens, AppColors, AppGradients, AppSpacing, AppRadius, AppTypography, AppStatusColors, AppShadows;

/// Light + Dark Material 3 themes for the TZ Police Digital Platform.
class AppTheme {
  AppTheme._();

  // ── Light theme ────────────────────────────────────────────────────────────
  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.bluePrimary,
      brightness: Brightness.light,
      primary: AppColors.bluePrimary,
      secondary: AppColors.blue,
      surface: AppColors.card,
      surfaceContainerHighest: AppColors.cardMuted,
      onPrimary: Colors.white,
      onSurface: AppColors.text,
      error: AppColors.red,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.bg,
      splashFactory: InkSparkle.splashFactory,
      textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme).copyWith(
        headlineLarge: GoogleFonts.inter(
          fontWeight: AppTypography.extrabold,
          color: AppColors.navy,
          fontSize: AppTypography.x5xl + 8, // 28
        ),
        headlineMedium: GoogleFonts.inter(
          fontWeight: AppTypography.extrabold,
          color: AppColors.navy,
          fontSize: AppTypography.x5xl + 2, // 22
        ),
        titleLarge: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          color: AppColors.navy,
          fontSize: AppTypography.x4xl, // 18
        ),
        titleMedium: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          color: AppColors.navy,
          fontSize: AppTypography.x2xl, // 16
        ),
        bodyLarge: GoogleFonts.inter(color: AppColors.text, fontSize: AppTypography.lg),
        bodyMedium: GoogleFonts.inter(color: AppColors.textMuted, fontSize: AppTypography.md),
        bodySmall: GoogleFonts.inter(color: AppColors.textMuted, fontSize: AppTypography.sm),
        labelLarge: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          color: Colors.white,
          fontSize: AppTypography.xl,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.xlAll),
        margin: EdgeInsets.zero,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.card,
        foregroundColor: AppColors.navy,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          color: AppColors.navy,
          fontSize: AppTypography.x5xl,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.input,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: AppRadius.lgAll,
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppRadius.lgAll,
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppRadius.lgAll,
          borderSide: const BorderSide(color: AppColors.bluePrimary, width: 1.6),
        ),
        labelStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: AppTypography.base),
        hintStyle: GoogleFonts.inter(color: AppColors.textFaint, fontSize: AppTypography.md),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.bluePrimary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: AppRadius.lgAll),
          textStyle: GoogleFonts.inter(
            fontWeight: AppTypography.bold,
            fontSize: AppTypography.xl,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.navy,
          side: const BorderSide(color: AppColors.navy, width: 1.6),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: AppRadius.lgAll),
          textStyle: GoogleFonts.inter(
            fontWeight: AppTypography.bold,
            fontSize: AppTypography.md,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.blueLink,
          textStyle: GoogleFonts.inter(
            fontWeight: AppTypography.semibold,
            fontSize: AppTypography.md,
          ),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.border,
        thickness: 1,
        space: 1,
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: AppColors.card,
        selectedItemColor: AppColors.blue,
        unselectedItemColor: AppColors.textFaint,
        selectedLabelStyle: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          fontSize: AppTypography.sm,
        ),
        unselectedLabelStyle: GoogleFonts.inter(
          fontWeight: AppTypography.medium,
          fontSize: AppTypography.sm,
        ),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }

  // ── Dark theme ─────────────────────────────────────────────────────────────
  static ThemeData dark() {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.blueBright,
      brightness: Brightness.dark,
      primary: AppColors.blueBright,
      secondary: AppColors.blue,
      surface: AppColors.darkCard,
      surfaceContainerHighest: AppColors.darkCardMuted,
      onPrimary: Colors.white,
      onSurface: AppColors.darkText,
      error: AppColors.red,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.darkBg,
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        headlineLarge: GoogleFonts.inter(
          fontWeight: AppTypography.extrabold,
          color: Colors.white,
          fontSize: AppTypography.x5xl + 8,
        ),
        headlineMedium: GoogleFonts.inter(
          fontWeight: AppTypography.extrabold,
          color: Colors.white,
          fontSize: AppTypography.x5xl + 2,
        ),
        titleLarge: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          color: Colors.white,
          fontSize: AppTypography.x4xl,
        ),
        titleMedium: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          color: const Color(0xFFDCE3F0),
          fontSize: AppTypography.x2xl,
        ),
        bodyLarge: GoogleFonts.inter(color: AppColors.darkText, fontSize: AppTypography.lg),
        bodyMedium: GoogleFonts.inter(color: AppColors.darkTextMuted, fontSize: AppTypography.md),
        bodySmall: GoogleFonts.inter(color: AppColors.darkTextFaint, fontSize: AppTypography.sm),
        labelLarge: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          color: Colors.white,
          fontSize: AppTypography.xl,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.darkCard,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.xlAll),
        margin: EdgeInsets.zero,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.darkCard,
        foregroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          color: Colors.white,
          fontSize: AppTypography.x5xl,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkCardMuted,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: AppRadius.lgAll,
          borderSide: const BorderSide(color: AppColors.darkBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppRadius.lgAll,
          borderSide: const BorderSide(color: AppColors.darkBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppRadius.lgAll,
          borderSide: const BorderSide(color: AppColors.blueBright, width: 1.6),
        ),
        labelStyle: GoogleFonts.inter(color: AppColors.darkTextMuted, fontSize: AppTypography.base),
        hintStyle: GoogleFonts.inter(color: AppColors.darkTextFaint, fontSize: AppTypography.md),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.blueBright,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: AppRadius.lgAll),
          textStyle: GoogleFonts.inter(
            fontWeight: AppTypography.bold,
            fontSize: AppTypography.xl,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: Colors.white,
          side: const BorderSide(color: Colors.white70, width: 1.6),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: AppRadius.lgAll),
          textStyle: GoogleFonts.inter(
            fontWeight: AppTypography.bold,
            fontSize: AppTypography.md,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.blueBright,
          textStyle: GoogleFonts.inter(
            fontWeight: AppTypography.semibold,
            fontSize: AppTypography.md,
          ),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.darkBorder,
        thickness: 1,
        space: 1,
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: AppColors.darkCard,
        selectedItemColor: AppColors.blueBright,
        unselectedItemColor: AppColors.darkTextFaint,
        selectedLabelStyle: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          fontSize: AppTypography.sm,
        ),
        unselectedLabelStyle: GoogleFonts.inter(
          fontWeight: AppTypography.medium,
          fontSize: AppTypography.sm,
        ),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }
}
