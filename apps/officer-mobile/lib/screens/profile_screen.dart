import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/router/app_router.dart';
import '../core/theme/app_colors.dart';
import '../data/mock_data.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../widgets/app_toast.dart';
import '../widgets/police_icon.dart';
import '../widgets/police_logo.dart';
import '../widgets/top_app_bar.dart';

/// Profile screen — header, dashboard stats, recent activities, settings,
/// download report, logout. Mirrors `src/components/police/screens/profile-screen.tsx`.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF0B1018) : AppColors.grayLight;
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final titleColor = isDark ? Colors.white : AppColors.navy;
    final subtleColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;

    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: Column(
          children: [
            const TopAppBar(
              title: 'Akaunti / Dashibodi',
              subtitle: 'Maelezo ya afisa na muhtasari wa shughuli',
              showLogo: false,
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _ProfileHeaderCard(
                      isDark: isDark,
                      cardColor: cardColor,
                      titleColor: titleColor,
                      subtleColor: subtleColor,
                      onEdit: () => showAppToast(
                        context,
                        title: 'Hariri Profaili',
                        description: 'Fomu ya kuhariri profaili itafunguka.',
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Dashboard stats heading
                    Padding(
                      padding: const EdgeInsets.only(left: 4, bottom: 8),
                      child: Text(
                        'Muhtasari wa Dashibodi',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: titleColor,
                        ),
                      ),
                    ),
                    GridView.count(
                      crossAxisCount: 2,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      childAspectRatio: 1.7,
                      children: [
                        ...profileStats.map((s) => _ProfileStatCard(
                              stat: s,
                              isDark: isDark,
                              cardColor: cardColor,
                            )),
                        _MoreReportsCell(isDark: isDark),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Recent activities
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
                                'Shughuli za Hivi Karibuni',
                                style: TextStyle(
                                  fontSize: 14,
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
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: AppColors.blue,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          ...profileActivities.map((a) => Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: _ActivityRow(
                                  activity: a,
                                  isDark: isDark,
                                  subtleColor: subtleColor,
                                ),
                              )),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Settings
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 12),
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
                          Padding(
                            padding: const EdgeInsets.fromLTRB(12, 4, 12, 8),
                            child: Text(
                              'Zana na Mipangilio',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: titleColor,
                              ),
                            ),
                          ),
                          // Theme toggle row (special)
                          _ThemeToggleRow(
                            isDark: isDark,
                            titleColor: titleColor,
                            subtleColor: subtleColor,
                          ),
                          ...profileSettings.map((s) => _SettingsRow(
                                setting: s,
                                isDark: isDark,
                                subtleColor: subtleColor,
                                onTap: () => showAppToast(
                                  context,
                                  title: s.label,
                                  description: 'Ukiwa tayari kufungua...',
                                ),
                              )),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Download report
                    Material(
                      color: AppColors.blue,
                      borderRadius: BorderRadius.circular(16),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(16),
                        onTap: () => showAppToast(
                          context,
                          title: 'Inapakua',
                          description:
                              'Ripoti ya shughuli inapakuliwa kama PDF.',
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
                                  LucideIcons.download,
                                  size: 22,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 12),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Pakua Ripoti Kuu',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.white,
                                      ),
                                    ),
                                    SizedBox(height: 2),
                                    Text(
                                      'Pakua ripoti ya shughuli zako kwa kipindi',
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
                    // Logout
                    Material(
                      color: cardColor,
                      borderRadius: BorderRadius.circular(16),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(16),
                        onTap: () async {
                          await ref.read(authProvider.notifier).logout();
                          if (context.mounted) context.goNamed('login');
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: AppColors.red.withValues(alpha: 0.3),
                            ),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(LucideIcons.logOut, size: 18, color: AppColors.red),
                              SizedBox(width: 8),
                              Text(
                                'Toka (Logout)',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.red,
                                ),
                              ),
                            ],
                          ),
                        ),
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

class _ProfileHeaderCard extends StatelessWidget {
  const _ProfileHeaderCard({
    required this.isDark,
    required this.cardColor,
    required this.titleColor,
    required this.subtleColor,
    required this.onEdit,
  });

  final bool isDark;
  final Color cardColor;
  final Color titleColor;
  final Color subtleColor;
  final VoidCallback onEdit;

  @override
  Widget build(BuildContext context) {
    final valueColor =
        isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);
    final borderColor = isDark ? const Color(0xFF2A3650) : const Color(0xFFF1F3F6);

    return Container(
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: borderColor,
                    width: 2,
                  ),
                ),
                child: const PoliceLogo(size: 64),
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
                            officer.name,
                            style: TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w700,
                              color: titleColor,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.greenSoft,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Text(
                            'Mtaandao',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: AppColors.green,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Namba ya Utambulisho: ${officer.id}',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: AppColors.blue,
                      ),
                    ),
                    const SizedBox(height: 8),
                    GestureDetector(
                      onTap: onEdit,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          border: Border.all(color: AppColors.blue),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(LucideIcons.pencil, size: 12, color: AppColors.blue),
                            SizedBox(width: 4),
                            Text(
                              'Hariri Profaili',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AppColors.blue,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            decoration: BoxDecoration(
              border: Border(
                top: BorderSide(color: borderColor, width: 1),
              ),
            ),
            padding: const EdgeInsets.only(top: 12),
            child: Column(
              children: [
                _DetailRow(
                  label: 'Nafasi',
                  value: officer.rank,
                  subtleColor: subtleColor,
                  valueColor: valueColor,
                ),
                const SizedBox(height: 6),
                _DetailRow(
                  label: 'Kitengo',
                  value: officer.unit,
                  subtleColor: subtleColor,
                  valueColor: valueColor,
                ),
                const SizedBox(height: 6),
                _DetailRow(
                  label: 'Kituo',
                  value: officer.station,
                  subtleColor: subtleColor,
                  valueColor: valueColor,
                ),
                const SizedBox(height: 6),
                _DetailRow(
                  label: 'Namba ya Simu',
                  value: officer.phone,
                  subtleColor: subtleColor,
                  valueColor: valueColor,
                ),
                const SizedBox(height: 6),
                _DetailRow(
                  label: 'Barua Pepe',
                  value: officer.email,
                  subtleColor: subtleColor,
                  valueColor: valueColor,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.label,
    required this.value,
    required this.subtleColor,
    required this.valueColor,
  });

  final String label;
  final String value;
  final Color subtleColor;
  final Color valueColor;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 12, color: subtleColor),
        ),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: valueColor,
            ),
          ),
        ),
      ],
    );
  }
}

