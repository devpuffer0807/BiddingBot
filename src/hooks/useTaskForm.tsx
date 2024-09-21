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
  const { addTask, editTask } = useTaskStore();
  const { wallets } = useWalletStore();
  const { sendMessage } = useWebSocket(NEXT_PUBLIC_SERVER_WEBSOCKET);

  const [formState, setFormState] = useState<TaskFormState>({
    ...initialState,
    slugValid: taskId ? true : null,
    blurValid: taskId ? true : null,
    magicEdenValid: taskId ? true : null,
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
      openseaOutbidMargin: initialState.outbidOptions.openseaOutbidMargin || "",
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
      triggerStopOptions: initialState.stopOptions.triggerStopOptions || false,
    },
    bidPrice: {
      min: initialState.bidPrice.min,
      max: initialState.bidPrice.max,
      minType: initialState.bidPrice?.minType || "percentage",
      maxType: initialState.bidPrice?.maxType || "percentage",
    },
    bidDuration: { value: 15, unit: "minutes" },
    tokenIds: [],
    bidType: "collection",
  });

  const [errors, setErrors] = useState<Partial<TaskFormState>>({});
  const prevInitialStateRef = useRef(initialState);

  useEffect(() => {
    if (!isEqual(initialState, prevInitialStateRef.current)) {
      setFormState((prevState) => ({
        ...initialState,
        slugValid: taskId ? true : prevState.slugValid,
        magicEdenValid: taskId ? true : prevState.magicEdenValid,
        blurValid: taskId ? true : prevState.blurValid,
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
        bidDuration: { value: 15, unit: "minutes" },
        bidType: "collection",
      }));
      prevInitialStateRef.current = initialState;
    }
  }, [initialState, taskId]);

  const validateSlug = useCallback(async (slug: string) => {
    if (slug.length < 3) {
      setFormState((prev) => ({
        ...prev,
        slugValid: false,
        magicEdenValid: false,
        blurValid: false,
      }));
      return;
    }

    try {
      const response = await fetch(`/api/ethereum/collections?slug=${slug}`);
      if (response.status === 200) {
        const data = await response.json();
        const contractAddress = data.contracts[0]?.address || "";
        const magicEdenValid = data.magicEdenValid;
        const blurValid = data.blurValid;

        setFormState((prev) => ({
          ...prev,
          slugValid: !!contractAddress,
          contract: {
            ...prev.contract,
            contractAddress,
          },
          magicEdenValid: magicEdenValid,
          blurValid: blurValid,
        }));

        if (data.traits) {
          setFormState((prev) => ({
            ...prev,
            traits: data.traits,
          }));
        }
      } else {
        console.log();

        setFormState((prev) => ({
          ...prev,
          slugValid: false,
          magicEdenValid: false,
          blurValid: false,
        }));
      }
    } catch (error) {
      console.error("Error validating slug:", error);
      setFormState((prev) => ({
        ...prev,
        slugValid: false,
        magicEdenValid: false,
        blurValid: false,
      }));
    }
  }, []);

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
        blurValid: taskId ? true : null,
        magicEdenValid: taskId ? true : null,
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
      };
    }
    if (formState.selectedMarketplaces.length === 0)
      newErrors.selectedMarketplaces = [
        "At least one marketplace must be selected",
      ];
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

      const taskData: Omit<Task, "_id"> = {
        contract: {
          slug: formState.contract.slug.toLowerCase(),
          contractAddress: formState.contract.contractAddress,
        },
        wallet: {
          address: formState.wallet.address,
          privateKey: selectedWallet.privateKey,
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
        bidDuration: formState.bidDuration,
        tokenIds: formState.tokenIds,
        bidType: formState.bidType,
      };

      try {
        if (taskId) {
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
          sendMessage(message);
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

  const handleTraitChange = (traits: Record<string, string[]>) => {
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
  slugValid: boolean | null;
  blurValid: boolean | null;
  magicEdenValid: boolean | null;
  slugDirty: boolean;
  tags: { name: string; color: string }[];
  selectedTraits: Record<string, string[]>;
  traits: {
    categories: Record<string, string>;
    counts: Record<string, Record<string, number>>;
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
  wallet: {
    address: string;
    privateKey: string;
  };
  bidDuration: { value: number; unit: string };
  tokenIds: number[];
  bidType: "collection" | "token";
}
