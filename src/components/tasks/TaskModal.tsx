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
          contract: {
            slug: initialTask.contract.slug,
            contractAddress: initialTask.contract.contractAddress,
          },
          selectedMarketplaces: initialTask.selectedMarketplaces,
          running: initialTask.running,
          tags: initialTask.tags,
          selectedTraits: initialTask.selectedTraits,
          traits: initialTask.traits || { categories: {}, counts: {} },
          outbidOptions: {
            outbid: initialTask.outbidOptions.outbid,
            blurOutbidMargin:
              initialTask.outbidOptions.blurOutbidMargin?.toString() || "",
            openseaOutbidMargin:
              initialTask.outbidOptions.openseaOutbidMargin?.toString() || "",
            magicedenOutbidMargin:
              initialTask.outbidOptions.magicedenOutbidMargin?.toString() || "",
            counterbid: initialTask.outbidOptions.counterbid,
          },
          stopOptions: {
            minFloorPrice:
              initialTask.stopOptions.minFloorPrice?.toString() || "",
            minTraitPrice:
              initialTask.stopOptions.minTraitPrice?.toString() || "",
            maxPurchase: initialTask.stopOptions.maxPurchase?.toString() || "",
            pauseAllBids: initialTask.stopOptions.pauseAllBids,
            stopAllBids: initialTask.stopOptions.stopAllBids,
            cancelAllBids: initialTask.stopOptions.cancelAllBids,
            triggerStopOptions: initialTask.stopOptions.triggerStopOptions,
          },
          bidPrice: {
            min: initialTask.bidPrice.min?.toString() || "",
            max: initialTask.bidPrice.max?.toString() || "",
            minType: initialTask.bidPrice.minType || "percentage",
            maxType: initialTask.bidPrice.maxType || "percentage",
          },

          wallet: {
            address: initialTask.wallet.address || "",
            privateKey: initialTask.wallet.privateKey || "",
          },
        }
      : {
          contract: {
            slug: "",
            contractAddress: "",
          },
          selectedMarketplaces: [],
          running: false,
          tags: [],
          selectedTraits: {},
          traits: { categories: {}, counts: {} },
          outbidOptions: {
            outbid: false,
            blurOutbidMargin: "",
            openseaOutbidMargin: "",
            magicedenOutbidMargin: "",
            counterbid: false,
          },
          stopOptions: {
            minFloorPrice: "",
            minTraitPrice: "",
            maxPurchase: "",
            pauseAllBids: false,
            stopAllBids: false,
            cancelAllBids: false,
            triggerStopOptions: false,
          },
          bidPrice: {
            min: "",
            max: "",
            minType: "percentage",
            maxType: "percentage",
          },
          wallet: {
            address: "",
            privateKey: "",
          },
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

  const isFormValid = () => {
    const { contract, wallet, bidPrice, selectedMarketplaces } = formState;
    return (
      contract.slug &&
      contract.contractAddress &&
      wallet.address &&
      bidPrice.min &&
      selectedMarketplaces.length > 0
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await handleSubmit();
    if (isValid) {
      const taskStore = useTaskStore.getState();
      const taskData = {
        contract: {
          slug: formState.contract.slug,
          contractAddress: formState.contract.contractAddress,
        },
        running: formState.running,
        tags: formState.tags,
        selectedTraits: formState.selectedTraits,
        outbidOptions: {
          outbid: formState.outbidOptions.outbid,
          blurOutbidMargin: formState.outbidOptions.outbid
            ? Number(formState.outbidOptions.blurOutbidMargin)
            : null,
          openseaOutbidMargin: formState.outbidOptions.outbid
            ? Number(formState.outbidOptions.openseaOutbidMargin)
            : null,
          magicedenOutbidMargin: formState.outbidOptions.outbid
            ? Number(formState.outbidOptions.magicedenOutbidMargin)
            : null,
          counterbid: formState.outbidOptions.counterbid,
        },
        stopOptions: {
          minFloorPrice: Number(formState.stopOptions.minFloorPrice),
          minTraitPrice: Number(formState.stopOptions.minTraitPrice),
          maxPurchase: Number(formState.stopOptions.maxPurchase),
          pauseAllBids: formState.stopOptions.pauseAllBids,
          stopAllBids: formState.stopOptions.stopAllBids,
          cancelAllBids: formState.stopOptions.cancelAllBids,
          triggerStopOptions: formState.stopOptions.triggerStopOptions,
        },
        bidPrice: {
          min: Number(formState.bidPrice.min),
          max: Number(formState.bidPrice.max),
          minType: formState.bidPrice.minType,
          maxType: formState.bidPrice.maxType,
        },
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
      contract: {
        slug: "",
        contractAddress: "",
      },
      wallet: {
        address: "",
        privateKey: "",
      },
      selectedMarketplaces: [],
      running: false,
      slugValid: false,
      slugDirty: false,
      tags: [],
      selectedTraits: {},
      traits: { categories: {}, counts: {} },
      outbidOptions: {
        outbid: false,
        blurOutbidMargin: "",
        openseaOutbidMargin: "",
        magicedenOutbidMargin: "",
        counterbid: false,
      },
      stopOptions: {
        minFloorPrice: "",
        minTraitPrice: "",
        maxPurchase: "",
        pauseAllBids: false,
        stopAllBids: false,
        cancelAllBids: false,
        triggerStopOptions: false,
      },
      bidPrice: {
        min: "",
        max: "",
        minType: "percentage",
        maxType: "percentage",
      },
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
              validateSlug={validateSlug}
              walletOptions={walletOptions}
              setFormState={setFormState}
              onWalletModalOpen={handleWalletModalOpen}
            />
            {formState.traits &&
              Object.keys(formState.traits.categories).length > 0 && (
                <div className="col-span-2 mt-6">
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
            disabled={!isFormValid()}
            className={`w-full sm:w-auto bg-Brand/Brand-1 text-white py-3 px-6 rounded-lg transition-colors mb-8
            ${
              !isFormValid()
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
