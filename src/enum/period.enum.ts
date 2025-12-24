export enum Period {
  PERIOD_7D = "7d",
  PERIOD_30D = "30d",
  PERIOD_90D = "90d",
  PERIOD_1Y = "1y",
  PERIOD_ALL = "all",
}

export const PeriodLabels: Record<Period, string> = {
  [Period.PERIOD_7D]: "Last 7 days",
  [Period.PERIOD_30D]: "Last 30 days",
  [Period.PERIOD_90D]: "Last 90 days",
  [Period.PERIOD_1Y]: "Last year",
  [Period.PERIOD_ALL]: "All time",
};

export function isValidPeriod(value: string): value is Period {
  return Object.values(Period).includes(value as Period);
}





