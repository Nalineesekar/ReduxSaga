/**
 * =============================================================================
 * NOTIFICATIONS SLICE
 * =============================================================================
 * 
 * Manages notification state and background polling status.
 * 
 * TEACHING NOTE:
 * The polling state (polling: boolean) is controlled by the saga.
 * When the user clicks "Start Polling", the saga forks a background task.
 * When they click "Stop Polling", the saga cancels that forked task.
 * This demonstrates: fork, cancel, cancelled, take
 * =============================================================================
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationsState, Notification } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────────────────────

const initialState: NotificationsState = {
    notifications: [],
    polling: false,
    pollingError: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Slice Definition
// ─────────────────────────────────────────────────────────────────────────────

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        /**
         * START POLLING
         * Dispatched by UI. The notification saga watches for this
         * and forks a background polling task.
         * 
         * TEACHING NOTE:
         * This action is watched using `take(startPolling.type)` in
         * a while(true) loop, not takeEvery/takeLatest. This gives us
         * fine-grained control over the fork/cancel lifecycle.
         */
        startPolling: (state) => {
            state.polling = true;
            state.pollingError = null;
        },

        /**
         * STOP POLLING
         * Dispatched by UI. The saga catches this with `take(stopPolling.type)`
         * and then cancels the forked polling task.
         */
        stopPolling: (state) => {
            state.polling = false;
        },

        /**
         * FETCH NOTIFICATIONS SUCCESS
         * Dispatched by the polling saga worker each time it successfully
         * fetches new notifications from the API.
         */
        fetchNotificationsSuccess: (state, action: PayloadAction<Notification[]>) => {
            // Prepend new notifications to the beginning of the list
            state.notifications = [...action.payload, ...state.notifications];
            state.pollingError = null;
        },

        /**
         * FETCH NOTIFICATIONS FAILURE
         * Dispatched by the polling saga if an API call fails.
         * Polling continues despite errors (resilient background task).
         */
        fetchNotificationsFailure: (state, action: PayloadAction<string>) => {
            state.pollingError = action.payload;
        },

        /**
         * MARK AS READ
         * Marks a specific notification as read.
         */
        markAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.notifications.find(
                (n) => n.id === action.payload
            );
            if (notification) {
                notification.read = true;
            }
        },

        /**
         * MARK ALL AS READ
         * Marks all notifications as read.
         */
        markAllAsRead: (state) => {
            state.notifications.forEach((n) => {
                n.read = true;
            });
        },

        /**
         * CLEAR NOTIFICATIONS
         * Removes all notifications from the list.
         */
        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const {
    startPolling,
    stopPolling,
    fetchNotificationsSuccess,
    fetchNotificationsFailure,
    markAsRead,
    markAllAsRead,
    clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
