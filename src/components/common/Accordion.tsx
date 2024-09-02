import ChevronDown from "@/assets/svg/ChevronDown";
import React, { useState } from "react";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-Neutral/Neutral-Border-[night] rounded-lg mb-4">
      <button
        className="w-full text-left px-4 py-2 text-n-2 rounded-t-2xl flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <ChevronDown
          className={`transition-transform duration-300 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="p-10">{children}</div>}
    </div>
  );
};

export default Accordion;
