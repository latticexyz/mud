import { useComponentValue, useRows } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { useEffect, useState } from "react";

const ITEMS = ["cup", "spoon", "fork"];
const VARIANTS = ["yellow", "green", "red"];

export const App = () => {
  const {
    components: { CounterTable, MessageTable },
    network: { singletonEntity, worldSend, storeCache },
  } = useMUD();

  const counter = useComponentValue(CounterTable, singletonEntity);

  const [myMessage, setMyMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);
  const message = useComponentValue(MessageTable, singletonEntity);

  const inventory = useRows(storeCache, { table: "Inventory" });

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
        <div>
          {ITEMS.map((item, index) => (
            <button
              key={item + index}
              type="button"
              onClick={async () => {
                const tx = await worldSend("pickUp", [index, index]);
                console.log("pick up tx", tx);
              }}
            >
              Pick up a {VARIANTS[index]} {item}
            </button>
          ))}
        </div>
        <h1>Inventory</h1>
        <ul>
          {inventory.map(({ key, value }) => (
            <li key={key.owner + key.item + key.itemVariant}>
              {key.owner.substring(0, 8)} owns {value.amount} of {VARIANTS[key.itemVariant]} {ITEMS[key.item]}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
