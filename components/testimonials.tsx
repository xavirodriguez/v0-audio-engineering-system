import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { getTranslations } from "next-intl/server"
import Image from "next/image"

const testimonialsData = [
  {
    rating: 5,
    image: "/smiling-woman-portrait.png",
  },
  {
    rating: 5,
    image: "/smiling-man-portrait.png",
  },
  {
    rating: 5,
    image: "/professional-woman-portrait.png",
  },
]

/**
 * A component that displays a list of testimonials.
 * @returns {JSX.Element} - The rendered testimonials component.
 */
export async function Testimonials() {
  const t = await getTranslations("testimonials")
  const testimonialKeys = ["0", "1", "2"] as const

  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">{t("title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialKeys.map(key => {
            const index = parseInt(key, 10)
            const testimonial = {
              name: t(`list.${key}.name`),
              role: t(`list.${key}.role`),
              content: t(`list.${key}.content`),
              ...testimonialsData[index],
            }
            return (
              <Card key={key} className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={100}
                      height={100}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
