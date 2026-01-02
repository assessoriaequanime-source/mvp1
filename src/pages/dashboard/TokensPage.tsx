import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressDisplay } from "@/components/web3/address-display";
import { useState } from "react";
import { Coins, Send, ExternalLink, Copy, ArrowUpRight, ArrowDownLeft, Loader2, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSglTokenInfo, useSglBalance, useSglTransfer } from "@/hooks/useBlockchain";
import { useWallet } from "@/hooks/useWallet";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// Validation functions
function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function isValidAmount(amount: string, balance: string): { valid: boolean; error?: string } {
  if (!amount || amount.trim() === "") {
    return { valid: false, error: "Amount is required" };
  }

  const num = parseFloat(amount);
  if (isNaN(num)) {
    return { valid: false, error: "Invalid amount" };
  }

  if (num <= 0) {
    return { valid: false, error: "Amount must be greater than 0" };
  }

  if (num < 0.01) {
    return { valid: false, error: "Minimum transfer is 0.01 SGL" };
  }

  const decimals = amount.split(".")[1]?.length || 0;
  if (decimals > 18) {
    return { valid: false, error: "Maximum 18 decimal places" };
  }

  const balanceNum = parseFloat(balance);
  if (num > balanceNum) {
    return { valid: false, error: `Insufficient balance (max: ${balance} SGL)` };
  }

  return { valid: true };
}

export default function TokensPage() {
  const { address, isConnected } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [recipientError, setRecipientError] = useState("");
  const [amountError, setAmountError] = useState("");

  // Queries
  const { data: tokenInfo, isLoading: tokenLoading } = useSglTokenInfo();
  const { data: balanceData, isLoading: balanceLoading } = useSglBalance(address);
  const transfer = useSglTransfer();

  // Validate recipient
  const handleRecipientChange = (value: string) => {
    const trimmed = value.trim();
    setRecipient(trimmed);

    if (!trimmed) {
      setRecipientError("");
      return;
    }

    if (!isValidEthereumAddress(trimmed)) {
      setRecipientError("Invalid Ethereum address format");
    } else if (trimmed.toLowerCase() === address?.toLowerCase()) {
      setRecipientError("Cannot send to your own address");
    } else {
      setRecipientError("");
    }
  };

  // Validate amount
  const handleAmountChange = (value: string) => {
    setAmount(value);
    const validation = isValidAmount(value, balanceData?.balance || "0");
    setAmountError(validation.error || "");
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation
    if (!isValidEthereumAddress(recipient)) {
      setRecipientError("Invalid recipient address");
      return;
    }

    const amountValidation = isValidAmount(amount, balanceData?.balance || "0");
    if (!amountValidation.valid) {
      setAmountError(amountValidation.error || "Invalid amount");
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmTransfer = () => {
    setShowConfirmation(false);
    transfer.mutate({ to: recipient, amount });
    // Reset form on success
    if (!transfer.isPending) {
      setRecipient("");
      setAmount("");
    }
  };

  const formatBalance = (balance: string | undefined) => {
    if (!balance) return "0.00";
    const num = parseFloat(balance);
    return isNaN(num) ? "0.00" : num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  const isTransferDisabled =
    transfer.isPending ||
    !isConnected ||
    !recipient ||
    !amount ||
    !isValidEthereumAddress(recipient) ||
    !!amountError;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h3 font-bold text-foreground">Tokens</h1>
        <p className="text-muted-foreground mt-1">Manage your SGL tokens</p>
      </div>

      {/* Network Warning */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          ⚠️ You are on <strong>Sepolia Testnet</strong>. All tokens and transactions are for testing only and have no real value.
        </AlertDescription>
      </Alert>

      {!isConnected && (
        <Alert>
          <AlertDescription>Conecte sua wallet para ver seu saldo</AlertDescription>
        </Alert>
      )}

      {isConnected && !balanceLoading && parseFloat(balanceData?.balance || "0") === 0 && (
        <Alert variant="default" className="border-blue-500/50 bg-blue-500/10">
          <AlertTriangle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            💡 Your wallet has <strong>0 SGL tokens</strong>. This is a newly created wallet on Sepolia Testnet.
            <br />
            <strong>How to get tokens:</strong>
            <ul className="mt-2 space-y-1 ml-4">
              <li>✓ Request tokens via our <strong>Airdrop</strong> feature (Dashboard → Airdrop)</li>
              <li>✓ Use the <strong>Faucet</strong> to mint test tokens</li>
              <li>✓ Receive tokens from other users via Transfer</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Token Info */}
        <GlassCard variant="glow" size="lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {tokenLoading ? <Skeleton className="h-6 w-24" /> : tokenInfo?.name || "SGL Token"}
              </h3>
              <p className="text-muted-foreground">{tokenInfo?.symbol || "SGL"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Contract Address</p>
              {tokenLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                <AddressDisplay address={tokenInfo?.address || ""} size="sm" />
              )}
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
              {balanceLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <>
                  <p className="text-h3 font-bold text-foreground">{formatBalance(balanceData?.balance)} SGL</p>
                  <p className="text-sm text-muted-foreground mt-1">≈ ${(parseFloat(balanceData?.balance || "0") * 1.5).toFixed(2)}</p>
                </>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Transfer */}
        <GlassCard variant="default" size="lg" className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-6">Transfer SGL</h3>
          
          <form onSubmit={handleTransferSubmit} className="space-y-4">
            {/* Recipient Address */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Recipient Address</label>
              <div className="space-y-1">
                <Input
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => handleRecipientChange(e.target.value)}
                  className={`font-mono ${recipientError ? "border-destructive" : ""}`}
                  disabled={transfer.isPending}
                />
                {recipientError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {recipientError}
                  </p>
                )}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Amount</label>
              <div className="relative space-y-1">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={`pr-20 ${amountError ? "border-destructive" : ""}`}
                  disabled={transfer.isPending}
                  step="0.01"
                  min="0.01"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary"
                  onClick={() => handleAmountChange(balanceData?.balance || "0")}
                  disabled={transfer.isPending}
                >
                  MAX
                </Button>
                {amountError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {amountError}
                  </p>
                )}
              </div>
            </div>

            {/* Gas Estimate */}
            <div className="p-3 rounded-lg bg-secondary/30 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Estimated Gas</span>
                <span className="text-foreground font-semibold">~0.002 ETH</span>
              </div>
              <p className="text-xs mt-1 text-muted-foreground/80">
                Note: Actual gas may vary based on network conditions
              </p>
            </div>

            <Button 
              type="submit"
              variant="hero" 
              size="lg" 
              className="w-full gap-2"
              disabled={isTransferDisabled}
            >
              {transfer.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Transfer
                </>
              )}
            </Button>
          </form>
        </GlassCard>
      </div>

      {/* Transaction History */}
      <GlassCard variant="default" size="default">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
          <Button variant="outline" size="sm" disabled>Export CSV</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Tx Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="border-white/10">
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No transactions yet
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </GlassCard>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Transfer</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Sending</p>
                <p className="text-lg font-bold text-foreground">{amount} SGL</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">To address</p>
                <p className="text-sm font-mono text-foreground">{recipient}</p>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmTransfer}
              disabled={transfer.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {transfer.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Confirm Transfer"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
