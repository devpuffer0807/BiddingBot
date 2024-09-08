import React from "react";
import Toggle from "../common/Toggle";
import { TaskFormState } from "@/hooks/useTaskForm";

const OutbidSection = ({ formState, setFormState }: IOutbidSection) => {
  return (
    <>
      <div className="mt-6">
        <h2 className="font-medium mb-4">Outbid Option</h2>
        <div className="flex items-center">
          <span
            className="mr-2 text-sm cursor-pointer"
            onClick={() =>
              setFormState((prev) => ({
                ...prev,
                outbid: !prev.outbid,
                blurOutbidMargin: !prev.outbid ? "" : null,
                openseaOutbidMargin: !prev.outbid ? "" : null,
                magicedenOutbidMargin: !prev.outbid ? "" : null,
              }))
            }
          >
            {formState.outbid ? "Disable Outbidding" : "Enable Outbidding"}
          </span>
          <Toggle
            checked={formState.outbid}
            onChange={() =>
              setFormState((prev) => ({
                ...prev,
                outbid: !prev.outbid,
                blurOutbidMargin: !prev.outbid ? "" : null,
                openseaOutbidMargin: !prev.outbid ? "" : null,
                magicedenOutbidMargin: !prev.outbid ? "" : null,
              }))
            }
          />
        </div>
      </div>

      <div className="mt-6">
        {formState.outbid ? (
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="blurOutbidMargin" className="block text-sm mb-1">
                Blur Margin
              </label>
              <input
                inputMode="numeric"
                type="number"
                id="blurOutbidMargin"
                name="blurOutbidMargin"
                min={0.01}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    blurOutbidMargin: e.target.value,
                  }))
                }
                value={formState.blurOutbidMargin?.toString()}
                placeholder="0.01"
                className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] `}
                required
                autoComplete="off"
              />
            </div>
            <div>
              <label
                htmlFor="openseaOutbidMargin"
                className="block text-sm mb-1"
              >
                Opensea Margin
              </label>
              <input
                inputMode="numeric"
                type="number"
                id="openseaOutbidMargin"
                name="openseaOutbidMargin"
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    openseaOutbidMargin: e.target.value,
                  }))
                }
                value={formState.openseaOutbidMargin?.toString()}
                placeholder="0.0001"
                className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] `}
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label
                htmlFor="magicedenOutbidMargin"
                className="block text-sm mb-1"
              >
                Magiceden Margin
              </label>
              <input
                inputMode="numeric"
                type="number"
                id="magicedenOutbidMargin"
                name="magicedenOutbidMargin"
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    magicedenOutbidMargin: e.target.value,
                  }))
                }
                value={formState.magicedenOutbidMargin?.toString()}
                placeholder="0.0001"
                className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] `}
                required
                autoComplete="off"
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default OutbidSection;

interface IOutbidSection {
  formState: TaskFormState;
  setFormState: React.Dispatch<React.SetStateAction<TaskFormState>>;
}
