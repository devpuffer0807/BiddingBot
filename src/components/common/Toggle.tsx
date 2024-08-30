import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  activeColor?: string;
  inactiveColor?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  activeColor = "#7F56D9",
  inactiveColor = "#D1D5DB",
}) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      <div
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out`}
        style={{ backgroundColor: checked ? activeColor : inactiveColor }}
      >
        <div
          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${
            checked ? "transform translate-x-5" : ""
          }`}
        ></div>
      </div>
    </label>
  );
};

export default Toggle;
