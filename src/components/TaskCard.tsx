'use client';

/**
 * =============================================================================
 * TASK CARD COMPONENT
 * =============================================================================
 * 
 * Displays a single task with status badge, priority indicator, and actions.
 * Used in the tasks list page \and dashboard.
 * =============================================================================
 */

import Link from 'next/link';
import { Task } from '@/types';
import { useAppDispatch } from '@/store';
import { deleteTaskRequest, updateTaskRequest } from '@/store/slices/tasksSlice';

interface TaskCardProps {
    task: Task;
    showActions?: boolean;
}

export default function TaskCard({ task, showActions = true }: TaskCardProps) {
    const dispatch = useAppDispatch();

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

    const handleStatusChange = (newStatus: 'todo' | 'in-progress' | 'done') => {
        dispatch(updateTaskRequest({ id: task.id, status: newStatus }));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            dispatch(deleteTaskRequest(task.id));
        }
    };

    return (
        <div className="task-card">
            <div className="task-card-header">
                <span
                    className="priority-badge"
                    style={{ backgroundColor: priorityColors[task.priority] }}
                >
                    {task.priority.toUpperCase()}
                </span>
                <span className="status-badge">{statusLabels[task.status]}</span>
            </div>

            <h3 className="task-title">
                <Link href={`/tasks/${task.id}`}>{task.title}</Link>
            </h3>

            <p className="task-description">
                {task.description.length > 120
                    ? task.description.substring(0, 120) + '...'
                    : task.description}
            </p>

            <div className="task-meta">
                <span>👤 {task.assignee}</span>
                <span>📅 Due: {task.dueDate}</span>
            </div>

            {task.tags.length > 0 && (
                <div className="task-tags">
                    {task.tags.map((tag) => (
                        <span key={tag} className="tag">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {showActions && (
                <div className="task-actions">
                    <select
                        value={task.status}
                        onChange={(e) =>
                            handleStatusChange(e.target.value as 'todo' | 'in-progress' | 'done')
                        }
                        className="status-select"
                    >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                    <Link href={`/tasks/${task.id}/edit`} className="btn btn-secondary btn-sm">
                        ✏️ Edit
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                        🗑️ Delete
                    </button>
                </div>
            )}
        </div>
    );
}
