import { Section } from "@/components/layout/section";
import { GlassCard } from "@/components/ui/glass-card";
import { User, Coins, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: User,
    title: "Digital Avatar",
    description: "Crie seu avatar inteligente com 4 módulos especializados: aprendizado em tempo real, validação de dados, conhecimento profissional e legado digital eterno.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Coins,
    title: "SGL Token",
    description: "Native utility token powering the ecosystem. Stake, transfer, and earn rewards.",
    gradient: "from-primary to-accent",
  },
  {
    icon: Clock,
    title: "Time Capsule",
    description: "Send messages to the future. Lock content until a specific date with blockchain security.",
    gradient: "from-orange-500 to-yellow-500",
  },
  {
    icon: Shield,
    title: "Digital Legacy",
    description: "Plan your digital inheritance. Ensure your assets reach loved ones automatically.",
    gradient: "from-green-500 to-emerald-500",
  },
];

export function FeaturesSection() {
  return (
    <Section id="features" spacing="xl">
      <div className="text-center mb-16">
        <h2 className="text-h2 font-bold text-foreground mb-4">
          Powerful Features for Your{" "}
          <span className="text-gradient">Digital Life</span>
        </h2>
        <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to manage your digital identity and assets on the blockchain.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <GlassCard
            key={feature.title}
            variant="default"
            size="lg"
            hover="lift"
            className="group relative overflow-hidden"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Gradient accent line */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
            
            <div className="space-y-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-h4 font-bold text-foreground">{feature.title}</h3>
              <p className="text-body text-muted-foreground">{feature.description}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
