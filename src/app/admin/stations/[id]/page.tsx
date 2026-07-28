import { StationDetailPage } from "@/components/admin/station-detail-page";

export default function AdminStationDetailRoute({ params }: { params: { id: string } }) {
  return <StationDetailPage stationId={params.id} basePath="/admin" />;
}
