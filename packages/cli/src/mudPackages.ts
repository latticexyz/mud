import { ZodError, z } from "zod";
import { MudPackages } from "./common";

const envSchema = z.object({
  MUD_PACKAGES: z.string().transform((value) => JSON.parse(value) as MudPackages),
});

function parseEnv(): z.infer<typeof envSchema> {
  try {
    return envSchema.parse({
      // tsup replaces the env vars with their values at compile time
      MUD_PACKAGES: process.env.MUD_PACKAGES,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const { _errors, ...invalidEnvVars } = error.format();
      console.error(`\nMissing or invalid environment variables:\n\n  ${Object.keys(invalidEnvVars).join("\n  ")}\n`);
      process.exit(1);
    }
    throw error;
  }
}

export const mudPackages = parseEnv().MUD_PACKAGES;
