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
      bidPrice: {
        ...prev.bidPrice,
        minType: selectedValue as "percentage" | "eth",
        maxType: selectedValue as "percentage" | "eth",
      },
    }));
  };

  const handleBidPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      bidPrice: {
        ...prev.bidPrice,
        [name.split(".")[1]]: value,
      },
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormState((prev) => ({
      ...prev,
      contract: {
        ...prev.contract,
        slug: value,
      },
      slugDirty: true,
    }));
    if (value.length >= 3) {
      validateSlug(value);
    } else {
      setFormState((prev) => ({ ...prev, slugValid: false }));
    }
  };

  const handleContractAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    setFormState((prev) => ({
      ...prev,
      contract: {
        ...prev.contract,
        contractAddress: value,
      },
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
            name="contract.slug"
            onChange={handleSlugChange}
            value={formState.contract.slug}
            placeholder="collection slug"
            className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] ${
              errors.contract?.slug ? "border-red-500" : ""
            }`}
            required
            autoComplete="off"
          />
          {formState.slugDirty && formState.contract.slug.length > 0 && (
            <div className="absolute right-3 top-[50%] transform -translate-y-1/2">
              {errors.contract?.slug || !formState.slugValid ? (
                <XIcon />
              ) : (
                <CheckIcon />
              )}
            </div>
          )}
          {errors.contract?.slug && (
            <p className="text-red-500 text-sm mt-1">{errors.contract.slug}</p>
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
            value={formState.wallet?.address || ""}
            onChange={(selectedValue) =>
              setFormState((prev) => ({
                ...prev,
                wallet: {
                  ...prev.wallet,
                  address: selectedValue,
                },
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
        {errors.wallet?.address && (
          <p className="text-red-500 text-sm mt-1">{errors.wallet.address}</p>
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
            name={"bidPrice.min"}
            onChange={handleBidPriceChange}
            value={formState.bidPrice.min}
            placeholder={
              formState.bidPrice.minType === "percentage" ? "10" : "0.1"
            }
            className={`w-full p-3 rounded-l-lg border border-r-0 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] `}
            required
            autoComplete="off"
          />
          <CustomSelect
            options={priceTypeOptions}
            value={formState.bidPrice.minType}
            onChange={(value) => handlePriceTypeChange(value)}
            className="w-20 ml-2"
          />
        </div>
        {errors.bidPrice?.min && (
          <p className="text-red-500 text-sm mt-1">{errors.bidPrice.min}</p>
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
            name={"bidPrice.max"}
            onChange={handleBidPriceChange}
            value={formState.bidPrice.max}
            placeholder={
              formState.bidPrice.maxType === "percentage" ? "80" : "1"
            }
            className={`w-full p-3 rounded-l-lg border border-r-0 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night]`}
            required
            autoComplete="off"
          />
          <CustomSelect
            options={priceTypeOptions}
            value={formState.bidPrice.maxType}
            onChange={(value) => handlePriceTypeChange(value)}
            className="w-20 ml-2"
          />
        </div>
        {errors.bidPrice?.max && (
          <p className="text-red-500 text-sm mt-1">{errors.bidPrice.max}</p>
        )}
      </div>
    </>
  );
};

export default FormSection;
