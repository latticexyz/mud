import { useEffect, useState } from "react";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Has, getComponentValueStrict } from "@latticexyz/recs";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { useMUD } from "./MUDContext";

const ITEMS = ["cup", "spoon", "fork"];
const VARIANTS = ["yellow", "green", "red"];

export const App = () => {
  const {
    components: { CounterTable, Inventory, MessageTable },
    network: { singletonEntity, worldContract, waitForTransaction },
  } = useMUD();

  const counter = useComponentValue(CounterTable, singletonEntity);

  const [myMessage, setMyMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);
  const message = useComponentValue(MessageTable, singletonEntity);

  const inventory = useEntityQuery([Has(Inventory)]);

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
          const tx = await worldContract.write.increment();

          console.log("increment tx", tx);
          console.log("increment result", await waitForTransaction(tx));
        }}
      >
        Increment
      </button>{" "}
      <button
        type="button"
        onClick={async () => {
          const tx = await worldContract.write.willRevert();

          console.log("willRevert tx", tx);
          console.log("willRevert result", await waitForTransaction(tx));
        }}
      >
        Fail gas estimate
      </button>{" "}
      <button
        type="button"
        onClick={async () => {
          // set gas limit so we skip estimation and can test tx revert
          const tx = await worldContract.write.willRevert({ gas: 100000n });

          console.log("willRevert tx", tx);
          console.log("willRevert result", await waitForTransaction(tx));
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
            await worldContract.write.sendMessage([myMessage]);
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
                const tx = await worldContract.write.pickUp([index, index]);
                console.log("pick up tx", tx);
              }}
            >
              Pick up a {VARIANTS[index]} {item}
            </button>
          ))}
        </div>
        <h1>Inventory</h1>
        <ul>
          {inventory.map((entity) => {
            const { amount } = getComponentValueStrict(Inventory, entity);
            const { owner, item, itemVariant } = decodeEntity(Inventory.metadata.keySchema, entity);
            return (
              <li key={entity}>
                {owner.substring(0, 8)} owns {amount} of {VARIANTS[itemVariant]} {ITEMS[item]}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};
