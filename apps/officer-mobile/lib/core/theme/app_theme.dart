import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// Pull color / typography / radius values from the shared mirror of
// `packages/ui-tokens/src/index.ts` so this Flutter theme stays in lock-step
// with the PWA + Web themes. Other widgets in the app keep importing the
// local `app_colors.dart` for backwards-compatibility — those values are
// identical to the shared tokens, just renamed in a few cases.
import '../../shared/tokens/app_tokens.dart';

/// Light + Dark Material 3 themes for the TZ Police Digital Platform.
///
/// Every color, radius, and font weight below comes from [AppTokens] /
/// [AppColors] (the shared mirror of `packages/ui-tokens/src/index.ts`).
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
      textTheme: GoogleFonts.interTextTheme(_baseLightText).copyWith(
        headlineLarge: GoogleFonts.inter(
          fontWeight: AppTypography.extrabold,
          color: AppColors.navyDark,
          fontSize: 28,
        ),
        headlineMedium: GoogleFonts.inter(
          fontWeight: AppTypography.extrabold,
          color: AppColors.navyDark,
          fontSize: 22,
        ),
        titleLarge: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          color: AppColors.navyDark,
          fontSize: 18,
        ),
        titleMedium: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          color: AppColors.navy,
          fontSize: 16,
        ),
        bodyLarge: GoogleFonts.inter(
          color: AppColors.text,
          fontSize: 14,
        ),
        bodyMedium: GoogleFonts.inter(
          color: AppColors.textMuted,
          fontSize: 13,
        ),
        bodySmall: GoogleFonts.inter(
          color: AppColors.textMuted,
          fontSize: 11,
        ),
        labelLarge: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          color: Colors.white,
          fontSize: 15,
        ),
      ),
      cardTheme: const CardThemeData(
        color: AppColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.xlAll,
        ),
        margin: EdgeInsets.zero,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.card,
        foregroundColor: AppColors.navyDark,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          color: AppColors.navyDark,
          fontSize: 20,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.input,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: const OutlineInputBorder(
          borderRadius: AppRadius.lgAll,
          borderSide: BorderSide(color: AppColors.border),
        ),
        enabledBorder: const OutlineInputBorder(
          borderRadius: AppRadius.lgAll,
          borderSide: BorderSide(color: AppColors.border),
        ),
        focusedBorder: const OutlineInputBorder(
          borderRadius: AppRadius.lgAll,
          borderSide: BorderSide(color: AppColors.bluePrimary, width: 1.6),
        ),
        labelStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 12),
        hintStyle: GoogleFonts.inter(color: AppColors.textFaint, fontSize: 13),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.bluePrimary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: const RoundedRectangleBorder(
            borderRadius: AppRadius.lgAll,
          ),
          textStyle: GoogleFonts.inter(
            fontWeight: AppTypography.bold,
            fontSize: 15,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.navy,
          side: const BorderSide(color: AppColors.navy, width: 1.6),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: const RoundedRectangleBorder(
            borderRadius: AppRadius.lgAll,
          ),
          textStyle: GoogleFonts.inter(
            fontWeight: AppTypography.bold,
            fontSize: 13,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.blueLink,
          textStyle: GoogleFonts.inter(
            fontWeight: AppTypography.semibold,
            fontSize: 13,
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
          fontSize: 11,
        ),
        unselectedLabelStyle: GoogleFonts.inter(
          fontWeight: AppTypography.medium,
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
      textTheme: GoogleFonts.interTextTheme(_baseDarkText).copyWith(
        headlineLarge: GoogleFonts.inter(
          fontWeight: AppTypography.extrabold,
          color: Colors.white,
          fontSize: 28,
        ),
        headlineMedium: GoogleFonts.inter(
          fontWeight: AppTypography.extrabold,
          color: Colors.white,
          fontSize: 22,
        ),
        titleLarge: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          color: Colors.white,
          fontSize: 18,
        ),
        titleMedium: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          color: const Color(0xFFDCE3F0),
          fontSize: 16,
        ),
        bodyLarge: GoogleFonts.inter(color: AppColors.darkText, fontSize: 14),
        bodyMedium: GoogleFonts.inter(color: AppColors.darkTextMuted, fontSize: 13),
        bodySmall: GoogleFonts.inter(color: AppColors.darkTextFaint, fontSize: 11),
        labelLarge: GoogleFonts.inter(
          fontWeight: AppTypography.bold,
          color: Colors.white,
          fontSize: 15,
        ),
      ),
      cardTheme: const CardThemeData(
        color: AppColors.darkCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.xlAll,
        ),
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
          fontSize: 20,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkCardMuted,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: const OutlineInputBorder(
          borderRadius: AppRadius.lgAll,
          borderSide: BorderSide(color: AppColors.darkBorder),
        ),
        enabledBorder: const OutlineInputBorder(
          borderRadius: AppRadius.lgAll,
          borderSide: BorderSide(color: AppColors.darkBorder),
        ),
        focusedBorder: const OutlineInputBorder(
          borderRadius: AppRadius.lgAll,
          borderSide: BorderSide(color: AppColors.blueBright, width: 1.6),
        ),
        labelStyle: GoogleFonts.inter(color: AppColors.darkTextMuted, fontSize: 12),
        hintStyle: GoogleFonts.inter(color: AppColors.darkTextFaint, fontSize: 13),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.blueBright,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: const RoundedRectangleBorder(
            borderRadius: AppRadius.lgAll,
          ),
          textStyle: GoogleFonts.inter(
            fontWeight: AppTypography.bold,
            fontSize: 15,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: Colors.white,
          side: const BorderSide(color: Colors.white70, width: 1.6),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: const RoundedRectangleBorder(
            borderRadius: AppRadius.lgAll,
          ),
          textStyle: GoogleFonts.inter(
            fontWeight: AppTypography.bold,
            fontSize: 13,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.blueBright,
          textStyle: GoogleFonts.inter(
            fontWeight: AppTypography.semibold,
            fontSize: 13,
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
          fontSize: 11,
        ),
        unselectedLabelStyle: GoogleFonts.inter(
          fontWeight: AppTypography.medium,
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
