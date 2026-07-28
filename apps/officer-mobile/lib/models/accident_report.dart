/// Accident report — vehicles, people, evidence.
class AccidentReport {
  const AccidentReport({
    required this.vehicles,
    required this.people,
    required this.evidence,
  });

  final List<AccidentVehicle> vehicles;
  final List<AccidentPerson> people;
  final List<AccidentEvidence> evidence;
}

class AccidentVehicle {
  const AccidentVehicle({
    required this.plate,
    required this.model,
    required this.color,
    required this.damage,
  });

  final String plate;
  final String model;
  final String color;
  final String damage; // "Ndogo" / "Kubwa"
}

class AccidentPerson {
  const AccidentPerson({
    required this.name,
    required this.role,
    required this.phone,
    required this.condition,
  });

  final String name;
  final String role;
  final String phone;
  final String condition;
}

enum EvidenceType { image, video, pdf }

class AccidentEvidence {
  const AccidentEvidence({
    required this.name,
    required this.size,
    required this.type,
  });

  final String name;
  final String size;
  final EvidenceType type;
}
