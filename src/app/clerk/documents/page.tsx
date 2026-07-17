import { ClerkDataEntryConsole } from "@/components/role/clerk-data-entry-console";

export default function Page() {
  return (
    <ClerkDataEntryConsole
      mode="documents"
      title="Clerk Documents"
      subtitle="Live document queue, missing attachments, and validation tracking from the clerk data pipeline."
    />
  );
}
