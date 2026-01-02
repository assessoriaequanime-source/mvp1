import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Mail,
  Loader2,
  Gift,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

export default function ProfileSetup() {
  const { address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [profileCompleted, setProfileCompleted] = useState(
    localStorage.getItem("profile_completed") === "true"
  );

  // Verificar se já completou perfil
  if (profileCompleted) {
    return null;
  }

  /**
   * Enviar airdrop de 10.000 SGL
   */
  const handleAirdrop = async (contactType: string, contactValue: string) => {
    setIsLoading(true);
    try {
      // Validar contato
      if (!contactValue.trim()) {
        toast.error(`Please enter a ${contactType}`);
        setIsLoading(false);
        return;
      }

      // TODO: Integrar com backend
      // const response = await apiClient.post("/airdrop/claim", {
      //   address: address,
      //   type: contactType,
      //   value: contactValue
      // });
      // const { txHash } = response.data;

      // Mock: envio bem-sucedido
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;
      
      // Salvar que o perfil foi completado
      localStorage.setItem("profile_completed", "true");
      localStorage.setItem("airdrop_contact_type", contactType);
      localStorage.setItem("airdrop_contact_value", contactValue);
      localStorage.setItem("airdrop_tx_hash", mockTxHash);

      setProfileCompleted(true);
      toast.success("✨ 10,000 SGL airdrop sent to your wallet!");

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to claim airdrop");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md">
        <GlassCard variant="glow" size="lg" className="border-primary/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Bonus! 🎁</h2>
            <p className="text-muted-foreground">
              Verify your contact info to receive 10,000 SGL
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-3 block">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-12 mb-2"
            />
            <p className="text-xs text-muted-foreground">
              We'll use this to contact you about rewards and updates
            </p>
          </div>

          <Button
            onClick={() => handleAirdrop("email", email)}
            variant="hero"
            size="lg"
            className="w-full gap-2"
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4" />
                Claim 10,000 SGL
              </>
            )}
          </Button>

          {/* Info box */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <p className="text-sm text-foreground">
              ✨ <strong>One-time offer:</strong> Complete your profile on your first login to receive a welcome bonus
            </p>
          </div>

          {/* Wallet display */}
          <div className="mt-4 p-3 bg-background/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
            <p className="text-sm font-mono break-all text-foreground">{address}</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
