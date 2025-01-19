import {
  ACCOUNT_CURRENCY_LOCAL_STORAGE_KEY,
  ACCOUNT_CURRENCY_LOCAL_STORAGE_DEFAULT_VALUE,
} from "@/constants/local-storage";
import { STANDARD_LOT_SIZE, MINI_LOT_SIZE } from "@/constants/unit";
import { getExchangeRateQueryFn } from "@/hooks/queries/get-exchange-rate";
import { calculatePositionSize } from "@/utils/calculate-position-size";
import { formatCurrency } from "@/utils/format-currency";
import { numberRange } from "@/utils/number-ranage";
import { useLocalStorage } from "@/utils/use-local-storage/use-local-storage";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useMemo, useRef, ComponentRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { CurrencyInput } from "./currency-input";
import { CurrencyPairCombobox } from "./currency-pair-combobox";
import { Button } from "./ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "./ui/form";
import { Icons } from "./ui/icons";
import { Input } from "./ui/input";
import { formatNumber } from "@/utils/format-number";
import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { CopyButton } from "./copy-button";
import { StopLossRange } from "./stop-loss-range";

export const formSchema = z.object({
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
export type FormSchema = z.infer<typeof formSchema>;
export type Result = {
  riskAmount: number;
  positionSize: {
    units: number;
    standardLots: number;
    miniLots: number;
  };
  stopLoss: number;
};

export default function App({
  calculator,
  setCalculator,
  setCurrencyDialog,
}: {
  calculator: FormSchema | undefined;
  setCalculator: (val: FormSchema) => void;
  setCurrencyDialog: (isOpen: boolean) => void;
}) {
  const form = useForm<FormSchema>({
    defaultValues: {
      accountBalance: calculator?.accountBalance,
      riskPercentage: calculator?.riskPercentage,
      stopLoss: "",
      currencyPair: calculator?.currencyPair,
    },
    resolver: zodResolver(formSchema),
  });

  const [accountCurrency] = useLocalStorage<string | undefined>({
    key: ACCOUNT_CURRENCY_LOCAL_STORAGE_KEY,
    defaultValue: ACCOUNT_CURRENCY_LOCAL_STORAGE_DEFAULT_VALUE,
  });
  const [result, setResult] = useState<Result[]>([]);
  const mainResult = useMemo(() => {
    const r = result.filter(
      (res) => res.stopLoss === Number(form.getValues().stopLoss),
    )[0];
    return r;
  }, [result]);
  const resultRef = useRef<ComponentRef<"div">>(null);

  const onSubmit: SubmitHandler<FormSchema> = async ({
    accountBalance,
    currencyPair,
    riskPercentage,
    stopLoss,
  }) => {
    try {
      if (!accountCurrency) {
        alert("Please set your account currency");
        return;
      }

      const [_baseCurrency, quoteCurrency] = currencyPair.split("/");
      if (_baseCurrency === undefined || quoteCurrency === undefined)
        throw new Error("Invalid currency pair");
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
        Number(stopLoss) * 0.01,
        4,
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
        setCalculator({
          accountBalance,
          currencyPair,
          riskPercentage,
          stopLoss: String(stopLoss),
        });
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error calculating position:", error);
      return;
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative flex flex-1 gap-4 flex-col items-center justify-center"
        >
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
              <FormItem className="w-full">
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
              <FormItem className="w-full">
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
              <FormItem className="w-full">
                <FormLabel>Stop Loss</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full mt-6"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Icons.Loader2 className="animate-spin" />
            ) : (
              "Calculate"
            )}
          </Button>
        </form>
      </Form>

      <Separator
        orientation="vertical"
        className="h-auto w-[1px] bg-foreground/10"
      />

      <div ref={resultRef} className="space-y-6 min-w-[250px]">
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="grid gap-2">
            <Label>Amount at Risk</Label>
            <div className="flex items-center gap-2">
              <div className="text-xl sm:text-2xl font-bold">
                {formatNumber(mainResult?.riskAmount ?? 0)} {accountCurrency}
              </div>
              <CopyButton
                value={`${formatNumber(mainResult?.riskAmount ?? 0)}`}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Standard Lots</Label>
            <div className="flex items-center gap-2">
              <div className="text-xl sm:text-2xl font-bold">
                {formatNumber(mainResult?.positionSize.standardLots ?? 0)}
              </div>
              <CopyButton
                value={formatNumber(mainResult?.positionSize.standardLots ?? 0)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Mini Lots</Label>
            <div className="flex items-center gap-2">
              <div className="text-xl sm:text-2xl font-bold">
                {formatNumber(mainResult?.positionSize.miniLots ?? 0)}
              </div>
              <CopyButton
                value={formatNumber(mainResult?.positionSize.miniLots ?? 0)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Units</Label>
            <div className="flex items-center gap-2">
              <div className="text-xl sm:text-2xl font-bold">
                {formatNumber(mainResult?.positionSize.units ?? 0)}
              </div>
              <CopyButton
                value={formatNumber(mainResult?.positionSize.units ?? 0)}
              />
            </div>
          </div>
        </div>

        <StopLossRange
          highlight={Number(form.getValues().stopLoss)}
          result={result}
        />
      </div>
    </>
  );
}
