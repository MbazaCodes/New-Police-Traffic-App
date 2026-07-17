import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app.dart';
import 'core/constants/app_constants.dart';
import 'providers/auth_provider.dart';
import 'services/storage_service.dart';
import 'widgets/status_bar.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables.
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    // ignore: avoid_print
    print("Warning: Could not load .env file: $e");
  }

  // Initialize Supabase if keys are available.
  final supabaseUrl = dotenv.maybeGet('SUPABASE_URL');
  final supabaseAnonKey = dotenv.maybeGet('SUPABASE_ANON_KEY');

  if (supabaseUrl != null &&
      supabaseAnonKey != null &&
      supabaseUrl.startsWith('http')) {
    await Supabase.initialize(
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    );
  }

  // Init Hive-backed storage before the app starts.
  final storage = await StorageService.init();

  runApp(
    ProviderScope(
      overrides: [
        storageProvider.overrideWithValue(storage),
      ],
      child: const _Bootstrap(child: OfficerMobileApp()),
    ),
  );
}

/// Boots the auth state from storage before showing the UI.
class _Bootstrap extends ConsumerStatefulWidget {
  const _Bootstrap({required this.child});

  final Widget child;

  @override
  ConsumerState<_Bootstrap> createState() => _BootstrapState();
}

class _BootstrapState extends ConsumerState<_Bootstrap> {
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await ref.read(authProvider.notifier).bootstrap();
    if (mounted) setState(() => _ready = true);
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) {
      return const MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Scaffold(
          backgroundColor: Color(0xFF0F1A2E),
          body: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
                SizedBox(height: 12),
                Text(
                  AppConstants.appNameSw,
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Refresh the status bar style on each rebuild.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final isDark = Theme.of(context).brightness == Brightness.dark;
      StatusBar.applyStyle(brightness: isDark ? Brightness.dark : Brightness.light);
    });

    // Apply a transparent status bar so the gradient headers paint cleanly.
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
      ),
    );

    return widget.child;
  }
}
