/// A citation record in the history list.
class Citation {
  const Citation({
    required this.id,
    required this.plate,
    required this.offense,
    required this.driver,
    required this.date,
    required this.time,
    required this.location,
    required this.fine,
    required this.status,
    required this.statusColor,
  });

  final String id;
  final String plate;
  final String offense;
  final String driver;
  final String date;
  final String time;
  final String location;
  final String fine;
  final String status;
  final String statusColor; // hex
}
