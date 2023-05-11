import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { useEffect, useState } from "react";
import { Has, getComponentValueStrict } from "@latticexyz/recs";
import { to256BitString } from "@latticexyz/utils";

export const App = () => {
  const {
    components: { CounterTable, MessageTable, PositionTable, LoadingState },
    singletonEntity,
    worldSend,
  } = useMUD();

  const thingsWithPosition = useEntityQuery([Has(PositionTable)]);
  const loadingState = useComponentValue(LoadingState, singletonEntity);

  // useEffect(() => {
  //   const int = setInterval(() => {
  //     const randomPosiiton = {
  //       x: Math.floor(Math.random() * 10000),
  //       y: Math.floor(Math.random() * 10000),
  //     };
  //     worldSend("addPosition", [
  //       to256BitString(`${Math.floor(Math.random() * 200_000)}`),
  //       randomPosiiton.x,
  //       randomPosiiton.y,
  //     ]);
  //   }, 50);

  //   return () => clearInterval(int);
  // }, []);

  const counter = useComponentValue(CounterTable, singletonEntity);

  const [myMessage, setMyMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);
  const message = useComponentValue(MessageTable, singletonEntity);

  useEffect(() => {
    if (!message?.value) return;

    setMessages((messages) => [...messages, `${new Date().toLocaleTimeString()}: ${message.value}`]);
  }, [message]);

  return (
    <>
      <div>
        Counter: <span>{counter?.value ?? "??"}</span>
      </div>
      <button
        type="button"
        onClick={async () => {
          const tx = await worldSend("increment", []);

          console.log("increment tx", tx);
          console.log("increment result", await tx.wait());
        }}
      >
        Increment
      </button>{" "}
      <button
        type="button"
        onClick={async () => {
          const tx = await worldSend("willRevert", []);

          console.log("willRevert tx", tx);
          console.log("willRevert result", await tx.wait());
        }}
      >
        Fail gas estimate
      </button>{" "}
      <button
        type="button"
        onClick={async () => {
          // set gas limit so we skip estimation and can test tx revert
          const tx = await worldSend("willRevert", [{ gasLimit: 100000 }]);

          console.log("willRevert tx", tx);
          console.log("willRevert result", await tx.wait());
        }}
      >
        Revert tx
      </button>
      <div>
        <h1>Chat</h1>
        <textarea value={messages.join("\n")} rows={10} cols={50} readOnly>
          {messages.join("\n")}
        </textarea>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await worldSend("sendMessage", [myMessage]);
            setMyMessage("");
          }}
        >
          <input value={myMessage} onChange={(event) => setMyMessage(event.target.value)} type="text" />{" "}
          <button type="submit" disabled={!myMessage}>
            <span role="img" aria-label="Send">
              📤
            </span>{" "}
            Send
          </button>
        </form>
      </div>
      <div>
        <h1>Debug</h1>
        <p>
          Loading state: {loadingState?.percentage ?? "???"}
          {loadingState?.msg}
        </p>

        <button
          onClick={() => {
            const randomPosiiton = {
              x: Math.floor(Math.random() * 10000),
              y: Math.floor(Math.random() * 10000),
            };
            worldSend("addPosition", [
              to256BitString(`${Math.floor(Math.random() * 200_000)}`),
              randomPosiiton.x,
              randomPosiiton.y,
            ]);
          }}
        >
          add random position to random entity
        </button>

        <p>{thingsWithPosition.length} entities with position</p>
        <table>
          <thead>
            <tr>
              <th>Entity</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            {thingsWithPosition.map((entity) => {
              const position = getComponentValueStrict(PositionTable, entity);
              return (
                <tr key={entity}>
                  <td>{entity}</td>
                  <td>
                    {position.x}, {position.y}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};
