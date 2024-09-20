import React, { useState } from "react";
import CheckIcon from "@/assets/svg/CheckIcon";
import XIcon from "@/assets/svg/XIcon";
import { TaskFormState } from "@/hooks/useTaskForm";
import CustomSelect, { CustomSelectOption } from "../common/CustomSelect";
import Toggle from "../common/Toggle";
import WalletBalanceFetcher from "../common/WalletBalanceFetcher";

interface FormSectionProps {
  formState: TaskFormState;
  errors: Partial<TaskFormState>;
  debouncedValidateSlug: (slug: string) => void;
  walletOptions: CustomSelectOption[];
  setFormState: React.Dispatch<React.SetStateAction<TaskFormState>>;
  onWalletModalOpen: () => void;
}

const FormSection: React.FC<FormSectionProps> = ({
  formState,
  errors,
  debouncedValidateSlug,
  walletOptions,
  setFormState,
  onWalletModalOpen,
}) => {
  const [updatedWalletOptions, setUpdatedWalletOptions] =
    useState(walletOptions);

  const priceTypeOptions: CustomSelectOption[] = [
    { value: "percentage", label: "%" },
    { value: "eth", label: "ETH" },
  ];

  const durationTypeOptions: CustomSelectOption[] = [
    { value: "minutes", label: "Min" },
    { value: "hours", label: "Hours" },
    { value: "days", label: "Days" },
  ];

  const updateOutbidOptions = (
    updatedOptions: Partial<typeof formState.outbidOptions>
  ) => {
    setFormState((prev) => {
      const newOutbidOptions = {
        ...prev.outbidOptions,
        ...updatedOptions,
      };

      if (!newOutbidOptions.outbid) {
        newOutbidOptions.counterbid = false; // Disable counterbidding if outbidding is not true
      }

      if (!newOutbidOptions.outbid && !newOutbidOptions.counterbid) {
        newOutbidOptions.blurOutbidMargin = null;
        newOutbidOptions.openseaOutbidMargin = null;
        newOutbidOptions.magicedenOutbidMargin = null;
      }

      return {
        ...prev,
        outbidOptions: newOutbidOptions,
      };
    });
  };

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
      selectedTraits: {},
      traits: {
        categories: {},
        counts: {},
      },
      blurValid: false,
      magicEdenValid: false,
      slugValid: false,
    }));
    // alert("slug changed");
    if (value.length >= 3) {
      debouncedValidateSlug(value);
    } else {
      setFormState((prev) => ({ ...prev, slugValid: false }));
    }
  };

  const handleBidDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      bidDuration: {
        ...prev.bidDuration,
        [name]: value,
      },
    }));
  };

  const validateBidDuration = (value: number, unit: string) => {
    if (unit === "minutes" && value < 15) return false;
    if (unit === "hours" && value < 0.25) return false;
    if (unit === "days" && value < 0.011) return false;
    return true;
  };

  const handleTokenIdsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const ranges = value.split(",").map((range) => range.trim());
    const numbers: number[] = [];
    const uniqueNumbers = new Set<number>(); // Use a Set to store unique numbers

    ranges.forEach((range) => {
      const parts = range.split("-");
      if (parts.length === 1) {
        const num = parseInt(parts[0].trim());
        if (!isNaN(num)) uniqueNumbers.add(num); // Add to Set
      } else if (parts.length === 2) {
        const start = parseInt(parts[0].trim());
        const end = parseInt(parts[1].trim());
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            uniqueNumbers.add(i); // Add to Set
          }
        }
      }
    });

    setFormState((prev) => ({
      ...prev,
      tokenIds: Array.from(uniqueNumbers), // Convert Set back to array
    }));
  };

  return (
    <>
      <WalletBalanceFetcher
        walletOptions={walletOptions}
        onBalancesFetched={setUpdatedWalletOptions}
      />
      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-2">
          Collection slug <span className="text-red-500">*</span>
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
          Select Wallet <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <CustomSelect
            options={updatedWalletOptions}
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
          {formState.outbidOptions.outbid || formState.outbidOptions.counterbid
            ? "Min Bid Price "
            : "Bid Price"}

          <span className="text-red-500">*</span>
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

      {formState.outbidOptions.outbid || formState.outbidOptions.counterbid ? (
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium mb-2">
            Max Bid Price
            <span className="text-red-500">*</span>
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
      ) : (
        <div></div>
      )}

      <div className="col-span-2 flex items-center mb-8 gap-2">
        <Toggle
          checked={formState.outbidOptions.outbid}
          onChange={() =>
            updateOutbidOptions({ outbid: !formState.outbidOptions.outbid })
          }
        />
        <span
          className="text-sm cursor-pointer"
          onClick={() =>
            updateOutbidOptions({
              outbid: !formState.outbidOptions.outbid,
            })
          }
        >
          {formState.outbidOptions.outbid
            ? "Disable Outbidding"
            : "Enable Outbidding"}
        </span>
      </div>

      <div>
        <label htmlFor="bidDuration" className="block text-sm font-medium mb-2">
          Bid Duration
        </label>
        <div className="flex items-center">
          <input
            inputMode="numeric"
            type="number"
            id="bidDuration"
            name="value"
            onChange={handleBidDurationChange}
            value={formState.bidDuration.value || 15}
            placeholder="Duration"
            className="w-full p-3 rounded-l-lg border border-r-0 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night]"
            required
            autoComplete="off"
          />
          <CustomSelect
            options={durationTypeOptions}
            value={formState.bidDuration.unit || "minutes"}
            onChange={(value) =>
              handleBidDurationChange({
                target: { name: "unit", value },
              } as React.ChangeEvent<HTMLInputElement>)
            }
            className="w-20 ml-2"
          />
        </div>
        {errors.bidDuration?.value && (
          <p className="text-red-500 text-sm mt-1">
            {errors.bidDuration.value}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="tokenIds" className="block text-sm font-medium mb-2">
          Token Range
        </label>
        <div className="flex items-center">
          <input
            inputMode="text"
            type="text"
            id="tokenIds"
            name="tokenIds"
            onChange={handleTokenIdsChange}
            placeholder="1 - 777, 86, 999 - 1456"
            className="w-full p-3 rounded-l-lg border border-r-0 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night]"
            autoComplete="off"
          />
        </div>
      </div>
    </>
  );
};

export default FormSection;
