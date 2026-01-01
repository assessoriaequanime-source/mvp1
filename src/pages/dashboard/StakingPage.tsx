import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Lock, Clock, Gift, Loader2 } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { 
  useStakingInfo, 
  useUserStaking, 
  useStakingLeaderboard,
  useStake,
  useUnstake,
  useClaimRewards,
} from "@/hooks/useExtendedBlockchain";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function StakingPage() {
  const { address } = useWallet();
  const [stakeAmount, setStakeAmount] = useState("1000");

  // Queries
  const { data: stakingInfo, isLoading: stakingInfoLoading, error: stakingInfoError } = useStakingInfo();
  const { data: userStaking, isLoading: userStakingLoading } = useUserStaking(address);
  const { data: leaderboard, isLoading: leaderboardLoading } = useStakingLeaderboard();

  // Mutations
  const stakeM = useStake();
  const unstakeM = useUnstake();
  const claimRewardsM = useClaimRewards();

  const handleStake = () => {
    if (!stakeAmount) return;
    stakeM.mutate(stakeAmount);
  };

  const handleUnstake = () => {
    if (!stakeAmount) return;
    unstakeM.mutate(stakeAmount);
  };

  const handleClaimRewards = () => {
    claimRewardsM.mutate();
  };

  // Formatar números
  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    return isNaN(n) ? '0.00' : n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (stakingInfoError) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-h3 font-bold text-foreground">Staking</h1>
          <p className="text-muted-foreground mt-1">Ganhe rewards fazendo stake de seus tokens SGL</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>Erro ao carregar dados de staking. Tente novamente mais tarde.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-h3 font-bold text-foreground">Staking</h1>
          <p className="text-muted-foreground mt-1">Ganhe rewards fazendo stake de seus tokens SGL</p>
        </div>
        <Alert>
          <AlertDescription>Conecte sua wallet para começar</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h3 font-bold text-foreground">Staking</h1>
        <p className="text-muted-foreground mt-1">Ganhe rewards fazendo stake de seus tokens SGL</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        <StatCard
          title="Total em Stake"
          value={userStakingLoading ? <Skeleton className="h-8 w-24" /> : formatNumber(userStaking?.staked || "0")}
          subtitle="SGL"
          icon={Lock}
        />
        <StatCard
          title="Rewards Pendentes"
          value={userStakingLoading ? <Skeleton className="h-8 w-24" /> : formatNumber(userStaking?.rewards || "0")}
          subtitle="SGL"
          icon={Gift}
        />
        <StatCard
          title="Status do Lock"
          value={userStaking?.canUnstake ? "Liberado" : "Bloqueado"}
          subtitle={userStaking?.lockTime ? `${Math.ceil(userStaking.lockTime / 3600)}h` : "N/A"}
          icon={Clock}
        />
      </div>

      {/* Staking Info */}
      {stakingInfo && !stakingInfoLoading && (
        <GlassCard>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Reward</p>
              <p className="text-2xl font-bold text-foreground">{stakingInfo.rewardRate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Período de Lock</p>
              <p className="text-2xl font-bold text-foreground">{stakingInfo.lockPeriod} dias</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mínimo para Stake</p>
              <p className="text-2xl font-bold text-foreground">{formatNumber(stakingInfo.minStake)} SGL</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total em Stake</p>
              <p className="text-2xl font-bold text-foreground">{formatNumber(stakingInfo.totalStaked)} SGL</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Staking Actions */}
      <GlassCard variant="default" size="lg">
        <h2 className="text-lg font-semibold text-foreground mb-6">Ações de Staking</h2>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Quantidade: <span className="text-foreground font-semibold">{formatNumber(stakeAmount)}</span>
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1"
              />
              <Button variant="outline" size="sm">Max</Button>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleStake}
              disabled={!stakeAmount || stakeM.isPending}
              className="w-full gap-2"
            >
              {stakeM.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Fazer Stake
            </Button>
            
            <Button 
              onClick={handleUnstake}
              variant="outline"
              disabled={!userStaking?.canUnstake || !stakeAmount || unstakeM.isPending}
              className="w-full gap-2"
            >
              {unstakeM.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Fazer Unstake
            </Button>

            <Button 
              onClick={handleClaimRewards}
              variant="secondary"
              disabled={!userStaking?.rewards || claimRewardsM.isPending}
              className="w-full gap-2"
            >
              {claimRewardsM.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Reclamar Rewards ({formatNumber(userStaking?.rewards || "0")} SGL)
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Leaderboard */}
      {leaderboard && leaderboard.length > 0 && (
        <GlassCard variant="default" size="default">
          <h2 className="text-lg font-semibold text-foreground mb-6">Leaderboard de Staking</h2>
          
          {leaderboardLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ranking</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead className="text-right">Total em Stake</TableHead>
                    <TableHead className="text-right">Rewards Totais</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.slice(0, 10).map((entry) => (
                    <TableRow key={entry.address}>
                      <TableCell className="font-semibold">#{entry.rank}</TableCell>
                      <TableCell className="font-mono text-xs">{entry.address.slice(0, 10)}...{entry.address.slice(-8)}</TableCell>
                      <TableCell className="text-right">{formatNumber(entry.totalStaked)}</TableCell>
                      <TableCell className="text-right text-green-400">{formatNumber(entry.rewards)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
