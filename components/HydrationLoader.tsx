"use client";

import { useEffect, useState } from "react";

export default function HydrationLoader({ children }: { children: React.ReactNode }) {
  // Optional minimum visible time to avoid flash (ms)
  const MIN_TIME = 500;
  const [ready, setReady] = useState(false);
  const [allowHide, setAllowHide] = useState(false);

  // Mark hydration complete on mount
  useEffect(() => {
    setReady(true);
  }, []);

  // Ensure loader is visible at least MIN_TIME
  useEffect(() => {
    const t = setTimeout(() => setAllowHide(true), MIN_TIME);
    return () => clearTimeout(t);
  }, []);

  const showLoader = !(ready && allowHide);

  return (
    <>
      {showLoader && (
        <div className="site-loader" id="site-loader">
          <div className="scene">
            <div className="spinner">
              <div className="face front">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#00FF0D" d="M7 8C7 5.24 9.24 3 12 3C14.76 3 17 5.24 17 8C17 9.64 16.21 11.09 15 12C14.16 12.63 12 14 12 17" />
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#00FF0D" d="M12 21V21.01" />
                </svg>
              </div>
              <div className="face back">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#00FF0D" d="M7 8C7 5.24 9.24 3 12 3C14.76 3 17 5.24 17 8C17 9.64 16.21 11.09 15 12C14.16 12.63 12 14 12 17" />
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#00FF0D" d="M12 21V21.01" />
                </svg>
              </div>
              <div className="face left">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#00FF0D" d="M7 8C7 5.24 9.24 3 12 3C14.76 3 17 5.24 17 8C17 9.64 16.21 11.09 15 12C14.16 12.63 12 14 12 17" />
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#00FF0D" d="M12 21V21.01" />
                </svg>
              </div>
              <div className="face right">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#00FF0D" d="M7 8C7 5.24 9.24 3 12 3C14.76 3 17 5.24 17 8C17 9.64 16.21 11.09 15 12C14.16 12.63 12 14 12 17" />
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#00FF0D" d="M12 21V21.01" />
                </svg>
              </div>
              <div className="face top">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#00FF0D" d="M7 8C7 5.24 9.24 3 12 3C14.76 3 17 5.24 17 8C17 9.64 16.21 11.09 15 12C14.16 12.63 12 14 12 17" />
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#00FF0D" d="M12 21V21.01" />
                </svg>
              </div>
              <div className="face bottom">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#00FF0D" d="M7 8C7 5.24 9.24 3 12 3C14.76 3 17 5.24 17 8C17 9.64 16.21 11.09 15 12C14.16 12.63 12 14 12 17" />
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#00FF0D" d="M12 21V21.01" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
