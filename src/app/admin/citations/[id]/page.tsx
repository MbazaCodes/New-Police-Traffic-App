import { CitationDetailPage } from "@/components/admin/citation-detail-page";

export default function AdminCitationDetailRoute({ params }: { params: { id: string } }) {
  return <CitationDetailPage citationId={params.id} basePath="/admin" />;
}
