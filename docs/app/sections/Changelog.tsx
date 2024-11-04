import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";

const ChangelogItem = () => {
  return (
    <div className="inline-block h-full w-[485px]">
      <div className="border border-white/20 bg-light-gray px-6 py-6 text-white">
        <div className="flex items-center justify-between">
          <div className="inline-block w-[59px] bg-white text-black text-center font-mono text-sm uppercase leading-[41px]">
            2.0
          </div>
          <p className="font-mono text-sm uppercase text-white/50">may 1, 2024</p>
        </div>

        <ul className="mt-6 list-disc pl-5 text-[18px] text-white/70 flex flex-col gap-[8px]">
          <li>Some thing that was updated goes here</li>
          <li>Some thing that was updated goes here</li>
          <li>Some thing that was updated goes here</li>
          <li>Some thing that was updated goes here</li>
        </ul>
      </div>
    </div>
  );
};

export default function Changelog() {
  return (
    <Section className="bg-black pt-12 pb-14">
      <Container>
        <div className="space-y-8">
          <div>
            <h2 className="font-mono uppercase text-xl">Changelog</h2>
            <p className="text-white/70 text-md mt-3">Learn what’s changed in recent releases of MUD.</p>
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-flow-col gap-4">
              <ChangelogItem />
              <ChangelogItem />
              <ChangelogItem />
              <ChangelogItem />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
