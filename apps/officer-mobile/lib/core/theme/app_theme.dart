import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

/// Light + Dark Material 3 themes for the TZ Police Digital Platform.
class AppTheme {
  AppTheme._();

  static const Color _lightSeed = AppColors.bluePrimary;
  static const Color _darkSeed = AppColors.blueBright;

  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(
      seedColor: _lightSeed,
      brightness: Brightness.light,
      primary: AppColors.bluePrimary,
      secondary: AppColors.blue,
      surface: Colors.white,
      surfaceContainerHighest: const Color(0xFFF1F3F6),
      onPrimary: Colors.white,
      onSurface: AppColors.ink,
      error: AppColors.red,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.grayLight,
      splashFactory: InkSparkle.splashFactory,
      textTheme: GoogleFonts.interTextTheme(_baseLightText).copyWith(
        headlineLarge: GoogleFonts.inter(
          fontWeight: FontWeight.w800,
          color: AppColors.navyDeep,
          fontSize: 28,
        ),
        headlineMedium: GoogleFonts.inter(
          fontWeight: FontWeight.w800,
          color: AppColors.navyDeep,
          fontSize: 22,
        ),
        titleLarge: GoogleFonts.inter(
          fontWeight: FontWeight.w700,
          color: AppColors.navyDeep,
          fontSize: 18,
        ),
        titleMedium: GoogleFonts.inter(
          fontWeight: FontWeight.w700,
          color: AppColors.navy,
          fontSize: 16,
        ),
        bodyLarge: GoogleFonts.inter(
          color: AppColors.ink,
          fontSize: 14,
        ),
        bodyMedium: GoogleFonts.inter(
          color: AppColors.grayText,
          fontSize: 13,
        ),
        bodySmall: GoogleFonts.inter(
          color: AppColors.grayText,
          fontSize: 11,
        ),
        labelLarge: GoogleFonts.inter(
          fontWeight: FontWeight.w700,
          color: Colors.white,
          fontSize: 15,
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        margin: EdgeInsets.zero,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: AppColors.navyDeep,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.inter(
          fontWeight: FontWeight.w700,
          color: AppColors.navyDeep,
          fontSize: 20,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.grayField,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.grayBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.grayBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.bluePrimary, width: 1.6),
        ),
        labelStyle: GoogleFonts.inter(color: AppColors.grayText, fontSize: 12),
        hintStyle: GoogleFonts.inter(color: AppColors.gray, fontSize: 13),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.bluePrimary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.inter(
            fontWeight: FontWeight.w700,
            fontSize: 15,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.navy,
          side: const BorderSide(color: AppColors.navy, width: 1.6),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.inter(
            fontWeight: FontWeight.w700,
            fontSize: 13,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.blueLink,
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.grayBorder,
        thickness: 1,
        space: 1,
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: AppColors.blue,
        unselectedItemColor: AppColors.gray,
        selectedLabelStyle: GoogleFonts.inter(
          fontWeight: FontWeight.w700,
          fontSize: 11,
        ),
        unselectedLabelStyle: GoogleFonts.inter(
          fontWeight: FontWeight.w500,
          fontSize: 11,
        ),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }

  static ThemeData dark() {
    final scheme = ColorScheme.fromSeed(
      seedColor: _darkSeed,
      brightness: Brightness.dark,
      primary: AppColors.blueBright,
      secondary: AppColors.blue,
      surface: const Color(0xFF0F1626),
      surfaceContainerHighest: const Color(0xFF1A2336),
      onPrimary: Colors.white,
      onSurface: const Color(0xFFE6EAF2),
      error: AppColors.red,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: scheme,
      scaffoldBackgroundColor: const Color(0xFF0B1018),
      textTheme: GoogleFonts.interTextTheme(_baseDarkText).copyWith(
        headlineLarge: GoogleFonts.inter(
          fontWeight: FontWeight.w800,
          color: Colors.white,
          fontSize: 28,
        ),
        headlineMedium: GoogleFonts.inter(
          fontWeight: FontWeight.w800,
          color: Colors.white,
          fontSize: 22,
        ),
        titleLarge: GoogleFonts.inter(
          fontWeight: FontWeight.w700,
          color: Colors.white,
          fontSize: 18,
        ),
        titleMedium: GoogleFonts.inter(
          fontWeight: FontWeight.w700,
          color: const Color(0xFFDCE3F0),
          fontSize: 16,
        ),
        bodyLarge: GoogleFonts.inter(color: const Color(0xFFE6EAF2), fontSize: 14),
        bodyMedium: GoogleFonts.inter(color: const Color(0xFFB4BCC9), fontSize: 13),
        bodySmall: GoogleFonts.inter(color: const Color(0xFF8A94A6), fontSize: 11),
        labelLarge: GoogleFonts.inter(
          fontWeight: FontWeight.w700,
          color: Colors.white,
          fontSize: 15,
        ),
      ),
      cardTheme: CardThemeData(
        color: const Color(0xFF151C2B),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        margin: EdgeInsets.zero,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: const Color(0xFF0F1626),
        foregroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.inter(
          fontWeight: FontWeight.w700,
          color: Colors.white,
          fontSize: 20,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF1A2336),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF2A3650)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF2A3650)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.blueBright, width: 1.6),
        ),
        labelStyle: GoogleFonts.inter(color: const Color(0xFFB4BCC9), fontSize: 12),
        hintStyle: GoogleFonts.inter(color: const Color(0xFF6B7689), fontSize: 13),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.blueBright,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.inter(
            fontWeight: FontWeight.w700,
            fontSize: 15,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: Colors.white,
          side: const BorderSide(color: Colors.white70, width: 1.6),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.blueBright,
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: Color(0xFF2A3650),
        thickness: 1,
        space: 1,
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: const Color(0xFF0F1626),
        selectedItemColor: AppColors.blueBright,
        unselectedItemColor: const Color(0xFF6B7689),
        selectedLabelStyle: GoogleFonts.inter(
          fontWeight: FontWeight.w700,
          fontSize: 11,
        ),
        unselectedLabelStyle: GoogleFonts.inter(
          fontWeight: FontWeight.w500,
          fontSize: 11,
        ),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }

  // Base text themes used so the GoogleFonts variant keeps platform defaults
  // but our explicit copies below override what we need.
  static final TextTheme _baseLightText = ThemeData.light().textTheme;
  static final TextTheme _baseDarkText = ThemeData.dark().textTheme;
}
