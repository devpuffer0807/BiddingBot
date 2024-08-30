import { ethers, isHexString } from "ethers";

export const isValidPrivateKeyOrSeedPhrase = (
  value: string
): "PRIVATE_KEY" | "MNEMONIC" | false => {
  if (isHexString(`0x${value}`, 32)) {
    return "PRIVATE_KEY";
  }

  const wordCount = value.trim().split(/\s+/).length;
  if (wordCount === 12 || wordCount === 24) {
    return "MNEMONIC";
  }

  return false;
};

export const importWalletFromMnemonic = (
  mnemonic: string
): ethers.HDNodeWallet | null => {
  try {
    const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
    console.log({ wallet });
    return wallet;
  } catch (error) {
    console.error("Error importing wallet from mnemonic:", error);
    return null;
  }
};

export const importWalletFromPrivateKey = (
  privateKey: string
): ethers.Wallet | null => {
  try {
    const wallet = new ethers.Wallet(privateKey);
    console.log({ wallet });
    return wallet;
  } catch (error) {
    console.error("Error importing wallet from private key:", error);
    return null;
  }
};

export const connectWallet = async (
  provider: ethers.BrowserProvider | null
) => {
  if (provider) {
    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts && accounts.length > 0) {
        console.log("Connected account:", accounts[0]);
        return true;
      } else {
        throw new Error("No accounts found");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert(
        "Failed to connect wallet. Please make sure you have a wallet extension installed and try again."
      );
      return false;
    }
  } else {
    alert(
      "No Ethereum wallet detected. Please install MetaMask or another wallet extension."
    );
    return false;
  }
};

export const addWalletToMetaMask = async (
  privateKey: string,
  provider: ethers.BrowserProvider | null
) => {
  if (window.ethereum) {
    try {
      const connected = await connectWallet(provider);
      if (!connected) return;

      // Import the account
      // Note: This method is currently commented out as it's not supported by all wallets
      await window.ethereum.request({
        method: "wallet_importRawKey",
        params: [privateKey, "temp-password"],
      });

      // For now, we'll just show the private key to the user
      alert(
        `Please add this private key to your wallet manually:\n\n${privateKey}\n\nDo not share this key with anyone!`
      );
    } catch (error) {
      console.error("Error adding wallet to MetaMask:", error);
      alert(
        "Failed to add wallet to MetaMask. Please try adding it manually using the private key."
      );
    }
  } else {
    alert("MetaMask is not installed. Please install it to use this feature.");
  }
};

export const generateWalletName = () => {
  const colors = [
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Purple",
    "Orange",
    "Pink",
    "Teal",
    "Cyan",
    "Magenta",
    "Lime",
    "Indigo",
    "Violet",
    "Maroon",
    "Navy",
    "Olive",
    "Turquoise",
    "Coral",
  ];
  const animals = [
    "Lion",
    "Tiger",
    "Bear",
    "Wolf",
    "Fox",
    "Eagle",
    "Dolphin",
    "Elephant", // Added animals
    "Giraffe",
    "Penguin",
    "Koala",
    "Kangaroo",
    "Panda",
    "Octopus",
    "Cheetah",
    "Gorilla",
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  return `${randomColor} ${randomAnimal}`;
};
