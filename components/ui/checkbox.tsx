"use client";
import { ComponentProps, useId } from "react";

type Props = {
  label: string;
} & Omit<ComponentProps<"input">, "type" | "id">;

export default function NeonCheckbox({ label, ...rest }: Props) {
  const id = useId();
  return (
    <label htmlFor={id} className="neon-checkbox">
      <input id={id} type="checkbox" {...rest} />
      {/* checkmark (SVG) */}
      <svg className="checkmark" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M5 13l4 4L19 7"
          fill="none"
          stroke="rgb(16,185,129)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="label-text">{label}</span>
    </label>
  );
}
