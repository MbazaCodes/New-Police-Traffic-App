import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../screens/accident_report_screen.dart';
import '../screens/alerts_screen.dart';
import '../screens/citation_screen.dart';
import '../screens/history_screen.dart';
import '../screens/home_screen.dart';
import '../screens/login_screen.dart';
import '../screens/patrol_screen.dart';
import '../screens/pf3_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/search_results_screen.dart';
import '../screens/traffic_screen.dart';
import '../screens/vehicle_inspection_screen.dart';
import '../providers/auth_provider.dart';
import '../widgets/bottom_nav_bar.dart';

/// Navigation routes used across the app.
class AppRoutes {
  AppRoutes._();

  static const String login = '/login';
  static const String home = '/home';
  static const String traffic = '/traffic';
  static const String patrol = '/patrol';
  static const String alerts = '/alerts';
  static const String profile = '/profile';
  static const String searchResults = '/search-results';
  static const String accidentReport = '/accident-report';
  static const String vehicleInspection = '/vehicle-inspection';
  static const String pf3 = '/pf3';
  static const String citation = '/citation';
  static const String history = '/history';
}

/// Provides the configured [GoRouter] for the app.
///
/// Uses a [StatefulShellRoute.indexedStack] so each of the 5 bottom-nav tabs
/// preserves its own navigator state and scroll position.
final goRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.login,
    refreshListenable: _AuthListenable(ref),
    redirect: (context, state) {
      final loggedIn = ref.read(authProvider).isAuthenticated;
      final goingToLogin = state.matchedLocation == AppRoutes.login;

      if (!loggedIn && !goingToLogin) return AppRoutes.login;
      if (loggedIn && goingToLogin) return AppRoutes.home;
      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return ScaffoldWithBottomNav(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.home,
                name: 'home',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.traffic,
                name: 'traffic',
                builder: (context, state) => const TrafficScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.patrol,
                name: 'patrol',
                builder: (context, state) => const PatrolScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.alerts,
                name: 'alerts',
                builder: (context, state) => const AlertsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.profile,
                name: 'profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: AppRoutes.searchResults,
        name: 'search-results',
        builder: (context, state) => const SearchResultsScreen(),
      ),
      GoRoute(
        path: AppRoutes.accidentReport,
        name: 'accident-report',
        builder: (context, state) => const AccidentReportScreen(),
      ),
      GoRoute(
        path: AppRoutes.vehicleInspection,
        name: 'vehicle-inspection',
        builder: (context, state) => const VehicleInspectionScreen(),
      ),
      GoRoute(
        path: AppRoutes.pf3,
        name: 'pf3',
        builder: (context, state) => const Pf3Screen(),
      ),
      GoRoute(
        path: AppRoutes.citation,
        name: 'citation',
        builder: (context, state) => const CitationScreen(),
      ),
      GoRoute(
        path: AppRoutes.history,
        name: 'history',
        builder: (context, state) => const HistoryScreen(),
      ),
    ],
  );
});

/// Bridges Riverpod's auth state into a [Listenable] so GoRouter can react
/// to login/logout via `refreshListenable`.
class _AuthListenable extends ChangeNotifier {
  _AuthListenable(Ref ref) {
    ref.listen<AuthState>(authProvider, (_, __) {
      notifyListeners();
    });
  }
}

/// Wraps the active [StatefulNavigationBranch] with the bottom nav bar.
class ScaffoldWithBottomNav extends StatelessWidget {
  const ScaffoldWithBottomNav({
    super.key,
    required this.navigationShell,
  });

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: AppBottomNavBar(
        currentIndex: navigationShell.currentIndex,
        onTap: (i) => navigationShell.goBranch(
          i,
          initialLocation: i == navigationShell.currentIndex,
        ),
      ),
    );
  }
}
