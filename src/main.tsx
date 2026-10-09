import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./components/App.tsx";
import "./config/axios.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </>
);
