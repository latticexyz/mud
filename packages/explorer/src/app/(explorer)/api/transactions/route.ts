import { Client } from "pg";
import { Hex } from "viem";

const postgresConnectionUrl = process.env.DATABASE_URL;

export async function GET(req: Request) {
  const client = new Client({ connectionString: postgresConnectionUrl });
  const { searchParams } = new URL(req.url);
  const worldAddress = searchParams.get("worldAddress") as Hex;
  const offset = Number(searchParams.get("offset")) || 0;
  const limit = Number(searchParams.get("limit")) || 10;
  const columns = searchParams.get("columns") || "*";

  if (!worldAddress) {
    return Response.json({ error: "Missing worldAddress" }, { status: 400 });
  }

  try {
    await client.connect();

    const transactions = await client.query(
      `SELECT ${columns} FROM transactions WHERE tx_to = decode($1, 'hex') ORDER BY block_num DESC OFFSET $2 LIMIT $3`,
      [worldAddress, offset, limit],
    );

    return Response.json({
      transactions: transactions.rows,
    });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json({ error: "Failed to fetch transactions" }, { status: 500 });
  } finally {
    await client.end();
  }
}
