/**
 * Transfer Form Component
 * Formulário para enviar SGL tokens
 */

import { useState } from "react";
import { Send, Wallet, Loader2, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSglTransfer, useSglAirdrop } from "@/hooks/useBlockchain";
import { useWallet } from "@/hooks/useWallet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TransferForm() {
  const { isConnected, address } = useWallet();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const transfer = useSglTransfer();
  const airdrop = useSglAirdrop();

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !amount) return;
    transfer.mutate({ to, amount });
  };

  const handleAirdrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !amount) return;
    airdrop.mutate({ to, amount });
  };

  const isLoading = transfer.isPending || airdrop.isPending;

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Send className="w-5 h-5 text-primary" />
        Send SGL
      </h3>

      <Tabs defaultValue="airdrop" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="airdrop" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Airdrop
          </TabsTrigger>
          <TabsTrigger value="transfer" className="gap-2">
            <Send className="w-4 h-4" />
            Transfer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="airdrop">
          <form onSubmit={handleAirdrop} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="airdrop-to">Recipient Address</Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="airdrop-to"
                  placeholder="0x..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="airdrop-amount">Amount (SGL)</Label>
              <Input
                id="airdrop-amount"
                type="number"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!isConnected || !to || !amount || isLoading}
            >
              {airdrop.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Send Airdrop
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="transfer">
          <form onSubmit={handleTransfer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transfer-to">Recipient Address</Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="transfer-to"
                  placeholder="0x..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer-amount">Amount (SGL)</Label>
              <Input
                id="transfer-amount"
                type="number"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!isConnected || !to || !amount || isLoading}
            >
              {transfer.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Transfer
                </>
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      {!isConnected && (
        <p className="text-center text-sm text-yellow-500 mt-4">
          Connect your wallet first
        </p>
      )}
    </GlassCard>
  );
}
