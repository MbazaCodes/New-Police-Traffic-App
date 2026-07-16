import 'package:flutter/material.dart';

/// Circular asset image wrapper for the bundled `police-logo.png`.
class PoliceLogo extends StatelessWidget {
  const PoliceLogo({
    super.key,
    this.size = 48,
    this.ringColor,
    this.ringWidth = 2.0,
    this.fit = BoxFit.cover,
  });

  final double size;
  final Color? ringColor;
  final double ringWidth;
  final BoxFit fit;

  @override
  Widget build(BuildContext context) {
    final ring = ringColor;
    final logo = ClipOval(
      child: Image.asset(
        'assets/police-logo.png',
        width: size,
        height: size,
        fit: fit,
        alignment: Alignment.center,
      ),
    );

    if (ring == null) return logo;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: ring, width: ringWidth),
      ),
      child: logo,
    );
  }
}
