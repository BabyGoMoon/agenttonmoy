"use client";

import { useState } from "react";

const SocialCardPopup = ({ onClose }: { onClose: () => void }) => {
  return (
    <>
      <div className="popup-overlay">
        <div className="social-card-popup">
          <h2 className="text-xl font-bold text-center mb-4">Follow Me</h2>
          <div className="social-icons flex justify-between">
            <div className="social-icon p-3 bg-pink-600 rounded-full">
              <svg
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                height="30"
                width="30"
                viewBox="0 0 24 24"
                className="text-white"
              >
                <path
                  d="M9 3C7.4 3 6 4.4 6 6s1.4 3 3 3 3-1.4 3-3-1.4-3-3-3zm0 4.2C8 7.2 7.2 7 7 7S6 7.2 6 7.5 6.2 8 7 8s1-.2 1-.5zM15 9.2c0 2.8-1.4 5.3-3.6 6.9-2.1 1.6-4.7 2.5-7.3 2.5-5 0-9-4-9-9s4-9 9-9c2.4 0 4.7 1 6.5 2.8.2.2.5.2.7 0s.3-.4.2-.6C21.6 2.4 18 0 14 0c-5 0-9 4-9 9s4 9 9 9c5 0 9-4 9-9zm-1.2 1.8l-1.1-1.1c-.1-.1-.2-.1-.3 0l-2.2 2.2c-.1.1-.1.3 0 .4s.3.1.4 0l1.4-1.4c1.2.7 2.5 1.1 3.8 1.1.5 0 .9-.3.9-.8s-.4-.9-.8-.9zm-8.2 4.8c1.7 0 3.4-.5 4.7-1.4 1.3-.8 2.3-2 2.9-3.5l1.4 1.4c-.8 2.3-2.7 4.1-5 5-1.7.7-3.5 1.1-5.3 1.1-2.7 0-5.2-.6-7.6-1.7.8 1.8 2.3 3.1 4.1 3.8 1.6.7 3.3 1.1 5 1.1zm5.8-5.8c0 1.8-.7 3.4-1.8 4.6-1.1 1.1-2.7 1.8-4.6 1.8-.6 0-1.2-.1-1.7-.2l1.7-1.7c.2-.2.1-.5-.1-.7-.3-.2-.7-.1-.7.1l-1.4 1.4c.3-.8.5-1.7.5-2.6 0-2.1-1.2-4.1-3.1-5.1-.2-.2-.5-.3-.7-.1-.2.3-.2.5-.1.7 1.3 1 2.1 2.5 2.1 4z"
                />
              </svg>
            </div>
            <div className="social-icon p-3 bg-blue-500 rounded-full">
              <svg
                height="30"
                width="30"
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                viewBox="0 0 24 24"
              >
                <path d="M23.0 5.5c-1 0-1.9 0.3-2.7 0.8-.8 0.5-1.4 1.2-1.8 1.9-.2-.1-.5-.1-.7-.1-1.3 0-2.5 0.4-3.4 1.1-.7.6-1.3 1.3-1.6 2.2-.2-.1-.5-.2-.7-.2-.7 0-1.3 0.3-1.8 0.8-.8.6-1.3 1.4-1.6 2.3-.3.7-.4 1.5-.4 2.3 0 1.1 0.4 2.1 1.1 3 0.7 0.9 1.6 1.6 2.7 1.8-1.5 0.1-3 0.5-4.4 1.1-.3.2-.6.4-0.9 0.6-.2.1-.4.2-.7.2-.2 0-.4 0-.6-.1-1.6-0.6-2.7-1.7-3.1-3.2-.2-.7-.2-1.5-.2-2.3 0-1.1 0.3-2.2 0.9-3.1 0.5-0.8 1.3-1.4 2.2-1.8-.2-.5-.3-1-.3-1.5 0-1.3 0.5-2.6 1.4-3.5-.7 0.3-1.3 0.7-1.9 1.2-.7.5-1.3 1.1-1.9 1.8-.7 0.6-1.2 1.4-1.5 2.2-.2-.1-.4-.1-.7-.1-.5 0-.9 0.2-1.2 0.6-.7 0.8-0.9 1.8-0.9 2.8 0 2.3 1.5 4.2 3.6 4.8 2.3 0.7 5 0.4 6.9-0.7 0.4-.3 0.8-.6 1.1-1.1-.4-.1-.9-.2-1.3-.2-1.2 0-2.3 0.4-3.1 1.1-.4 0.4-.8 0.9-1.1 1.4 0 0 0 0 0 0z" />
              </svg>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-full"
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .social-card-popup {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .social-icon {
          cursor: pointer;
          margin: 10px;
          padding: 15px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .social-icon svg {
          width: 30px;
          height: 30px;
        }
      `}</style>
    </>
  );
};

export default SocialCardPopup;
