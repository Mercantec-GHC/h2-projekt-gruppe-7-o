"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useTicketStatuses, useCreateTicket } from "../queries";
import { TicketStatus } from "../domain";

interface CreateTicketDialogProps {
  trigger?: React.ReactNode;
  isAdmin?: boolean;
  onSuccess?: () => void;
}

const formSchema = z.object({
  title: z
    .string()
    .min(1, "Please enter a ticket title")
    .max(255, "Title must be less than 255 characters"),
  description: z.string().min(1, "Please enter a ticket description"),
  statusName: z.nativeEnum(TicketStatus).optional(),
  assignedToUserId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreateTicketDialog({
  trigger,
  isAdmin = false,
  onSuccess,
}: CreateTicketDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      statusName: "Open",
      assignedToUserId: undefined,
    },
  });

  // Fetch available statuses
  const { data: availableStatuses = [] } = useTicketStatuses();

  // Create ticket mutation
  const createMutation = useCreateTicket(() => {
    setOpen(false);
    form.reset();
    onSuccess?.();
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    setOpen(newOpen);
  };

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      // Convert empty assignedToUserId to undefined
      assignedToUserId:
        data.assignedToUserId === "unassigned"
          ? undefined
          : data.assignedToUserId,
    };
    createMutation.mutate(submitData);
  };

  const defaultTrigger = (
    <Button size="sm">
      <Plus className="h-4 w-4 mr-2" />
      Ny sag
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Opret ny sag</DialogTitle>
              <DialogDescription>
                Opret en ny support sag. Angiv en klar titel og en detaljeret
                beskrivelse.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Titel <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Kort beskrivelse af problemet"
                        disabled={createMutation.isPending}
                        maxLength={255}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Beskrivelse <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Angiv detaljeret information omkring problemet, samt hvilket værelse det handler om, hvis det er relevant."
                        disabled={createMutation.isPending}
                        rows={4}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status (Admin only) */}
              {isAdmin && (
                <FormField
                  control={form.control}
                  name="statusName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={createMutation.isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Assignment (Admin only) */}
              {isAdmin && (
                <FormField
                  control={form.control}
                  name="assignedToUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignment</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "unassigned"}
                        disabled={createMutation.isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          <SelectItem value="current-user">
                            Assign to me
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createMutation.isPending}
              >
                Annuller
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Opret sag
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
