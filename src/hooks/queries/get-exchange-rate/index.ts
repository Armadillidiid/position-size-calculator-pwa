import {
  GetExchangeRateRequest,
  getExchangeRateResponseSchema,
} from "./schema";

const API_KEY = import.meta.env.VITE_PUBLIC_ALPHA_VANTAGE_API_KEY;
const FUNCTION = "CURRENCY_EXCHANGE_RATE";

export const getExchangeRateQueryFn = async ({
  fromCurrency,
  toCurrency,
}: GetExchangeRateRequest) => {
  const url = `https://www.alphavantage.co/query?function=${FUNCTION}&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${API_KEY}`;
  const res = await fetch(url);
  return getExchangeRateResponseSchema.parse(await res.json());
};
