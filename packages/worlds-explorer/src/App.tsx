import { Flex, Text, Button } from "@radix-ui/themes";
import AllTables from "./components/AllTables";

function App() {
  return (
    <Flex direction="column" gap="2">
      <AllTables />

      <Text>Hello from Radix Themes :)</Text>
      <Button>Let's go</Button>
    </Flex>
  );
}

export default App;
