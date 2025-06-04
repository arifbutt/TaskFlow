'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Clock, Flag, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTasks, Task } from '@/lib/data/mock-data';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  
  const toggleTaskStatus = (taskId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const newStatus = task.status === 'done' ? 'todo' : 'done';
          return { ...task, status: newStatus, updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss') };
        }
        return task;
      })
    );
  };
  
  // Extract all unique tags from tasks
  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags)));
  
  // Filter tasks based on search, priority, and tag
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesTag = filterTag === 'all' || task.tags.includes(filterTag);
    
    return matchesSearch && matchesPriority && matchesTag;
  });
  
  // Group tasks by status
  const todoTasks = filteredTasks.filter(task => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const doneTasks = filteredTasks.filter(task => task.status === 'done');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'in-progress').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'done').length}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-[2fr_1fr] lg:grid-cols-[3fr_1fr]">
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>Task List</CardTitle>
            <CardDescription>Manage and organize your tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tasks..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>#{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="todo">To Do</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="done">Done</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4 space-y-4">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => <TaskItem key={task.id} task={task} toggleStatus={toggleTaskStatus} />)
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No tasks found</p>
                )}
              </TabsContent>
              
              <TabsContent value="todo" className="mt-4 space-y-4">
                {todoTasks.length > 0 ? (
                  todoTasks.map(task => <TaskItem key={task.id} task={task} toggleStatus={toggleTaskStatus} />)
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No todo tasks found</p>
                )}
              </TabsContent>
              
              <TabsContent value="in-progress" className="mt-4 space-y-4">
                {inProgressTasks.length > 0 ? (
                  inProgressTasks.map(task => <TaskItem key={task.id} task={task} toggleStatus={toggleTaskStatus} />)
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No in-progress tasks found</p>
                )}
              </TabsContent>
              
              <TabsContent value="done" className="mt-4 space-y-4">
                {doneTasks.length > 0 ? (
                  doneTasks.map(task => <TaskItem key={task.id} task={task} toggleStatus={toggleTaskStatus} />)
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No completed tasks found</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="hidden md:block">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Due Soon</CardTitle>
              <CardDescription>Tasks due within 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add upcoming tasks component here */}
              <p className="text-center py-8 text-muted-foreground">Feature coming soon</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TaskItem({ task, toggleStatus }: { task: Task; toggleStatus: (id: string) => void }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  
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
    <div className="border p-4 rounded-lg hover:border-primary transition-colors">
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Checkbox 
            id={`task-${task.id}`}
            checked={task.status === 'done'}
            onCheckedChange={() => toggleStatus(task.id)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </span>
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityBgColor} ${priorityColor}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </div>
            {task.status === 'in-progress' && (
              <Badge variant="outline" className="text-blue-500 border-blue-500">In Progress</Badge>
            )}
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-3">
            {task.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
          
          {task.dueDate && (
            <div className="flex items-center gap-1.5 mt-4">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={`text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                {isOverdue ? 'Overdue: ' : 'Due: '}
                {format(new Date(task.dueDate), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}