"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  /** Minimum time (ms) to keep the intro visible for a nice “splash” feel */
  minDuration?: number;
  /** If true (default), show intro only once per browser tab session */
  showOncePerSession?: boolean;
  children: React.ReactNode;
};

const Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeWidth="2"
      stroke="#00FF0D"
      d="M7 8C7 5.24 9.24 3 12 3C14.76 3 17 5.24 17 8C17 9.64 16.21 11.09 15 12C14.16 12.63 12 14 12 17"
    />
    <path
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeWidth="2"
      stroke="#00FF0D"
      d="M12 21V21.01"
    />
  </svg>
);

export default function HydrationLoader({
  children,
  minDuration = 1200,
  showOncePerSession = true,
}: Props) {
  const [renderOverlay, setRenderOverlay] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // Only show once per session (tab) unless disabled
    const key = "introSeen";
    const seen = typeof window !== "undefined" ? sessionStorage.getItem(key) : "1";
    const shouldShow = showOncePerSession ? !seen : true;

    if (!shouldShow) return;

    setRenderOverlay(true);
    document.body.dataset.introActive = "true"; // lock scroll

    const t = setTimeout(() => setClosing(true), minDuration);
    return () => clearTimeout(t);
  }, [minDuration, showOncePerSession]);

  // When closing -> fade class, then remove + unlock body
  useEffect(() => {
    if (!closing) return;
    const el = document.getElementById("intro-overlay");
    el?.classList.add("fade-out");

    const end = setTimeout(() => {
      setRenderOverlay(false);
      delete document.body.dataset.introActive;
      try {
        sessionStorage.setItem("introSeen", "1");
      } catch {}
    }, 340); // keep in sync with CSS fade timing

    return () => clearTimeout(end);
  }, [closing]);

  const overlay = (
    <div className="intro-overlay" id="intro-overlay" aria-hidden="true">
      <div className="intro-scene">
        <div className="intro-spinner">
          <div className="intro-face front"><Icon /></div>
          <div className="intro-face back"><Icon /></div>
          <div className="intro-face left"><Icon /></div>
          <div className="intro-face right"><Icon /></div>
          <div className="intro-face top"><Icon /></div>
          <div className="intro-face bottom"><Icon /></div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {children}
      {renderOverlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
