import { Navbar } from "@/components/sections/navbar";
import { Demo } from "@/components/sections/demo";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="pt-14">
        <Demo />
      </main>
      <Footer />
    </>
  );
}
