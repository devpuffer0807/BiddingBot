import { Task, useTaskStore } from "@/store";
import { useWalletStore } from "@/store/wallet.store";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";
import { toast } from "react-toastify";
import { useWebSocket } from "./useWebSocket";

export const useTaskForm = (
  initialState: Omit<
    TaskFormState,
    "slugValid" | "slugDirty" | "magicEdenValid" | "blurValid"
  >,
  taskId?: string
) => {
  const NEXT_PUBLIC_SERVER_WEBSOCKET = process.env
    .NEXT_PUBLIC_SERVER_WEBSOCKET as string;
  const { addTask, editTask, tasks } = useTaskStore();
  const { wallets } = useWalletStore();
  const { sendMessage } = useWebSocket(NEXT_PUBLIC_SERVER_WEBSOCKET);

  const existingTask = useMemo(() => {
    return taskId ? tasks.find((task) => task._id === taskId) : null;
  }, [taskId, tasks]);

  const [formState, setFormState] = useState<TaskFormState>(() => {
    return {
      ...initialState,
      slugValid: existingTask ? existingTask.slugValid : false,
      blurValid: existingTask ? existingTask.blurValid : false,
      magicEdenValid: existingTask ? existingTask.magicEdenValid : false,
      slugDirty: false,
      tags: initialState.tags || [],
      selectedTraits: initialState.selectedTraits || {},
      traits: {
        categories: {},
        counts: {},
      },
      outbidOptions: {
        outbid: initialState.outbidOptions.outbid,
        blurOutbidMargin: initialState.outbidOptions.blurOutbidMargin || "",
        openseaOutbidMargin:
          initialState.outbidOptions.openseaOutbidMargin || "",
        magicedenOutbidMargin:
          initialState.outbidOptions.magicedenOutbidMargin || "",
        counterbid: initialState.outbidOptions.counterbid,
      },
      stopOptions: {
        minFloorPrice: initialState.stopOptions.minFloorPrice || null,
        maxFloorPrice: initialState.stopOptions.maxFloorPrice || null,
        minTraitPrice: initialState.stopOptions.minTraitPrice || null,
        maxTraitPrice: initialState.stopOptions.maxTraitPrice || null,
        maxPurchase: initialState.stopOptions.maxPurchase || null,
        pauseAllBids: initialState.stopOptions.pauseAllBids || false,
        stopAllBids: initialState.stopOptions.stopAllBids || false,
        cancelAllBids: initialState.stopOptions.cancelAllBids || false,
        triggerStopOptions:
          initialState.stopOptions.triggerStopOptions || false,
      },
      bidPrice: {
        min: initialState.bidPrice.min,
        max: initialState.bidPrice.max,
        minType: initialState.bidPrice?.minType || "percentage",
        maxType: initialState.bidPrice?.maxType || "percentage",
      },
      openseaBidPrice: {
        min: initialState.openseaBidPrice.min,
        max: initialState.openseaBidPrice.max,
        minType: initialState.openseaBidPrice?.minType || "percentage",
        maxType: initialState.openseaBidPrice?.maxType || "percentage",
      },
      blurBidPrice: {
        min: initialState.blurBidPrice.min,
        max: initialState.blurBidPrice.max,
        minType: initialState.blurBidPrice?.minType || "percentage",
        maxType: initialState.blurBidPrice?.maxType || "percentage",
      },
      magicEdenBidPrice: {
        min: initialState.magicEdenBidPrice.min,
        max: initialState.magicEdenBidPrice.max,
        minType: initialState.magicEdenBidPrice?.minType || "percentage",
        maxType: initialState.magicEdenBidPrice?.maxType || "percentage",
      },
      bidDuration: {
        value: initialState.bidDuration.value,
        unit: initialState.bidDuration.unit,
      },
      loopInterval: {
        value: initialState.loopInterval.value,
        unit: initialState.loopInterval.unit,
      },
      tokenIds: initialState.tokenIds || [],
      bidType: initialState.bidType || "collection",
      bidPriceType: initialState.bidPriceType || "general",
      blurFloorPrice: null,
      magicedenFloorPrice: null,
      openseaFloorPrice: null,
      validatingSlug: false,
      validationComplete: false,
    };
  });

  const [errors, setErrors] = useState<Partial<TaskFormState>>({});
  const prevInitialStateRef = useRef(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isEqual(initialState, prevInitialStateRef.current)) {
      setFormState((prevState) => ({
        ...initialState,
        slugValid: taskId && existingTask ? existingTask?.slugValid : false,
        magicEdenValid:
          taskId && existingTask ? existingTask?.magicEdenValid : false,
        blurValid: taskId && existingTask ? existingTask?.blurValid : false,
        slugDirty: prevState.slugDirty,
        tags: initialState.tags || [],
        selectedTraits: initialState.selectedTraits || {},
        traits: initialState.traits || { categories: {}, counts: {} },
        outbidOptions: {
          outbid: initialState.outbidOptions.outbid,
          blurOutbidMargin: initialState.outbidOptions.blurOutbidMargin || "",
          openseaOutbidMargin:
            initialState.outbidOptions.openseaOutbidMargin || "",
          magicedenOutbidMargin:
            initialState.outbidOptions.magicedenOutbidMargin || "",
          counterbid: initialState.outbidOptions.counterbid,
        },
        stopOptions: {
          minFloorPrice: initialState.stopOptions.minFloorPrice || "",
          maxFloorPrice: initialState.stopOptions.maxFloorPrice || "",
          minTraitPrice: initialState.stopOptions.minTraitPrice || "",
          maxTraitPrice: initialState.stopOptions.maxTraitPrice || "",
          maxPurchase: initialState.stopOptions.maxPurchase || "",
          pauseAllBids: initialState.stopOptions.pauseAllBids || false,
          stopAllBids: initialState.stopOptions.stopAllBids || false,
          cancelAllBids: initialState.stopOptions.cancelAllBids || false,
          triggerStopOptions:
            initialState.stopOptions.triggerStopOptions || false,
        },
        bidPrice: {
          min: initialState.bidPrice.min,
          max: initialState.bidPrice.max,
          minType: initialState.bidPrice.minType,
          maxType: initialState.bidPrice.maxType,
        },
        openseaBidPrice: {
          min: initialState.openseaBidPrice.min,
          max: initialState.openseaBidPrice.max,
          minType: initialState.openseaBidPrice.minType,
          maxType: initialState.openseaBidPrice.maxType,
        },
        blurBidPrice: {
          min: initialState.blurBidPrice.min,
          max: initialState.blurBidPrice.max,
          minType: initialState.blurBidPrice.minType,
          maxType: initialState.blurBidPrice.maxType,
        },
        magicEdenBidPrice: {
          min: initialState.magicEdenBidPrice.min,
          max: initialState.magicEdenBidPrice.max,
          minType: initialState.magicEdenBidPrice.minType,
          maxType: initialState.magicEdenBidPrice.maxType,
        },
      }));
      prevInitialStateRef.current = initialState;
    }
  }, [existingTask, initialState, taskId]);

  const validateSlug = useCallback(
    async (slug: string) => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      if (slug.length < 3 && formState.contract.slug.length < 3) {
        setFormState((prev) => ({
          ...prev,
          slugValid: false,
          magicEdenValid: false,
          blurValid: false,
          blurFloorPrice: null,
          magicedenFloorPrice: null,
          openseaFloorPrice: null,
          validatingSlug: false,
        }));
        return;
      }

      setFormState((prev) => ({
        ...prev,
        validatingSlug: true,
      }));

      try {
        const response = await fetch(`/api/ethereum/collections?slug=${slug}`, {
          signal: abortControllerRef.current.signal,
        });

        if (response.status === 200) {
          const data = await response.json();
          const contractAddress = data.contracts[0]?.address || "";

          setFormState((prev) => ({
            ...prev,
            contract: {
              ...prev.contract,
              contractAddress,
            },
            slugValid: !!contractAddress,
            validatingSlug: false,
          }));

          if (!!contractAddress) {
            try {
              setFormState((prev) => ({
                ...prev,
                validationComplete: false,
              }));
              const detailsResponse = await fetch(
                `/api/ethereum/details?slug=${slug}&address=${contractAddress}`,
                { signal: abortControllerRef.current.signal }
              );
              if (detailsResponse.ok) {
                const detailsData = await detailsResponse.json();
                setFormState((prev) => ({
                  ...prev,
                  magicEdenValid: detailsData.magicEdenValid,
                  blurValid: detailsData.blurValid,
                  blurFloorPrice: detailsData.blurFloorPrice,
                  magicedenFloorPrice: detailsData.magicedenFloorPrice,
                  openseaFloorPrice: detailsData.openseaFloorPrice,
                  traits: detailsData.traits || prev.traits,
                  validationComplete: true,
                }));
              }
            } catch (error: any) {
              if (error.name === "AbortError") {
                // Request was aborted, do nothing
                return;
              }
              console.error("Error fetching collection details:", error);
            }
          }
        } else {
          setFormState((prev) => ({
            ...prev,
            slugValid: false,
            magicEdenValid: false,
            blurValid: false,
            blurFloorPrice: null,
            magicedenFloorPrice: null,
            openseaFloorPrice: null,
            validatingSlug: false,
            selectedTraits: {},
            traits: { categories: {}, counts: {} },
            validationComplete: true,
          }));
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          // Request was aborted, do nothing
          return;
        }

        console.error("Error validating slug:", error);
        setFormState((prev) => ({
          ...prev,
          slugValid: false,
          magicEdenValid: false,
          blurValid: false,
          blurFloorPrice: null,
          magicedenFloorPrice: null,
          openseaFloorPrice: null,
          validatingSlug: false,
          validationComplete: true,
        }));

        toast.error("Failed to validate collection slug");
      }
    },
    [formState.contract.slug.length]
  );

  const debouncedValidateSlug = useMemo(
    () => debounce(validateSlug, 500),
    [validateSlug]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));

    if (name === "contract.slug") {
      setFormState((prev) => ({
        ...prev,
        slugDirty: true,
        selectedTraits: initialState.selectedTraits || {},
        traits: initialState.traits || { categories: {}, counts: {} },
      }));
      if (value.length >= 3) {
        debouncedValidateSlug(value);
      } else {
        setFormState((prev) => ({
          ...prev,
          slugValid: false,
          magicEdenValid: false,
          blurValid: false,
        }));
      }
    }
  };

  const handleMarketplaceToggle = (marketplace: string) => {
    setFormState((prev) => ({
      ...prev,
      selectedMarketplaces: prev.selectedMarketplaces.includes(marketplace)
        ? prev.selectedMarketplaces.filter((m) => m !== marketplace)
        : [...prev.selectedMarketplaces, marketplace],
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<TaskFormState> = {};

    if (!formState.wallet.address) {
      newErrors.wallet = {
        address: "Wallet selection is required",
        privateKey: "",
        openseaApproval: false,
        blurApproval: false,
        magicedenApproval: false,
      };
    }
    if (formState.selectedMarketplaces.length === 0)
      newErrors.selectedMarketplaces = [
        "At least one marketplace must be selected",
      ];
    if (formState.bidType === "token" && formState.tokenIds.length === 0) {
      newErrors.tokenIds = [
        "Token IDs cannot be empty when bid type is 'token'",
      ] as unknown as number[];
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const selectedWallet = wallets.find(
        (wallet) => wallet.address === formState.wallet.address
      );
      if (!selectedWallet) {
        toast.error("Selected wallet not found");
        return false;
      }

      const taskData: Omit<Task, "_id" | "user"> = {
        contract: {
          slug: formState.contract.slug.toLowerCase(),
          contractAddress: formState.contract.contractAddress,
        },
        wallet: {
          address: formState.wallet.address,
          privateKey: selectedWallet.privateKey,
          openseaApproval: selectedWallet.openseaApproval,
          magicedenApproval: selectedWallet.magicedenApproval,
          blurApproval: selectedWallet.blurApproval,
        },
        selectedMarketplaces: formState.selectedMarketplaces,
        running: formState.running,
        tags: formState.tags,
        selectedTraits: formState.selectedTraits,
        traits: formState.traits,
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
        bidDuration: {
          value: formState.bidDuration.value,
          unit: formState.bidDuration.unit,
        },
        loopInterval: {
          value: formState.loopInterval.value,
          unit: formState.loopInterval.unit,
        },
        tokenIds: formState.tokenIds,
        bidType: formState.bidType,
        bidPriceType: formState.bidPriceType || "GENERAL_BID_PRICE",
        slugValid: formState.slugValid,
        magicEdenValid: formState.magicEdenValid,
        blurValid: formState.blurValid,
      };

      try {
        if (taskId) {
          // Check if this task exists in importedTasks
          const isImportedTask = useTaskStore
            .getState()
            .importedTasks.some((task) => task._id === taskId);

          if (isImportedTask) {
            // For imported tasks, just update the store
            const updatedTask = { ...taskData, _id: taskId };
            useTaskStore.getState().editImportedTask(taskId, updatedTask);
            return true;
          } else {
            // Original API logic for regular tasks
            const response = await fetch(`/api/task/${taskId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(taskData),
              credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to update task");
            const updatedTask = await response.json();
            const message = { endpoint: "updated-task", data: updatedTask };

            editTask(taskId, updatedTask);
            console.log("Task updated successfully");

            sendMessage(message);
          }
        } else {
          const response = await fetch("/api/task", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskData),
            credentials: "include",
          });
          if (!response.ok) throw new Error("Failed to create task");
          const newTask = await response.json();
          const message = { endpoint: "new-task", data: newTask };
          const fetchResponse = await fetch(`/api/task/${newTask._id}`);
          if (!fetchResponse.ok) throw new Error("Failed to fetch new task");
          const fetchedTask = await fetchResponse.json();

          addTask(fetchedTask);
          sendMessage(message);
          toast.success("Task created successfully");

          setFormState({
            ...initialState,
            slugValid: false,
            blurValid: false,
            magicEdenValid: false,
            slugDirty: false,
            blurFloorPrice: null,
            magicedenFloorPrice: null,
            openseaFloorPrice: null,
            validatingSlug: false,
          });
        }
        return true;
      } catch (error) {
        console.error("Error submitting task:", error);
        return false;
      }
    }
    return false;
  };

  const handleTagChange = (selectedTags: { name: string; color: string }[]) => {
    setFormState((prev) => ({ ...prev, tags: selectedTags }));
  };

  const handleTraitChange = (
    traits: Record<
      string,
      { name: string; availableInMarketplaces: string[] }[]
    >
  ) => {
    console.log({ traits });

    setFormState((prev) => ({ ...prev, selectedTraits: traits }));
  };

  return {
    formState,
    errors,
    handleChange,
    handleMarketplaceToggle,
    handleSubmit,
    validateSlug,
    setFormState,
    handleTagChange,
    handleTraitChange,
    debouncedValidateSlug,
  };
};

export interface TaskFormState {
  contract: {
    slug: string;
    contractAddress: string;
  };
  selectedMarketplaces: string[];
  running: boolean;
  slugValid: boolean;
  blurValid: boolean;
  magicEdenValid: boolean;
  slugDirty: boolean;
  tags: { name: string; color: string }[];
  selectedTraits: Record<
    string,
    { name: string; availableInMarketplaces: string[] }[]
  >;
  traits: {
    categories: Record<string, string>;
    counts: Record<
      string,
      Record<
        string,
        {
          count: number;
          availableInMarketplaces: string[];
          magicedenFloor: number;
          blurFloor: number;
          openseaFloor: number;
        }
      >
    >;
  };
  outbidOptions: {
    outbid: boolean;
    blurOutbidMargin: string | null;
    openseaOutbidMargin: string | null;
    magicedenOutbidMargin: string | null;
    counterbid: boolean;
  };
  stopOptions: {
    minFloorPrice: string | null;
    maxFloorPrice: string | null;
    minTraitPrice: string | null;
    maxTraitPrice: string | null;
    maxPurchase: string | null;
    pauseAllBids: boolean;
    stopAllBids: boolean;
    cancelAllBids: boolean;
    triggerStopOptions: boolean;
  };
  bidPrice: {
    min: string;
    max: string;
    minType: "percentage" | "eth";
    maxType: "percentage" | "eth";
  };
  openseaBidPrice: {
    min: string;
    max: string;
    minType: "percentage" | "eth";
    maxType: "percentage" | "eth";
  };
  blurBidPrice: {
    min: string;
    max: string;
    minType: "percentage" | "eth";
    maxType: "percentage" | "eth";
  };
  magicEdenBidPrice: {
    min: string;
    max: string;
    minType: "percentage" | "eth";
    maxType: "percentage" | "eth";
  };
  wallet: {
    address: string;
    privateKey: string;
    openseaApproval: boolean;
    blurApproval: boolean;
    magicedenApproval: boolean;
  };
  bidDuration: { value: number; unit: string };
  loopInterval: { value: number; unit: string };
  tokenIds: (number | string)[];
  bidType: string;
  bidPriceType: string;
  blurFloorPrice: number | null;
  magicedenFloorPrice: number | null;
  openseaFloorPrice: number | null;
  validatingSlug: boolean;
  validationComplete: boolean;
}
