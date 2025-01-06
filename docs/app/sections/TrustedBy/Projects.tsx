import TextFader from "../../../components/ui/TextFader";

const projects = [
  "EVE Frontier",
  "Biomes",
  "This Cursed Machine",
  "Cafe Cosmos",
  "Battle for Blockchain",
  "Words3",
  "Primodium",
  "Ultimate Dominion",
  "YONK",
  "Dark Forest MUD",
  "Dappmon",
  "Project Mirage",
  "Cloudlines",
  "For the Kingdom",
];

export default function Projects() {
  return (
    <div>
      <div className="flex h-[42px] items-center">
        <TextFader texts={projects} />
      </div>
      <p className="font-mono-secondary mt-[16px] text-[19px]">
        <span className="font-bold">30+</span>
        <span className="opacity-50"> projects</span>
      </p>
    </div>
  );
}
