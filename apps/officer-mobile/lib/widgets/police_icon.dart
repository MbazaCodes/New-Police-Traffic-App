import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

/// Maps icon keys used by the PWA's `<PoliceIcon name="..."/>` to actual
/// [IconData] from [LucideIcons]. Falls back to [LucideIcons.alertTriangle].
class PoliceIconData {
  PoliceIconData._();

  static IconData fromName(String name) => _map[name] ?? LucideIcons.alertTriangle;

  static final Map<String, IconData> _map = {
    'alert': LucideIcons.alertTriangle,
    'alert-triangle': LucideIcons.alertTriangle,
    'bell': LucideIcons.bell,
    'car': LucideIcons.car,
    'check': LucideIcons.check,
    'check-circle': LucideIcons.checkCircle2,
    'clipboard': LucideIcons.clipboardList,
    'clock': LucideIcons.clock,
    'cloud': LucideIcons.cloud,
    'cloud-rain': LucideIcons.cloudRain,
    'download': LucideIcons.download,
    'file-text': LucideIcons.fileText,
    'gauge': LucideIcons.gauge,
    'git-merge': LucideIcons.gitMerge,
    'graduation-cap': LucideIcons.graduationCap,
    'help-circle': LucideIcons.helpCircle,
    'home': LucideIcons.home,
    'map-pin': LucideIcons.mapPin,
    'route': LucideIcons.mapPin,
    'scan-line': LucideIcons.scanLine,
    'search': LucideIcons.search,
    'settings': LucideIcons.settings,
    'shield': LucideIcons.shield,
    'shield-alert': LucideIcons.shieldAlert,
    'shield-check': LucideIcons.shieldCheck,
    'smartphone': LucideIcons.smartphone,
    'traffic-cone': LucideIcons.alertTriangle,
    'user': LucideIcons.user,
    'users': LucideIcons.users,
    'wallet': LucideIcons.wallet,
    'camera': LucideIcons.camera,
    'calendar': LucideIcons.calendar,
    'credit-card': LucideIcons.creditCard,
    'phone': LucideIcons.phone,
    'key': LucideIcons.keyRound,
    'send': LucideIcons.send,
    'save': LucideIcons.save,
    'eye': LucideIcons.eye,
    'pencil': LucideIcons.pencil,
    'logout': LucideIcons.logOut,
    'megaphone': LucideIcons.megaphone,
    'chevron-right': LucideIcons.chevronRight,
    'chevron-left': LucideIcons.chevronLeft,
    'plus': LucideIcons.plus,
    'upload': LucideIcons.upload,
    'play': LucideIcons.play,
    'target': LucideIcons.target,
    'image': LucideIcons.image,
    'video': LucideIcons.video,
    'pdf': LucideIcons.fileText,
    'shield-x': LucideIcons.shieldAlert,
    'pen-line': LucideIcons.pencil,
    'trash': LucideIcons.trash2,
    'printer': LucideIcons.printer,
    'filter': LucideIcons.filter,
    'share': LucideIcons.share2,
    'message-warning': LucideIcons.megaphone,
    'hand': LucideIcons.hand,
    'cloud-sun': LucideIcons.cloudSun,
    'sun': LucideIcons.sun,
    'building': LucideIcons.building2,
    'hash': LucideIcons.hash,
    'refresh': LucideIcons.refreshCw,
    'file-check': LucideIcons.fileCheck,
    'file-spreadsheet': LucideIcons.fileSpreadsheet,
    'x': LucideIcons.x,
    'x-circle': LucideIcons.xCircle,
  };
}

/// Convenience widget for the icon-name pattern used in the PWA.
class PoliceIcon extends StatelessWidget {
  const PoliceIcon({
    super.key,
    required this.name,
    this.size = 24,
    this.color,
    this.strokeWidth = 2,
  });

  final String name;
  final double size;
  final Color? color;
  final double strokeWidth;

  @override
  Widget build(BuildContext context) {
    // strokeWidth is exposed via IconTheme for icon-outline packages that
    // support it (LucideIcons supports fill/weight/grade/optical-size). For
    // icons without a strokeWidth parameter, this is a no-op.
    return Icon(
      PoliceIconData.fromName(name),
      size: size,
      color: color,
    );
  }
}
