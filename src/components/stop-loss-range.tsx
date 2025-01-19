import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import { Result } from "./calculator";

type StopLossRangeProps = {
  result: Result[];
  highlight: Result["stopLoss"];
};

export function StopLossRange({ highlight, result }: StopLossRangeProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          size="none"
          className="text-xs sm:text-sm"
          disabled={result.length === 0}
        >
          View more stop-loss levels
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95%] rounded sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Stop Loss Levels</DialogTitle>
          <DialogDescription>
            Each row correspond to a 0.02% change in stop loss.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stop Loss</TableHead>
                <TableHead>Standard Lots</TableHead>
                <TableHead>Mini Lots</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.map((row) => (
                <TableRow
                  key={row.stopLoss}
                  className={
                    row.stopLoss === highlight
                      ? "bg-primary/10 hover:bg-primary/10"
                      : ""
                  }
                >
                  <TableCell>
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 6,
                    }).format(row.stopLoss)}
                  </TableCell>
                  <TableCell>
                    {row.positionSize.standardLots.toFixed(3)}
                  </TableCell>
                  <TableCell>{row.positionSize.miniLots.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
