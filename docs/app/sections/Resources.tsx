import Link from "next/link";
import { SourceIcon } from "../../src/icons/SourceIcon";
import { DocsIcon } from "../../src/icons/DocsIcon";
import { StatusIcon } from "../../src/icons/StatusIcon";
import { CalendarIcon } from "../../src/icons/CalendarIcon";
import { ContributeIcon } from "../../src/icons/ContributeIcon";
import { ChangelogIcon } from "../../src/icons/ChangelogIcon";
import { Section } from "../../components/ui/Section";
import { Container } from "../../components/ui/Container";

export default function Resources() {
  return (
    <Section className="bg-light-gray pt-10 pb-12">
      <Container>
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="font-mono uppercase text-xl">Resources</h2>
            <p className="text-white/70 text-md">
              Discover more about the open source framework powering complex games & apps on Ethereum.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="https://github.com/latticexyz/mud"
              target="_blank"
              rel="noopener noreferrer"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              <SourceIcon />
              Source code
            </a>
            <Link
              href="/changelog"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              <ChangelogIcon />
              Changelog
            </Link>
            <Link
              href="/introduction"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              <DocsIcon />
              Documentation
            </Link>
            <a
              href="https://contribute.mud.dev/"
              target="_blank"
              rel="noopener noreferrer"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              <ContributeIcon />
              Contribute
            </a>
            <a
              href="https://status.mud.dev/"
              target="_blank"
              rel="noopener noreferrer"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              <StatusIcon />
              Status
            </a>
            <a
              href="https://roadmap.mud.dev/"
              target="_blank"
              rel="noopener noreferrer"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              <CalendarIcon />
              Roadmap
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}
