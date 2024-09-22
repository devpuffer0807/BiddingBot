import React, { useEffect, useState } from "react";
import { CustomSelectOption } from "./CustomSelect";
import { ethers, formatEther } from "ethers";

interface WalletBalanceFetcherProps {
  walletOptions: CustomSelectOption[];
  onBalancesFetched: (options: CustomSelectOption[]) => void;
}

const ERC20_BAL_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
];

const WETH_CONTRACT_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const BLUR_POOL_ADDRESS = "0x0000000000A39bb272e79075ade125fd351887Ac";

const NEXT_PUBLIC_ALCHEMY_API_KEY = "HGWgCONolXMB2op5UjPH1YreDCwmSbvx";

const fetchEtherBalance = async (walletAddress: string, provider: any) => {
  try {
    const balance = await provider.getBalance(walletAddress);
    return Number(formatEther(balance)).toFixed(4) + " ETH";
  } catch (error) {
    console.error("Error fetching Ether balance:", error);
    return "Error fetching balance";
  }
};

const fetchWethBalance = async (walletAddress: string, provider: any) => {
  try {
    const contract = new ethers.Contract(
      WETH_CONTRACT_ADDRESS,
      ERC20_BAL_ABI,
      provider
    );
    const balance = await contract.balanceOf(walletAddress);
    return Number(formatEther(balance)).toFixed(4) + " WETH";
  } catch (error) {
    console.error("Error fetching WETH balance:", error);
    return "Error fetching balance";
  }
};

const fetchBlurBalance = async (walletAddress: string, provider: any) => {
  try {
    const contract = new ethers.Contract(
      BLUR_POOL_ADDRESS,
      ERC20_BAL_ABI,
      provider
    );
    const balance = await contract.balanceOf(walletAddress);
    return Number(formatEther(balance)).toFixed(4) + " BETH";
  } catch (error) {
    console.error("Error fetching BETH balance:", error);
    return "Error fetching balance";
  }
};

const WalletBalanceFetcher: React.FC<WalletBalanceFetcherProps> = ({
  walletOptions,
  onBalancesFetched,
}) => {
  const [provider, setProvider] = useState<any>(null);

  useEffect(() => {
    const initializeProviderAndSigner = async () => {
      let provider;

      if (window.ethereum == null) {
        console.log("MetaMask not installed; using read-only defaults");
        provider = ethers.getDefaultProvider();
      } else {
        provider = ethers.getDefaultProvider();
      }
      setProvider(provider);
    };

    initializeProviderAndSigner();
  }, []);

  useEffect(() => {
    const updateWalletOptionsWithBalances = async () => {
      if (!provider) return;

      const updatedOptions = await Promise.all(
        walletOptions.map(async (option) => {
          const etherBalance = await fetchEtherBalance(
            option.address || "",
            provider
          );
          const wethBalance = await fetchWethBalance(
            option.address || "",
            provider
          );
          const blurBalance = await fetchBlurBalance(
            option.address || "",
            provider
          );
          return {
            ...option,
            etherBalance,
            wethBalance,
            blurBalance,
          };
        })
      );
      onBalancesFetched(updatedOptions);
    };

    updateWalletOptionsWithBalances();
  }, [walletOptions, onBalancesFetched, provider]);

  return null;
};

export default WalletBalanceFetcher;
