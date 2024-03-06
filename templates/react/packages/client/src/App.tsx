import { useMUD } from "./mud/useMUD";
import { addTask, toggleTask, deleteTask } from "./mud/systemCalls";

const styleUnset = { all: "unset" } as const;

export function App() {
  const { network, burner } = useMUD();

  const tasks = network.useStore((state) => {
    const records = Object.values(state.getRecords(network.tables.Tasks));
    records.sort((a, b) => Number(a.value.createdAt - b.value.createdAt));
    return records;
  });

  return (
    <>
      <table>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td align="right">
                <input
                  type="checkbox"
                  checked={task.value.completedAt > 0n}
                  title={task.value.completedAt === 0n ? "Mark task as completed" : "Mark task as incomplete"}
                  disabled={!burner}
                  onChange={async (event) => {
                    if (!burner) return;
                    event.preventDefault();
                    const checkbox = event.currentTarget;

                    checkbox.disabled = true;
                    try {
                      await toggleTask(network, burner.walletClient, task.key.key);
                    } finally {
                      checkbox.disabled = false;
                    }
                  }}
                />
              </td>
              <td>{task.value.completedAt > 0n ? <s>{task.value.description}</s> : <>{task.value.description}</>}</td>
              <td align="right">
                <button
                  type="button"
                  title="Delete task"
                  style={styleUnset}
                  disabled={!burner}
                  onClick={async (event) => {
                    if (!burner) return;
                    event.preventDefault();
                    if (!window.confirm("Are you sure you want to delete this task?")) return;

                    const button = event.currentTarget;
                    button.disabled = true;
                    try {
                      await deleteTask(network, burner.walletClient, task.key.key);
                    } finally {
                      button.disabled = false;
                    }
                  }}
                >
                  &times;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>
              <input type="checkbox" disabled />
            </td>
            <td colSpan={2}>
              <form
                onSubmit={async (event) => {
                  if (!burner) return;
                  event.preventDefault();
                  const form = event.currentTarget;
                  const fieldset = form.querySelector("fieldset");
                  if (!(fieldset instanceof HTMLFieldSetElement)) return;

                  const formData = new FormData(form);
                  const desc = formData.get("description");
                  if (typeof desc !== "string") return;

                  fieldset.disabled = true;
                  try {
                    await addTask(network, burner.walletClient, desc);
                    form.reset();
                  } finally {
                    fieldset.disabled = false;
                  }
                }}
              >
                <fieldset disabled={!burner} style={styleUnset}>
                  <input type="text" name="description" />{" "}
                  <button type="submit" title="Add task">
                    Add
                  </button>
                </fieldset>
              </form>
            </td>
          </tr>
        </tfoot>
      </table>
    </>
  );
}
