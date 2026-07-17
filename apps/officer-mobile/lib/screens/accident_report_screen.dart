import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/router/app_router.dart';
import '../core/theme/app_colors.dart';
import '../data/mock_data.dart';
import '../widgets/app_toast.dart';
import '../widgets/top_app_bar.dart';

/// Accident report form — 6 sections.
/// Mirrors `src/components/police/screens/accident-report-screen.tsx`.
class AccidentReportScreen extends ConsumerWidget {
  const AccidentReportScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF0B1018) : AppColors.grayLight;

    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: Column(
          children: [
            const TopAppBar(
              title: 'Ripoti ya Ajali',
              subtitle: 'Jaza taarifa za ajali kwa usahihi',
              showBack: true,
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Section 1: Taarifa za Msingi
                    _Section(
                      title: 'Taarifa za Msingi',
                      icon: LucideIcons.fileText,
                      isDark: isDark,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: _ReadOnlyField(
                                label: 'Tarehe ya Ajali',
                                value: '15 Mei 2026',
                                icon: LucideIcons.calendar,
                                isDark: isDark,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _ReadOnlyField(
                                label: 'Saa ya Ajali',
                                value: '08:15 AM',
                                icon: LucideIcons.clock,
                                isDark: isDark,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        _ReadOnlyField(
                          label: 'Eneo la Ajali',
                          value: 'Morogoro Road, Dar es Salaam',
                          icon: LucideIcons.mapPin,
                          isDark: isDark,
                        ),
                        const SizedBox(height: 10),
                        _TextArea(
                          label: 'Mahali Halisi (Maelezo ya Eneo)',
                          value:
                              'Kwenye makutano ya Morogoro Road na Ubungo Terminal',
                          isDark: isDark,
                          readOnly: true,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Section 2: Magari Husika
                    _Section(
                      title: 'Magari Husika',
                      icon: LucideIcons.car,
                      count: 'Jumla ya Magari: 2',
                      isDark: isDark,
                      children: [
                        ...accidentReport.vehicles.map((v) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: _AccidentVehicleCard(vehicle: v, isDark: isDark),
                            )),
                        _AddButton(
                          label: 'Ongeza Gari',
                          isDark: isDark,
                          onTap: () {},
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Section 3: Watu Husika
                    _Section(
                      title: 'Watu Husika',
                      icon: LucideIcons.users,
                      count: 'Jumla ya Watu: 2',
                      isDark: isDark,
                      children: [
                        ...accidentReport.people.map((p) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: _AccidentPersonCard(person: p, isDark: isDark),
                            )),
                        _AddButton(
                          label: 'Ongeza Mtu',
                          isDark: isDark,
                          onTap: () {},
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Section 4: Maelezo ya Ajali
                    _Section(
                      title: 'Maelezo ya Ajali',
                      icon: LucideIcons.fileText,
                      isDark: isDark,
                      children: [
                        _TextArea(
                          label: 'Eleza kwa kifupi kilichotokea',
                          value:
                              'Gari namba T123ABC lilikuwa linapita kuelekea Ubungo, na likajaribu kubadilisha njia ghafla bila tahadhari na kugongana na gari namba T789GHI lilokuwa linakuja kutoka nyuma.',
                          isDark: isDark,
                          readOnly: false,
                          maxLines: 4,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Section 5: Ushahidi
                    _Section(
                      title: 'Pakia Ushahidi (Nyaraka / Picha / Video)',
                      icon: LucideIcons.fileText,
                      isDark: isDark,
                      children: [
                        Text(
                          'Aina Zinaruhusiwa: JPG, PNG, PDF, MP4 (Max 20MB)',
                          style: TextStyle(
                            fontSize: 10,
                            color: isDark
                                ? const Color(0xFF8A94A6)
                                : AppColors.gray,
                          ),
                        ),
                        const SizedBox(height: 8),
                        ...accidentReport.evidence.map((e) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: _EvidenceRow(evidence: e, isDark: isDark),
                            )),
                        _AddButton(
                          label: 'Pakia Zaidi',
                          icon: LucideIcons.upload,
                          isDark: isDark,
                          onTap: () {},
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Section 6: Vitendo vya Ziada
                    _Section(
                      title: 'Vitendo vya Ziada',
                      icon: LucideIcons.shieldAlert,
                      isDark: isDark,
                      children: [
                        _ToggleRow(
                          label: 'Je, kulikuwa na majeruhi?',
                          isDark: isDark,
                        ),
                        const SizedBox(height: 8),
                        _ActionLinkRow(
                          icon: LucideIcons.fileText,
                          label: 'Tengeneza Fomu PF3',
                          isDark: isDark,
                          onTap: () => context.push(AppRoutes.pf3),
                        ),
                        const SizedBox(height: 8),
                        _ActionLinkRow(
                          icon: LucideIcons.send,
                          label: 'Taarifa kwa Kituo Kikuu',
                          isDark: isDark,
                          onTap: () => showAppToast(
                            context,
                            title: 'Imetumwa',
                            description: 'Taarifa imewasilishwa kwa Kituo Kikuu.',
                          ),
                        ),
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
                              side: const BorderSide(
                                color: AppColors.navy,
                                width: 2,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              foregroundColor: AppColors.navy,
                            ),
                            onPressed: () => showAppToast(
                              context,
                              title: 'Imehifadhiwa',
                              description: 'Rasimu ya ripoti ya ajali imehifadhiwa.',
                            ),
                            child: const Text(
                              'Hifadhi Rasimu',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                              ),
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
                              description: 'Ripoti ya ajali imewasilishwa kikamilifu.',
                            ),
                            child: const Text(
                              'Hifadhi na Tuma Ripoti',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                              ),
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

class _ReadOnlyField extends StatelessWidget {
  const _ReadOnlyField({
    required this.label,
    required this.value,
    required this.icon,
    required this.isDark,
  });

  final String label;
  final String value;
  final IconData icon;
  final bool isDark;

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
              Icon(icon, size: 14, color: labelColor),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  value,
                  style: TextStyle(fontSize: 12, color: valueColor),
                ),
              ),
              Icon(
                Icons.keyboard_arrow_down_rounded,
                size: 12,
                color: labelColor,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _TextArea extends StatelessWidget {
  const _TextArea({
    required this.label,
    required this.value,
    required this.isDark,
    this.readOnly = false,
    this.maxLines = 3,
  });

  final String label;
  final String value;
  final bool isDark;
  final bool readOnly;
  final int maxLines;

  @override
  Widget build(BuildContext context) {
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final fillColor = isDark ? const Color(0xFF0F1626) : const Color(0xFFF9FAFB);
    final borderColor = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final valueColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: labelColor),
        ),
        const SizedBox(height: 4),
        TextFormField(
          initialValue: value,
          readOnly: readOnly,
          maxLines: maxLines,
          style: TextStyle(
            fontSize: 12,
            height: 1.4,
            color: valueColor,
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: fillColor,
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: borderColor),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.navy, width: 1.4),
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: borderColor),
            ),
          ),
        ),
      ],
    );
  }
}

class _AccidentVehicleCard extends StatelessWidget {
  const _AccidentVehicleCard({required this.vehicle, required this.isDark});

  final AccidentVehicle vehicle;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final rowBg = isDark ? const Color(0xFF1A2336) : const Color(0xFFF9FAFB);
    final rowBorder = isDark ? const Color(0xFF2A3650) : const Color(0xFFF1F3F6);
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;
    final valueColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);
    final damageColor = vehicle.damage == 'Kubwa'
        ? AppColors.red
        : AppColors.orange;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: rowBg,
        border: Border.all(color: rowBorder),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.yellowSoft,
              border: Border.all(color: AppColors.navy),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              vehicle.plate,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: AppColors.navy,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _MiniField(
                  label: 'Aina ya Gari',
                  value: vehicle.model,
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
              Expanded(
                child: _MiniField(
                  label: 'Uharibifu',
                  value: vehicle.damage,
                  labelColor: labelColor,
                  valueColor: damageColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AccidentPersonCard extends StatelessWidget {
  const _AccidentPersonCard({required this.person, required this.isDark});

  final AccidentPerson person;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final rowBg = isDark ? const Color(0xFF1A2336) : const Color(0xFFF9FAFB);
    final rowBorder = isDark ? const Color(0xFF2A3650) : const Color(0xFFF1F3F6);
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;
    final valueColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);
    final nameColor = isDark ? Colors.white : const Color(0xFF1F2937);
    final conditionColor = person.condition == 'Hakuna Madhara'
        ? AppColors.green
        : AppColors.orange;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: rowBg,
        border: Border.all(color: rowBorder),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            person.name,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: nameColor,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: _MiniField(
                  label: 'Jukumu',
                  value: person.role,
                  labelColor: labelColor,
                  valueColor: valueColor,
                ),
              ),
              Expanded(
                child: _MiniField(
                  label: 'Namba ya Simu',
                  value: person.phone,
                  labelColor: labelColor,
                  valueColor: valueColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          _MiniField(
            label: 'Hali',
            value: person.condition,
            labelColor: labelColor,
            valueColor: conditionColor,
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

class _AddButton extends StatelessWidget {
  const _AddButton({
    required this.label,
    required this.isDark,
    required this.onTap,
    this.icon = LucideIcons.plus,
  });

  final String label;
  final bool isDark;
  final VoidCallback onTap;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            border: Border.all(
              color: AppColors.navy.withValues(alpha: 0.3),
              width: 2,
              style: BorderStyle.solid,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: AppColors.navy),
              const SizedBox(width: 6),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.navy,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _EvidenceRow extends StatelessWidget {
  const _EvidenceRow({required this.evidence, required this.isDark});

  final AccidentEvidence evidence;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final rowBg = isDark ? const Color(0xFF1A2336) : const Color(0xFFF9FAFB);
    final rowBorder = isDark ? const Color(0xFF2A3650) : const Color(0xFFF1F3F6);
    final chipBg = isDark ? const Color(0xFF151C2B) : Colors.white;
    final nameColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);
    final sizeColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;

    final iconData = evidence.type == EvidenceType.image
        ? LucideIcons.image
        : evidence.type == EvidenceType.video
            ? LucideIcons.video
            : LucideIcons.fileText;
    final iconColor = evidence.type == EvidenceType.image
        ? AppColors.blue
        : evidence.type == EvidenceType.video
            ? AppColors.purple
            : AppColors.red;

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: rowBg,
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
              color: chipBg,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(iconData, size: 16, color: iconColor),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  evidence.name,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: nameColor,
                  ),
                ),
                Text(
                  evidence.size,
                  style: TextStyle(fontSize: 10, color: sizeColor),
                ),
              ],
            ),
          ),
          const Icon(LucideIcons.fileCheck, size: 16, color: AppColors.green),
        ],
      ),
    );
  }
}

class _ToggleRow extends StatelessWidget {
  const _ToggleRow({required this.label, required this.isDark});

  final String label;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final rowBg = isDark ? const Color(0xFF1A2336) : const Color(0xFFF9FAFB);
    final labelColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: rowBg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: labelColor,
            ),
          ),
          _ToggleSwitch(value: true, isDark: isDark),
        ],
      ),
    );
  }
}

class _ToggleSwitch extends StatelessWidget {
  const _ToggleSwitch({required this.value, required this.isDark});

  final bool value;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 44,
      height: 24,
      decoration: BoxDecoration(
        color: value ? AppColors.green : AppColors.gray,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Stack(
        children: [
          AnimatedPositioned(
            duration: const Duration(milliseconds: 150),
            left: value ? 22 : 2,
            top: 2,
            child: Container(
              width: 20,
              height: 20,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionLinkRow extends StatelessWidget {
  const _ActionLinkRow({
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
    final chevColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            border: Border.all(color: borderColor),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, size: 16, color: labelColor),
                  const SizedBox(width: 8),
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
              Icon(LucideIcons.chevronRight, size: 16, color: chevColor),
            ],
          ),
        ),
      ),
    );
  }
}

