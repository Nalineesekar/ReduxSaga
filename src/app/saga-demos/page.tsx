'use client';

/**
 * =============================================================================
 * SAGA DEMOS PAGE
 * =============================================================================
 * 
 * Interactive demonstration page for advanced Redux Saga concepts:
 * 
 * 1. THROTTLE — Spam prevention (processes at most once every 3s)
 * 2. RACE — API call vs timeout (first to finish wins)
 * 3. PARALLEL — fork/spawn/all for concurrent operations
 * 
 * TEACHING NOTE:
 * This page is specifically designed for teaching. Each demo section
 * has buttons that trigger saga actions, and the console shows
 * detailed logs of what the saga is doing internally.
 * 
 * IMPORTANT: Open your browser's DevTools Console (F12 → Console)
 * to see the saga execution logs!
 * =============================================================================
 */

import SagaConceptDemo from '@/components/SagaConceptDemo';

export default function SagaDemosPage() {
    return (
        <div>
            <div className="page-header">
                <h1>🧪 Redux Saga Demos</h1>
                <p>
                    Interactive demonstrations of advanced saga effects.
                    <br />
                    <strong>
                        🖥️ Open your browser DevTools Console (F12) to see saga logs!
                    </strong>
                </p>
            </div>

            {/* Summary of all saga concepts in the project */}
            <div className="demo-section" style={{ marginBottom: '24px' }}>
                <h3>📖 Saga Concepts Covered in This Project</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <div>
                        <h4>Basic Effects</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li>✅ <code>takeEvery</code> — Task CRUD (every action processed)</li>
                            <li>✅ <code>takeLatest</code> — Task fetch (only latest matters)</li>
                            <li>✅ <code>call</code> — Invoke async functions</li>
                            <li>✅ <code>put</code> — Dispatch Redux actions</li>
                            <li>✅ <code>delay</code> — Pause saga execution</li>
                            <li>✅ <code>select</code> — Read Redux state in saga</li>
                        </ul>
                    </div>
                    <div>
                        <h4>Advanced Effects</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li>✅ <code>fork</code> — Background tasks (attached)</li>
                            <li>✅ <code>spawn</code> — Independent tasks (detached)</li>
                            <li>✅ <code>cancel</code> — Stop forked tasks</li>
                            <li>✅ <code>cancelled</code> — Detect cancellation</li>
                            <li>✅ <code>race</code> — Competing effects</li>
                            <li>✅ <code>debounce</code> — Auto-save on pause</li>
                            <li>✅ <code>throttle</code> — Spam prevention</li>
                            <li>✅ <code>all</code> — Parallel wait-for-all</li>
                            <li>✅ <code>take</code> — Wait for single action</li>
                        </ul>
                    </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                    <h4>Patterns</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li>✅ <strong>Watcher/Worker</strong> — All sagas use this pattern</li>
                        <li>✅ <strong>Request/Success/Failure</strong> — All async operations</li>
                        <li>✅ <strong>Background Polling</strong> — Notifications (fork + cancel)</li>
                        <li>✅ <strong>Auto-save</strong> — Task form (debounce)</li>
                        <li>✅ <strong>Timeout Race</strong> — API vs timer (race)</li>
                    </ul>
                </div>
            </div>

            {/* Interactive demos */}
            <SagaConceptDemo />
        </div>
    );
}
