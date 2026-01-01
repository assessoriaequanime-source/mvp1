import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { useApp } from "@/contexts/app-context";
import logo from "@/assets/logo-singulai.png";
import { Menu, X, Languages, Sun, Moon, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, theme, setTheme, t } = useApp();

  const navLinks = [
    { labelKey: "nav.features", href: "#features" },
    { labelKey: "nav.howItWorks", href: "#how-it-works" },
    { labelKey: "nav.tokenomics", href: "#tokenomics" },
    { labelKey: "nav.security", href: "#security" },
  ];

  const themeOptions = [
    { id: "light" as const, labelKey: "theme.light", icon: Sun },
    { id: "dark" as const, labelKey: "theme.dark", icon: Moon },
    { id: "cyberpunk" as const, labelKey: "theme.cyberpunk", icon: Sparkles },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <Container size="xl">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="SingulAI" className="h-8 md:h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.labelKey}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t(link.labelKey)}
              </a>
            ))}
          </div>

          {/* CTA Buttons + Settings */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="gap-1">
                  <Languages className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {t("settings.language")}
                </DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => setLanguage("en")}
                  className={language === "en" ? "bg-primary/10" : ""}
                >
                  <span className="mr-2">🇺🇸</span> English
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage("pt")}
                  className={language === "pt" ? "bg-primary/10" : ""}
                >
                  <span className="mr-2">🇧🇷</span> Português
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {theme === "light" && <Sun className="w-4 h-4" />}
                  {theme === "dark" && <Moon className="w-4 h-4" />}
                  {theme === "cyberpunk" && <Sparkles className="w-4 h-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {t("settings.theme")}
                </DropdownMenuLabel>
                {themeOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => setTheme(option.id)}
                    className={theme === option.id ? "bg-primary/10" : ""}
                  >
                    <option.icon className="w-4 h-4 mr-2" />
                    {t(option.labelKey)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-6 bg-border mx-2" />

            <Link to="/dashboard">
              <Button variant="ghost" size="default">
                {t("nav.dashboard")}
              </Button>
            </Link>
            <Link to="/connect">
              <Button variant="hero" size="default">
                {t("nav.launchApp")}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const themes: Array<"light" | "dark" | "cyberpunk"> = ["light", "dark", "cyberpunk"];
                const currentIndex = themes.indexOf(theme);
                const nextIndex = (currentIndex + 1) % themes.length;
                setTheme(themes[nextIndex]);
              }}
            >
              {theme === "light" && <Sun className="w-5 h-5" />}
              {theme === "dark" && <Moon className="w-5 h-5" />}
              {theme === "cyberpunk" && <Sparkles className="w-5 h-5" />}
            </Button>

            {/* Mobile Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === "en" ? "pt" : "en")}
            >
              <Languages className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.labelKey}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t(link.labelKey)}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <Link to="/dashboard">
                  <Button variant="ghost" size="default" className="w-full">
                    {t("nav.dashboard")}
                  </Button>
                </Link>
                <Link to="/connect">
                  <Button variant="hero" size="default" className="w-full">
                    {t("nav.launchApp")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
