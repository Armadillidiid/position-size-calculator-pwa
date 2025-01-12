import { z } from "zod";

export const getExchangeRateRequestSchema = z.object({
  fromCurrency: z.string(),
  toCurrency: z.string(),
});

export const getExchangeRateResponseSchema = z.object({
  "Realtime Currency Exchange Rate": z.object({
    "1. From_Currency Code": z.string(),
    "2. From_Currency Name": z.string(),
    "3. To_Currency Code": z.string(),
    "4. To_Currency Name": z.string(),
    "5. Exchange Rate": z.string(),
    "6. Last Refreshed": z.string(),
    "7. Time Zone": z.string(),
    "8. Bid Price": z.string(),
    "9. Ask Price": z.string(),
  }),
});

export type GetExchangeRateRequest = z.infer<
  typeof getExchangeRateRequestSchema
>;
