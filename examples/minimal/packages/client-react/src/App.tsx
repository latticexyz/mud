import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { useEffect, useState } from "react";
import { stringToBytes16, stringToBytes32 } from "@latticexyz/utils";

export const App = () => {
  const {
    components: { CounterTable, MessageTable },
    singletonEntity,
    worldSend,
    storeCache,
  } = useMUD();

  const counter = useComponentValue(CounterTable, singletonEntity);

  const [myMessage, setMyMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);
  const message = useComponentValue(MessageTable, singletonEntity);

  useEffect(() => {
    storeCache.tables.Inventory.subscribe((update) => console.log("got update from inventory table", update));
  }, [storeCache]);

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
          const tx = await worldSend("pickUp", [stringToBytes32("someItem"), 1]);

          console.log("pickUp tx", tx);
          console.log("pickUp result", await tx.wait());
        }}
      >
        Set test table
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
    </>
  );
};
