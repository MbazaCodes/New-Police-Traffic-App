/// A broadcast alert/notification shown in the Alerts screen.
class Alert {
  const Alert({
    required this.id,
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.time,
    required this.message,
    required this.source,
    required this.sourceBg,
    required this.dotColor,
    required this.borderColor,
    required this.unread,
  });

  final int id;
  final String icon; // icon key
  final String iconColor; // hex
  final String title;
  final String time;
  final String message;
  final String source;
  final String sourceBg; // hex
  final String dotColor; // hex
  final String borderColor; // hex
  final bool unread;
}
