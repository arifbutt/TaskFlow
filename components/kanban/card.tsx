'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { Clock, Flag, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Task } from '@/lib/types';

interface KanbanCardProps {
  task: Task;
}

export function KanbanCard({ task }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  // Determine if a task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  
  // Get priority color
  const priorityColor = {
    low: 'text-green-500',
    medium: 'text-amber-500',
    high: 'text-red-500',
  }[task.priority];
  
  const priorityBgColor = {
    low: 'bg-green-100 dark:bg-green-900',
    medium: 'bg-amber-100 dark:bg-amber-900',
    high: 'bg-red-100 dark:bg-red-900',
  }[task.priority];
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'p-3 bg-card border rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer',
        isDragging && 'opacity-50 rotate-2 z-10 shadow-lg'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
        <div 
          {...listeners}
          className="flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent transition-colors cursor-grab active:cursor-grabbing" 
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="flex flex-wrap gap-1 mt-3">
        <div className={`px-1.5 py-0.5 rounded-full text-xs ${priorityBgColor} ${priorityColor}`}>
          {task.priority}
        </div>
        
        {task.tags.slice(0, 2).map(tag => (
          <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">
            #{tag}
          </Badge>
        ))}
        {task.tags.length > 2 && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
            +{task.tags.length - 2}
          </Badge>
        )}
      </div>
      
      {task.dueDate && (
        <div className="flex items-center gap-1.5 mt-2">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className={`text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        </div>
      )}
    </div>
  );
}