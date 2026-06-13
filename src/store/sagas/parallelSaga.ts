/**
 * =============================================================================
 * PARALLEL SAGA (Fork, Spawn, All)
 * =============================================================================
 * 
 * Demonstrates: fork, spawn, all
 * 
 * CONCEPTS EXPLAINED:
 * 
 * 1. fork(saga) — Attached Fork:
 *    - Starts a saga in the background (non-blocking).
 *    - ATTACHED to parent: if the forked saga throws an error,
 *      the error propagates UP to the parent saga.
 *    - If the parent is cancelled, all forked children are cancelled too.
 *    - Use for: Tasks that are part of the same logical operation.
 * 
 * 2. spawn(saga) — Detached Fork:
 *    - Starts a saga in the background (non-blocking).
 *    - DETACHED from parent: if the spawned saga throws an error,
 *      the parent is NOT affected.
 *    - If the parent is cancelled, spawned children continue running.
 *    - Use for: Independent background tasks, logging, analytics.
 * 
 * 3. all([...effects]) — Parallel Execution:
 *    - Runs multiple effects simultaneously and waits for ALL to complete.
 *    - Similar to Promise.all().
 *    - If any effect fails, all others are cancelled.
 * 
 * COMPARISON TABLE:
 * ┌──────────┬─────────────┬──────────────┬──────────────────┐
 * │ Effect   │ Blocking?   │ Error Flow   │ Cancel Behavior  │
 * ├──────────┼─────────────┼──────────────┼──────────────────┤
 * │ call     │ Yes (waits) │ Propagates   │ Cancels with     │
 * │ fork     │ No          │ Propagates ↑ │ Cancels with     │
 * │ spawn    │ No          │ Isolated     │ Runs forever     │
 * │ all      │ Yes (all)   │ Cancels rest │ Cancels with     │
 * └──────────┴─────────────┴──────────────┴──────────────────┘
 * =============================================================================
 */

import { fork, spawn, all, call, put, delay, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
    fakeFetchTasks,
    fakeFetchProfile,
    fakeFetchNotifications,
} from '@/services/api';
import { fetchTasksSuccess, fetchTasksFailure } from '@/store/slices/tasksSlice';
import {
    fetchProfileRequest,
    fetchProfileSuccess,
    fetchProfileFailure,
} from '@/store/slices/profileSlice';
import {
    fetchNotificationsSuccess,
    fetchNotificationsFailure,
} from '@/store/slices/notificationsSlice';
import { Task, User, Notification } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Individual fetch workers (used by parallel loading)
// ─────────────────────────────────────────────────────────────────────────────

/** Fetches tasks (will be forked in parallel) */
function* fetchTasksInParallel(): Generator {
    console.log('  🔀 [PARALLEL] Fetching tasks (forked)...');
    try {
        const tasks = (yield call(fakeFetchTasks)) as Task[];
        yield put(fetchTasksSuccess(tasks));
        console.log(`  ✅ [PARALLEL] Tasks loaded: ${tasks.length}`);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Failed';
        yield put(fetchTasksFailure(msg));
    }
}

/** Fetches profile (will be forked in parallel) */
function* fetchProfileInParallel(): Generator {
    console.log('  🔀 [PARALLEL] Fetching profile (forked)...');
    try {
        const profile = (yield call(fakeFetchProfile)) as User;
        yield put(fetchProfileSuccess(profile));
        console.log(`  ✅ [PARALLEL] Profile loaded: ${profile.name}`);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Failed';
        yield put(fetchProfileFailure(msg));
    }
}

