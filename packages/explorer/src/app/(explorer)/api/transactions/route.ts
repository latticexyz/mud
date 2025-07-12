import { Client } from "pg";
import { Hex } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";

export const dynamic = "force-dynamic";

const postgresConnectionUrl = process.env.SHOVEL_DATABASE_URL;

export async function GET(req: Request) {
  const client = new Client({ connectionString: postgresConnectionUrl });
  const { searchParams } = new URL(req.url);
  const worldAddress = searchParams.get("worldAddress") as Hex;
  const pageSize = Number(searchParams.get("pageSize")) || 30;
  const lastBlockNumber = searchParams.get("lastBlockNumber") as Hex;

  if (!worldAddress) {
    return Response.json({ error: "Missing worldAddress" }, { status: 400 });
  }

  try {
    await client.connect();
    const transactions = await client.query(
      `
        SELECT
          block_num,
          '0x' || encode(tx_hash, 'hex') as tx_hash,
          '0x' || encode(tx_to, 'hex') as tx_to,
          '0x' || encode(tx_signer, 'hex') as tx_signer,
          '0x' || encode(tx_input, 'hex') as tx_input,
          tx_value, block_time
        FROM transactions
        WHERE tx_to IN (decode($1, 'hex'), decode($2, 'hex'))
        ${lastBlockNumber ? "AND block_num < $4" : ""}
        ORDER BY block_num DESC
        LIMIT $3
      `,
      [
        worldAddress.replace("0x", ""),
        entryPoint07Address.replace("0x", ""),
        pageSize,
        ...(lastBlockNumber ? [lastBlockNumber] : []),
      ],
    );

    return Response.json({ transactions: transactions.rows });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json({ error: "Failed to fetch transactions" }, { status: 500 });
  } finally {
    await client.end();
  }
}
