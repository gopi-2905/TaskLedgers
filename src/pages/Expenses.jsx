import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Wallet } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://backend-taskledger.onrender.com/api';

const formatCurrency = (amount) => {
  return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({ monthSpent: 0, topCategory: 'N/A' });
  const [filterMonth, setFilterMonth] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], description: '' });

  useEffect(() => {
    fetchExpenses();
  }, [filterMonth]);

  const fetchExpenses = async () => {
    try {
      let url = `${API_BASE}/expenses?sort=date`;
      if (filterMonth) url += `&month=${filterMonth}`;
      
      const res = await axios.get(url);
      if (res.data.success) {
        setExpenses(res.data.data);
        calculateStats(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const calculateStats = (data) => {
    const total = data.reduce((sum, exp) => sum + exp.amount, 0);
    const catMap = {};
    data.forEach(exp => { catMap[exp.category] = (catMap[exp.category] || 0) + exp.amount; });
    const topCat = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a])[0] || 'N/A';
    setStats({ monthSpent: total, topCategory: topCat });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`${API_BASE}/expenses/${id}`);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const openModal = () => {
    setFormData({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], description: '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/expenses`, formData);
      setModalOpen(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '40px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Spent</span>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(stats.monthSpent)}</div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Top Category</span>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--sky-400)' }}>{stats.topCategory}</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={openModal}><Plus size={16} /> Add Expense</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '15px' }}>
          <h3>Expense Log</h3>
          <input type="month" className="form-control" style={{ width: 'auto' }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? expenses.map(exp => (
                <tr key={exp._id}>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{exp.title}</div>
                    {exp.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{exp.description}</div>}
                  </td>
                  <td><span className="category-tag">{exp.category}</span></td>
                  <td style={{ fontWeight: 'bold', color: '#FFF3E6' }}>{formatCurrency(exp.amount)}</td>
                  <td>
                    <button className="btn btn-danger btn-icon" onClick={() => handleDelete(exp._id)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5"><div className="empty-state" style={{ padding: '30px', textAlign: 'center' }}><Wallet size={40} style={{ opacity: 0.5 }} /><h4>No expenses found</h4></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay active" onClick={(e) => { if (e.target.className.includes('modal-overlay')) setModalOpen(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Expense</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title *</label>
                  <input type="text" className="form-control" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Amount (₹) *</label>
                    <input type="number" className="form-control" required min="1" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" className="form-control" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Health">Health</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Expense</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
