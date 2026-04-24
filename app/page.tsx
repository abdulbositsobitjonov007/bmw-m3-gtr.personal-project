import M3GtrScrollytelling from "./components/m3-gtr-scrollytelling";
import M3GtrSections from "./components/m3-gtr-sections";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-black">
      <M3GtrScrollytelling />
      <M3GtrSections />
    </main>
  );
}
