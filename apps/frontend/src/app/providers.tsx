"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import ClientLayout from "./ClientLayout";
import { useAuth } from "@/hooks/useAuth";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { isLoading, error } = useAuth();

  // Show loading state while authentication is in progress
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-2xl text-white text-center p-4">Loading...</p>
      </div>
    );
  }

  // Show error state if authentication failed
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <p className="text-2xl text-white text-center p-4">
          Authentication failed. Please try again later.
        </p>
        <p className="text-sm text-red-500 text-center p-4">{error}</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ClientLayout>{children}</ClientLayout>
    </QueryClientProvider>
  );
}
