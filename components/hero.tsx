import { default as NextImage } from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { getTranslations } from "next-intl/server"
/**
 * A hero component.
 * @returns {JSX.Element} - The rendered hero component.
 */
export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section
      id="inicio"
      className="pt-32 pb-20 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 text-balance leading-tight">
            {t("title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8"
            >
              {t("buttonPrimary")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 bg-transparent"
            >
              {t("buttonSecondary")}
            </Button>
          </div>
        </div>

        <div className="mt-16 md:mt-24 relative">
          <div className="aspect-video rounded-lg overflow-hidden bg-muted border border-border shadow-2xl">
            <NextImage
              src="/elegant-violin-on-music-stand-with-sheet-music.jpg"
              alt="Violín elegante con partitura"
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
