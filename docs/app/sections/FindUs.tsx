import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { cn } from "../../lib/cn";

function FindUsItem({ title, href, icon }: { title: string; href: string; icon: string }) {
  return (
    // <div className="">
    //   {icon}
    //   {title}
    // </div>

    <a
      href={href}
      // TODO: add new tab
      // eslint-disable-next-line max-len
      className={cn(
        "bg-light-gray border border-white/20 pl-9 pr-3 py-7 font-mono uppercase text-lg leading-none text-[25px]",
        "transition hover:bg-[#331804] hover:border-[#703408]",
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
            <FindUsItem href="#" title="Newsletter" icon="#" />
            <FindUsItem href="#" title="Discord" icon="#" />
            <FindUsItem href="#" title="Twitter" icon="#" />
            <FindUsItem href="#" title="YouTube" icon="#" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
