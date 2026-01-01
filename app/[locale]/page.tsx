import { Header } from "@/components/header"
import { Practice } from "@/components/practice"
import { Footer } from "@/components/footer"

/**
 * The home page.
 * @returns {JSX.Element} - The rendered home page.
 */
export default async function Home({
  params,
}: {
  params: Promise<{ locale:string }>
}) {
  const { locale } = await params
  return (
    <main className="min-h-screen">
      <Header locale={locale} />
      <Practice locale={locale} />
      <Footer locale={locale} />
    </main>
  )
}
