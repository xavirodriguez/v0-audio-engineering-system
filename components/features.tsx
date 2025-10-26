import { Music, Mic, BookOpen, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Music,
    title: "Lecciones Estructuradas",
    description: "Currículo completo desde principiante hasta avanzado, diseñado por maestros profesionales.",
  },
  {
    icon: Mic,
    title: "Práctica en Tiempo Real",
    description:
      "Detección de pitch avanzada que analiza tu interpretación y proporciona retroalimentación instantánea.",
  },
  {
    icon: BookOpen,
    title: "Biblioteca de Partituras",
    description: "Acceso a cientos de partituras interactivas con acompañamiento y guías visuales.",
  },
  {
    icon: Award,
    title: "Seguimiento de Progreso",
    description: "Monitorea tu evolución con métricas detalladas y celebra tus logros musicales.",
  },
]

export function Features() {
  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Una experiencia de aprendizaje completa
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Todo lo que necesitas para convertirte en un violinista excepcional, en una plataforma elegante y fácil de
            usar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-card-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
