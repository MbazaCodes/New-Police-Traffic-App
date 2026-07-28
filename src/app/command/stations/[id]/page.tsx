import { StationDetailPage } from "@/components/admin/station-detail-page";

export default function CommandStationDetailRoute({ params }: { params: { id: string } }) {
  return <StationDetailPage stationId={params.id} basePath="/command" />;
}
