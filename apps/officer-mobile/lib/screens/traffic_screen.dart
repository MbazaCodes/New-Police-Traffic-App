import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/router/app_router.dart';
import '../core/theme/app_colors.dart';
import '../data/mock_data.dart';
import '../widgets/police_icon.dart';
import '../widgets/stat_card.dart';
import '../widgets/top_app_bar.dart';

/// Traffic screen — 4 stat cards, 7 quick actions, recent offenses list.
/// Mirrors `src/components/police/screens/traffic-screen.tsx`.
class TrafficScreen extends ConsumerWidget {
  const TrafficScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF0B1018) : AppColors.grayLight;
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final titleColor = isDark ? Colors.white : AppColors.ink;
    final subtleColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;

    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: Column(
          children: [
            const TopAppBar(
              title: 'Trafiki',
              subtitle: 'Usalama Wetu, Jukumu Letu',
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Stat cards row
                    Row(
                      children: List.generate(trafficStats.length, (i) {
                        final stat = trafficStats[i];
                        return Expanded(
                          child: Padding(
                            padding: EdgeInsets.only(
                              right: i == trafficStats.length - 1 ? 0 : 8,
                            ),
                            child: StatCard(
                              icon: stat.icon,
                              iconColor: stat.color,
                              value: stat.value,
                              label: stat.label,
                              sub: stat.sub,
                              iconSize: 18,
                              valueSize: 16,
                              labelSize: 8,
                            ),
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 16),
                    // Quick actions
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: cardColor,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: isDark
                            ? null
                            : const [
                                BoxShadow(
                                  color: Color(0x11000000),
                                  blurRadius: 6,
                                  offset: Offset(0, 1),
                                ),
                              ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Hatua za Haraka',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: titleColor,
                            ),
                          ),
                          const SizedBox(height: 12),
                          GridView.count(
                            crossAxisCount: 3,
                            crossAxisSpacing: 8,
                            mainAxisSpacing: 8,
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            childAspectRatio: 0.82,
                            children: trafficQuickActions.map((action) {
                              return _TrafficQuickAction(
                                action: action,
                                isDark: isDark,
                                onTap: () => context.push(action.route),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Recent offenses
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: cardColor,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: isDark
                            ? null
                            : const [
                                BoxShadow(
                                  color: Color(0x11000000),
                                  blurRadius: 6,
                                  offset: Offset(0, 1),
                                ),
                              ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Makosa ya Karibuni',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: titleColor,
                                ),
                              ),
                              GestureDetector(
                                onTap: () =>
                                    context.push(AppRoutes.history),
                                child: const Text(
                                  'Angalia Zote',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                    color: AppColors.blueLink,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Column(
                            children: recentOffenses.map((o) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 10),
                                child: _OffenseRow(
                                  offense: o,
                                  isDark: isDark,
                                  subtleColor: subtleColor,
                                  onTap: () =>
                                      context.push(AppRoutes.history),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
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

class _TrafficQuickAction extends StatelessWidget {
  const _TrafficQuickAction({
    required this.action,
    required this.isDark,
    required this.onTap,
  });

  final QuickAction action;
  final bool isDark;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final bgColor = isDark ? const Color(0xFF1A2336) : const Color(0xFFF9FAFB);
    final labelColor = isDark ? const Color(0xFFB4BCC9) : const Color(0xFF4B5563);

    return Material(
      color: bgColor,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 40,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.tint(action.color, isDark ? 0.22 : 0.12),
                  shape: BoxShape.circle,
                ),
                child: PoliceIcon(
                  name: action.icon,
                  size: 20,
                  color: AppColors.fromHex(action.color),
                ),
              ),
              const SizedBox(height: 6),
              Flexible(
                child: Text(
                  action.label,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    height: 1.15,
                    color: labelColor,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _OffenseRow extends StatelessWidget {
  const _OffenseRow({
    required this.offense,
    required this.isDark,
    required this.subtleColor,
    required this.onTap,
  });

  final Offense offense;
  final bool isDark;
  final Color subtleColor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final rowColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2A3650) : const Color(0xFFF1F3F6);
    final nameColor = isDark ? Colors.white : AppColors.ink;
    final fineColor = isDark ? Colors.white : AppColors.ink;

    return Material(
      color: rowColor,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            border: Border.all(color: borderColor),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.tint(offense.iconColor, isDark ? 0.22 : 0.12),
                  shape: BoxShape.circle,
                ),
                child: PoliceIcon(
                  name: offense.icon,
                  size: 20,
                  color: AppColors.fromHex(offense.iconColor),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            offense.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: nameColor,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.fromHex(offense.statusColor),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            offense.status,
                            style: const TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${offense.date} • ${offense.location}',
                      style: TextStyle(fontSize: 10, color: subtleColor),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      offense.fine,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: fineColor,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(LucideIcons.chevronRight, size: 18, color: subtleColor),
            ],
          ),
        ),
      ),
    );
  }
}

