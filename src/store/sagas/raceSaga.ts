/**
 * =============================================================================
 * RACE SAGA
 * =============================================================================
 * 
 * Demonstrates: race
 * 
 * CONCEPT EXPLAINED:
 * 
 * race({ key1: effect1, key2: effect2 }):
 * - Starts MULTIPLE effects simultaneously.
 * - The FIRST one to complete WINS; all others are automatically cancelled.
 * - Returns an object where the winning key has a value, and losing keys are undefined.
 * 
 * REAL-WORLD USE CASES:
 * 1. Request timeout: Race an API call against a timer.
 *    If the timer wins, the request is considered timed out.
 * 2. Cancel button: Race an API call against a user pressing "Cancel".
 * 3. Competing data sources: Fetch from 2 servers, use the first response.
 * 
 * EXAMPLE:
 *   const { response, timeout } = yield race({
 *     response: call(fetchData),     // API call
 *     timeout:  delay(3000),         // 3-second timer
 *   });
 *   
 *   if (response) { // API responded first }
 *   if (timeout)   { // Timer fired first — API was too slow! }
 * 
 * KEY INSIGHT:
 * race() is like Promise.race() in JavaScript, but integrated with
 * the saga cancellation system. The losing effects are properly
 * cancelled, not just ignored.
 * =============================================================================
 */

import { race, call, put, delay, takeLatest } from 'redux-saga/effects';
import { fakeSlowApiCall } from '@/services/api';
import {
    raceRequest,
    raceSuccess,
    raceFailure,
} from '@/store/slices/tasksSlice';

// ─────────────────────────────────────────────────────────────────────────────
// WORKER: Handle Race Request
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Worker saga that races an API call against a 3-second timeout.
 * The API call takes 2-6 seconds randomly, so sometimes it wins,
 * sometimes the timeout wins. This creates an unpredictable,
 * realistic demo.
 */
function* handleRaceRequest(): Generator {
    console.log('🔄 [RACE SAGA] Race started!');
    console.log('📌 [RACE SAGA] Racing: API call (2-6s) vs Timeout (3s)');
    console.log(
        '📌 [RACE SAGA] Whoever finishes first wins. The other is cancelled.'
    );

    try {
        // ┌─────────────────────────────────────────────────────────────────────┐
        // │ race({ ... })                                                       │
        // │                                                                     │
        // │ Two effects start simultaneously:                                   │
        // │ 1. call(fakeSlowApiCall) — takes 2-6 seconds randomly             │
        // │ 2. delay(3000) — always takes exactly 3 seconds                    │
        // │                                                                     │
        // │ Results:                                                            │
        // │ - If API finishes in < 3s: response has data, timeout is undefined │
        // │ - If API takes > 3s: timeout is true, response is undefined        │
        // │                                                                     │
        // │ The losing effect is CANCELLED automatically.                       │
        // └─────────────────────────────────────────────────────────────────────┘
        const result = (yield race({
            response: call(fakeSlowApiCall),
            timeout: delay(3000),
        })) as { response?: string; timeout?: boolean };

        if (result.response) {
            // The API call finished before the timeout
            console.log('🏆 [RACE SAGA] API WON the race!');
            console.log('📌 [RACE SAGA] The timeout was CANCELLED automatically');
            yield put(
                raceSuccess(`🏆 API won! Response: "${result.response}"`)
            );
        } else {
            // The timeout fired before the API call finished
            console.log('⏰ [RACE SAGA] TIMEOUT won the race!');
            console.log('📌 [RACE SAGA] The API call was CANCELLED automatically');
            yield put(
                raceFailure(
                    '⏰ Timeout! The API took longer than 3 seconds and was cancelled.'
                )
            );
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Race failed';
        console.warn('❌ [RACE SAGA] Race error:', message);
        yield put(raceFailure(message));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// WATCHER SAGA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Watcher for race demo requests.
 */
export function* watchRace(): Generator {
    console.log('👀 [RACE SAGA] Watcher started — listening for raceRequest');
    yield takeLatest(raceRequest.type, handleRaceRequest);
}
