/**
 * =============================================================================
 * FAKE API SERVICE
 * =============================================================================
 * 
 * This module simulates a backend API using Promises with setTimeout.
 * In a real application, these would be HTTP calls (fetch/axios) to a server.
 * 
 * TEACHING NOTE:
 * Using fake APIs lets us focus on Redux Saga concepts without needing
 * a real backend. Each function:
 * 1. Simulates network latency with setTimeout
 * 2. Returns realistic data
 * 3. Sometimes randomly fails (to test error handling)
 * 
 * The sagas will use `call(fakeApiFunction, args)` to invoke these.
 * =============================================================================
 */

import {
    Task,
    User,
    Notification,
    CreateTaskPayload,
    UpdateTaskPayload,
    LoginCredentials,
} from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Simulate network delay
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a promise that resolves after a random delay.
 * This simulates real network latency.
 * 
 * @param min - Minimum delay in milliseconds
 * @param max - Maximum delay in milliseconds
 */
const simulateDelay = (min = 500, max = 1500): Promise<void> =>
    new Promise((resolve) =>
        setTimeout(resolve, Math.random() * (max - min) + min)
    );

/**
 * Randomly decides if a request should fail.
 * In real apps, failures come from the network/server.
 * Here we simulate them for teaching error handling in sagas.
 * 
 * @param failureRate - Probability of failure (0 to 1). Default 0.1 = 10%
 */
