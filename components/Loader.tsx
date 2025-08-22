"use client";
import { useEffect, useState } from "react";
import "./loader.css"; // put CSS here (step 2)

export default function Loader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fake delay for loader (2s). You can remove this or tie it to real loading
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-[9999]">
      <div className="scene">
        <div className="spinner">
          <div className="face front">{icon}</div>
          <div className="face back">{icon}</div>
          <div className="face left">{icon}</div>
          <div className="face right">{icon}</div>
          <div className="face top">{icon}</div>
          <div className="face bottom">{icon}</div>
        </div>
      </div>
    </div>
  );
}

const icon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      stroke="#00FF0D"
      d="M7 8C7 5.24 9.24 3 12 3C14.76 3 17 5.24 17 8C17 9.64 16.21 11.09 15 12C14.16 12.63 12 14 12 17"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      stroke="#00FF0D"
      d="M12 21V21.01"
    />
  </svg>
);
