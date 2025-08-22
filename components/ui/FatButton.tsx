"use client";
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils"; // if you don't have cn, replace usage with template-strings

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
};

export default function FatButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={cn(
        "fat-btn",
        variant === "secondary" && "fat-btn--secondary",
        size === "sm" ? "fat-btn--sm" : "",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
