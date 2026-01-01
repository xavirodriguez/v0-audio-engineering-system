import InteractivePracticeLoader from "./interactive-practice-loader"

/**
 * A component that provides an interactive practice session for the user.
 * @returns {JSX.Element} - The rendered practice component.
 */
export function Practice({ locale }: { locale: string }) {
  return <InteractivePracticeLoader locale={locale} />
}
