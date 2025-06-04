'use client';

import { useEffect, ReactNode } from 'react';
import { db } from '@/lib/db';

export function DBProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    async function initDB() {
      try {
        console.log('Initializing database...');
        await db.connect();
        console.log('Database connected successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    }
    
    initDB();
  }, []);

  return <>{children}</>;
}
