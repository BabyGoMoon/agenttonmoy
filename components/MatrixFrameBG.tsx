"use client";

import React from "react";

/**
 * Matrix rain that lives INSIDE a frame/panel.
 * It’s pointer-events:none and clipped by parent’s border radius.
 */
export default function MatrixFrameBG({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`mf-container pointer-events-none absolute inset-0 ${className}`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div className="mf-pattern" key={i}>
          {Array.from({ length: 40 }).map((_, j) => (
            <div className="mf-col" key={j} />
          ))}
        </div>
      ))}
    </div>
  );
}
