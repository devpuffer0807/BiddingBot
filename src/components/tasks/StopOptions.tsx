import React from "react";
import "./task.css";
import { TaskFormState } from "@/hooks/useTaskForm";

const StopOption = ({ formState, setFormState }: IStopOption) => {
  return (
    <>
      <div className="mt-6">
        <h2 className="font-medium mb-4">Stop Option</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={formState.cancelAllBids}
                onChange={(e) => {
                  setFormState((prev) => ({
                    ...prev,
                    cancelAllBids: e.target.checked,
                  }));
                }}
              />
              <span className="checkmark"></span>
            </label>
            <label className="mr-2 text-sm">Cancel All Bids</label>
          </div>

          <div className="flex items-center gap-4">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={formState.stopAllBids}
                onChange={(e) => {
                  setFormState((prev) => ({
                    ...prev,
                    stopAllBids: e.target.checked,
                  }));
                }}
              />
              <span className="checkmark"></span>
            </label>
            <label className="mr-2 text-sm">Stop All Bids</label>
          </div>

          <div className="flex items-center gap-4">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={formState.pauseAllBids}
                onChange={(e) => {
                  setFormState((prev) => ({
                    ...prev,
                    pauseAllBids: e.target.checked,
                  }));
                }}
              />
              <span className="checkmark"></span>
            </label>
            <label className="mr-2 text-sm">Pause All Bids</label>
          </div>
        </div>
      </div>

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
              name="minFloorPrice"
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  minFloorPrice: e.target.value,
                }))
              }
              value={formState.minFloorPrice?.toString()}
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
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  minTraitPrice: e.target.value,
                }))
              }
              value={formState.minTraitPrice?.toString()}
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
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  maxPurchase: e.target.value,
                }))
              }
              value={formState.maxPurchase?.toString()}
              placeholder="1"
              className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] `}
              required
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default StopOption;

interface IStopOption {
  formState: TaskFormState;
  setFormState: React.Dispatch<React.SetStateAction<TaskFormState>>;
}
