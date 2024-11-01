import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";

export default function FindUs() {
  return (
    <Section>
      <Container>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="font-mono uppercase text-2xl">Find us</div>
            <p className="text-lg text-white/60">Discover more MUD resources, and join our community online.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <a
              href="https://newsletter.lattice.xyz/"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              Newsletter
            </a>
            <a
              href="https://lattice.xyz/discord"
              target="_blank"
              rel="noopener noreferrer"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              Discord
            </a>
            <a
              href="https://twitter.com/latticexyz"
              target="_blank"
              rel="noopener noreferrer"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              Twitter
            </a>
            <a
              href="https://www.youtube.com/@latticexyz"
              target="_blank"
              rel="noopener noreferrer"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              YouTube
            </a>
            <a
              href="https://airtable.com/apph2KJY9nRM37M8Z/pag1r9S91UIkIoPsm/form"
              target="_blank"
              rel="noopener noreferrer"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              Reach out
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}
