import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/web3/wallet-button";
import { useWallet } from "@/hooks/useWallet";
import { useSglBalance } from "@/hooks/useBlockchain";
import { useApp } from "@/contexts/app-context";
import logo from "@/assets/logo-singulai.png";
import {
  LayoutGrid,
  Coins,
  TrendingUp,
  User,
  Clock,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  ExternalLink,
  Languages,
} from "lucide-react";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useApp();
  const { address } = useWallet();
  const { data: balanceData } = useSglBalance(address);

  const navItems = [
    { labelKey: "sidebar.overview", icon: LayoutGrid, href: "/dashboard" },
    { labelKey: "sidebar.tokens", icon: Coins, href: "/dashboard/tokens" },
    { labelKey: "sidebar.staking", icon: TrendingUp, href: "/dashboard/staking" },
    { labelKey: "sidebar.avatar", icon: User, href: "/dashboard/avatar" },
    { labelKey: "sidebar.timeCapsule", icon: Clock, href: "/dashboard/timecapsule" },
    { labelKey: "sidebar.legacy", icon: Shield, href: "/dashboard/legacy" },
    { labelKey: "sidebar.settings", icon: Settings, href: "/dashboard/settings" },
  ];

  // wallet data - using address from useWallet which now reads from localStorage
  const walletData = {
    isConnected: !!address,
    address: address || "",
    balance: balanceData?.balance || "0.00",
    network: "sepolia" as const,
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-40 transition-all duration-300 flex flex-col",
          sidebarCollapsed ? "w-[72px]" : "w-[280px]"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {!sidebarCollapsed && (
            <Link to="/">
              <img src={logo} alt="SingulAI" className="h-8 w-auto" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{t(item.labelKey)}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions - Language toggle */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <Button
            variant="ghost"
            size={sidebarCollapsed ? "icon" : "default"}
            onClick={() => setLanguage(language === "en" ? "pt" : "en")}
            className={cn(
              "text-sidebar-foreground hover:bg-sidebar-accent",
              !sidebarCollapsed && "w-full justify-start"
            )}
          >
            <Languages className="w-5 h-5" />
            {!sidebarCollapsed && (
              <span className="ml-3 text-sm">{language === "en" ? "PT" : "EN"}</span>
            )}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarCollapsed ? "ml-[72px]" : "ml-[280px]"
        )}
      >
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-4">
              {/* Breadcrumb */}
              <nav className="text-sm">
                <span className="text-muted-foreground">{t("nav.dashboard")}</span>
                {location.pathname !== "/dashboard" && (
                  <>
                    <span className="text-muted-foreground mx-2">/</span>
                    <span className="text-foreground font-medium capitalize">
                      {location.pathname.split("/").pop()}
                    </span>
                  </>
                )}
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm w-40 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </Button>

              {/* Etherscan link */}
              <a
                href={`https://sepolia.etherscan.io/address/${walletData.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Etherscan</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Wallet */}
              <WalletButton
                isConnected={walletData.isConnected}
                address={walletData.address}
                balance={walletData.balance}
                network={walletData.network}
              />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