class _ProfileStatCard extends StatelessWidget {
  const _ProfileStatCard({
    required this.stat,
    required this.isDark,
    required this.cardColor,
  });

  final ProfileStat stat;
  final bool isDark;
  final Color cardColor;

  @override
  Widget build(BuildContext context) {
    final valueColor = isDark ? Colors.white : AppColors.ink;
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final subColor = isDark ? const Color(0xFF6B7689) : AppColors.gray;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(12),
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
            children: [
              Container(
                width: 32,
                height: 32,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.tint(stat.color, isDark ? 0.22 : 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: PoliceIcon(
                  name: stat.icon,
                  size: 16,
                  color: AppColors.fromHex(stat.color),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                stat.value,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: valueColor,
                  height: 1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            stat.label,
            style: TextStyle(fontSize: 10, height: 1.1, color: labelColor),
          ),
          const SizedBox(height: 2),
          Text(
            stat.sub,
            style: TextStyle(fontSize: 9, color: subColor),
          ),
        ],
      ),
    );
  }
}

class _MoreReportsCell extends StatelessWidget {
  const _MoreReportsCell({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final borderColor = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final subtleColor = isDark ? const Color(0xFF6B7689) : AppColors.gray;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: borderColor, width: 2, style: BorderStyle.solid),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.download, size: 18, color: subtleColor),
          const SizedBox(height: 4),
          Text(
            'Ripoti Zaidi',
            style: TextStyle(fontSize: 9, color: subtleColor),
          ),
        ],
      ),
    );
  }
}

