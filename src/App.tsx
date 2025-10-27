import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import NotFound from "./pages/NotFound";
import AlertsGallery from "./pages/AlertsGallery";
import AIChat from "./pages/AiChat"; // ✅ already imported

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="iot-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* 🔹 Public Route */}
              <Route path="/login" element={<Login />} />

              {/* 🔹 Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 p-6 bg-background">
                        <Dashboard />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 p-6 bg-background">
                        <Dashboard />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 p-6 bg-background">
                        <Analytics />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 p-6 bg-background">
                        <Settings />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* 🔹 Alerts Page */}
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 p-6 bg-background">
                        <AlertsGallery />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* 🔹 ✅ New AI Chat Page */}
              <Route
                path="/aichat"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 p-6 bg-background">
                        <AIChat />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* 🔹 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
