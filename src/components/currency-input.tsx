"use client";

import { Input } from "@/components/ui/input";
import { ComponentProps, useEffect, useState } from "react";
import { RefCallBack } from "react-hook-form";
import { Button } from "./ui/button";

type CurrencyInputProps = ComponentProps<"input"> & {
  onChange: (...event: unknown[]) => void;
  onBlur: () => void;
  value: string;
  disabled?: boolean;
  name: string;
  ref: RefCallBack;
  formatter: (value: string) => string;
  currency: string;
  onCurrencyClick: () => void;
};

export const CurrencyInput = ({
  value,
  onChange,
  onBlur,
  formatter,
  currency,
  onCurrencyClick,
  ...props
}: CurrencyInputProps) => {
  const [rawValue, setRawValue] = useState(value);

  useEffect(() => {
    onBlur();
    setRawValue(formatter(rawValue));
  }, []);

  return (
    <div className="relative flex rounded-lg shadow-sm shadow-black/5">
      <Input
        className="z-10 rounded-r-none border-r-0 focus-visible:z-10"
        placeholder="1,000,000.00"
        inputMode="numeric"
        value={rawValue}
        onChange={({ currentTarget: { value } }) => {
          const cleanedValue = value.replace(/[^0-9.]/g, "");

          const decimalMatch = cleanedValue.match(/^\d*(\.\d{0,2})?$/);
          if (decimalMatch) {
            setRawValue(cleanedValue);
            onChange(cleanedValue);
          }
        }}
        onBlur={() => {
          onBlur();
          setRawValue(formatter(rawValue));
        }}
        onFocus={() => {
          setRawValue(rawValue.replace(/,/g, ""));
        }}
        {...props}
      />
      <Button
        type="button"
        variant={"outline"}
        className="inline-flex items-center rounded-s-none rounded-e-lg border border-input bg-background px-3 text-sm text-muted-foreground"
        onClick={onCurrencyClick}
      >
        {currency}
      </Button>
    </div>
  );
};