class _ActivityRow extends StatelessWidget {
  const _ActivityRow({
    required this.activity,
    required this.isDark,
    required this.subtleColor,
  });

  final ProfileActivity activity;
  final bool isDark;
  final Color subtleColor;

  @override
  Widget build(BuildContext context) {
    final titleColor = isDark ? Colors.white : AppColors.ink;
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.tint(activity.color, isDark ? 0.22 : 0.12),
            shape: BoxShape.circle,
          ),
          child: PoliceIcon(
            name: activity.icon,
            size: 16,
            color: AppColors.fromHex(activity.color),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                activity.title,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: titleColor,
                ),
              ),
              Text(
                activity.desc,
                style: TextStyle(fontSize: 11, color: subtleColor),
              ),
              Text(
                activity.time,
                style: TextStyle(fontSize: 10, color: subtleColor),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _SettingsRow extends StatelessWidget {
  const _SettingsRow({
    required this.setting,
    required this.isDark,
    required this.subtleColor,
    required this.onTap,
  });

  final ProfileSetting setting;
  final bool isDark;
  final Color subtleColor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final titleColor = isDark ? Colors.white : AppColors.ink;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            children: [
              Container(
                width: 32,
                height: 32,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.tint(setting.color, isDark ? 0.22 : 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: PoliceIcon(
                  name: setting.icon,
                  size: 16,
                  color: AppColors.fromHex(setting.color),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      setting.label,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: titleColor,
                      ),
                    ),
                    Text(
                      setting.desc,
                      style: TextStyle(fontSize: 11, color: subtleColor),
                    ),
                  ],
                ),
              ),
              Icon(
                LucideIcons.chevronRight,
                size: 18,
                color: subtleColor,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ThemeToggleRow extends ConsumerWidget {
  const _ThemeToggleRow({
    required this.isDark,
    required this.titleColor,
    required this.subtleColor,
  });

  final bool isDark;
  final Color titleColor;
  final Color subtleColor;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mode = ref.watch(themeProvider);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.tint('#2196F3', isDark ? 0.22 : 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              LucideIcons.moon,
              size: 16,
              color: AppColors.blue,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Mandhari',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: titleColor,
                  ),
                ),
                Text(
                  'Badilisha kati ya mwanga na giza',
                  style: TextStyle(fontSize: 11, color: subtleColor),
                ),
              ],
            ),
          ),
          _ThemeSegmentedControl(
            mode: mode,
            onChanged: (m) => ref.read(themeProvider.notifier).set(m),
            isDark: isDark,
          ),
        ],
      ),
    );
  }
}

class _ThemeSegmentedControl extends StatelessWidget {
  const _ThemeSegmentedControl({
    required this.mode,
    required this.onChanged,
    required this.isDark,
  });

  final ThemeMode mode;
  final ValueChanged<ThemeMode> onChanged;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final bg = isDark ? const Color(0xFF1A2336) : const Color(0xFFF3F4F6);
    final chipBg = isDark ? const Color(0xFF151C2B) : Colors.white;

    return Container(
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _chip('Auto', ThemeMode.system, chipBg),
          _chip('Light', ThemeMode.light, chipBg),
          _chip('Dark', ThemeMode.dark, chipBg),
        ],
      ),
    );
  }

  Widget _chip(String label, ThemeMode m, Color chipBg) {
    final active = mode == m;
    return GestureDetector(
      onTap: () => onChanged(m),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: active ? chipBg : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            color: active
                ? AppColors.blue
                : (isDark ? const Color(0xFF8A94A6) : AppColors.grayText),
          ),
        ),
      ),
    );
  }
}

