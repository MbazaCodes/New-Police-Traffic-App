/// A traffic offense displayed in the recent-offenses list.
class Offense {
  const Offense({
    required this.id,
    required this.name,
    required this.status,
    required this.statusColor,
    required this.icon,
    required this.iconColor,
    required this.date,
    required this.location,
    required this.fine,
  });

  final int id;
  final String name;
  final String status;
  final String statusColor; // hex
  final String icon; // icon key
  final String iconColor; // hex
  final String date;
  final String location;
  final String fine;
}
