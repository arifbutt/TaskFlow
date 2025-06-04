'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Layers, 
  ListTodo, 
  Plus, 
  Settings, 
  StickyNote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: ListTodo
  },
  {
    name: 'Notes',
    href: '/notes',
    icon: StickyNote
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: CalendarDays
  },
  {
    name: 'Kanban',
    href: '/kanban',
    icon: Layers
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);

  return (
    <aside 
      className={cn(
        'h-screen border-r bg-card text-card-foreground transition-all duration-300',
        expanded ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center justify-between px-4 py-4">
          {expanded && (
            <h1 className="text-xl font-semibold">Taskflow</h1>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className={cn('ml-auto', !expanded && 'mx-auto')}
          >
            {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-2">
          <nav className="flex flex-col gap-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Tooltip key={link.name} delayDuration={expanded ? 1000 : 0}>
                  <TooltipTrigger asChild>
                    <Link href={link.href} passHref>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          'w-full justify-start gap-3 transition-all',
                          expanded ? 'px-3' : 'px-0 justify-center'
                        )}
                      >
                        <Icon size={20} />
                        {expanded && <span>{link.name}</span>}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  {!expanded && (
                    <TooltipContent side="right">
                      <p>{link.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="border-t p-3">
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start gap-3',
              expanded ? 'px-3' : 'px-0 justify-center'
            )}
            onClick={() => {}}
          >
            <Plus size={20} />
            {expanded && <span>New Task</span>}
          </Button>
        </div>

        <div className="p-3">
          <Link href="/settings" passHref>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3',
                expanded ? 'px-3' : 'px-0 justify-center'
              )}
            >
              <Settings size={20} />
              {expanded && <span>Settings</span>}
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}