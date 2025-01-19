import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PWABadge from "./PWABadge.tsx";
import SetAccountCurrency from "./components/set-account-currency.tsx";
import { CALCULATOR_LOCAL_STORAGE_KEY } from "./constants/local-storage.ts";
import { useLocalStorage } from "./utils/use-local-storage/use-local-storage.tsx";
import Calculator, {
  FormSchema,
  formSchema,
} from "./components/calculator.tsx";

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [currencyDialog, setCurrencyDialog] = useState(false);
  const [calculator, setCalculator] = useLocalStorage<FormSchema | undefined>({
    key: CALCULATOR_LOCAL_STORAGE_KEY,
    defaultValue: {
      accountBalance: "",
      currencyPair: "EUR/USD",
      riskPercentage: "",
      stopLoss: "",
    },
    deserialize: (value) => {
      if (!value) {
        return undefined;
      }

      const parsedValue = JSON.parse(value);
      const result = formSchema.safeParse(parsedValue);

      if (result.success) {
        return result.data;
      }

      return undefined;
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
      <Card className="sm:w-full my-auto mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Position Size Calculator
          </CardTitle>
        </CardHeader>

        <CardContent className="flex gap-6 flex-col sm:flex-row">
          <Calculator
            calculator={calculator}
            setCalculator={setCalculator}
            setCurrencyDialog={setCurrencyDialog}
          />
        </CardContent>
      </Card>

      <PWABadge />
    </div>
  );
}
