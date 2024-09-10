import React from "react";
import "./task.css";
import { TaskFormState } from "@/hooks/useTaskForm";
import Toggle from "../common/Toggle";

const StopOption = ({ formState, setFormState }: IStopOption) => {
  const updateStopOptions = (
    updatedOptions: Partial<typeof formState.stopOptions>
  ) => {
    setFormState((prev) => {
      let newStopOptions = {
        ...prev.stopOptions,
        ...updatedOptions,
      };

      if (!newStopOptions.triggerStopOptions) {
        newStopOptions.cancelAllBids = false;
        newStopOptions.pauseAllBids = false;
        newStopOptions.stopAllBids = false;
        newStopOptions.minFloorPrice = null;
        newStopOptions.maxFloorPrice = null;
        newStopOptions.minTraitPrice = null;
        newStopOptions.maxTraitPrice = null;
        newStopOptions.maxPurchase = null;
      }

      // Ensure only one of pauseAllBids or stopAllBids can be true
      if (newStopOptions.pauseAllBids) {
        newStopOptions.stopAllBids = false;
      }
      if (newStopOptions.stopAllBids) {
        newStopOptions.pauseAllBids = false;
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
                        pauseAllBids: false, // Ensure pauseAllBids is false
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
                      pauseAllBids: false, // Ensure pauseAllBids is false
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
                        stopAllBids: false, // Ensure stopAllBids is false
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
                      stopAllBids: false, // Ensure stopAllBids is false
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label htmlFor="minFloorPrice" className="block text-sm mb-1">
                  Min Floor Price
                </label>
                <input
                  inputMode="numeric"
                  type="number"
                  id="minFloorPrice"
                  step={0.0001}
                  min={0.0001}
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
                <label htmlFor="maxFloorPrice" className="block text-sm mb-1">
                  Max Floor Price
                </label>
                <input
                  inputMode="numeric"
                  type="number"
                  id="maxFloorPrice"
                  step={0.0001}
                  min={0.0001}
                  name="maxFloorPrice"
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      stopOptions: {
                        ...prev.stopOptions,
                        maxFloorPrice: e.target.value,
                      },
                    }))
                  }
                  value={formState.stopOptions.maxFloorPrice?.toString()}
                  placeholder="0.0001"
                  className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] `}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            {Object.keys(formState.selectedTraits).length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label
                      htmlFor="minTraitPrice"
                      className="block text-sm mb-1"
                    >
                      Min Trait Price
                    </label>
                    <input
                      inputMode="numeric"
                      type="number"
                      id="minTraitPrice"
                      name="minTraitPrice"
                      step={0.0001}
                      min={0.0001}
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
                    <label
                      htmlFor="maxTraitPrice"
                      className="block text-sm mb-1"
                    >
                      Max Trait Price
                    </label>
                    <input
                      inputMode="numeric"
                      type="number"
                      id="maxTraitPrice"
                      name="maxTraitPrice"
                      step={0.0001}
                      min={0.0001}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          stopOptions: {
                            ...prev.stopOptions,
                            maxTraitPrice: e.target.value,
                          },
                        }))
                      }
                      value={formState.stopOptions.maxTraitPrice?.toString()}
                      placeholder="0.0001"
                      className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] `}
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}

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
                min={1}
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
