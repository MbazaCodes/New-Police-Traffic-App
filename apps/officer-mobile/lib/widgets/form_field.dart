import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';

/// Editable form field with a label, optional leading icon and placeholder.
/// Matches the PWA's `<FormField/>` look (rounded, light gray background).
class AppFormField extends StatelessWidget {
  const AppFormField({
    super.key,
    required this.label,
    this.placeholder,
    this.initialValue,
    this.icon,
    this.keyboardType = TextInputType.text,
    this.maxLines = 1,
    this.fullWidth = false,
    this.readOnly = false,
    this.controller,
    this.suffix,
  });

  final String label;
  final String? placeholder;
  final String? initialValue;
  final IconData? icon;
  final TextInputType keyboardType;
  final int maxLines;
  final bool fullWidth;
  final bool readOnly;
  final TextEditingController? controller;
  final Widget? suffix;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final fillColor = isDark ? const Color(0xFF1A2336) : AppColors.grayField;
    final borderColor = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final focusColor = isDark ? AppColors.blueBright : AppColors.navy;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: labelColor,
          ),
        ),
        const SizedBox(height: 4),
        TextFormField(
          controller: controller,
          initialValue: controller == null ? initialValue : null,
          readOnly: readOnly,
          keyboardType: keyboardType,
          maxLines: maxLines,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563),
          ),
          decoration: InputDecoration(
            isDense: true,
            hintText: placeholder,
            filled: true,
            fillColor: fillColor,
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            prefixIcon: icon == null
                ? null
                : Icon(icon, size: 16, color: labelColor),
            suffixIcon: suffix,
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: borderColor, width: 1),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: focusColor, width: 1.4),
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: borderColor, width: 1),
            ),
          ),
        ),
      ],
    );
  }
}

/// Dropdown-style selector that mimics the PWA's `<Dropdown/>`.
class AppDropdown extends StatefulWidget {
  const AppDropdown({
    super.key,
    required this.label,
    required this.value,
    required this.placeholder,
    required this.options,
    this.fullWidth = false,
    this.onChanged,
  });

  final String label;
  final String value;
  final String placeholder;
  final List<String> options;
  final bool fullWidth;
  final ValueChanged<String>? onChanged;

  @override
  State<AppDropdown> createState() => _AppDropdownState();
}

class _AppDropdownState extends State<AppDropdown> {
  bool _open = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final fillColor = isDark ? const Color(0xFF1A2336) : AppColors.grayField;
    final borderColor = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final valueColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);
    final placeholderColor = isDark ? const Color(0xFF6B7689) : AppColors.gray;
    final menuColor = isDark ? const Color(0xFF151C2B) : Colors.white;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          widget.label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: labelColor,
          ),
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
                    widget.value.isEmpty ? widget.placeholder : widget.value,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: widget.value.isEmpty ? FontWeight.w400 : FontWeight.w500,
                      color: widget.value.isEmpty ? placeholderColor : valueColor,
                    ),
                  ),
                ),
                Icon(
                  Icons.keyboard_arrow_down_rounded,
                  size: 16,
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
                    widget.onChanged?.call(opt);
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    child: Text(
                      opt,
                      style: TextStyle(
                        fontSize: 12,
                        color: valueColor,
                      ),
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
