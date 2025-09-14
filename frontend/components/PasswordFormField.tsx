import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, FieldValues, Path } from "react-hook-form";

type PasswordFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  inputClassName?: string;
  displayFormMessage?: boolean;
};

export function PasswordField<TFieldValues extends FieldValues>({
  control,
  name,
  label = "Password",
  inputClassName,
  displayFormMessage = true,
}: PasswordFieldProps<TFieldValues>) {
  const [show, setShow] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                {...field}
                type={show ? "text" : "password"}
                className={cn("pr-10 truncate", inputClassName)}
              />
            </FormControl>
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute inset-y-0 right-3 inline-flex items-center text-muted-foreground cursor-pointer"
              aria-label={show ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {show ? (
                <Eye
                  size={20}
                  className={cn(fieldState.invalid && "text-destructive")}
                />
              ) : (
                <EyeOff
                  size={20}
                  className={cn(fieldState.invalid && "text-destructive")}
                />
              )}
            </button>
          </div>
          {displayFormMessage && <FormMessage />}
        </FormItem>
      )}
    />
  );
}
