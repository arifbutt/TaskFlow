import { z } from 'zod';
import { Priority, TaskStatus } from './types';

// Common validations
export const idSchema = z.string().uuid('Invalid ID format');
export const emailSchema = z.string().email('Invalid email address');
export const urlSchema = z.string().url('Invalid URL').or(z.literal(''));

// User validations
export const userProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: emailSchema,
  avatarUrl: urlSchema.optional(),
  timezone: z.string().min(1, 'Timezone is required'),
});

// Project validations
export const projectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100, 'Project name is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'),
  status: z.enum(['active', 'archived', 'on-hold', 'completed']).default('active'),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string().min(1, 'Tag cannot be empty')).default([]),
  settings: z.object({
    taskStatuses: z.array(z.string()).min(1, 'At least one status is required'),
    defaultTaskStatus: z.string().min(1, 'Default status is required'),
    defaultPriority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    enableTimeTracking: z.boolean().default(false),
    enableSubtasks: z.boolean().default(true),
    enableComments: z.boolean().default(true),
    enableAttachments: z.boolean().default(true),
    enableLabels: z.boolean().default(true),
  }),
});

// Task validations
export const taskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200, 'Title is too long'),
  description: z.string().max(5000, 'Description is too long').optional(),
  status: z.string().min(1, 'Status is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  tags: z.array(z.string().min(1, 'Tag cannot be empty')).default([]),
  projectId: z.string().uuid('Invalid project ID'),
  parentTaskId: z.string().uuid('Invalid parent task ID').optional(),
  assigneeId: z.string().uuid('Invalid assignee ID').optional(),
  estimatedHours: z.number().min(0, 'Estimated hours cannot be negative').optional(),
  position: z.number().int().min(0, 'Position cannot be negative').default(0),
});

// Note validations
export const noteSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string().min(1, 'Tag cannot be empty')).default([]),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})?$/, 'Invalid color format').optional(),
  isPinned: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  projectId: z.string().uuid('Invalid project ID').optional(),
  folderId: z.string().uuid('Invalid folder ID').optional(),
});

// Calendar event validations
export const calendarEventSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200, 'Title is too long'),
  description: z.string().max(5000, 'Description is too long').optional(),
  start: z.string().datetime('Invalid start date'),
  end: z.string().datetime('Invalid end date'),
  allDay: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurringRule: z.string().optional(),
  taskId: z.string().uuid('Invalid task ID').optional(),
  projectId: z.string().uuid('Invalid project ID').optional(),
  location: z.string().max(500, 'Location is too long').optional(),
  attendees: z.array(z.string().uuid('Invalid user ID')).default([]),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})?$/, 'Invalid color format').optional(),
});

// Form validation helper
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { data: T; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { data: result.data, errors: {} };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });

  return { data: data as T, errors };
}

// Infer types from schemas
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type NoteFormData = z.infer<typeof noteSchema>;
export type CalendarEventFormData = z.infer<typeof calendarEventSchema>;
