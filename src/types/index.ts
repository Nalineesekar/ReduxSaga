/**
 * =============================================================================
 * TYPE DEFINITIONS
 * =============================================================================
 * 
 * Central type definitions for the Student Task Management System.
 * All TypeScript interfaces and types used across the application are
 * defined here to maintain a single source of truth.
 * 
 * TEACHING NOTE:
 * In a real project, you might split types into separate files per feature.
 * For teaching purposes, we keep them together for easy reference.
 * =============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Task Types
// ─────────────────────────────────────────────────────────────────────────────

/** Possible statuses a task can have */
export type TaskStatus = 'todo' | 'in-progress' | 'done';

/** Priority levels for tasks */
export type TaskPriority = 'low' | 'medium' | 'high';

/** Main Task interface representing a student task */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;       // ISO date string
  createdAt: string;      // ISO date string
  assignee: string;       // Student name
  tags: string[];         // e.g., ['homework', 'urgent']
}

/** Shape for creating a new task (id and createdAt are auto-generated) */
export type CreateTaskPayload = Omit<Task, 'id' | 'createdAt'>;

/** Shape for updating a task (all fields optional except id) */
export type UpdateTaskPayload = Partial<Task> & { id: string };

// ─────────────────────────────────────────────────────────────────────────────
// User / Auth Types
// ─────────────────────────────────────────────────────────────────────────────

/** User profile information */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;        // URL or emoji for simplicity
  role: 'student' | 'teacher' | 'admin';
  bio: string;
  joinedAt: string;      // ISO date string
}

/** Credentials for login */
export interface LoginCredentials {
  email: string;
  password: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Types
// ─────────────────────────────────────────────────────────────────────────────

/** Types of notifications */
export type NotificationType = 'info' | 'warning' | 'success' | 'error';

/** A single notification item */
export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;     // ISO date string
}

// ─────────────────────────────────────────────────────────────────────────────
// Redux State Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TEACHING NOTE:
 * Defining state types separately from slices helps with:
 * 1. Type inference in selectors
 * 2. Type checking in saga select() calls
 * 3. Documentation of state shape
 */

/** Auth slice state shape */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

/** Tasks slice state shape */
export interface TasksState {
  tasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
  // Draft auto-save related state
  draftTask: Partial<CreateTaskPayload> | null;
  draftSaving: boolean;
  lastSavedAt: string | null;
  // Throttle demo state
  throttleCount: number;
  throttleMessage: string | null;
  // Race demo state
  raceLoading: boolean;
  raceResult: string | null;
  raceError: string | null;
}

/** Notifications slice state shape */
export interface NotificationsState {
  notifications: Notification[];
  polling: boolean;
  pollingError: string | null;
}

/** Profile slice state shape */
export interface ProfileState {
  profile: User | null;
  loading: boolean;
  error: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Saga Action Payload Types
// ─────────────────────────────────────────────────────────────────────────────

/** Payload for the parallel load action (loads multiple resources at once) */
export interface ParallelLoadResult {
  tasks: Task[];
  profile: User;
  notifications: Notification[];
}
