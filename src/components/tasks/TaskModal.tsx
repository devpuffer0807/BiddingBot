import Modal from "../common/Modal";
import { useWalletStore } from "../../store/wallet.store";
import { toast } from "react-toastify";
import { useTaskForm } from "@/hooks/useTaskForm";
import { Task, useTaskStore } from "@/store";
import { useState, useEffect } from "react";
import { useTagStore } from "@/store/tag.store";
import FormSection from "./FormSection";
import TagSection from "./TagSection";
import OutbidSection from "./OutbidSection";
import StartSection from "./StartSection";
import StopOption from "./StopOptions";
import WalletModal from "../wallet/WalletModal";
import XIcon from "@/assets/svg/XIcon";
import CheckIcon from "@/assets/svg/CheckIcon";
import LoadingIcon from "@/assets/svg/LoadingIcon";

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
  const [tokenIdInput, setTokenIdInput] = useState("");

  const {
    formState,
    errors,
    handleMarketplaceToggle,
    handleSubmit,
    setFormState,
    handleTagChange,
    handleTraitChange,
    debouncedValidateSlug,
    validateSlug, // Add this
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
            maxFloorPrice:
              initialTask.stopOptions.maxFloorPrice?.toString() || "",
            minTraitPrice:
              initialTask.stopOptions.minTraitPrice?.toString() || "",
            maxTraitPrice:
              initialTask.stopOptions.maxTraitPrice?.toString() || "",
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
          openseaBidPrice: {
            min: initialTask.openseaBidPrice.min?.toString() || "",
            max: initialTask.openseaBidPrice.max?.toString() || "",
            minType: initialTask.openseaBidPrice.minType || "percentage",
            maxType: initialTask.openseaBidPrice.maxType || "percentage",
          },
          blurBidPrice: {
            min: initialTask.blurBidPrice.min?.toString() || "",
            max: initialTask.blurBidPrice.max?.toString() || "",
            minType: initialTask.blurBidPrice.minType || "percentage",
            maxType: initialTask.blurBidPrice.maxType || "percentage",
          },
          magicEdenBidPrice: {
            min: initialTask.magicEdenBidPrice.min?.toString() || "",
            max: initialTask.magicEdenBidPrice.max?.toString() || "",
            minType: initialTask.magicEdenBidPrice.minType || "percentage",
            maxType: initialTask.magicEdenBidPrice.maxType || "percentage",
          },
          wallet: {
            address: initialTask.wallet.address || "",
            privateKey: initialTask.wallet.privateKey || "",
            openseaApproval: initialTask.wallet.openseaApproval || false,
            magicedenApproval: initialTask.wallet.magicedenApproval || false,
            blurApproval: initialTask.wallet.blurApproval || false,
          },
          bidDuration: initialTask.bidDuration || {
            value: 15,
            unit: "minutes",
          },
          loopInterval: initialTask.loopInterval || {
            value: 15,
            unit: "minutes",
          },
          tokenIds: initialTask.tokenIds || [],
          bidType: initialTask.bidType,
          bidPriceType: initialTask.bidPriceType,
          blurFloorPrice: null,
          magicedenFloorPrice: null,
          openseaFloorPrice: null,
          validatingSlug: false,
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
            maxFloorPrice: "",
            minTraitPrice: "",
            maxTraitPrice: "",
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
          openseaBidPrice: {
            min: "",
            max: "",
            minType: "percentage",
            maxType: "percentage",
          },
          blurBidPrice: {
            min: "",
            max: "",
            minType: "percentage",
            maxType: "percentage",
          },
          magicEdenBidPrice: {
            min: "",
            max: "",
            minType: "percentage",
            maxType: "percentage",
          },
          wallet: {
            address: "",
            privateKey: "",
            openseaApproval: false,
            magicedenApproval: false,
            blurApproval: false,
          },
          bidDuration: { value: 15, unit: "minutes" },
          loopInterval: { value: 15, unit: "minutes" },
          tokenIds: [],
          bidType: "collection",
          bidPriceType: "GENERAL_BID_PRICE",
          blurFloorPrice: null,
          magicedenFloorPrice: null,
          openseaFloorPrice: null,
          validatingSlug: false,
        },
    taskId
  );

  // Add this useEffect to handle initialTask changes
  useEffect(() => {
    if (initialTask?.tokenIds && initialTask.tokenIds.length > 0) {
      const botIds = initialTask.tokenIds.filter(
        (id) => typeof id === "string" && id.startsWith("bot")
      );
      const numericIds = initialTask.tokenIds
        .filter((id): id is number => typeof id === "number")
        .sort((a, b) => a - b);

      const ranges: string[] = [];
      let rangeStart: number | null = null;
      let rangeEnd: number | null = null;

      for (let i = 0; i < numericIds.length; i++) {
        if (rangeStart === null) {
          rangeStart = numericIds[i];
          rangeEnd = numericIds[i];
        } else if (rangeEnd !== null && numericIds[i] === rangeEnd + 1) {
          rangeEnd = numericIds[i];
        } else {
          ranges.push(
            rangeStart === rangeEnd
              ? `${rangeStart}`
              : `${rangeStart}-${rangeEnd}`
          );
          rangeStart = numericIds[i];
          rangeEnd = numericIds[i];
        }
      }

      if (rangeStart !== null) {
        ranges.push(
          rangeStart === rangeEnd
            ? `${rangeStart}`
            : `${rangeStart}-${rangeEnd}`
        );
      }

      setTokenIdInput([...botIds, ...ranges].join(", "));
    } else {
      setTokenIdInput("");
    }
  }, [initialTask?.tokenIds]);

  // Add this useEffect
  useEffect(() => {
    if (isOpen && taskId && initialTask) {
      validateSlug(initialTask.contract.slug);
    }
  }, [isOpen, taskId, initialTask, validateSlug]);

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

  const isFormValid = () => {
    const {
      contract,
      wallet,
      bidPrice,
      openseaBidPrice,
      blurBidPrice,
      magicEdenBidPrice,
      selectedMarketplaces,
    } = formState;
    return (
      contract.slug &&
      contract.contractAddress &&
      wallet.address &&
      (bidPrice.min ||
        openseaBidPrice.min ||
        blurBidPrice.min ||
        magicEdenBidPrice.min) &&
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
          maxFloorPrice: Number(formState.stopOptions.maxFloorPrice),
          minTraitPrice: Number(formState.stopOptions.minTraitPrice),
          maxTraitPrice: Number(formState.stopOptions.maxTraitPrice),
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
        openseaBidPrice: {
          min: Number(formState.openseaBidPrice.min),
          max: Number(formState.openseaBidPrice.max),
          minType: formState.openseaBidPrice.minType,
          maxType: formState.openseaBidPrice.maxType,
        },
        blurBidPrice: {
          min: Number(formState.blurBidPrice.min),
          max: Number(formState.blurBidPrice.max),
          minType: formState.blurBidPrice.minType,
          maxType: formState.blurBidPrice.maxType,
        },
        magicEdenBidPrice: {
          min: Number(formState.magicEdenBidPrice.min),
          max: Number(formState.magicEdenBidPrice.max),
          minType: formState.magicEdenBidPrice.minType,
          maxType: formState.magicEdenBidPrice.maxType,
        },
        tokenIds: formState.tokenIds,
        bidDuration: formState.bidDuration,
        loopInterval: formState.loopInterval,
        bidType: formState.bidType,
      };

      if (taskId) {
        taskStore.editTask(taskId, taskData);
      }
      // else {
      // const newTaskId = taskStore.getLastTaskId();
      // taskStore.editTask(newTaskId, taskData);
      // }
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
        openseaApproval: false,
        magicedenApproval: false,
        blurApproval: false,
      },
      selectedMarketplaces: [],
      running: false,
      slugValid: false,
      magicEdenValid: false,
      blurValid: false,
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
        maxFloorPrice: "",
        minTraitPrice: "",
        maxTraitPrice: "",
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
      openseaBidPrice: {
        min: "",
        max: "",
        minType: "percentage",
        maxType: "percentage",
      },
      blurBidPrice: {
        min: "",
        max: "",
        minType: "percentage",
        maxType: "percentage",
      },
      magicEdenBidPrice: {
        min: "",
        max: "",
        minType: "percentage",
        maxType: "percentage",
      },
      bidDuration: { value: 15, unit: "minutes" },
      loopInterval: { value: 15, unit: "minutes" },
      tokenIds: [],
      bidType: "collection",
      bidPriceType: "GENERAL_BID_PRICE",
      // Add the missing properties
      blurFloorPrice: null,
      magicedenFloorPrice: null,
      openseaFloorPrice: null,
      validatingSlug: false,
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

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormState((prev) => ({
      ...prev,
      contract: {
        ...prev.contract,
        slug: value,
      },
      slugDirty: true,
      selectedTraits: {},
      traits: {
        categories: {},
        counts: {},
      },
      blurValid: false,
      magicEdenValid: false,
      slugValid: false,
    }));
    if (value.length >= 3) {
      debouncedValidateSlug(value);
    } else {
      setFormState((prev) => ({ ...prev, slugValid: false }));
    }
  };

  const processTokenIds = (input: string): (number | string)[] => {
    if (!input.trim()) return [];

    const ranges = input.split(",").map((range) => range.trim());
    const tokenIds: (number | string)[] = [];

    ranges.forEach((range) => {
      if (/^bot\d+$/.test(range)) {
        tokenIds.push(range);
      } else if (/^\d+$/.test(range)) {
        tokenIds.push(parseInt(range));
      } else if (/^\d+\s*-\s*\d+$/.test(range)) {
        const [start, end] = range
          .split("-")
          .map((num) => parseInt(num.trim()));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            tokenIds.push(i);
          }
        }
      }
    });

    return Array.from(new Set(tokenIds));
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
            <div className="mt-6">
              <label htmlFor="slug" className="block text-sm font-medium mb-2">
                Collection slug <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="slug"
                  name="contract.slug"
                  onChange={handleSlugChange}
                  value={formState.contract.slug}
                  placeholder="collection slug"
                  className={`w-full p-3 rounded-lg border border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] ${
                    errors.contract?.slug ? "border-red-500" : ""
                  }`}
                  required
                  autoComplete="off"
                />
                {formState.slugDirty && formState.contract.slug.length > 0 && (
                  <div className="absolute right-3 top-[50%] transform -translate-y-1/2">
                    {formState.validatingSlug ? (
                      <LoadingIcon />
                    ) : errors.contract?.slug || !formState.slugValid ? (
                      <XIcon />
                    ) : (
                      <CheckIcon />
                    )}
                  </div>
                )}
                {errors.contract?.slug && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.contract.slug}
                  </p>
                )}
              </div>
            </div>
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
            <FormSection
              formState={formState}
              errors={errors}
              walletOptions={walletOptions}
              setFormState={setFormState}
              onWalletModalOpen={handleWalletModalOpen}
              handleTraitChange={handleTraitChange}
              handleMarketplaceToggle={handleMarketplaceToggle}
              tokenIdInput={tokenIdInput}
              setTokenIdInput={setTokenIdInput}
            />

            {formState.outbidOptions.outbid ? (
              <OutbidSection
                formState={formState}
                setFormState={setFormState}
              />
            ) : null}
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
