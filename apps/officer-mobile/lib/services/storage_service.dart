import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../core/constants/app_constants.dart';

/// Thin wrapper around a Hive box for primitive key/value persistence.
class StorageService {
  StorageService._(this._box);

  final Box _box;

  /// Initialises Hive and opens the app box. Must be awaited before runApp.
  static Future<StorageService> init() async {
    await Hive.initFlutter();
    final box = await Hive.openBox(AppConstants.hiveBoxName);
    return StorageService._(box);
  }

  bool? getBool(String key) => _box.get(key) as bool?;
  Future<void> setBool(String key, bool value) => _box.put(key, value);

  String? getString(String key) => _box.get(key) as String?;
  Future<void> setString(String key, String value) => _box.put(key, value);

  int? getInt(String key) => _box.get(key) as int?;
  Future<void> setInt(String key, int value) => _box.put(key, value);

  Future<void> remove(String key) => _box.delete(key);
}

final storageProvider = Provider<StorageService>((ref) {
  throw UnimplementedError('storageProvider must be overridden in main()');
});

/// Convenience alias used by other providers.
final storageServiceProvider = storageProvider;
