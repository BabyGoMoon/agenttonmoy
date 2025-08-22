"use client";

import * as React from "react";

type SpotlightCardProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Minimal SpotlightCard wrapper that applies the global Uiverse
 * "cowardly-eagle-56" look via the `tool-card` class from globals.css.
 */
const SpotlightCard = React.forwardRef<HTMLDivElement, SpotlightCardProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={["tool-card rounded-2xl p-6 transition-transform duration-200", className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    );
  }
);
SpotlightCard.displayName = "SpotlightCard";

export { SpotlightCard };
export default SpotlightCard;
