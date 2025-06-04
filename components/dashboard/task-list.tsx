'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Clock, Flag, Plus, Trash2, Pencil } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/db';
import { Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function DashboardTaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const tasks = await db.getTasks();
      setTasks(tasks);
    } catch (error) {
      toast({
        title: 'Error loading tasks',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const toggleTaskStatus = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        status: task.status === 'done' ? 'todo' : 'done',
        updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
      };

      await db.updateTask(updatedTask);
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
      
      toast({
        title: `Task ${updatedTask.status === 'done' ? 'completed' : 'uncompleted'}`,
      });
    } catch (error) {
      toast({
        title: 'Error updating task',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const handleCreateOrUpdateTask = async () => {
    try {
      if (!taskForm.title.trim()) {
        toast({
          title: 'Title is required',
          variant: 'destructive',
        });
        return;
      }

      const task: Task = {
        id: selectedTask?.id || crypto.randomUUID(),
        title: taskForm.title,
        description: taskForm.description,
        status: selectedTask?.status || 'todo',
        priority: taskForm.priority as 'low' | 'medium' | 'high',
        dueDate: taskForm.dueDate || undefined,
        tags: selectedTask?.tags || [],
        createdAt: selectedTask?.createdAt || format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
      };

      if (selectedTask) {
        await db.updateTask(task);
        setTasks(tasks.map(t => t.id === task.id ? task : t));
        toast({
          title: 'Task updated successfully',
        });
      } else {
        await db.createTask(task);
        setTasks([...tasks, task]);
        toast({
          title: 'Task created successfully',
        });
      }

      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
      setSelectedTask(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: `Error ${selectedTask ? 'updating' : 'creating'} task`,
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate || '',
    });
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await db.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast({
        title: 'Task deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error deleting task',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      setSelectedTask(null);
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
    }
    setIsDialogOpen(open);
  };

  // Sort tasks: priority high -> medium -> low, then by due date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    return 0;
  });

  // Display only first 5 tasks for the dashboard
  const displayTasks = sortedTasks.slice(0, 5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Tasks</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedTask ? 'Edit Task' : 'Create New Task'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Task title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Description (optional)"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
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
                  <Input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateOrUpdateTask} className="w-full">
                  {selectedTask ? 'Update Task' : 'Create Task'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>Your upcoming and important tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {displayTasks.map((task) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
            
            const priorityColor = {
              low: 'text-green-500',
              medium: 'text-amber-500',
              high: 'text-red-500',
            }[task.priority];
            
            return (
              <li key={task.id} className="flex items-start gap-4 group">
                <div className="pt-0.5">
                  <Checkbox 
                    id={`task-${task.id}`}
                    checked={task.status === 'done'}
                    onCheckedChange={() => toggleTaskStatus(task.id)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </span>
                    <Flag className={`h-3.5 w-3.5 ${priorityColor}`} />
                    {task.status === 'in-progress' && (
                      <Badge variant="outline" className="text-blue-500 border-blue-500">In Progress</Badge>
                    )}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEditTask(task)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {task.description}
                    </p>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className={`text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        {isOverdue ? 'Overdue: ' : 'Due: '}
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
          {displayTasks.length === 0 && (
            <li className="text-center py-8 text-muted-foreground">
              No tasks yet. Create your first task!
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}