import { InteractivePractice } from "@/components/interactive-practice";

/**
 * The practice page.
 * @returns {JSX.Element} - The rendered practice page.
 */
export default async function PracticaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <InteractivePractice locale={locale} />;
}
