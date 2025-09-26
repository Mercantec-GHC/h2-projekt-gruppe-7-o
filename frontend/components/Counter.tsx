import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface CounterProps {
  label?: string;
  value: number;
  onIncrement: () => void;
  incrementDisabled: boolean;
  onDecrement: () => void;
  decrementDisabled: boolean;
}

export function Counter({
  label,
  value,
  onIncrement,
  onDecrement,
  incrementDisabled = false,
  decrementDisabled = false,
}: CounterProps) {
  return (
    <div className="space-y-2">
      {label && <h4 className="text-sm font-medium select-none">{label}</h4>}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          className={cn("size-8 p-0", decrementDisabled ? "bg-gray-400" : "")}
          onClick={() => onDecrement()}
          disabled={decrementDisabled}
        >
          <MinusIcon className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center font-medium select-none">{value}</span>
        <Button
          size="sm"
          variant="outline"
          className={cn("size-8 p-0", incrementDisabled ? "bg-gray-400" : "")}
          onClick={() => onIncrement()}
          disabled={incrementDisabled}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
