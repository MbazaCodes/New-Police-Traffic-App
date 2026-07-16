import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/theme/app_colors.dart';
import '../data/mock_data.dart';
import '../widgets/app_toast.dart';
import '../widgets/top_app_bar.dart';

/// PF3 form screen — 7 sections (A. Mamlaka, B. Maelezo ya Ajali,
/// C. Magari Husika, D. Waharibika, E. Mashahidi, F. Ramani, G. Uthibitisho).
/// Mirrors `src/components/police/screens/pf3-screen.tsx`.
class Pf3Screen extends ConsumerWidget {
  const Pf3Screen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF0B1018) : AppColors.grayLight;
    final f = pf3Form;

    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: Column(
          children: [
            const TopAppBar(
              title: 'Fomu PF3',
              subtitle: 'Ripoti Rasmi ya Ajali ya Trafiki',
              showBack: true,
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Official form banner
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [AppColors.navyDark, AppColors.navy],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x331A237E),
                            blurRadius: 16,
                            offset: Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'JESHI LA POLISI TANZANIA',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w500,
                                    letterSpacing: 1,
                                    color: Colors.white.withValues(alpha: 0.7),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                const Text(
                                  'FORM PF3',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.white,
                                  ),
                                ),
                                Text(
                                  'Traffic Accident Report Form',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: Colors.white.withValues(alpha: 0.8),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  'NAMBA YA KUMBUKUMBU',
                                  style: TextStyle(
                                    fontSize: 9,
                                    letterSpacing: 0.6,
                                    color: Colors.white.withValues(alpha: 0.6),
                                  ),
                                ),
                                Text(
                                  f.referenceNo,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Quick actions: PDF / Print
                    Row(
                      children: [
                        Expanded(
                          child: _QuickAction(
                            icon: LucideIcons.download,
                            label: 'Pakua PDF',
                            isDark: isDark,
                            onTap: () => showAppToast(
                              context,
                              title: 'Inapakua',
                              description: 'Fomu PF3 inapakuliwa kama PDF.',
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _QuickAction(
                            icon: LucideIcons.printer,
                            label: 'Chapisha',
                            isDark: isDark,
                            onTap: () => showAppToast(
                              context,
                              title: 'Inapakua',
                              description: 'Fomu PF3 inapakuliwa kama PDF.',
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Section A: Mamlaka
                    _Section(
                      title: 'A. Taarifa za Mamlaka',
                      icon: LucideIcons.building2,
                      isDark: isDark,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: _Field(label: 'Mkoa', value: f.region, isDark: isDark),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _Field(label: 'Wilaya', value: f.district, isDark: isDark),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        _Field(label: 'Kituo', value: f.station, isDark: isDark),
                        const SizedBox(height: 10),
                        _Field(label: 'Afisa Anayeripoti', value: officer.name, isDark: isDark),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Section B: Maelezo ya Ajali
                    _Section(
                      title: 'B. Maelezo ya Ajali',
                      icon: LucideIcons.fileText,
                      isDark: isDark,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: _Field(label: 'Aina ya Ajali', value: f.accidentType, isDark: isDark),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _Field(
                                label: 'Mkuliko',
                                value: f.severity,
                                icon: LucideIcons.shieldCheck,
                                isDark: isDark,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: _Field(
                                label: 'Tarehe',
                                value: '15 Mei 2026',
                                icon: LucideIcons.calendar,
                                isDark: isDark,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _Field(
                                label: 'Saa',
                                value: '08:15 AM',
                                icon: LucideIcons.clock,
                                isDark: isDark,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        _Field(
                          label: 'Eneo',
                          value: 'Morogoro Road, Dar es Salaam',
                          icon: LucideIcons.mapPin,
                          isDark: isDark,
                        ),
                        const SizedBox(height: 10),
                        _Field(
                          label: 'Mahali Halisi',
                          value: 'Makutano ya Morogoro Road na Ubungo Terminal',
                          isDark: isDark,
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: _ConditionChip(
                                icon: LucideIcons.cloudSun,
                                label: 'Hali ya Hewa',
                                value: f.weather,
                                isDark: isDark,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _ConditionChip(
                                icon: LucideIcons.mapPin,
                                label: 'Uso wa Barabara',
                                value: f.roadSurface,
                                isDark: isDark,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _ConditionChip(
                                icon: LucideIcons.sun,
                                label: 'Mwanga',
                                value: f.lightCondition,
                                isDark: isDark,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Section C: Magari Husika
                    _Section(
                      title: 'C. Magari Husika',
                      icon: LucideIcons.car,
                      count: 'Jumla: ${f.vehicles.length}',
                      isDark: isDark,
                      children: [
                        ...f.vehicles.asMap().entries.map((entry) {
                          final i = entry.key;
                          final v = entry.value;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: _Pf3VehicleCard(
                              vehicle: v,
                              index: i + 1,
                              isDark: isDark,
                            ),
                          );
                        }),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Section D: Waharibika / Majeruhi
                    _Section(
                      title: 'D. Waharibika / Majeruhi',
                      icon: LucideIcons.users,
                      count: 'Jumla: ${f.casualties.length}',
                      isDark: isDark,
                      children: [
                        ...f.casualties.map((c) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: _CasualtyCard(casualty: c, isDark: isDark),
                            )),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Section E: Mashahidi
                    _Section(
                      title: 'E. Mashahidi',
                      icon: LucideIcons.eye,
                      count: 'Jumla: ${f.witnesses.length}',
                      isDark: isDark,
                      children: [
                        ...f.witnesses.map((w) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: _WitnessCard(witness: w, isDark: isDark),
                            )),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Section F: Ramani
                    _Section(
                      title: 'F. Ramani ya Ajali',
                      icon: LucideIcons.mapPin,
                      isDark: isDark,
                      children: [
                        _SketchBox(isDark: isDark),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Section G: Uthibitisho wa Afisa
                    _Section(
                      title: 'G. Uthibitisho wa Afisa',
                      icon: LucideIcons.shieldCheck,
                      isDark: isDark,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: _Field(label: 'Jina la Afisa', value: officer.name, isDark: isDark),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _Field(
                                label: 'Namba ya Utambulisho',
                                value: officer.id,
                                icon: LucideIcons.hash,
                                isDark: isDark,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: _Field(label: 'Cheo', value: officer.rank, isDark: isDark),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _Field(label: 'Kituo', value: officer.station, isDark: isDark),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        _SignatureBox(isDark: isDark),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Submit buttons
                    Row(
                      children: [
                        Expanded(
                          flex: 1,
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              side: const BorderSide(color: AppColors.navy, width: 2),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              foregroundColor: AppColors.navy,
                            ),
                            onPressed: () => showAppToast(
                              context,
                              title: 'Imehifadhiwa',
                              description: 'Rasimu ya Fomu PF3 imehifadhiwa.',
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Icon(LucideIcons.save, size: 16),
                                SizedBox(width: 4),
                                Text(
                                  'Hifadhi Rasimu',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          flex: 2,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              backgroundColor: AppColors.navy,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            onPressed: () => showAppToast(
                              context,
                              title: 'Imetumwa',
                              description: 'Fomu PF3 imewasilishwa kwa Kituo Kikuu.',
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Icon(LucideIcons.send, size: 16),
                                SizedBox(width: 6),
                                Text(
                                  'Wasilisha PF3',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
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

class _QuickAction extends StatelessWidget {
  const _QuickAction({
    required this.icon,
    required this.label,
    required this.isDark,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool isDark;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final borderColor = AppColors.navy.withValues(alpha: 0.2);
    final labelColor = isDark ? Colors.white : AppColors.navy;
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;

    return Material(
      color: cardColor,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            border: Border.all(color: borderColor),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 15, color: labelColor),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
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

class _Section extends StatelessWidget {
  const _Section({
    required this.title,
    required this.icon,
    required this.isDark,
    required this.children,
    this.count,
  });

  final String title;
  final IconData icon;
  final bool isDark;
  final List<Widget> children;
  final String? count;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final titleColor = isDark ? Colors.white : AppColors.navy;
    final countColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;

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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, size: 16, color: titleColor),
                  const SizedBox(width: 8),
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: titleColor,
                    ),
                  ),
                ],
              ),
              if (count != null)
                Text(
                  count!,
                  style: TextStyle(fontSize: 11, color: countColor),
                ),
            ],
          ),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }
}

class _Field extends StatelessWidget {
  const _Field({
    required this.label,
    required this.value,
    required this.isDark,
    this.icon,
  });

  final String label;
  final String value;
  final bool isDark;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final valueColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);
    final fillColor = isDark ? const Color(0xFF0F1626) : const Color(0xFFF9FAFB);
    final borderColor = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: labelColor),
        ),
        const SizedBox(height: 4),
        Container(
          height: 40,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: fillColor,
            border: Border.all(color: borderColor),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              if (icon != null) ...[
                Icon(icon, size: 14, color: labelColor),
                const SizedBox(width: 8),
              ],
              Expanded(
                child: Text(
                  value,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: valueColor,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ConditionChip extends StatelessWidget {
  const _ConditionChip({
    required this.icon,
    required this.label,
    required this.value,
    required this.isDark,
  });

  final IconData icon;
  final String label;
  final String value;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final chipBg = isDark ? const Color(0xFF0F1626) : const Color(0xFFF9FAFB);
    final iconColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;
    final valueColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: chipBg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(icon, size: 14, color: iconColor),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(fontSize: 9, color: labelColor),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: valueColor,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _Pf3VehicleCard extends StatelessWidget {
  const _Pf3VehicleCard({
    required this.vehicle,
    required this.index,
    required this.isDark,
  });

  final Pf3Vehicle vehicle;
  final int index;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final cardBg = isDark ? const Color(0xFF1A2336) : const Color(0xFFF9FAFB);
    final cardBorder = isDark ? const Color(0xFF2A3650) : const Color(0xFFF1F3F6);
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;
    final valueColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);
    final indexColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cardBg,
        border: Border.all(color: cardBorder),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.yellowSoft,
                  border: Border.all(color: AppColors.navy, width: 2),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  vehicle.plate,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1,
                    color: AppColors.navy,
                  ),
                ),
              ),
              Text(
                'Gari $index',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: indexColor),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _MiniField(
                  label: 'Aina',
                  value: '${vehicle.make} (${vehicle.year})',
                  labelColor: labelColor,
                  valueColor: valueColor,
                ),
              ),
              Expanded(
                child: _MiniField(
                  label: 'Rangi',
                  value: vehicle.color,
                  labelColor: labelColor,
                  valueColor: valueColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: _MiniField(
                  label: 'Dereva',
                  value: vehicle.driver,
                  labelColor: labelColor,
                  valueColor: valueColor,
                ),
              ),
              Expanded(
                child: _MiniField(
                  label: 'Leseni',
                  value: vehicle.license,
                  labelColor: labelColor,
                  valueColor: valueColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: _MiniField(
                  label: 'Mwelekeo',
                  value: vehicle.direction,
                  labelColor: labelColor,
                  valueColor: valueColor,
                ),
              ),
              Expanded(
                child: _MiniField(
                  label: 'Uharibifu',
                  value: vehicle.damage,
                  labelColor: labelColor,
                  valueColor: valueColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: vehicle.insured ? AppColors.greenSoft : AppColors.redSoft,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              vehicle.insured ? 'Bima: Inapatikana' : 'Bima: Haiapatikani',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: vehicle.insured ? AppColors.green : AppColors.red,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniField extends StatelessWidget {
  const _MiniField({
    required this.label,
    required this.value,
    required this.labelColor,
    required this.valueColor,
  });

  final String label;
  final String value;
  final Color labelColor;
  final Color valueColor;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 9, color: labelColor),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: valueColor,
          ),
        ),
      ],
    );
  }
}

class _CasualtyCard extends StatelessWidget {
  const _CasualtyCard({required this.casualty, required this.isDark});

  final Pf3Casualty casualty;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final rowBorder = isDark ? const Color(0xFF2A3650) : const Color(0xFFF1F3F6);
    final nameColor = isDark ? Colors.white : const Color(0xFF1F2937);
    final subtleColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final fadedColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        border: Border.all(color: rowBorder),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.orangeSoft,
              shape: BoxShape.circle,
            ),
            child: const Icon(LucideIcons.users, size: 16, color: AppColors.orange),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  casualty.name,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: nameColor,
                  ),
                ),
                Text(
                  '${casualty.type} • ${casualty.injury}',
                  style: TextStyle(fontSize: 11, color: subtleColor),
                ),
                Text(
                  'Hospitali: ${casualty.hospital} • Hali: ${casualty.status}',
                  style: TextStyle(fontSize: 10, color: fadedColor),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _WitnessCard extends StatelessWidget {
  const _WitnessCard({required this.witness, required this.isDark});

  final Pf3Witness witness;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final cardBg = isDark ? const Color(0xFF1A2336) : const Color(0xFFF9FAFB);
    final cardBorder = isDark ? const Color(0xFF2A3650) : const Color(0xFFF1F3F6);
    final nameColor = isDark ? Colors.white : const Color(0xFF1F2937);
    final phoneColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;
    final statementColor = isDark ? const Color(0xFFB4BCC9) : const Color(0xFF6B7280);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cardBg,
        border: Border.all(color: cardBorder),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                witness.name,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: nameColor,
                ),
              ),
              Text(
                witness.phone,
                style: TextStyle(fontSize: 10, color: phoneColor),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            '"${witness.statement}"',
            style: TextStyle(
              fontSize: 11,
              fontStyle: FontStyle.italic,
              height: 1.4,
              color: statementColor,
            ),
          ),
        ],
      ),
    );
  }
}

class _SketchBox extends StatelessWidget {
  const _SketchBox({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final boxBg = isDark ? const Color(0xFF0F1626) : const Color(0xFFF9FAFB);
    final boxBorder = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final placeholderColor = isDark ? const Color(0xFF6B7689) : AppColors.gray;
    final fadedColor = isDark ? const Color(0xFF4A5366) : const Color(0xFFD1D5DB);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: boxBg,
        border: Border.all(
          color: boxBorder,
          width: 2,
          style: BorderStyle.solid,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(LucideIcons.mapPin, size: 28, color: fadedColor),
          const SizedBox(height: 4),
          Text(
            'Sketch ya eneo la ajali',
            style: TextStyle(fontSize: 11, color: placeholderColor),
          ),
          const SizedBox(height: 2),
          Text(
            'Bonyeza kuongeza ramani',
            style: TextStyle(fontSize: 9, color: fadedColor),
          ),
        ],
      ),
    );
  }
}

class _SignatureBox extends StatelessWidget {
  const _SignatureBox({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final boxBg = isDark ? const Color(0xFF0F1626) : const Color(0xFFF9FAFB);
    final boxBorder = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final dashedBorder = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: boxBg,
        border: Border.all(color: boxBorder),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Saini ya Afisa',
            style: TextStyle(fontSize: 10, color: labelColor),
          ),
          const SizedBox(height: 16),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              'J. Mwinyi',
              style: TextStyle(
                fontSize: 18,
                fontStyle: FontStyle.italic,
                fontFamily: 'serif',
                color: AppColors.navy,
              ),
            ),
          ),
          const SizedBox(height: 4),
          Container(
            decoration: BoxDecoration(
              border: Border(
                top: BorderSide(
                  color: dashedBorder,
                  width: 1,
                  style: BorderStyle.solid,
                ),
              ),
            ),
            padding: const EdgeInsets.only(top: 4),
            child: Center(
              child: Text(
                'Saini halali ya Afisa wa Polisi',
                style: TextStyle(fontSize: 9, color: labelColor),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

