import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';
import 'police_icon.dart';

/// Reusable stat card with a colored icon chip and value/label.
class StatCard extends StatelessWidget {
  const StatCard({
    super.key,
    required this.icon,
    required this.iconColor,
    required this.value,
    required this.label,
    this.sub,
    this.iconSize = 18,
    this.valueSize = 16,
    this.labelSize = 9,
  });

  final String icon;
  final String iconColor; // hex
  final String value;
  final String label;
  final String? sub;
  final double iconSize;
  final double valueSize;
  final double labelSize;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final chipColor = AppColors.tint(iconColor, isDark ? 0.22 : 0.12);
    final valueColor = isDark ? Colors.white : AppColors.ink;
    final labelColor = isDark ? const Color(0xFFB4BCC9) : AppColors.grayText;

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF151C2B) : Colors.white,
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
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(color: chipColor, shape: BoxShape.circle),
            child: PoliceIcon(
              name: icon,
              size: iconSize,
              color: AppColors.fromHex(iconColor),
            ),
          ),
          if (sub != null) ...[
            const SizedBox(height: 2),
            Text(
              sub!,
              style: TextStyle(fontSize: 8, color: labelColor),
            ),
          ],
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: valueSize,
              fontWeight: FontWeight.w700,
              color: valueColor,
              height: 1,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: labelSize, color: labelColor, height: 1.1),
          ),
        ],
      ),
    );
  }
}
