export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-police px-6">
      <section className="w-full max-w-lg rounded-2xl bg-police-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-police-navy2">Unauthorized</h1>
        <p className="mt-3 text-sm text-police-muted">
          You do not have permission to access this resource.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex rounded-lg bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white"
        >
          Go To Login
        </a>
      </section>
    </main>
  );
}
