/**
 * =============================================================================
 * AUTH SAGA
 * =============================================================================
 * 
 * Demonstrates: takeLatest, call, put, select
 * 
 * CONCEPTS EXPLAINED:
 * 
 * 1. WATCHER/WORKER PATTERN:
 *    - watchAuth() is the WATCHER — it listens for specific actions
 *    - handleLogin() and handleLogout() are WORKERS — they do the actual work
 *    
 * 2. takeLatest:
 *    - If the user clicks "Login" multiple times, only the LATEST click
 *      is processed. Previous pending login attempts are automatically cancelled.
 *    - This prevents duplicate requests.
 * 
 * 3. call(fn, ...args):
 *    - Calls an async function and WAITS for it to resolve.
 *    - The saga pauses at this line until the promise resolves/rejects.
 *    - This is how sagas handle async operations synchronously.
 * 
 * 4. put(action):
 *    - Dispatches a Redux action from within the saga.
 *    - Equivalent to dispatch(action) but used inside generators.
 * 
 * 5. select(selector):
 *    - Reads data from the Redux store inside a saga.
 *    - Similar to useSelector but for sagas.
 * =============================================================================
 */

import { call, put, select, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { LoginCredentials, User } from '@/types';
import { fakeLogin, fakeLogout } from '@/services/api';
import {
    loginRequest,
    loginSuccess,
    loginFailure,
    logoutRequest,
    logoutSuccess,
} from '@/store/slices/authSlice';

// ─────────────────────────────────────────────────────────────────────────────
// WORKER SAGA: Handle Login
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Worker saga that handles the login process.
 * 
 * TEACHING NOTE — Generator Function Syntax:
 * Sagas use generator functions (function*). The `yield` keyword
 * pauses execution until the yielded effect completes.
 * Think of it like async/await but for Redux side effects.
 * 
 * Flow:
 * 1. Extract credentials from the action payload
 * 2. Call the fake login API (saga pauses here)
 * 3. On success: dispatch loginSuccess with user data
 * 4. On failure: dispatch loginFailure with error message
 */
function* handleLogin(action: PayloadAction<LoginCredentials>): Generator {
    console.log('🔄 [AUTH SAGA] handleLogin worker started');
    console.log('📌 [AUTH SAGA] Using "call" effect to invoke fakeLogin API...');

    try {
        // ┌─────────────────────────────────────────────────────────────────────┐
        // │ call(fn, ...args)                                                  │
        // │ Calls fakeLogin and WAITS for the promise to resolve.              │
        // │ The saga is paused here — no other code in this worker runs        │
        // │ until fakeLogin resolves or rejects.                               │
        // └─────────────────────────────────────────────────────────────────────┘
        const user: User = (yield call(fakeLogin, action.payload)) as User;

        console.log('✅ [AUTH SAGA] Login successful, dispatching loginSuccess');

        // ┌─────────────────────────────────────────────────────────────────────┐
        // │ put(action)                                                        │
        // │ Dispatches the loginSuccess action to the Redux store.             │
        // │ The auth reducer will update state with the user data.             │
        // └─────────────────────────────────────────────────────────────────────┘
        yield put(loginSuccess(user));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Login failed';
        console.warn('❌ [AUTH SAGA] Login failed:', message);
        yield put(loginFailure(message));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKER SAGA: Handle Logout
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Worker saga that handles logout.
 * Demonstrates the `select` effect to read current state before logging out.
 */
function* handleLogout(): Generator {
    console.log('🔄 [AUTH SAGA] handleLogout worker started');

    // ┌─────────────────────────────────────────────────────────────────────┐
    // │ select(selector)                                                    │
    // │ Reads the current Redux state. Here we read the auth state           │
    // │ to log who is being logged out — demonstrating that sagas           │
    // │ can access any part of the store.                                    │
    // └─────────────────────────────────────────────────────────────────────┘
    const currentUser = (yield select(
        (state: { auth: { user: User | null } }) => state.auth.user
    )) as User | null;

    console.log(
        `📌 [AUTH SAGA] Using "select" to read current user: ${currentUser?.name ?? 'unknown'}`
    );
    console.log('📌 [AUTH SAGA] Calling fakeLogout API...');

    try {
        yield call(fakeLogout);
        console.log('✅ [AUTH SAGA] Logout successful');
        yield put(logoutSuccess());
    } catch (error: unknown) {
        // Even if logout API fails, we still log the user out locally
        console.warn('⚠️ [AUTH SAGA] Logout API failed, logging out locally');
        yield put(logoutSuccess());
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// WATCHER SAGA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Watcher saga for authentication actions.
 * 
 * TEACHING NOTE — Watcher Pattern:
 * The watcher saga sits in the background and listens for specific
 * action types. When it sees one, it spawns the appropriate worker.
 * 
 * takeLatest vs takeEvery:
 * - takeLatest: If a new action arrives while the worker is still running,
 *   the previous worker is CANCELLED and a new one starts.
 *   Best for: fetching data, login (where only the latest matters).
 * - takeEvery: Every dispatched action gets its own worker instance.
 *   Workers run in parallel and are NOT cancelled.
 *   Best for: tracking analytics, logging.
 */
export function* watchAuth(): Generator {
    console.log('👀 [AUTH SAGA] Watcher started — listening for auth actions');

    // takeLatest ensures only the most recent login attempt is processed
    yield takeLatest(loginRequest.type, handleLogin);
    yield takeLatest(logoutRequest.type, handleLogout);
}
