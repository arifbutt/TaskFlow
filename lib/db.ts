'use client';

import { Task, Note, Event, Project, KanbanColumn } from '@/lib/types';

const DB_NAME = 'taskflow';
const DB_VERSION = 2;

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  settings: {
    notifications: {
      emailNotifications: boolean;
      taskReminders: boolean;
      dueDateAlerts: boolean;
    };
    theme: 'light' | 'dark' | 'system';
  };
}

export class IndexedDB {
  private db: IDBDatabase | null = null;

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('status', 'status', { unique: false });
          taskStore.createIndex('priority', 'priority', { unique: false });
          taskStore.createIndex('dueDate', 'dueDate', { unique: false });
          taskStore.createIndex('projectId', 'projectId', { unique: false });
        }

        // Create notes store
        if (!db.objectStoreNames.contains('notes')) {
          const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
          noteStore.createIndex('isPinned', 'isPinned', { unique: false });
          taskStore.createIndex('projectId', 'projectId', { unique: false });
          noteStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Create events store
        if (!db.objectStoreNames.contains('events')) {
          const eventStore = db.createObjectStore('events', { keyPath: 'id' });
          eventStore.createIndex('start', 'start', { unique: false });
          eventStore.createIndex('end', 'end', { unique: false });
          taskStore.createIndex('projectId', 'projectId', { unique: false });
        }

        // Create projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Create profile store
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }
      };
    });
  }

  private getStore(name: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('Database not connected');
    const transaction = this.db.transaction(name, mode);
    return transaction.objectStore(name);
  }

  // Projects CRUD
  async getProjects(): Promise<Project[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('projects');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async createProject(project: Project): Promise<Project> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('projects', 'readwrite');
      const request = store.add(project);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(project);
    });
  }

  async updateProject(project: Project): Promise<Project> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('projects', 'readwrite');
      const request = store.put(project);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(project);
    });
  }

  async deleteProject(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('projects', 'readwrite');
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Tasks CRUD
  async getTasks(projectId?: string): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('tasks');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const tasks = request.result;
        if (projectId) {
          resolve(tasks.filter(task => task.projectId === projectId));
        } else {
          resolve(tasks);
        }
      };
    });
  }

  async createTask(task: Task): Promise<Task> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('tasks', 'readwrite');
      const request = store.add(task);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(task);
    });
  }

  async updateTask(task: Task): Promise<Task> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('tasks', 'readwrite');
      const request = store.put(task);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(task);
    });
  }

  async deleteTask(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('tasks', 'readwrite');
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Notes CRUD
  async getNotes(projectId?: string): Promise<Note[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('notes');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const notes = request.result;
        if (projectId) {
          resolve(notes.filter(note => note.projectId === projectId));
        } else {
          resolve(notes);
        }
      };
    });
  }

  async createNote(note: Note): Promise<Note> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('notes', 'readwrite');
      const request = store.add(note);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(note);
    });
  }

  async updateNote(note: Note): Promise<Note> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('notes', 'readwrite');
      const request = store.put(note);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(note);
    });
  }

  async deleteNote(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('notes', 'readwrite');
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Events CRUD
  async getEvents(projectId?: string): Promise<Event[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('events');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const events = request.result;
        if (projectId) {
          resolve(events.filter(event => event.projectId === projectId));
        } else {
          resolve(events);
        }
      };
    });
  }

  async createEvent(event: Event): Promise<Event> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('events', 'readwrite');
      const request = store.add(event);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(event);
    });
  }

  async updateEvent(event: Event): Promise<Event> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('events', 'readwrite');
      const request = store.put(event);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(event);
    });
  }

  async deleteEvent(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('events', 'readwrite');
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Profile management
  async getProfile(): Promise<UserProfile | null> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('profile');
      const request = store.get('user');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async updateProfile(profile: UserProfile): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('profile', 'readwrite');
      const request = store.put(profile);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(profile);
    });
  }
}

export const db = new IndexedDB();