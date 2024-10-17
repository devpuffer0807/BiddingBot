import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  activeColor?: string;
  inactiveColor?: string;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  activeColor = "#7F56D9",
  inactiveColor = "#D1D5DB",
  disabled = false,
}) => {
  return (
    <label
      className={`inline-flex items-center cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={disabled ? undefined : onChange}
        disabled={disabled}
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
