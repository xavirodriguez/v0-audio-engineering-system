import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Users, Star } from "lucide-react"

const courses = [
  {
    title: "Fundamentos del Violín",
    level: "Principiante",
    duration: "8 semanas",
    students: "2,450",
    rating: "4.9",
    image: "/beginner-learning-violin-posture.jpg",
    description: "Aprende la postura correcta, técnica de arco y tus primeras melodías.",
  },
  {
    title: "Técnica Intermedia",
    level: "Intermedio",
    duration: "12 semanas",
    students: "1,820",
    rating: "4.8",
    image: "/violin-player-practicing-technique.jpg",
    description: "Desarrolla vibrato, cambios de posición y expresión musical.",
  },
  {
    title: "Repertorio Clásico",
    level: "Avanzado",
    duration: "16 semanas",
    students: "980",
    rating: "5.0",
    image: "/professional-violinist-performing-classical-music.jpg",
    description: "Domina obras maestras de Bach, Mozart y Beethoven.",
  },
]

export function Courses() {
  return (
    <section id="cursos" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Cursos diseñados para tu nivel
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Desde tus primeros pasos hasta el dominio avanzado, tenemos el curso perfecto para ti.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <Card key={index} className="border-border bg-card overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-video overflow-hidden">
                <img
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
                    {course.level}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-sm font-medium text-foreground">{course.rating}</span>
                  </div>
                </div>
                <h3 className="font-serif text-2xl font-semibold text-card-foreground">{course.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{course.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Ver Curso</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