const maybeThrowError = (failureRate = 0.1): void => {
    if (Math.random() < failureRate) {
        throw new Error('Simulated API Error: Something went wrong on the server!');
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

/** In-memory task storage (acts like a database) */
let mockTasks: Task[] = [
    {
        id: '1',
        title: 'Complete Redux Saga Tutorial',
        description: 'Study all saga effects including takeEvery, takeLatest, fork, and cancel. Make sure to understand the watcher/worker pattern.',
        status: 'in-progress',
        priority: 'high',
        dueDate: '2026-02-20',
        createdAt: '2026-02-10T10:00:00Z',
        assignee: 'Alice Johnson',
        tags: ['study', 'redux'],
    },
    {
        id: '2',
        title: 'Build Portfolio Website',
        description: 'Design and develop a personal portfolio using Next.js and TypeScript. Include project showcases and contact form.',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-02-25',
        createdAt: '2026-02-11T14:30:00Z',
        assignee: 'Bob Smith',
        tags: ['project', 'web'],
    },
    {
        id: '3',
        title: 'Database Design Assignment',
        description: 'Create an ER diagram for the university library system. Include tables for books, students, and borrowing records.',
        status: 'todo',
        priority: 'high',
        dueDate: '2026-02-18',
        createdAt: '2026-02-12T09:00:00Z',
        assignee: 'Alice Johnson',
        tags: ['homework', 'database'],
    },
    {
        id: '4',
        title: 'React Hooks Practice',
        description: 'Complete 10 exercises on useEffect, useCallback, and useMemo. Focus on understanding dependency arrays.',
        status: 'done',
        priority: 'low',
        dueDate: '2026-02-15',
        createdAt: '2026-02-08T11:00:00Z',
        assignee: 'Carol White',
        tags: ['practice', 'react'],
    },
    {
        id: '5',
        title: 'Team Presentation Prep',
        description: 'Prepare slides for the agile methodology presentation. Cover Scrum, Kanban, and XP with real-world examples.',
        status: 'in-progress',
        priority: 'medium',
        dueDate: '2026-02-22',
        createdAt: '2026-02-13T16:00:00Z',
        assignee: 'Dave Brown',
        tags: ['presentation', 'teamwork'],
    },
    {
        id: '6',
        title: 'API Integration Lab',
        description: 'Connect the weather dashboard app to the OpenWeatherMap API. Handle loading states, errors, and data caching.',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-02-28',
        createdAt: '2026-02-14T08:00:00Z',
        assignee: 'Eve Davis',
        tags: ['lab', 'api'],
    },
];

/** The mock user returned after successful login */
const mockUser: User = {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@university.edu',
    avatar: '👩‍🎓',
    role: 'student',
    bio: 'Computer Science student passionate about web development and open source.',
    joinedAt: '2025-09-01T00:00:00Z',
};

/** Counter for generating unique IDs */
let nextId = 7;

/** Counter for notification IDs */
let notifId = 1;

// ─────────────────────────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simulates user login.
 * 
 * TEACHING NOTE:
 * In sagas, this will be called with: yield call(fakeLogin, credentials)
 * The saga will pause until this promise resolves or rejects.
 */
export const fakeLogin = async (credentials: LoginCredentials): Promise<User> => {
    console.log('🔑 [API] Login request received for:', credentials.email);
    await simulateDelay(800, 1200);

    // Simple validation — in reality this would check against a database
    if (credentials.email === 'alice@university.edu' && credentials.password === 'password123') {
        console.log('✅ [API] Login successful');
        return mockUser;
    }

    throw new Error('Invalid email or password. Try alice@university.edu / password123');
};

/**
 * Simulates user logout.
 */
export const fakeLogout = async (): Promise<void> => {
    console.log('🔒 [API] Logout request received');
    await simulateDelay(300, 500);
    console.log('✅ [API] Logout successful');
};

// ─────────────────────────────────────────────────────────────────────────────
// TASKS API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all tasks.
 * 
 * TEACHING NOTE:
 * The saga watching this uses `takeLatest` — if the user clicks
 * "Fetch Tasks" multiple times quickly, only the last request completes.
 */
export const fakeFetchTasks = async (): Promise<Task[]> => {
    console.log('📋 [API] Fetching tasks...');
    await simulateDelay(600, 1200);
    // No random error here — this fires on every page load.
    // Random failures on autoload discourage learning!
    console.log(`✅ [API] Fetched ${mockTasks.length} tasks`);
    return [...mockTasks]; // Return a copy to prevent direct mutation
};

/**
 * Creates a new task.
 */
export const fakeCreateTask = async (payload: CreateTaskPayload): Promise<Task> => {
    console.log('📝 [API] Creating task:', payload.title);
    await simulateDelay(500, 1000);
    maybeThrowError(0.05);

    const newTask: Task = {
        ...payload,
        id: String(nextId++),
        createdAt: new Date().toISOString(),
    };

    mockTasks.push(newTask);
    console.log('✅ [API] Task created with ID:', newTask.id);
    return newTask;
};

/**
 * Updates an existing task.
 */
export const fakeUpdateTask = async (payload: UpdateTaskPayload): Promise<Task> => {
    console.log('✏️ [API] Updating task:', payload.id);
    await simulateDelay(500, 1000);
    maybeThrowError(0.05);

    const index = mockTasks.findIndex((t) => t.id === payload.id);
    if (index === -1) {
        throw new Error(`Task with ID ${payload.id} not found`);
    }

    mockTasks[index] = { ...mockTasks[index], ...payload };
    console.log('✅ [API] Task updated:', mockTasks[index].title);
    return mockTasks[index];
};

/**
 * Deletes a task by ID.
 */
export const fakeDeleteTask = async (id: string): Promise<string> => {
    console.log('🗑️ [API] Deleting task:', id);
    await simulateDelay(400, 800);
    maybeThrowError(0.05);

    mockTasks = mockTasks.filter((t) => t.id !== id);
    console.log('✅ [API] Task deleted:', id);
    return id;
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches user profile.
 */
export const fakeFetchProfile = async (): Promise<User> => {
    console.log('👤 [API] Fetching profile...');
    await simulateDelay(500, 1000);
    maybeThrowError(0.05);
    console.log('✅ [API] Profile fetched');
    return { ...mockUser };
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches notifications. Returns new notifications each time
 * to simulate a live notification stream.
 * 
 * TEACHING NOTE:
 * This is called by the polling saga using fork + cancel pattern.
 * The saga will call this every few seconds in a loop.
 */
export const fakeFetchNotifications = async (): Promise<Notification[]> => {
    console.log('🔔 [API] Fetching notifications...');
    await simulateDelay(300, 600);

    // Generate a random notification
    const messages = [
        'New assignment posted in CS301',
        'Your task "Redux Saga Tutorial" is due soon',
        'Bob commented on your project',
        'Team meeting rescheduled to 3 PM',
        'Grade posted for Database Design',
        'Carol shared a new document with you',
        'System maintenance scheduled for tonight',
        'New course material available',
    ];

    const types: Array<'info' | 'warning' | 'success' | 'error'> = [
        'info', 'warning', 'success', 'info',
    ];

    const notification: Notification = {
        id: `notif-${notifId++}`,
        message: messages[Math.floor(Math.random() * messages.length)],
        type: types[Math.floor(Math.random() * types.length)],
        read: false,
        timestamp: new Date().toISOString(),
    };

    console.log('✅ [API] New notification:', notification.message);
    return [notification];
};

// ─────────────────────────────────────────────────────────────────────────────
// DRAFT SAVE API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simulates saving a draft to the server.
 * 
 * TEACHING NOTE:
 * This is used by the debounce saga. When the user types in the
 * task description, the saga waits 1 second after the user stops
 * typing before calling this function.
 */
export const fakeSaveDraft = async (
    draft: Partial<CreateTaskPayload>
): Promise<{ savedAt: string }> => {
    console.log('💾 [API] Saving draft...', draft.title || '(untitled)');
    await simulateDelay(300, 600);
    const savedAt = new Date().toISOString();
    console.log('✅ [API] Draft saved at:', savedAt);
    return { savedAt };
};

// ─────────────────────────────────────────────────────────────────────────────
// SLOW API (for race condition demo)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A deliberately slow API call used to demonstrate the `race` effect.
 * The saga will race this against a timeout — if this takes too long,
 * the timeout wins and the request is considered failed.
 */
export const fakeSlowApiCall = async (): Promise<string> => {
    console.log('🐢 [API] Slow API call started (may take 2-6 seconds)...');
    // Random delay between 2-6 seconds to make race results unpredictable
    await simulateDelay(2000, 6000);
    console.log('✅ [API] Slow API call completed');
    return 'Data from slow API call received successfully!';
};
