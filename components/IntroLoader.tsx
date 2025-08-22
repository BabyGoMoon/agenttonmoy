"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#00FF0D"
      d="M7 8C7 5.24 9.24 3 12 3C14.76 3 17 5.24 17 8C17 9.64 16.21 11.09 15 12C14.16 12.63 12 14 12 17" />
    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#00FF0D"
      d="M12 21V21.01" />
  </svg>
);

export default function IntroLoader({ minDuration = 1200 }: { minDuration?: number }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    // lock scroll while intro is shown
    document.body.dataset.introActive = "true";

    // keep the intro for a minimum duration (nice "intro" feel)
    const t = setTimeout(() => setVisible(false), minDuration);
    return () => clearTimeout(t);
  }, [minDuration]);

  // fade out and remove from DOM
  useEffect(() => {
    if (!visible) {
      const el = document.getElementById("intro-overlay");
      if (el) {
        el.classList.add("fade-out");
        const end = setTimeout(() => {
          el.remove();
          delete document.body.dataset.introActive;
        }, 340);
        return () => clearTimeout(end);
      }
    }
  }, [visible]);

  if (!mounted || !visible) return null;

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

  // Use a portal so the overlay sits at the very end of <body>, above all your frames
  return createPortal(overlay, document.body);
}
