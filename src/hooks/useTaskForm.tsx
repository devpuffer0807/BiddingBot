import { useState, useEffect } from "react";

interface TaskFormState {
  slug: string;
  minBidEth: string;
  maxBidEth: string;
  selectedWallet: string;
  minFloorPricePercentage: string;
  maxFloorPricePercentage: string;
  selectedMarketplaces: string[];
  slugValid: boolean | null;
  slugDirty: boolean;
}

export const useTaskForm = (
  initialState: Omit<TaskFormState, "slugValid" | "slugDirty">
) => {
  const [formState, setFormState] = useState<TaskFormState>({
    ...initialState,
    slugValid: null,
    slugDirty: false,
  });
  const [errors, setErrors] = useState<Partial<TaskFormState>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "slug") {
      setFormState((prev) => ({ ...prev, slug: value, slugDirty: true }));
    } else if (name === "minBidEth" || name === "maxBidEth") {
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (regex.test(value) || value === "") {
        setFormState((prev) => ({ ...prev, [name]: value }));
      }
    } else if (
      name === "minFloorPricePercentage" ||
      name === "maxFloorPricePercentage"
    ) {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        setFormState((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleWalletChange = (value: string) => {
    setFormState((prev) => ({ ...prev, selectedWallet: value }));
  };

  const handleMarketplaceToggle = (marketplace: string) => {
    setFormState((prev) => {
      const updatedMarketplaces = prev.selectedMarketplaces.includes(
        marketplace
      )
        ? prev.selectedMarketplaces.filter((m) => m !== marketplace)
        : [...prev.selectedMarketplaces, marketplace];
      return { ...prev, selectedMarketplaces: updatedMarketplaces };
    });
  };

  const validateSlug = async (slug: string) => {
    try {
      // Replace this with your actual API call
      const response = await fetch(`/api/validate-slug?slug=${slug}`);
      const isValid = await response.json();
      setFormState((prev) => ({ ...prev, slugValid: isValid }));
    } catch (error) {
      console.error("Error validating slug:", error);
      setFormState((prev) => ({ ...prev, slugValid: false }));
    }
  };

  useEffect(() => {
    if (formState.slugDirty && formState.slug) {
      const debounceTimer = setTimeout(() => {
        validateSlug(formState.slug);
      }, 500);

      return () => clearTimeout(debounceTimer);
    }
  }, [formState.slug, formState.slugDirty]);

  const validateForm = () => {
    const newErrors: Partial<TaskFormState> = {};
    if (!formState.slug) newErrors.slug = "Collection slug is required";
    if (!formState.minBidEth) newErrors.minBidEth = "Min bid is required";
    if (!formState.maxBidEth) newErrors.maxBidEth = "Max bid is required";
    if (!formState.selectedWallet)
      newErrors.selectedWallet = "Wallet selection is required";
    if (formState.selectedMarketplaces.length === 0)
      newErrors.selectedMarketplaces = [
        "At least one marketplace must be selected",
      ];
    if (!formState.minFloorPricePercentage)
      newErrors.minFloorPricePercentage =
        "Min floor price percentage is required";
    if (!formState.maxFloorPricePercentage)
      newErrors.maxFloorPricePercentage =
        "Max floor price percentage is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    formState,
    errors,
    handleInputChange,
    handleWalletChange,
    handleMarketplaceToggle,
    validateForm,
  };
};
