import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import WorkoutLog from "./pages/WorkoutLog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Placeholder Protected Routes for Future Features */}
              <Route path="/workout/log" element={
                <ProtectedRoute>
                  <WorkoutLog />
                </ProtectedRoute>
              } />
              <Route path="/goals" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-background flex items-center justify-center">
                    <p className="text-foreground">Goals Tracker - Coming Soon</p>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/achievements" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-background flex items-center justify-center">
                    <p className="text-foreground">Achievements - Coming Soon</p>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-background flex items-center justify-center">
                    <p className="text-foreground">Analytics - Coming Soon</p>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/leaderboard" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-background flex items-center justify-center">
                    <p className="text-foreground">Leaderboard - Coming Soon</p>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/recommendations" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-background flex items-center justify-center">
                    <p className="text-foreground">Recommendations - Coming Soon</p>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
