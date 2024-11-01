import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";

export default function Projects() {
  return (
    <Section>
      <Container>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="font-mono uppercase text-2xl">Projects</div>
            <p className="text-lg text-white/60">Start using a wide ecosystem of projects powered by MUD.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="https://skystrife.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-white/20 grid overflow-hidden"
            >
              <span
                className="z-10 row-start-1 col-start-1 flex flex-col gap-4 p-12 font-mono uppercase leading-none"
                style={{ textShadow: "0 3px 6px #000" }}
              >
                <span className="text-2xl leading-none">Sky Strife</span>
                <span>An onchain strategy game</span>
              </span>
              <span
                className="row-start-1 col-start-1 bg-cover bg-center grayscale opacity-30 transition group-hover:grayscale-0 group-hover:opacity-50 group-hover:scale-105"
                style={{ backgroundImage: "url('/images/projects/sky-strife.png')" }}
              />
            </a>
            <a
              href="https://craft.mud.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-white/20 grid overflow-hidden"
            >
              <span
                className="z-10 row-start-1 col-start-1 flex flex-col gap-4 p-12 font-mono uppercase leading-none"
                style={{ textShadow: "0 3px 6px #000" }}
              >
                <span className="text-2xl leading-none">OPCraft</span>
                <span>Voxel crafting game on OP Stack</span>
              </span>
              <span
                className="row-start-1 col-start-1 bg-cover bg-center grayscale opacity-30 transition group-hover:grayscale-0 group-hover:opacity-50 group-hover:scale-105"
                style={{ backgroundImage: "url('/images/projects/opcraft.png')" }}
              />
            </a>
            <a
              href="https://www.primodium.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-white/20 grid overflow-hidden"
            >
              <span
                className="z-10 row-start-1 col-start-1 flex flex-col gap-4 p-12 font-mono uppercase leading-none"
                style={{ textShadow: "0 3px 6px #000" }}
              >
                <span className="text-2xl leading-none">Primodium</span>
                <span>An onchain city-building game</span>
              </span>
              <span
                className="row-start-1 col-start-1 bg-cover bg-center grayscale opacity-30 transition group-hover:grayscale-0 group-hover:opacity-50 group-hover:scale-105"
                style={{ backgroundImage: "url('/images/projects/primodium.png')" }}
              />
            </a>
            <a
              href="https://www.words3.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-white/20 grid overflow-hidden"
            >
              <span
                className="z-10 row-start-1 col-start-1 flex flex-col gap-4 p-12 font-mono uppercase leading-none"
                style={{ textShadow: "0 3px 6px #000" }}
              >
                <span className="text-2xl leading-none">Words3</span>
                <span>Onchain scrabble</span>
              </span>
              <span
                className="row-start-1 col-start-1 bg-cover bg-center grayscale opacity-30 transition group-hover:grayscale-0 group-hover:opacity-50 group-hover:scale-105"
                style={{ backgroundImage: "url('/images/projects/words3.png')" }}
              />
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}
