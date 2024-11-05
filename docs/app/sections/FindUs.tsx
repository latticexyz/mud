import Image from "next/image";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { cn } from "../../lib/cn";

function FindUsItem({ title, href, icon }: { title: string; href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      className={cn(
        "flex md:flex-col gap-4 items-center md:items-start md:justify-between md:h-[165px]",
        "md:pl-9 pl-6 pr-3 py-5 md:py-7",
        "font-mono uppercase leading-none text-sm md:text-lg",
        "bg-light-gray border border-white/20",
        "transition hover:bg-mud/20 hover:border-mud/30",
      )}
    >
      <span className="w-[20px] md:w-full">{icon}</span>
      {title}
    </a>
  );
}

export default function FindUs() {
  return (
    <Section className="bg-black pt-10 pb-12">
      <Container>
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="font-mono uppercase text-lg md:text-xl">Find us</h2>
            <p className="text-white/70 text-sm md:text-md">
              Discover more MUD resources, and join our community online.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <FindUsItem
              href="https://newsletter.lattice.xyz/"
              title="Newsletter"
              icon={<Image src="/images/icons/magazine.svg" alt="Magazine" width={32} height={32} />}
            />
            <FindUsItem
              href="https://lattice.xyz/discord"
              title="Discord"
              icon={<Image src="/images/icons/discord.svg" alt="Discord" width={36} height={36} />}
            />
            <FindUsItem
              href="https://x.com/latticexyz"
              title="Twitter"
              icon={<Image src="/images/icons/twitter.svg" alt="Twitter" width={32} height={32} />}
            />
            <FindUsItem
              href="https://www.youtube.com/@latticexyz"
              title="YouTube"
              icon={<Image src="/images/icons/youtube.svg" alt="YouTube" width={38} height={38} />}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
