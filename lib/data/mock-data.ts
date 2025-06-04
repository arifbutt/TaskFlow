import { format, addDays, subDays } from 'date-fns';

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags: string[];
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
};

// Generate mock tasks
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Finish the quarterly project proposal with budget estimates',
    status: 'in-progress',
    priority: 'high',
    dueDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    tags: ['work', 'project'],
    createdAt: format(subDays(new Date(), 3), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
  },
  {
    id: '2',
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, vegetables',
    status: 'todo',
    priority: 'medium',
    dueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    tags: ['personal', 'shopping'],
    createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
  },
  {
    id: '3',
    title: 'Schedule doctor appointment',
    status: 'todo',
    priority: 'high',
    dueDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    tags: ['personal', 'health'],
    createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
  },
  {
    id: '4',
    title: 'Review team presentation',
    description: 'Go through slides and provide feedback',
    status: 'done',
    priority: 'medium',
    tags: ['work', 'meeting'],
    createdAt: format(subDays(new Date(), 4), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
  },
  {
    id: '5',
    title: 'Update portfolio website',
    description: 'Add recent projects and update skills section',
    status: 'todo',
    priority: 'low',
    tags: ['personal', 'development'],
    createdAt: format(subDays(new Date(), 6), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(subDays(new Date(), 6), 'yyyy-MM-dd\'T\'HH:mm:ss'),
  },
  {
    id: '6',
    title: 'Plan team building activity',
    status: 'in-progress',
    priority: 'medium',
    dueDate: format(addDays(new Date(), 10), 'yyyy-MM-dd'),
    tags: ['work', 'team'],
    createdAt: format(subDays(new Date(), 7), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
  },
];

// Generate mock notes
export const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Meeting Notes',
    content: 'Discussed project timeline and resource allocation. Need to follow up with the design team by EOW.',
    tags: ['work', 'meeting'],
    color: '#ffcca5',
    isPinned: true,
    createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
  },
  {
    id: '2',
    title: 'Recipe: Homemade Pasta',
    content: '2 cups flour, 3 eggs, pinch of salt. Mix, knead, rest, roll, cut. Cook 2-3 minutes in boiling water.',
    tags: ['personal', 'recipe'],
    color: '#aecfdf',
    isPinned: false,
    createdAt: format(subDays(new Date(), 5), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(subDays(new Date(), 5), 'yyyy-MM-dd\'T\'HH:mm:ss'),
  },
  {
    id: '3',
    title: 'Book Recommendations',
    content: '1. Atomic Habits by James Clear\n2. Deep Work by Cal Newport\n3. The Psychology of Money by Morgan Housel',
    tags: ['personal', 'reading'],
    color: '#d5ecc2',
    isPinned: true,
    createdAt: format(subDays(new Date(), 8), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(subDays(new Date(), 3), 'yyyy-MM-dd\'T\'HH:mm:ss'),
  },
  {
    id: '4',
    title: 'Project Ideas',
    content: '- Personal finance tracker with ML predictions\n- Recipe app with ingredient substitution\n- Home inventory system with QR codes',
    tags: ['work', 'ideas'],
    isPinned: false,
    createdAt: format(subDays(new Date(), 12), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(subDays(new Date(), 12), 'yyyy-MM-dd\'T\'HH:mm:ss'),
  },
];

// Generate mock events
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Team Meeting',
    description: 'Weekly sync with the development team',
    start: format(addDays(new Date(), 1).setHours(10, 0, 0, 0), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    end: format(addDays(new Date(), 1).setHours(11, 0, 0, 0), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    allDay: false,
  },
  {
    id: '2',
    title: 'Doctor Appointment',
    start: format(addDays(new Date(), 3).setHours(14, 30, 0, 0), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    end: format(addDays(new Date(), 3).setHours(15, 30, 0, 0), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    allDay: false,
    taskId: '3', // Related to task with id '3'
  },
  {
    id: '3',
    title: 'Project Deadline',
    description: 'Final submission of the project proposal',
    start: format(addDays(new Date(), 5).setHours(0, 0, 0, 0), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    end: format(addDays(new Date(), 5).setHours(23, 59, 59, 0), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    allDay: true,
    taskId: '1', // Related to task with id '1'
  },
  {
    id: '4',
    title: 'Friend\'s Birthday',
    start: format(addDays(new Date(), 7).setHours(0, 0, 0, 0), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    end: format(addDays(new Date(), 7).setHours(23, 59, 59, 0), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    allDay: true,
  },
];