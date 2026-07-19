"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function UnauthorizedPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  useEffect(() => {
    // If redirected here due to session expiry, clear stale tokens
    if (reason === "session_expired") {
      try {
        document.cookie.split(";").forEach((c) => {
          const name = c.split("=")[0].trim();
          if (name.includes("session-token") || name === "token" || name === "accessToken" || name === "authToken") {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
          }
        });
      } catch { /* noop */ }
    }
  }, [reason]);

  const isSessionExpired = reason === "session_expired";

  return (
    <main className="flex min-h-screen items-center justify-center bg-police px-6">
      <section className="w-full max-w-lg rounded-2xl bg-police-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EF4444]/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
        </div>

        {isSessionExpired ? (
          <>
            <h1 className="text-xl font-bold text-police-navy2">Kikao Kimekwisha</h1>
            <p className="mt-3 text-sm text-police-muted">
              Kikao chako cha kuingia kimekwisha kutokana na kuchukua muda mrefu.
              Tafadhali ingia tena kuendelea kutumia mfumo.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-police-navy2">Huna Ruhusa</h1>
            <p className="mt-3 text-sm text-police-muted">
              Huna ruhusa ya kufikia rasilimali hii. Wasiliana na msimamizi wako ikiwa unadhani hii ni kosa.
            </p>
          </>
        )}

        <a
          href="/"
          className="mt-6 inline-flex rounded-lg bg-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3278] transition"
        >
          Ingia Tena
        </a>
      </section>
    </main>
  );
}