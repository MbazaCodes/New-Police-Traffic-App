"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  findMiniAppForPath,
  getUniversalItemsForApp,
  toAbsoluteHref,
} from "@/lib/mini-app-nav";

type RolePageShellProps = {
  title: string;
};

export function RolePageShell({ title }: RolePageShellProps) {
  const pathname = usePathname();
  const app = findMiniAppForPath(pathname);

  if (!app) {
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

  const universalItems = getUniversalItemsForApp(app);

  return (
    <div className="min-h-screen bg-police md:flex">
      <aside className="border-b border-police bg-police-card md:min-h-screen md:w-80 md:border-b-0 md:border-r">
        <div className="p-4 md:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-police-faint">Mini App</p>
          <h2 className="mt-1 text-lg font-bold text-police-navy2">{app.label}</h2>
          <p className="mt-1 text-xs text-police-muted">Role-specific navigation matrix</p>
        </div>

        <nav className="space-y-4 px-3 pb-4 md:px-4 md:pb-6">
          <div>
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-police-faint">Role Pages</p>
            <ul className="mt-2 space-y-1">
              {app.roleItems.map((item) => {
                const href = toAbsoluteHref(app.basePath, item.href);
                const active = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`block rounded-lg px-3 py-2 text-sm transition ${
                        active
                          ? "bg-[#1E3A8A] text-white"
                          : "text-police-navy2 hover:bg-police-muted"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {universalItems.length > 0 && (
            <div>
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-police-faint">Universal</p>
              <ul className="mt-2 space-y-1">
                {universalItems.map((item) => {
                  const href = toAbsoluteHref(app.basePath, item.href);
                  const active = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`block rounded-lg px-3 py-2 text-sm transition ${
                          active
                            ? "bg-[#1E3A8A] text-white"
                            : "text-police-navy2 hover:bg-police-muted"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <section className="rounded-2xl bg-police-card p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold text-police-navy2">{title}</h1>
          <p className="mt-3 text-sm text-police-muted">
            This page is scaffolded as part of the {app.label} mini-application.
          </p>
        </section>
      </main>
    </div>
  );
}
