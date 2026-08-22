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
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  });

  // Track screen resize for mobile vs desktop mode
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // On mobile devices, the drawer is never rendered in collapsed mode
  const effectiveCollapsed = isMobile ? false : isCollapsed;

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
      <aside className={`sidebar-shell ${effectiveCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div>
          {/* Sidebar Brand Header & Minimize/Maximize or Mobile Close Button */}
          <div className="sidebar-brand-wrapper">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                minWidth: 0
              }}
              onClick={() => {
                navigate('/dashboard');
                if (isMobile) setMobileOpen(false);
              }}
              title="Go to Dashboard"
            >
              <BrandLogo3D
                logoSize={effectiveCollapsed ? 30 : 32}
                fontSize="15.5px"
                showText={!effectiveCollapsed}
              />
            </div>

            {/* Desktop Collapse / Mobile Close Button */}
            {isMobile ? (
              <button
                type="button"
                className="sidebar-toggle-btn mobile-close-btn"
                onClick={() => setMobileOpen(false)}
                title="Close menu"
                aria-label="Close menu"
              >
                <Icon name="x" size={17} />
              </button>
            ) : (
              <button
                type="button"
                className="sidebar-toggle-btn"
                onClick={toggleSidebar}
                title={effectiveCollapsed ? 'Maximize sidebar' : 'Minimize sidebar'}
                aria-label={effectiveCollapsed ? 'Maximize sidebar' : 'Minimize sidebar'}
              >
                <Icon name={effectiveCollapsed ? 'panel-left-open' : 'panel-left-close'} size={17} />
              </button>
            )}
          </div>

          {/* Sidebar Menu Items */}
          <nav className="sidebar-menu-list">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
              title="Dashboard"
              onClick={() => isMobile && setMobileOpen(false)}
            >
              <Icon name="grid" size={18} />
              <span className="menu-label">Dashboard</span>
            </NavLink>

            <NavLink
              to="/my-forms"
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
              title="My Forms"
              onClick={() => isMobile && setMobileOpen(false)}
            >
              <Icon name="textarea" size={18} />
              <span className="menu-label">My Forms</span>
            </NavLink>

            <NavLink
              to="/analytics"
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
              title="Analytics"
              onClick={() => isMobile && setMobileOpen(false)}
            >
              <Icon name="chart" size={18} />
              <span className="menu-label">Analytics</span>
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
              title="Settings"
              onClick={() => isMobile && setMobileOpen(false)}
            >
              <Icon name="settings" size={18} />
              <span className="menu-label">Settings</span>
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
            <span className="sidebar-user-name">{user.name.split(' ')[0]}</span>
          </div>

          <div className="sidebar-user-actions">
            <ThemeToggle size="sm" className="sidebar-theme-toggle" />
            <button
              type="button"
              className="icon-btn sidebar-logout-btn"
              onClick={handleSignOut}
              title="Sign out"
              aria-label="Sign out"
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

