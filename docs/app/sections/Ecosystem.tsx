import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";

export default function Ecosystem() {
  return (
    <Section className="bg-light-gray py-8 md:pt-10 md:pb-12">
      <Container>
        <div className="space-y-3">
          <h2 className="font-mono uppercase text-lg md:text-xl">Ecosystem</h2>
          <p className="text-white/70 text-sm md:text-md">Start using a wide ecosystem of projects powered by MUD.</p>
        </div>
      </Container>
    </Section>
  );
}
