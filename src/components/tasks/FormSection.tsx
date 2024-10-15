import React, { useState } from "react";
import { TaskFormState } from "@/hooks/useTaskForm";
import CustomSelect, { CustomSelectOption } from "../common/CustomSelect";
import Toggle from "../common/Toggle";
import TraitSelector from "./TraitSelector";
import MarketplaceSection from "./MarketplaceSection";

interface FormSectionProps {
  formState: TaskFormState;
  errors: Partial<TaskFormState>;
  debouncedValidateSlug: (slug: string) => void;
  walletOptions: CustomSelectOption[];
  setFormState: React.Dispatch<React.SetStateAction<TaskFormState>>;
  onWalletModalOpen: () => void;
  handleTraitChange: (traits: Record<string, string[]>) => void;
  handleMarketplaceToggle: (marketplace: string) => void;
}

const FormSection: React.FC<FormSectionProps> = ({
  formState,
  errors,
  debouncedValidateSlug,
  walletOptions,
  setFormState,
  onWalletModalOpen,
  handleTraitChange,
  handleMarketplaceToggle,
}) => {
  const GENERAL_BID_PRICE = "GENERAL_BID_PRICE";
  const MARKETPLACE_BID_PRICE = "MARKETPLACE_BID_PRICE";

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
        newOutbidOptions.counterbid = false;
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

  const handlePriceTypeChange = (selectedValue: string, priceType: string) => {
    setFormState((prev) => ({
      ...prev,
      [priceType]: {
        //@ts-ignore
        ...prev[priceType],
        minType: selectedValue as "percentage" | "eth",
        maxType: selectedValue as "percentage" | "eth",
      },
    }));
  };

  const handleBidPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const priceType = name.split(".")[1];
    const priceCategory = name.split(".")[0];

    setFormState((prev) => ({
      ...prev,
      [priceCategory]: {
        // @ts-ignore
        ...prev[priceCategory],
        [priceType]: value,
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

  const handleLoopIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      loopInterval: {
        ...prev.loopInterval,
        [name]: value,
      },
    }));
  };

  const handleTokenIdsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const ranges = value.split(",").map((range) => range.trim());
    const uniqueNumbers = new Set<number>();

    ranges.forEach((range) => {
      const parts = range.split("-");
      if (parts.length === 1) {
        const num = parseInt(parts[0].trim());
        if (!isNaN(num)) uniqueNumbers.add(num);
      } else if (parts.length === 2) {
        const start = parseInt(parts[0].trim());
        const end = parseInt(parts[1].trim());
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            uniqueNumbers.add(i);
          }
        }
      }
    });

    setFormState((prev) => ({
      ...prev,
      tokenIds: Array.from(uniqueNumbers),
    }));
  };

  const handleBidTypeChange = (type: string) => {
    setFormState((prev) => ({
      ...prev,
      bidType: type,
    }));
  };

  const handleTraitSelect = (traits: Record<string, string[]>) => {
    handleTraitChange(traits);
  };

  const handleBidPriceTypeChange = (type: string) => {
    setFormState((prev) => ({
      ...prev,
      bidPriceType: type,
    }));
  };

  return (
    <>
      <MarketplaceSection
        formState={formState}
        errors={errors}
        handleMarketplaceToggle={handleMarketplaceToggle}
      />
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
        <label htmlFor="bidType" className="block text-sm font-medium mb-2">
          Bid Type
        </label>
        <div className="flex gap-8">
          <label className="inline-flex items-center cursor-pointer gap-2">
            <input
              type="radio"
              name="bidType"
              checked={formState.bidType === "collection"}
              onChange={() => handleBidTypeChange("collection")}
              className="hidden"
            />
            <span className="relative w-6 h-6 inline-block">
              <span
                className={`absolute inset-0 rounded-full border-2 ${
                  formState.bidType === "collection"
                    ? "border-[#7364DB]"
                    : "border-gray-400"
                }`}
              ></span>
              {formState.bidType === "collection" && (
                <span className="absolute inset-1.5 rounded-full bg-[#7364DB]"></span>
              )}
            </span>
            <p className="text-sm">Collection Offers</p>
          </label>

          <label className="inline-flex items-center cursor-pointer gap-2">
            <input
              type="radio"
              name="bidType"
              checked={formState.bidType === "token"}
              onChange={() => handleBidTypeChange("token")}
              className="hidden"
            />
            <span className="relative w-6 h-6 inline-block">
              <span
                className={`absolute inset-0 rounded-full border-2 ${
                  formState.bidType === "token"
                    ? "border-[#7364DB]"
                    : "border-gray-400"
                }`}
              ></span>
              {formState.bidType === "token" && (
                <span className="absolute inset-1.5 rounded-full bg-[#7364DB]"></span>
              )}
            </span>
            <p className="text-sm">Token Offers</p>
          </label>
        </div>
      </div>

      {formState.bidType === "token" ? (
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
          {errors.tokenIds && (
            <p className="text-red-500 text-sm mt-1">{errors.tokenIds}</p>
          )}
        </div>
      ) : (
        <div></div>
      )}

      {formState.traits &&
        Object.keys(formState.traits.categories).length > 0 && (
          <div className="col-span-2 mt-6">
            <h3 className="mb-2 font-medium">Select Traits</h3>
            <TraitSelector
              traits={formState.traits}
              onTraitSelect={handleTraitSelect}
              initialSelectedTraits={formState.selectedTraits}
            />
          </div>
        )}

      {formState.selectedMarketplaces.length < 1 ? (
        <div></div>
      ) : (
        <div className="flex items-center mb-2 gap-2 mt-4">
          <Toggle
            checked={formState.bidPriceType === MARKETPLACE_BID_PRICE}
            onChange={() =>
              handleBidPriceTypeChange(
                formState.bidPriceType === MARKETPLACE_BID_PRICE
                  ? GENERAL_BID_PRICE
                  : MARKETPLACE_BID_PRICE
              )
            }
          />
          <span
            className="text-sm cursor-pointer"
            onClick={() => {
              handleBidPriceTypeChange(
                formState.bidPriceType === MARKETPLACE_BID_PRICE
                  ? GENERAL_BID_PRICE
                  : MARKETPLACE_BID_PRICE
              );
            }}
          >
            Marketplace Specific Bid Amount
          </span>
        </div>
      )}

      <div className="flex items-center mb-2 gap-2 mt-4">
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

      {formState.bidPriceType === GENERAL_BID_PRICE ? (
        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium mb-2">
            {formState.outbidOptions.outbid ||
            formState.outbidOptions.counterbid
              ? "Min Bid Price "
              : "Bid Price"}

            <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <input
              min={0.005}
              step={0.0001}
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
              onChange={(value) => handlePriceTypeChange(value, "bidPrice")}
              className="w-20 ml-2"
            />
          </div>
          {errors.bidPrice?.min && (
            <p className="text-red-500 text-sm mt-1">{errors.bidPrice.min}</p>
          )}
        </div>
      ) : (
        <div></div>
      )}

      {formState.outbidOptions.outbid &&
      formState.bidPriceType === GENERAL_BID_PRICE ? (
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium mb-2">
            Max Bid Price
            <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <input
              min={0.005}
              step={0.0001}
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
              onChange={(value) => handlePriceTypeChange(value, "bidPrice")}
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

      {formState.bidPriceType === MARKETPLACE_BID_PRICE &&
      formState.selectedMarketplaces
        .map((m) => m.toLowerCase())
        .includes("opensea") ? (
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium mb-2">
            {formState.outbidOptions.outbid
              ? "Opensea Min Bid Price"
              : "Opensea Bid Price"}
          </label>
          <div className="flex items-center">
            <input
              inputMode="numeric"
              step={0.0001}
              min={0.005}
              type="number"
              id="openseaMinPrice"
              name={"openseaBidPrice.min"}
              onChange={handleBidPriceChange}
              value={formState.openseaBidPrice.min}
              placeholder={
                formState.openseaBidPrice.minType === "percentage" ? "80" : "1"
              }
              className={`w-full p-3 rounded-l-lg border border-r-0 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night]`}
              autoComplete="off"
              required={
                formState.selectedMarketplaces
                  .map((m) => m.toLowerCase())
                  .includes("opensea") &&
                formState.bidPriceType === MARKETPLACE_BID_PRICE
              }
            />
            <CustomSelect
              options={priceTypeOptions}
              value={formState.openseaBidPrice.minType}
              onChange={(value) =>
                handlePriceTypeChange(value, "openseaBidPrice")
              }
              className="w-20 ml-2"
            />
          </div>

          {errors.openseaBidPrice?.min && (
            <p className="text-red-500 text-sm mt-1">
              {errors.openseaBidPrice.min}
            </p>
          )}
        </div>
      ) : (
        <div></div>
      )}

      {formState.bidPriceType === MARKETPLACE_BID_PRICE &&
      formState.outbidOptions.outbid &&
      formState.selectedMarketplaces
        .map((m) => m.toLowerCase())
        .includes("opensea") ? (
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium mb-2">
            Opensea Max Bid Price
          </label>
          <div className="flex items-center">
            <input
              step={0.0001}
              min={0.005}
              inputMode="numeric"
              type="number"
              id="openseaMaxPrice"
              name={"openseaBidPrice.max"}
              onChange={handleBidPriceChange}
              value={formState.openseaBidPrice.max}
              placeholder={
                formState.openseaBidPrice.maxType === "percentage" ? "80" : "1"
              }
              className={`w-full p-3 rounded-l-lg border border-r-0 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night]`}
              autoComplete="off"
              required={
                formState.selectedMarketplaces
                  .map((m) => m.toLowerCase())
                  .includes("opensea") &&
                formState.bidPriceType === MARKETPLACE_BID_PRICE &&
                formState.outbidOptions.outbid
              }
            />
            <CustomSelect
              options={priceTypeOptions}
              value={formState.openseaBidPrice.maxType}
              onChange={(value) =>
                handlePriceTypeChange(value, "openseaBidPrice")
              }
              className="w-20 ml-2"
            />
          </div>

          {errors.openseaBidPrice?.max && (
            <p className="text-red-500 text-sm mt-1">
              {errors.openseaBidPrice.max}
            </p>
          )}
        </div>
      ) : (
        <div></div>
      )}

      {formState.bidPriceType === MARKETPLACE_BID_PRICE &&
      formState.selectedMarketplaces
        .map((m) => m.toLowerCase())
        .includes("blur") ? (
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium mb-2">
            {formState.outbidOptions.outbid
              ? "Blur Min Bid Price"
              : "Blur Bid Price"}
          </label>
          <div className="flex items-center">
            <input
              inputMode="numeric"
              step={0.01}
              min={0.01}
              type="number"
              id="blurMinPrice"
              name={"blurBidPrice.min"}
              onChange={handleBidPriceChange}
              value={formState.blurBidPrice.min}
              placeholder={
                formState.blurBidPrice.minType === "percentage" ? "80" : "1"
              }
              className={`w-full p-3 rounded-l-lg border border-r-0 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night]`}
              autoComplete="off"
              required={
                formState.selectedMarketplaces
                  .map((m) => m.toLowerCase())
                  .includes("blur") &&
                formState.bidPriceType === MARKETPLACE_BID_PRICE
              }
            />
            <CustomSelect
              options={priceTypeOptions}
              value={formState.blurBidPrice.minType}
              onChange={(value) => handlePriceTypeChange(value, "blurBidPrice")}
              className="w-20 ml-2"
            />
          </div>
          {errors.blurBidPrice?.max && (
            <p className="text-red-500 text-sm mt-1">
              {errors.blurBidPrice.max}
            </p>
          )}
        </div>
      ) : (
        <div></div>
      )}

      {formState.bidPriceType === MARKETPLACE_BID_PRICE &&
      formState.outbidOptions.outbid &&
      formState.selectedMarketplaces
        .map((m) => m.toLowerCase())
        .includes("blur") ? (
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium mb-2">
            Blur Max Bid Price
          </label>
          <div className="flex items-center">
            <input
              min={0.01}
              step={0.01}
              inputMode="numeric"
              type="number"
              id="blurMaxPrice"
              name={"blurBidPrice.max"}
              onChange={handleBidPriceChange}
              value={formState.blurBidPrice.max}
              placeholder={
                formState.blurBidPrice.maxType === "percentage" ? "80" : "1"
              }
              className={`w-full p-3 rounded-l-lg border border-r-0 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night]`}
              autoComplete="off"
              required={
                formState.selectedMarketplaces
                  .map((m) => m.toLowerCase())
                  .includes("blur") &&
                formState.bidPriceType === MARKETPLACE_BID_PRICE &&
                formState.outbidOptions.outbid
              }
            />
            <CustomSelect
              options={priceTypeOptions}
              value={formState.blurBidPrice.maxType}
              onChange={(value) => handlePriceTypeChange(value, "blurBidPrice")}
              className="w-20 ml-2"
            />
          </div>
          {errors.blurBidPrice?.max && (
            <p className="text-red-500 text-sm mt-1">
              {errors.blurBidPrice.max}
            </p>
          )}
        </div>
      ) : (
        <div></div>
      )}

      {formState.bidPriceType === MARKETPLACE_BID_PRICE &&
      formState.selectedMarketplaces
        .map((m) => m.toLowerCase())
        .includes("magiceden") ? (
        <div>
          <label
            htmlFor="magicEdenMinPrice"
            className="block text-sm font-medium mb-2"
          >
            {formState.outbidOptions.outbid
              ? "MagicEden Min Bid Price"
              : "MagicEden Bid Price"}
          </label>
          <div className="flex items-center">
            <input
              min={0.005}
              step={0.0001}
              inputMode="numeric"
              type="number"
              id="magicEdenMinPrice"
              name={"magicEdenBidPrice.min"}
              onChange={handleBidPriceChange}
              value={formState.magicEdenBidPrice.min}
              placeholder={
                formState.magicEdenBidPrice.minType === "percentage"
                  ? "80"
                  : "1"
              }
              className={`w-full p-3 rounded-l-lg border border-r-0 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night]`}
              autoComplete="off"
              required={
                formState.selectedMarketplaces
                  .map((m) => m.toLowerCase())
                  .includes("magiceden") &&
                formState.bidPriceType === MARKETPLACE_BID_PRICE
              }
            />
            <CustomSelect
              options={priceTypeOptions}
              value={formState.magicEdenBidPrice.minType}
              onChange={(value) =>
                handlePriceTypeChange(value, "magicEdenBidPrice")
              }
              className="w-20 ml-2"
            />
          </div>
          {errors.magicEdenBidPrice?.min && (
            <p className="text-red-500 text-sm mt-1">
              {errors.magicEdenBidPrice.min}
            </p>
          )}
        </div>
      ) : (
        <div></div>
      )}

      {formState.bidPriceType === MARKETPLACE_BID_PRICE &&
      formState.outbidOptions.outbid &&
      formState.selectedMarketplaces
        .map((m) => m.toLowerCase())
        .includes("magiceden") ? (
        <div>
          <label
            htmlFor="magicEdenMaxPrice"
            className="block text-sm font-medium mb-2"
          >
            MagicEden Max Bid Price
          </label>
          <div className="flex items-center">
            <input
              min={0.005}
              step={0.0001}
              inputMode="numeric"
              type="number"
              id="magicEdenMaxPrice"
              name={"magicEdenBidPrice.max"}
              onChange={handleBidPriceChange}
              value={formState.magicEdenBidPrice.max}
              placeholder={
                formState.magicEdenBidPrice.maxType === "percentage"
                  ? "80"
                  : "1"
              }
              className={`w-full p-3 rounded-l-lg border border-r-0 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night]`}
              autoComplete="off"
              required={
                formState.selectedMarketplaces
                  .map((m) => m.toLowerCase())
                  .includes("magiceden") &&
                formState.bidPriceType === MARKETPLACE_BID_PRICE &&
                formState.outbidOptions.outbid
              }
            />
            <CustomSelect
              options={priceTypeOptions}
              value={formState.magicEdenBidPrice.maxType}
              onChange={(value) =>
                handlePriceTypeChange(value, "magicEdenBidPrice")
              }
              className="w-20 ml-2"
            />
          </div>
          {errors.magicEdenBidPrice?.max && (
            <p className="text-red-500 text-sm mt-1">
              {errors.magicEdenBidPrice.max}
            </p>
          )}
        </div>
      ) : (
        <div></div>
      )}

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
        <label htmlFor="bidDuration" className="block text-sm font-medium mb-2">
          Loop Interval
        </label>
        <div className="flex items-center">
          <input
            inputMode="numeric"
            type="number"
            id="loopInterval"
            name="value"
            onChange={handleLoopIntervalChange}
            value={formState.loopInterval.value || 15}
            placeholder="15 Minutes"
            className="w-full p-3 rounded-l-lg border border-r-0 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night]"
            autoComplete="off"
          />
          <CustomSelect
            options={durationTypeOptions}
            value={formState.loopInterval.unit || "minutes"}
            onChange={(value) =>
              handleLoopIntervalChange({
                target: { name: "unit", value },
              } as React.ChangeEvent<HTMLInputElement>)
            }
            className="w-20 ml-2"
          />
        </div>
      </div>
    </>
  );
};

export default FormSection;
