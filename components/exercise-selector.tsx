"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Clock, Target } from "lucide-react"
import type { AdaptiveRecommendation } from "@/lib/types/exercise-system"

interface ExerciseSelectorProps {
  recommendations: AdaptiveRecommendation[]
  onSelectExercise: (exerciseId: string) => void
}

/**
 * A component that displays a list of recommended exercises.
 * @param {ExerciseSelectorProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered exercise selector component.
 */
export function ExerciseSelector({ recommendations, onSelectExercise }: ExerciseSelectorProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "hard":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20"
      case "expert":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-accent" />
        <h3 className="font-serif text-2xl font-bold">Ejercicios Recomendados</h3>
      </div>

      <div className="grid gap-4">
        {recommendations.map((rec, index) => (
          <Card key={rec.exercise.id} className="border-border hover:border-accent transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <Badge variant="default" className="bg-accent text-accent-foreground">
                        Recomendado
                      </Badge>
                    )}
                    <Badge variant="outline" className={getDifficultyColor(rec.exercise.difficulty)}>
                      {rec.exercise.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="font-serif">{rec.exercise.name}</CardTitle>
                  <CardDescription>{rec.exercise.description}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-accent">+{rec.estimatedImprovement}%</div>
                  <div className="text-xs text-muted-foreground">Mejora estimada</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground italic">{rec.reason}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{Math.round(rec.exercise.estimatedDuration / 1000 / 60)} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>{rec.exercise.notes.length} notas</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {rec.focusAreas.map((area) => (
                  <Badge key={area} variant="secondary" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>

              <Button className="w-full" onClick={() => onSelectExercise(rec.exercise.id)}>
                Comenzar Ejercicio
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
