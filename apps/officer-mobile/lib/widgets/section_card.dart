import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../core/theme/app_colors.dart';

/// Flat white/dark card with a section title row (optional icon + count chip),
/// used across the form screens (PF3, citation, accident report, vehicle
/// inspection).
class SectionCard extends StatelessWidget {
  const SectionCard({
    super.key,
    required this.title,
    this.icon,
    this.count,
    this.child,
    this.children,
    this.padding = const EdgeInsets.all(16),
  });

  final String title;
  final IconData? icon;
  final String? count;
  final Widget? child;
  final List<Widget>? children;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final titleColor = isDark ? Colors.white : AppColors.navy;
    final countColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;

    return Container(
      width: double.infinity,
      padding: padding,
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
              if (icon != null) ...[
                Icon(icon, size: 16, color: titleColor),
                const SizedBox(width: 8),
              ],
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: titleColor,
                  ),
                ),
              ),
              if (count != null)
                Text(
                  count!,
                  style: TextStyle(fontSize: 11, color: countColor),
                ),
            ],
          ),
          const SizedBox(height: 12),
          if (child != null) child!,
          if (children != null)
            ...children!.expand((e) sync* {
              yield e;
              yield const SizedBox(height: 10);
            }).toList()
              ..removeLast(),
        ],
      ),
    );
  }
}

/// Mini read-only field used inside sections (small label above value).
class MiniField extends StatelessWidget {
  const MiniField({
    super.key,
    required this.label,
    required this.value,
    this.valueColor,
  });

  final String label;
  final String value;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 9,
            color: isDark ? const Color(0xFF8A94A6) : AppColors.gray,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: valueColor ??
                (isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563)),
          ),
        ),
      ],
    );
  }
}

/// Rounded field with an optional leading icon and a value (read-only or
/// editable). Mimics the PWA's `<Field/>` component.
class ReadOnlyField extends StatelessWidget {
  const ReadOnlyField({
    super.key,
    required this.label,
    required this.value,
    this.icon,
    this.fullWidth = false,
  });

  final String label;
  final String value;
  final IconData? icon;
  final bool fullWidth;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final valueColor = isDark ? const Color(0xFFE6EAF2) : const Color(0xFF4B5563);
    final fillColor = isDark ? const Color(0xFF1A2336) : AppColors.grayField;
    final borderColor = isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
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
                const SizedBox(width: 6),
              ],
              Expanded(
                child: Text(
                  value,
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: valueColor),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
