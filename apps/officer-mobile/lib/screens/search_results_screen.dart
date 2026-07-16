import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/router/app_router.dart';
import '../core/theme/app_colors.dart';
import '../data/mock_data.dart';
import '../widgets/app_toast.dart';

/// Search results screen — plate header, alert, risk score, action buttons,
/// insurance / driver / vehicle / payment / violations sections.
/// Mirrors `src/components/police/screens/search-results-screen.tsx`.
class SearchResultsScreen extends ConsumerWidget {
  const SearchResultsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    const r = searchResult;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0B1018) : AppColors.grayLight,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context, isDark),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _PlateHeader(plate: r.plate, date: r.date, status: r.status, isDark: isDark),
                    const SizedBox(height: 12),
                    _AlertBox(message: r.alertMessage, isDark: isDark),
                    const SizedBox(height: 12),
                    _RiskScoreCard(
                      score: r.riskScore,
                      level: r.riskLevel,
                      isDark: isDark,
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _ActionButton(
                            icon: LucideIcons.fileText,
                            label: 'Ongeza Citation',
                            color: AppColors.blueLink,
                            isDark: isDark,
                            onTap: () => context.push(AppRoutes.citation),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _ActionButton(
                            icon: LucideIcons.megaphone,
                            label: 'Ongeza Onyo',
                            color: AppColors.orange,
                            isDark: isDark,
                            onTap: () => showAppToast(
                              context,
                              title: 'Onyo Limetolewa',
                              description: 'Onyo limewasilishwa kwa dereva.',
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _ActionButton(
                            icon: LucideIcons.hand,
                            label: 'Arrest',
                            color: AppColors.red,
                            isDark: isDark,
                            onTap: () => showAppToast(
                              context,
                              title: 'Kizuizi Kimewekwa',
                              description: 'Mchakato wa kizuizi umeanzishwa.',
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _SectionCard(
                      title: 'INSURANCE COVER AND STATUS',
                      icon: LucideIcons.shieldCheck,
                      isDark: isDark,
                      children: [
                        _Row(label: 'Bima', value: r.insurance.company, isDark: isDark),
                        _Row(label: 'Polisi Na.', value: r.insurance.policy, isDark: isDark),
                        _Row(label: 'Inamalizika', value: r.insurance.expires, isDark: isDark),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.greenSoft,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(LucideIcons.checkCircle2, size: 12, color: AppColors.green),
                              SizedBox(width: 4),
                              Text(
                                'VALID',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.green,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _SectionCard(
                      title: 'DRIVER INFORMATION',
                      icon: LucideIcons.user,
                      isDark: isDark,
                      children: [
                        _Row(label: 'Name', value: r.driver.name, isDark: isDark),
                        _Row(label: 'Gender', value: r.driver.gender, isDark: isDark),
                        _Row(label: 'Drive Licence Number', value: r.driver.license, isDark: isDark),
                        _Row(label: 'Driver Licence Class', value: r.driver.licenseClass, isDark: isDark),
                        _Row(label: 'NIDA NUMBER', value: r.driver.nida, isDark: isDark),
                        _Row(label: 'Mobile Number', value: r.driver.mobile, isDark: isDark),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _SectionCard(
                      title: 'VEHICLE INFORMATION',
                      icon: LucideIcons.car,
                      isDark: isDark,
                      children: [
                        _Row(label: 'Model', value: r.vehicle.model, isDark: isDark),
                        _Row(label: 'Type', value: r.vehicle.type, isDark: isDark),
                        _Row(label: 'Year', value: r.vehicle.year, isDark: isDark),
                        _Row(label: 'Color', value: r.vehicle.color, isDark: isDark),
                        _Row(
                          label: 'Accident Involve',
                          value: r.vehicle.accidentInvolved ? 'Ndiyo' : 'Hapana',
                          valueColor: r.vehicle.accidentInvolved ? AppColors.red : null,
                          isDark: isDark,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _SectionCard(
                      title: 'PAYMENT AND BILLS STATUS',
                      icon: LucideIcons.wallet,
                      isDark: isDark,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Has Outstanding',
                              style: TextStyle(
                                fontSize: 13,
                                color: isDark
                                    ? const Color(0xFFB4BCC9)
                                    : const Color(0xFF6B7280),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.orangeSoft,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Text(
                                'Has Outstanding',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.orange,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        _Row(
                          label: 'Jumla ya Makosa',
                          value: r.payment.totalViolations.toString(),
                          isDark: isDark,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _ViolationsCard(violations: r.violations, isDark: isDark),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, bool isDark) {
    final titleColor = isDark ? Colors.white : AppColors.navy;
    final iconColor = isDark ? const Color(0xFFB4BCC9) : const Color(0xFF6B7280);
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F1626) : Colors.white,
        border: Border(
          bottom: BorderSide(
            color: isDark ? const Color(0xFF2A3650) : const Color(0xFFF1F3F6),
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              IconButton(
                icon: const Icon(LucideIcons.chevronLeft, size: 26),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                color: iconColor,
                onPressed: () => context.pop(),
              ),
              const SizedBox(width: 4),
              Text(
                'Matokéo ya Utafutaji',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: titleColor,
                ),
              ),
            ],
          ),
          Icon(LucideIcons.share2, size: 20, color: iconColor),
        ],
      ),
    );
  }
}

class _PlateHeader extends StatelessWidget {
  const _PlateHeader({
    required this.plate,
    required this.date,
    required this.status,
    required this.isDark,
  });

  final String plate;
  final String date;
  final String status;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final subtleColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;

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
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.yellowSoft,
                  border: Border.all(color: AppColors.navy, width: 2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  plate,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1,
                    color: AppColors.navy,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Tarehe: $date',
                style: TextStyle(fontSize: 11, color: subtleColor),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.greenSoft,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              children: [
                Icon(LucideIcons.checkCircle2, size: 14, color: AppColors.green),
                SizedBox(width: 4),
                Text(
                  'Imepatikana',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.green,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AlertBox extends StatelessWidget {
  const _AlertBox({required this.message, required this.isDark});

  final String message;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.red.withValues(alpha: 0.10) : AppColors.redSoft,
        border: Border.all(color: AppColors.red.withValues(alpha: 0.4)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.red.withValues(alpha: 0.18),
              shape: BoxShape.circle,
            ),
            child: const Icon(LucideIcons.alertTriangle, size: 20, color: AppColors.red),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text(
                      'ALERT',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: AppColors.red,
                        letterSpacing: 0.6,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.red,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'TAHADHARI',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  message,
                  style: TextStyle(
                    fontSize: 12,
                    height: 1.4,
                    color: isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RiskScoreCard extends StatelessWidget {
  const _RiskScoreCard({required this.score, required this.level, required this.isDark});

  final int score;
  final String level;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final subtleColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;

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
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Recent Violation Score',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: subtleColor,
                ),
              ),
              Text(
                'Driver : Scored $score% points',
                style: TextStyle(fontSize: 13, color: subtleColor),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: LinearProgressIndicator(
              value: score / 100,
              minHeight: 10,
              backgroundColor: isDark ? const Color(0xFF1A2336) : const Color(0xFFE5E7EB),
              valueColor: const AlwaysStoppedAnimation<Color>(
                Color(0xFFEF4444),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(
                'Kiwango cha hatari : ',
                style: TextStyle(fontSize: 12, color: subtleColor),
              ),
              Text(
                level,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: AppColors.red,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.isDark,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final bool isDark;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final labelColor = isDark ? const Color(0xFFB4BCC9) : const Color(0xFF4B5563);

    return Material(
      color: cardColor,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border(
              top: BorderSide(color: color, width: 3),
            ),
          ),
          child: Column(
            children: [
              Icon(icon, size: 18, color: color),
              const SizedBox(height: 6),
              Text(
                label,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: labelColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.title,
    required this.icon,
    required this.isDark,
    required this.children,
  });

  final String title;
  final IconData icon;
  final bool isDark;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final titleColor = isDark ? Colors.white : AppColors.navy;
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
            children: [
              Icon(icon, size: 18, color: titleColor),
              const SizedBox(width: 8),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: borderColor, width: 1),
                    ),
                  ),
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.6,
                      color: titleColor,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ...children,
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({
    required this.label,
    required this.value,
    required this.isDark,
    this.valueColor,
  });

  final String label;
  final String value;
  final bool isDark;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final vColor = valueColor ??
        (isDark ? const Color(0xFFE6EAF2) : const Color(0xFF1F2937));
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Flexible(
            child: Text(
              label,
              style: TextStyle(fontSize: 12, color: labelColor),
            ),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: vColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ViolationsCard extends StatelessWidget {
  const _ViolationsCard({required this.violations, required this.isDark});

  final List<SearchViolation> violations;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final titleColor = isDark ? Colors.white : AppColors.navy;
    final subtleColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final fineColor = isDark ? Colors.white : const Color(0xFF1F2937);
    final rowBg = isDark ? const Color(0xFF1A2336) : const Color(0xFFF9FAFB);
    final rowBorder = isDark ? const Color(0xFF2A3650) : const Color(0xFFF1F3F6);

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
            children: [
              Icon(LucideIcons.creditCard, size: 18, color: titleColor),
              const SizedBox(width: 8),
              Text(
                'VIOLATIONS',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.6,
                  color: titleColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...violations.map((v) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: rowBg,
                    border: Border.all(color: rowBorder),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${v.id}. ${v.name}',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: fineColor,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Tarehe: ${v.date} • Eneo: ${v.area}',
                              style: TextStyle(fontSize: 11, color: subtleColor),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            v.fine,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: fineColor,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.red.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'HAJALIPWA',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: AppColors.red,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              )),
        ],
      ),
    );
  }
}

