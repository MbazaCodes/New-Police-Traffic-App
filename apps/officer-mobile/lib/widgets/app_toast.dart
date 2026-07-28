import 'package:flutter/material.dart';

/// Snack-bar based toast used to mirror the PWA's `toast({...})` calls.
void showAppToast(BuildContext context, {required String title, String? description}) {
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;

  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            if (description != null) ...[
              const SizedBox(height: 2),
              Text(
                description,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.white.withValues(alpha: 0.85),
                ),
              ),
            ],
          ],
        ),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
        backgroundColor: isDark ? const Color(0xFF1A2336) : const Color(0xFF1A237E),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 3),
      ),
    );
}
