import { defineRouting } from "next-intl/routing"
import { createNavigation } from "next-intl/navigation"

export const routing = defineRouting({
  locales: ["es", "en", "fr", "gl"],
  defaultLocale: "es",
  localePrefix: "as-needed",
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
