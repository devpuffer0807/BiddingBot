import { Task, useTaskStore } from "@/store";
import { useWalletStore } from "@/store/wallet.store";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";

interface TaskFormState {
  slug: string;
  selectedWallet: string;
  minFloorPricePercentage: string;
  maxFloorPricePercentage: string;
  selectedMarketplaces: string[];
  running: boolean;
  slugValid: boolean | null;
  slugDirty: boolean;
  contractAddress: string;
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
  });

  const [errors, setErrors] = useState<Partial<TaskFormState>>({});

  const prevInitialStateRef = useRef(initialState);

  // Add this useEffect to update formState when initialState changes
  useEffect(() => {
    if (!isEqual(initialState, prevInitialStateRef.current)) {
      setFormState((prevState) => ({
        ...initialState,
        slugValid: taskId ? true : prevState.slugValid,
        slugDirty: prevState.slugDirty,
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
        console.log("Slug is valid:", !!contractAddress);
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

  const handleSubmit = () => {
    if (validateForm()) {
      const selectedWallet = wallets.find(
        (wallet) => wallet.id === formState.selectedWallet
      );
      if (!selectedWallet) {
        console.error("Selected wallet not found");
        return;
      }

      const taskData: Omit<Task, "id"> = {
        slug: formState.slug.toLowerCase(),
        selectedWallet: formState.selectedWallet,
        walletPrivateKey: selectedWallet.privateKey,
        minFloorPricePercentage: Number(formState.minFloorPricePercentage),
        maxFloorPricePercentage: Number(formState.maxFloorPricePercentage),
        selectedMarketplaces: formState.selectedMarketplaces,
        running: formState.running,
        contractAddress: formState.contractAddress, // Add this line
      };

      if (taskId) {
        editTask(taskId, taskData);
      } else {
        addTask(taskData);
      }
      return true;
    }
    return false;
  };

  return {
    formState,
    errors,
    handleChange,
    handleMarketplaceToggle,
    handleSubmit,
    validateSlug,
    setFormState,
  };
};
