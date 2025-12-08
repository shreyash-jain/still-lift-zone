"use client";

import { useEffect } from "react";

interface FlipCardProps {
  message: string;
  actionType: "ACTION" | "VISUALIZE" | "REPEAT";
  title: string;
  flipDelay?: number;
}

export default function FlipCard({
  message,
  actionType,
  title,
  flipDelay = 100,
}: FlipCardProps) {
  useEffect(() => {
    const triggerCardFlip = () => {
      const cardElement = document.getElementById("personalized-card");
      if (!cardElement) return;
      setTimeout(
        () => {
          cardElement.classList.add("is-flipped");
        },
        typeof flipDelay === "number" && !isNaN(flipDelay) ? flipDelay : 100
      );
    };
    // @ts-expect-error : define a type for this
    window.triggerCardFlip = triggerCardFlip;
    triggerCardFlip();
  }, []);

  return (
    <div className="sl-card-wrapper">
      <div className="sl-card-container">
        <div className="sl-card" id="personalized-card">
          <div className="sl-card-face sl-card-back">
            <p>StillLift</p>
          </div>
          <div className="sl-card-face sl-card-front">
            <h3 className="sl-card-title">{actionType || "ACTION"}</h3>
            <p className="sl-card-message">{message}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Centering and Full Screen Overlay */
        .sl-card-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.05);
          z-index: 50;
          pointer-events: none;
        }

        /* 3D Space and Fixed Dimensions */
        .sl-card-container {
          perspective: 1000px;
          perspective-origin: 50% 50%;
          width: 300px;
          height: 400px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* The element that rotates */
        .sl-card {
          width: 100%;
          height: 100%;
          position: relative;
          transition: transform 0.8s ease-in-out;
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
          border-radius: 12px;
          will-change: transform;
          transform: translateZ(0);
        }

        /* Both Front and Back faces */
        .sl-card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          box-sizing: border-box;
          overflow: hidden;
        }

        .sl-card-back {
          background-color: #ffffff;
        }

        .sl-card-front {
          transform: rotateY(180deg);
          -webkit-transform: rotateY(180deg);
          background-color: #e6f7ff;
        }

        /* Triggered class to execute the flip */
        .sl-card.is-flipped {
          transform: rotateY(180deg);
          -webkit-transform: rotateY(180deg);
        }

        .sl-card-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
        }

        .sl-card-message {
          margin: 0;
          font-size: 1rem;
          color: #334155;
          text-align: center;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
