import { Task, useTaskStore } from "@/store";
import { useWalletStore } from "@/store/wallet.store";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";
import { toast } from "react-toastify";

export interface TaskFormState {
  slug: string;
  selectedWallet: string;
  minFloorPricePercentage: string;
  maxFloorPricePercentage: string;
  selectedMarketplaces: string[];
  running: boolean;
  slugValid: boolean | null;
  slugDirty: boolean;
  contractAddress: string;
  tags: { name: string; color: string }[];
  selectedTraits: Record<string, string[]>;
  traits: {
    categories: Record<string, string>;
    counts: Record<string, Record<string, number>>;
  };
  outbid: boolean; // Add this line
  blurOutbidMargin: string | null; // Add this line
  openseaOutbidMargin: string | null; // Add this line
  magicedenOutbidMargin: string | null; // Add this line
  counterbid: boolean; // Add this line
  minFloorPrice: string; // Add this line
  minTraitPrice: string; // Add this line
  maxPurchase: string; // Add this line
  pauseAllBids: boolean; // Add this line
  stopAllBids: boolean; // Add this line
  cancelAllBids: boolean; // Add this line
}

export const useTaskForm = (
  initialState: Omit<TaskFormState, "slugValid" | "slugDirty">,
  taskId?: string
) => {
  const { addTask, editTask } = useTaskStore();
  const { wallets } = useWalletStore();

  const [formState, setFormState] = useState<TaskFormState>({
    ...initialState,
    slugValid: taskId ? true : null,
    slugDirty: false,
    tags: initialState.tags || [],
    selectedTraits: initialState.selectedTraits || {},
    traits: {
      categories: {},
      counts: {},
    },
    outbid: initialState.outbid,
    blurOutbidMargin: initialState.blurOutbidMargin || "", // Add this line
    openseaOutbidMargin: initialState.openseaOutbidMargin || "", // Add this line
    magicedenOutbidMargin: initialState.magicedenOutbidMargin || "", // Add this line
    counterbid: initialState.counterbid, // Add this line
    minFloorPrice: initialState.minFloorPrice || "", // Add this line
    minTraitPrice: initialState.minTraitPrice || "", // Add this line
    maxPurchase: initialState.maxPurchase || "", // Add this line
    pauseAllBids: initialState.pauseAllBids, // Add this line
    stopAllBids: initialState.stopAllBids, // Add this line
    cancelAllBids: initialState.cancelAllBids, // Add this line
  });

  const [errors, setErrors] = useState<Partial<TaskFormState>>({});

  const prevInitialStateRef = useRef(initialState);

  useEffect(() => {
    if (!isEqual(initialState, prevInitialStateRef.current)) {
      setFormState((prevState) => ({
        ...initialState,
        slugValid: taskId ? true : prevState.slugValid,
        slugDirty: prevState.slugDirty,
        tags: initialState.tags || [],
        selectedTraits: initialState.selectedTraits || {},
      }));
      prevInitialStateRef.current = initialState;
    }
  }, [initialState, taskId]);

  const validateSlug = useCallback(async (slug: string) => {
    if (slug.length < 3) {
      setFormState((prev) => ({ ...prev, slugValid: false }));
      return;
    }

    try {
      const response = await fetch(`/api/ethereum/collections?slug=${slug}`);
      if (response.status === 200) {
        const data = await response.json();
        const contractAddress = data.contracts[0]?.address || "";
        setFormState((prev) => ({
          ...prev,
          slugValid: !!contractAddress,
          contractAddress,
        }));

        // Update the traits in the form state
        if (data.traits) {
          setFormState((prev) => ({
            ...prev,
            traits: data.traits,
          }));
        }
      } else {
        setFormState((prev) => ({ ...prev, slugValid: false }));
      }
    } catch (error) {
      console.error("Error validating slug:", error);
      setFormState((prev) => ({ ...prev, slugValid: false }));
    }
  }, []);

  const debouncedValidateSlug = useMemo(
    () => debounce(validateSlug, 1500),
    [validateSlug]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));

    if (name === "slug") {
      setFormState((prev) => ({ ...prev, slugDirty: true }));
      if (value.length >= 3) {
        debouncedValidateSlug(value);
      } else {
        setFormState((prev) => ({ ...prev, slugValid: false }));
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

    if (!formState.slug) newErrors.slug = "Collection slug is required";
    if (!formState.selectedWallet)
      newErrors.selectedWallet = "Wallet selection is required";
    if (!formState.minFloorPricePercentage)
      newErrors.minFloorPricePercentage =
        "Min floor price percentage is required";
    if (!formState.maxFloorPricePercentage)
      newErrors.maxFloorPricePercentage =
        "Max floor price percentage is required";
    if (formState.selectedMarketplaces.length === 0)
      newErrors.selectedMarketplaces = [
        "At least one marketplace must be selected",
      ];
    if (!formState.minFloorPrice)
      newErrors.minFloorPrice = "Minimum floor price is required"; // Add this line
    if (!formState.minTraitPrice)
      newErrors.minTraitPrice = "Minimum trait price is required"; // Add this line
    if (!formState.maxPurchase)
      newErrors.maxPurchase = "Maximum purchase is required"; // Add this line

    const minPercentage = Number(formState.minFloorPricePercentage);
    const maxPercentage = Number(formState.maxFloorPricePercentage);

    if (minPercentage < 0 || minPercentage > 100)
      newErrors.minFloorPricePercentage =
        "Min percentage must be between 0 and 100";
    if (maxPercentage < 0 || maxPercentage > 100)
      newErrors.maxFloorPricePercentage =
        "Max percentage must be between 0 and 100";
    if (maxPercentage <= minPercentage)
      newErrors.maxFloorPricePercentage =
        "Max percentage must be greater than min percentage";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const selectedWallet = wallets.find(
        (wallet) => wallet.address === formState.selectedWallet
      );
      if (!selectedWallet) {
        toast.error("Selected wallet not found");
        return false;
      }

      const taskData: Omit<Task, "_id"> = {
        slug: formState.slug.toLowerCase(),
        selectedWallet: formState.selectedWallet,
        walletPrivateKey: selectedWallet.privateKey,
        minFloorPricePercentage: Number(formState.minFloorPricePercentage),
        maxFloorPricePercentage: Number(formState.maxFloorPricePercentage),
        selectedMarketplaces: formState.selectedMarketplaces,
        running: formState.running,
        contractAddress: formState.contractAddress,
        tags: formState.tags,
        selectedTraits: formState.selectedTraits,
        traits: formState.traits,
        outbid: formState.outbid,
        blurOutbidMargin: formState.outbid
          ? Number(formState.blurOutbidMargin)
          : null, // Add this line
        openseaOutbidMargin: formState.outbid
          ? Number(formState.openseaOutbidMargin)
          : null, // Add this line
        magicedenOutbidMargin: formState.outbid
          ? Number(formState.magicedenOutbidMargin)
          : null, // Add this line
        counterbid: formState.counterbid, // Add this line
        minFloorPrice: Number(formState.minFloorPrice), // Add this line
        minTraitPrice: Number(formState.minTraitPrice), // Add this line
        maxPurchase: Number(formState.maxPurchase), // Add this line
        pauseAllBids: formState.pauseAllBids, // Add this line
        stopAllBids: formState.stopAllBids, // Add this line
        cancelAllBids: formState.cancelAllBids, // Add this line
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
          editTask(taskId, updatedTask);
        } else {
          const response = await fetch("/api/task", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskData),
            credentials: "include",
          });
          if (!response.ok) throw new Error("Failed to create task");
          const newTask = await response.json();
          addTask(newTask);
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
  };
};
