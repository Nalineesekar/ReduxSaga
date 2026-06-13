'use client';

/**
 * =============================================================================
 * NOTIFICATION PANEL COMPONENT
 * =============================================================================
 * 
 * Displays notifications and controls for background polling.
 * Demonstrates the fork/cancel/cancelled saga pattern.
 * 
 * TEACHING NOTE:
 * The Start/Stop Polling buttons dispatch actions that the notification
 * saga watches. The saga uses fork() to start a background polling loop,
 * and cancel() to stop it when the user clicks "Stop".
 * =============================================================================
 */

import { useAppSelector, useAppDispatch } from '@/store';
import {
    startPolling,
    stopPolling,
    markAsRead,
    markAllAsRead,
    clearNotifications,
} from '@/store/slices/notificationsSlice';

export default function NotificationPanel() {
    const dispatch = useAppDispatch();
    const { notifications, polling, pollingError } = useAppSelector(
        (state) => state.notifications
    );

    const unreadCount = notifications.filter((n) => !n.read).length;

    const typeIcons: Record<string, string> = {
        info: 'ℹ️',
        warning: '⚠️',
        success: '✅',
        error: '❌',
    };

    return (
        <div className="notification-panel">
            <div className="notification-header">
                <h3>
                    🔔 Notifications
                    {unreadCount > 0 && (
                        <span className="badge">{unreadCount} unread</span>
                    )}
                </h3>

                <div className="notification-controls">
                    {/* ── Polling Controls (Fork/Cancel Demo) ──────────────────── */}
                    {!polling ? (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                                console.log(
                                    '👆 [UI] Dispatching startPolling → triggers fork() in saga'
                                );
                                dispatch(startPolling());
                            }}
                        >
                            ▶️ Start Polling
                        </button>
                    ) : (
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                                console.log(
                                    '👆 [UI] Dispatching stopPolling → triggers cancel() in saga'
                                );
                                dispatch(stopPolling());
                            }}
                        >
                            ⏹️ Stop Polling
                        </button>
                    )}

                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => dispatch(markAllAsRead())}
                    >
                        ✓ Mark All Read
                    </button>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => dispatch(clearNotifications())}
                    >
                        🗑️ Clear
                    </button>
                </div>
            </div>

            {polling && (
                <div className="polling-status">
                    <span className="pulse">●</span> Polling active — fetching every 5 seconds
                    <br />
                    <small>
                        📌 Saga concept: <code>fork()</code> starts the background loop,{' '}
                        <code>cancel()</code> stops it. Check console for logs.
                    </small>
                </div>
            )}

            {pollingError && (
                <div className="polling-error">
                    ⚠️ Polling error: {pollingError} (will retry automatically)
                </div>
            )}

            {notifications.length === 0 ? (
                <p className="empty-state">No notifications yet. Start polling to receive some!</p>
            ) : (
                <div className="notification-list">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                            onClick={() => dispatch(markAsRead(notif.id))}
                        >
                            <span className="notif-icon">{typeIcons[notif.type]}</span>
                            <div className="notif-content">
                                <p>{notif.message}</p>
                                <small>
                                    {new Date(notif.timestamp).toLocaleTimeString()}
                                    {!notif.read && ' • Click to mark as read'}
                                </small>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
