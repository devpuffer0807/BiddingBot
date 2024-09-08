import React, { useEffect, useState, useCallback } from "react";
import Modal from "../common/Modal";
import VisibleIcon from "@/assets/svg/VisibleIcon";
import InvisibleIcon from "@/assets/svg/InvisibleIcon";
import { ethers } from "ethers";
import { Wallet } from "ethers";
import { HDNodeWallet } from "ethers";
import {
  generateWalletName,
  importWalletFromMnemonic,
  importWalletFromPrivateKey,
  isValidPrivateKeyOrSeedPhrase,
} from "@/utils";
import { toast } from "react-toastify";
import { useWalletStore } from "@/store";

const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  const [walletName, setWalletName] = useState("");
  const [importValue, setImportValue] = useState("");
  const [showImportInput, setShowImportInput] = useState(false);
  const [visible, setVisible] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [step, setStep] = useState(1);
  const [wallet, setWallet] = useState<ethers.Wallet | HDNodeWallet | null>(
    null
  );
  const addWallet = useWalletStore((state) => state.addWallet);

  useEffect(() => {
    const setupProvider = async () => {
      if (window.ethereum) {
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethersProvider);
      }
    };
    setupProvider();
  }, []);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await fetch("/api/wallet"); // Fetch wallets from the API
        if (!response.ok) throw new Error("Failed to fetch wallets");
        const wallets = await response.json();
        // Optionally, you can set the fetched wallets to state or store
      } catch (error) {
        console.error("Error fetching wallets:", error);
        toast.error("Error fetching wallets");
      }
    };

    fetchWallets();
  }, []);

  const createNewWallet = useCallback(() => {
    try {
      const newWallet = ethers.Wallet.createRandom();
      console.log("New wallet created:", newWallet);
      return newWallet;
    } catch (error) {
      console.error("Error creating new wallet:", error);
      throw error;
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      let newWallet: Wallet | HDNodeWallet | null = null;

      if (showImportInput) {
        const source = isValidPrivateKeyOrSeedPhrase(importValue);
        if (!source) {
          throw new Error("Invalid private key or seed phrase");
        }

        newWallet =
          source === "MNEMONIC"
            ? importWalletFromMnemonic(importValue)
            : importWalletFromPrivateKey(importValue);
      } else {
        newWallet = createNewWallet();
      }

      if (newWallet) {
        setWallet(newWallet);
        // Add wallet to the database
        const response = await fetch("/api/wallet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: walletName || generateWalletName(),
            address: newWallet.address,
            privateKey: newWallet.privateKey, // Ensure this is available
          }),
        });

        if (!response.ok) throw new Error("Failed to add wallet to database");

        addWallet({
          _id: newWallet.address,
          name: walletName || generateWalletName(),
          address: newWallet.address,
          privateKey: newWallet.privateKey,
        });

        setStep(2);
        toast.success("Wallet created successfully!");

        // Reset state
        setWalletName("");
        setImportValue("");
        setShowImportInput(false);
        setVisible(false);
      } else {
        throw new Error("Failed to create or import wallet");
      }
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast.error(
        `Error: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    }
  }, [showImportInput, importValue, createNewWallet, walletName, addWallet]);

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div onClick={handleContentClick}>
        {step === 1 ? (
          <>
            <h2 className="text-center text-xl font-bold my-4 text-Brand/Brand-1">
              {showImportInput
                ? "IMPORT EXISTING WALLET"
                : "CREATE A NEW WALLET"}
            </h2>
            <>
              <div className="my-4 w-full">
                <label
                  htmlFor="walletName"
                  className="block text-sm text-Neutral/Neutral-1100-[night] font-sans"
                >
                  Wallet Name
                </label>
                <input
                  maxLength={64}
                  type="text"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder={`Wallet 1`}
                  className="mt-2 block w-full border rounded-lg shadow-sm p-4 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night]"
                  required
                  autoComplete="off"
                />
              </div>

              {showImportInput && (
                <div className="mt-8 mb-4 w-full">
                  <label
                    htmlFor="walletName"
                    className="block text-sm text-Neutral/Neutral-1100-[night] font-sans"
                  >
                    Private Key / Seed Phrase
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={importValue}
                      onChange={(e) => setImportValue(e.target.value)}
                      placeholder="Enter private key or seed phrase"
                      className={`mt-2 block w-full border rounded-lg shadow-sm p-4 pr-10 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] ${
                        !visible ? "text-security" : ""
                      }`}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setVisible(!visible)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {visible ? <VisibleIcon /> : <InvisibleIcon />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <p
                  className="text-sm font-sans cursor-pointer text-Brand/Brand-1"
                  onClick={() => setShowImportInput(!showImportInput)}
                >
                  {showImportInput
                    ? "hide"
                    : "Import from private key or phrase"}
                </p>
              </div>
            </>

            <div className="flex justify-end mt-8">
              <button
                className="px-12 rounded py-3 bg-Brand/Brand-1 text-white text-sm font-bold"
                onClick={handleSubmit}
              >
                {showImportInput ? "IMPORT" : "CREATE"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-center text-xl font-bold my-4 text-Brand/Brand-1">
              Wallet Details
            </h2>
            <div className="flex flex-col space-y-4">
              <p>Address: {wallet?.address}</p>
              <div>
                <p>Private Key:</p>
                <p className="break-all">
                  {visible
                    ? wallet?.privateKey
                    : "••••••••••••••••••••••••••••••••••••••••••••"}
                </p>
                <button
                  onClick={() => setVisible(!visible)}
                  className="text-sm text-Brand/Brand-1 mt-1"
                >
                  {visible ? "Hide" : "Show"} Private Key
                </button>
              </div>
              <div
                className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
                role="alert"
              >
                <p className="font-bold">Warning</p>
                <p>
                  Please copy and securely store your private key or seed
                  phrase. This is the only way to recover your wallet if you
                  lose access.
                </p>
              </div>
              <div className="flex justify-between">
                <button
                  className="px-12 rounded py-3 bg-Brand/Brand-1 text-white text-sm font-bold"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default WalletModal;

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}
