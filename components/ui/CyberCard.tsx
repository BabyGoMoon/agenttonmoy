"use client";

import Link from "next/link";
import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  href?: string;
  icon?: React.ReactNode; // you pass an emoji like "🔍" if you want
  cta?: string;           // (optional) ignored; whole card is clickable
  className?: string;     // tailwind extras if needed
};

/**
 * Exact structure required by the Uiverse "cowardly-eagle-56" effect,
 * but parametrized for your tool tiles.
 * CSS is global (see step 2).
 */
export default function CyberCard({
  title,
  subtitle,
  href,
  icon,
  className = "",
}: Props) {
  const Container = ({ children }: { children: React.ReactNode }) =>
    href ? (
      <Link href={href} className={`block ${className}`} prefetch>
        {children}
      </Link>
    ) : (
      <div className={className}>{children}</div>
    );

  return (
    <Container>
      <div className="cybercard-container noselect">
        <div className="canvas">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className={`tracker tr-${i + 1}`} />
          ))}

          <div className="cyber-card">
            <div className="card-content">
              <div className="card-glare" />

              {/* animated thin lines */}
              <div className="cyber-lines">
                <span></span><span></span><span></span><span></span>
              </div>

              {/* prompt text */}
              <p className="cc-prompt">HOVER ME</p>

              {/* big title */}
              <div className="title">
                {icon ? <span style={{ marginRight: 6 }}>{icon}</span> : null}
                {title.replace(/\s/g, "\n")}
              </div>

              {/* glowing blobs */}
              <div className="glowing-elements">
                <div className="glow-1"></div>
                <div className="glow-2"></div>
                <div className="glow-3"></div>
              </div>

              {/* bottom subtitle */}
              <div className="subtitle">
                <span>{subtitle ?? "INTERACTIVE"}</span>
                <span className="highlight">3D EFFECT</span>
              </div>

              {/* floating particles */}
              <div className="card-particles">
                <span></span><span></span><span></span>
                <span></span><span></span><span></span>
              </div>

              {/* corner brackets + scan line */}
              <div className="corner-elements">
                <span></span><span></span><span></span><span></span>
              </div>
              <div className="scan-line"></div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
