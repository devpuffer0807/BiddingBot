import React from "react";
import CheckIcon from "@/assets/svg/CheckIcon";
import XIcon from "@/assets/svg/XIcon";
import { TaskFormState } from "@/hooks/useTaskForm";
import CustomSelect, { CustomSelectOption } from "../common/CustomSelect";

interface FormSectionProps {
  formState: TaskFormState;
  errors: Partial<TaskFormState>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validateSlug: (slug: string) => void;
  walletOptions: CustomSelectOption[];
  setFormState: React.Dispatch<React.SetStateAction<TaskFormState>>;
  onWalletModalOpen: () => void;
}

const FormSection: React.FC<FormSectionProps> = ({
  formState,
  errors,
  handleChange,
  validateSlug,
  walletOptions,
  setFormState,
  onWalletModalOpen,
}) => {
  const priceTypeOptions: CustomSelectOption[] = [
    { value: "percentage", label: "%" },
    { value: "eth", label: "ETH" },
  ];

  const handlePriceTypeChange = (selectedValue: string) => {
    setFormState((prev) => ({
      ...prev,
      minPriceType: selectedValue as "percentage" | "eth",
      maxPriceType: selectedValue as "percentage" | "eth",
    }));
  };

  return (
    <>
      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-2">
          Collection slug
        </label>
        <div className="relative">
          <input
            type="text"
            id="slug"
            name="slug"
            onChange={(e) => {
              handleChange(e);
              if (e.target.value) {
                validateSlug(e.target.value);
              }
            }}
            value={formState.slug}
            placeholder="collection slug"
            className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] ${
              errors.slug ? "border-red-500" : ""
            }`}
            required
            autoComplete="off"
          />
          {formState.slugDirty && formState.slug.length > 0 && (
            <div className="absolute right-3 top-[50%] transform -translate-y-1/2">
              {errors.slug || !formState.slugValid ? <XIcon /> : <CheckIcon />}
            </div>
          )}
          {errors.slug && (
            <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
          )}
        </div>
      </div>
      <div>
        <label
          htmlFor="walletSelection"
          className="block text-sm font-medium mb-2"
        >
          Select Wallet
        </label>
        <div className="relative">
          <CustomSelect
            options={walletOptions}
            value={formState.selectedWallet}
            onChange={(selectedValue) =>
              setFormState((prev) => ({
                ...prev,
                selectedWallet: selectedValue,
              }))
            }
            placeholder="Select a wallet"
          />
          <button
            onClick={onWalletModalOpen}
            className="text-sm text-Brand/Brand-1 mt-0.5 ml-2 block italic"
          >
            create wallet
          </button>
        </div>
        {errors.selectedWallet && (
          <p className="text-red-500 text-sm mt-1">{errors.selectedWallet}</p>
        )}
      </div>
      <div>
        <label htmlFor="minPrice" className="block text-sm font-medium mb-2">
          Min Bid Price
        </label>
        <div className="flex items-center">
          <input
            inputMode="numeric"
            type="number"
            id="minPrice"
            name={"minPrice"}
            onChange={handleChange}
            value={formState.minPrice}
            placeholder={formState.minPriceType === "percentage" ? "10" : "0.1"}
            className={`w-full p-3 rounded-l-lg border border-r-0 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] `}
            required
            autoComplete="off"
          />
          <CustomSelect
            options={priceTypeOptions}
            value={formState.minPriceType}
            onChange={handlePriceTypeChange}
            className="w-20 ml-2"
          />
        </div>
        {errors.minPrice && (
          <p className="text-red-500 text-sm mt-1">{errors.minPrice}</p>
        )}
      </div>
      <div>
        <label htmlFor="maxPrice" className="block text-sm font-medium mb-2">
          Max Bid Price
        </label>
        <div className="flex items-center">
          <input
            inputMode="numeric"
            type="number"
            id="maxPrice"
            name={"maxPrice"}
            onChange={handleChange}
            value={formState.maxPrice}
            placeholder={formState.maxPriceType === "percentage" ? "80" : "1"}
            className={`w-full p-3 rounded-l-lg border border-r-0 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night]`}
            required
            autoComplete="off"
          />
          <CustomSelect
            options={priceTypeOptions}
            value={formState.maxPriceType}
            onChange={handlePriceTypeChange}
            className="w-20 ml-2"
          />
        </div>
        {errors.maxPrice && (
          <p className="text-red-500 text-sm mt-1">{errors.maxPrice}</p>
        )}
        {errors.maxPriceType && (
          <p className="text-red-500 text-sm mt-1">{errors.maxPriceType}</p>
        )}
      </div>
    </>
  );
};

export default FormSection;
