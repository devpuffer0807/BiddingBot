import React from "react";
import Modal from "../common/Modal";
import { useWalletStore } from "../../store/wallet.store";
import CustomSelect from "../common/CustomSelect";
import { toast } from "react-toastify";
import { useTaskForm } from "@/hooks/useTaskForm";
import CheckIcon from "@/assets/svg/CheckIcon";
import XIcon from "@/assets/svg/XIcon";
import { Task, useTaskStore } from "@/store";
import Link from "next/link";
import Toggle from "../common/Toggle";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string;
  initialTask?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskId,
  initialTask,
}) => {
  console.log("TaskModal props:", { isOpen, taskId, initialTask });

  const { wallets } = useWalletStore();
  const { tasks } = useTaskStore();

  const taskFromId = taskId ? tasks.find((task) => task.id === taskId) : null;

  const {
    formState,
    errors,
    handleChange,
    handleMarketplaceToggle,
    handleSubmit,
    validateSlug,
    setFormState,
  } = useTaskForm(
    initialTask
      ? {
          slug: initialTask.slug,
          selectedWallet: initialTask.selectedWallet,
          minFloorPricePercentage:
            initialTask.minFloorPricePercentage.toString(),
          maxFloorPricePercentage:
            initialTask.maxFloorPricePercentage.toString(),
          selectedMarketplaces: initialTask.selectedMarketplaces,
          running: initialTask.running,
        }
      : {
          slug: "",
          selectedWallet: "",
          minFloorPricePercentage: "",
          maxFloorPricePercentage: "",
          selectedMarketplaces: [],
          running: false,
        },
    taskId
  );

  console.log("FormState:", formState);

  const walletOptions = wallets.map((wallet) => ({
    value: wallet.id,
    label: wallet.name,
    address: wallet.address,
  }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (handleSubmit()) {
      // Update the task's running state immediately after creation/update
      if (taskId) {
        useTaskStore
          .getState()
          .editTask(taskId, { running: formState.running });
      } else {
        const newTaskId = useTaskStore.getState().getLastTaskId();
        useTaskStore
          .getState()
          .editTask(newTaskId, { running: formState.running });
      }
      toast.success(
        taskId ? "Task updated successfully!" : "Task created successfully!"
      );
      onClose();
    } else {
      toast.error("Please fill in all required fields correctly.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-[800px] p-4 sm:p-6 md:p-8"
      key={taskId || "new"} // Add this line
    >
      <form onSubmit={onSubmit} className="flex flex-col h-full">
        <h2 className="text-center text-xl font-bold mb-6 text-Brand/Brand-1">
          {taskId ? "EDIT TASK" : "CREATE A NEW TASK"}
        </h2>

        <div className="flex-grow overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {errors.slug || !formState.slugValid ? (
                      <XIcon />
                    ) : (
                      <CheckIcon />
                    )}
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
                <p className="text-red-500 text-sm mt-1">
                  {errors.selectedWallet}
                </p>
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
          </div>

          <div className="mt-6">
            <h2 className="font-medium mb-4">Select Marketplace</h2>
            <div className="flex flex-wrap gap-4">
              {["MagicEden", "Blur", "OpenSea"].map((marketplace) => {
                const isActive =
                  formState.selectedMarketplaces.includes(marketplace);
                const activeColor =
                  marketplace === "MagicEden"
                    ? "bg-[#e42575]"
                    : marketplace === "Blur"
                    ? "bg-[#FF8700]"
                    : "bg-[#2081e2]";
                return (
                  <button
                    key={marketplace}
                    type="button"
                    onClick={() => handleMarketplaceToggle(marketplace)}
                    className="flex items-center"
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
            {errors.selectedMarketplaces && (
              <p className="text-red-500 text-sm mt-1">
                {errors.selectedMarketplaces}
              </p>
            )}
          </div>

          <div className="mt-6">
            <h2 className="font-medium mb-4">Start Immediately</h2>
            <div className="flex items-center">
              <span
                className="mr-2 text-sm cursor-pointer"
                onClick={() =>
                  setFormState((prev) => ({ ...prev, running: !prev.running }))
                }
              >
                Start
              </span>
              <Toggle
                checked={formState.running}
                onChange={() =>
                  setFormState((prev) => ({ ...prev, running: !prev.running }))
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={!formState.slugValid}
            className={`w-full sm:w-auto bg-Brand/Brand-1 text-white py-3 px-6 rounded-lg transition-colors
            ${
              !formState.slugValid
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-Brand/Brand-2"
            }`}
          >
            {taskId ? "Update Task" : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
