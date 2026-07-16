import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Bottom-nav tab identifiers (matches the 5 tabs in the PWA).
enum NavTab { home, traffic, patrol, alerts, profile }

/// Active tab state, kept in sync with the [StatefulShellRoute].
class NavigationState {
  const NavigationState({this.activeTab = NavTab.home});

  final NavTab activeTab;

  NavigationState copyWith({NavTab? activeTab}) =>
      NavigationState(activeTab: activeTab ?? this.activeTab);
}

class NavigationNotifier extends StateNotifier<NavigationState> {
  NavigationNotifier() : super(const NavigationState());

  void setTab(NavTab tab) => state = state.copyWith(activeTab: tab);
}

final navigationProvider =
    StateNotifierProvider<NavigationNotifier, NavigationState>((ref) {
  return NavigationNotifier();
});
