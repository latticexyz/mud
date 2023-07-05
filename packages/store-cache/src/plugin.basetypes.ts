/* eslint-disable @typescript-eslint/no-empty-interface */
// Plugin type
export interface MudPlugin {
  expandConfig: (shorthandConfig: any) => any;
}

// Base config
export interface ShorthandConfig {
  plugins: Record<string, MudPlugin>;
}

export interface FullConfig<TShorthandConfig extends ShorthandConfig> {}
