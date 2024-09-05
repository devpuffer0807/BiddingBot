import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ethers, HDNodeWallet } from "ethers";

interface Wallet {
  id: string;
  name: string;
  address: string;
  privateKey: string;
}

interface WalletState {
  wallets: Wallet[];
  addWallet: (name: string, wallet: ethers.Wallet | HDNodeWallet) => void;
  editWallet: (id: string, name: string) => void;
  deleteWallet: (id: string) => void;
  clearWallets: () => void;
  getWallet: (id: string) => Wallet | undefined;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallets: [],
      addWallet: (name, wallet) =>
        set((state) => ({
          wallets: [
            ...state.wallets,
            {
              id: wallet.address,
              name,
              address: wallet.address,
              privateKey: wallet.privateKey,
            },
          ],
        })),
      editWallet: (id, name) =>
        set((state) => ({
          wallets: state.wallets.map((wallet) =>
            wallet.id === id ? { ...wallet, name } : wallet
          ),
        })),
      deleteWallet: (id) =>
        set((state) => ({
          wallets: state.wallets.filter((wallet) => wallet.id !== id),
        })),
      clearWallets: () => set({ wallets: [] }),
      getWallet: (id) => get().wallets.find((wallet) => wallet.id === id),
    }),
    {
      name: "wallet",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str);
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
