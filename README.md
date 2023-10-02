### Create a MUD root folder:

```bash
mkdir pw-mud
cd pw-mud
```

### Clone and Build pw/foundry-zksync repo:

```bash
git clone https://github.com/pineappleworkshop/foundry-zksync
cd foundry-zksync
git checkout zk1
git pull origin zk1
cargo build -p foundry-cli
```

### Clone PW MUD repo:

```bash
# cd back to pw-mud root
cd ..
```

If not already, install pnpm:

```bash
npm install --global pnpm
```

```bash
git clone https://github.com/pineappleworkshop/mud
cd mud
git checkout zk1
git pull origin zk1
pnpm build && pnpm install
```

### Start the MUD server so changes are reflected in the project:

```bash
pnpm run dev
```

create a MUD project from `pw-mud`:

```bash
cd ..
pnpm create mud@next my-project
```

Choose `Vanilla` template

navigate to project directory and set dependencies to point to local mud:

```bash
cd my-project
pnpm mud set-version --link ../mud
```

set PATH variable in project root:

```bash
export PATH=$PATH:$(pwd)/target/debug
```
