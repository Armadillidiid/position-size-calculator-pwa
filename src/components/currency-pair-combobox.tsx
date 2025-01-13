"use client";

import {
  Command,
  CommandEmpty,
  CommandList,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  FieldPath,
  FieldPathValue,
  FieldValues,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import { ComponentProps, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronsUpDown, Check } from "lucide-react";
import { PopoverAnchor } from "@radix-ui/react-popover";
import { FormControl } from "./ui/form";
import { currencyPairs } from "@/data/currencies";
import { Button } from "./ui/button";

type Props<
  T extends FieldValues = FieldValues,
  TName extends FieldPath<T> = FieldPath<T>,
> = {
  name: TName;
  value: FieldPathValue<T, TName>;
  form: UseFormReturn<T>;
  placeholder?: string;
  disabled?: boolean;
} & Pick<ComponentProps<"button">, "className">;

export const CurrencyPairCombobox = <
  T extends FieldValues = FieldValues,
  TName extends FieldPath<T> = FieldPath<T>,
>({
  form,
  name,
  value,
  placeholder = "Select currency pair",
  disabled = false,
  className,
}: Props<T, TName>) => {
  const [open, setOpen] = useState(false);

  const items = currencyPairs;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger disabled={disabled} asChild>
        <FormControl>
          <Button
            variant="none"
            aria-label="country-code"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between border disabled:cursor-not-allowed",
              !value && "text-muted-foreground",
              className,
            )}
          >
            {value || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>

      <PopoverAnchor />
      <PopoverContent align="start" sideOffset={0} className="line w-full h-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search country code..." />
          <CommandList>
            <CommandEmpty>Pair not found</CommandEmpty>
            <CommandGroup>
              {items.map((pair) => (
                <CommandItem
                  key={pair}
                  value={pair}
                  onSelect={() => {
                    form.setValue(name, pair as PathValue<T, TName>);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      pair === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {pair}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
