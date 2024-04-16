export interface SolhintRule {
  ruleId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reporter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
}
