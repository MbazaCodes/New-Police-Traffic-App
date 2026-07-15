import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../core/theme/app_colors.dart';
import '../data/mock_data.dart';
import '../widgets/app_toast.dart';
import '../widgets/top_app_bar.dart';

/// Vehicle inspection screen — vehicle info + 6 checklist sections + submit.
/// Mirrors `src/components/police/screens/vehicle-inspection-screen.tsx`.
class VehicleInspectionScreen extends ConsumerWidget {
  const VehicleInspectionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF0B1018) : AppColors.grayLight;
    final v = vehicleInspection;

    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: Column(
          children: [
            const TopAppBar(
              title: 'Ukaguzi wa Gari',
              subtitle: 'Jaza taarifa za ukaguzi wa halia ya gari',
              showBack: true,
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Vehicle info header
                    _VehicleInfoCard(v: v, isDark: isDark),
                    const SizedBox(height: 12),
                    // Section 1: Documents
                    _ChecklistSection(
                      title: '1. Hati na Vibali',
                      items: v.documents,
                      isDark: isDark,
                    ),
                    const SizedBox(height: 12),
                    // Section 2: Mechanical
                    _ChecklistSection(
                      title: '2. Halia ya Gari (Mechanical Condition)',
                      items: v.mechanical,
                      isDark: isDark,
                    ),
                    const SizedBox(height: 12),
                    _NotesCard(isDark: isDark),
                    const SizedBox(height: 12),
                    // Section 3: Load
                    _LoadSection(isDark: isDark),
                    const SizedBox(height: 12),
                    // Section 4: Photos
                    _PhotosSection(photos: v.photos, isDark: isDark),
                    const SizedBox(height: 12),
                    // Section 5: Results
                    _ResultsSection(isDark: isDark),
                    const SizedBox(height: 12),
                    // Section 6: Signature
                    _SignatureSection(isDark: isDark),
                    const SizedBox(height: 12),
                    // Submit
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.navy,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () {
                        showAppToast(
                          context,
                          title: 'Ukaguzi Umekamilika',
                          description: 'Ripoti ya ukaguzi wa gari imehifadhiwa.',
                        );
                        Future.delayed(const Duration(milliseconds: 800), () {
                          if (context.mounted) context.pop();
                        });
                      },
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(LucideIcons.checkCircle2, size: 20, color: Colors.white),
                          SizedBox(width: 8),
                          Text(
                            'Hifadhi na Kamaliza Ukaguzi',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
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

class _VehicleInfoCard extends StatelessWidget {
  const _VehicleInfoCard({required this.v, required this.isDark});

  final VehicleInspection v;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final subtleColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final valueColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.yellowSoft,
                      border: Border.all(color: AppColors.navy, width: 2),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      v.plate,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1,
                        color: AppColors.navy,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${v.model} | ${v.color}',
                    style: TextStyle(fontSize: 13, color: subtleColor),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.blue),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Icon(LucideIcons.pencil, size: 12, color: AppColors.blue),
                    SizedBox(width: 4),
                    Text(
                      'Hariri',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.blue,
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
            child: Row(
              children: [
                Expanded(
                  child: _InfoRow(
                    label: 'Mwenye Gari',
                    value: v.owner,
                    labelColor: subtleColor,
                    valueColor: valueColor,
                  ),
                ),
                Expanded(
                  child: _InfoRow(
                    label: 'Namba ya Simu',
                    value: v.phone,
                    labelColor: subtleColor,
                    valueColor: valueColor,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _InfoRow(
                  label: 'Eneo la Ukaguzi',
                  value: v.location,
                  labelColor: subtleColor,
                  valueColor: valueColor,
                ),
              ),
              Expanded(
                child: _InfoRow(
                  label: 'Tarehe & Saa',
                  value: v.datetime,
                  labelColor: subtleColor,
                  valueColor: valueColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
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
          style: TextStyle(fontSize: 10, color: labelColor),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: valueColor,
          ),
        ),
      ],
    );
  }
}

class _ChecklistSection extends StatelessWidget {
  const _ChecklistSection({
    required this.title,
    required this.items,
    required this.isDark,
  });

  final String title;
  final List<InspectionItem> items;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final titleColor = isDark ? Colors.white : AppColors.navy;
    final rowBorder = isDark ? const Color(0xFF2A3650) : const Color(0xFFF1F3F6);
    final labelColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);

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
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 12),
          ...items.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F1626) : Colors.white,
                    border: Border.all(color: rowBorder),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          item.label,
                          style: TextStyle(fontSize: 12, color: labelColor),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: item.pass
                              ? AppColors.greenSoft
                              : AppColors.orangeSoft,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              item.pass
                                  ? LucideIcons.checkCircle2
                                  : LucideIcons.xCircle,
                              size: 12,
                              color: item.pass ? AppColors.green : AppColors.orange,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              item.status,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: item.pass ? AppColors.green : AppColors.orange,
                              ),
                            ),
                          ],
                        ),
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

