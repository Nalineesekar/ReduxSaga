'use client';

/**
 * =============================================================================
 * PROFILE PAGE
 * =============================================================================
 * 
 * Displays user profile. Fetches profile via sage.
 * 
 * TEACHING NOTE:
 * The profile data is fetched using the parallel saga's profile handler
 * which uses call + put pattern.
 * =============================================================================
 */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProfileRequest } from '@/store/slices/profileSlice';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

export default function ProfilePage() {
    const dispatch = useAppDispatch();
    const { profile, loading, error } = useAppSelector((state) => state.profile);
    const { isAuthenticated, user: authUser } = useAppSelector(
        (state) => state.auth
    );

    useEffect(() => {
        dispatch(fetchProfileRequest());
    }, [dispatch]);

    // Use auth user if available, otherwise use fetched profile
    const displayUser = authUser || profile;

    return (
        <div>
            <div className="page-header">
                <h1>👤 User Profile</h1>
                <p>
                    {isAuthenticated
                        ? 'Your profile information'
                        : 'Profile data fetched via saga (call + put)'}
                </p>
            </div>

            {loading && <LoadingSpinner message="Fetching profile via saga..." />}

            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={() => dispatch(fetchProfileRequest())}
                />
            )}

            {!loading && displayUser && (
                <div className="profile-card">
                    <div className="profile-avatar">{displayUser.avatar}</div>
                    <div className="profile-name">{displayUser.name}</div>
                    <div className="profile-email">{displayUser.email}</div>
                    <div className="profile-role">{displayUser.role}</div>
                    <div className="profile-bio">{displayUser.bio}</div>
                    <div className="profile-joined">
                        📅 Joined: {new Date(displayUser.joinedAt).toLocaleDateString()}
                    </div>
                </div>
            )}

            {!loading && !displayUser && !error && (
                <p className="empty-state">
                    No profile data available. Try logging in first!
                </p>
            )}
        </div>
    );
}
