/// App-wide constants for the TZ Police Digital Platform officer mobile app.
class AppConstants {
  AppConstants._();

  static const String appName = 'Officer Mobile';
  static const String appNameSw = 'Jeshi la Polisi Tanzania';
  static const String tagline = 'USALAMA WETU, JUKUMU LETU';
  static const String hiveBoxName = 'officer_mobile_box';
  static const String hiveKeyAuth = 'is_authenticated';
  static const String hiveKeyThemeMode = 'theme_mode';

  /// Number of digits in the OTP code.
  static const int otpLength = 6;

  /// Resend OTP countdown (seconds).
  static const int otpResendSeconds = 45;

  /// Bottom-nav tab count.
  static const int tabCount = 5;
}