class _NotesCard extends StatelessWidget {
  const _NotesCard({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final fillColor = isDark ? const Color(0xFF0F1626) : const Color(0xFFF9FAFB);
    final borderColor = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;

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
          Text(
            'Maelezo ya Ziada (Kama kuna kasoro)',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: labelColor,
            ),
          ),
          const SizedBox(height: 4),
          TextFormField(
            maxLines: 2,
            decoration: InputDecoration(
              hintText: 'Andika maelezo ya kasoro au halisi nyingine...',
              filled: true,
              fillColor: fillColor,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: borderColor),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: borderColor),
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: borderColor),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LoadSection extends StatelessWidget {
  const _LoadSection({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final titleColor = isDark ? Colors.white : AppColors.navy;
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final valueColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);
    final rowBorder = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final rowBg = isDark ? const Color(0xFF0F1626) : const Color(0xFFF9FAFB);
    final mainLabelColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);

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
          Text(
            '3. Upakiaji (Load)',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _LoadField(label: 'Aina ya Mizigo', value: 'Abiria', isDark: isDark, labelColor: labelColor, valueColor: valueColor, rowBg: rowBg, rowBorder: rowBorder),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _LoadField(label: 'Uzito (kg)', value: '1200', isDark: isDark, labelColor: labelColor, valueColor: valueColor, rowBg: rowBg, rowBorder: rowBorder),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _LoadField(label: 'Idadi ya Abiria', value: '4', isDark: isDark, labelColor: labelColor, valueColor: valueColor, rowBg: rowBg, rowBorder: rowBorder),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  'Je, upakiaji unazidi kiwango?',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: mainLabelColor,
                  ),
                ),
              ),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.greenSoft,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(LucideIcons.checkCircle2, size: 14, color: AppColors.green),
                        SizedBox(width: 4),
                        Text(
                          'Hapana',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.green,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1A2336) : const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          LucideIcons.xCircle,
                          size: 14,
                          color: isDark ? const Color(0xFF6B7689) : AppColors.gray,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Ndio',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: isDark ? const Color(0xFF6B7689) : AppColors.gray,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _LoadField extends StatelessWidget {
  const _LoadField({
    required this.label,
    required this.value,
    required this.isDark,
    required this.labelColor,
    required this.valueColor,
    required this.rowBg,
    required this.rowBorder,
  });

  final String label;
  final String value;
  final bool isDark;
  final Color labelColor;
  final Color valueColor;
  final Color rowBg;
  final Color rowBorder;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w500,
            color: labelColor,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          decoration: BoxDecoration(
            color: rowBg,
            border: Border.all(color: rowBorder),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                value,
                style: TextStyle(fontSize: 12, color: valueColor),
              ),
              Icon(
                Icons.keyboard_arrow_down_rounded,
                size: 10,
                color: labelColor,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _PhotosSection extends StatelessWidget {
  const _PhotosSection({required this.photos, required this.isDark});

  final List<InspectionPhoto> photos;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final titleColor = isDark ? Colors.white : AppColors.navy;
    final subtleColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;
    final photoBg = isDark ? const Color(0xFF0F1626) : const Color(0xFFF9FAFB);
    final photoBorder = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final placeholderColor = isDark ? const Color(0xFF6B7689) : AppColors.gray;

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
          Text(
            '4. Picha / Uthibitisho',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Piga picha sehemu muhimu za gari (nje, ndani, namba ya usajili, kasoro n.k.)',
            style: TextStyle(fontSize: 10, color: subtleColor),
          ),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.3,
            children: photos
                .map((p) => Container(
                      decoration: BoxDecoration(
                        color: photoBg,
                        border: Border.all(
                          color: photoBorder,
                          width: 2,
                          style: BorderStyle.solid,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(LucideIcons.camera, size: 20, color: placeholderColor),
                          const SizedBox(height: 4),
                          Text(
                            p.label,
                            style: TextStyle(fontSize: 9, color: placeholderColor),
                          ),
                        ],
                      ),
                    ))
                .toList(),
          ),
          const SizedBox(height: 8),
          Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: () {},
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: AppColors.blue.withValues(alpha: 0.4),
                    width: 2,
                    style: BorderStyle.solid,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(LucideIcons.cloud, size: 16, color: AppColors.blue),
                    const SizedBox(width: 6),
                    Text(
                      'Ongeza Picha',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.blue,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ResultsSection extends StatelessWidget {
  const _ResultsSection({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final titleColor = isDark ? Colors.white : AppColors.navy;

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
          Text(
            '5. Matokelo ya Ukaguzi',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 12),
          // Pass option
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? AppColors.green.withValues(alpha: 0.10) : AppColors.greenSoft,
              border: Border.all(color: AppColors.green.withValues(alpha: 0.3)),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.shieldCheck, size: 24, color: AppColors.green),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Gari Halina Kasoro Kubwa',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: isDark ? AppColors.green : const Color(0xFF15803D),
                        ),
                      ),
                      Text(
                        'Gari linafaa kuendelea na safari',
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark ? const Color(0xFFB4BCC9) : AppColors.grayText,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(LucideIcons.checkCircle2, size: 20, color: AppColors.green),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Fail option
          Opacity(
            opacity: 0.7,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1A2336) : const Color(0xFFF9FAFB),
                border: Border.all(
                  color: isDark ? const Color(0xFF2A3650) : const Color(0xFFF1F3F6),
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.shieldAlert, size: 24, color: AppColors.red),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Gari Lina Kasoro',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: isDark ? AppColors.red : const Color(0xFFB91C1C),
                          ),
                        ),
                        Text(
                          'Lipaswe matengenezeko kabla ya kuendelea',
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark ? const Color(0xFFB4BCC9) : AppColors.grayText,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isDark ? const Color(0xFF6B7689) : AppColors.gray,
                        width: 2,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SignatureSection extends StatelessWidget {
  const _SignatureSection({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final titleColor = isDark ? Colors.white : AppColors.navy;
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final valueColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);
    final rowBg = isDark ? const Color(0xFF0F1626) : const Color(0xFFF9FAFB);
    final rowBorder = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final boxBg = isDark ? const Color(0xFF0F1626) : const Color(0xFFF9FAFB);
    final boxBorder = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final subtleColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;

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
          Text(
            '6. Saini ya Afisa',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _LoadField(
                  label: 'Jina la Afisa',
                  value: 'Insp. Juma Mwinyi',
                  isDark: isDark,
                  labelColor: labelColor,
                  valueColor: valueColor,
                  rowBg: rowBg,
                  rowBorder: rowBorder,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _LoadField(
                  label: 'Namba ya Utambulisho',
                  value: 'TP123456',
                  isDark: isDark,
                  labelColor: labelColor,
                  valueColor: valueColor,
                  rowBg: rowBg,
                  rowBorder: rowBorder,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: boxBg,
              border: Border.all(color: boxBorder),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Icon(LucideIcons.penLine, size: 18, color: subtleColor),
                    Row(
                      children: [
                        Icon(LucideIcons.trash2, size: 14, color: subtleColor),
                        const SizedBox(width: 4),
                        Text(
                          'Futa',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: subtleColor,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    'J. Mwinyi',
                    style: TextStyle(
                      fontSize: 18,
                      fontStyle: FontStyle.italic,
                      color: AppColors.navy,
                      fontFamily: 'serif',
                    ),
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
