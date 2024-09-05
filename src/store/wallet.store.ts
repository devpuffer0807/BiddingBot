import { create } from "zustand";

interface Wallet {
  _id: string;
  name: string;
  address: string;
  privateKey: string;
}

interface WalletState {
  wallets: Wallet[];
  addWallet: (wallet: Omit<Wallet, "id">) => void;
  editWallet: (id: string, name: string) => void;
  deleteWallet: (id: string) => void;
  clearWallets: () => void;
  getWallet: (id: string) => Wallet | undefined;
}

export const useWalletStore = create<WalletState>()(
  // Remove the persist middleware
  (set, get) => ({
    wallets: [],
    addWallet: (wallet) =>
      set((state) => ({
        wallets: [
          ...state.wallets,
          {
            _id: wallet.address,
            name: wallet.name,
            address: wallet.address,
            privateKey: wallet.privateKey,
          },
        ],
      })),
    editWallet: (id, name) =>
      set((state) => ({
        wallets: state.wallets.map((wallet) =>
          wallet._id === id ? { ...wallet, name } : wallet
        ),
      })),
    deleteWallet: (id) =>
      set((state) => ({
        wallets: state.wallets.filter((wallet) => wallet._id !== id),
      })),
    clearWallets: () => set({ wallets: [] }),
    getWallet: (id) => get().wallets.find((wallet) => wallet._id === id),
  })
);
