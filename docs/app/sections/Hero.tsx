import { LatticeIcon } from "../../src/icons/LatticeIcon";
import Link from "next/link";
import { cn } from "../../lib/cn";
import { Section } from "../../components/ui/Section";
import { Container } from "../../components/ui/Container";

export default function Hero() {
  return (
    <Section className="bg-mud">
      <Container>
        <div
          className={cn(
            "min-h-screen flex flex-col animate-in animate-duration-500 fade-in",
            "gap-12",
            "sm:justify-between",
            "md:gap-16",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="font-mono text-3xl uppercase sm:text-4xl">MUD</div>
            <a
              href="https://lattice.xyz"
              className="shrink-0 flex md:flex-row-reverse items-center gap-3 p-3 -m-3 font-mono md:text-lg uppercase leading-none transition hover:bg-white hover:text-mud"
            >
              <span>
                Built by
                <span className="hidden md:inline"> Lattice</span>
              </span>
              <LatticeIcon />
            </a>
          </div>
          <div className={cn("grow flex flex-col md:flex-row-reverse", "gap-12", "md:gap-y-16")}>
            <div className="grow md:grow-0 flex items-center md:items-end justify-center">
              <img
                src="/images/logos/mud-white.svg"
                className="aspect-square max-w-none w-[12rem] sm:w-[16rem] md:w-[14rem] lg:w-[18rem]"
              />
            </div>
            <div className="space-y-8 md:grow md:self-end">
              <div className="space-y-4">
                <div className="max-w-2xl font-mono text-3xl sm:text-3xl md:text-4xl lg:text-5xl uppercase [text-wrap:balance]">
                  Battle-tested onchain framework for developers.
                </div>
                <p className="max-w-lg text-xl md:text-2xl [text-wrap:balance]">
                  MUD provides you with the tools to build ambitious onchain applications.
                </p>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/introduction"
                  className="bg-white p-4 font-mono uppercase leading-none text-mud transition hover:bg-black hover:text-white"
                >
                  Documentation
                </Link>
                <a
                  href="https://github.com/latticexyz/mud"
                  className="hover: bg-white/20 p-4 font-mono uppercase leading-none transition hover:bg-black hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
