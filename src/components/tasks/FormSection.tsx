import React from "react";
import CheckIcon from "@/assets/svg/CheckIcon";
import XIcon from "@/assets/svg/XIcon";
import { TaskFormState } from "@/hooks/useTaskForm";
import CustomSelect, { CustomSelectOption } from "../common/CustomSelect";
import Link from "next/link";

interface FormSectionProps {
  formState: TaskFormState;
  errors: Partial<TaskFormState>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validateSlug: (slug: string) => void;
  walletOptions: CustomSelectOption[];
  setFormState: React.Dispatch<React.SetStateAction<TaskFormState>>;
}

const FormSection: React.FC<FormSectionProps> = ({
  formState,
  errors,
  handleChange,
  validateSlug,
  walletOptions,
  setFormState,
}) => {
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
            onChange={(selectedOption) =>
              setFormState((prev) => ({
                ...prev,
                selectedWallet: selectedOption,
              }))
            }
          />
          <Link
            href={"/dashboard/wallet"}
            className="text-sm text-Brand/Brand-1 mt-0.5 ml-2 block italic"
          >
            create wallet
          </Link>
        </div>
        {errors.selectedWallet && (
          <p className="text-red-500 text-sm mt-1">{errors.selectedWallet}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="minFloorPricePercentage"
          className="block text-sm font-medium mb-2"
        >
          Min Bid Floor Price Percentage (%)
        </label>
        <input
          inputMode="numeric"
          type="text"
          id="minFloorPricePercentage"
          name="minFloorPricePercentage"
          onChange={handleChange}
          value={formState.minFloorPricePercentage}
          placeholder="10"
          className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] ${
            errors.minFloorPricePercentage ? "border-red-500" : ""
          }`}
          required
          autoComplete="off"
        />
        {errors.minFloorPricePercentage && (
          <p className="text-red-500 text-sm mt-1">
            {errors.minFloorPricePercentage}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="maxFloorPricePercentage"
          className="block text-sm font-medium mb-2"
        >
          Max Bid Floor Price Percentage (%)
        </label>
        <input
          inputMode="numeric"
          type="text"
          id="maxFloorPricePercentage"
          name="maxFloorPricePercentage"
          onChange={handleChange}
          value={formState.maxFloorPricePercentage}
          placeholder="80"
          className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] ${
            errors.maxFloorPricePercentage ? "border-red-500" : ""
          }`}
          required
          autoComplete="off"
        />
        {errors.maxFloorPricePercentage && (
          <p className="text-red-500 text-sm mt-1">
            {errors.maxFloorPricePercentage}
          </p>
        )}
      </div>
    </>
  );
};

export default FormSection;
