import ChevronDown from "@/assets/svg/ChevronDown";
import { useState } from "react";

export type CustomSelectOption = {
  value: string;
  label: string;
  address?: string;
  etherBalance?: string;
  wethBalance?: string;
  blurBalance?: string;
};

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="w-full min-w-20 border rounded-lg shadow-sm p-3 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] text-left flex justify-between items-center hover:bg-Neutral/Neutral-400-[night] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? <span>{selectedOption.label}</span> : placeholder}
        <ChevronDown />
      </button>
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 border rounded-lg shadow-lg border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night]">
          {options.map((option) => (
            <li
              key={option.value}
              className="p-4 cursor-pointer transition-colors hover:bg-Brand/Brand-1"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <div className="hover:text-Primary-500-[night] transition-colors">
                <div className="text-sm">{option.label}</div>
                {option.address && (
                  <div className="text-xs text-Neutral/Neutral-600-[night]">
                    {option.address}
                  </div>
                )}
                <div className="flex flex-col gap-1 text-sm mt-2">
                  {option.etherBalance && (
                    <div className="text-sm text-Neutral/Neutral-600-[night]">
                      {option.etherBalance}
                    </div>
                  )}
                  {option.wethBalance && (
                    <div className="text-sm text-Neutral/Neutral-600-[night]">
                      {option.wethBalance}
                    </div>
                  )}
                  {option.blurBalance && (
                    <div className="text-sm text-Neutral/Neutral-600-[night]">
                      {option.blurBalance}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
