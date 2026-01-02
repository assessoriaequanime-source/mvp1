import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Clock,
  Lock,
  Unlock,
  Plus,
  CalendarDays,
  Mail,
  Share2,
  Copy,
  ExternalLink,
  Loader2,
  Wallet,
} from "lucide-react";
import { ethers } from "ethers";
import { useWallet } from "@/hooks/useWallet";

interface TimeCapsule {
  id: string;
  message: string;
  senderAddress: string;
  recipientEmail?: string;
  recipientWallet?: string;
  unlockDate: string;
  unlockTime: string;
  created: string;
  status: "locked" | "unlocked";
  daysLeft: number;
  accessLink: string;
  sendMethod: "email" | "wallet" | "link";
}

const mockCapsules: TimeCapsule[] = [
  {
    id: "1",
    message: "A message from the past...",
    senderAddress: "0x1234...5678",
    unlockDate: "2025-01-01",
    unlockTime: "12:00",
    created: "2024-01-01",
    status: "locked",
    daysLeft: 365,
    accessLink: "https://singulai.site/capsule/abc123",
    sendMethod: "email",
    recipientEmail: "friend@email.com",
  },
];

export default function TimeCapsulePage() {
  const { address } = useWallet();
  const [capsules, setCapsules] = useState<TimeCapsule[]>(mockCapsules);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("12:00");
  const [sendMethod, setSendMethod] = useState<"email" | "wallet" | "link">("email");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientWallet, setRecipientWallet] = useState("");
  const [useNewWallet, setUseNewWallet] = useState(false);

  /**
   * Gerar link de acesso público
   */
  const generateAccessLink = (capsuleId: string): string => {
    return `https://singulai.site/capsule/${capsuleId}?access=${Math.random().toString(36).substring(7)}`;
  };

  /**
   * Criar novo wallet automaticamente
   */
  const handleCreateNewWallet = () => {
    const randomWallet = ethers.Wallet.createRandom();
    setRecipientWallet(randomWallet.address);
    toast.success("New wallet created!");
  };

  /**
   * Criar cápsula de tempo
   */
  const handleCreateCapsule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validações
      if (!message.trim()) {
        toast.error("Please enter a message");
        setIsLoading(false);
        return;
      }

      if (!unlockDate) {
        toast.error("Please select an unlock date");
        setIsLoading(false);
        return;
      }

      // Validação por método de envio
      if (sendMethod === "email" && !recipientEmail.trim()) {
        toast.error("Please enter recipient email");
        setIsLoading(false);
        return;
      }

      if (sendMethod === "wallet" && !recipientWallet.trim()) {
        toast.error("Please select or create a wallet");
        setIsLoading(false);
        return;
      }

      // Validar formato de email
      if (sendMethod === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail)) {
          toast.error("Invalid email address");
          setIsLoading(false);
          return;
        }
      }

      // Validar formato de carteira
      if (sendMethod === "wallet" && recipientWallet.trim()) {
        if (!ethers.isAddress(recipientWallet)) {
          toast.error("Invalid wallet address");
          setIsLoading(false);
          return;
        }
      }

      // TODO: Integrar com backend
      // const response = await apiClient.post("/timecapsule/create", {
      //   message: message,
      //   senderAddress: address,
      //   unlockDate: unlockDate,
      //   unlockTime: unlockTime,
      //   sendMethod: sendMethod,
      //   recipientEmail: sendMethod === "email" ? recipientEmail : undefined,
      //   recipientWallet: sendMethod === "wallet" ? recipientWallet : undefined,
      // });

      // Mock: criar cápsula
      const capsuleId = `${Date.now()}`;
      const accessLink = generateAccessLink(capsuleId);

      const newCapsule: TimeCapsule = {
        id: capsuleId,
        message: message,
        senderAddress: address || "0x0000...0000",
        unlockDate: unlockDate,
        unlockTime: unlockTime,
        created: new Date().toISOString().split("T")[0],
        status: "locked",
        daysLeft: Math.ceil(
          (new Date(unlockDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
        accessLink: accessLink,
        sendMethod: sendMethod,
        recipientEmail: sendMethod === "email" ? recipientEmail : undefined,
        recipientWallet: sendMethod === "wallet" ? recipientWallet : undefined,
      };

      setCapsules([newCapsule, ...capsules]);

      // TODO: Enviar email via hello@singulai.site
      if (sendMethod === "email") {
        // const emailResponse = await apiClient.post("/email/send-capsule", {
        //   to: recipientEmail,
        //   senderAddress: address,
        //   accessLink: accessLink,
        //   unlockDate: `${unlockDate} ${unlockTime}`,
        //   subject: "You've received a Time Capsule from the future!",
        // });
        console.log("📧 Email would be sent to:", recipientEmail);
      }

      toast.success("Time Capsule created! Message scheduled for delivery.");

      // Limpar formulário
      setMessage("");
      setUnlockDate("");
      setUnlockTime("12:00");
      setRecipientEmail("");
      setRecipientWallet("");
      setUseNewWallet(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create capsule");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Copiar link para clipboard
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h3 font-bold text-foreground">Time Capsule</h1>
        <p className="text-muted-foreground mt-1">Send encrypted messages to the future with blockchain security</p>
      </div>

      {/* Create Capsule */}
      <GlassCard variant="glow" size="lg">
        <h2 className="text-lg font-semibold text-foreground mb-6">Create New Capsule</h2>

        <form onSubmit={handleCreateCapsule} className="space-y-6">
          {/* Message */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Your Message</label>
            <Textarea
              placeholder="Write your message for the future..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your message will be encrypted and stored on-chain
            </p>
          </div>

          {/* Date and Time */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                <CalendarDays className="w-4 h-4 inline mr-2" />
                Unlock Date
              </label>
              <Input
                type="date"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                disabled={isLoading}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                <Clock className="w-4 h-4 inline mr-2" />
                Unlock Time
              </label>
              <Input
                type="time"
                value={unlockTime}
                onChange={(e) => setUnlockTime(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Send Method Tabs */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">How to send?</label>
            <Tabs value={sendMethod} onValueChange={(v) => setSendMethod(v as "email" | "link")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="link" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Public Link
                </TabsTrigger>
              </TabsList>

              {/* Email Tab */}
              <TabsContent value="email" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Recipient Email
                  </label>
                  <Input
                    type="email"
                    placeholder="recipient@email.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    ✉️ Email will be sent from hello@singulai.site with access link and unlock date
                  </p>
                </div>
              </TabsContent>

              {/* Link Tab */}
              <TabsContent value="link" className="space-y-4 mt-4">
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <p className="text-sm text-foreground">
                    🔗 <strong>Public Link:</strong> Anyone with the link can view your capsule after unlock date
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Capsule...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Time Capsule
              </>
            )}
          </Button>
        </form>
      </GlassCard>

      {/* My Capsules */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">My Capsules</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capsules.map((capsule) => (
            <GlassCard
              key={capsule.id}
              variant={capsule.status === "unlocked" ? "glow" : "default"}
              size="default"
              hover="lift"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    capsule.status === "locked" ? "bg-yellow-500/20" : "bg-green-500/20"
                  }`}
                >
                  {capsule.status === "locked" ? (
                    <Lock className="w-6 h-6 text-yellow-400" />
                  ) : (
                    <Unlock className="w-6 h-6 text-green-400" />
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    capsule.status === "locked"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {capsule.status === "locked" ? "Locked" : "Unlocked"}
                </span>
              </div>

              <div className="space-y-3">
                {/* Message preview */}
                <p className="text-sm text-foreground line-clamp-2">{capsule.message}</p>

                {/* Info grid */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unlock</span>
                    <span className="text-foreground font-medium">
                      {capsule.unlockDate} {capsule.unlockTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Send Method</span>
                    <span className="text-foreground font-medium capitalize flex items-center gap-1">
                      {capsule.sendMethod === "email" && <Mail className="w-3 h-3" />}
                      {capsule.sendMethod === "wallet" && <Wallet className="w-3 h-3" />}
                      {capsule.sendMethod === "link" && <Share2 className="w-3 h-3" />}
                      {capsule.sendMethod}
                    </span>
                  </div>
                  {capsule.recipientEmail && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recipient</span>
                      <span className="text-foreground font-mono truncate">
                        {capsule.recipientEmail}
                      </span>
                    </div>
                  )}
                  {capsule.recipientWallet && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wallet</span>
                      <span className="text-foreground font-mono text-xs">
                        {capsule.recipientWallet.slice(0, 6)}...{capsule.recipientWallet.slice(-4)}
                      </span>
                    </div>
                  )}
                  {capsule.status === "locked" && (
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground">Time Left</span>
                      <span className="text-primary font-semibold">{capsule.daysLeft} days</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => copyToClipboard(capsule.accessLink)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </button>
                  <a
                    href={capsule.accessLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors text-sm text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View
                  </a>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {capsules.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No capsules created yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
