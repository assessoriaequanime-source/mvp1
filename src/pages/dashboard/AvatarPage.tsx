import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { User, Brain, FileText, Lock, Heart, Save, AlertTriangle, Zap, CheckCircle2, Clock, PenTool, Sparkles, Crown, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useWallet } from "@/hooks/useWallet";
import { useAvatarBalance } from "@/hooks/useBlockchain";
import lauraAvatar from "@/assets/avatars/laura.png";
import leticiaAvatar from "@/assets/avatars/leticia.png";
import pedroAvatar from "@/assets/avatars/pedro.png";

interface Avatar {
  id: number;
  name: string;
  image: string;
  tokenId: string;
  created: string;
  specialty: string;
  description: string;
  traits: string[];
  gradient: string;
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
  features: string[];
  warning?: string;
}

const avatarOptions = [
  {
    id: 1,
    name: "Laura",
    image: lauraAvatar,
    specialty: "Criatividade & Inovação",
    description: "Especialista em geração de ideias inovadoras e soluções criativas. Perfeita para empreendedores e artistas digitais.",
    traits: ["Criativa", "Visionária", "Adaptável", "Intuitiva"],
    gradient: "from-pink-500 to-rose-500"
  },
  {
    id: 2,
    name: "Leticia",
    image: leticiaAvatar,
    specialty: "Análise & Estratégia",
    description: "Mestra em análise de dados e planejamento estratégico. Ideal para profissionais de finanças e consultoria.",
    traits: ["Analítica", "Estratégica", "Precisa", "Focada"],
    gradient: "from-blue-500 to-indigo-500"
  },
  {
    id: 3,
    name: "Pedro",
    image: pedroAvatar,
    specialty: "Execução & Liderança",
    description: "Especialista em execução de projetos e liderança de equipes. Perfeito para gestores e executivos.",
    traits: ["Líder", "Executivo", "Decisivo", "Motivador"],
    gradient: "from-emerald-500 to-teal-500"
  },
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
      description: "Absorve informações, conhecimentos e personalidade em tempo real através de suas interações digitais.",
      icon: <Zap className="w-5 h-5" />,
      status: "active",
      dataPoints: 1247,
      contract: "0x1a2b...3c4d",
      persistent: false,
      features: [
        "Aprendizado contínuo em tempo real",
        "Análise de padrões comportamentais",
        "Adaptação automática à sua rotina",
        "Processamento de dados não estruturados"
      ],
      warning: "Dados são limpos automaticamente a cada ciclo para otimizar armazenamento e privacidade."
    },
    {
      id: 2,
      name: "Módulo 2",
      title: "Validation & Organization",
      description: "Organiza, filtra e valida dados do Módulo 1, aguardando sua confirmação para avançar.",
      icon: <CheckCircle2 className="w-5 h-5" />,
      status: "processing",
      dataPoints: 342,
      contract: "0x5e6f...7g8h",
      persistent: false,
      features: [
        "Filtragem inteligente de dados",
        "Organização por relevância",
        "Validação de padrões",
        "Preparação para armazenamento permanente"
      ],
      warning: "Seus dados estão sendo processados. Você será notificado quando precisar validar informações importantes."
    },
    {
      id: 3,
      name: "Módulo 3",
      title: "Professional Knowledge",
      description: "Armazena conhecimento profissional validado, permitindo prestação de serviços especializados.",
      icon: <Brain className="w-5 h-5" />,
      status: "active",
      dataPoints: 523,
      contract: "0x9i10...11j12",
      persistent: true,
      features: [
        "Base de conhecimento profissional",
        "Geração de conteúdo especializado",
        "Consultoria automatizada",
        "Monetização de expertise"
      ],
      warning: "Este módulo permite que seu avatar preste serviços profissionais e gere renda passiva."
    },
    {
      id: 4,
      name: "Módulo 4",
      title: "Digital Legacy",
      description: "Registra dados validados permanentemente, funcionando mesmo após desconexão ou falecimento.",
      icon: <Heart className="w-5 h-5" />,
      status: "active",
      dataPoints: 89,
      contract: "0x13k14...15l16",
      persistent: true,
      features: [
        "Armazenamento permanente",
        "Entrega de cápsulas do tempo",
        "Representação histórica",
        "Herança digital automática"
      ],
      warning: "ÚNICO módulo acessível após desconectar. Representa você digitalmente para sempre."
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

  const { address } = useWallet();
  const { data: avatarBalance } = useAvatarBalance(address);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h3 font-bold text-foreground">Digital Avatar</h1>
        <p className="text-muted-foreground mt-1">Gerencie sua identidade blockchain e seus 4 módulos de inteligência</p>
      </div>

      {/* Module Overview - Visual Summary */}
      <GlassCard variant="subtle" size="lg">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Sistema de 4 Módulos Inteligentes</h2>
          <p className="text-muted-foreground text-sm">Cada avatar tem acesso completo aos módulos que aprendem e evoluem com você</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <h4 className="font-semibold text-sm text-blue-300">Real-Time Learning</h4>
            <p className="text-xs text-blue-200 mt-1">Aprendizado contínuo</p>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <CheckCircle2 className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <h4 className="font-semibold text-sm text-yellow-300">Validation</h4>
            <p className="text-xs text-yellow-200 mt-1">Organização inteligente</p>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <Brain className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <h4 className="font-semibold text-sm text-green-300">Professional Knowledge</h4>
            <p className="text-xs text-green-200 mt-1">Consultoria especializada</p>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <Heart className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <h4 className="font-semibold text-sm text-purple-300">Digital Legacy</h4>
            <p className="text-xs text-purple-200 mt-1">Herança permanente</p>
          </div>
        </div>
      </GlassCard>

      {/* Avatar Selection */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Escolha Seu Avatar Digital</h2>
        <p className="text-muted-foreground mb-6">
          Cada avatar possui especialidades únicas e acesso aos 4 módulos de inteligência:
          <span className="block mt-2 text-sm">
            <span className="inline-flex items-center gap-1 text-blue-400"><Zap className="w-3 h-3" />Real-Time Learning</span> • 
            <span className="inline-flex items-center gap-1 text-yellow-400"><CheckCircle2 className="w-3 h-3" />Validation</span> • 
            <span className="inline-flex items-center gap-1 text-green-400"><Brain className="w-3 h-3" />Professional Knowledge</span> • 
            <span className="inline-flex items-center gap-1 text-purple-400"><Heart className="w-3 h-3" />Digital Legacy</span>
          </span>
        </p>
        
        <Carousel className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {avatarOptions.map((avatar) => (
              <CarouselItem key={avatar.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <div
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedAvatar?.id === avatar.id 
                        ? "ring-2 ring-primary scale-105" 
                        : "hover:scale-102"
                    }`}
                    onClick={() => handleSelectAvatar({ 
                      ...avatar, 
                      tokenId: "#0001", 
                      created: "2024-01-01" 
                    })}
                  >
                    <GlassCard 
                      variant={selectedAvatar?.id === avatar.id ? "glow" : "default"} 
                      size="lg"
                      hover="lift"
                      className="relative overflow-hidden"
                    >
                      {/* Gradient accent */}
                      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${avatar.gradient} opacity-50`} />
                      
                      <div className="space-y-4">
                        <div className="relative aspect-square rounded-xl overflow-hidden">
                          <img
                            src={avatar.image}
                            alt={avatar.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t ${avatar.gradient} opacity-0 hover:opacity-20 transition-opacity duration-300`} />
                        </div>
                        
                        <div className="text-center space-y-2">
                          <h3 className="font-bold text-foreground text-lg">{avatar.name}</h3>
                          <p className="text-sm font-medium text-primary">{avatar.specialty}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{avatar.description}</p>
                          
                          <div className="flex flex-wrap gap-1 justify-center mt-3">
                            {avatar.traits.map((trait, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                              >
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
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
            <p className="text-muted-foreground mb-6">
              Sistema inteligente de 4 módulos que trabalham em conjunto para criar sua identidade digital
            </p>

            {/* Module Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {modules.map((module) => (
                <GlassCard 
                  key={module.id} 
                  variant={module.status === "active" ? "glow" : "subtle"} 
                  size="sm"
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {
                    // Auto-switch to the clicked module tab
                    const tabElement = document.querySelector(`[value="module-${module.id}"]`) as HTMLElement;
                    tabElement?.click();
                  }}
                >
                  <div className="text-center space-y-3">
                    <div className={`inline-flex p-2 rounded-lg ${getStatusColor(module.status)} bg-primary/10`}>
                      {module.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{module.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{module.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(module.status)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {module.dataPoints.toLocaleString()} pontos
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

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

                    {/* Features List */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Funcionalidades</h4>
                      <div className="grid gap-2">
                        {module.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Warning/Info */}
                    {module.warning && (
                      <div className={`p-4 rounded-xl border mb-6 ${
                        module.id === 1 ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' :
                        module.id === 2 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' :
                        module.id === 3 ? 'bg-green-500/10 border-green-500/20 text-green-300' :
                        'bg-purple-500/10 border-purple-500/20 text-purple-300'
                      }`}>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-sm mb-1">
                              {module.id === 1 ? '⚡ Módulo Temporário' :
                               module.id === 2 ? '⏳ Aguardando Validação' :
                               module.id === 3 ? '💼 Monetização Disponível' :
                               '💜 Seu Legado Digital'}
                            </p>
                            <p className="text-xs leading-relaxed">{module.warning}</p>
                          </div>
                        </div>
                      </div>
                    )}

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
                  <span className="text-xs font-mono text-green-400">{selectedAvatar?.tokenId || "-"}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <span className="text-sm text-foreground">Carteira do Usuário</span>
                  <span className="text-xs font-mono text-green-400">{address ? address : "Não conectada"}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                  <div className="text-xs text-muted-foreground">
                    <div>Saldo Avatar: {avatarBalance?.balance ?? "-"}</div>
                    <div className="mt-1">✅ Avatar com acesso total à memória dos 4 módulos. Desconecte a carteira para limpar acesso (exceto Módulo 4).</div>
                  </div>
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
