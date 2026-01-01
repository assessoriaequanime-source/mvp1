/**
 * Token Info Component
 * Mostra informações do SGL Token da API
 */

import { Coins, TrendingUp, ExternalLink, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useSglTokenInfo, useSglBalance } from "@/hooks/useBlockchain";
import { useWallet } from "@/hooks/useWallet";

export function TokenInfo() {
  const { address, isConnected } = useWallet();
  const { data: tokenInfo, isLoading: loadingInfo } = useSglTokenInfo();
  const { data: balanceData, isLoading: loadingBalance } = useSglBalance(address);

  if (loadingInfo) {
    return (
      <GlassCard variant="glow">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </GlassCard>
    );
  }

  const balance = balanceData?.balance || "0";
  const formattedBalance = Number(balance).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

  return (
    <GlassCard variant="glow" className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{tokenInfo?.name || "SGL Token"}</h3>
            <p className="text-sm text-muted-foreground">{tokenInfo?.symbol || "SGL"}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            window.open(
              `https://sepolia.etherscan.io/token/${tokenInfo?.address}`,
              "_blank"
            )
          }
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      {isConnected ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
            <p className="text-3xl font-bold text-foreground">
              {loadingBalance ? "..." : formattedBalance}
              <span className="text-lg text-primary ml-2">SGL</span>
            </p>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Total Supply: {Number(tokenInfo?.totalSupply || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-2">Connect wallet to see balance</p>
          <p className="text-xs text-muted-foreground/60">MetaMask · WalletConnect</p>
        </div>
      )}

      {/* Contract Address */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-1">Contract</p>
        <p className="text-xs font-mono text-foreground/70 truncate">
          {tokenInfo?.address}
        </p>
      </div>
    </GlassCard>
  );
}
