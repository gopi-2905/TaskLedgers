import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, CheckCircle, Clock, AlertTriangle, FileText, Wallet } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://backend-taskledger.onrender.com/api';

const formatCurrency = (amount) => {
  return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

const Dashboard = () => {
  const [taskStats, setTaskStats] = useState(null);
  const [expenseStats, setExpenseStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskStatsRes, expenseStatsRes, tasksRes, expensesRes] = await Promise.all([
          axios.get(`${API_BASE}/tasks/stats/summary`).catch(() => ({ data: { success: false }})),
          axios.get(`${API_BASE}/expenses/stats/summary`).catch(() => ({ data: { success: false }})),
          axios.get(`${API_BASE}/tasks?sort=createdAt`).catch(() => ({ data: { success: false }})),
          axios.get(`${API_BASE}/expenses?sort=date`).catch(() => ({ data: { success: false }})),
        ]);

        if (taskStatsRes.data.success) setTaskStats(taskStatsRes.data.data);
        if (expenseStatsRes.data.success) setExpenseStats(expenseStatsRes.data.data);
        if (tasksRes.data.success) setRecentTasks(tasksRes.data.data.slice(0, 5));
        if (expensesRes.data.success) setRecentExpenses(expensesRes.data.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  const renderTaskStats = () => {
    if (!taskStats) return <p>Loading task stats...</p>;
    const { total, pending, inProgress, completed, highPriority, overdue } = taskStats;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const maxVal = Math.max(pending, inProgress, completed, 1);

    return (
      <div className="card">
        <div className="card-header">
          <h3>Task Overview</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{pct}%</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{completed} of {total} tasks completed</div>
            </div>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--grey-900)', borderRadius: '4px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--sky-500)' }}></div>
          </div>
          <div className="chart-bars">
            <div className="chart-bar-item">
              <span className="chart-bar-label">Pending</span>
              <div className="chart-bar-track">
                <div className="chart-bar-fill" style={{ width: `${(pending / maxVal) * 100}%`, background: '#FFF3E6' }}></div>
              </div>
              <span className="chart-bar-value">{pending}</span>
            </div>
            <div className="chart-bar-item">
              <span className="chart-bar-label">In Progress</span>
              <div className="chart-bar-track">
                <div className="chart-bar-fill" style={{ width: `${(inProgress / maxVal) * 100}%`, background: 'var(--sky-500)' }}></div>
              </div>
              <span className="chart-bar-value">{inProgress}</span>
            </div>
            <div className="chart-bar-item">
              <span className="chart-bar-label">Completed</span>
              <div className="chart-bar-track">
                <div className="chart-bar-fill" style={{ width: `${(completed / maxVal) * 100}%`, background: '#FFF3E6' }}></div>
              </div>
              <span className="chart-bar-value">{completed}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderExpenseStats = () => {
    if (!expenseStats) return <p>Loading expense stats...</p>;
    const { thisMonthSpent, categoryBreakdown } = expenseStats;
    const maxAmount = Math.max(...(categoryBreakdown?.map(c => c.total) || [0]), 1);

    return (
      <div className="card">
        <div className="card-header">
          <h3>Expense Overview</h3>
        </div>
        <div className="card-body">
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Spent this month</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatCurrency(thisMonthSpent)}</div>
          </div>
          {categoryBreakdown?.length > 0 ? (
            <div className="chart-bars">
              {categoryBreakdown.map(cat => (
                <div className="chart-bar-item" key={cat._id}>
                  <span className="chart-bar-label">{cat._id}</span>
                  <div className="chart-bar-track">
                    <div className="chart-bar-fill" style={{ width: `${(cat.total / maxAmount) * 100}%`, background: 'var(--sky-500)' }}></div>
                  </div>
                  <span className="chart-bar-value">{formatCurrency(cat.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No expense data</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Activity /></div>
          <div className="stat-value">{taskStats?.total || 0}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Clock /></div>
          <div className="stat-value">{taskStats?.pending || 0}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><CheckCircle /></div>
          <div className="stat-value">{taskStats?.completed || 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><AlertTriangle /></div>
          <div className="stat-value">{taskStats?.overdue || 0}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div className="grid-2">
        {renderTaskStats()}
        {renderExpenseStats()}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Recent Tasks</h3>
          </div>
          <div className="activity-list" style={{ padding: '16px 22px' }}>
            {recentTasks.length > 0 ? recentTasks.map(task => (
              <div className="activity-item" key={task._id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <span className={`status-dot ${task.status === 'completed' ? 'completed' : 'pending'}`} style={{ marginTop: '7px' }}></span>
                <div className="activity-info" style={{ flex: 1 }}>
                  <h5 style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</h5>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span className={`badge-priority priority-${task.priority}`} style={{ fontSize: '10px' }}>{task.priority}</span>
                    {task.dueDate && ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            )) : (
              <div className="empty-state" style={{ padding: '30px', textAlign: 'center' }}>
                <FileText style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <h4>No tasks yet</h4>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Expenses</h3>
          </div>
          <div className="activity-list" style={{ padding: '16px 22px' }}>
            {recentExpenses.length > 0 ? recentExpenses.map(exp => (
              <div className="activity-item" key={exp._id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <span className="activity-dot" style={{ background: 'var(--sky-500)' }}></span>
                <div className="activity-info" style={{ flex: 1 }}>
                  <h5>{exp.title}</h5>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{exp.category} · {new Date(exp.date).toLocaleDateString()}</p>
                </div>
                <span className="expense-amount" style={{ fontWeight: 'bold' }}>{formatCurrency(exp.amount)}</span>
              </div>
            )) : (
              <div className="empty-state" style={{ padding: '30px', textAlign: 'center' }}>
                <Wallet style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <h4>No expenses yet</h4>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
