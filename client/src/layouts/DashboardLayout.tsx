import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo3D } from '../components/BrandLogo3D';
import { ThemeToggle } from '../components/ThemeToggle';
import { Icon } from '../Icons';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('formenclave_sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('formenclave_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="app-sidebar-layout">
      {/* Mobile Top Navigation Bar */}
      <header className="mobile-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            <Icon name={mobileOpen ? 'x' : 'menu'} size={18} />
          </button>
          <BrandLogo3D logoSize={30} fontSize="16px" onClick={() => navigate('/dashboard')} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeToggle size="sm" />
          <div className="sidebar-user-avatar" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Left Vertical Sidebar Navigation */}
      <aside className={`sidebar-shell ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div>
          {/* Sidebar Brand Header & Minimize/Maximize Toggle Button */}
          <div className="sidebar-brand-wrapper">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
              onClick={() => navigate('/dashboard')}
              title="Go to Dashboard"
            >
              <BrandLogo3D
                logoSize={isCollapsed ? 32 : 36}
                fontSize="17px"
                showText={!isCollapsed}
              />
            </div>

            {/* Desktop Collapse / Mobile Close Button */}
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={toggleSidebar}
              title={isCollapsed ? 'Maximize sidebar' : 'Minimize sidebar'}
              aria-label={isCollapsed ? 'Maximize sidebar' : 'Minimize sidebar'}
            >
              <Icon name={isCollapsed ? 'chevron-right' : 'chevron-left'} size={15} />
            </button>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="sidebar-menu-list">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
              title="Dashboard"
            >
              <Icon name="grid" size={18} />
              {!isCollapsed && <span className="menu-label">Dashboard</span>}
            </NavLink>

            <NavLink
              to="/my-forms"
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
              title="My Forms"
            >
              <Icon name="textarea" size={18} />
              {!isCollapsed && <span className="menu-label">My Forms</span>}
            </NavLink>

            <NavLink
              to="/analytics"
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
              title="Analytics"
            >
              <Icon name="chart" size={18} />
              {!isCollapsed && <span className="menu-label">Analytics</span>}
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
              title="Settings"
            >
              <Icon name="settings" size={18} />
              {!isCollapsed && <span className="menu-label">Settings</span>}
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Bottom User Profile & Theme Toggle */}
        <div className="sidebar-user-footer">
          <div
            className="sidebar-user-info"
            title={`${user.name} (${user.email})`}
          >
            <div className="sidebar-user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <span className="sidebar-user-name">{user.name.split(' ')[0]}</span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: isCollapsed ? 'column' : 'row',
              gap: '4px'
            }}
          >
            <ThemeToggle size="sm" />
            <button
              type="button"
              className="icon-btn"
              onClick={handleSignOut}
              title="Sign out"
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}
            >
              <Icon name="logout" size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Right Workspace Main Content Area */}
      <main className="workspace-main-area">
        <div className="workspace-content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
