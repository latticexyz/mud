---
"@latticexyz/explorer": patch
---

Initial release of the @latticexyz/explorer package. Explorer is a standalone tool designed to explore and manage worlds. This initial release includes support for only local worlds, with support for any world in the near future.

To set up and start using the Explorer, follow these steps:

1. **Configure paths to SQLite indexer database**

   Set up either a relative or an absolute path to the indexer's database using environment variables. You may use `@latticexyz/store-indexer` for indexing your world's data.

   - `INDEXER_DB_PATH_ABSOLUTE` - Set the absolute path to the database.
   - `INDEXER_DB_PATH` - Set the relative path to the database.

2. **Install dependencies**

   Run the following command to install the necessary dependencies:

   ```sh
   pnpm install
   ```

3. **Start the development server**

   Use the following command to start the development server:

   ```sh
   pnpm dev
   ```
