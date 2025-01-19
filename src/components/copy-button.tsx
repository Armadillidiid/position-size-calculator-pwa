"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "../utils/copy";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
}

export function CopyButton({ value }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className="h-6 w-6 relative"
      onClick={handleCopy}
    >
      <Copy className={cn("h-3 w-3 transition-all", copied && "scale-0")} />
      <Check
        className={cn(
          "h-3 w-3 text-green-600 absolute transition-all",
          copied ? "scale-100" : "scale-0",
        )}
      />
      <span className="sr-only">Copy value</span>
    </Button>
  );
}
