import React from "react";
import Modal from "../common/Modal";
import { useWalletStore } from "../../store/wallet.store";
import { toast } from "react-toastify";
import { useTaskForm } from "@/hooks/useTaskForm";
import { Task, useTaskStore } from "@/store";
import { useState } from "react";
import { useTagStore } from "@/store/tag.store";
import TraitSelector from "./TraitSelector";
import FormSection from "./FormSection";
import MarketplaceSection from "./MarketplaceSection";
import TagSection from "./TagSection";
import OutbidSection from "./OutbidSection";
import StartSection from "./StartSection";
import StopOption from "./StopOptions";
import WalletModal from "../wallet/WalletModal";

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskId,
  initialTask,
}) => {
  const { wallets } = useWalletStore();
  const { addTag } = useTagStore();
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#000000");
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const {
    formState,
    errors,
    handleChange,
    handleMarketplaceToggle,
    handleSubmit,
    validateSlug,
    setFormState,
    handleTagChange,
    handleTraitChange,
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
          contractAddress: initialTask.contractAddress,
          tags: initialTask.tags,
          selectedTraits: initialTask.selectedTraits,
          traits: initialTask.traits || { categories: {}, counts: {} },
          outbid: initialTask.outbid,
          blurOutbidMargin: initialTask.blurOutbidMargin?.toString() || "",
          openseaOutbidMargin:
            initialTask.openseaOutbidMargin?.toString() || "",
          magicedenOutbidMargin:
            initialTask.magicedenOutbidMargin?.toString() || "",
          counterbid: initialTask.counterbid,
          minFloorPrice: initialTask.minFloorPrice.toString(),
          minTraitPrice: initialTask.minTraitPrice.toString(),
          maxPurchase: initialTask.maxPurchase.toString(),
          pauseAllBids: initialTask.pauseAllBids,
          stopAllBids: initialTask.stopAllBids,
          cancelAllBids: initialTask.cancelAllBids,
        }
      : {
          slug: "",
          selectedWallet: "",
          minFloorPricePercentage: "",
          maxFloorPricePercentage: "",
          selectedMarketplaces: [],
          running: false,
          contractAddress: "",
          tags: [],
          selectedTraits: {},
          traits: { categories: {}, counts: {} },
          outbid: false,
          blurOutbidMargin: "",
          openseaOutbidMargin: "",
          magicedenOutbidMargin: "",
          counterbid: false,
          minFloorPrice: "",
          minTraitPrice: "",
          maxPurchase: "",
          pauseAllBids: false,
          stopAllBids: false,
          cancelAllBids: false,
        },
    taskId
  );

  const walletOptions = wallets.map((wallet) => ({
    value: wallet.address,
    label: wallet.name,
    address: wallet.address,
  }));

  const handleAddTag = async () => {
    if (newTagName && newTagColor) {
      try {
        const response = await fetch("/api/tag", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: newTagName,
            color: newTagColor,
          }),
        });

        if (response.ok) {
          const newTag = await response.json();
          addTag(newTag);
          setNewTagName("");
          setNewTagColor("#000000");
          toast.success("Tag added successfully!");
        } else {
          toast.error("Failed to add tag.");
        }
      } catch (error) {
        toast.error("Failed to add tag.");
      }
    }
  };

  const handleTraitSelect = (traits: Record<string, string[]>) => {
    handleTraitChange(traits);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await handleSubmit();
    if (isValid) {
      const taskStore = useTaskStore.getState();
      const taskData = {
        running: formState.running,
        tags: formState.tags,
        selectedTraits: formState.selectedTraits,
        outbid: formState.outbid,
        blurOutbidMargin: formState.outbid
          ? Number(formState.blurOutbidMargin)
          : null,
        openseaOutbidMargin: formState.outbid
          ? Number(formState.openseaOutbidMargin)
          : null,
        magicedenOutbidMargin: formState.outbid
          ? Number(formState.magicedenOutbidMargin)
          : null,
        counterbid: formState.counterbid,
        minFloorPrice: Number(formState.minFloorPrice),
        minTraitPrice: Number(formState.minTraitPrice),
        maxPurchase: Number(formState.maxPurchase),
        pauseAllBids: formState.pauseAllBids,
        stopAllBids: formState.stopAllBids,
        cancelAllBids: formState.cancelAllBids,
      };

      if (taskId) {
        taskStore.editTask(taskId, taskData);
      } else {
        const newTaskId = taskStore.getLastTaskId();
        taskStore.editTask(newTaskId, taskData);
      }
      toast.success(
        taskId ? "Task updated successfully!" : "Task created successfully!"
      );
      onClose();
    } else {
      toast.error("Please fill in all required fields correctly.");
    }

    setFormState({
      slug: "",
      selectedWallet: "",
      minFloorPricePercentage: "",
      maxFloorPricePercentage: "",
      selectedMarketplaces: [],
      running: false,
      slugValid: false,
      slugDirty: false,
      contractAddress: "",
      tags: [],
      selectedTraits: {},
      traits: { categories: {}, counts: {} },
      outbid: false,
      blurOutbidMargin: "",
      openseaOutbidMargin: "",
      magicedenOutbidMargin: "",
      counterbid: false,
      minFloorPrice: "",
      minTraitPrice: "",
      maxPurchase: "",
      pauseAllBids: false,
      stopAllBids: false,
      cancelAllBids: false,
    });
  };

  const handleWalletModalOpen = () => {
    setIsWalletModalOpen(true);
  };

  const handleWalletModalClose = () => {
    setIsWalletModalOpen(false);
  };

  const handleTaskModalClose = () => {
    if (!isWalletModalOpen) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleTaskModalClose}
      className="w-full max-w-[800px] h-full p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar"
      key={taskId || "new"}
    >
      <form onSubmit={onSubmit} className="flex flex-col h-full">
        <h2 className="text-center text-xl font-bold mb-6 text-Brand/Brand-1">
          {taskId ? "EDIT TASK" : "CREATE A NEW TASK"}
        </h2>

        <div className="flex-grow pr-4 -mr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSection
              formState={formState}
              errors={errors}
              handleChange={handleChange}
              validateSlug={validateSlug}
              walletOptions={walletOptions}
              setFormState={setFormState}
              onWalletModalOpen={handleWalletModalOpen}
            />
            {formState.traits &&
              Object.keys(formState.traits.categories).length > 0 && (
                <div className="col-span-2 mt-6">
                  {" "}
                  {/* Update this line */}
                  <h3 className="mb-2 font-medium">Select Traits</h3>
                  <TraitSelector
                    traits={formState.traits}
                    onTraitSelect={handleTraitSelect}
                    initialSelectedTraits={formState.selectedTraits}
                  />
                </div>
              )}
            <MarketplaceSection
              formState={formState}
              errors={errors}
              handleMarketplaceToggle={handleMarketplaceToggle}
            />
            <TagSection
              formState={formState}
              handleTagChange={handleTagChange}
              showCreateTag={showCreateTag}
              setShowCreateTag={setShowCreateTag}
              newTagName={newTagName}
              setNewTagName={setNewTagName}
              newTagColor={newTagColor}
              setNewTagColor={setNewTagColor}
              handleAddTag={handleAddTag}
            />
            <OutbidSection formState={formState} setFormState={setFormState} />
            <StopOption formState={formState} setFormState={setFormState} />
            <StartSection formState={formState} setFormState={setFormState} />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={!formState.slugValid}
            className={`w-full sm:w-auto bg-Brand/Brand-1 text-white py-3 px-6 rounded-lg transition-colors mb-8
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

      {isWalletModalOpen && (
        <WalletModal
          isOpen={isWalletModalOpen}
          onClose={handleWalletModalClose}
        />
      )}
    </Modal>
  );
};

export default TaskModal;
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string;
  initialTask?: Task | null;
}
