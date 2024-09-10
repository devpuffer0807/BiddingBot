import { TaskFormState } from "@/hooks/useTaskForm";
import React from "react";

const MarketplaceSection = ({
  formState,
  errors,
  handleMarketplaceToggle,
}: IMarketplaceSection) => {
  return (
    <div className="mt-6">
      <h2 className="font-medium mb-4">
        Select Marketplace <span className="text-red-500">*</span>
      </h2>
      <div className="flex flex-wrap gap-4">
        {["MagicEden", "Blur", "OpenSea"].map((marketplace) => {
          const isActive = formState.selectedMarketplaces.includes(marketplace);
          const activeColor =
            marketplace === "MagicEden"
              ? "bg-[#e42575]"
              : marketplace === "Blur"
              ? "bg-[#FF8700]"
              : "bg-[#2081e2]";
          const isDisabled =
            (marketplace === "MagicEden" && !formState.magicEdenValid) ||
            (marketplace === "Blur" && !formState.blurValid);

          return (
            <button
              key={marketplace}
              type="button"
              onClick={() => handleMarketplaceToggle(marketplace)}
              className="flex items-center"
              disabled={isDisabled}
            >
              <span className="mr-2 text-sm">{marketplace}</span>
              <div className="w-10 h-6 flex items-center rounded-full p-1 bg-gray-300">
                <div
                  className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out
                        ${
                          isActive
                            ? `translate-x-4 ${activeColor}`
                            : "translate-x-0 bg-white"
                        }`}
                ></div>
              </div>
            </button>
          );
        })}
      </div>
      {formState.slugValid && !formState.blurValid ? (
        <p className="text-red-500 text-sm mt-1">
          ⚠️ this collection is not available on Blur Marketplace
        </p>
      ) : null}

      {errors.selectedMarketplaces && (
        <p className="text-red-500 text-sm mt-1">
          {errors.selectedMarketplaces}
        </p>
      )}
    </div>
  );
};

export default MarketplaceSection;

interface IMarketplaceSection {
  formState: TaskFormState;
  errors: Partial<TaskFormState>;
  handleMarketplaceToggle: (marketplace: string) => void;
}
