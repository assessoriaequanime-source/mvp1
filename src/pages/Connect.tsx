import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/layout/container";
import { toast } from "sonner";
import logo from "@/assets/logo-singulai.png";
import {
  Wallet,
  ArrowRight,
  CheckCircle,
  Loader2,
  Copy,
  Download,
  Key,
} from "lucide-react";
import { ethers } from "ethers";

type AuthStep = 
  | "choice" 
  | "authenticate-seed" 
  | "authenticate-key" 
  | "create" 
  | "backup" 
  | "success";

interface CreatedWallet {
  address: string;
  mnemonic: string;
  privateKey: string;
}

export default function ConnectPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>("choice");
  const [isLoading, setIsLoading] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [seedPhrase, setSeedPhrase] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [createdWallet, setCreatedWallet] = useState<CreatedWallet | null>(null);
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [seedError, setSeedError] = useState("");
  const [keyError, setKeyError] = useState("");

  /**
   * Validar seed phrase (12 palavras)
   */
  const isValidSeedPhrase = (phrase: string): boolean => {
    try {
      const words = phrase.trim().split(/\s+/).filter(w => w.length > 0);
      if (words.length !== 12 && words.length !== 24) return false;
      
      const mnemonic = ethers.Mnemonic.fromPhrase(phrase);
      return !!mnemonic;
    } catch {
      return false;
    }
  };

  /**
   * Validar chave privada
   */
  const isValidPrivateKeyFormat = (key: string): boolean => {
    try {
      const wallet = new ethers.Wallet(key);
      return !!wallet.address;
    } catch {
      return false;
    }
  };

  /**
   * Autenticar com seed phrase (SEGURO)
   */
  const handleAuthenticateWithSeed = async () => {
    setSeedError("");
    
    if (!seedPhrase.trim()) {
      setSeedError("Please enter your 12-word recovery phrase");
      return;
    }

    if (!isValidSeedPhrase(seedPhrase)) {
      setSeedError("Invalid seed phrase. Please enter 12 valid words separated by spaces.");
      return;
    }

    setIsLoading(true);
    try {
      const mnemonic = ethers.Mnemonic.fromPhrase(seedPhrase);
      const hdNode = ethers.HDNodeWallet.fromMnemonic(mnemonic);
      const address = hdNode.address;

      // Prova de propriedade: conseguiu derivar o endereço
      localStorage.setItem("user_wallet", address);
      localStorage.setItem("auth_token", `token_${Date.now()}_${Math.random()}`);
      
      // Limpar seed phrase da memória
      setSeedPhrase("");
      setConnectedAddress(address);
      setStep("success");
      toast.success("Wallet authenticated successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error) {
      setSeedError("Failed to authenticate with seed phrase");
      toast.error("Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Autenticar com chave privada (SEGURO)
   */
  const handleAuthenticateWithKey = async () => {
    setKeyError("");
    
    if (!privateKey.trim()) {
      setKeyError("Please enter your private key");
      return;
    }

    if (!isValidPrivateKeyFormat(privateKey)) {
      setKeyError("Invalid private key format. Must be 0x followed by 64 hex characters.");
      return;
    }

    setIsLoading(true);
    try {
      const wallet = new ethers.Wallet(privateKey);
      const address = wallet.address;

      // Prova de propriedade: conseguiu derivar o endereço
      localStorage.setItem("user_wallet", address);
      localStorage.setItem("auth_token", `token_${Date.now()}_${Math.random()}`);
      
      // Limpar chave privada da memória
      setPrivateKey("");
      setConnectedAddress(address);
      setStep("success");
      toast.success("Wallet authenticated successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error) {
      setKeyError("Failed to authenticate with private key");
      toast.error("Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Criar nova wallet com mnemonic
   */
  const handleCreateWallet = async () => {
    setIsLoading(true);
    try {
      // Gerar novo wallet com ethers v6
      const randomWallet = ethers.Wallet.createRandom();
      
      const newWallet: CreatedWallet = {
        address: randomWallet.address,
        mnemonic: randomWallet.mnemonic?.phrase || "",
        privateKey: randomWallet.privateKey,
      };

      setCreatedWallet(newWallet);
      setStep("backup");
      toast.success("Wallet created! Please save your backup phrase.");

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create wallet");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Copiar texto para clipboard
   */
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  /**
   * Download backup das palavras
   */
  const downloadBackup = () => {
    if (!createdWallet) return;

    const backupContent = `SINGULAI WALLET BACKUP
=====================================
Date: ${new Date().toISOString()}
Network: Ethereum Sepolia Testnet

⚠️ KEEP THIS FILE SAFE AND SECURE ⚠️

Wallet Address:
${createdWallet.address}

Recovery Phrase (12 words):
${createdWallet.mnemonic}

Private Key:
${createdWallet.privateKey}

IMPORTANT:
- Never share your private key or recovery phrase
- Anyone with these can access your wallet
- Store this backup in a safe location
- Use the recovery phrase to restore your wallet

=====================================
Created on SingulAI Platform
`;

    const blob = new Blob([backupContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `singulai-wallet-backup-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.success("Backup downloaded!");
  };

  /**
   * Confirmar backup e prosseguir
   */
  const handleConfirmBackup = async () => {
    if (!backupConfirmed) {
      toast.error("Please confirm that you've backed up your recovery phrase");
      return;
    }

    setIsLoading(true);
    try {
      if (!createdWallet) return;

      // TODO: Salvar wallet no backend
      // const response = await apiClient.post("/auth/create-wallet", {
      //   address: createdWallet.address,
      //   // NÃO enviar mnemonic/privateKey para backend!
      // });

      // Mock: wallet salvo com sucesso
      localStorage.setItem("user_wallet", createdWallet.address);
      localStorage.setItem("auth_token", `token_${Date.now()}`);

      setStep("success");
      toast.success("Wallet created and backed up!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create wallet");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Renderizar step de escolha
   */
  const renderChoiceStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Secure Authentication</h2>
        <p className="text-muted-foreground">
          Choose how you want to authenticate to SingulAI
        </p>
      </div>

      <div className="grid gap-4">
        {/* Authenticate with Seed Phrase */}
        <button
          onClick={() => setStep("authenticate-seed")}
          className="group relative p-6 rounded-lg border border-border hover:border-primary/50 bg-background/50 hover:bg-background/80 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
              <Key className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-foreground mb-1">12-Word Recovery Phrase</h3>
              <p className="text-sm text-muted-foreground">
                Enter your seed phrase to securely authenticate
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </button>

        {/* Authenticate with Private Key */}
        <button
          onClick={() => setStep("authenticate-key")}
          className="group relative p-6 rounded-lg border border-border hover:border-primary/50 bg-background/50 hover:bg-background/80 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-foreground mb-1">Private Key</h3>
              <p className="text-sm text-muted-foreground">
                Enter your private key to authenticate
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </button>

        {/* Create New Wallet */}
        <button
          onClick={() => setStep("create")}
          className="group relative p-6 rounded-lg border border-border hover:border-primary/50 bg-background/50 hover:bg-background/80 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
              <Key className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-foreground mb-1">Create New Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Generate a new secure wallet with recovery phrase
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </button>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-300 font-semibold mb-1">⚠️ Security Notice</p>
            <p className="text-xs text-yellow-300/80">
              We never store your private key or recovery phrase. Authentication happens locally on your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Renderizar step de autenticação com seed phrase
   */
  const renderAuthenticateSeedStep = () => (
    <form onSubmit={(e) => { e.preventDefault(); handleAuthenticateWithSeed(); }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Enter Your Seed Phrase</h2>
        <p className="text-muted-foreground text-sm">
          Enter your 12 recovery words separated by spaces
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">12-Word Recovery Phrase</label>
          <textarea
            placeholder="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
            value={seedPhrase}
            onChange={(e) => setSeedPhrase(e.target.value)}
            disabled={isLoading}
            autoFocus
            className="w-full h-24 p-3 rounded-lg bg-background border border-border text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
          />
          {seedError && (
            <p className="text-xs text-red-400 mt-1">⚠️ {seedError}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Your seed phrase will only be used locally to derive your wallet address and will not be stored.
          </p>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <p className="text-xs text-yellow-300">
          ⚠️ Never share your seed phrase with anyone. SingulAI staff will never ask for it.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={isLoading}
          onClick={() => {
            setStep("choice");
            setSeedPhrase("");
            setSeedError("");
          }}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="flex-1"
          disabled={isLoading || !seedPhrase.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <Key className="w-4 h-4" />
              Authenticate
            </>
          )}
        </Button>
      </div>
    </form>
  );

  /**
   * Renderizar step de autenticação com chave privada
   */
  const renderAuthenticateKeyStep = () => (
    <form onSubmit={(e) => { e.preventDefault(); handleAuthenticateWithKey(); }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Enter Your Private Key</h2>
        <p className="text-muted-foreground text-sm">
          Enter your Ethereum private key to authenticate
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Private Key</label>
          <div className="relative">
            <input
              type={showPrivateKey ? "text" : "password"}
              placeholder="0x..."
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              disabled={isLoading}
              autoFocus
              className="w-full h-12 p-3 rounded-lg bg-background border border-border text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
            />
            <button
              type="button"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-xs"
            >
              {showPrivateKey ? "Hide" : "Show"}
            </button>
          </div>
          {keyError && (
            <p className="text-xs text-red-400 mt-1">⚠️ {keyError}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Your private key will only be used locally to derive your wallet address and will not be stored.
          </p>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
        <p className="text-xs text-red-300">
          🔒 <strong>CRITICAL:</strong> Never share your private key. SingulAI staff will never ask for it.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={isLoading}
          onClick={() => {
            setStep("choice");
            setPrivateKey("");
            setKeyError("");
          }}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="flex-1"
          disabled={isLoading || !privateKey.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              Authenticate
            </>
          )}
        </Button>
      </div>
    </form>
  );

  /**
   * Renderizar step de conexão (REMOVIDO - substituído por seed/key)
   */
  const renderConnectStep = () => renderAuthenticateSeedStep();

  /**
   * Renderizar step de criação
   */
  const renderCreateStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Create New Wallet</h2>
        <p className="text-muted-foreground mb-6">
          Click below to generate your secure wallet
        </p>
      </div>

      <Button
        onClick={handleCreateWallet}
        variant="hero"
        size="lg"
        className="w-full gap-2"
        disabled={isLoading || !!createdWallet}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Wallet...
          </>
        ) : (
          <>
            <Key className="w-4 h-4" />
            Generate New Wallet
          </>
        )}
      </Button>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-200">
          ℹ️ <strong>Pro Tip:</strong> You'll need to save your recovery phrase. This is the only way to restore your wallet if you forget your password.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => {
          setStep("choice");
          setCreatedWallet(null);
        }}
      >
        Back
      </Button>
    </div>
  );

  /**
   * Renderizar step de backup
   */
  const renderBackupStep = () => {
    if (!createdWallet) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Save Your Recovery Phrase</h2>
          <p className="text-muted-foreground mb-4">
            This phrase can recover your wallet. Keep it safe and secret!
          </p>
        </div>

        {/* Wallet Address Display */}
        <div className="bg-background/50 border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-2">Wallet Address</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono break-all bg-background/50 p-2 rounded border border-border/50">
              {createdWallet.address}
            </code>
            <button
              onClick={() => copyToClipboard(createdWallet.address, "Address")}
              className="p-2 hover:bg-background/80 rounded transition-colors"
            >
              <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>

        {/* Recovery Phrase Display */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-xs text-yellow-200 font-semibold mb-3">⚠️ RECOVERY PHRASE (12 Words)</p>
          <div className="bg-background/50 border border-yellow-500/20 rounded-lg p-4 mb-3">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {createdWallet.mnemonic.split(" ").map((word, index) => (
                <div
                  key={index}
                  className="bg-background border border-border/50 rounded p-2 text-center"
                >
                  <span className="text-xs text-muted-foreground">{index + 1}.</span>
                  <p className="font-mono text-sm font-semibold text-foreground">
                    {word}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(createdWallet.mnemonic, "Recovery phrase")}
              className="flex-1 flex items-center justify-center gap-2 p-2 hover:bg-yellow-500/20 rounded transition-colors text-sm"
            >
              <Copy className="w-4 h-4" />
              Copy Phrase
            </button>
            <button
              onClick={downloadBackup}
              className="flex-1 flex items-center justify-center gap-2 p-2 hover:bg-yellow-500/20 rounded transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download Backup
            </button>
          </div>
        </div>

        {/* Confirmation */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={backupConfirmed}
              onChange={(e) => setBackupConfirmed(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              I have safely saved my recovery phrase and understand that I cannot recover my wallet without it
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={isLoading}
            onClick={() => {
              setStep("choice");
              setCreatedWallet(null);
              setBackupConfirmed(false);
            }}
          >
            Back
          </Button>
          <Button
            variant="hero"
            size="lg"
            className="flex-1 gap-2"
            disabled={!backupConfirmed || isLoading}
            onClick={handleConfirmBackup}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Confirm & Continue
              </>
            )}
          </Button>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-sm text-red-200">
            🔒 <strong>Security:</strong> We never store your recovery phrase. Write it down or save the backup file.
          </p>
        </div>
      </div>
    );
  };

  /**
   * Renderizar step de sucesso
   */
  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-400" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Wallet Connected!</h2>
        <p className="text-muted-foreground mb-4">
          Your wallet is now connected to SingulAI.
        </p>
        <p className="text-sm text-muted-foreground">
          Redirecting to dashboard...
        </p>
      </div>

      <Link to="/dashboard">
        <Button variant="hero" size="lg" className="w-full gap-2">
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />
      </div>

      <Container size="sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/">
            <img src={logo} alt="SingulAI" className="h-10 w-auto mx-auto mb-6" />
          </Link>
          <h1 className="text-h3 font-bold text-foreground mb-2">Welcome to SingulAI</h1>
          <p className="text-muted-foreground">Your digital identity on the blockchain</p>
        </div>

        {/* Main card */}
        <GlassCard variant="glow" size="lg">
          {step === "choice" && renderChoiceStep()}
          {step === "authenticate-seed" && renderAuthenticateSeedStep()}
          {step === "authenticate-key" && renderAuthenticateKeyStep()}
          {step === "create" && renderCreateStep()}
          {step === "backup" && renderBackupStep()}
          {step === "success" && renderSuccessStep()}
        </GlassCard>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <a href="/#faq" className="text-primary hover:text-primary/80 font-semibold">
              Check our FAQ
            </a>
          </p>
        </div>
      </Container>
    </div>
  );
}
