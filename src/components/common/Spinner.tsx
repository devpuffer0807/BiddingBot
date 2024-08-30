import React from "react";

interface SpinnerProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 60,
  color = "#7364DB",
  strokeWidth = 6,
  className = "",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", margin: "auto" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeOpacity="0.25"
      />
      <circle
        className="spinner-circle"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * 0.75}
        strokeLinecap="round"
      />
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1.2s linear infinite;
        }

        .spinner-circle {
          transform-origin: 50% 50%;
        }
      `}</style>
    </svg>
  );
};

export default Spinner;
