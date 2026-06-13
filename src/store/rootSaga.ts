/**
 * =============================================================================
 * ROOT SAGA
 * =============================================================================
 * 
 * The root saga is the entry point for all sagas in the application.
 * It starts all watcher sagas in parallel using all() + fork().
 * 
 * TEACHING NOTE:
 * 
 * Why use all([fork(watcher1), fork(watcher2), ...]) ?
 * 
 * 1. fork() starts each watcher in the background (non-blocking)
 * 2. all() ensures they all start together
 * 3. Each watcher runs independently, listening for its own actions
 * 
 * Think of it as starting multiple "listeners" that each handle
 * different parts of the application:
 * - Auth saga listens for login/logout
 * - Tasks saga listens for CRUD operations
 * - Auto-save saga listens for draft changes
 * - Throttle saga listens for rapid-fire actions
 * - Notifications saga listens for polling start/stop
 * - Race saga listens for race demo triggers
 * - Parallel saga listens for parallel load triggers
 * 
 * ┌──────────────────────────────────────────────────────────┐
 * │                     Root Saga                            │
 * │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
 * │  │ Auth     │ │ Tasks    │ │ AutoSave │ │ Throttle │  │
 * │  │ Watcher  │ │ Watcher  │ │ Watcher  │ │ Watcher  │  │
 * │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
 * │  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
 * │  │ Notifs   │ │ Race     │ │ Parallel │               │
 * │  │ Watcher  │ │ Watcher  │ │ Watcher  │               │
 * │  └──────────┘ └──────────┘ └──────────┘               │
 * └──────────────────────────────────────────────────────────┘
 * =============================================================================
 */

import { all, fork } from 'redux-saga/effects';
import { watchAuth } from './sagas/authSaga';
import { watchTasks } from './sagas/tasksSaga';
import { watchAutoSave } from './sagas/autoSaveSaga';
import { watchThrottle } from './sagas/throttleSaga';
import { watchNotifications } from './sagas/notificationsSaga';
import { watchRace } from './sagas/raceSaga';
import { watchParallel } from './sagas/parallelSaga';

/**
 * Root saga — combines all watcher sagas.
 * This is passed to sagaMiddleware.run() in the store configuration.
 */
export default function* rootSaga(): Generator {
    console.log('🚀 [ROOT SAGA] Starting all watcher sagas...');

    yield all([
        fork(watchAuth),
        fork(watchTasks),
        fork(watchAutoSave),
        fork(watchThrottle),
        fork(watchNotifications),
        fork(watchRace),
        fork(watchParallel),
    ]);

    console.log('✅ [ROOT SAGA] All watchers are now running');
}
