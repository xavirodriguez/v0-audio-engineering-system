import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Courses } from "@/components/courses"
import { Practice } from "@/components/practice"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Courses />
      <Practice />
      <Testimonials />
      <Footer />
    </main>
  )
}
