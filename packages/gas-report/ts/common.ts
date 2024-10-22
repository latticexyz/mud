export type GasReportEntry = {
  file: string;
  test: string;
  name: string;
  gasUsed: number;
  prevGasUsed?: number;
};

export type GasReport = GasReportEntry[];

export type CommandOptions = {
  path: string[];
  save?: string;
  compare?: string;
  stdin?: boolean;
};
