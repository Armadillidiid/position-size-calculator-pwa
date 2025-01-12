import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currencyPairs } from "@/data/currencies";
import { CalculatorState } from "../types/calculator";
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

const formSchema = z.object({
  accountBalance: z.string(),
  riskPercentage: z.string(),
  stopLoss: z.number(),
  currencyPair: z.string(),
  positionSize: z.string(),
  riskAmount: z.string(),
});
type FormSchema = z.infer<typeof formSchema>;

export default function App() {
  const form = useForm<FormSchema>({
    defaultValues: {
      accountBalance: "",
      riskPercentage: "",
      stopLoss: 20,
      currencyPair: "EUR/USD",
      positionSize: "",
      riskAmount: "",
    },
    resolver: zodResolver(formSchema),
  });

  const [state, setState] = useState<CalculatorState>({
    accountBalance: 10000,
    riskPercentage: 1,
    stopLoss: 20,
    currencyPair: "EUR/USD",
    positionSize: 0,
    riskAmount: 0,
  });

  const onSubmit: SubmitHandler<FormSchema> = async (data) => {
    const riskAmount = (state.accountBalance * state.riskPercentage) / 100;
    const pipValue = 0.0001; // Simplified pip value calculation
    const positionSize = riskAmount / (state.stopLoss * pipValue);

    setState((prev) => ({
      ...prev,
      riskAmount,
      positionSize: Number(positionSize.toFixed(2)),
    }));
  };

  return (
    <div className="flex flex-col gap-8">
      <SetAccountCurrency />
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
                          return formatCurrency(value, "NGN", false).slice(1);
                        }}
                        value={String(value)}
                        placeholder="1,000,000.00"
                        onChange={onChange}
                        currency="EUR"
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
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="pair">Currency Pair</Label>
                <Select
                  value={state.currencyPair}
                  onValueChange={(value) =>
                    setState((prev) => ({
                      ...prev,
                      currencyPair: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency pair" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyPairs.map((pair) => (
                      <SelectItem key={pair} value={pair}>
                        {pair}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FormField
                control={form.control}
                name="stopLoss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stop Loss</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Calculate
              </Button>

              {state.positionSize > 0 && (
                <div className="pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Risk Amount:</span>
                    <span className="font-bold">
                      ${state.riskAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Position Size:</span>
                    <span className="font-bold">
                      {state.positionSize.toFixed(2)} lots
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </form>
        </Form>
      </Card>

      <PWABadge />
    </div>
  );
}