/** Fetches notifications (will be spawned — detached) */
function* fetchNotificationsInParallel(): Generator {
    console.log('  🔀 [PARALLEL] Fetching notifications (spawned)...');
    try {
        const notifs = (yield call(fakeFetchNotifications)) as Notification[];
        yield put(fetchNotificationsSuccess(notifs));
        console.log(`  ✅ [PARALLEL] Notifications loaded: ${notifs.length}`);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Failed';
        yield put(fetchNotificationsFailure(msg));
        // This error is ISOLATED because we used spawn()
        // The parent saga is NOT affected!
        console.log(
            '  📌 [PARALLEL] Error is isolated — spawned tasks don\'t crash the parent'
        );
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKER: Load Dashboard Data in Parallel
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Loads all dashboard data in parallel using fork and spawn.
 * 
 * TEACHING NOTE:
 * This demonstrates the difference between fork and spawn:
 * - Tasks & Profile use fork() — they're critical data. If they fail,
 *   we want the error to propagate up so we can show an error state.
 * - Notifications use spawn() — they're nice-to-have. If they fail,
 *   we don't want to break the whole dashboard.
 */
function* handleParallelLoad(): Generator {
    console.log('🔄 [PARALLEL SAGA] Loading dashboard data in parallel...');

    // ┌─────────────────────────────────────────────────────────────────────┐
    // │ fork() — Attached Fork                                              │
    // │ These tasks run in parallel. If any of them throws an error,        │
    // │ it propagates to this parent saga.                                   │
    // └─────────────────────────────────────────────────────────────────────┘
    console.log('📌 [PARALLEL] Using fork() for tasks and profile (attached)');
    yield fork(fetchTasksInParallel);
    yield fork(fetchProfileInParallel);

    // ┌─────────────────────────────────────────────────────────────────────┐
    // │ spawn() — Detached Fork                                             │
    // │ This task runs independently. Errors do NOT propagate up.           │
    // │ Even if this fails, the dashboard still loads.                      │
    // └─────────────────────────────────────────────────────────────────────┘
    console.log('📌 [PARALLEL] Using spawn() for notifications (detached)');
    yield spawn(fetchNotificationsInParallel);

    console.log('📌 [PARALLEL] All three fetches started concurrently!');
    console.log('📌 [PARALLEL] fork() returns immediately — we reach here instantly');
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKER: Load Data Using all() — Waits for ALL to Complete
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Alternative approach using all([...effects]).
 * Unlike fork/spawn, all() BLOCKS until every effect completes.
 * 
 * TEACHING NOTE:
 * all() is like Promise.all():
 * - Starts all effects in parallel
 * - Waits for ALL of them to finish
 * - If any fails, the rest are cancelled
 * 
 * Use all() when you need ALL results before proceeding.
 * Use fork() when you want fire-and-forget parallel execution.
 */
function* handleAllLoad(): Generator {
    console.log('🔄 [PARALLEL SAGA] Loading with all() — waiting for ALL to complete');

    try {
        // all() starts all three calls simultaneously and waits for all results
        const [tasks, profile, notifications] = (yield all([
            call(fakeFetchTasks),
            call(fakeFetchProfile),
            call(fakeFetchNotifications),
        ])) as [Task[], User, Notification[]];

        console.log('✅ [PARALLEL SAGA] ALL data loaded simultaneously!');
        console.log(`   Tasks: ${tasks.length}, Profile: ${profile.name}, Notifs: ${notifications.length}`);

        yield put(fetchTasksSuccess(tasks));
        yield put(fetchProfileSuccess(profile));
        yield put(fetchNotificationsSuccess(notifications));
    } catch (error: unknown) {
        console.warn('❌ [PARALLEL SAGA] all() failed — one of the calls errored');
        console.log('📌 [PARALLEL SAGA] When all() fails, remaining effects are cancelled');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Background Logger (Spawn demo — long-running detached task)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A spawned background logger that runs independently.
 * Even if the main saga is cancelled, this keeps running.
 * 
 * TEACHING NOTE:
 * spawn() is perfect for background tasks that should outlive their parent:
 * - Analytics tracking
 * - Error reporting
 * - Logging
 */
function* backgroundLogger(): Generator {
    console.log('🔄 [SPAWN DEMO] Background logger started (detached)');
    yield delay(2000);
    console.log(
        '✅ [SPAWN DEMO] Background logger still running after 2s (detached from parent)'
    );
    yield delay(2000);
    console.log(
        '✅ [SPAWN DEMO] Background logger finished after 4s — completely independent!'
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// WATCHER SAGA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Watcher for parallel loading demos.
 * Listens for 'parallel/loadDashboard' or 'parallel/loadAll' action types.
 */
export function* watchParallel(): Generator {
    console.log('👀 [PARALLEL SAGA] Watcher started');

    yield takeLatest('parallel/loadDashboard', function* () {
        // Also spawn the background logger to show spawn independence
        yield spawn(backgroundLogger);
        yield* handleParallelLoad() as Generator;
    });

    yield takeLatest('parallel/loadAll', function* () {
        yield* handleAllLoad() as Generator;
    });

    // Separate listener for dashboard page load
    yield takeLatest(fetchProfileRequest.type, function* () {
        try {
            const profile = (yield call(fakeFetchProfile)) as User;
            yield put(fetchProfileSuccess(profile));
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed';
            yield put(fetchProfileFailure(msg));
        }
    });
}
