/**
 * SingulAI Wallet Hook
 * Gerenciamento de conexão MetaMask
 */

import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, formatEther } from "ethers";
import { toast } from "sonner";

const SEPOLIA_CHAIN_ID = 11155111;

interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
  });

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum === "undefined") return;
      
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          const provider = new BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          const balance = await provider.getBalance(accounts[0]);
          
          setState({
            address: accounts[0],
            balance: formatEther(balance),
            chainId: Number(network.chainId),
            isConnected: true,
            isConnecting: false,
          });
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };

    checkConnection();
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (typeof window.ethereum === "undefined") return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setState({
          address: null,
          balance: null,
          chainId: null,
          isConnected: false,
          isConnecting: false,
        });
        toast.info("Wallet disconnected");
      } else {
        setState((prev) => ({ ...prev, address: accounts[0] }));
        toast.success("Account changed");
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask not found!", {
        description: "Please install MetaMask extension",
        action: {
          label: "Install",
          onClick: () => window.open("https://metamask.io/download/", "_blank"),
        },
      });
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true }));

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(accounts[0]);

      setState({
        address: accounts[0],
        balance: formatEther(balance),
        chainId: Number(network.chainId),
        isConnected: true,
        isConnecting: false,
      });

      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        toast.warning("Wrong network", {
          description: "Please switch to Sepolia Testnet",
          action: {
            label: "Switch",
            onClick: () => switchToSepolia(),
          },
        });
      } else {
        toast.success("Wallet connected!");
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast.error("Connection failed", { description: error.message });
      setState((prev) => ({ ...prev, isConnecting: false }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      balance: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
    });
    toast.success("Wallet disconnected");
  }, []);

  const switchToSepolia = useCallback(async () => {
    if (typeof window.ethereum === "undefined") return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain not added, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
                chainName: "Sepolia Testnet",
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://sepolia.infura.io/v3/"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding chain:", addError);
        }
      }
    }
  }, []);

  const formatAddress = useCallback((addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    switchToSepolia,
    formatAddress,
    isWrongNetwork: state.chainId !== null && state.chainId !== SEPOLIA_CHAIN_ID,
  };
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
