'use client';

/**
 * =============================================================================
 * NAVBAR COMPONENT
 * =============================================================================
 * 
 * Navigation bar with links, auth status, and notification count.
 * Demonstrates reading Redux state with useAppSelector.
 * =============================================================================
 */

import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store';
import { logoutRequest } from '@/store/slices/authSlice';

export default function Navbar() {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const { notifications } = useAppSelector((state) => state.notifications);
    const dispatch = useAppDispatch();

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link href="/">📚 Student Task Manager</Link>
            </div>

            <div className="navbar-links">
                <Link href="/">Dashboard</Link>
                <Link href="/tasks">Tasks</Link>
                <Link href="/tasks/new">Add Task</Link>
                <Link href="/notifications">
                    🔔 Notifications
                    {unreadCount > 0 && (
                        <span className="badge">{unreadCount}</span>
                    )}
                </Link>
                <Link href="/profile">Profile</Link>
                <Link href="/saga-demos">Saga Demos</Link>
            </div>

            <div className="navbar-auth">
                {isAuthenticated ? (
                    <div className="auth-info">
                        <span>{user?.avatar} {user?.name}</span>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => dispatch(logoutRequest())}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link href="/login" className="btn btn-primary btn-sm">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}
