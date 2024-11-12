import Image from "next/image";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";

export default function Architecture() {
  return (
    <Section className="py-8 lg:py-14 bg-mud-dark">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-12">
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-[18px]">
            <h2 className="text-lg md:text-xl uppercase font-mono">Tried and tested</h2>
            <p className="text-sm">
              First released in 2022, MUD has been used by countless onchain developers—from solo devs to 50-strong game
              studios—to build applications in production.
            </p>
            <p className="text-sm">
              The MUD automatic indexer, MUD-native account abstraction, support for token standards… all of MUD has
              been tried and tested by production worlds with millions of onchain entities and thousands of users.
            </p>
            <p className="text-sm">
              And it is still continuously evolving. New modules and updates are constantly being worked on by MUD core
              devs and contributors, bringing new features and performance improvements.
            </p>
          </div>

          <div className="md:col-span-7 lg:col-span-8 lg:mt-12">
            <Image src="/images/diagrams/mud.svg" alt="MUD Architecture" width={837} height={469} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
