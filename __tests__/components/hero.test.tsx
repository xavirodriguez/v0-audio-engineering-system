import { render, screen } from "@testing-library/react"
import { Hero } from "@/components/hero"
import { vi } from "vitest"

// Use vi.hoisted to ensure the mock function is created before vi.mock is executed
const { mockGetTranslations } = vi.hoisted(() => {
  return { mockGetTranslations: vi.fn() }
})

// Mock the server-side getTranslations function from next-intl/server
vi.mock("next-intl/server", () => ({
  getTranslations: mockGetTranslations,
}))

describe("Hero Component i18n", () => {
  // Reset the mock before each test
  beforeEach(() => {
    mockGetTranslations.mockClear()
  })

  it("renders correctly in Spanish", async () => {
    // Configure the mock to return the Spanish translations
    mockGetTranslations.mockImplementation(async (namespace: string) => {
      const messages = (await import("../../messages/es.json")).default
      return (key: string) => messages[namespace][key] || key
    })

    // Await the async Server Component to get the JSX
    const HeroComponent = await Hero()
    render(HeroComponent)

    expect(screen.getByRole("heading", { name: /Domina el arte del violín/i })).toBeInTheDocument()
    expect(screen.getByText(/Aprende a tocar el violín con lecciones interactivas/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Comenzar Ahora/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Ver Demo/i })).toBeInTheDocument()
  })

  it("renders correctly in English", async () => {
    // Configure the mock to return the English translations
    mockGetTranslations.mockImplementation(async (namespace: string) => {
      const messages = (await import("../../messages/en.json")).default
      return (key: string) => messages[namespace][key] || key
    })

    // Await the async Server Component to get the JSX
    const HeroComponent = await Hero()
    render(HeroComponent)

    expect(screen.getByRole("heading", { name: /\[en\] Domina el arte del violín/i })).toBeInTheDocument()
    expect(screen.getByText(/\[en\] Aprende a tocar el violín con lecciones interactivas/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /\[en\] Comenzar Ahora/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /\[en\] Ver Demo/i })).toBeInTheDocument()
  })
})
