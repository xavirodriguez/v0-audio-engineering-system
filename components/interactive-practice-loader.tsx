"use client"

import dynamic from "next/dynamic"

const InteractivePractice = dynamic(
  () => import("./interactive-practice").then((mod) => mod.InteractivePractice),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] w-full items-center justify-center">
        <p>Loading Practice Session...</p>
      </div>
    ),
  }
)

export default function InteractivePracticeLoader() {
  return <InteractivePractice />
}
