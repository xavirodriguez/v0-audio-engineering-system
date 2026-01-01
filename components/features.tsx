import { Music, Mic, BookOpen, Award, LucideProps } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getTranslations } from "next-intl/server"
import { FC } from "react"

const icons: { [key: string]: FC<LucideProps> } = {
  Music,
  Mic,
  BookOpen,
  Award,
}

/**
 * A component that displays a list of features.
 * @returns {JSX.Element} - The rendered features component.
 */
export async function Features() {
  const t = await getTranslations("features")
  const featureKeys = ["0", "1", "2", "3"] as const

  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureKeys.map(key => {
            const iconName = t(`list.${key}.icon`)
            const IconComponent = icons[iconName]

            return (
              <Card key={key} className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    {IconComponent && <IconComponent className="w-6 h-6 text-accent" />}
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-card-foreground mb-2">
                    {t(`list.${key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(`list.${key}.description`)}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
