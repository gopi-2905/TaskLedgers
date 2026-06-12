import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Wallet, Menu, Activity } from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard Overview';
      case '/tasks': return 'Task Management';
      case '/expenses': return 'Expense Tracker';
      default: return 'Overview';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/logo.png" alt="TaskLedger Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
            <div>
              <h1>TaskLedger</h1>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Menu</div>
          <ul>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <LayoutDashboard className="nav-icon" size={18} /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <CheckSquare className="nav-icon" size={18} /> Tasks
              </NavLink>
            </li>
            <li>
              <NavLink to="/expenses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <Wallet className="nav-icon" size={18} /> Expenses
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <p id="sidebar-date">
            {time.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
          <p id="sidebar-time" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h2>{getPageTitle()}</h2>
            <p>Welcome back! Here's what's happening today.</p>
          </div>
          <div className="topbar-right">
            <button className="topbar-btn menu-toggle" onClick={toggleSidebar}>
              <Menu size={18} />
            </button>

          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
