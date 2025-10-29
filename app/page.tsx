import { Header } from "@/components/header";
import { Practice } from "@/components/practice";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Practice />
      <Footer />
    </main>
  );
}
