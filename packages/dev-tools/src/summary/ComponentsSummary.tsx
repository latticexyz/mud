import { World } from "@latticexyz/recs";
import { NavButton } from "../NavButton";
import { getComponentName } from "../recs/getComponentName";

type Props = {
  world: World;
};

export function ComponentsSummary({ world }: Props) {
  const components = [...world.components].sort((a, b) => getComponentName(a).localeCompare(getComponentName(b)));
  return (
    <>
      {components.length ? (
        <>
          <div className="flex flex-col gap-1 items-start">
            {components.map((component) => (
              <NavButton
                key={component.id}
                to={`/components/${component.id}`}
                className="font-mono text-xs hover:text-white"
              >
                {getComponentName(component)}
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
