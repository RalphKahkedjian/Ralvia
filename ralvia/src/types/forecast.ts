export type ForecastHistoryPoint = {
  ds: string;
  y: number;
};

export type ForecastPoint = {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
};

export type InvoiceForecast = {
  history: ForecastHistoryPoint[];
  forecast: ForecastPoint[];
};