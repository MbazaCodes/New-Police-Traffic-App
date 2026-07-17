import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

/// In Flutter we use the real OS status bar, but this helper styles it.
/// Use [StatusBar.applyStyle] in `main()` once, then forget about it.
///
/// A small [FakeStatusBar] widget is also provided in case you want to show
/// an iOS-style mock status bar inside a phone-frame preview.
class StatusBar {
  StatusBar._();

  static void applyStyle({required Brightness brightness}) {
    SystemChrome.setSystemUIOverlayStyle(
      SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness:
            brightness == Brightness.dark ? Brightness.light : Brightness.dark,
        statusBarBrightness:
            brightness == Brightness.dark ? Brightness.dark : Brightness.light,
      ),
    );
  }
}

/// Optional mock status bar (09:41 + signal / wifi / battery) matching the PWA.
class FakeStatusBar extends StatelessWidget {
  const FakeStatusBar({super.key, this.dark = false});

  final bool dark;

  @override
  Widget build(BuildContext context) {
    final color = dark ? Colors.white : Colors.black;
    return Padding(
      padding: const EdgeInsets.only(left: 24, right: 24, top: 12, bottom: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            '09:41',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              letterSpacing: -0.2,
              color: color,
            ),
          ),
          Row(
            children: [
              Icon(LucideIcons.signal, size: 16, color: color),
              const SizedBox(width: 6),
              Icon(LucideIcons.wifi, size: 16, color: color),
              const SizedBox(width: 6),
              Icon(LucideIcons.batteryFull, size: 20, color: color),
            ],
          ),
        ],
      ),
    );
  }
}

