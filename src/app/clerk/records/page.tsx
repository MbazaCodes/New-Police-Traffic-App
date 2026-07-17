import { ClerkDataEntryConsole } from "@/components/role/clerk-data-entry-console";

export default function Page() {
  return (
    <ClerkDataEntryConsole
      mode="records"
      title="Police Data Entry"
      subtitle="Primary Clerk workflow for entering and maintaining police records across citizens, vehicles, and cases."
    />
  );
}
