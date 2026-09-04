// src/main.tsx
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "./App";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 5,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
);
