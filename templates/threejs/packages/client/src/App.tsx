import React from "react";
import { Canvas, Color, ThreeElements, useThree } from "@react-three/fiber";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { getComponentValueStrict, Has } from "@latticexyz/recs";
import { useMUD } from "./MUDContext";
import { useKeyboardMovement } from "./useKeyboardMovement";

const Plane = (props: ThreeElements["mesh"]) => {
  return (
    <mesh {...props}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <boxGeometry args={[10, 5, 10]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
};

const Player = (props: ThreeElements["mesh"] & { color: Color }) => {
  return (
    <mesh {...props}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color={props.color} />
    </mesh>
  );
};

const Scene = () => {
  const {
    components: { Position },
    network: { playerEntity },
  } = useMUD();

  useKeyboardMovement();

  const playerPosition = useComponentValue(Position, playerEntity);
  const players = useEntityQuery([Has(Position)]).map((entity) => {
    const position = getComponentValueStrict(Position, entity);
    return {
      entity,
      position,
    };
  });

  useThree(({ camera }) => {
    if (playerPosition) {
      camera.position.set(playerPosition.x - 5, playerPosition.y + 5, playerPosition.z + 5);
    } else {
      camera.position.set(-5, 5, 5);
    }
    camera.rotation.order = "YXZ";
    camera.rotation.y = -Math.PI / 4;
    camera.rotation.x = Math.atan(-1 / Math.sqrt(2));
  });

  return (
    <group>
      <ambientLight />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <pointLight position={[10, 10, 10]} />
      <Plane position={[0, -5, 0]} />
      {players.map((p, i) => (
        <Player
          key={i}
          color={Math.floor(parseInt(p.entity) * 123456) % 16777215}
          position={[p.position.x, p.position.y, p.position.z]}
        />
      ))}
    </group>
  );
};

const styles = { height: "100vh" };

export const App = () => {
  return (
    <Canvas style={styles}>
      <Scene />
    </Canvas>
  );
};
