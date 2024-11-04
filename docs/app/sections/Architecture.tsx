import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";

export default function Architecture() {
  return (
    <Section className="py-14">
      <Container>
        <div className="grid grid-cols-2">
          <div className="flex flex-col gap-[18px]">
            <h2 className="text-xl uppercase font-mono">Open source & extensible</h2>
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
        </div>
      </Container>
    </Section>
  );
}
