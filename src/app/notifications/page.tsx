'use client';

/**
 * =============================================================================
 * NOTIFICATIONS PAGE
 * =============================================================================
 * 
 * TEACHING NOTE:
 * This page demonstrates the fork/cancel/cancelled saga pattern.
 * 
 * Click "Start Polling" → saga forks a background task that fetches
 * notifications every 5 seconds.
 * 
 * Click "Stop Polling" → saga cancels the forked task.
 * The cancelled() effect in the finally block logs the cleanup.
 * 
 * Open the console to see detailed logs of the fork/cancel lifecycle!
 * =============================================================================
 */

import NotificationPanel from '@/components/NotificationPanel';

export default function NotificationsPage() {
    return (
        <div>
            <div className="page-header">
                <h1>🔔 Notifications</h1>
                <p>
                    <strong>Saga concepts demonstrated:</strong>{' '}
                    <code>fork()</code>, <code>cancel()</code>, <code>cancelled()</code>,{' '}
                    <code>take()</code>
                </p>
                <p>
                    Start/stop background polling to see fork and cancel in action.
                    Check the browser console for detailed saga logs!
                </p>
            </div>

            <NotificationPanel />
        </div>
    );
}
