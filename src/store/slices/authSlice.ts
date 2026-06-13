/**
 * =============================================================================
 * AUTH SLICE
 * =============================================================================
 * 
 * Manages authentication state using Redux Toolkit's createSlice.
 * 
 * TEACHING NOTE:
 * - createSlice automatically generates action creators and action types
 * - The reducers use Immer internally, so we can write "mutating" code
 *   that actually produces immutable updates
 * - We define request/success/failure patterns for async operations
 *   that the sagas will dispatch
 * =============================================================================
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginCredentials } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────────────────────

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Slice Definition
// ─────────────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /**
         * LOGIN REQUEST
         * Dispatched by the UI when user submits the login form.
         * The auth saga watches for this action.
         * 
         * TEACHING NOTE:
         * The payload (LoginCredentials) is used by the saga to call the API,
         * but the reducer only cares about setting loading state.
         * This is the "request" part of the request/success/failure pattern.
         */
        loginRequest: (state, _action: PayloadAction<LoginCredentials>) => {
            state.loading = true;
            state.error = null;
        },

        /**
         * LOGIN SUCCESS
         * Dispatched by the saga after successful API call.
         * Contains the authenticated user data.
         */
        loginSuccess: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
        },

        /**
         * LOGIN FAILURE
         * Dispatched by the saga when login fails.
         * Contains the error message string.
         */
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
            state.user = null;
        },

        /**
         * LOGOUT REQUEST
         * Dispatched by the UI when user clicks logout.
         * The saga watches for this action.
         */
        logoutRequest: (state) => {
            state.loading = true;
        },

        /**
         * LOGOUT SUCCESS
         * Dispatched by the saga after successful logout.
         * Resets auth state back to initial.
         */
        logoutSuccess: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Export actions and reducer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TEACHING NOTE:
 * createSlice auto-generates action creators that match the reducer names.
 * For example, authSlice.actions.loginRequest(credentials) creates:
 * { type: 'auth/loginRequest', payload: { email: '...', password: '...' } }
 * 
 * The saga watches for these action types using:
 * yield takeLatest(loginRequest.type, handleLoginSaga)
 */
export const {
    loginRequest,
    loginSuccess,
    loginFailure,
    logoutRequest,
    logoutSuccess,
} = authSlice.actions;

export default authSlice.reducer;
