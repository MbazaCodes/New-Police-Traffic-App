import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/constants/app_constants.dart';
import '../services/storage_service.dart';

/// Theme mode (system / light / dark) — persisted to Hive.
class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  ThemeModeNotifier(this._storage) : super(ThemeMode.system) {
    _hydrate();
  }

  final StorageService _storage;

  void _hydrate() {
    final raw = _storage.getString(AppConstants.hiveKeyThemeMode);
    state = _parse(raw) ?? ThemeMode.system;
  }

  Future<void> set(ThemeMode mode) async {
    state = mode;
    await _storage.setString(AppConstants.hiveKeyThemeMode, mode.name);
  }

  ThemeMode? _parse(String? raw) {
    switch (raw) {
      case 'system':
        return ThemeMode.system;
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      default:
        return null;
    }
  }
}

final themeProvider =
    StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) {
  return ThemeModeNotifier(ref.watch(storageServiceProvider));
});
