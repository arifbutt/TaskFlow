// Base types
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done' | 'cancelled';

// Task related types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  tags: string[];
  projectId: string;
  parentTaskId?: string;
  assigneeId?: string;
  estimatedHours?: number;
  timeSpent?: number; // in minutes
  position: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface SubTask extends Omit<Task, 'parentTaskId' | 'subTasks'> {
  parentTaskId: string;
  isCompleted: boolean;
}

// Project related types
export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  columns: KanbanColumn[];
  status: 'active' | 'archived' | 'on-hold' | 'completed';
  startDate?: string;
  dueDate?: string;
  tags: string[];
  isFavorite: boolean;
  progress: number; // 0-100
  settings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface ProjectSettings {
  taskStatuses: TaskStatus[];
  defaultTaskStatus: TaskStatus;
  defaultPriority: Priority;
  enableTimeTracking: boolean;
  enableSubtasks: boolean;
  enableComments: boolean;
  enableAttachments: boolean;
  enableLabels: boolean;
}

// Kanban related types
export interface KanbanColumn {
  id: string;
  title: string;
  order: number;
  color?: string;
  wipLimit?: number;
  status: TaskStatus;
}

// Note related types
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color?: string;
  isPinned: boolean;
  isArchived: boolean;
  projectId?: string;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface NoteFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  projectId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Calendar related types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  isRecurring: boolean;
  recurringRule?: string; // RRULE format
  taskId?: string;
  projectId?: string;
  location?: string;
  attendees: string[]; // User IDs
  color?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// User related types
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  timezone: string;
  preferences: UserPreferences;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  timeFormat: '12h' | '24h';
  dateFormat: string;
  defaultView: 'list' | 'board' | 'calendar' | 'timeline';
  showCompletedTasks: boolean;
  showArchivedProjects: boolean;
}

export interface UserSettings {
  notifications: {
    email: boolean;
    desktop: boolean;
    mobile: boolean;
    taskReminders: boolean;
    dueDateAlerts: boolean;
    mentionAlerts: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    loginAlerts: boolean;
  };
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Utility types
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;