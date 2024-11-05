import Image from "next/image";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";

export default function Architecture() {
  return (
    <Section className="py-8 lg:py-14 bg-mud-dark">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-12">
          <div className="lg:col-span-4 flex flex-col gap-[18px]">
            <h2 className="text-lg md:text-xl uppercase font-mono">Open source & extensible</h2>
            <p className="text-sm">
              There is no other framework that offers as much out-of-the-box utility for developers of games & other
              complex onchain apps.
            </p>
            <p className="text-sm">
              From developer experience to efficient data storage, MUD is designed to scale with the success of your
              team & project.
            </p>
            <p className="text-sm">
              All of MUD’s interfaces, from pre-confirmations to indexing, are also open under the mud_* JSON-RPC
              namespace, which lets you swap out any components as needed.
            </p>
          </div>

          <div className="lg:col-span-8">
            <Image src="/images/diagrams/mud.svg" alt="MUD Architecture" width={837} height={469} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
