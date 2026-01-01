/**
 * Network Status Component
 * Mostra status da blockchain em tempo real
 */

import { Activity, Box, Fuel, Server, Loader2, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useBlockchainStatus } from "@/hooks/useBlockchain";

export function NetworkStatus() {
  const { data: status, isLoading, error, isRefetching } = useBlockchainStatus();

  if (isLoading) {
    return (
      <GlassCard>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading network status...</span>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="border-destructive/50">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load network status</span>
        </div>
      </GlassCard>
    );
  }

  const stats = [
    {
      icon: Server,
      label: "Network",
      value: status?.network?.toUpperCase() || "N/A",
      color: "text-green-400",
    },
    {
      icon: Box,
      label: "Current Block",
      value: status?.currentBlock?.toLocaleString() || "N/A",
      color: "text-blue-400",
    },
    {
      icon: Fuel,
      label: "Gas Price",
      value: `${(Number(status?.gasPrice || 0) / 1e9).toFixed(2)} Gwei`,
      color: "text-yellow-400",
    },
    {
      icon: Activity,
      label: "Chain ID",
      value: status?.chainId || "N/A",
      color: "text-primary",
    },
  ];

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Blockchain Status</h3>
        <div className="flex items-center gap-2 text-sm">
          {isRefetching && <Loader2 className="w-3 h-3 animate-spin" />}
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400">Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="text-center p-3 bg-secondary/30 rounded-lg"
          >
            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className="font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
