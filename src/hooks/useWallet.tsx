import { useState, useCallback } from "react";

export const useWallet = () => {
  const [walletData, setWalletData] = useState({
    holdings: [
      // ... your initial holdings data
    ],
  });

  const createWallet = useCallback(() => {
    // Implement wallet creation logic here
    console.log("Creating new wallet");
  }, []);

  return { walletData, createWallet };
};
