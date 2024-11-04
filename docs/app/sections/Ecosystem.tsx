import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";

export default function Ecosystem() {
  return (
    <Section className="bg-light-gray pt-10 pb-12">
      <Container>
        <div className="space-y-3">
          <h2 className="font-mono uppercase text-xl">Ecosystem</h2>
          <p className="text-white/70 text-md">Start using a wide ecosystem of projects powered by MUD.</p>
        </div>
      </Container>
    </Section>
  );
}
