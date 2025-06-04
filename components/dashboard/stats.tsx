'use client';

import { 
  CalendarClock, 
  CheckCircle, 
  Clock, 
  ListTodo, 
  StickyNote, 
  Tag 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  {
    title: 'Tasks',
    value: '12',
    description: '4 due today',
    icon: ListTodo,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
  },
  {
    title: 'Completed',
    value: '8',
    description: 'This week',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-950',
  },
  {
    title: 'Notes',
    value: '24',
    description: '3 updated recently',
    icon: StickyNote,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-950',
  },
  {
    title: 'Upcoming',
    value: '5',
    description: 'Scheduled tasks',
    icon: CalendarClock,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
  },
];

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-full`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}