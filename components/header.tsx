import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";

/**
 * A header component.
 * @returns {Promise<JSX.Element>} - The rendered header component.
 */
export async function Header({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-sm" />
            <span className="font-serif text-xl md:text-2xl font-semibold text-foreground">
              Virtuoso
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#inicio"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              {t("home")}
            </a>
            <a
              href="#cursos"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              {t("courses")}
            </a>
            <a
              href="#practica"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              {t("practice")}
            </a>
            <a
              href="#recursos"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              {t("resources")}
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm">
              {t("login")}
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("getStarted")}
            </Button>
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
