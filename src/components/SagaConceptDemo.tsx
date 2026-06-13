'use client';

/**
 * =============================================================================
 * SAGA CONCEPT DEMO COMPONENT
 * =============================================================================
 * 
 * Interactive buttons that trigger advanced saga effects:
 * - Race (API vs Timeout)
 * - Throttle (spam prevention)
 * - Parallel Load (fork/spawn/all)
 * 
 * TEACHING NOTE:
 * Each button dispatches an action that the corresponding saga watches.
 * Open the browser console to see detailed saga execution logs.
 * =============================================================================
 */

import { useAppSelector, useAppDispatch } from '@/store';
import { throttledAction, raceRequest } from '@/store/slices/tasksSlice';

export default function SagaConceptDemo() {
    const dispatch = useAppDispatch();
    const {
        throttleCount,
        throttleMessage,
        raceLoading,
        raceResult,
        raceError,
    } = useAppSelector((state) => state.tasks);

    return (
        <div className="saga-demos">
            {/* ── THROTTLE DEMO ──────────────────────────────────────────────── */}
            <div className="demo-section">
                <h3>⏱️ Throttle Demo</h3>
                <p className="demo-description">
                    Click the button rapidly! The saga only processes it once every 3 seconds.
                    <br />
                    <strong>Concept:</strong> <code>throttle(3000, action, worker)</code>
                </p>
                <div className="demo-controls">
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            console.log('👆 [UI] Button clicked — dispatching throttledAction');
                            dispatch(throttledAction());
                        }}
                    >
                        🖱️ Click Me Fast! (Throttled)
                    </button>
                    <div className="demo-result">
                        <p>
                            Button clicked: <strong>{throttleCount}</strong> times
                        </p>
                        {throttleMessage && (
                            <p className="result-text">{throttleMessage}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── RACE DEMO ──────────────────────────────────────────────────── */}
            <div className="demo-section">
                <h3>🏁 Race Demo</h3>
                <p className="demo-description">
                    Races an API call (2-6s random) against a 3-second timeout.
                    <br />
                    <strong>Concept:</strong>{' '}
                    <code>race({'{'} response: call(api), timeout: delay(3000) {'}'})</code>
                </p>
                <div className="demo-controls">
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            console.log('👆 [UI] Starting race — API vs 3s timeout');
                            dispatch(raceRequest());
                        }}
                        disabled={raceLoading}
                    >
                        {raceLoading ? '⏳ Racing...' : '🏁 Start Race'}
                    </button>
                    <div className="demo-result">
                        {raceLoading && <p>🏃 Race in progress...</p>}
                        {raceResult && <p className="success-text">{raceResult}</p>}
                        {raceError && <p className="error-text">{raceError}</p>}
                    </div>
                </div>
            </div>

            {/* ── PARALLEL LOAD DEMO ─────────────────────────────────────────── */}
            <div className="demo-section">
                <h3>🔀 Parallel Load Demo</h3>
                <p className="demo-description">
                    Loads Tasks, Profile, and Notifications simultaneously.
                    <br />
                    <strong>Concepts:</strong> <code>fork()</code> (attached),{' '}
                    <code>spawn()</code> (detached), <code>all()</code> (wait for all)
                </p>
                <div className="demo-controls">
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            console.log(
                                '👆 [UI] Dispatching parallel/loadDashboard → uses fork() + spawn()'
                            );
                            dispatch({ type: 'parallel/loadDashboard' });
                        }}
                    >
                        🔀 Load with Fork/Spawn
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            console.log(
                                '👆 [UI] Dispatching parallel/loadAll → uses all() to wait'
                            );
                            dispatch({ type: 'parallel/loadAll' });
                        }}
                    >
                        📦 Load with all()
                    </button>
                </div>
                <p className="demo-note">
                    📌 <strong>fork()</strong>: Errors propagate to parent.{' '}
                    <strong>spawn()</strong>: Errors are isolated.{' '}
                    <strong>all()</strong>: Waits for everything.
                    <br />
                    Open the console to see the difference!
                </p>
            </div>

            {/* ── CONSOLE REMINDER ───────────────────────────────────────────── */}
            <div className="console-reminder">
                <p>
                    🖥️ <strong>Open your browser DevTools Console</strong> (F12 → Console tab)
                    to see detailed saga execution logs for each demo!
                </p>
            </div>
        </div>
    );
}
