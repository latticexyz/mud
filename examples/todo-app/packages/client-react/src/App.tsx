import { useEntityQuery } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { useState } from "react";
import { Has, HasValue, getComponentValueStrict } from "@latticexyz/recs";

function toKey(entityId: string) {
  return "0x" + entityId.replace("0x", "").padStart(64, "0");
}

export const App = () => {
  const {
    world,
    components: { TodoItem, Owned },
    playerEntityId,
    worldSend,
  } = useMUD();

  const [newTodo, setNewTodo] = useState("");

  if(!playerEntityId) return;

  const allTodos = useEntityQuery([HasValue(Owned, { owner: toKey(playerEntityId) }), Has(TodoItem)]);

  return (
    <>
      <h1>Todos</h1>
      <ul>
        {allTodos.map((todo) => {
          const { body, completed } = getComponentValueStrict(TodoItem, todo);
          const todoKey = toKey(world.entities[todo]);

          return (
            <li key={todo}>
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => {
                  worldSend("toggleComplete", [todoKey]);
                }}
              />
              {" "}
              {body}
              {"  "}
              <button
                onClick={() => {
                  worldSend("remove", [todoKey]);
                }}
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button
          onClick={() => {
            worldSend("add", [newTodo]);
            setNewTodo("");
          }}
        >
          Add
        </button>
      </form>
    </>
  );
};
