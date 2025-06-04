'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Task, Project, KanbanColumn } from '@/lib/types';
import { db } from '@/lib/db';
import { KanbanColumn as KanbanColumnComponent } from '@/components/kanban/column';
import { KanbanCard } from '@/components/kanban/card';

const defaultColumns: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', order: 0 },
  { id: 'in-progress', title: 'In Progress', order: 1 },
  { id: 'done', title: 'Done', order: 2 },
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<KanbanColumn[]>(defaultColumns);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<KanbanColumn | null>(null);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isNewColumnDialogOpen, setIsNewColumnDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: '',
  });
  const [columnForm, setColumnForm] = useState({
    title: '',
  });
  
  const { toast } = useToast();
  
  async function loadData() {
    try {
      console.log('Connecting to database...');
      await db.connect(); // Ensure connection is established
      
      console.log('Fetching projects...');
      const projects = await db.getProjects();
      console.log('Projects found:', projects);
      
      setProjects(projects);
      
      if (projects.length > 0) {
        const firstProject = projects[0];
        console.log('Selected project:', firstProject);
        
        setSelectedProject(firstProject);
        setColumns(firstProject.columns || defaultColumns); // Fallback to default columns
        
        console.log('Fetching tasks...');
        const tasks = await db.getTasks(firstProject.id);
        console.log('Tasks found:', tasks);
        setTasks(tasks);
      } else {
        console.log('No projects found, creating default project...');
        // Create a default project if none exists
        const defaultProject = {
          id: `project-${Date.now()}`,
          name: 'My Project',
          description: 'Default project',
          columns: defaultColumns,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        console.log('Creating default project:', defaultProject);
        await db.createProject(defaultProject);
        
        console.log('Default project created');
        setProjects([defaultProject]);
        setSelectedProject(defaultProject);
        setColumns(defaultColumns);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error in loadData:', error);
      toast({
        title: 'Error loading data',
        description: error instanceof Error ? error.message : 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  }));

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeId = active.id as string;

    if (activeId.startsWith('column-')) {
      const column = columns.find(col => `column-${col.id}` === activeId);
      if (column) setActiveColumn(column);
    } else {
      const task = tasks.find(t => t.id === activeId);
      if (task) setActiveTask(task);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Handle column reordering
    if (activeId.startsWith('column-') && overId.startsWith('column-')) {
      const oldIndex = columns.findIndex(col => `column-${col.id}` === activeId);
      const newIndex = columns.findIndex(col => `column-${col.id}` === overId);
      
      if (oldIndex !== newIndex) {
        const newColumns = arrayMove(columns, oldIndex, newIndex).map((col, index) => ({
          ...col,
          order: index,
        }));
        
        setColumns(newColumns);
        
        if (selectedProject) {
          const updatedProject = {
            ...selectedProject,
            columns: newColumns,
            updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
          };
          
          await db.updateProject(updatedProject);
          setSelectedProject(updatedProject);
          
          toast({
            title: 'Columns reordered',
          });
        }
      }
    }
    // Handle task movement
    else {
      try {
        // If the task is dropped on a column
        if (overId.startsWith('column-')) {
          const newStatus = overId.replace('column-', '');
          const updatedTask = tasks.find(task => task.id === activeId);
          
          if (updatedTask) {
            const taskWithNewStatus = {
              ...updatedTask,
              status: newStatus,
              updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
            };
            
            await db.updateTask(taskWithNewStatus);
            setTasks(tasks.map(task => 
              task.id === activeId ? taskWithNewStatus : task
            ));
            
            toast({
              title: 'Task status updated',
            });
          }
        } 
        // If the task is dropped on another task, reorder within the same column
        else {
          const activeTask = tasks.find(t => t.id === activeId);
          const overTask = tasks.find(t => t.id === overId);
          
          if (activeTask && overTask && activeTask.status === overTask.status) {
            const activeIndex = tasks.findIndex(t => t.id === activeId);
            const overIndex = tasks.findIndex(t => t.id === overId);
            
            setTasks(arrayMove(tasks, activeIndex, overIndex));
          }
        }
      } catch (error) {
        toast({
          title: 'Error updating task',
          description: 'Please try again later',
          variant: 'destructive',
        });
      }
    }
    
    setActiveTask(null);
    setActiveColumn(null);
  }
  
  async function handleCreateTask() {
    try {
      if (!taskForm.title.trim()) {
        toast({
          title: 'Title is required',
          variant: 'destructive',
        });
        return;
      }
      
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: taskForm.title,
        description: taskForm.description,
        status: 'todo',
        priority: taskForm.priority as 'low' | 'medium' | 'high',
        dueDate: taskForm.dueDate || undefined,
        tags: taskForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        projectId: selectedProject?.id,
        createdAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
      };
      
      await db.createTask(newTask);
      setTasks([...tasks, newTask]);
      
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        tags: '',
      });
      setIsNewTaskDialogOpen(false);
      
      toast({
        title: 'Task created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error creating task',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  }

  async function handleCreateColumn() {
    try {
      if (!columnForm.title.trim()) {
        toast({
          title: 'Title is required',
          variant: 'destructive',
        });
        return;
      }

      const newColumn: KanbanColumn = {
        id: columnForm.title.toLowerCase().replace(/\s+/g, '-'),
        title: columnForm.title,
        order: columns.length,
      };

      const newColumns = [...columns, newColumn];

      if (selectedProject) {
        const updatedProject = {
          ...selectedProject,
          columns: newColumns,
          updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        };

        await db.updateProject(updatedProject);
        setSelectedProject(updatedProject);
        setColumns(newColumns);

        toast({
          title: 'Column created successfully',
        });
      }

      setColumnForm({ title: '' });
      setIsNewColumnDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error creating column',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  }

  useEffect(() => {
    loadData();
  }, []);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Kanban Board</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-14rem)]">
          <div className="animate-pulse bg-muted rounded-lg"></div>
          <div className="animate-pulse bg-muted rounded-lg"></div>
          <div className="animate-pulse bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Kanban Board</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsNewColumnDialogOpen(true)}>
            Add Column
          </Button>
          <Button className="gap-2" onClick={() => setIsNewTaskDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>
      
      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
        modifiers={[restrictToVerticalAxis]}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-14rem)]">
          <SortableContext items={columns.map(col => `column-${col.id}`)}>
            {columns.map(column => {
              const columnTasks = tasks.filter(task => task.status === column.id);
              return (
                <KanbanColumnComponent
                  key={column.id}
                  id={`column-${column.id}`}
                  title={column.title}
                  tasks={columnTasks}
                  columnId={column.id}
                  onAddTask={() => setIsNewTaskDialogOpen(true)}
                />
              );
            })}
          </SortableContext>
        </div>
        
        <DragOverlay>
          {activeTask ? <KanbanCard task={activeTask} /> : null}
          {activeColumn ? (
            <KanbanColumnComponent
              id={`column-${activeColumn.id}`}
              title={activeColumn.title}
              tasks={tasks.filter(task => task.status === activeColumn.id)}
              columnId={activeColumn.id}
              onAddTask={() => setIsNewTaskDialogOpen(true)}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      
      <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Task title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description (optional)"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={taskForm.priority}
                onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Enter tags (comma-separated)"
                value={taskForm.tags}
                onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })}
              />
            </div>
            <Button onClick={handleCreateTask} className="w-full">
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewColumnDialogOpen} onOpenChange={setIsNewColumnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="columnTitle">Title</Label>
              <Input
                id="columnTitle"
                placeholder="Column title"
                value={columnForm.title}
                onChange={(e) => setColumnForm({ ...columnForm, title: e.target.value })}
              />
            </div>
            <Button onClick={handleCreateColumn} className="w-full">
              Create Column
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}