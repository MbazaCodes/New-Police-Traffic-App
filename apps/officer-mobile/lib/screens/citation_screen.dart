import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/theme/app_colors.dart';
import '../data/mock_data.dart';
import '../widgets/app_toast.dart';
import '../widgets/top_app_bar.dart';

/// Citation form screen — vehicle / driver / offense / fine / evidence sections.
/// Mirrors `src/components/police/screens/citation-screen.tsx`.
class CitationScreen extends ConsumerStatefulWidget {
  const CitationScreen({super.key});

  @override
  ConsumerState<CitationScreen> createState() => _CitationScreenState();
}

class _CitationScreenState extends ConsumerState<CitationScreen> {
  String? _offense;
  String? _vehicleType;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF0B1018) : AppColors.grayLight;

    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: Column(
          children: [
            const TopAppBar(
              title: 'Toa Citation',
              subtitle: 'Jaza taarifa za kosa la trafiki',
              showBack: true,
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Header
                    _CitationHeader(isDark: isDark),
                    const SizedBox(height: 12),
                    // Section: Vehicle
                    _Section(
                      title: 'Taarifa za Gari',
                      icon: LucideIcons.car,
                      isDark: isDark,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: _CitationFormField(
                                label: 'Namba ya Usajili',
                                placeholder: 'T123ABC',
                                isDark: isDark,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _CitationDropdown(
                                label: 'Aina ya Gari',
                                value: _vehicleType,
                                placeholder: 'Chagua aina',
                                options: vehicleTypes,
                                isDark: isDark,
                                onChanged: (v) =>
                                    setState(() => _vehicleType = v),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: _CitationFormField(
                                label: 'Modeli',
                                placeholder: 'Toyota Corolla',
                                isDark: isDark,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _CitationFormField(
                                label: 'Rangi',
                                placeholder: 'Nyeupe',
                                isDark: isDark,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Section: Driver
                    _Section(
                      title: 'Taarifa za Dereva',
                      icon: LucideIcons.user,
                      isDark: isDark,
                      children: [
                        _CitationFormField(
                          label: 'Jina Kamili',
                          placeholder: 'Juma Khamis Mwinyi',
                          isDark: isDark,
                          fullWidth: true,
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: _CitationFormField(
                                label: 'Namba ya Leseni',
                                placeholder: 'DL123456789TZ',
                                isDark: isDark,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _CitationFormField(
                                label: 'Namba ya Simu',
                                placeholder: '07XX XXX XXX',
                                keyboardType: TextInputType.phone,
                                isDark: isDark,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        _CitationFormField(
                          label: 'Namba ya NIDA',
                          placeholder: '1990123456789',
                          isDark: isDark,
                          fullWidth: true,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Section: Offense
                    _Section(
                      title: 'Maelezo ya Kosa',
                      icon: LucideIcons.fileText,
                      isDark: isDark,
                      children: [
                        _CitationDropdown(
                          label: 'Aina ya Kosa',
                          value: _offense,
                          placeholder: 'Chagua kosa',
                          options: offenseTypes,
                          isDark: isDark,
                          fullWidth: true,
                          onChanged: (v) => setState(() => _offense = v),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: _CitationReadOnlyField(
                                label: 'Tarehe',
                                value: '15 Mei 2026',
                                icon: LucideIcons.calendar,
                                isDark: isDark,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _CitationReadOnlyField(
                                label: 'Saa',
                                value: '08:15 AM',
                                icon: LucideIcons.clock,
                                isDark: isDark,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        _CitationFormField(
                          label: 'Eneo',
                          placeholder: 'Morogoro Road, DSM',
                          icon: LucideIcons.mapPin,
                          isDark: isDark,
                          fullWidth: true,
                        ),
                        const SizedBox(height: 10),
                        _TextArea(
                          label: 'Maelezo ya Ziada',
                          placeholder: 'Eleza kwa kifupi kilichotokea...',
                          isDark: isDark,
                          maxLines: 3,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Section: Fine
                    _Section(
                      title: 'Faini na Malipo',
                      icon: LucideIcons.wallet,
                      isDark: isDark,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: _CitationFormField(
                                label: 'Kiasi cha Faini',
                                placeholder: 'TZS 0',
                                icon: LucideIcons.wallet,
                                keyboardType: TextInputType.number,
                                isDark: isDark,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _PaymentStatusField(isDark: isDark),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Section: Evidence
                    _Section(
                      title: 'Ushahidi (Picha)',
                      icon: LucideIcons.camera,
                      isDark: isDark,
                      children: [
                        _UploadBox(
                          label: 'Ongeza picha za ushahidi',
                          hint: 'JPG, PNG (Max 10MB)',
                          isDark: isDark,
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
                              side: const BorderSide(color: AppColors.navy, width: 2),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              foregroundColor: AppColors.navy,
                            ),
                            onPressed: () => showAppToast(
                              context,
                              title: 'Imehifadhiwa',
                              description: 'Rasimu ya Citation imehifadhiwa.',
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(LucideIcons.save, size: 16),
                                SizedBox(width: 4),
                                Text(
                                  'Hifadhi',
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
                              title: 'Citation Imetolewa',
                              description: 'Citation imewasilishwa na imetumwa kwa dereva.',
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(LucideIcons.send, size: 16),
                                SizedBox(width: 6),
                                Text(
                                  'Toa Citation',
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

class _CitationHeader extends StatelessWidget {
  const _CitationHeader({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;
    final numberColor = isDark ? Colors.white : AppColors.navy;
    final nameColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);

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
              Text(
                'NAMBA YA CITATION',
                style: TextStyle(
                  fontSize: 10,
                  letterSpacing: 0.6,
                  color: labelColor,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'CT-2026-00452',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: numberColor,
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                'AFISA',
                style: TextStyle(
                  fontSize: 10,
                  letterSpacing: 0.6,
                  color: labelColor,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                officer.shortName,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: nameColor,
                ),
              ),
            ],
          ),
        ],
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
  });

  final String title;
  final IconData icon;
  final bool isDark;
  final List<Widget> children;

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
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }
}

class _CitationFormField extends StatelessWidget {
  const _CitationFormField({
    required this.label,
    required this.isDark,
    this.placeholder,
    this.icon,
    this.keyboardType = TextInputType.text,
    this.fullWidth = false,
  });

  final String label;
  final String? placeholder;
  final IconData? icon;
  final TextInputType keyboardType;
  final bool fullWidth;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final fillColor = isDark ? const Color(0xFF0F1626) : const Color(0xFFF9FAFB);
    final borderColor = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final valueColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);
    final hintColor = isDark ? const Color(0xFF6B7689) : AppColors.gray;

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
                child: TextField(
                  keyboardType: keyboardType,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: valueColor,
                  ),
                  decoration: InputDecoration(
                    isDense: true,
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.zero,
                    hintText: placeholder,
                    hintStyle: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                      color: hintColor,
                    ),
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

class _CitationReadOnlyField extends StatelessWidget {
  const _CitationReadOnlyField({
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

class _CitationDropdown extends StatefulWidget {
  const _CitationDropdown({
    required this.label,
    required this.value,
    required this.placeholder,
    required this.options,
    required this.isDark,
    required this.onChanged,
    this.fullWidth = false,
  });

  final String label;
  final String? value;
  final String placeholder;
  final List<String> options;
  final bool isDark;
  final ValueChanged<String> onChanged;
  final bool fullWidth;

  @override
  State<_CitationDropdown> createState() => _CitationDropdownState();
}

class _CitationDropdownState extends State<_CitationDropdown> {
  bool _open = false;

  @override
  Widget build(BuildContext context) {
    final labelColor = widget.isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final fillColor = widget.isDark ? const Color(0xFF0F1626) : const Color(0xFFF9FAFB);
    final borderColor = widget.isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final valueColor = widget.isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);
    final hintColor = widget.isDark ? const Color(0xFF6B7689) : AppColors.gray;
    final menuColor = widget.isDark ? const Color(0xFF151C2B) : Colors.white;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: labelColor),
        ),
        const SizedBox(height: 4),
        GestureDetector(
          onTap: () => setState(() => _open = !_open),
          child: Container(
            height: 40,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: fillColor,
              border: Border.all(color: borderColor),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    widget.value ?? widget.placeholder,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: widget.value == null ? FontWeight.w400 : FontWeight.w500,
                      color: widget.value == null ? hintColor : valueColor,
                    ),
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
        ),
        if (_open)
          Container(
            margin: const EdgeInsets.only(top: 4),
            constraints: const BoxConstraints(maxHeight: 160),
            decoration: BoxDecoration(
              color: menuColor,
              border: Border.all(color: borderColor),
              borderRadius: BorderRadius.circular(12),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x1A000000),
                  blurRadius: 10,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: ListView(
              shrinkWrap: true,
              padding: const EdgeInsets.symmetric(vertical: 4),
              children: widget.options.map((opt) {
                return InkWell(
                  onTap: () {
                    setState(() => _open = false);
                    widget.onChanged(opt);
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    child: Text(
                      opt,
                      style: TextStyle(fontSize: 12, color: valueColor),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
      ],
    );
  }
}

class _TextArea extends StatelessWidget {
  const _TextArea({
    required this.label,
    required this.placeholder,
    required this.isDark,
    this.maxLines = 3,
  });

  final String label;
  final String placeholder;
  final bool isDark;
  final int maxLines;

  @override
  Widget build(BuildContext context) {
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final fillColor = isDark ? const Color(0xFF0F1626) : const Color(0xFFF9FAFB);
    final borderColor = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final valueColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);
    final hintColor = isDark ? const Color(0xFF6B7689) : AppColors.gray;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: labelColor),
        ),
        const SizedBox(height: 4),
        TextFormField(
          maxLines: maxLines,
          style: TextStyle(
            fontSize: 12,
            height: 1.4,
            color: valueColor,
          ),
          decoration: InputDecoration(
            hintText: placeholder,
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
            hintStyle: TextStyle(fontSize: 12, color: hintColor),
          ),
        ),
      ],
    );
  }
}

class _PaymentStatusField extends StatelessWidget {
  const _PaymentStatusField({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final fillColor = isDark ? const Color(0xFF0F1626) : const Color(0xFFF9FAFB);
    final borderColor = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Hali ya Malipo',
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
              const Expanded(
                child: Text(
                  'Inasubiri Malipo',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.orange,
                  ),
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

class _UploadBox extends StatelessWidget {
  const _UploadBox({
    required this.label,
    required this.hint,
    required this.isDark,
  });

  final String label;
  final String hint;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final boxBg = isDark ? const Color(0xFF0F1626) : const Color(0xFFF9FAFB);
    final boxBorder = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final iconColor = isDark ? const Color(0xFF6B7689) : AppColors.gray;
    final labelColor = isDark ? const Color(0xFFB4BCC9) : AppColors.grayText;
    final hintColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20),
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
          Icon(LucideIcons.camera, size: 24, color: iconColor),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: labelColor,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            hint,
            style: TextStyle(fontSize: 9, color: hintColor),
          ),
        ],
      ),
    );
  }
}

