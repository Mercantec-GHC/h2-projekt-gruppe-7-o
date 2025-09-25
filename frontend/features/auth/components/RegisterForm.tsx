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
import { PasswordField } from "@/components/PasswordFormField";
import { useRouter } from "next/navigation";
import AuthApi from "@/features/auth/api/auth-api";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function RegisterForm() {
  const passwordsNotMatchingErrorMessage = "Passwords must match.";
  const router = useRouter();
  const formSchema = z
    .object({
      firstName: z.string().min(1, "Please enter a first name"),
      lastName: z.string().min(1, "Please enter a last name"),
      email: z.email({
        message: "Please enter a valid email address",
      }),
      password: z.string().min(1, "Please enter a password"),
      confirmPassword: z.string().min(1, "Please enter a password"),
    })
    .superRefine((data, ctx) => {
      // TODO: there is a minor bug here, where the error message keeps diplaying even if the passwords match
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: passwordsNotMatchingErrorMessage,
          path: ["password"],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: passwordsNotMatchingErrorMessage,
          path: ["confirmPassword"],
        });
      }
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Since FormField is using a controlled component, you need to provide a default value for the field
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutate = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) =>
      AuthApi.register(values),
    onSuccess: () => {
      toast.success("Your account has been created successfully!");
      router.push("/profile");
    },
    onError: () => {
      // TODO: handle error messages coming from the backend and display them here
      // form.setError("email", { message: "Invalid email or password" });
      // form.setError("password", { message: "Invalid email or password" });
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
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="my-8" />

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
          <PasswordField
            control={form.control}
            displayFormMessage={
              form.control.getFieldState("confirmPassword")?.error?.message ===
              passwordsNotMatchingErrorMessage
            }
            label="Confirm Password"
            name="confirmPassword"
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
