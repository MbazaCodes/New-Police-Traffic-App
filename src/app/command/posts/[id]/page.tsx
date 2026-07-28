import { PostDetailPage } from "@/components/admin/post-detail-page";

export default function CommandPostDetailRoute({ params }: { params: { id: string } }) {
  return <PostDetailPage postId={params.id} basePath="/command" />;
}
