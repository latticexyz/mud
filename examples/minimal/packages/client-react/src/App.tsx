import { useRow, useRows } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { useEffect, useState } from "react";

const ITEMS = ["cup", "spoon", "fork"];
const VARIANTS = ["yellow", "green", "red"];

export const App = () => {
  const { storeCache, world, publicClient } = useMUD();

  const counter = useRow(storeCache, {
    table: "CounterTable",
    key: { key: "0x000000000000000000000000000000000000000000000000000000000000060d" },
  })?.value;

  const [myMessage, setMyMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);
  const message = useRow(storeCache, { table: "MessageTable", key: {} })?.value;

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
          const tx = await world.write.increment({ gasPrice: 0n });

          console.log("increment tx", tx);
          console.log("increment result", await publicClient.waitForTransactionReceipt({ hash: tx }));
        }}
      >
        Increment
      </button>{" "}
      <button
        type="button"
        onClick={async () => {
          const tx = await world.simulate.willRevert();

          console.log("willRevert tx", tx);
        }}
      >
        Fail gas estimate
      </button>{" "}
      <button
        type="button"
        onClick={async () => {
          // set gas limit so we skip estimation and can test tx revert
          const tx = await world.write.willRevert({ gasPrice: 0n });

          console.log("willRevert tx", tx);
          console.log("willRevert result", await publicClient.waitForTransactionReceipt({ hash: tx }));
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
            await world.write.sendMessage([myMessage], { gasPrice: 0n });
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
                const tx = await world.write.pickUp([index, index], { gasPrice: 0n });
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
