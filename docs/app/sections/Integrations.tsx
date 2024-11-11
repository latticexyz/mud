import Image from "next/image";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";

export default function Integrations() {
  return (
    <Section className="bg-black py-8 lg:pt-12 lg:pb-14">
      <Container>
        <div className="flex flex-col lg:flex-row justify-between">
          <div className="space-y-3">
            <h3 className="uppercase text-sm text-white/50 font-mono">Integrations</h3>
            <h2 className="text-lg md:text-xl font-mono uppercase">Standard World Interface</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:h-[50px] mt-8 lg:mt-0">
            <a
              href="https://lattice.xyz/quarry"
              rel="noopener noreferrer"
              target="_blank"
              className="text-sm p-4 leading-none font-mono uppercase bg-[#F1A50E] text-white inline-flex items-center gap-3.5"
            >
              <Image src="/images/logos/quarry-white.svg" alt="Quarry" width={21} height={21} />
              Explore Quarry
            </a>
            <a
              href="https://mud.dev/introduction"
              rel="noopener noreferrer"
              target="_blank"
              className="text-sm p-4 leading-none font-mono uppercase inline-flex items-center gap-3.5 border border-mud text-mud"
            >
              <Image src="/images/logos/mud-transparent.svg" alt="MUD" width={21} height={21} />
              Read MUD docs
            </a>
          </div>
        </div>

        <p className="text-white/70 text-sm mt-8 lg:mt-4 w-full lg:max-w-xl">
          Not only is the MUD codebase fully open-source under the MIT license, all of its interfaces with peripheral
          services and execution environments—indexers, blockchains, ERC-4337 bundlers—are openly accessible and under
          standardization.
        </p>

        <p className="text-white/70 text-sm mt-8 lg:mt-4 w-full lg:max-w-xl">
          Launch with Lattice’s Quarry environment to get 7ms ultra-low latency and seamless onboarding, or design your
          own stack with any EVM blockchain, an open-source ERC-4337 bundler, and the open-source MUD indexer.
        </p>
      </Container>

      <div>
        <div className="w-full overflow-x-auto mt-8 lg:mt-12">
          <Container>
            <Image
              src="/images/diagrams/swi.svg"
              alt="Standard World Interface"
              width={1148}
              height={401}
              className="max-w-[1148px] pr-4 sm:pr-6 md:pr-0 md:w-full"
            />

            <p className="text-xs mt-2 md:mt-4 lg:mt-6 md:text-sm opacity-50 text-center hidden md:block">
              The Standard World Interface enables custom-built, low-latency environments like Lattice's Quarry.
            </p>
          </Container>
        </div>
        <p className="text-sm text-white/30 text-center mt-4 text-[19px] md:hidden">← Scroll to explore →</p>
      </div>
    </Section>
  );
}
