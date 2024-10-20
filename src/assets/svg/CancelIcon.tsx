import React from "react";

const CancelIcon: React.FC = () => {
  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      fill="#FF0000"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <defs>
          <style>{`.cls-1{fill:none;stroke:#FF0000;stroke-linecap:round;stroke-linejoin:round;stroke-width:4px;}`}</style>
        </defs>
        <title></title>
        <g id="cross">
          <line className="cls-1" x1="7" x2="25" y1="7" y2="25"></line>
          <line className="cls-1" x1="7" x2="25" y1="25" y2="7"></line>
        </g>
      </g>
    </svg>
  );
};

export default CancelIcon;
