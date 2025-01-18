import defineConfig from "../tsup.config";

// Log out the MUD_PACKAGES env var so it can be used to run the CLI in development mode
// @ts-expect-error: defineConfig return type is not properly inferred
console.log(defineConfig({}).env.MUD_PACKAGES);
