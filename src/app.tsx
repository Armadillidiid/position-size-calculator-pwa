import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PWABadge from "./PWABadge.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CurrencyInput } from "./components/currency-input";
import { formatCurrency } from "./utils/format-currency.ts";
import SetAccountCurrency from "./components/set-account-currency.tsx";
import { ACCOUNT_CURRENCY_LOCAL_STORAGE_KEY } from "./constants/local-storage.ts";
import { useLocalStorage } from "./utils/use-local-storage/use-local-storage.tsx";
import { CurrencyPairCombobox } from "./components/currency-pair-combobox.tsx";
import { getExchangeRateQueryFn } from "./hooks/queries/get-exchange-rate/index.ts";
import { numberRange } from "./utils/number-ranage.ts";
import { STANDARD_LOT_SIZE, MINI_LOT_SIZE } from "./constants/unit.ts";
import { calculatePositionSize } from "./utils/calculate-position-size.ts";

const formSchema = z.object({
  accountBalance: z
    .string()
    .trim()
    .min(1, { message: "Account balance is required." }),
  riskPercentage: z
    .string()
    .trim()
    .min(1, { message: "Risk percentage is required." }),
  stopLoss: z.string().trim().min(1, { message: "Stop loss is required." }),
  currencyPair: z
    .string()
    .trim()
    .min(1, { message: "Currency pair is required." }),
});
type FormSchema = z.infer<typeof formSchema>;
type Result = {
  riskAmount: number;
  positionSize: {
    units: number;
    standardLots: number;
    miniLots: number;
  };
  stopLoss: number;
};

export default function App() {
  const form = useForm<FormSchema>({
    defaultValues: {
      accountBalance: "",
      riskPercentage: "",
      stopLoss: "",
      currencyPair: "EUR/USD",
    },
    resolver: zodResolver(formSchema),
  });

  const [currencyDialog, setCurrencyDialog] = useState(false);
  const [accountCurrency] = useLocalStorage<string | undefined>({
    key: ACCOUNT_CURRENCY_LOCAL_STORAGE_KEY,
  });
  const [result, setResult] = useState<Result[]>([]);
  const mainResult = useMemo(() => {
    const r = result.filter(
      (res) => res.stopLoss === Number(form.getValues().stopLoss),
    )[0];
    return r;
  }, [result]);

  const onSubmit: SubmitHandler<FormSchema> = async ({
    accountBalance,
    currencyPair,
    riskPercentage,
    stopLoss,
  }) => {
    try {
      if (!accountCurrency) return;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_baseCurrency, quoteCurrency] = currencyPair.split("/");
      const riskAmount =
        (Number(accountBalance) * Number(riskPercentage)) / 100;

      let exchangeRate = 1; // Default to 1 if no conversion needed

      // Fetch exchange rate if account currency != quote currency
      if (accountCurrency !== quoteCurrency) {
        const res = await getExchangeRateQueryFn({
          fromCurrency: accountCurrency,
          toCurrency: quoteCurrency,
        });
        exchangeRate = Number(
          res["Realtime Currency Exchange Rate"]["5. Exchange Rate"],
        );
      }

      // Determine pip size (JPY pairs have different pip sizes)
      const pipSize = quoteCurrency === "JPY" ? 0.01 : 0.0001;

      // Pip value calculation (in standard lots)
      const pipValue = pipSize / exchangeRate;

      // Iterate through stop-loss range for calculations
      const stopLossRange = numberRange(
        Number(stopLoss),
        Number(stopLoss) * 0.1,
        3,
      );

      setResult([]);
      for (const stopLoss of stopLossRange) {
        const positionSizeUnits = calculatePositionSize(
          riskAmount,
          stopLoss,
          pipValue,
        );

        setResult((prev) => [
          ...prev,
          {
            riskAmount,
            positionSize: {
              units: positionSizeUnits,
              standardLots: positionSizeUnits / STANDARD_LOT_SIZE,
              miniLots: positionSizeUnits / MINI_LOT_SIZE,
            },
            stopLoss,
          },
        ]);
      }
    } catch (error) {
      console.error("Error calculating position:", error);
      return;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <SetAccountCurrency
        isOpen={currencyDialog}
        setIsOpen={setCurrencyDialog}
      />
      <img
        src="/logo.jpeg"
        alt="logo"
        className="w-[100px] rounded-full overflow-hidden h-[100px] mx-auto"
      />
      <Card className="sm:w-[400px] my-auto mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Position Size Calculator
          </CardTitle>
        </CardHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="relative flex flex-1 flex-col items-center justify-center"
          >
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name={"accountBalance"}
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Account Balance</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        formatter={(value) => {
                          return formatCurrency(value, "NGN", true).slice(1);
                        }}
                        value={String(value)}
                        placeholder="1,000,000.00"
                        onChange={onChange}
                        onCurrencyClick={() => setCurrencyDialog(true)}
                        currency={accountCurrency ?? "USD"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="riskPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Percentage</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currencyPair"
                render={({ field: stateField }) => (
                  <FormItem>
                    <FormLabel>Currency Pair</FormLabel>
                    <CurrencyPairCombobox
                      name="currencyPair"
                      form={form}
                      value={stateField.value}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stopLoss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stop Loss</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Calculate
              </Button>

              {/* {state.positionSize > 0 && ( */}
              {/*   <div className="pt-4 space-y-2"> */}
              {/*     <div className="flex justify-between"> */}
              {/*       <span>Risk Amount:</span> */}
              {/*       <span className="font-bold"> */}
              {/*         ${state.riskAmount.toFixed(2)} */}
              {/*       </span> */}
              {/*     </div> */}
              {/*     <div className="flex justify-between"> */}
              {/*       <span>Position Size:</span> */}
              {/*       <span className="font-bold"> */}
              {/*         {state.positionSize.toFixed(2)} lots */}
              {/*       </span> */}
              {/*     </div> */}
              {/*   </div> */}
              {/* )} */}
            </CardContent>
          </form>
        </Form>
      </Card>

      <PWABadge />
    </div>
  );
}
