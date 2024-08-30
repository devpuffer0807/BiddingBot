import React from "react";
import Modal from "../common/Modal";
import { useWalletStore } from "../../store/walletStore";
import CustomSelect from "../common/CustomSelect";
import { toast } from "react-toastify";
import { useTaskForm } from "@/hooks/useTaskForm";
import CheckIcon from "@/assets/svg/CheckIcon";
import XIcon from "@/assets/svg/XIcon";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose }) => {
  const { wallets } = useWalletStore();
  const {
    formState,
    errors,
    handleInputChange,
    handleWalletChange,
    handleMarketplaceToggle,
    validateForm,
  } = useTaskForm({
    slug: "",
    minBidEth: "",
    maxBidEth: "",
    selectedWallet: "",
    minFloorPricePercentage: "",
    maxFloorPricePercentage: "",
    selectedMarketplaces: [],
  });

  const walletOptions = wallets.map((wallet) => ({
    value: wallet.id,
    label: wallet.name,
    address: wallet.address,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Simulating an API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success("Task created successfully!");
        onClose();
      } catch (error) {
        toast.error("Failed to create task. Please try again.");
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
        <h2 className="text-center text-xl font-bold my-4 text-Brand/Brand-1">
          CREATE A NEW TASK
        </h2>

        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <div className="my-4 w-full">
                <label
                  htmlFor="slug"
                  className="block text-sm text-Neutral/Neutral-1100-[night] font-sans"
                >
                  Collection slug
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formState.slug}
                    onChange={handleInputChange}
                    placeholder="collection slug"
                    className={`mt-2 w-full border rounded-lg shadow-sm p-4 pr-10 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] ${
                      errors.slug ? "border-red-500" : ""
                    }`}
                    required
                    autoComplete="off"
                  />
                  {formState.slugDirty && formState.slugValid !== null && (
                    <span className="absolute right-3 top-[57.5%] transform -translate-y-1/2">
                      {formState.slugValid ? <CheckIcon /> : <XIcon />}
                    </span>
                  )}
                </div>
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                )}
              </div>
              <div className="my-4 w-full">
                <label
                  htmlFor="minBidEth"
                  className="block text-sm text-Neutral/Neutral-1100-[night] font-sans"
                >
                  Min Bid (ETH)
                </label>
                <input
                  inputMode="decimal"
                  type="text"
                  id="minBidEth"
                  name="minBidEth"
                  value={formState.minBidEth}
                  onChange={handleInputChange}
                  placeholder="0.001"
                  className={`mt-2 w-full border rounded-lg shadow-sm p-4 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] ${
                    errors.minBidEth ? "border-red-500" : ""
                  }`}
                  required
                  autoComplete="off"
                />
                {errors.minBidEth && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.minBidEth}
                  </p>
                )}
              </div>
              <div className="my-4 w-full">
                <label
                  htmlFor="minFloorPricePercentage"
                  className="block text-sm text-Neutral/Neutral-1100-[night] font-sans"
                >
                  Min Bid Floor Price Percentage (%)
                </label>
                <input
                  inputMode="decimal"
                  min={0}
                  max={100}
                  type="text"
                  id="minFloorPricePercentage"
                  name="minFloorPricePercentage"
                  value={formState.minFloorPricePercentage}
                  onChange={handleInputChange}
                  placeholder="10"
                  className={`mt-2 w-full border rounded-lg shadow-sm p-4 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] ${
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
            </div>
            <div className="w-full md:w-1/2">
              <div className="my-4 w-full">
                <label
                  htmlFor="walletSelection"
                  className="block text-sm text-Neutral/Neutral-1100-[night] font-sans"
                >
                  Select Wallet
                </label>
                <div className="relative mt-2">
                  <CustomSelect
                    options={walletOptions}
                    value={formState.selectedWallet}
                    onChange={handleWalletChange}
                  />
                </div>
                {errors.selectedWallet && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.selectedWallet}
                  </p>
                )}
              </div>
              <div className="my-4 w-full">
                <label
                  htmlFor="maxBidEth"
                  className="block text-sm text-Neutral/Neutral-1100-[night] font-sans"
                >
                  Max Bid (ETH)
                </label>
                <input
                  inputMode="decimal"
                  type="text"
                  id="maxBidEth"
                  name="maxBidEth"
                  value={formState.maxBidEth}
                  onChange={handleInputChange}
                  placeholder="1"
                  className={`mt-2 w-full border rounded-lg shadow-sm p-4 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] ${
                    errors.maxBidEth ? "border-red-500" : ""
                  }`}
                  required
                  autoComplete="off"
                />
                {errors.maxBidEth && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.maxBidEth}
                  </p>
                )}
              </div>
              <div className="my-4 w-full">
                <label
                  htmlFor="maxFloorPricePercentage"
                  className="block text-sm text-Neutral/Neutral-1100-[night] font-sans"
                >
                  Max Bid Floor Price Percentage (%)
                </label>
                <input
                  min={0}
                  max={100}
                  inputMode="decimal"
                  type="text"
                  id="maxFloorPricePercentage"
                  name="maxFloorPricePercentage"
                  value={formState.maxFloorPricePercentage}
                  onChange={handleInputChange}
                  placeholder="80"
                  className={`mt-2 w-full border rounded-lg shadow-sm p-4 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] ${
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
          </div>
          <div className="mt-4">
            <h2 className="text-n-2 font-semibold mb-4">Select Marketplace</h2>

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
            {errors.selectedMarketplaces && (
              <p className="text-red-500 text-sm mt-1">
                {errors.selectedMarketplaces}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="w-full sm:w-auto bg-Brand/Brand-1 text-white py-2.5 px-6 rounded-lg transition-colors"
          >
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
