import React from "react";
import "./task.css";
import { TaskFormState } from "@/hooks/useTaskForm";
import Toggle from "../common/Toggle";

const StopOption = ({ formState, setFormState }: IStopOption) => {
  const updateStopOptions = (
    updatedOptions: Partial<typeof formState.stopOptions>
  ) => {
    setFormState((prev) => {
      const newStopOptions = {
        ...prev.stopOptions,
        ...updatedOptions,
      };

      if (!newStopOptions.triggerStopOptions) {
        newStopOptions.cancelAllBids = false;
        newStopOptions.pauseAllBids = false;
        newStopOptions.stopAllBids = false;
        newStopOptions.minFloorPrice = null;
        newStopOptions.minTraitPrice = null;
        newStopOptions.maxPurchase = null;
      }

      return {
        ...prev,
        stopOptions: newStopOptions,
      };
    });
  };
  return (
    <>
      <div className="mt-6">
        <h2 className="font-medium mb-4">Stop Option</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-4">
            <Toggle
              checked={formState.stopOptions.triggerStopOptions}
              onChange={() =>
                updateStopOptions({
                  triggerStopOptions: !formState.stopOptions.triggerStopOptions,
                })
              }
            />

            <span
              className="text-sm cursor-pointer"
              onClick={() =>
                updateStopOptions({
                  triggerStopOptions: !formState.stopOptions.triggerStopOptions,
                })
              }
            >
              {formState.stopOptions.triggerStopOptions
                ? "Disable Smart Stop"
                : "Enable Smart Stop"}
            </span>
          </div>
          {formState.stopOptions.triggerStopOptions && (
            <>
              <div className="flex items-center gap-4">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={formState.stopOptions.cancelAllBids}
                    onClick={() =>
                      updateStopOptions({
                        cancelAllBids: !formState.stopOptions.cancelAllBids,
                      })
                    }
                  />
                  <span className="checkmark"></span>
                </label>
                <label
                  className="mr-2 text-sm"
                  onClick={() =>
                    updateStopOptions({
                      cancelAllBids: !formState.stopOptions.cancelAllBids,
                    })
                  }
                >
                  Cancel All Bids
                </label>
              </div>

              <div className="flex items-center gap-4">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={formState.stopOptions.stopAllBids}
                    onClick={() =>
                      updateStopOptions({
                        stopAllBids: !formState.stopOptions.stopAllBids,
                      })
                    }
                  />
                  <span className="checkmark"></span>
                </label>
                <label
                  className="mr-2 text-sm"
                  onClick={() =>
                    updateStopOptions({
                      stopAllBids: !formState.stopOptions.stopAllBids,
                    })
                  }
                >
                  Stop bidding Task (requires manual restart)
                </label>
              </div>

              <div className="flex items-center gap-4">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={formState.stopOptions.pauseAllBids}
                    onClick={() =>
                      updateStopOptions({
                        pauseAllBids: !formState.stopOptions.pauseAllBids,
                      })
                    }
                  />
                  <span className="checkmark"></span>
                </label>
                <label
                  className="mr-2 text-sm"
                  onClick={() =>
                    updateStopOptions({
                      pauseAllBids: !formState.stopOptions.pauseAllBids,
                    })
                  }
                >
                  Pause bidding Task (automatically restarts when price is
                  within range)
                </label>
              </div>
            </>
          )}
        </div>
      </div>
      {formState.stopOptions.triggerStopOptions ? (
        <div className="mt-6">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="minFloorPrice" className="block text-sm mb-1">
                Minimum Floor Price
              </label>
              <input
                inputMode="numeric"
                type="number"
                id="minFloorPrice"
                step={0.0001}
                name="minFloorPrice"
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    stopOptions: {
                      ...prev.stopOptions,
                      minFloorPrice: e.target.value,
                    },
                  }))
                }
                value={formState.stopOptions.minFloorPrice?.toString()}
                placeholder="0.0001"
                className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] `}
                required
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="minTraitPrice" className="block text-sm mb-1">
                Minimum Trait Price
              </label>
              <input
                inputMode="numeric"
                type="number"
                id="minTraitPrice"
                name="minTraitPrice"
                step={0.0001}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    stopOptions: {
                      ...prev.stopOptions,
                      minTraitPrice: e.target.value,
                    },
                  }))
                }
                value={formState.stopOptions.minTraitPrice?.toString()}
                placeholder="0.0001"
                className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] `}
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="maxPurchase" className="block text-sm mb-1">
                Maximum Purchase
              </label>
              <input
                inputMode="numeric"
                type="number"
                id="maxPurchase"
                name="maxPurchase"
                step={1}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    stopOptions: {
                      ...prev.stopOptions,
                      maxPurchase: e.target.value,
                    },
                  }))
                }
                value={formState.stopOptions.maxPurchase?.toString()}
                placeholder="1"
                className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] `}
                required
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6"></div>
      )}
    </>
  );
};

export default StopOption;

interface IStopOption {
  formState: TaskFormState;
  setFormState: React.Dispatch<React.SetStateAction<TaskFormState>>;
}
