import type { PracticeSession } from "@/lib/types/exercise-system";

export type StudentLevel = "beginner" | "intermediate" | "advanced";

export class StudentProfile {
  private constructor(
    public readonly id: string,
    public level: StudentLevel,
    public strengths: string[],
    public weaknesses: string[],
    public practiceHistory: PracticeSession[],
    public totalPracticeTime: number, // in minutes
    public averageAccuracy: number,
    public improvementRate: number, // percentage
    public toneQualityScore: number
  ) {}

  public static create(
    id: string,
    level: StudentLevel = "beginner",
    history: PracticeSession[] = []
  ): StudentProfile {
    // Clone the history array to prevent mutation of the source state
    const profile = new StudentProfile(id, level, [], [], [...history], 0, 0, 0, 0);
    profile.recalculateAllMetrics();
    return profile;
  }

  public completeSession(session: PracticeSession): void {
    this.practiceHistory.push(session);
    this.recalculateAllMetrics();
  }

  private recalculateAllMetrics(): void {
    this.totalPracticeTime = this.calculateTotalPracticeTime();
    this.averageAccuracy = this.calculateAverageAccuracy();
    this.toneQualityScore = this.calculateToneQualityScore();
    this.strengths = this.identifyStrengths();
    this.weaknesses = this.identifyWeaknesses();
    this.improvementRate = this.calculateImprovementRate();
  }

  private calculateTotalPracticeTime(): number {
    return this.practiceHistory.reduce((total, session) => total + session.duration / 60, 0);
  }

  private calculateAverageAccuracy(): number {
    if (this.practiceHistory.length === 0) return 0;
    const accuracies = this.practiceHistory.map((s) => s.metrics.accuracy);
    return accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
  }

    private calculateToneQualityScore(): number {
    if (this.practiceHistory.length === 0) return 0;
    const toneScores = this.practiceHistory.map((s) => s.metrics.toneQuality || 75);
    return toneScores.reduce((a, b) => a + b, 0) / toneScores.length;
  }

  private identifyStrengths(): string[] {
    const strengths: string[] = [];
    const recentSessions = this.practiceHistory.slice(-10);
    if (recentSessions.length === 0) return strengths;

    const avgAccuracy = recentSessions.reduce((sum, s) => sum + s.metrics.accuracy, 0) / recentSessions.length;
    const avgStability = recentSessions.reduce((sum, s) => sum + s.metrics.stability, 0) / recentSessions.length;
    const avgResponseTime = recentSessions.reduce((sum, s) => sum + s.metrics.responseTime, 0) / recentSessions.length;
    const avgIntonation = recentSessions.reduce((sum, s) => sum + s.metrics.intonationError, 0) / recentSessions.length;

    if (avgAccuracy > 85) strengths.push("high-accuracy");
    if (avgStability > 80) strengths.push("stable-pitch");
    if (avgResponseTime < 500) strengths.push("quick-response");
    if (avgIntonation < 15) strengths.push("excellent-intonation");

    const exercisePerformance = new Map<string, number[]>();
    recentSessions.forEach((session) => {
      const type = session.exerciseType;
      const current = exercisePerformance.get(type) ?? [];
      exercisePerformance.set(type, [...current, session.metrics.accuracy]);
    });

    exercisePerformance.forEach((accuracies, type) => {
      const avg = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
      if (avg > 85) {
        strengths.push(`strong-${type}`);
      }
    });
    return strengths;
  }

  private identifyWeaknesses(): string[] {
    const weaknesses: string[] = [];
    const recentSessions = this.practiceHistory.slice(-10);
    if (recentSessions.length === 0) return weaknesses;

    const avgAccuracy = recentSessions.reduce((sum, s) => sum + s.metrics.accuracy, 0) / recentSessions.length;
    const avgStability = recentSessions.reduce((sum, s) => sum + s.metrics.stability, 0) / recentSessions.length;
    const avgResponseTime = recentSessions.reduce((sum, s) => sum + s.metrics.responseTime, 0) / recentSessions.length;
    const avgIntonation = recentSessions.reduce((sum, s) => sum + s.metrics.intonationError, 0) / recentSessions.length;
    const avgConsistency = recentSessions.reduce((sum, s) => sum + s.metrics.consistency, 0) / recentSessions.length;
    const avgToneQuality = recentSessions.reduce((sum, s) => sum + (s.metrics.toneQuality || 75), 0) / recentSessions.length;
    const avgAttackTime = recentSessions.reduce((sum, s) => sum + (s.metrics.attackTime || 50), 0) / recentSessions.length;

    if (avgAccuracy < 70) weaknesses.push("low-accuracy");
    if (avgStability < 60) weaknesses.push("unstable-pitch");
    if (avgResponseTime > 1000) weaknesses.push("slow-response");
    if (avgIntonation > 30) weaknesses.push("poor-intonation");
    if (avgConsistency < 60) weaknesses.push("inconsistent-performance");
    if (avgToneQuality < 60) weaknesses.push("poor-tone-quality");
    if (avgAttackTime > 100) weaknesses.push("poor-attack");
    if (avgToneQuality < 50) weaknesses.push("scratchy-tone");

    const exercisePerformance = new Map<string, number[]>();
    recentSessions.forEach((session) => {
      const type = session.exerciseType;
      const current = exercisePerformance.get(type) || [];
      exercisePerformance.set(type, [...current, session.metrics.accuracy]);
    });

    exercisePerformance.forEach((accuracies, type) => {
      const avg = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
      if (avg < 70) {
        weaknesses.push(`weak-${type}`);
      }
    });
    return weaknesses;
  }

  private calculateImprovementRate(): number {
    const sessions = this.practiceHistory;
    if (sessions.length < 5) return 0;

    const recent = sessions.slice(-5);
    const previous = sessions.slice(-10, -5);
    if (previous.length === 0) return 0;

    const recentAvg = recent.reduce((sum, s) => sum + s.metrics.accuracy, 0) / recent.length;
    const previousAvg = previous.reduce((sum, s) => sum + s.metrics.accuracy, 0) / previous.length;
    if (previousAvg === 0) return 0;

    return ((recentAvg - previousAvg) / previousAvg) * 100;
  }
}
