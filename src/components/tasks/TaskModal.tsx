import React from "react";
import Modal from "../common/Modal";
import { useWalletStore } from "../../store/wallet.store";
import CustomSelect from "../common/CustomSelect";
import { toast } from "react-toastify";
import { useTaskForm } from "@/hooks/useTaskForm";
import CheckIcon from "@/assets/svg/CheckIcon";
import XIcon from "@/assets/svg/XIcon";
import { useTaskStore } from "@/store";
import Link from "next/link";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskId }) => {
  const { wallets } = useWalletStore();
  const { tasks } = useTaskStore();

  const initialTask = taskId ? tasks.find((task) => task.id === taskId) : null;

  const { formik, validateSlug, handleMarketplaceToggle, submitForm } =
    useTaskForm(
      initialTask
        ? {
            slug: initialTask.slug,
            selectedWallet: initialTask.selectedWallet,
            minFloorPricePercentage:
              initialTask.minFloorPricePercentage.toString(),
            maxFloorPricePercentage:
              initialTask.maxFloorPricePercentage.toString(),
            selectedMarketplaces: initialTask.selectedMarketplaces,
          }
        : {
            slug: "",
            selectedWallet: "",
            minFloorPricePercentage: "",
            maxFloorPricePercentage: "",
            selectedMarketplaces: [],
          },
      taskId
    );

  const walletOptions = wallets.map((wallet) => ({
    value: wallet.id,
    label: wallet.name,
    address: wallet.address,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formik.isValid && formik.values.slugValid) {
      try {
        await submitForm(); // Use the submitForm function from useTaskForm
        toast.success(
          taskId ? "Task updated successfully!" : "Task created successfully!"
        );
        onClose();
      } catch (error) {
        toast.error(
          taskId
            ? "Failed to update task. Please try again."
            : "Failed to create task. Please try again."
        );
      }
    } else {
      toast.error("Please fill in all required fields correctly.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-[800px] p-4 sm:p-6 md:p-8"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <h2 className="text-center text-xl font-bold mb-6 text-Brand/Brand-1">
          CREATE A NEW TASK
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
                    formik.handleChange(e);
                    formik.setFieldTouched("slug", true, false);
                    if (e.target.value) {
                      validateSlug(e.target.value);
                    }
                  }}
                  onBlur={formik.handleBlur}
                  value={formik.values.slug}
                  placeholder="collection slug"
                  className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] ${
                    formik.touched.slug && formik.errors.slug
                      ? "border-red-500"
                      : ""
                  }`}
                  required
                  autoComplete="off"
                />
                {formik.touched.slug && formik.values.slug.length > 0 && (
                  <div className="absolute right-3 top-[50%] transform -translate-y-1/2">
                    {formik.errors.slug || !formik.values.slugValid ? (
                      <XIcon />
                    ) : (
                      <CheckIcon />
                    )}
                  </div>
                )}
                {formik.touched.slug && formik.errors.slug && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.slug}
                  </p>
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
                  value={formik.values.selectedWallet}
                  onChange={(selectedOption) =>
                    formik.setFieldValue("selectedWallet", selectedOption)
                  }
                />
                <Link
                  href={"/dashboard/wallet"}
                  className="text-sm text-Brand/Brand-1 mt-0.5 ml-2 block italic"
                >
                  create wallet
                </Link>
              </div>
              {formik.touched.selectedWallet &&
                formik.errors.selectedWallet && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.selectedWallet}
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
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.minFloorPricePercentage}
                placeholder="10"
                className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] ${
                  formik.touched.minFloorPricePercentage &&
                  formik.errors.minFloorPricePercentage
                    ? "border-red-500"
                    : ""
                }`}
                required
                autoComplete="off"
              />
              {formik.touched.minFloorPricePercentage &&
                formik.errors.minFloorPricePercentage && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.minFloorPricePercentage}
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
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.maxFloorPricePercentage}
                placeholder="80"
                className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] ${
                  formik.touched.maxFloorPricePercentage &&
                  formik.errors.maxFloorPricePercentage
                    ? "border-red-500"
                    : ""
                }`}
                required
                autoComplete="off"
              />
              {formik.touched.maxFloorPricePercentage &&
                formik.errors.maxFloorPricePercentage && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.maxFloorPricePercentage}
                  </p>
                )}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Select Marketplace</h2>
            <div className="flex flex-wrap gap-4">
              {["MagicEden", "Blur", "OpenSea"].map((marketplace) => {
                const isActive =
                  formik.values.selectedMarketplaces.includes(marketplace);
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
                    <span className="mr-2">{marketplace}</span>
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
            {formik.touched.selectedMarketplaces &&
              formik.errors.selectedMarketplaces && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.selectedMarketplaces}
                </p>
              )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={!formik.isValid || !formik.values.slugValid}
            className={`w-full sm:w-auto bg-Brand/Brand-1 text-white py-3 px-6 rounded-lg transition-colors
      ${
        !formik.isValid || !formik.values.slugValid
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-Brand/Brand-2"
      }`}
          >
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
