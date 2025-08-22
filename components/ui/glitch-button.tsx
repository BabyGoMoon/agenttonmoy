"use client";

import Link from "next/link";
import clsx from "clsx";
import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  children: ReactNode;
  /** rounding like your pill CTA */
  pill?: boolean;
  /** quick size helpers (you can still pass className) */
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeMap = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2 text-base",
  lg: "px-7 py-3 text-lg",
  xl: "px-10 py-4 text-xl",
};

export const GlitchButton = forwardRef<HTMLButtonElement, Props>(
  ({ href, children, pill = true, size = "lg", className, ...rest }, ref) => {
    const label =
      typeof children === "string" ? children : (rest["aria-label"] as string) || "Action";
    const classes = clsx(
      "glitch-btn select-none",
      pill && "rounded-full",
      sizeMap[size],
      className
    );

    if (href) {
      return (
        <Link href={href} className={classes} data-text={label} role="button">
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} data-text={label} {...rest}>
        {children}
      </button>
    );
  }
);

GlitchButton.displayName = "GlitchButton";

export default GlitchButton;
