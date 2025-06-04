'use client';

import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlusCircle, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Task } from '@/lib/types';
import { KanbanCard } from './card';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  columnId: string;
  onAddTask: () => void;
}

export function KanbanColumn({ id, title, tasks, columnId, onAddTask }: KanbanColumnProps) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  // Generate column color based on status
  const getColumnColor = () => {
    switch (columnId) {
      case 'todo':
        return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800';
      case 'in-progress':
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900';
      case 'done':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900';
      default:
        return 'bg-background border-border';
    }
  };
  
  return (
    <div
      ref={(node) => {
        setDroppableRef(node);
        setSortableRef(node);
      }}
      style={style}
      {...attributes}
      className={cn(
        'flex flex-col rounded-lg border h-full transition-colors',
        getColumnColor(),
        isOver && 'ring-2 ring-primary ring-inset',
        isDragging && 'opacity-50 rotate-2 z-10 shadow-lg'
      )}
    >
      <div className="p-3 border-b border-inherit">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              {...listeners}
              className="flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent transition-colors cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="font-medium">{title}</h3>
          </div>
          <span className="text-sm text-muted-foreground">{tasks.length}</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-3 min-h-[100px]">
          {tasks.map(task => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t border-inherit mt-auto">
        <Button variant="ghost" className="w-full justify-start gap-2" size="sm" onClick={onAddTask}>
          <PlusCircle className="h-4 w-4" />
          <span>Add Task</span>
        </Button>
      </div>
    </div>
  );
}