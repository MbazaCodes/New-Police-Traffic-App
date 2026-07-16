/// Officer profile data.
class Officer {
  const Officer({
    required this.name,
    required this.shortName,
    required this.rank,
    required this.rankShort,
    required this.id,
    required this.station,
    required this.unit,
    required this.phone,
    required this.email,
    required this.status,
  });

  final String name;
  final String shortName;
  final String rank;
  final String rankShort;
  final String id;
  final String station;
  final String unit;
  final String phone;
  final String email;
  final String status;
}
