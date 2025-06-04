'use client';

import { Task, Note, Event, Project, KanbanColumn, UserProfile } from '@/lib/types';

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
  private isConnecting = false;
  private connectionPromise: Promise<void> | null = null;

  async connect(): Promise<void> {
    // If already connected, return
    if (this.db) return;
    
    // If connection is in progress, return the existing promise
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    
    this.connectionPromise = new Promise((resolve, reject) => {
      console.log('Opening IndexedDB connection...');
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('Database error:', (event.target as IDBRequest).error);
        this.isConnecting = false;
        reject((event.target as IDBRequest).error);
      };

      request.onsuccess = () => {
        console.log('Database connection established');
        this.db = request.result;
        this.isConnecting = false;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        console.log('Database upgrade needed, initializing schema...');
        const db = (event.target as IDBOpenDBRequest).result;
        this.initializeSchema(db);
      };
    });

    return this.connectionPromise;
  }

  private initializeSchema(db: IDBDatabase) {
    // Create projects store
    if (!db.objectStoreNames.contains('projects')) {
      console.log('Creating projects store...');
      const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
      projectStore.createIndex('status', 'status', { unique: false });
      projectStore.createIndex('isFavorite', 'isFavorite', { unique: false });
      projectStore.createIndex('createdAt', 'createdAt', { unique: false });
      projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      projectStore.createIndex('createdBy', 'createdBy', { unique: false });
    }

    // Create tasks store
    if (!db.objectStoreNames.contains('tasks')) {
      console.log('Creating tasks store...');
      const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
      taskStore.createIndex('status', 'status', { unique: false });
      taskStore.createIndex('priority', 'priority', { unique: false });
      taskStore.createIndex('dueDate', 'dueDate', { unique: false });
      taskStore.createIndex('projectId', 'projectId', { unique: false });
      taskStore.createIndex('parentTaskId', 'parentTaskId', { unique: false });
      taskStore.createIndex('assigneeId', 'assigneeId', { unique: false });
      taskStore.createIndex('createdAt', 'createdAt', { unique: false });
      taskStore.createIndex('updatedAt', 'updatedAt', { unique: false });
    }

    // Create notes store
    if (!db.objectStoreNames.contains('notes')) {
      console.log('Creating notes store...');
      const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
      noteStore.createIndex('isPinned', 'isPinned', { unique: false });
      noteStore.createIndex('isArchived', 'isArchived', { unique: false });
      noteStore.createIndex('projectId', 'projectId', { unique: false });
      noteStore.createIndex('folderId', 'folderId', { unique: false });
      noteStore.createIndex('createdAt', 'createdAt', { unique: false });
      noteStore.createIndex('updatedAt', 'updatedAt', { unique: false });
    }

    // Create note_folders store
    if (!db.objectStoreNames.contains('note_folders')) {
      console.log('Creating note_folders store...');
      const folderStore = db.createObjectStore('note_folders', { keyPath: 'id' });
      folderStore.createIndex('parentId', 'parentId', { unique: false });
      folderStore.createIndex('projectId', 'projectId', { unique: false });
      folderStore.createIndex('order', 'order', { unique: false });
    }

    // Create calendar_events store
    if (!db.objectStoreNames.contains('calendar_events')) {
      console.log('Creating calendar_events store...');
      const eventStore = db.createObjectStore('calendar_events', { keyPath: 'id' });
      eventStore.createIndex('start', 'start', { unique: false });
      eventStore.createIndex('end', 'end', { unique: false });
      eventStore.createIndex('isRecurring', 'isRecurring', { unique: false });
      eventStore.createIndex('taskId', 'taskId', { unique: false });
      eventStore.createIndex('projectId', 'projectId', { unique: false });
    }

    // Create users store
    if (!db.objectStoreNames.contains('users')) {
      console.log('Creating users store...');
      const userStore = db.createObjectStore('users', { keyPath: 'id' });
      userStore.createIndex('email', 'email', { unique: true });
    }

    console.log('Database schema initialized');
  }

  private async ensureConnected() {
    if (!this.db) {
      await this.connect();
    }
  }

  private getStore(name: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not connected. Please call connect() first.');
    }
    
    if (!this.db.objectStoreNames.contains(name)) {
      throw new Error(`Store "${name}" does not exist in the database.`);
    }
    
    const transaction = this.db.transaction(name, mode);
    return transaction.objectStore(name);
  }

  // Projects CRUD
  async getProjects(): Promise<Project[]> {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      const store = this.getStore('projects');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async createProject(project: Project): Promise<Project> {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      const store = this.getStore('projects', 'readwrite');
      const request = store.add(project);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(project);
    });
  }

  async updateProject(project: Project): Promise<Project> {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      const store = this.getStore('projects', 'readwrite');
      const request = store.put(project);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(project);
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      const store = this.getStore('projects', 'readwrite');
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Tasks CRUD
  async getTasks(projectId?: string): Promise<Task[]> {
    await this.ensureConnected();
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
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      const store = this.getStore('tasks', 'readwrite');
      const request = store.add(task);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(task);
    });
  }

  async updateTask(task: Task): Promise<Task> {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      const store = this.getStore('tasks', 'readwrite');
      const request = store.put(task);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(task);
    });
  }

  async deleteTask(id: string): Promise<void> {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      const store = this.getStore('tasks', 'readwrite');
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Notes CRUD
  async getNotes(projectId?: string): Promise<Note[]> {
    await this.ensureConnected();
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
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      const store = this.getStore('notes', 'readwrite');
      const request = store.add(note);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(note);
    });
  }

  async updateNote(note: Note): Promise<Note> {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      const store = this.getStore('notes', 'readwrite');
      const request = store.put(note);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(note);
    });
  }

  async deleteNote(id: string): Promise<void> {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      const store = this.getStore('notes', 'readwrite');
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Events CRUD
  async getEvents(projectId?: string): Promise<Event[]> {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      const store = this.getStore('calendar_events');
      const request = store.getAll();
      
      request.onerror = () => {
        console.error('Error getting events:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        let events = request.result || [];
        
        // Filter by projectId if provided
        if (projectId) {
          events = events.filter((event: Event) => event.projectId === projectId);
        }
        
        resolve(events);
      };
    });
  }

  async getEvent(id: string): Promise<Event | undefined> {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      const store = this.getStore('calendar_events');
      const request = store.get(id);
      
      request.onerror = () => {
        console.error('Error getting event:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      const store = this.getStore('calendar_events', 'readwrite');
      const newEvent: Event = {
        ...event,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const request = store.add(newEvent);
      
      request.onerror = () => {
        console.error('Error creating event:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        resolve(newEvent);
      };
    });
  }

  async updateEvent(updates: Partial<Event> & { id: string }): Promise<Event> {
    await this.ensureConnected();
    return new Promise(async (resolve, reject) => {
      const existingEvent = await this.getEvent(updates.id);
      
      if (!existingEvent) {
        reject(new Error(`Event with id ${updates.id} not found`));
        return;
      }
      
      const updatedEvent: Event = {
        ...existingEvent,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      const store = this.getStore('calendar_events', 'readwrite');
      const request = store.put(updatedEvent);
      
      request.onerror = () => {
        console.error('Error updating event:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        resolve(updatedEvent);
      };
    });
  }

  async deleteEvent(id: string): Promise<void> {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      const store = this.getStore('calendar_events', 'readwrite');
      const request = store.delete(id);
      
      request.onerror = () => {
        console.error('Error deleting event:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  // Profile management
  async getProfile(): Promise<UserProfile | null> {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      const store = this.getStore('profile');
      const request = store.get('user');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async updateProfile(profile: UserProfile): Promise<UserProfile> {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      const store = this.getStore('profile', 'readwrite');
      const request = store.put(profile);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(profile);
    });
  }
}

export const db = new IndexedDB();