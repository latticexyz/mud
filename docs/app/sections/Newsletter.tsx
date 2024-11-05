"use client";

import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { useEffect } from "react";

export default function Newsletter() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).CustomSubstackWidget = {
      substackUrl: "newsletter.lattice.xyz",
      placeholder: "Enter email here...",
      buttonText: "Submit",
      theme: "custom",
      colors: {
        primary: "#FF7613",
        input: "#313131",
        email: "#FFFFFF",
        text: "#FFFFFF",
      },
    };

    const script = document.createElement("script");
    script.src = "https://substackapi.com/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).CustomSubstackWidget;
    };
  }, []);

  return (
    <Section className="bg-light-gray pt-12 pb-16">
      <Container>
        <div className="flex flex-col gap-[30px] justify-between items-center md:flex-row">
          <div className="space-y-3">
            <h2 className="font-mono uppercase text-xl">Newsletter</h2>
            <p className="text-white/70 text-md">Sign up to receive regular updates about MUD.</p>
          </div>

          <div id="custom-substack-embed" />
        </div>
      </Container>
    </Section>
  );
}
