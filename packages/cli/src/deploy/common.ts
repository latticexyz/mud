import { padHex } from "viem";

export const salt = padHex("0x", { size: 32 });
