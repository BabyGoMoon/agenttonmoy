"use client";

import { useMemo, useState } from "react";

/* ---------- Neon Checkbox (shared) ---------- */
function NeonCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="relative flex w-full items-start gap-3">
      {/* real (hidden) input for a11y */}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
        className="peer sr-only"
      />
      {/* box */}
      <span
        className={[
          "relative mt-[2px] h-[22px] w-[22px] flex-none rounded-md border",
          "border-white/25 bg-white/5",
          "shadow-[inset_0_0_0_2px_rgba(0,0,0,0.35),0_2px_12px_rgba(0,0,0,0.3)]",
          "transition-all duration-200",
          "peer-checked:border-emerald-500 peer-checked:bg-emerald-500/15",
          "peer-checked:shadow-[0_0_0_2px_rgba(16,185,129,.25),0_6px_26px_rgba(16,185,129,.35)]",
          "peer-hover:border-emerald-400/60",
        ].join(" ")}
      />
      {/* checkmark */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={[
          "pointer-events-none absolute left-[3px] top-[3px] h-4 w-4",
          "opacity-0 scale-75 transition-all duration-150",
          "drop-shadow-[0_0_6px_rgba(16,185,129,.65)]",
          "peer-checked:opacity-100 peer-checked:scale-100",
        ].join(" ")}
      >
        <path
          d="M5 13l4 4L19 7"
          fill="none"
          stroke="rgb(16,185,129)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* text (wrap to next line naturally) */}
      <span className="text-[0.95rem] leading-snug text-white/85">
        {label}
      </span>
    </label>
  );
}

/* ---------- Shared SafetyGuards used by ALL tools ---------- */
export default function SafetyGuards({
  onConfirm,
  isLoading,
  toolName,
  items = [
    "I have explicit written authorization to test the target",
    "This is for educational or authorized security research only",
    "I understand that unauthorized testing is illegal",
    "I will use this tool ethically and responsibly",
  ],
}: {
  onConfirm: () => void;
  isLoading?: boolean;
  toolName: string;
  items?: string[];
}) {
  const [checks, setChecks] = useState<boolean[]>(Array(items.length).fill(false));
  const allChecked = useMemo(() => checks.every(Boolean), [checks]);

  return (
    <div className="flex flex-col gap-4">
      {items.map((label, idx) => (
        <NeonCheckbox
          key={idx}
          label={label}
          checked={checks[idx]}
          onChange={(v) => {
            const next = [...checks];
            next[idx] = v;
            setChecks(next);
          }}
        />
      ))}

      {/* Uiverse fat-eagle-24 style button (requires .fat-btn CSS in globals.css) */}
      <button
        type="button"
        disabled={!allChecked || !!isLoading}
        aria-disabled={!allChecked || !!isLoading}
        onClick={() => allChecked && onConfirm()}
        className="fat-btn mt-2 w-full"
      >
        I Confirm — Proceed with Tool
      </button>

      <p className="text-xs text-white/50">
        Safety &amp; Legal Requirements for{" "}
        <span className="text-emerald-400">{toolName}</span>
      </p>
    </div>
  );
}

