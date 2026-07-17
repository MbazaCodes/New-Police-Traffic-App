"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Smartphone } from "lucide-react";

function emptySubscribe() {
  return () => {};
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-police-muted" />
    );
  }

  const current = theme === "system" ? "system" : resolvedTheme;

  if (compact) {
    const isDark = resolvedTheme === "dark";
    return (
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-police-muted text-police-navy active:scale-90"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    );
  }

  const options = [
    { id: "light", label: "Mwanga", icon: Sun },
    { id: "dark", label: "Giza", icon: Moon },
    { id: "system", label: "Auto", icon: Smartphone },
  ] as const;

  return (
    <div className="flex gap-1 rounded-xl bg-police-muted p-1">
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = current === opt.id || (opt.id === "system" && theme === "system");
        return (
          <button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition ${
              active
                ? "bg-police-card text-police-navy shadow-sm"
                : "text-police-muted"
            }`}
          >
            <Icon size={14} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
