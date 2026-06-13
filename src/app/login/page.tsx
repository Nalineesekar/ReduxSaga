'use client';

/**
 * =============================================================================
 * LOGIN PAGE
 * =============================================================================
 * 
 * Simulated login form. Dispatches loginRequest which the auth saga handles.
 * 
 * TEACHING NOTE:
 * When the user clicks "Login", we dispatch loginRequest(credentials).
 * The auth saga (watchAuth) catches this with takeLatest and:
 * 1. Calls fakeLogin API (yield call)
 * 2. On success: dispatches loginSuccess (yield put)
 * 3. On failure: dispatches loginFailure (yield put)
 * =============================================================================
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginRequest } from '@/store/slices/authSlice';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

export default function LoginPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { loading, error, isAuthenticated } = useAppSelector(
        (state) => state.auth
    );

    const [email, setEmail] = useState('alice@university.edu');
    const [password, setPassword] = useState('password123');

    // Redirect after login — must be in useEffect to avoid setState during render
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('👆 [UI] Dispatching loginRequest → auth saga handles this');
        dispatch(loginRequest({ email, password }));
    };

    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>🔐 Student Login</h2>

                {error && <ErrorMessage message={error} />}

                {loading ? (
                    <LoadingSpinner message="Logging in... (auth saga is calling fakeLogin API)" />
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
                            🔑 Login
                        </button>
                    </form>
                )}

                <div className="login-hint">
                    <p>
                        <strong>Demo Credentials:</strong>
                    </p>
                    <p>
                        Email: <code>alice@university.edu</code>
                    </p>
                    <p>
                        Password: <code>password123</code>
                    </p>
                    <br />
                    <p>
                        <strong>Saga Concept:</strong> Uses <code>takeLatest</code>,{' '}
                        <code>call</code>, <code>put</code>, <code>select</code>
                    </p>
                </div>
            </div>
        </div>
    );
}
