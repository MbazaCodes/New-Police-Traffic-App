/// PF3 (Tanzania Police Traffic Accident Report) form model.
class Pf3Form {
  const Pf3Form({
    required this.referenceNo,
    required this.region,
    required this.district,
    required this.station,
    required this.accidentType,
    required this.severity,
    required this.weather,
    required this.roadSurface,
    required this.lightCondition,
    required this.vehicles,
    required this.casualties,
    required this.witnesses,
  });

  final String referenceNo;
  final String region;
  final String district;
  final String station;
  final String accidentType;
  final String severity;
  final String weather;
  final String roadSurface;
  final String lightCondition;
  final List<Pf3Vehicle> vehicles;
  final List<Pf3Casualty> casualties;
  final List<Pf3Witness> witnesses;
}

class Pf3Vehicle {
  const Pf3Vehicle({
    required this.plate,
    required this.make,
    required this.year,
    required this.color,
    required this.driver,
    required this.license,
    required this.direction,
    required this.damage,
    required this.insured,
  });

  final String plate;
  final String make;
  final String year;
  final String color;
  final String driver;
  final String license;
  final String direction;
  final String damage;
  final bool insured;
}

class Pf3Casualty {
  const Pf3Casualty({
    required this.name,
    required this.type,
    required this.injury,
    required this.hospital,
    required this.status,
  });

  final String name;
  final String type;
  final String injury;
  final String hospital;
  final String status;
}

class Pf3Witness {
  const Pf3Witness({
    required this.name,
    required this.phone,
    required this.statement,
  });

  final String name;
  final String phone;
  final String statement;
}
