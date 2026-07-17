import { OfficerProfilePage } from "@/components/admin/officer-profile-page";

export default function CommandOfficerProfileRoute({ params }: { params: { id: string } }) {
  return <OfficerProfilePage officerId={params.id} basePath="/command" />;
}
