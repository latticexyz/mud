import { SyncStep } from "@latticexyz/store-sync";
import { useMUD } from "./MUDContext";
import { delegateToBurner, isDelegated, addTask, toggleTask, deleteTask } from "./mud/systemCalls";

const styleUnset = { all: "unset" } as const;

export const App = () => {
  const {
    network: { useStore },
    externalWalletClient,
  } = useMUD();

  const syncProgress = useStore((state) => state.syncProgress);

  if (!externalWalletClient) return <></>;

  if (syncProgress.step === SyncStep.LIVE) {
    return <Loaded />;
  } else {
    return <div>Loading</div>;
  }
};

const Loaded = () => {
  const { network, externalWalletClient } = useMUD();

  if (!externalWalletClient) throw new Error("Must be used after an external wallet connection");

  const delegation = network.useStore((state) =>
    state.getValue(network.tables.UserDelegationControl, {
      delegator: externalWalletClient.account.address,
      delegatee: network.walletClient.account.address,
    }),
  );

  if (delegation && isDelegated(delegation.delegationControlId)) {
    return (
      <div>
        <div>Burner wallet account: {network.walletClient.account.address}</div>
        <Delegated />
      </div>
    );
  }

  return (
    <div>
      <button type="button" onClick={() => delegateToBurner(network, externalWalletClient)}>
        Set up burner wallet account
      </button>
    </div>
  );
};

const Delegated = () => {
  const { network, externalWalletClient } = useMUD();

  if (!externalWalletClient) throw new Error("Must be used after an external wallet connection");

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
                  onChange={async (event) => {
                    event.preventDefault();
                    const checkbox = event.currentTarget;

                    checkbox.disabled = true;
                    try {
                      await toggleTask(network, externalWalletClient, task.key.key);
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
                  onClick={async (event) => {
                    event.preventDefault();
                    if (!window.confirm("Are you sure you want to delete this task?")) return;

                    const button = event.currentTarget;
                    button.disabled = true;
                    try {
                      await deleteTask(network, externalWalletClient, task.key.key);
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
                  event.preventDefault();
                  const form = event.currentTarget;
                  const fieldset = form.querySelector("fieldset");
                  if (!(fieldset instanceof HTMLFieldSetElement)) return;

                  const formData = new FormData(form);
                  const desc = formData.get("description");
                  if (typeof desc !== "string") return;

                  fieldset.disabled = true;
                  try {
                    await addTask(network, externalWalletClient, desc);
                    form.reset();
                  } finally {
                    fieldset.disabled = false;
                  }
                }}
              >
                <fieldset style={styleUnset}>
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
