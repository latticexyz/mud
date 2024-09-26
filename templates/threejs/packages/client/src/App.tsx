/* eslint-disable react/no-unknown-property */
// Workaround react-three-fiber types by disabling unknown properties:
// https://github.com/pmndrs/react-three-fiber/discussions/2487

import { Canvas, Color, ThreeElements, useThree } from "@react-three/fiber";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { getComponentValueStrict, Has } from "@latticexyz/recs";
import { useMUD } from "./MUDContext";
import { useKeyboardMovement } from "./useKeyboardMovement";

const headerStyle = { backgroundColor: "black", color: "white" };
const cellStyle = { padding: 20 };

const Plane = () => {
  return (
    <>
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[20, 0.1, 20]} />
        <meshStandardMaterial color="#000" opacity={0.9} transparent />
      </mesh>

      <mesh position={[0, 3, -10]}>
        <boxGeometry args={[20, 5, 0.1]} />
        <meshStandardMaterial color="#F00" opacity={0.5} transparent />
      </mesh>

      <mesh position={[10, 3, 0]}>
        <boxGeometry args={[0.1, 5, 20]} />
        <meshStandardMaterial color="#0F0" opacity={0.5} transparent />
      </mesh>

      <mesh position={[5, 2, 0]}>
        <sphereGeometry args={[2, 10, 10]} />
        <meshStandardMaterial color="#FF0" opacity={0.8} transparent />
      </mesh>

      <mesh position={[0, 2, 5]}>
        <sphereGeometry args={[2, 10, 10]} />
        <meshStandardMaterial color="#FF0" opacity={0.8} transparent />
      </mesh>

      <mesh position={[-5, 2, 0]}>
        <sphereGeometry args={[2, 10, 10]} />
        <meshStandardMaterial color="#FF0" opacity={0.8} transparent />
      </mesh>

      <mesh position={[0, 2, -5]}>
        <sphereGeometry args={[2, 10, 10]} />
        <meshStandardMaterial color="#FF0" opacity={0.8} transparent />
      </mesh>

      <mesh position={[5, 2, -5]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color="#008" opacity={0.8} transparent />
      </mesh>

      <mesh position={[5, 2, 5]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color="#008" opacity={0.8} transparent />
      </mesh>

      <mesh position={[-5, 2, -5]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color="#008" opacity={0.8} transparent />
      </mesh>
    </>
  );
};

const Player = (props: ThreeElements["mesh"] & { color: Color }) => {
  return (
    <>
      <mesh {...props}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color={props.color} />
      </mesh>
      <mesh {...props}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color={props.color} />
      </mesh>
    </>
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
      <Plane />
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

const Directions = () => {
  return (
    <>
      <p>
        You are the rectangular prism, moving around the scene. To move use <b>W</b>, <b>A</b>, <b>S</b>, and <b>D</b>.
        You can also move up (<b>T</b>) and down (<b>G</b>).
      </p>
    </>
  );
};

const PlayerInfo = () => {
  const {
    components: { Position },
    network: { playerEntity },
  } = useMUD();

  const playerPosition = useComponentValue(Position, playerEntity);

  if (!playerPosition) {
    return (
      <div style={headerStyle}>
        <table>
          <tbody>
            <tr>
              <td>
                <h2>Reading player position</h2>
              </td>
              <td>
                <Directions />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={headerStyle}>
      <table>
        <tbody>
          <tr>
            <td>
              <table>
                <tbody>
                  <tr>
                    <th>Coordinate</th>
                    <th>Value</th>
                  </tr>
                  <tr>
                    <th>x</th>
                    <td align="right">{playerPosition.x}</td>
                  </tr>
                  <tr>
                    <th>y</th>
                    <td align="right">{playerPosition.y}</td>
                  </tr>
                  <tr>
                    <th>z</th>
                    <td align="right">{playerPosition.z}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style={cellStyle}>
              <Directions />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const App = () => {
  return (
    <>
      <PlayerInfo />
      <Canvas style={styles}>
        <Scene />
      </Canvas>
    </>
  );
};
