import { PostDetailPage } from "@/components/admin/post-detail-page";

export default function AdminPostDetailRoute({ params }: { params: { id: string } }) {
  return <PostDetailPage postId={params.id} basePath="/admin" />;
}
