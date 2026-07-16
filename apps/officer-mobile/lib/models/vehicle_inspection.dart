/// Vehicle inspection record (checklists + photos + officer signature).
class VehicleInspection {
  const VehicleInspection({
    required this.plate,
    required this.model,
    required this.color,
    required this.owner,
    required this.phone,
    required this.location,
    required this.datetime,
    required this.documents,
    required this.mechanical,
    required this.photos,
  });

  final String plate;
  final String model;
  final String color;
  final String owner;
  final String phone;
  final String location;
  final String datetime;
  final List<InspectionItem> documents;
  final List<InspectionItem> mechanical;
  final List<InspectionPhoto> photos;
}

class InspectionItem {
  const InspectionItem({
    required this.label,
    required this.status,
    required this.pass,
  });

  final String label;
  final String status;
  final bool pass;
}

class InspectionPhoto {
  const InspectionPhoto({required this.label});

  final String label;
}
