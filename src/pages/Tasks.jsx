import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Check, Edit2, Trash2, AlertTriangle, ClipboardList } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://backend-taskledger.onrender.com/api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, progress: 0, done: 0 });
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium', status: 'pending', category: 'General', dueDate: '' });

  useEffect(() => {
    fetchTasks();
  }, [filterStatus, filterPriority]);

  const fetchTasks = async () => {
    try {
      let url = `${API_BASE}/tasks?`;
      if (filterStatus) url += `status=${filterStatus}&`;
      if (filterPriority) url += `priority=${filterPriority}&`;
      const res = await axios.get(url);
      if (res.data.success) {
        const data = res.data.data;
        setTasks(data);
        setStats({
          total: data.length,
          pending: data.filter(t => t.status === 'pending').length,
          progress: data.filter(t => t.status === 'in-progress').length,
          done: data.filter(t => t.status === 'completed').length
        });
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_BASE}/tasks/${id}`);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(`${API_BASE}/tasks/${id}`, { status: 'completed' });
      fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        category: task.category || 'General',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingTask(null);
      setFormData({ title: '', description: '', priority: 'medium', status: 'pending', category: 'General', dueDate: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await axios.put(`${API_BASE}/tasks/${editingTask._id}`, formData);
      } else {
        await axios.post(`${API_BASE}/tasks`, formData);
      }
      setModalOpen(false);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total</span><div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.total}</div></div>
            <div><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pending</span><div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.pending}</div></div>
            <div><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>In Progress</span><div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--sky-400)' }}>{stats.progress}</div></div>
            <div><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Completed</span><div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--sky-300)' }}>{stats.done}</div></div>
          </div>
          <button className="btn btn-primary" onClick={() => openModal()}><Plus size={16} /> Add Task</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '15px' }}>
          <h3>Task List</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select className="form-control" style={{ width: '130px', padding: '6px 10px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select className="form-control" style={{ width: '130px', padding: '6px 10px' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Category</th>
                <th>Due Date</th>
                <th style={{ width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? tasks.map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
                return (
                  <tr key={task._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`status-dot ${task.status === 'completed' ? 'completed' : 'pending'}`}></span>
                        <div>
                          <div style={{ fontWeight: 600, textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</div>
                          {task.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{task.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge-priority priority-${task.priority}`}>{task.priority}</span></td>
                    <td><span className={`badge-status badge-${task.status}`}>{task.status.replace('-', ' ')}</span></td>
                    <td><span className="category-tag">{task.category || 'General'}</span></td>
                    <td style={{ color: isOverdue ? '#FFF3E6' : 'inherit', fontWeight: isOverdue ? 600 : 'normal' }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                      {isOverdue && <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginLeft: '5px' }} />}
                    </td>
                    <td>
                      <div className="actions-cell" style={{ display: 'flex', gap: '5px' }}>
                        {task.status !== 'completed' && <button className="btn btn-ghost btn-icon" onClick={() => handleComplete(task._id)}><Check size={16} /></button>}
                        <button className="btn btn-ghost btn-icon" onClick={() => openModal(task)}><Edit2 size={16} /></button>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(task._id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="6"><div className="empty-state" style={{ padding: '30px', textAlign: 'center' }}><ClipboardList size={40} style={{ opacity: 0.5 }} /><h4>No tasks found</h4></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay active" onClick={(e) => { if (e.target.className.includes('modal-overlay')) setModalOpen(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title *</label>
                  <input type="text" className="form-control" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Priority</label>
                    <select className="form-control" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <input type="text" className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input type="date" className="form-control" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingTask ? 'Update Task' : 'Save Task'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
