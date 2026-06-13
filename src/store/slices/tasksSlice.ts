/**
 * =============================================================================
 * TASKS SLICE
 * =============================================================================
 * 
 * Manages all task-related state including CRUD operations, draft auto-save,
 * throttle demo state, and race condition demo state.
 * 
 * TEACHING NOTE:
 * This is the most feature-rich slice because it supports multiple saga
 * demonstrations:
 * - Basic CRUD → tasksSaga (takeLatest, takeEvery, call, put, delay)
 * - Auto-save → autoSaveSaga (debounce)
 * - Spam prevention → throttleSaga (throttle)
 * - Competing requests → raceSaga (race)
 * =============================================================================
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TasksState, Task, CreateTaskPayload, UpdateTaskPayload } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────────────────────

const initialState: TasksState = {
    tasks: [],
    selectedTask: null,
    loading: false,
    error: null,
    // Draft auto-save state (used by debounce saga)
    draftTask: null,
    draftSaving: false,
    lastSavedAt: null,
    // Throttle demo state
    throttleCount: 0,
    throttleMessage: null,
    // Race demo state
    raceLoading: false,
    raceResult: null,
    raceError: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Slice Definition
// ─────────────────────────────────────────────────────────────────────────────

const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        // ── FETCH TASKS ──────────────────────────────────────────────────────

        /** Triggers task fetching saga (watched with takeLatest) */
        fetchTasksRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        /** Saga dispatches this after successful fetch */
        fetchTasksSuccess: (state, action: PayloadAction<Task[]>) => {
            state.tasks = action.payload;
            state.loading = false;
        },

        /** Saga dispatches this when fetch fails */
        fetchTasksFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // ── CREATE TASK ──────────────────────────────────────────────────────

        /** Triggers task creation saga */
        createTaskRequest: (state, _action: PayloadAction<CreateTaskPayload>) => {
            state.loading = true;
            state.error = null;
        },

        /** Saga dispatches this after successful creation */
        createTaskSuccess: (state, action: PayloadAction<Task>) => {
            state.tasks.push(action.payload);
            state.loading = false;
            // Clear draft after successful creation
            state.draftTask = null;
            state.lastSavedAt = null;
        },

        /** Saga dispatches this when creation fails */
        createTaskFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // ── UPDATE TASK ──────────────────────────────────────────────────────

        /** Triggers task update saga */
        updateTaskRequest: (state, _action: PayloadAction<UpdateTaskPayload>) => {
            state.loading = true;
            state.error = null;
        },

        /** Saga dispatches this after successful update */
        updateTaskSuccess: (state, action: PayloadAction<Task>) => {
            const index = state.tasks.findIndex((t) => t.id === action.payload.id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
            state.loading = false;
            // Update selected task if it's the one being edited
            if (state.selectedTask?.id === action.payload.id) {
                state.selectedTask = action.payload;
            }
        },

        /** Saga dispatches this when update fails */
        updateTaskFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // ── DELETE TASK ──────────────────────────────────────────────────────

        /** Triggers task deletion saga */
        deleteTaskRequest: (state, _action: PayloadAction<string>) => {
            state.loading = true;
            state.error = null;
        },

        /** Saga dispatches this after successful deletion */
        deleteTaskSuccess: (state, action: PayloadAction<string>) => {
            state.tasks = state.tasks.filter((t) => t.id !== action.payload);
            state.loading = false;
            // Clear selected task if it was deleted
            if (state.selectedTask?.id === action.payload) {
                state.selectedTask = null;
            }
        },

        /** Saga dispatches this when deletion fails */
        deleteTaskFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // ── SELECT TASK ──────────────────────────────────────────────────────

        /** Sets the currently selected/viewed task */
        setSelectedTask: (state, action: PayloadAction<Task | null>) => {
            state.selectedTask = action.payload;
        },

        // ── DRAFT AUTO-SAVE (Debounce Demo) ──────────────────────────────────

        /**
         * UPDATE DRAFT
         * Dispatched on every keystroke in the task form.
         * The debounce saga watches this — it waits 1 second after the
         * user stops typing before triggering the save.
         * 
         * TEACHING NOTE:
         * debounce(1000, updateDraft.type, handleAutoSave) means:
         * "Wait until 1000ms have passed since the last updateDraft action,
         *  then call handleAutoSave"
         */
        updateDraft: (state, action: PayloadAction<Partial<CreateTaskPayload>>) => {
            state.draftTask = { ...state.draftTask, ...action.payload };
        },

        /** Saga dispatches this when auto-save starts */
        saveDraftRequest: (state) => {
            state.draftSaving = true;
        },

        /** Saga dispatches this after successful auto-save */
        saveDraftSuccess: (state, action: PayloadAction<string>) => {
            state.draftSaving = false;
            state.lastSavedAt = action.payload;
        },

        /** Saga dispatches this when auto-save fails */
        saveDraftFailure: (state) => {
            state.draftSaving = false;
        },

        // ── THROTTLE DEMO ────────────────────────────────────────────────────

        /**
         * THROTTLED ACTION
         * The throttle saga watches this action.
         * Even if dispatched many times rapidly, the saga only processes
         * it once every 3 seconds.
         * 
         * TEACHING NOTE:
         * throttle(3000, throttledAction.type, handleThrottled) means:
         * "Process this action at most once every 3000ms, dropping
         *  any intermediate dispatches"
         */
        throttledAction: (state) => {
            state.throttleCount += 1;
        },

        /** Saga dispatches this to show the throttle result */
        throttledActionProcessed: (state, action: PayloadAction<string>) => {
            state.throttleMessage = action.payload;
        },

        // ── RACE DEMO ────────────────────────────────────────────────────────

        /**
         * RACE REQUEST
         * The race saga watches this. It races an API call against a timeout.
         * Whichever finishes first wins.
         * 
         * TEACHING NOTE:
         * race({ response: call(api), timeout: delay(3000) }) means:
         * "Start both the API call and a 3-second timer. If the API
         *  responds first, use that result. If the timer fires first,
         *  consider it a timeout."
         */
        raceRequest: (state) => {
            state.raceLoading = true;
            state.raceResult = null;
            state.raceError = null;
        },

        /** API call won the race */
        raceSuccess: (state, action: PayloadAction<string>) => {
            state.raceLoading = false;
            state.raceResult = action.payload;
        },

        /** Timeout won the race (or an error occurred) */
        raceFailure: (state, action: PayloadAction<string>) => {
            state.raceLoading = false;
            state.raceError = action.payload;
        },

        // ── CLEAR ERROR ──────────────────────────────────────────────────────

        /** Utility action to clear error messages */
        clearError: (state) => {
            state.error = null;
        },
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const {
    fetchTasksRequest,
    fetchTasksSuccess,
    fetchTasksFailure,
    createTaskRequest,
    createTaskSuccess,
    createTaskFailure,
    updateTaskRequest,
    updateTaskSuccess,
    updateTaskFailure,
    deleteTaskRequest,
    deleteTaskSuccess,
    deleteTaskFailure,
    setSelectedTask,
    updateDraft,
    saveDraftRequest,
    saveDraftSuccess,
    saveDraftFailure,
    throttledAction,
    throttledActionProcessed,
    raceRequest,
    raceSuccess,
    raceFailure,
    clearError,
} = tasksSlice.actions;

export default tasksSlice.reducer;
