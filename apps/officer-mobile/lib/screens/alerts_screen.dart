import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/theme/app_colors.dart';
import '../data/mock_data.dart';
import '../widgets/app_toast.dart';
import '../widgets/police_icon.dart';
import '../widgets/top_app_bar.dart';

/// Alerts screen — "Tuma Tangazo" button, filter tabs, alerts list.
/// Mirrors `src/components/police/screens/alerts-screen.tsx`.
class AlertsScreen extends ConsumerStatefulWidget {
  const AlertsScreen({super.key});

  @override
  ConsumerState<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends ConsumerState<AlertsScreen> {
  String _filter = 'all';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF0B1018) : AppColors.grayLight;
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final titleColor = isDark ? Colors.white : AppColors.navy;
    final subtleColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;
    final borderColor = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;

    final tabs = const [
      _AlertTab(id: 'all', label: 'Yote'),
      _AlertTab(id: 'mine', label: 'Kesi Zangu', badge: '2'),
      _AlertTab(id: 'important', label: 'Muhimu'),
    ];

    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: Column(
          children: [
            const TopAppBar(
              title: 'Arifa / Tangazo',
              subtitle: 'Pata taarifa na matangazo muhimu',
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Tuma Tangazo button
                    Material(
                      color: AppColors.blue,
                      borderRadius: BorderRadius.circular(16),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(16),
                        onTap: () => showAppToast(
                          context,
                          title: 'Tuma Tangazo',
                          description: 'Fomu ya kutuma tangazo itafunguka.',
                        ),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.2),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  LucideIcons.megaphone,
                                  size: 22,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: const [
                                    Text(
                                      'Tuma Tangazo',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.white,
                                      ),
                                    ),
                                    SizedBox(height: 2),
                                    Text(
                                      'Tuma tangazo kwa maofisa wote au vikundi maalum',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: Color(0xCCFFFFFF),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Filter tabs
                    Container(
                      decoration: BoxDecoration(
                        border: Border(
                          bottom: BorderSide(color: borderColor, width: 1),
                        ),
                      ),
                      child: Row(
                        children: [
                          ...tabs.map((t) => _AlertTabButton(
                                tab: t,
                                active: _filter == t.id,
                                titleColor: titleColor,
                                subtleColor: subtleColor,
                                onTap: () => setState(() => _filter = t.id),
                              )),
                          const Spacer(),
                          GestureDetector(
                            onTap: () => showAppToast(
                              context,
                              title: 'Arifa Zote',
                              description: 'Arifa zote zinaonyeshwa.',
                            ),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              child: Text(
                                'Angalia Yote',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: AppColors.blue,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Alert list
                    Column(
                      children: alerts.map((a) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: _AlertCard(
                            alert: a,
                            isDark: isDark,
                            cardColor: cardColor,
                            titleColor: titleColor,
                            subtleColor: subtleColor,
                            onTap: () => showAppToast(
                              context,
                              title: a.title,
                              description: a.source,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AlertTab {
  const _AlertTab({required this.id, required this.label, this.badge});

  final String id;
  final String label;
  final String? badge;
}

class _AlertTabButton extends StatelessWidget {
  const _AlertTabButton({
    required this.tab,
    required this.active,
    required this.titleColor,
    required this.subtleColor,
    required this.onTap,
  });

  final _AlertTab tab;
  final bool active;
  final Color titleColor;
  final Color subtleColor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              tab.label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                color: active ? AppColors.blue : subtleColor,
              ),
            ),
            if (tab.badge != null) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                alignment: Alignment.center,
                decoration: const BoxDecoration(
                  color: AppColors.red,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  tab.badge!,
                  style: const TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _AlertCard extends StatelessWidget {
  const _AlertCard({
    required this.alert,
    required this.isDark,
    required this.cardColor,
    required this.titleColor,
    required this.subtleColor,
    required this.onTap,
  });

  final Alert alert;
  final bool isDark;
  final Color cardColor;
  final Color titleColor;
  final Color subtleColor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: cardColor,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border(
              left: BorderSide(
                color: AppColors.fromHex(alert.borderColor),
                width: 4,
              ),
            ),
          ),
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40,
                height: 40,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color:
                      AppColors.tint(alert.iconColor, isDark ? 0.22 : 0.12),
                  shape: BoxShape.circle,
                ),
                child: PoliceIcon(
                  name: alert.icon,
                  size: 20,
                  color: AppColors.fromHex(alert.iconColor),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            alert.title,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: titleColor,
                              height: 1.2,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          width: 8,
                          height: 8,
                          margin: const EdgeInsets.only(top: 4),
                          decoration: BoxDecoration(
                            color: AppColors.fromHex(alert.dotColor),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      alert.time,
                      style: TextStyle(fontSize: 10, color: subtleColor),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      alert.message,
                      style: TextStyle(
                        fontSize: 12,
                        height: 1.4,
                        color: isDark
                            ? const Color(0xFFB4BCC9)
                            : const Color(0xFF6B7280),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color:
                                AppColors.fromHex(alert.sourceBg),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            alert.source,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: AppColors.fromHex(alert.borderColor),
                            ),
                          ),
                        ),
                        const Spacer(),
                        Icon(
                          LucideIcons.chevronRight,
                          size: 16,
                          color: subtleColor,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

