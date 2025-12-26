"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { LanguageSwitcher } from "./language-switcher"

export function MobileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const t = useTranslations("nav")

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <div className="md:hidden">
      <button className="p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
        <Menu className="w-6 h-6" />
      </button>

      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex flex-col gap-4">
              <a href="#inicio" className="text-sm font-medium text-foreground hover:text-accent transition-colors" onClick={closeMenu}>
                {t("home")}
              </a>
              <a href="#cursos" className="text-sm font-medium text-foreground hover:text-accent transition-colors" onClick={closeMenu}>
                {t("courses")}
              </a>
              <a href="#practica" className="text-sm font-medium text-foreground hover:text-accent transition-colors" onClick={closeMenu}>
                {t("practice")}
              </a>
              <a href="#recursos" className="text-sm font-medium text-foreground hover:text-accent transition-colors" onClick={closeMenu}>
                {t("resources")}
              </a>
              <div className="flex flex-col gap-2 pt-2 border-t border-border mt-2">
                <LanguageSwitcher />
                <Button variant="ghost" size="sm">
                  {t("login")}
                </Button>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {t("getStarted")}
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
