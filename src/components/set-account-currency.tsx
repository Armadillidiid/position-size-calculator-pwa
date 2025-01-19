import { useLocalStorage } from "@/utils/use-local-storage/use-local-storage";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Toggle } from "./ui/toggle";
import { useEffect, useState } from "react";
import { AlertDialogHeader, AlertDialogFooter } from "./ui/alert-dialog";
import { popularCurrencies } from "@/data/currencies";
import { cn } from "@/lib/utils";
import { ACCOUNT_CURRENCY_LOCAL_STORAGE_KEY } from "@/constants/local-storage";

type SetAccountCurrencyProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const SetAccountCurrency = ({ isOpen, setIsOpen }: SetAccountCurrencyProps) => {
  const [accountCurrency, setAccountCurrency] = useLocalStorage<
    string | undefined
  >({
    key: ACCOUNT_CURRENCY_LOCAL_STORAGE_KEY,
  });
  const [selected, setSelected] = useState<string | undefined>(accountCurrency);

  useEffect(() => {
    setSelected(accountCurrency);
  }, [accountCurrency]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {/* <AlertDialogTrigger></AlertDialogTrigger> */}
      <AlertDialogContent className="max-w-[95%] sm:max-w-lg rounded">
        <AlertDialogHeader>
          <AlertDialogTitle>Set Account Currency</AlertDialogTitle>
          <AlertDialogDescription>
            Select the currency you want to use for your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-wrap gap-1">
          {popularCurrencies.map((currency) => (
            <Toggle
              key={currency.code}
              className={cn(
                "flex-start relative items-center flex gap-2.5 border px-4 py-5 hover:text-inherit",
                selected === currency.code ? "border-foreground" : "",
              )}
              pressed={selected === currency.code}
              onPressedChange={() =>
                setSelected((prev) =>
                  prev === currency.code ? undefined : currency.code,
                )
              }
            >
              {selected === currency.code && (
                <div className="rounded-full bg-foreground size-1.5" />
              )}
              {currency.name}
            </Toggle>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              setAccountCurrency(selected);
            }}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SetAccountCurrency;
