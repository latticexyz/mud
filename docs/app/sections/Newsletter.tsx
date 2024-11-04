import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";

export default function Newsletter() {
  return (
    <Section className="bg-light-gray py-12">
      <Container>
        <div className="space-y-3">
          <h2 className="font-mono uppercase text-xl">Newsletter</h2>
          <p className="text-white/70 text-md">Sign up to receive regular updates about MUD.</p>
        </div>
      </Container>
    </Section>
  );
}
