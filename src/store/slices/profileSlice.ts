/**
 * =============================================================================
 * PROFILE SLICE
 * =============================================================================
 * 
 * Manages user profile state.
 * 
 * TEACHING NOTE:
 * This is a simpler slice demonstrating the standard async pattern.
 * It's also used by the parallel saga (all/fork) to load data
 * alongside tasks and notifications simultaneously.
 * =============================================================================
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProfileState, User } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────────────────────

const initialState: ProfileState = {
    profile: null,
    loading: false,
    error: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Slice Definition
// ─────────────────────────────────────────────────────────────────────────────

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        /** Triggers profile fetch saga */
        fetchProfileRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        /** Saga dispatches after successful profile fetch */
        fetchProfileSuccess: (state, action: PayloadAction<User>) => {
            state.profile = action.payload;
            state.loading = false;
        },

        /** Saga dispatches when profile fetch fails */
        fetchProfileFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const {
    fetchProfileRequest,
    fetchProfileSuccess,
    fetchProfileFailure,
} = profileSlice.actions;

export default profileSlice.reducer;
