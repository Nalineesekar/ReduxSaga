/**
 * =============================================================================
 * THROTTLE SAGA
 * =============================================================================
 * 
 * Demonstrates: throttle
 * 
 * CONCEPT EXPLAINED:
 * 
 * throttle(ms, actionType, workerSaga):
 * - Processes the action IMMEDIATELY when it first arrives.
 * - Then IGNORES all subsequent actions of the same type for `ms` milliseconds.
 * - After the window passes, the next action is processed again.
 * 
 * REAL-WORLD USE CASE:
 * Preventing spam clicking on a "Submit" button.
 * The first click is processed immediately, but additional clicks
 * within 3 seconds are ignored.
 * 
 * COMPARISON WITH DEBOUNCE:
 * - throttle: Processes FIRST action, then waits. "At most once per 3s."
 * - debounce: Waits for LAST action, then processes. "Wait until silence."
 * 
 * Timeline example (throttle 3000ms):
 *   User clicks: 0s  0.5s  1s  1.5s  2s  2.5s  3s  3.5s
 *   Processed:   ✅   ❌   ❌   ❌   ❌   ❌   ✅   ❌
 *   (Only 0s and 3s are processed because of the 3s throttle window)
 * =============================================================================
 */

import { throttle, put, delay } from 'redux-saga/effects';
import {
    throttledAction,
    throttledActionProcessed,
} from '@/store/slices/tasksSlice';

// ─────────────────────────────────────────────────────────────────────────────
// WORKER: Handle Throttled Action
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Worker that processes the throttled action.
 * This will only run at most once every 3 seconds, even if the
 * throttledAction is dispatched much more frequently.
 */
function* handleThrottledAction(): Generator {
    const now = new Date().toLocaleTimeString();
    console.log(`🔄 [THROTTLE SAGA] Action PROCESSED at ${now}`);
    console.log(
        '📌 [THROTTLE SAGA] Next action will be processed after 3-second cooldown'
    );

    // Simulate some work
    yield delay(200);

    yield put(
        throttledActionProcessed(
            `✅ Action processed at ${now}. Throttle window: 3 seconds.`
        )
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// WATCHER SAGA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Watcher using throttle effect.
 * 
 * TEACHING NOTE:
 * throttle(3000, throttledAction.type, handleThrottledAction) means:
 * "When throttledAction is dispatched, run handleThrottledAction.
 *  Then ignore any further throttledAction dispatches for 3000ms.
 *  After 3000ms, process the next one."
 * 
 * KEY DIFFERENCE FROM takeLatest:
 * - takeLatest: Cancels the previous worker and starts a new one
 * - throttle: Ignores new actions within the time window entirely
 */
export function* watchThrottle(): Generator {
    console.log(
        '👀 [THROTTLE SAGA] Watcher started — throttling actions (3000ms)'
    );

    yield throttle(3000, throttledAction.type, handleThrottledAction);
}
