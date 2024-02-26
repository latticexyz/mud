export type Error<reason extends string = string> = { error: true; reason: `!Error: ${reason}` };
