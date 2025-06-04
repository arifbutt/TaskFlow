'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DBProvider } from '@/components/providers/db-provider';
import { useEffect } from 'react';
import { db } from '@/lib/db';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    db.connect();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DBProvider>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </DBProvider>
    </ThemeProvider>
  );
}