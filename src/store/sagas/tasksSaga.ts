/**
 * =============================================================================
 * TASKS SAGA
 * =============================================================================
 * 
 * Demonstrates: takeLatest, takeEvery, call, put, delay
 * 
 * CONCEPTS EXPLAINED:
 * 
 * 1. takeLatest (for fetching):
 *    Only the latest fetch request matters. If user clicks "Refresh"
 *    3 times quickly, only the 3rd request completes.
 * 
 * 2. takeEvery (for CRUD):
 *    Every create/update/delete request should be processed.
 *    We don't want to skip any of these operations.
 * 
 * 3. delay(ms):
 *    Pauses the saga for a given time. Useful for:
 *    - Artificial delays to show loading states
 *    - Implementing debounce-like behavior manually
 *    - Delaying notifications
 * 
 * 4. Watcher/Worker pattern:
 *    watchTasks() is the watcher, all handle* functions are workers.
 * =============================================================================
 */

import { call, put, takeLatest, takeEvery, delay } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types';
import {
    fakeFetchTasks,
    fakeCreateTask,
    fakeUpdateTask,
    fakeDeleteTask,
} from '@/services/api';
import {
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
} from '@/store/slices/tasksSlice';

// ─────────────────────────────────────────────────────────────────────────────
// WORKER: Fetch Tasks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all tasks from the API.
 * 
 * TEACHING NOTE:
 * This worker is paired with takeLatest in the watcher.
 * If the user triggers this 5 times in a row, only the LAST one
 * produces a result in the store. The previous 4 are cancelled.
 */
function* handleFetchTasks(): Generator {
    console.log('🔄 [TASKS SAGA] Fetching tasks...');
    console.log('📌 [TASKS SAGA] This uses takeLatest — rapid calls cancel previous ones');

    try {
        // ┌─────────────────────────────────────────────────────────────────────┐
        // │ delay(ms)                                                          │
        // │ Pauses the saga for the given milliseconds.                        │
        // │ Here we add a small delay so users can see the loading spinner.    │
        // └─────────────────────────────────────────────────────────────────────┘
        yield delay(300); // Brief delay to ensure loading UI is visible

        const tasks: Task[] = (yield call(fakeFetchTasks)) as Task[];
        console.log(`✅ [TASKS SAGA] Fetched ${tasks.length} tasks`);
        yield put(fetchTasksSuccess(tasks));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch tasks';
        console.warn('❌ [TASKS SAGA] Fetch failed:', message);
        yield put(fetchTasksFailure(message));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKER: Create Task
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a new task.
 * 
 * TEACHING NOTE:
 * This worker is paired with takeEvery — every create request gets
 * its own worker. We don't want to skip task creation!
 */
function* handleCreateTask(
    action: PayloadAction<CreateTaskPayload>
): Generator {
    console.log('🔄 [TASKS SAGA] Creating task:', action.payload.title);
    console.log('📌 [TASKS SAGA] This uses takeEvery — every request is processed');

    try {
        const newTask: Task = (yield call(fakeCreateTask, action.payload)) as Task;
        console.log('✅ [TASKS SAGA] Task created:', newTask.id);
        yield put(createTaskSuccess(newTask));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create task';
        console.warn('❌ [TASKS SAGA] Create failed:', message);
        yield put(createTaskFailure(message));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKER: Update Task
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates an existing task.
 */
function* handleUpdateTask(
    action: PayloadAction<UpdateTaskPayload>
): Generator {
    console.log('🔄 [TASKS SAGA] Updating task:', action.payload.id);

    try {
        const updated: Task = (yield call(fakeUpdateTask, action.payload)) as Task;
        console.log('✅ [TASKS SAGA] Task updated:', updated.title);
        yield put(updateTaskSuccess(updated));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to update task';
        console.warn('❌ [TASKS SAGA] Update failed:', message);
        yield put(updateTaskFailure(message));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKER: Delete Task
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deletes a task by ID.
 */
function* handleDeleteTask(action: PayloadAction<string>): Generator {
    console.log('🔄 [TASKS SAGA] Deleting task:', action.payload);

    try {
        yield call(fakeDeleteTask, action.payload);
        console.log('✅ [TASKS SAGA] Task deleted:', action.payload);
        yield put(deleteTaskSuccess(action.payload));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to delete task';
        console.warn('❌ [TASKS SAGA] Delete failed:', message);
        yield put(deleteTaskFailure(message));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// WATCHER SAGA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Watcher saga for task-related actions.
 * 
 * TEACHING NOTE — takeLatest vs takeEvery comparison:
 * 
 * fetchTasks uses takeLatest because:
 *   - Fetching is idempotent (same result each time)
 *   - Only the latest data matters
 *   - Prevents unnecessary API calls
 * 
 * CRUD operations use takeEvery because:
 *   - Each create/update/delete is a unique operation
 *   - We don't want to skip any of them
 *   - Each operation changes server state
 */
export function* watchTasks(): Generator {
    console.log('👀 [TASKS SAGA] Watcher started — listening for task actions');

    // takeLatest for fetch — only latest request matters
    yield takeLatest(fetchTasksRequest.type, handleFetchTasks);

    // takeEvery for CRUD — every request should be processed
    yield takeEvery(createTaskRequest.type, handleCreateTask);
    yield takeEvery(updateTaskRequest.type, handleUpdateTask);
    yield takeEvery(deleteTaskRequest.type, handleDeleteTask);
}
