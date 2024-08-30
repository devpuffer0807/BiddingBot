import { Task, useTaskStore } from "@/store";
import { useWalletStore } from "@/store/wallet.store";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCallback, useMemo } from "react";
import debounce from "lodash/debounce";

interface TaskFormState {
  slug: string;
  selectedWallet: string;
  minFloorPricePercentage: string;
  maxFloorPricePercentage: string;
  selectedMarketplaces: string[];
  slugValid: boolean | null;
  slugDirty: boolean;
}

export const useTaskForm = (
  initialState: Omit<TaskFormState, "slugValid" | "slugDirty">,
  taskId?: string
) => {
  const { addTask, editTask, tasks } = useTaskStore();
  const { getWallet } = useWalletStore();

  const validationSchema = Yup.object({
    slug: Yup.string().required("Collection slug is required"),
    selectedWallet: Yup.string().required("Wallet selection is required"),
    minFloorPricePercentage: Yup.number()
      .min(0, "Min percentage must be at least 0")
      .max(100, "Min percentage must be at most 100")
      .required("Min floor price percentage is required"),
    maxFloorPricePercentage: Yup.number()
      .min(0, "Max percentage must be at least 0")
      .max(100, "Max percentage must be at most 100")
      .moreThan(
        Yup.ref("minFloorPricePercentage"),
        "Max percentage must be greater than min percentage"
      )
      .required("Max floor price percentage is required"),
    selectedMarketplaces: Yup.array()
      .of(Yup.string())
      .min(1, "At least one marketplace must be selected"),
  });

  const formik = useFormik({
    initialValues: {
      ...initialState,
      slugValid: null,
      slugDirty: false,
    },
    validationSchema,
    onSubmit: (values) => {
      const selectedWallet = getWallet(values.selectedWallet);
      if (!selectedWallet) {
        console.error("Selected wallet not found");
        return;
      }

      const taskData: Omit<Task, "id"> = {
        slug: values.slug,
        selectedWallet: values.selectedWallet,
        walletPrivateKey: selectedWallet.privateKey,
        minFloorPricePercentage: Number(values.minFloorPricePercentage),
        maxFloorPricePercentage: Number(values.maxFloorPricePercentage),
        selectedMarketplaces: values.selectedMarketplaces,
      };

      if (taskId) {
        editTask(taskId, taskData);
      } else {
        addTask(taskData);
      }
    },
  });

  const validateSlug = useCallback(
    async (slug: string) => {
      if (slug.length < 3) {
        formik.setFieldValue("slugValid", false);
        return;
      }

      try {
        const response = await fetch(`/api/ethereum/collections?slug=${slug}`);
        const isValid = response.status === 200;
        formik.setFieldValue("slugValid", isValid);
        console.log("Slug is valid:", isValid);
      } catch (error) {
        console.error("Error validating slug:", error);
        formik.setFieldValue("slugValid", false);
      }
    },
    [formik]
  );

  const debouncedValidateSlug = useMemo(
    () => debounce(validateSlug, 1500),
    [validateSlug]
  );

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    formik.setFieldValue("slug", value);
    formik.setFieldValue("slugDirty", true);

    if (value.length >= 3) {
      debouncedValidateSlug(value);
    } else {
      formik.setFieldValue("slugValid", false);
    }
  };

  const handleMarketplaceToggle = (marketplace: string) => {
    const currentMarketplaces = formik.values.selectedMarketplaces;
    const updatedMarketplaces = currentMarketplaces.includes(marketplace)
      ? currentMarketplaces.filter((m) => m !== marketplace)
      : [...currentMarketplaces, marketplace];
    formik.setFieldValue("selectedMarketplaces", updatedMarketplaces);
  };

  return {
    formik,
    validateSlug,
    handleMarketplaceToggle,
    submitForm: formik.submitForm,
    handleSlugChange,
  };
};
