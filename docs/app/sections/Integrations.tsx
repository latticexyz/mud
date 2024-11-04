import Image from "next/image";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";

export default function Integrations() {
  return (
    <Section className="bg-black pt-12 pb-16">
      <Container className="space-y-12">
        <div className="space-y-4">
          <h3 className="uppercase text-sm text-white/50 font-mono">Integrations</h3>
          <div>
            <h2 className="text-xl font-mono uppercase">Standard World Interface</h2>
            {/* TODO: add buttons */}
          </div>
          <p className="text-white/70 text-sm">
            Quarry leverages MUD’s Standard World Interfaces (SWI), which are fully open-source under the mud_* JSON-RPC
            namespace. The SWI covers everything from indexing to pre-confirmations. Quarry is Lattice’s full-stack
            implementation of the Standard World Interface.
          </p>
        </div>

        <div>
          <Image src="/images/diagrams/swi.svg" alt="Standard World Interface" width={1148} height={401} />
        </div>
      </Container>
    </Section>
  );
}
