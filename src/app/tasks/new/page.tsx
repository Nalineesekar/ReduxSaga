'use client';

/**
 * =============================================================================
 * ADD NEW TASK PAGE
 * =============================================================================
 * 
 * TEACHING NOTE:
 * This page demonstrates the DEBOUNCE saga concept.
 * As you type in the form, the updateDraft action is dispatched.
 * The auto-save saga debounces these dispatches and saves the draft
 * 1 second after the user stops typing.
 * 
 * Watch the auto-save indicator and console logs to see it in action!
 * =============================================================================
 */

import { useRouter } from 'next/navigation';
import TaskForm from '@/components/TaskForm';

export default function NewTaskPage() {
    const router = useRouter();

    return (
        <div>
            <div className="page-header">
                <h1>➕ Add New Task</h1>
                <p>
                    Create a new task. <strong>Debounce demo:</strong> Your draft is
                    auto-saved 1 second after you stop typing.
                    <br />
                    <small>
                        Saga concept: <code>debounce(1000, updateDraft.type, handleAutoSave)</code>
                    </small>
                </p>
            </div>

            <TaskForm onSuccess={() => router.push('/tasks')} />
        </div>
    );
}
