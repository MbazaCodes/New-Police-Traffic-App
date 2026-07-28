import { UserDetailPage } from "@/components/admin/user-detail-page";

export default function CommandUserDetailRoute({ params }: { params: { id: string } }) {
  return <UserDetailPage userId={params.id} basePath="/command" />;
}
