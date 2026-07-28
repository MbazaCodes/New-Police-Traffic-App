import { IncidentDetailPage } from "@/components/admin/incident-detail-page";

export default function CommandIncidentDetailRoute({ params }: { params: { id: string } }) {
  return <IncidentDetailPage incidentId={params.id} basePath="/command" />;
}
