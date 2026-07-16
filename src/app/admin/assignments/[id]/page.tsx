import { AssignmentDetailPage } from "@/components/admin/assignment-detail-page";

export default function AdminAssignmentDetailRoute({ params }: { params: { id: string } }) {
  return <AssignmentDetailPage assignmentId={params.id} basePath="/admin" />;
}
