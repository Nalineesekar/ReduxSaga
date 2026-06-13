'use client';

/**
 * =============================================================================
 * TASKS LIST PAGE
 * =============================================================================
 * 
 * Displays all tasks with filtering options.
 * Demonstrates fetchTasksRequest → tasksSaga (takeLatest).
 * =============================================================================
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchTasksRequest } from '@/store/slices/tasksSlice';
import TaskCard from '@/components/TaskCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { TaskStatus, TaskPriority } from '@/types';

export default function TasksPage() {
    const dispatch = useAppDispatch();
    const { tasks, loading, error } = useAppSelector((state) => state.tasks);

    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');

    useEffect(() => {
        dispatch(fetchTasksRequest());
    }, [dispatch]);

    const filteredTasks = tasks.filter((task) => {
        if (statusFilter !== 'all' && task.status !== statusFilter) return false;
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
        return true;
    });

    return (
        <div>
            <div className="page-header">
                <h1>📋 All Tasks</h1>
                <p>
                    Manage your tasks. Uses <code>takeLatest</code> for fetching and{' '}
                    <code>takeEvery</code> for CRUD actions.
                </p>
            </div>

            {/* Filters & Actions */}
            <div className="dashboard-actions">
                <Link href="/tasks/new" className="btn btn-primary">
                    ➕ Add New Task
                </Link>
                <button
                    className="btn btn-secondary"
                    onClick={() => {
                        console.log('👆 [UI] Dispatching fetchTasksRequest (takeLatest)');
                        dispatch(fetchTasksRequest());
                    }}
                >
                    🔄 Refresh
                </button>

                <select
                    className="status-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                >
                    <option value="all">All Statuses</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                </select>

                <select
                    className="status-select"
                    value={priorityFilter}
                    onChange={(e) =>
                        setPriorityFilter(e.target.value as TaskPriority | 'all')
                    }
                >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>

            {/* Loading / Error / Content */}
            {loading && <LoadingSpinner message="Fetching tasks via saga..." />}

            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={() => dispatch(fetchTasksRequest())}
                />
            )}

            {!loading && !error && filteredTasks.length === 0 && (
                <p className="empty-state">
                    {tasks.length === 0
                        ? 'No tasks yet. Create your first task!'
                        : 'No tasks match the current filters.'}
                </p>
            )}

            {!loading && !error && filteredTasks.length > 0 && (
                <div className="task-grid">
                    {filteredTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            )}
        </div>
    );
}
