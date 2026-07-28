"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ErrorState } from "@/components/ui/police";

export default function UnauthorizedPage() {
  return (
    <Suspense>
      <UnauthorizedContent />
    </Suspense>
  );
}

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  useEffect(() => {
    if (reason === "session_expired") {
      try {
        document.cookie.split(";").forEach((c) => {
          const name = c.split("=")[0].trim();
          if (
            name.includes("session-token") ||
            name === "token" ||
            name === "accessToken" ||
            name === "authToken"
          ) {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
          }
        });
      } catch {
        /* noop */
      }
    }
  }, [reason]);

  const isSessionExpired = reason === "session_expired";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--tpf-surface)] px-6">
      <section className="w-full max-w-lg rounded-2xl bg-[var(--tpf-card)] p-8 shadow-sm">
        <ErrorState
          title={isSessionExpired ? "Kikao Kimekwisha" : "Huna Ruhusa"}
          message={
            isSessionExpired
              ? "Kikao chako cha kuingia kimekwisha kutokana na kuchukua muda mrefu. Tafadhali ingia tena kuendelea kutumia mfumo."
              : "Huna ruhusa ya kufikia rasilimali hii. Wasiliana na msimamizi wako ikiwa unadhani hii ni kosa."
          }
          retryLabel="Ingia Tena"
          onRetry={() => {
            window.location.href = "/";
          }}
        />
      </section>
    </main>
  );
}
