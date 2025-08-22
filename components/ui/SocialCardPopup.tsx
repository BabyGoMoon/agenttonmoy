// components/ui/SocialCardPopup.tsx

"use client";

import { useState } from "react";

const SocialCardPopup = () => {
  const [isPopupOpen, setPopupOpen] = useState(false);

  const togglePopup = () => {
    setPopupOpen(!isPopupOpen);
  };

  return (
    <>
      <div>
        <button onClick={togglePopup} className="computer-icon-button">
          💻
        </button>

        {isPopupOpen && (
          <div className="popup-overlay">
            <div className="social-card-popup">
              {/* Insert your social card HTML and SVG here */}
            </div>
            <button onClick={togglePopup} className="close-button">
              Close
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .social-card-popup {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  );
};

export default SocialCardPopup;
