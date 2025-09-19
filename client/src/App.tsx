// Main App component with Replit Auth integration based on blueprint:javascript_log_in_with_replit
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Properties from "@/pages/properties";
import ManageProperties from "@/pages/manage-properties";
import Messages from "@/pages/messages";
import Favorites from "@/pages/favorites";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/properties" component={Properties} />
          <Route path="/manage-properties" component={ManageProperties} />
          <Route path="/messages" component={Messages} />
          <Route path="/favorites" component={Favorites} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const { isAuthenticated } = useAuth();

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <TooltipProvider>
      {isAuthenticated ? (
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-2 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
              </header>
              <main className="flex-1 overflow-hidden">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
      ) : (
        <Router />
      )}
      <Toaster />
    </TooltipProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
    </QueryClientProvider>
  );
}