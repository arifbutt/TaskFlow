export type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags: string[];
  projectId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color?: string;
  isPinned: boolean;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Event = {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  taskId?: string;
  projectId?: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  columns: KanbanColumn[];
  createdAt: string;
  updatedAt: string;
};

export type KanbanColumn = {
  id: string;
  title: string;
  order: number;
};