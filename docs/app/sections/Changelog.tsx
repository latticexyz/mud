import Image from "next/image";
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
    <Section className="bg-black py-8 md:pt-12 md:pb-14">
      <Container>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-mono uppercase text-lg md:text-xl">Changelog</h2>
              <p className="text-white/70 text-sm md:text-md mt-3">Learn what’s changed in recent releases of MUD.</p>
            </div>

            <a
              href="https://github.com/latticexyz/mud"
              rel="noopener noreferrer"
              target="_blank"
              className="text-sm font-mono uppercase inline-flex items-center gap-[10px] py-3 px-3 border border-white/50"
            >
              <Image src="/images/icons/github.svg" alt="GitHub" width={22} height={22} />
              Github
            </a>
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
