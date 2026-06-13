'use client';

/**
 * =============================================================================
 * TASK DETAIL PAGE
 * =============================================================================
 * 
 * Shows full details of a single task.
 * Loads tasks from Redux state (or fetches if not loaded yet).
 * =============================================================================
 */

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchTasksRequest, deleteTaskRequest } from '@/store/slices/tasksSlice';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

export default function TaskDetailPage() {
    const params = useParams();
    const taskId = params.id as string;
    const dispatch = useAppDispatch();
    const { tasks, loading, error } = useAppSelector((state) => state.tasks);

    const task = tasks.find((t) => t.id === taskId);

    useEffect(() => {
        if (tasks.length === 0) {
            dispatch(fetchTasksRequest());
        }
    }, [dispatch, tasks.length]);

    if (loading) return <LoadingSpinner message="Loading task..." />;
    if (error) {
        return (
            <ErrorMessage
                message={error}
                onRetry={() => dispatch(fetchTasksRequest())}
            />
        );
    }
    if (!task) {
        return (
            <div>
                <p className="empty-state">Task not found.</p>
                <Link href="/tasks" className="btn btn-secondary">
                    ← Back to Tasks
                </Link>
            </div>
        );
    }

    const priorityColors: Record<string, string> = {
        low: '#4caf50',
        medium: '#ff9800',
        high: '#f44336',
    };

    const statusLabels: Record<string, string> = {
        'todo': '📋 To Do',
        'in-progress': '🔄 In Progress',
        'done': '✅ Done',
    };

    return (
        <div>
            <Link href="/tasks" style={{ marginBottom: '16px', display: 'inline-block' }}>
                ← Back to Tasks
            </Link>

            <div className="task-detail">
                <div className="task-card-header">
                    <span
                        className="priority-badge"
                        style={{ backgroundColor: priorityColors[task.priority] }}
                    >
                        {task.priority.toUpperCase()}
                    </span>
                    <span className="status-badge">{statusLabels[task.status]}</span>
                </div>

                <h2>{task.title}</h2>

                <div className="task-detail-meta">
                    <div className="meta-item">
                        <strong>Assignee</strong>
                        👤 {task.assignee}
                    </div>
                    <div className="meta-item">
                        <strong>Due Date</strong>
                        📅 {task.dueDate}
                    </div>
                    <div className="meta-item">
                        <strong>Created</strong>
                        🕐 {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                    <div className="meta-item">
                        <strong>Tags</strong>
                        {task.tags.map((t) => (
                            <span key={t} className="tag" style={{ marginRight: '4px' }}>
                                {t}
                            </span>
                        ))}
                    </div>
                </div>

                <h3 style={{ marginBottom: '8px' }}>Description</h3>
                <div className="task-detail-description">{task.description}</div>

                <div className="task-detail-actions">
                    <Link href={`/tasks/${task.id}/edit`} className="btn btn-primary">
                        ✏️ Edit Task
                    </Link>
                    <button
                        className="btn btn-danger"
                        onClick={() => {
                            if (confirm('Delete this task?')) {
                                dispatch(deleteTaskRequest(task.id));
                            }
                        }}
                    >
                        🗑️ Delete Task
                    </button>
                </div>
            </div>
        </div>
    );
}
