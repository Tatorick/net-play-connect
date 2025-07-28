import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ClubManagement from "./pages/ClubManagement";
import MyTeam from "./pages/MyTeam";
import Statistics from "./pages/Statistics";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Register from "./pages/Register";
import { AdminCoachRequests } from "./components/AdminCoachRequests";
import AdminDashboard from "./pages/AdminDashboard";
import TeamDetail from "./pages/TeamDetail";
import Matches from "./pages/Matches";
import Players from "./pages/Players";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/coach/club" element={<ProtectedRoute><ClubManagement /></ProtectedRoute>} />
            <Route path="/coach/teams" element={<ProtectedRoute><MyTeam /></ProtectedRoute>} />
            <Route path="/coach/teams/:teamId" element={<ProtectedRoute><TeamDetail /></ProtectedRoute>} />
            <Route path="/coach/players" element={<ProtectedRoute><Players /></ProtectedRoute>} />
            <Route path="/players" element={<ProtectedRoute><Players /></ProtectedRoute>} />
            <Route path="/coach/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
            <Route path="/coach/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/coach-requests" element={<ProtectedRoute><AdminCoachRequests /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
