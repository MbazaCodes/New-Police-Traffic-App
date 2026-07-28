"use client";

import { cn } from "@/lib/utils";

// ── Form primitives ───────────────────────────────────────────
// FormSection: groups related fields with a heading + description.
// FormField:   label + control + hint/error, with consistent spacing.
// FormActions: aligns primary + secondary buttons at the bottom of a form.
//
// Usage:
//   <FormSection title="Officer details" description="Basic identity">
//     <FormField label="Full name" required error={errors.name}>
//       <input className="tpf-input" {...field} />
//     </FormField>
//     <FormField label="Badge No." hint="As printed on the ID card">
//       <input className="tpf-input" {...field} />
//     </FormField>
//   </FormSection>
//   <FormActions>
//     <Button variant="ghost">Cancel</Button>
//     <Button variant="primary">Save</Button>
//   </FormActions>

type FormSectionProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      {(title || description) && (
        <div className="flex flex-col gap-0.5">
          {title && (
            <h3
              className="text-[var(--tpf-text)]"
              style={{ font: "var(--tpf-font-h3)", margin: 0 }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p className="text-[12px] text-[var(--tpf-text-3)]">{description}</p>
          )}
        </div>
      )}
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

type FormFieldProps = {
  label: string;
  /** Show the red asterisk next to the label. */
  required?: boolean;
  /** Inline hint shown beneath the field in neutral color. */
  hint?: string;
  /** Error message — when present, overrides hint and renders in danger color. */
  error?: string;
  /** When true, the label + control render on a single row (md+). */
  inline?: boolean;
  /** Optional id to associate label with input via htmlFor. */
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormField({
  label,
  required,
  hint,
  error,
  inline = false,
  htmlFor,
  children,
  className,
}: FormFieldProps) {
  const showError = Boolean(error);
  return (
    <div
      className={cn(
        "flex gap-1.5",
        inline ? "flex-row items-center md:gap-3" : "flex-col",
        className
      )}
    >
      <label
        htmlFor={htmlFor}
        className={cn(
          "text-[12px] font-medium text-[var(--tpf-text-2)]",
          inline ? "min-w-[120px] shrink-0 md:min-w-[160px]" : ""
        )}
      >
        {label}
        {required && <span className="ml-0.5 text-[var(--tpf-danger)]">*</span>}
      </label>

      <div className="flex flex-1 flex-col gap-1">
        {children}
        {showError ? (
          <p className="text-[11px] text-[var(--tpf-danger)]">{error}</p>
        ) : hint ? (
          <p className="text-[11px] text-[var(--tpf-text-3)]">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

type FormActionsProps = {
  children: React.ReactNode;
  /** "end" (default) right-aligns buttons; "start" left-aligns; "between" spreads them. */
  align?: "start" | "end" | "between";
  className?: string;
};

export function FormActions({ children, align = "end", className }: FormActionsProps) {
  const justify =
    align === "start"
      ? "justify-start"
      : align === "between"
        ? "justify-between"
        : "justify-end";
  return (
    <div className={cn("flex items-center gap-2 pt-2", justify, className)}>
      {children}
    </div>
  );
}
