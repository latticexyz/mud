import { useMUD } from "./MUDContext";

export const App = () => {
  const {
    network: { tables, useStore },
    systemCalls: { addTask, toggleTask, deleteTask },
  } = useMUD();

  const tasks = useStore((state) => {
    const records = Object.values(state.getRecords(tables.Tasks));
    records.sort((a, b) => Number(a.value.createdAt - b.value.createdAt));
    return records;
  });

  return (
    <>
      <table>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.value.description}</td>
              <td align="right">
                <input
                  type="checkbox"
                  checked={task.value.completedAt > 0n}
                  title={task.value.completedAt === 0n ? "Mark task as completed" : "Mark task as incomplete"}
                  onChange={async (event) => {
                    event.preventDefault();
                    const checkbox = event.currentTarget;

                    checkbox.disabled = true;
                    try {
                      await toggleTask(task.key.key);
                    } finally {
                      checkbox.disabled = false;
                    }
                  }}
                />
              </td>
              <td>
                <button
                  type="button"
                  title="Delete task"
                  onClick={async (event) => {
                    event.preventDefault();
                    const button = event.currentTarget;

                    button.disabled = true;
                    try {
                      await deleteTask(task.key.key);
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
            <td colSpan={2}>
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const fieldset = form.querySelector("fieldset");
                  if (!(fieldset instanceof HTMLFieldSetElement)) return;

                  const formData = new FormData(form);
                  const desc = formData.get("description");
                  if (typeof desc !== "string") return;

                  fieldset.disabled = true;
                  try {
                    await addTask(desc);
                    form.reset();
                  } finally {
                    fieldset.disabled = false;
                  }
                }}
              >
                <fieldset style={{ all: "unset" }}>
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
};
