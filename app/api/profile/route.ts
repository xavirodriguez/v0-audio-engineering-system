import { type NextRequest, NextResponse } from "next/server"
import type { StudentProfile } from "@/lib/types/exercise-system"

// In production, this would use a real database
// For now, we'll use a simple in-memory store
const profileStore = new Map<string, StudentProfile>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 })
  }

  const profile = profileStore.get(userId)

  if (!profile) {
    // Return a new profile
    const newProfile: StudentProfile = {
      id: userId,
      level: "beginner",
      strengths: [],
      weaknesses: [],
      practiceHistory: [],
      totalPracticeTime: 0,
      averageAccuracy: 0,
      improvementRate: 0,
      toneQualityScore: 75,
    }
    return NextResponse.json(newProfile)
  }

  return NextResponse.json(profile)
}

export async function POST(request: NextRequest) {
  try {
    const profile: StudentProfile = await request.json()

    if (!profile.id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 })
    }

    profileStore.set(profile.id, profile)

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    return NextResponse.json({ error: "Invalid profile data" }, { status: 400 })
  }
}
