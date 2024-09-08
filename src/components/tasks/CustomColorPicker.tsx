interface CustomColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const CustomColorPicker: React.FC<CustomColorPickerProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="relative">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div
        className="w-10 h-10 rounded-full"
        style={{ backgroundColor: value }}
      ></div>
    </div>
  );
};

export default CustomColorPicker;
