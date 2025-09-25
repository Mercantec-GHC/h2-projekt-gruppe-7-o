"use client";

import { getQueryClient } from "@/api/getQueryClient";
import { QueryClientProvider } from "@tanstack/react-query";

interface Props {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: Props) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
