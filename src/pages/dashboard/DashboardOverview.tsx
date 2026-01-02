import { Link } from "react-router-dom";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import {
  Coins,
  Lock,
  Gift,
  User,
  Send,
  TrendingUp,
  Plus,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSglBalance, useSglTokenInfo, useAvatarBalance } from "@/hooks/useBlockchain";
import { useUserStaking } from "@/hooks/useExtendedBlockchain";
import { useWallet } from "@/hooks/useWallet";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileSetup from "./ProfileSetup";
import lauraAvatar from "@/assets/avatars/laura.png";
import petraAvatar from "@/assets/avatars/leticia.png";
import pedroAvatar from "@/assets/avatars/pedro.png";

const avatarImages = [
  { id: 1, image: lauraAvatar },
  { id: 2, image: petraAvatar },
  { id: 3, image: pedroAvatar },
];

const recentActivity = [
  // Atividades recentes aparecem aqui (vazio no primeiro acesso)
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "receive":
      return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
    case "send":
      return <ArrowUpRight className="w-4 h-4 text-red-400" />;
    case "stake":
      return <Lock className="w-4 h-4 text-primary" />;
    case "reward":
      return <Gift className="w-4 h-4 text-yellow-400" />;
    case "mint":
      return <User className="w-4 h-4 text-accent" />;
    default:
      return <Coins className="w-4 h-4" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case "pending":
      return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
    case "failed":
      return <XCircle className="w-4 h-4 text-red-400" />;
    default:
      return null;
  }
};

export default function DashboardOverview() {
  const { address } = useWallet();

  // Queries
  const { data: balanceData, isLoading: balanceLoading } = useSglBalance(address);
  const { data: avatarBalance, isLoading: avatarLoading } = useAvatarBalance(address);
  const { data: userStaking, isLoading: stakingLoading } = useUserStaking(address);

  const formatNumber = (value: string | undefined) => {
    if (!value) return "0.00";
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-8">
      {/* Profile Setup Modal (First Time Only) */}
      <ProfileSetup />

      {/* Page header */}
      <div>
        <h1 className="text-h3 font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back to your SingulAI dashboard</p>
      </div>

      {/* Empty Wallet Alert */}
      {!balanceLoading && parseFloat(balanceData?.balance || "0") === 0 && (
        <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            <strong>Wallet Created!</strong> Your new wallet has 0 SGL tokens. 
            Get started by <Link to="/dashboard/tokens" className="underline font-semibold hover:no-underline">requesting tokens via Airdrop</Link> or using the Faucet.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="SGL Balance"
          value={balanceLoading ? <Skeleton className="h-8 w-24" /> : formatNumber(balanceData?.balance)}
          subtitle={balanceLoading ? "" : `≈ $${(parseFloat(balanceData?.balance || "0") * 1.5).toFixed(2)}`}
          icon={Coins}
        />
        <StatCard
          title="Staked Amount"
          value={stakingLoading ? <Skeleton className="h-8 w-24" /> : formatNumber(userStaking?.staked || "0")}
          subtitle={stakingLoading ? "" : "12% APY"}
          icon={Lock}
        />
        <StatCard
          title="Pending Rewards"
          value={stakingLoading ? <Skeleton className="h-8 w-24" /> : formatNumber(userStaking?.rewards || "0")}
          icon={Gift}
          action={
            <Button variant="default" size="sm" className="w-full">
              Claim Rewards
            </Button>
          }
        />
        <StatCard
          title="NFT Avatars"
          value={avatarLoading ? <Skeleton className="h-8 w-8" /> : formatNumber(avatarBalance?.balance || "0")}
          icon={User}
          action={
            <div className="flex -space-x-3">
              {avatarImages.slice(0, 3).map((avatar) => (
                <div
                  key={avatar.id}
                  className="w-10 h-10 rounded-full border-2 border-background overflow-hidden"
                >
                  <img
                    src={avatar.image}
                    alt={`Avatar ${avatar.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          }
        />
      </div>

      {/* Quick actions */}
      <GlassCard variant="default" size="default">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard/tokens">
            <Button variant="outline" className="gap-2">
              <Send className="w-4 h-4" />
              Transfer
            </Button>
          </Link>
          <Link to="/dashboard/staking">
            <Button variant="outline" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Stake
            </Button>
          </Link>
          <Link to="/dashboard/avatar">
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Mint Avatar
            </Button>
          </Link>
          <Link to="/dashboard/timecapsule">
            <Button variant="outline" className="gap-2">
              <Clock className="w-4 h-4" />
              Create Capsule
            </Button>
          </Link>
        </div>
      </GlassCard>

      {/* Recent activity */}
      <GlassCard variant="default" size="default">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Description</TableHead>
                <TableHead className="text-muted-foreground">Amount</TableHead>
                <TableHead className="text-muted-foreground">Time</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Tx Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((activity) => (
                <TableRow key={activity.id} className="border-white/10">
                  <TableCell>
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {activity.description}
                  </TableCell>
                  <TableCell
                    className={
                      activity.amount.startsWith("+")
                        ? "text-green-400 font-mono"
                        : "text-red-400 font-mono"
                    }
                  >
                    {activity.amount}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {activity.time}
                  </TableCell>
                  <TableCell>{getStatusIcon(activity.status)}</TableCell>
                  <TableCell>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${activity.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {activity.txHash}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </GlassCard>
    </div>
  );
}
