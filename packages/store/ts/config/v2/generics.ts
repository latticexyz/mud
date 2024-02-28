// From ArcType (https://github.com/arktypeio/arktype/blob/93e79fa3d28567b7547e8e2df9a84e3c5b86e8e1/src/utils/generics.ts#L74)
export type conform<t, base> = t extends base ? t : base;

// TODO: this is a big hack, just to force typescript to infer deeply nested literal types.
// There must be a better way to do this.
export type narrow<t, base> = t extends base ? t : t;
