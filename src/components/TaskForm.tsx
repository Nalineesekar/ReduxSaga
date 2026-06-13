'use client';

/**
 * =============================================================================
 * TASK FORM COMPONENT
 * =============================================================================
 * 
 * Form for creating and editing tasks.
 * Demonstrates auto-save (debounce) by dispatching updateDraft on every change.
 * 
 * TEACHING NOTE:
 * Every time the user types in the description field, we dispatch updateDraft.
 * The debounce saga watches this and auto-saves 1 second after typing stops.
 * =============================================================================
 */

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { createTaskRequest, updateTaskRequest, updateDraft } from '@/store/slices/tasksSlice';
import { CreateTaskPayload, Task } from '@/types';

interface TaskFormProps {
    /** If provided, the form edits an existing task */
    existingTask?: Task;
    /** Called after successful form submission */
    onSuccess?: () => void;
}

export default function TaskForm({ existingTask, onSuccess }: TaskFormProps) {
    const dispatch = useAppDispatch();
    const { loading, draftSaving, lastSavedAt } = useAppSelector(
        (state) => state.tasks
    );

    const [title, setTitle] = useState(existingTask?.title || '');
    const [description, setDescription] = useState(
        existingTask?.description || ''
    );
    const [status, setStatus] = useState<'todo' | 'in-progress' | 'done'>(
        existingTask?.status || 'todo'
    );
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
        existingTask?.priority || 'medium'
    );
    const [dueDate, setDueDate] = useState(existingTask?.dueDate || '');
    const [assignee, setAssignee] = useState(existingTask?.assignee || '');
    const [tags, setTags] = useState(existingTask?.tags.join(', ') || '');

    // ── Auto-save draft on every field change (debounce demo) ──────────────
    useEffect(() => {
        // Only auto-save for new tasks (not edits)
        if (!existingTask && (title || description)) {
            /**
             * TEACHING NOTE:
             * Every time this runs, the debounce saga's timer resets.
             * The actual save only happens 1 second after the LAST dispatch.
             * 
             * Try typing quickly and watching the console — you'll see
             * "Debounce triggered" only after you pause typing.
             */
            dispatch(
                updateDraft({
                    title,
                    description,
                    status,
                    priority,
                    dueDate,
                    assignee,
                    tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
                })
            );
        }
    }, [title, description, status, priority, dueDate, assignee, tags, dispatch, existingTask]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const taskData: CreateTaskPayload = {
            title,
            description,
            status,
            priority,
            dueDate,
            assignee,
            tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        };

        if (existingTask) {
            // Update existing task
            dispatch(updateTaskRequest({ id: existingTask.id, ...taskData }));
        } else {
            // Create new task
            dispatch(createTaskRequest(taskData));
        }

        onSuccess?.();
    };

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            {/* Auto-save indicator */}
            {!existingTask && (
                <div className="autosave-indicator">
                    {draftSaving && <span className="saving">💾 Auto-saving draft...</span>}
                    {lastSavedAt && !draftSaving && (
                        <span className="saved">
                            ✅ Draft saved at {new Date(lastSavedAt).toLocaleTimeString()}
                        </span>
                    )}
                    {!draftSaving && !lastSavedAt && title && (
                        <span className="pending">⏳ Will auto-save after you stop typing...</span>
                    )}
                </div>
            )}

            <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="description">
                    Description *
                    <small> (Auto-save triggers 1s after you stop typing)</small>
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the task in detail..."
                    rows={4}
                    required
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value as 'todo' | 'in-progress' | 'done')
                        }
                    >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="priority">Priority</label>
                    <select
                        id="priority"
                        value={priority}
                        onChange={(e) =>
                            setPriority(e.target.value as 'low' | 'medium' | 'high')
                        }
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="dueDate">Due Date</label>
                    <input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="assignee">Assignee</label>
                    <input
                        id="assignee"
                        type="text"
                        value={assignee}
                        onChange={(e) => setAssignee(e.target.value)}
                        placeholder="Student name"
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="tags">Tags (comma-separated)</label>
                <input
                    id="tags"
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., homework, react, urgent"
                />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading
                    ? '⏳ Saving...'
                    : existingTask
                        ? '✏️ Update Task'
                        : '➕ Create Task'}
            </button>
        </form>
    );
}
