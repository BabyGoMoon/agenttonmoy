"use client";

import * as React from "react";

type CheckboxProps = Omit<React.ComponentProps<"input">, "type" | "onChange"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export default function Checkbox({
  checked,
  onCheckedChange,
  className = "",
  ...rest
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.currentTarget.checked)}
      className={[
        "h-5 w-5 rounded-md align-middle",
        "border border-white/25 bg-white/5",
        "shadow-[inset_0_0_0_2px_rgba(0,0,0,.35),0_2px_12px_rgba(0,0,0,.3)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
        "checked:bg-emerald-500/80 checked:border-emerald-500",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}
