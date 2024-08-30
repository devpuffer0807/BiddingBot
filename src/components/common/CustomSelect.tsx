import ChevronDown from "@/assets/svg/ChevronDown";
import { useState } from "react";

const CustomSelect = ({ options, value, onChange }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full border rounded-lg shadow-sm p-4 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] text-left flex justify-between items-center hover:bg-Neutral/Neutral-400-[night] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? (
          <span>{selectedOption.label}</span>
        ) : (
          "Select a wallet"
        )}
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
                <div className="text-xs text-Neutral/Neutral-600-[night]">
                  {option.address}
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

type CustomSelectOption = {
  value: string;
  label: string;
  address: string;
};

// Update the CustomSelectProps import if it doesn't exist
interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
}
