"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Sidebar from "./Sidebar";
import GlobalHeader from "./GlobalHeader";
import { SyncService } from "../../application/services/sync-service";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isLandingPage = pathname === "/";

  useEffect(() => {
    if (isLoaded && user) {
      const executeSync = () => {
        SyncService.triggerSync(user.id, user.primaryEmailAddress?.emailAddress || "");
      };
      // Execute sync on mount/login
      executeSync();

      // Run sync periodically every 60 seconds
      const timer = setInterval(executeSync, 60000);
      return () => clearInterval(timer);
    }
  }, [isLoaded, user]);

  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden flex-col md:flex-row bg-[#f8fafc]">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      
      {/* Main Workspace */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Global Header */}
        <GlobalHeader onOpenMenu={() => setIsMobileSidebarOpen(true)} />
        
        {/* Scrollable Workspace Content */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc]">
          {children}
        </div>
      </main>
    </div>
  );
}

