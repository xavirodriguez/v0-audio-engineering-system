import { Header } from "@/components/header"
import { Practice } from "@/components/practice"
import { Footer } from "@/components/footer"

/**
 * The home page.
 * @returns {JSX.Element} - The rendered home page.
 */
export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Practice />
      <Footer />
    </main>
  )
}
