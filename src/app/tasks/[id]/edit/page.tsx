'use client';

/**
 * =============================================================================
 * EDIT TASK PAGE
 * =============================================================================
 * 
 * Loads an existing task and pre-fills the form for editing.
 * =============================================================================
 */

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchTasksRequest } from '@/store/slices/tasksSlice';
import TaskForm from '@/components/TaskForm';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EditTaskPage() {
    const params = useParams();
    const router = useRouter();
    const taskId = params.id as string;
    const dispatch = useAppDispatch();
    const { tasks, loading } = useAppSelector((state) => state.tasks);

    const task = tasks.find((t) => t.id === taskId);

    useEffect(() => {
        if (tasks.length === 0) {
            dispatch(fetchTasksRequest());
        }
    }, [dispatch, tasks.length]);

    if (loading) return <LoadingSpinner message="Loading task..." />;

    if (!task) {
        return (
            <div>
                <p className="empty-state">Task not found.</p>
                <button className="btn btn-secondary" onClick={() => router.push('/tasks')}>
                    ← Back to Tasks
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1>✏️ Edit Task</h1>
                <p>Editing: {task.title}</p>
            </div>

            <TaskForm existingTask={task} onSuccess={() => router.push(`/tasks/${task.id}`)} />
        </div>
    );
}
