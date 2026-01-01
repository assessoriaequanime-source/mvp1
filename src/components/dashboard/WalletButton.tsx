/**
 * Wallet Connection Button
 * Botão para conectar/desconectar MetaMask
 */

import { Wallet, LogOut, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/hooks/useWallet";

export function WalletButton() {
  const {
    address,
    balance,
    isConnected,
    isConnecting,
    isWrongNetwork,
    connect,
    disconnect,
    switchToSepolia,
    formatAddress,
  } = useWallet();

  if (isConnecting) {
    return (
      <Button disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button onClick={connect} variant="default">
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={isWrongNetwork ? "destructive" : "outline"} className="gap-2">
          {isWrongNetwork ? (
            <>
              <AlertTriangle className="w-4 h-4" />
              Wrong Network
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              {formatAddress(address!)}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Connected</span>
            <span className="font-mono text-sm">{formatAddress(address!)}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem disabled>
          <span className="text-muted-foreground">Balance:</span>
          <span className="ml-auto font-medium">
            {Number(balance || 0).toFixed(4)} ETH
          </span>
        </DropdownMenuItem>

        {isWrongNetwork && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={switchToSepolia}>
              <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
              Switch to Sepolia
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
