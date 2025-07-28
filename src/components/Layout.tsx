import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserNav } from "@/components/UserNav";
import { ModeToggle } from "@/components/ModeToggle";
import { Volleyball } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="h-full px-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden" />
                <div className="hidden sm:flex items-center gap-2">
                  <Volleyball className="h-6 w-6 text-primary animate-volleyball-bounce" />
                  <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    VoleiPro
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <ModeToggle />
                <UserNav />
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}