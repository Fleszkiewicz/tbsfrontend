import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ProtectedLayout } from "./config/ProtectedLayout.tsx";
import { AuthProvider } from "./provider/AuthProvider.tsx";
import { ProtectedRoutes } from "./config/ProtectedRoutes.tsx";
import { Toaster } from "sonner";
import { Loader } from "./common/ui/Loader.tsx";

import Login from "./pages/Login.tsx";
import { AuthSuccess } from "./pages/AuthSuccess.tsx";
import { Failure } from "./pages/Failure.tsx";
import CreateTrip from "./pages/CreateTrip.tsx";

const Annual = lazy(() => import("./pages/Annual.tsx"));
const Home = lazy(() => import("./pages/Home.tsx"));
const Expenses = lazy(() => import("./pages/Expenses.tsx"));
const Trip = lazy(() => import("./pages/Trip.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));

function App() {
  return (
    <Router>
      <Toaster
        position="bottom-right"
        duration={2500}
        toastOptions={{
          style: {
            background: "#1C1C1E",
            color: "#FFFFFF",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "9999px",
            padding: "12px 18px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
            fontSize: "14px",
            fontWeight: "500",
            letterSpacing: "0.2px",
          }
        }}
        icons={{
          success: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
              <circle cx="12" cy="12" r="10" fill="#28C76F" />
              <path d="M7 12.5L10.5 16L17 8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          error: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
              <path d="M15.429 2H8.571L2 8.571V15.429L8.571 22H15.429L22 15.429V8.571L15.429 2Z" fill="#F59E0B" />
              <path d="M12 7V13" stroke="#1C1C1E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="16.5" r="1.5" fill="#1C1C1E" />
            </svg>
          )
        }}
      />
      <AuthProvider>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} index />
            <Route path="/failure" element={<Failure />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            <Route element={<ProtectedRoutes />}>
              <Route element={<ProtectedLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/finance" element={<Annual />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/createtrip" element={<CreateTrip />} />
                <Route path="/trip/:id" element={<Trip />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
