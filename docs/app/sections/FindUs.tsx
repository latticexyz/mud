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
        "bg-light-gray border border-white/20 pl-9 pr-3 py-7 font-mono uppercase text-lg leading-none text-[25px] h-[165px] flex flex-col justify-between",
        "transition hover:bg-mud/20 hover:border-mud/30",
      )}
    >
      {icon}
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
            <h2 className="font-mono uppercase text-xl">Find us</h2>
            <p className="text-white/70 text-md">Discover more MUD resources, and join our community online.</p>
          </div>

          <div className="grid grid-cols-4 gap-4">
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
