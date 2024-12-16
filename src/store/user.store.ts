import { User } from "@/interface/user.interface";
import { createAccount, retrieveAccount } from "@/services/user";
import { WebAuthn } from "@/services/web-authn";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserStore {
  user: User | null;
  isLoading: boolean;
  createUser(): Promise<void>;
  login(): Promise<void>;
  logout(): void;
}

export const userStore = create(
  persist<UserStore>(
    (set) => ({
      user: null,
      isLoading: false,
      createUser: async () => {
        try {
          const username = `nfttools:${Date.now()}`;
          set({ isLoading: true });
          const credential = await WebAuthn.create({ username });
          if (!credential) {
            set({ isLoading: false });
            return;
          }
          const user = await createAccount(credential);
          set({ user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      login: async () => {
        try {
          const credential = await WebAuthn.get();
          if (!credential) {
            return;
          }
          set({ isLoading: true });
          const user = await retrieveAccount(credential);
          set({ user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ user: null });
      },
    }),
    {
      name: "user",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
