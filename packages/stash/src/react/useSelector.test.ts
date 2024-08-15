import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react-hooks";
import { useSelector } from "./useSelector";
import { defineStore } from "@latticexyz/store/config/v2";
import { createStash } from "../createStash";

describe("useCustomHook", () => {
  it("checks the re-render behavior of the hook", async () => {
    const config = defineStore({
      namespaces: {
        game: {
          tables: {
            Position: {
              schema: { player: "address", x: "uint32", y: "uint32" },
              key: ["player"],
            },
          },
        },
      },
    });
    const Position = config.namespaces.game.tables.Position;
    const stash = createStash(config);
    const player = "0x00";

    const { result } = renderHook(() => useSelector(stash, (state) => state.records["game"]["Position"][player]));
    expect(result.current).toBe(undefined);

    act(() => {
      stash.setRecord({ table: Position, key: { player }, record: { x: 1, y: 2 } });
    });

    // Expect update to have triggered rerender
    expect(result.all.length).toBe(2);
    expect(result.all).toStrictEqual([undefined, { player, x: 1, y: 2 }]);
    expect(result.current).toStrictEqual({ player, x: 1, y: 2 });

    act(() => {
      stash.setRecord({ table: Position, key: { player: "0x01" }, record: { x: 1, y: 2 } });
    });

    // Expect unrelated update to not have triggered rerender
    expect(result.all.length).toBe(2);
    expect(result.all).toStrictEqual([undefined, { player, x: 1, y: 2 }]);
    expect(result.current).toStrictEqual({ player, x: 1, y: 2 });

    // Expect update to have triggered rerender
    act(() => {
      stash.setRecord({ table: Position, key: { player }, record: { x: 1, y: 3 } });
    });

    expect(result.all.length).toBe(3);
    expect(result.all).toStrictEqual([undefined, { player, x: 1, y: 2 }, { player, x: 1, y: 3 }]);
    expect(result.current).toStrictEqual({ player, x: 1, y: 3 });
  });
});
