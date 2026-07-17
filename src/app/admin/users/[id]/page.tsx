import { UserDetailPage } from "@/components/admin/user-detail-page";

export default function AdminUserDetailRoute({ params }: { params: { id: string } }) {
  return <UserDetailPage userId={params.id} basePath="/admin" />;
}
