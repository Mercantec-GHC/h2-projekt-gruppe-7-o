"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/features/auth/lib/login";
import { PasswordField } from "@/components/PasswordFormField";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const formSchema = z.object({
    email: z.email({
      message: "Please enter a valid email address",
    }),
    password: z.string().min(1, "Please enter a password"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Since FormField is using a controlled component, you need to provide a default value for the field
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutate = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => login(values),
    onSuccess: () => {
      toast.success("You have been logged in successfully!");
      // Refresh server components to pick up new HttpOnly session cookie (triggers middleware redirects)
      router.refresh();
    },
    onError: (error) => {
      form.setError("email", { message: "Invalid email or password" });
      form.setError("password", { message: "Invalid email or password" });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <PasswordField
            control={form.control}
            name="password"
            inputClassName="w-full"
          />
        </div>

        <Button isLoading={mutate.isPending} className="w-full" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
