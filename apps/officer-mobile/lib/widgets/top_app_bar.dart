import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../core/theme/app_colors.dart';
import 'police_logo.dart';

/// Reusable top app bar matching the PWA's `<TopAppBar/>`.
///
/// - Solid white/dark surface (no harsh elevation).
/// - Optional back chevron (calls [GoRouter.pop]).
/// - Optional bell with red badge.
/// - Optional circular police logo avatar.
class TopAppBar extends StatelessWidget implements PreferredSizeWidget {
  const TopAppBar({
    super.key,
    required this.title,
    this.subtitle,
    this.showBack = false,
    this.showBell = true,
    this.showLogo = true,
    this.bellCount = '3',
  });

  final String title;
  final String? subtitle;
  final bool showBack;
  final bool showBell;
  final bool showLogo;
  final String bellCount;

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final titleColor = isDark ? Colors.white : AppColors.navyDeep;
    final subColor = isDark ? const Color(0xFFB4BCC9) : AppColors.grayText;
    final iconColor = isDark ? const Color(0xFFB4BCC9) : const Color(0xFF6B7280);

    return Material(
      color: isDark ? const Color(0xFF0F1626) : Colors.white,
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              if (showBack)
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: IconButton(
                    icon: const Icon(LucideIcons.chevronLeft, size: 26),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                    color: iconColor,
                    onPressed: () => context.pop(),
                    tooltip: 'Rudi',
                  ),
                ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: titleColor,
                        height: 1.2,
                      ),
                    ),
                    if (subtitle != null)
                      Text(
                        subtitle!,
                        style: TextStyle(fontSize: 12, color: subColor, height: 1.2),
                      ),
                  ],
                ),
              ),
              if (showBell)
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Icon(LucideIcons.bell, size: 24, color: iconColor),
                      Positioned(
                        right: -4,
                        top: -4,
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
                            bellCount,
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
                ),
              if (showLogo)
                PoliceLogo(
                  size: 36,
                  ringColor: AppColors.blue,
                  ringWidth: 2,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
