import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "María González",
    role: "Estudiante Principiante",
    content:
      "Nunca pensé que aprender violín pudiera ser tan accesible. La retroalimentación en tiempo real me ha ayudado a corregir mi técnica desde el principio.",
    rating: 5,
    image: "/smiling-woman-portrait.png",
  },
  {
    name: "Carlos Ruiz",
    role: "Músico Intermedio",
    content:
      "La calidad de las lecciones es excepcional. He mejorado mi vibrato y cambios de posición en solo 3 meses.",
    rating: 5,
    image: "/smiling-man-portrait.png",
  },
  {
    name: "Ana Martínez",
    role: "Profesora de Música",
    content:
      "Recomiendo esta plataforma a todos mis estudiantes. La tecnología de detección de pitch es impresionante y muy precisa.",
    rating: 5,
    image: "/professional-woman-portrait.png",
  },
]

/**
 * A component that displays a list of testimonials.
 * @returns {JSX.Element} - The rendered testimonials component.
 */
export function Testimonials() {
  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Lo que dicen nuestros estudiantes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Miles de estudiantes han transformado su forma de aprender violín con Virtuoso.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
