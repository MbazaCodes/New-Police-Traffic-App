type RolePageShellProps = {
  title: string;
};

export function RolePageShell({ title }: RolePageShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-police px-6 py-8">
      <section className="w-full max-w-3xl rounded-2xl bg-police-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-police-navy2">{title}</h1>
        <p className="mt-3 text-sm text-police-muted">
          Dedicated role route scaffold. Existing functionality remains intact and can be integrated incrementally.
        </p>
      </section>
    </main>
  );
}
