import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Brain, FileText, Lock, Heart, Save, AlertTriangle, Zap, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import lauraAvatar from "@/assets/avatars/laura.png";
import leticiaAvatar from "@/assets/avatars/leticia.png";
import pedroAvatar from "@/assets/avatars/pedro.png";

interface Avatar {
  id: number;
  name: string;
  image: string;
  tokenId: string;
  created: string;
}

interface Module {
  id: number;
  name: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "active" | "processing" | "empty";
  dataPoints: number;
  contract?: string;
  persistent: boolean;
}

const avatarOptions = [
  { id: 1, name: "Laura", image: lauraAvatar },
  { id: 2, name: "Leticia", image: leticiaAvatar },
  { id: 3, name: "Pedro", image: pedroAvatar },
];

export default function AvatarPage() {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [personality, setPersonality] = useState("");
  const [orientations, setOrientations] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const modules: Module[] = [
    {
      id: 1,
      name: "Módulo 1",
      title: "Real-Time Learning",
      description: "Absorve informações, conhecimentos e personalidade em tempo real. Filtra por assertividade e êxito.",
      icon: <Zap className="w-5 h-5" />,
      status: "active",
      dataPoints: 1247,
      contract: "0x1a2b...3c4d",
      persistent: false,
    },
    {
      id: 2,
      name: "Módulo 2",
      title: "Validation & Organization",
      description: "Organiza, filtra e valida dados do Módulo 1. Aguarda validação final do usuário.",
      icon: <CheckCircle2 className="w-5 h-5" />,
      status: "processing",
      dataPoints: 342,
      contract: "0x5e6f...7g8h",
      persistent: false,
    },
    {
      id: 3,
      name: "Módulo 3",
      title: "Professional Knowledge",
      description: "Armazena conhecimento profissional com assertividade. Avança para prestar serviços profissionais.",
      icon: <Brain className="w-5 h-5" />,
      status: "active",
      dataPoints: 523,
      contract: "0x9i10...11j12",
      persistent: true,
    },
    {
      id: 4,
      name: "Módulo 4",
      title: "Digital Legacy",
      description: "Registra dados validados com autorização. Entrega cápsulas e representa o usuário após morte.",
      icon: <Heart className="w-5 h-5" />,
      status: "active",
      dataPoints: 89,
      contract: "0x13k14...15l16",
      persistent: true,
    },
  ];

  const handleSelectAvatar = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    setPersonality("");
    setOrientations("");
    setHasChanges(false);
  };

  const handleSavePersonality = async () => {
    if (!selectedAvatar || (!personality && !orientations)) {
      toast.error("Adicione personalidade ou orientações");
      return;
    }

    setIsSaving(true);
    try {
      // Simular API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Avatar personalidade atualizada com sucesso!");
      setHasChanges(false);
    } catch (error) {
      toast.error("Erro ao salvar personalidade");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400";
      case "processing":
        return "text-yellow-400";
      case "empty":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Ativo</span>;
      case "processing":
        return <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">Processando</span>;
      case "empty":
        return <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-400 rounded">Vazio</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h3 font-bold text-foreground">Digital Avatar</h1>
        <p className="text-muted-foreground mt-1">Gerencie sua identidade blockchain e seus 4 módulos de inteligência</p>
      </div>

      {/* Avatar Selection */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Escolha Seu Avatar</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {avatarOptions.map((avatar) => (
            <div
              key={avatar.id}
              className={`cursor-pointer transition-all ${
                selectedAvatar?.id === avatar.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleSelectAvatar({ ...avatar, tokenId: "#0001", created: "2024-01-01" })}
            >
              <GlassCard variant={selectedAvatar?.id === avatar.id ? "glow" : "default"} size="default">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                  <img
                    src={avatar.image}
                    alt={avatar.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-semibold text-foreground text-center">{avatar.name}</h3>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>

      {/* Avatar Details & Modules */}
      {selectedAvatar && (
        <>
          {/* Avatar Info */}
          <GlassCard variant="glow" size="lg">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex items-center justify-center">
                <img
                  src={selectedAvatar.image}
                  alt={selectedAvatar.name}
                  className="w-48 h-48 rounded-2xl border-2 border-primary/30"
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <h2 className="text-h3 font-bold text-foreground">{selectedAvatar.name}</h2>
                  <p className="text-muted-foreground">Token ID: {selectedAvatar.tokenId}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Personalidade</label>
                    <Textarea
                      placeholder="Descreva a personalidade e traços do seu avatar..."
                      value={personality}
                      onChange={(e) => {
                        setPersonality(e.target.value);
                        setHasChanges(true);
                      }}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Orientações & Interesses</label>
                    <Textarea
                      placeholder="Áreas de interesse, orientações profissionais, valores..."
                      value={orientations}
                      onChange={(e) => {
                        setOrientations(e.target.value);
                        setHasChanges(true);
                      }}
                      className="h-24"
                    />
                  </div>

                  <Button
                    onClick={handleSavePersonality}
                    disabled={!hasChanges || isSaving}
                    className="w-full gap-2"
                    variant="hero"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Salvando..." : "Salvar Personalidade"}
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Four Modules */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">4 Módulos de Inteligência</h2>

            <Tabs defaultValue="module-1" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                {modules.map((module) => (
                  <TabsTrigger key={module.id} value={`module-${module.id}`} className="gap-1">
                    <span className="hidden sm:inline">{module.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {modules.map((module) => (
                <TabsContent key={module.id} value={`module-${module.id}`}>
                  <GlassCard variant="default" size="lg">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-primary/10 ${getStatusColor(module.status)}`}>
                          {module.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{module.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                        </div>
                      </div>
                      <div>{getStatusBadge(module.status)}</div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6 pt-6 border-t border-white/10">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <p className="text-lg font-semibold text-foreground capitalize">{module.status}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Pontos de Dados</p>
                        <p className="text-lg font-semibold text-foreground">{module.dataPoints.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Persistência</p>
                        <p className={`text-lg font-semibold ${module.persistent ? "text-green-400" : "text-yellow-400"}`}>
                          {module.persistent ? "Permanente" : "Temporária"}
                        </p>
                      </div>
                    </div>

                    {/* Contract Info */}
                    {module.contract && (
                      <div className="p-4 rounded-xl bg-secondary/30 mb-6">
                        <p className="text-xs text-muted-foreground mb-1">Endereço do Contrato</p>
                        <p className="text-sm font-mono text-foreground">{module.contract}</p>
                      </div>
                    )}

                    {/* Module-specific Info */}
                    <div className="space-y-3">
                      {module.id === 1 && (
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300">
                          <p className="font-semibold mb-1">⚡ Limpeza Automática</p>
                          <p>Dados são limpos a cada fração de tempo (em definição) para otimizar armazenamento.</p>
                        </div>
                      )}
                      {module.id === 2 && (
                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-300">
                          <p className="font-semibold mb-1">⏳ Aguardando Validação</p>
                          <p>Seus dados estão sendo processados. Você será notificado quando precisar validar.</p>
                        </div>
                      )}
                      {module.id === 3 && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-300">
                          <p className="font-semibold mb-1">💼 Monetização</p>
                          <p>Este módulo permite prestar serviços na sua área profissional e gerar renda.</p>
                        </div>
                      )}
                      {module.id === 4 && (
                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">
                          <p className="font-semibold mb-1">💜 Seu Legado Digital</p>
                          <p>ÚNICO módulo acessível após desconectar. Entrega cápsulas e representa você historicamente.</p>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <Button variant="outline" className="w-full gap-2">
                        <FileText className="w-4 h-4" />
                        Ver Detalhes Completos
                      </Button>
                    </div>
                  </GlassCard>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Connection Status */}
          <GlassCard variant="subtle" size="default">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Estado de Conexão</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <span className="text-sm text-foreground">Carteira do Avatar</span>
                  <span className="text-xs font-mono text-green-400">0x1a2b...3c4d</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <span className="text-sm text-foreground">Carteira do Usuário</span>
                  <span className="text-xs font-mono text-green-400">Conectada</span>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                  ✅ Avatar com acesso total à memória dos 4 módulos. Desconecte a carteira para limpar acesso (exceto Módulo 4).
                </div>
              </div>
            </div>
          </GlassCard>
        </>
      )}

      {/* Empty State */}
      {!selectedAvatar && (
        <GlassCard variant="subtle" size="lg" className="text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Escolha um avatar para começar</h3>
          <p className="text-muted-foreground mt-2">Selecione um dos 3 avatares disponíveis acima para gerenciar seus módulos de inteligência.</p>
        </GlassCard>
      )}
    </div>
  );
}
