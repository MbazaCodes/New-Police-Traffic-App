import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/theme/app_colors.dart';
import '../data/mock_data.dart';
import '../widgets/app_toast.dart';
import '../widgets/stat_card.dart';
import '../widgets/top_app_bar.dart';

/// Patrol screen — hero gradient card, 3 patrol stats, patrol report form.
/// Mirrors `src/components/police/screens/patrol-screen.tsx`.
class PatrolScreen extends ConsumerWidget {
  const PatrolScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF0B1018) : AppColors.grayLight;
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;

    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: Column(
          children: [
            const TopAppBar(
              title: 'Patroli',
              subtitle: 'Fanya doria, rekodi na ripoti matukio',
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _PatrolHero(
                      isDark: isDark,
                      onStart: () => showAppToast(
                        context,
                        title: 'Patroli Imeanza',
                        description: 'Kurekodi patroli yako imeanza.',
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: List.generate(patrolStats.length, (i) {
                        final s = patrolStats[i];
                        return Expanded(
                          child: Padding(
                            padding: EdgeInsets.only(
                              right: i == patrolStats.length - 1 ? 0 : 8,
                            ),
                            child: StatCard(
                              icon: s.icon,
                              iconColor: s.color,
                              value: s.value,
                              label: s.label,
                              iconSize: 18,
                              valueSize: 20,
                              labelSize: 10,
                            ),
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 16),
                    _PatrolReportForm(
                      isDark: isDark,
                      cardColor: cardColor,
                      onSave: () => showAppToast(
                        context,
                        title: 'Imehifadhiwa',
                        description: 'Ripoti ya patroli imehifadhiwa kikamilifu.',
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

class _PatrolHero extends StatelessWidget {
  const _PatrolHero({required this.isDark, required this.onStart});

  final bool isDark;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.blue, AppColors.blueDark],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
            color: Color(0x332196F3),
            blurRadius: 16,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: 0,
            top: 0,
            child: SizedBox(
              width: 96,
              height: 96,
              child: CustomPaint(
                size: const Size(100, 100),
                painter: _PathPainter(),
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(
                width: 220,
                child: Text(
                  'Anza kurekodi patroli yako mpya',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    height: 1.25,
                  ),
                ),
              ),
              const SizedBox(height: 6),
              const SizedBox(
                width: 240,
                child: Text(
                  'Bonyeza kitufe hapa chini kuanza doria yako na kurekodi shughuli.',
                  style: TextStyle(
                    fontSize: 12,
                    height: 1.4,
                    color: Color(0xCCFFFFFF),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Material(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                child: InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: onStart,
                  child: const Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 10,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          LucideIcons.play,
                          size: 16,
                          color: AppColors.blueDark,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Anza Patroli',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.blueDark,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PathPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final dashPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    final path = Path()
      ..moveTo(10, 80)
      ..quadraticBezierTo(30, 20, 50, 50)
      ..quadraticBezierTo(70, 80, 90, 30);
    // Dashed
    final metrics = path.computeMetrics();
    for (final m in metrics) {
      double dist = 0;
      while (dist < m.length) {
        final next = (dist + 4).clamp(0.0, m.length);
        canvas.drawPath(m.extractPath(dist, next), dashPaint);
        dist += 8;
      }
    }
    canvas.drawCircle(const Offset(10, 80), 4, Paint()..color = AppColors.green);
    canvas.drawCircle(const Offset(50, 50), 4, Paint()..color = Colors.white);
    canvas.drawCircle(const Offset(90, 30), 4, Paint()..color = AppColors.orange);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _PatrolReportForm extends StatelessWidget {
  const _PatrolReportForm({
    required this.isDark,
    required this.cardColor,
    required this.onSave,
  });

  final bool isDark;
  final Color cardColor;
  final VoidCallback onSave;

  @override
  Widget build(BuildContext context) {
    final titleColor = isDark ? Colors.white : AppColors.navy;
    final subtleColor =
        isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final fieldBorder =
        isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final fieldBg =
        isDark ? const Color(0xFF0F1626) : const Color(0xFFF9FAFB);
    final labelColor =
        isDark ? const Color(0xFFB4BCC9) : const Color(0xFF6B7280);

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
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Patrol Report',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Jaza taarifa za patroli yako ya leo',
            style: TextStyle(fontSize: 11, color: subtleColor),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _PatrolField(
                  label: 'Tarehe',
                  icon: LucideIcons.calendar,
                  value: '15 Mei 2026',
                  isDark: isDark,
                  fieldBg: fieldBg,
                  fieldBorder: fieldBorder,
                  labelColor: labelColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _PatrolField(
                  label: 'Kuanza Saa',
                  icon: LucideIcons.clock,
                  value: '07:30',
                  isDark: isDark,
                  fieldBg: fieldBg,
                  fieldBorder: fieldBorder,
                  labelColor: labelColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _PatrolField(
            label: 'Maliza Saa',
            icon: LucideIcons.clock,
            value: '08:15',
            isDark: isDark,
            fieldBg: fieldBg,
            fieldBorder: fieldBorder,
            labelColor: labelColor,
          ),
          const SizedBox(height: 12),
          _PatrolField(
            label: 'Eneo / Kanda',
            icon: LucideIcons.mapPin,
            value: 'Chagua eneo / kanda',
            isDark: isDark,
            fieldBg: fieldBg,
            fieldBorder: fieldBorder,
            labelColor: labelColor,
            placeholder: true,
          ),
          const SizedBox(height: 12),
          _PatrolField(
            label: 'Lengo la Patroli',
            icon: LucideIcons.target,
            value: 'Chagua lengo la patroli',
            isDark: isDark,
            fieldBg: fieldBg,
            fieldBorder: fieldBorder,
            labelColor: labelColor,
            placeholder: true,
          ),
          const SizedBox(height: 12),
          _buildTextArea(
            label: 'Maelezo ya Patroli',
            placeholder: 'Eleza kwa kifupi shughuli uliozifanya...',
            isDark: isDark,
            fieldBg: fieldBg,
            fieldBorder: fieldBorder,
            labelColor: labelColor,
          ),
          const SizedBox(height: 12),
          _buildTextArea(
            label: 'Matukio Yaliyobainika',
            placeholder: 'Eleza matukio yoyote yaliyobainika...',
            isDark: isDark,
            fieldBg: fieldBg,
            fieldBorder: fieldBorder,
            labelColor: labelColor,
          ),
          const SizedBox(height: 12),
          // Photo upload
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Picha (Hiari)',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: labelColor,
                ),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(vertical: 20),
                decoration: BoxDecoration(
                  color: fieldBg,
                  border: Border.all(
                    color: fieldBorder,
                    style: BorderStyle.solid,
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    const Icon(LucideIcons.cloud, size: 24, color: AppColors.blue),
                    const SizedBox(height: 6),
                    Text(
                      'Ongeza picha',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: subtleColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Save button
          Material(
            color: AppColors.blue,
            borderRadius: BorderRadius.circular(12),
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: onSave,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 14),
                child: const Center(
                  child: Text(
                    'Hifadhi Report',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextArea({
    required String label,
    required String placeholder,
    required bool isDark,
    required Color fieldBg,
    required Color fieldBorder,
    required Color labelColor,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: labelColor,
          ),
        ),
        const SizedBox(height: 4),
        TextFormField(
          maxLines: 3,
          decoration: InputDecoration(
            hintText: placeholder,
            filled: true,
            fillColor: fieldBg,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 10,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: fieldBorder),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: fieldBorder),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.blue, width: 1.4),
            ),
          ),
        ),
      ],
    );
  }
}

class _PatrolField extends StatelessWidget {
  const _PatrolField({
    required this.label,
    required this.icon,
    required this.value,
    required this.isDark,
    required this.fieldBg,
    required this.fieldBorder,
    required this.labelColor,
    this.placeholder = false,
  });

  final String label;
  final IconData icon;
  final String value;
  final bool isDark;
  final Color fieldBg;
  final Color fieldBorder;
  final Color labelColor;
  final bool placeholder;

  @override
  Widget build(BuildContext context) {
    final valueColor = placeholder
        ? (isDark ? const Color(0xFF6B7689) : AppColors.gray)
        : (isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: labelColor,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          height: 44,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: fieldBg,
            border: Border.all(color: fieldBorder),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(icon, size: 16, color: labelColor),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  value,
                  style: TextStyle(fontSize: 13, color: valueColor),
                ),
              ),
              Icon(
                Icons.keyboard_arrow_down_rounded,
                size: 14,
                color: labelColor,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

