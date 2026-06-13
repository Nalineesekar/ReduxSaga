/**
 * =============================================================================
 * REDUX STORE CONFIGURATION
 * =============================================================================
 * 
 * Sets up the Redux store with:
 * 1. Redux Toolkit's configureStore
 * 2. Redux Saga middleware
 * 3. Combined reducers from all slices
 * 4. Typed hooks for use in components
 * 
 * TEACHING NOTE:
 * 
 * The store setup process:
 * 1. Create the saga middleware instance
 * 2. Pass it to configureStore's middleware option
 * 3. After the store is created, run the root saga
 * 
 * IMPORTANT: sagaMiddleware.run(rootSaga) must be called AFTER
 * the store is created, not before!
 * 
 * ┌─────────────────────────────────────────────┐
 * │  configureStore({                           │
 * │    reducer: { auth, tasks, ... },           │
 * │    middleware: [...defaults, sagaMiddleware] │
 * │  })                                         │
 * │       ↓                                     │
 * │  sagaMiddleware.run(rootSaga)               │
 * │       ↓                                     │
 * │  All watcher sagas start listening           │
 * └─────────────────────────────────────────────┘
 * =============================================================================
 */

import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import rootSaga from './rootSaga';

// Import all slice reducers
import authReducer from './slices/authSlice';
import tasksReducer from './slices/tasksSlice';
import notificationsReducer from './slices/notificationsSlice';
import profileReducer from './slices/profileSlice';

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Create the saga middleware
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TEACHING NOTE:
 * createSagaMiddleware() creates a Redux middleware that connects
 * the Redux store to the saga execution environment.
 * It intercepts dispatched actions and forwards them to running sagas.
 */
const sagaMiddleware = createSagaMiddleware();

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Configure the store
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TEACHING NOTE:
 * configureStore from Redux Toolkit:
 * - Automatically sets up the Redux DevTools extension
 * - Includes redux-thunk by default (we add saga alongside it)
 * - Automatically calls combineReducers for us
 * 
 * We must disable the serializableCheck for saga actions because
 * saga Tasks are not serializable objects.
 */
export const store = configureStore({
    reducer: {
        auth: authReducer,
        tasks: tasksReducer,
        notifications: notificationsReducer,
        profile: profileReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            // Saga middleware passes non-serializable values (like Task objects)
            // so we need to disable this check
            serializableCheck: false,
        }).concat(sagaMiddleware),
});

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Run the root saga
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TEACHING NOTE:
 * sagaMiddleware.run() starts the root saga.
 * This must happen AFTER the store is created because sagas
 * need access to the store's dispatch and getState functions.
 * The root saga then forks all watcher sagas.
 */
sagaMiddleware.run(rootSaga);

// ─────────────────────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TEACHING NOTE:
 * These types enable full TypeScript support throughout the app:
 * - RootState: Type of the entire Redux state tree
 * - AppDispatch: Type of the dispatch function
 * 
 * Used with typed hooks below for type-safe Redux usage in components.
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ─────────────────────────────────────────────────────────────────────────────
// Typed Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TEACHING NOTE:
 * Custom typed hooks provide type safety when using Redux in components.
 * Instead of:
 *   const dispatch = useDispatch()           // untyped
 *   const tasks = useSelector(state => ...)  // state is 'any'
 * Use:
 *   const dispatch = useAppDispatch()        // knows about our actions
 *   const tasks = useAppSelector(s => ...)   // s is typed as RootState
 */
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
