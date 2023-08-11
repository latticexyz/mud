import { World } from "@latticexyz/recs";
import { NavButton } from "../NavButton";
import { StoreComponentMetadata } from "@latticexyz/store-sync/recs";

type Props = {
  world: World<StoreComponentMetadata>;
};

export function ComponentsSummary({ world }: Props) {
  const componentsWithName = world.components.filter((component) => component.metadata.componentName);
  return (
    <>
      {componentsWithName.length ? (
        <>
          <div className="flex flex-col gap-1 items-start">
            {componentsWithName.map((component) => (
              <NavButton
                key={component.id}
                to={`/components/${component.id}`}
                className="font-mono text-xs hover:text-white"
              >
                {String(component.metadata.componentName)}
              </NavButton>
            ))}
          </div>
        </>
      ) : (
        <div>Waiting for components…</div>
      )}
    </>
  );
}
