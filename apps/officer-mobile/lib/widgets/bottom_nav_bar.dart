import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../core/theme/app_colors.dart';
import '../providers/navigation_provider.dart';
import 'police_logo.dart';

/// Bottom navigation bar matching the 5-tab PWA nav (Nyumbani / Trafiki /
/// Patroli / Arifa / Akaunti). Uses a [BottomNavigationBar] with badges for
/// the alerts tab and an animated indicator pill above the active item.
class AppBottomNavBar extends ConsumerWidget {
  const AppBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  final int currentIndex;
  final ValueChanged<int> onTap;

  static const _items = <_NavItem>[
    _NavItem(tab: NavTab.home, label: 'Nyumbani', icon: LucideIcons.home),
    _NavItem(tab: NavTab.traffic, label: 'Trafiki', icon: LucideIcons.car),
    _NavItem(tab: NavTab.patrol, label: 'Patroli', icon: LucideIcons.shield),
    _NavItem(tab: NavTab.alerts, label: 'Arifa', icon: LucideIcons.bell, badge: '3'),
    _NavItem(tab: NavTab.profile, label: 'Akaunti', icon: LucideIcons.user),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final activeColor = isDark ? AppColors.blueBright : AppColors.blue;
    final inactiveColor = isDark ? const Color(0xFF6B7689) : AppColors.gray;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F1626) : Colors.white,
        border: Border(
          top: BorderSide(
            color: isDark ? const Color(0xFF2A3650) : const Color(0xFFE5E7EB),
            width: 1,
          ),
        ),
      ),
      padding: const EdgeInsets.only(top: 8, bottom: 10),
      child: SafeArea(
        top: false,
        child: Row(
          children: List.generate(_items.length, (i) {
            final item = _items[i];
            final active = i == currentIndex;
            final color = active ? activeColor : inactiveColor;
            return Expanded(
              child: InkWell(
                onTap: () {
                  ref.read(navigationProvider.notifier).setTab(item.tab);
                  onTap(i);
                },
                borderRadius: BorderRadius.circular(12),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Icon(item.icon, size: 24, color: color),
                        ),
                        if (item.badge != null)
                          Positioned(
                            right: -8,
                            top: -2,
                            child: Container(
                              constraints: const BoxConstraints(
                                minWidth: 16,
                                minHeight: 16,
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 4),
                              alignment: Alignment.center,
                              decoration: const BoxDecoration(
                                color: AppColors.red,
                                shape: BoxShape.circle,
                              ),
                              child: Text(
                                item.badge!,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 9,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item.label,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                        color: color,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}

class _NavItem {
  const _NavItem({
    required this.tab,
    required this.label,
    required this.icon,
    this.badge,
  });

  final NavTab tab;
  final String label;
  final IconData icon;
  final String? badge;
}
