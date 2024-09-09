import React from "react";
import Toggle from "../common/Toggle";
import { TaskFormState } from "@/hooks/useTaskForm";

const OutbidSection = ({ formState, setFormState }: IOutbidSection) => {
  return (
    <>
      <div className="mt-6">
        <h2 className="font-medium mb-4">Outbid Option</h2>
        <div className="flex items-center mb-8 gap-2">
          <Toggle
            checked={formState.outbidOptions.outbid}
            onChange={() =>
              setFormState((prev) => ({
                ...prev,
                outbidOptions: {
                  ...prev.outbidOptions,
                  outbid: !prev.outbidOptions.outbid,
                  blurOutbidMargin: !prev.outbidOptions.outbid ? "" : null,
                  openseaOutbidMargin: !prev.outbidOptions.outbid ? "" : null,
                  magicedenOutbidMargin: !prev.outbidOptions.outbid ? "" : null,
                },
              }))
            }
          />
          <span
            className="text-sm cursor-pointer"
            onClick={() =>
              setFormState((prev) => ({
                ...prev,
                outbidOptions: {
                  ...prev.outbidOptions,
                  outbid: !prev.outbidOptions.outbid,
                  blurOutbidMargin: !prev.outbidOptions.outbid ? "" : null,
                  openseaOutbidMargin: !prev.outbidOptions.outbid ? "" : null,
                  magicedenOutbidMargin: !prev.outbidOptions.outbid ? "" : null,
                },
              }))
            }
          >
            {formState.outbidOptions.outbid
              ? "Disable Outbidding"
              : "Enable Outbidding"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Toggle
            checked={formState.outbidOptions.counterbid}
            onChange={() =>
              setFormState((prev) => ({
                ...prev,
                outbidOptions: {
                  ...prev.outbidOptions,
                  counterbid: !prev.outbidOptions.counterbid,
                  blurOutbidMargin:
                    !prev.outbidOptions.outbid && !prev.outbidOptions.counterbid
                      ? ""
                      : null,
                  openseaOutbidMargin:
                    !prev.outbidOptions.outbid && !prev.outbidOptions.counterbid
                      ? ""
                      : null,
                  magicedenOutbidMargin:
                    !prev.outbidOptions.outbid && !prev.outbidOptions.counterbid
                      ? ""
                      : null,
                },
              }))
            }
          />
          <span
            className="text-sm cursor-pointer"
            onClick={() =>
              setFormState((prev) => ({
                ...prev,
                outbidOptions: {
                  ...prev.outbidOptions,
                  counterbid: !prev.outbidOptions.counterbid,
                  blurOutbidMargin:
                    !prev.outbidOptions.outbid && !prev.outbidOptions.counterbid
                      ? ""
                      : null,
                  openseaOutbidMargin:
                    !prev.outbidOptions.outbid && !prev.outbidOptions.counterbid
                      ? ""
                      : null,
                  magicedenOutbidMargin:
                    !prev.outbidOptions.outbid && !prev.outbidOptions.counterbid
                      ? ""
                      : null,
                },
              }))
            }
          >
            {formState.outbidOptions.counterbid
              ? "Disable Counterbidding"
              : "Enable Counterbidding"}
          </span>
        </div>
      </div>

      <div className="mt-6">
        {formState.outbidOptions.outbid ||
        formState.outbidOptions.counterbid ? (
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="blurOutbidMargin" className="block text-sm mb-1">
                Blur Outbid/Counterbid Margin
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
                    outbidOptions: {
                      ...prev.outbidOptions,
                      blurOutbidMargin: e.target.value,
                    },
                  }))
                }
                value={formState.outbidOptions.blurOutbidMargin?.toString()}
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
                Opensea Outbid/Counterbid Margin
              </label>
              <input
                inputMode="numeric"
                type="number"
                id="openseaOutbidMargin"
                name="openseaOutbidMargin"
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    outbidOptions: {
                      ...prev.outbidOptions,
                      openseaOutbidMargin: e.target.value,
                    },
                  }))
                }
                value={formState.outbidOptions.openseaOutbidMargin?.toString()}
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
                Magiceden Outbid/Counterbid Margin
              </label>
              <input
                inputMode="numeric"
                type="number"
                id="magicedenOutbidMargin"
                name="magicedenOutbidMargin"
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    outbidOptions: {
                      ...prev.outbidOptions,
                      magicedenOutbidMargin: e.target.value,
                    },
                  }))
                }
                value={formState.outbidOptions.magicedenOutbidMargin?.toString()}
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
