"use client";

import * as React from "react";

type CheckboxProps = Omit<React.ComponentProps<"input">, "type" | "onChange"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onCheckedChange,
  className = "",
  ...rest
}) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.currentTarget.checked)}
      className={[
        // base size/shape
        "h-5 w-5 rounded-md align-middle",
        // border & bg
        "border border-white/25 bg-white/5",
        // subtle shadow
        "shadow-[inset_0_0_0_2px_rgba(0,0,0,.35),0_2px_12px_rgba(0,0,0,.3)]",
        // focus ring
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
        // checked styles
        "checked:bg-emerald-500/80 checked:border-emerald-500",
        className,
      ].join(" ")}
      {...rest}
    />
  );
};

export default Checkbox;
export { Checkbox }; // <-- named export too
