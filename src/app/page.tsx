'use client';

/**
 * =============================================================================
 * DASHBOARD PAGE
 * =============================================================================
 * 
 * The main landing page showing:
 * - Stats overview (task counts by status)
 * - Quick action buttons
 * - Recent tasks
 * 
 * TEACHING NOTE:
 * This page dispatches fetchTasksRequest on mount.
 * The tasks saga catches this with takeLatest and fetches data.
 * =============================================================================
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchTasksRequest } from '@/store/slices/tasksSlice';
import TaskCard from '@/components/TaskCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Fetch tasks when the page loads
  useEffect(() => {
    dispatch(fetchTasksRequest());
  }, [dispatch]);

  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <div>
      <div className="page-header">
        <h1>📊 Dashboard</h1>
        <p>
          {isAuthenticated
            ? `Welcome back, ${user?.name}!`
            : 'Welcome! Please login to manage your tasks.'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            {todoCount}
          </div>
          <div className="stat-label">📋 To Do</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {inProgressCount}
          </div>
          <div className="stat-label">🔄 In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#22c55e' }}>
            {doneCount}
          </div>
          <div className="stat-label">✅ Completed</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-actions">
        <Link href="/tasks/new" className="btn btn-primary">
          ➕ Add New Task
        </Link>
        <button
          className="btn btn-secondary"
          onClick={() => dispatch(fetchTasksRequest())}
        >
          🔄 Refresh Tasks
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => dispatch({ type: 'parallel/loadDashboard' })}
        >
          🔀 Parallel Load (Fork/Spawn Demo)
        </button>
      </div>

      {/* Task List */}
      <h2 className="section-title">📋 Recent Tasks</h2>

      {loading && <LoadingSpinner message="Fetching tasks..." />}

      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => dispatch(fetchTasksRequest())}
        />
      )}

      {!loading && !error && tasks.length === 0 && (
        <p className="empty-state">No tasks yet. Create your first task!</p>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="task-grid">
          {tasks.slice(0, 4).map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {tasks.length > 4 && (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link href="/tasks" className="btn btn-secondary">
            View All Tasks →
          </Link>
        </div>
      )}
    </div>
  );
}
