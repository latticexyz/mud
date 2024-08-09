### Explorer

Explorer is a GUI tool designed for visually exploring and manipulating the state of worlds.

## Getting Started

To set up and start using the Explorer, follow these steps:

1. **Configure Paths to Indexer's Database**

   Set up either a relative or an absolute path to the indexer's database using environment variables. You may use `@latticexyz/store-indexer` for indexing your world's data.

   - `INDEXER_DB_PATH_ABSOLUTE` - Set the absolute path to the database.
   - `INDEXER_DB_PATH` - Set the relative path to the database.

2. **Install Dependencies**

   Run the following command to install the necessary dependencies:

   ```sh
   pnpm install
   ```

3. **Start the Development Server**

   Use the following command to start the development server:

   ```sh
   pnpm dev
   ```
