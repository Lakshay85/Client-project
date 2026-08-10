import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo3D } from '../components/BrandLogo3D';
import { Button3D } from '../components/Button3D';
import { Icon } from '../Icons';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="app-sidebar-layout">
      {/* Left Vertical Sidebar Navigation */}
      <aside className="sidebar-shell">
        <div>
          {/* Sidebar Brand Header with Transparent Logo */}
          <div style={{ padding: '16px 20px 24px' }}>
            <BrandLogo3D logoSize={46} showText={false} onClick={() => navigate('/dashboard')} />
          </div>

          {/* Sidebar Menu Items */}
          <nav className="sidebar-menu-list">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
            >
              <Icon name="grid" size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/my-forms"
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
            >
              <Icon name="textarea" size={18} />
              <span>My Forms</span>
            </NavLink>

            <NavLink
              to="/analytics"
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
            >
              <Icon name="chart" size={18} />
              <span>Analytics</span>
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
            >
              <Icon name="settings" size={18} />
              <span>Settings</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Bottom User Profile */}
        <div className="sidebar-user-footer">
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="sidebar-user-name">{user.name.split(' ')[0]}</span>
          </div>
          <Button3D variant="ghost" size="sm" onClick={handleSignOut} title="Sign out">
            <Icon name="logout" size={16} />
          </Button3D>
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
