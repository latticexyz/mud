import Link from "next/link";
import Image from "next/image";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import changelog from "../../data/changelog.json";

type ChangelogItem = (typeof changelog)[number];

const ChangelogItem = ({ version, date, changes }: ChangelogItem) => {
  const allChanges = [...changes.patch, ...changes.minor, ...changes.major];
  if (allChanges.length === 0) {
    return null;
  }

  return (
    <Link
      href={`https://mud.dev/changelog#version-${version.replace(/\./g, "")}`}
      target="_blank"
      className="flex h-full flex-shrink-0 pr-4"
    >
      <div className="border border-white/20 bg-light-gray px-6 py-6 text-white">
        <div className="flex items-center justify-between">
          <div className="inline-block px-2 bg-white text-black text-center font-mono text-sm uppercase leading-[41px]">
            {version}
          </div>
          <p className="font-mono text-sm uppercase text-white/50">
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <ul className="mt-6 list-disc pl-5 text-[18px] text-white/70">
          {allChanges.slice(0, 4).map((change) => (
            <li key={change.title} title={change.title}>
              <span className="truncate block max-w-[400px]">{change.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </Link>
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
        </div>
      </Container>

      <div className="w-full overflow-x-auto mt-8">
        <Container>
          <div className="grid grid-rows-1 grid-flow-col">
            {changelog.map((item) => (
              <ChangelogItem key={item.version} {...item} />
            ))}
          </div>
        </Container>
      </div>
    </Section>
  );
}
