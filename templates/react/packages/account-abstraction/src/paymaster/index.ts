import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import { ANVIL_WALLET_CLIENT } from "../constants";
import { jsonRpcSchema, pmSponsorUserOperationParamsSchema } from "./schema";
import { fromZodError } from "zod-validation-error";
import { foundry } from "viem/chains";
import { Hex, RpcRequestError, concat, encodeAbiParameters, http, toHex } from "viem";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { deployVerifyingPaymaster } from "../deploy-contracts/deployPaymaster";
import { toPackedUserOperation } from "./utils";
import { RpcError, InternalBundlerError } from "./errors";

const returnInvalidRequestParams = (reply: FastifyReply, errorMsg: string) => {
  reply.status(400).send({
    jsonrpc: "2.0",
    error: {
      message: errorMsg,
    },
  });
};

const walletClient = ANVIL_WALLET_CLIENT();
const verifyingPaymaster = await deployVerifyingPaymaster(walletClient);

const altoBundler = createPimlicoBundlerClient({
  chain: foundry,
  transport: http("http://127.0.0.1:4337"),
  entryPoint: ENTRYPOINT_ADDRESS_V07,
});

const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: "*",
  methods: ["POST", "GET", "OPTIONS"],
});

const rpc = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = request.body;
  console.log("handling request: ", body);

  const parsedBody = jsonRpcSchema.safeParse(body);
  if (!parsedBody.success) {
    returnInvalidRequestParams(reply, fromZodError(parsedBody.error).message);
    return;
  }

  if (parsedBody.data.method === "pm_sponsorUserOperation") {
    const params = pmSponsorUserOperationParamsSchema.safeParse(parsedBody.data.params);

    if (!params.success) {
      returnInvalidRequestParams(reply, fromZodError(params.error).message);
      return;
    }

    const [userOperation, entryPoint] = params.data;

    if (entryPoint !== ENTRYPOINT_ADDRESS_V07) {
      returnInvalidRequestParams(reply, "Unsuporrted EntryPoint");
      return;
    }

    const opToSimulate = {
      ...userOperation,
      paymaster: verifyingPaymaster.address,
      paymasterData:
        "0x000000000000000000000000000000000000000000000000000000006602f66a0000000000000000000000000000000000000000000000000000000000000000dba7a71bd49ae0174b1e4577b28f8b7c262d4085cfa192f1c19b516c85d2d1ef17eadeb549d71caf5d5f24fb6519088c1c13427343843131dd6ec19a3c6a350e1b" as Hex,
    };

    let gasEstimates;
    try {
      gasEstimates = await altoBundler.estimateUserOperationGas({
        userOperation: opToSimulate,
      });
    } catch (e: unknown) {
      if (e instanceof RpcRequestError) {
        throw new RpcError(e.details, e.code);
      }

      throw new InternalBundlerError();
    }

    const op = {
      ...opToSimulate,
      ...gasEstimates,
    };

    const validAfter = 0;
    const validUntil = Math.floor(Date.now() / 1000) + 6000;
    op.paymasterData = concat([
      encodeAbiParameters(
        [
          { name: "validUntil", type: "uint48" },
          { name: "validAfter", type: "uint48" },
        ],
        [validUntil, validAfter],
      ),
      toHex(0, { size: 65 }),
    ]);
    op.paymaster = verifyingPaymaster.address;

    const hash = await verifyingPaymaster.read.getHash([toPackedUserOperation(op), validUntil, validAfter]);

    const sig = await walletClient.signMessage({
      message: { raw: hash },
    });

    const paymaster = verifyingPaymaster.address;
    const paymasterData = concat([
      encodeAbiParameters(
        [
          { name: "validUntil", type: "uint48" },
          { name: "validAfter", type: "uint48" },
        ],
        [validUntil, validAfter],
      ),
      sig,
    ]);

    const {
      paymasterVerificationGasLimit,
      verificationGasLimit,
      preVerificationGas,
      callGasLimit,
      paymasterPostOpGasLimit,
    } = gasEstimates;

    const result = {
      preVerificationGas: toHex(preVerificationGas),
      callGasLimit: toHex(callGasLimit),
      paymasterVerificationGasLimit: toHex(paymasterVerificationGasLimit || 0),
      paymasterPostOpGasLimit: toHex(paymasterPostOpGasLimit || 0),
      verificationGasLimit: toHex(verificationGasLimit || 0),
      paymaster,
      paymasterData,
    };

    const returnResult = {
      jsonrpc: parsedBody.data.jsonrpc,
      id: parsedBody.data.id,
      result,
    };

    return returnResult;
  }

  try {
    // else forward it to alto bundler
    return await altoBundler.request({
      // @ts-expect-error: ts-ignore
      method: parsedBody.data.method,
      // @ts-expect-error: ts-ignore
      params: parsedBody.data.params,
    });
  } catch (e: unknown) {
    if (e instanceof RpcRequestError) {
      throw new RpcError(e.details, e.code);
    }

    throw new InternalBundlerError();
  }
};

app.post("/", {}, rpc.bind(this));

(async () => {
  await app.listen({ port: 4338 });
})();
