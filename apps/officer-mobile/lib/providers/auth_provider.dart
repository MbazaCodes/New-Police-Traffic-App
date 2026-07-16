import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/constants/app_constants.dart';
import '../services/storage_service.dart';

/// Authentication state for the officer.
class AuthState {
  const AuthState({
    this.isAuthenticated = false,
    this.identifier = '',
    this.method = AuthMethod.username,
  });

  final bool isAuthenticated;
  final String identifier;
  final AuthMethod method;

  AuthState copyWith({
    bool? isAuthenticated,
    String? identifier,
    AuthMethod? method,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      identifier: identifier ?? this.identifier,
      method: method ?? this.method,
    );
  }
}

enum AuthMethod { username, phone }

/// Riverpod notifier backing [authProvider].
class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._storage) : super(const AuthState());

  final StorageService _storage;

  /// Hydrate auth state from Hive on app startup.
  Future<void> bootstrap() async {
    final saved = _storage.getBool(AppConstants.hiveKeyAuth) ?? false;
    if (saved) state = state.copyWith(isAuthenticated: true);
  }

  /// Mark the officer as logged in (called by the LoginScreen success step).
  Future<void> login({
    String identifier = '',
    AuthMethod method = AuthMethod.username,
  }) async {
    state = AuthState(
      isAuthenticated: true,
      identifier: identifier,
      method: method,
    );
    await _storage.setBool(AppConstants.hiveKeyAuth, true);
  }

  Future<void> logout() async {
    state = const AuthState();
    await _storage.setBool(AppConstants.hiveKeyAuth, false);
  }
}

final authProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.watch(storageServiceProvider));
});
