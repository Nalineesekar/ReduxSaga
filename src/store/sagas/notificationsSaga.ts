/**
 * =============================================================================
 * NOTIFICATIONS SAGA (Fork, Cancel, Cancelled)
 * =============================================================================
 * 
 * Demonstrates: fork, cancel, cancelled, take
 * 
 * CONCEPTS EXPLAINED:
 * 
 * 1. fork(saga):
 *    - Starts a saga in the background (non-blocking).
 *    - Returns a Task object that can be cancelled later.
 *    - The parent saga continues immediately without waiting.
 *    - "Attached fork" — errors propagate to parent.
 * 
 * 2. cancel(task):
 *    - Cancels a previously forked task.
 *    - The forked saga receives a cancellation signal.
 *    - Any pending effects (call, delay) in the forked saga are cancelled.
 * 
 * 3. cancelled():
 *    - Returns true if the saga was cancelled.
 *    - Used in a finally block to detect cancellation and clean up.
 *    - Essential for cleanup logic (closing connections, logging, etc.)
 * 
 * 4. take(actionType):
 *    - Waits for a SINGLE action of the given type.
 *    - Unlike takeEvery/takeLatest, take() blocks until the action arrives.
 *    - Used here for precise control flow in the start/stop polling pattern.
 * 
 * PATTERN: Background Polling with Fork/Cancel
 * 
 *   ┌────────────────────────────────────────────────────┐
 *   │  User clicks "Start Polling"                       │
 *   │     ↓                                              │
 *   │  take(startPolling) ← blocks until action arrives  │
 *   │     ↓                                              │
 *   │  fork(pollNotifications) ← starts background loop  │
 *   │     ↓                                              │
 *   │  take(stopPolling) ← blocks until stop action      │
 *   │     ↓                                              │
 *   │  cancel(pollingTask) ← stops the background loop   │
 *   │     ↓                                              │
 *   │  Back to top of while(true) loop                   │
 *   └────────────────────────────────────────────────────┘
 * =============================================================================
 */

import {
    fork,
    cancel,
    cancelled,
    take,
    call,
    put,
    delay,
} from 'redux-saga/effects';
import type { Task as SagaTask } from 'redux-saga';
import { fakeFetchNotifications } from '@/services/api';
import {
    startPolling,
    stopPolling,
    fetchNotificationsSuccess,
    fetchNotificationsFailure,
} from '@/store/slices/notificationsSlice';
import { Notification } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// WORKER: Poll Notifications (Background Task)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Background polling worker that runs in a loop until cancelled.
 * 
 * TEACHING NOTE:
 * This saga runs as a "background task" via fork().
 * It loops forever (while(true)) fetching notifications every 5 seconds.
 * When the user clicks "Stop Polling", this task is cancelled.
 * The `finally` block with `cancelled()` check handles cleanup.
 */
function* pollNotifications(): Generator {
    console.log('🔄 [NOTIFICATION SAGA] Polling worker STARTED');
    console.log('📌 [NOTIFICATION SAGA] Will fetch every 5 seconds until cancelled');

    try {
        while (true) {
            try {
                // Fetch new notifications from the API
                const notifications = (yield call(
                    fakeFetchNotifications
                )) as Notification[];
                yield put(fetchNotificationsSuccess(notifications));
                console.log(
                    '🔔 [NOTIFICATION SAGA] New notifications received, waiting 5s...'
                );
            } catch (error: unknown) {
                const message =
                    error instanceof Error ? error.message : 'Polling error';
                console.warn('❌ [NOTIFICATION SAGA] Poll error:', message);
                yield put(fetchNotificationsFailure(message));
                // Continue polling despite errors (resilient background task)
            }

            // ┌─────────────────────────────────────────────────────────────────┐
            // │ delay(5000)                                                     │
            // │ Wait 5 seconds before the next poll.                            │
            // │ If the task is cancelled during this wait, the delay is         │
            // │ interrupted and we jump to the finally block.                   │
            // └─────────────────────────────────────────────────────────────────┘
            yield delay(5000);
        }
    } finally {
        // ┌─────────────────────────────────────────────────────────────────────┐
        // │ cancelled()                                                        │
        // │ Returns true if this saga was cancelled (via cancel(task)).        │
        // │ This is the place to do cleanup: close WebSockets, clear timers,  │
        // │ log that polling has stopped, etc.                                 │
        // └─────────────────────────────────────────────────────────────────────┘
        const wasCancelled: boolean = (yield cancelled()) as boolean;
        if (wasCancelled) {
            console.log('🛑 [NOTIFICATION SAGA] Polling was CANCELLED');
            console.log(
                '📌 [NOTIFICATION SAGA] cancelled() returned true — cleanup complete'
            );
        } else {
            console.log('🏁 [NOTIFICATION SAGA] Polling ended naturally');
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// WATCHER SAGA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Watcher for notification polling lifecycle.
 * 
 * TEACHING NOTE:
 * Instead of using takeEvery/takeLatest, we use take() in a while(true)
 * loop for precise control over the fork/cancel lifecycle.
 * 
 * This pattern is ideal for "start/stop" scenarios like:
 * - Background polling
 * - WebSocket connections
 * - File watchers
 * - Any long-running background process
 */
export function* watchNotifications(): Generator {
    console.log(
        '👀 [NOTIFICATION SAGA] Watcher started — waiting for startPolling'
    );

    while (true) {
        // Wait until startPolling action is dispatched
        yield take(startPolling.type);
        console.log('▶️ [NOTIFICATION SAGA] startPolling received');

        // ┌─────────────────────────────────────────────────────────────────────┐
        // │ fork(saga)                                                          │
        // │ Starts pollNotifications in the background.                         │
        // │ fork() returns immediately — the parent saga continues              │
        // │ to the next line (take(stopPolling)) without waiting.               │
        // │ The returned task object can be used to cancel the forked saga.     │
        // └─────────────────────────────────────────────────────────────────────┘
        const pollingTask: SagaTask = (yield fork(
            pollNotifications
        )) as SagaTask;
        console.log('📌 [NOTIFICATION SAGA] Background task forked');

        // Wait until stopPolling action is dispatched
        yield take(stopPolling.type);
        console.log('⏹️ [NOTIFICATION SAGA] stopPolling received');

        // ┌─────────────────────────────────────────────────────────────────────┐
        // │ cancel(task)                                                        │
        // │ Cancels the forked polling task.                                    │
        // │ This triggers the finally block in pollNotifications,              │
        // │ where cancelled() will return true.                                │
        // └─────────────────────────────────────────────────────────────────────┘
        yield cancel(pollingTask);
        console.log('📌 [NOTIFICATION SAGA] Polling task cancelled');
    }
}
