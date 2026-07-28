import { AssignmentDetailPage } from "@/components/admin/assignment-detail-page";

export default function CommandAssignmentDetailRoute({ params }: { params: { id: string } }) {
  return <AssignmentDetailPage assignmentId={params.id} basePath="/command" />;
}
