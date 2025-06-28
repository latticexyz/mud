import { NextResponse } from "next/server";
import { Pool } from "pg";
import { Address, getAddress } from "viem";

export type VerifiedWorld = {
  address: Address;
  name: string;
  network: string;
};

export const GET = async (request: Request) => {
  if (!process.env.VERIFIED_WORLDS_DATABASE_URL) {
    console.log("VERIFIED_WORLDS_DATABASE_URL not set, returning empty result");
    return new NextResponse(JSON.stringify([]), { status: 200 });
  }

  const { searchParams } = new URL(request.url);
  const chainId = searchParams.get("chainId");

  try {
    const client = new Pool({
      connectionString: process.env.VERIFIED_WORLDS_DATABASE_URL,
    });
    const { rows } = await client.query("SELECT * FROM worlds WHERE network = $1", [chainId]);
    const result = rows.map((row) => ({
      ...row,
      address: getAddress(row.address),
    }));

    return new NextResponse(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("Error fetching verified worlds:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch verified worlds" }), { status: 500 });
  }
};
