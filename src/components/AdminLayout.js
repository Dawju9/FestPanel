import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth');
    }
  }, [status, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);

  if (status === 'loading') {
    return (
      <div className="admin-loading">
        Loading...
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const currentPath = router.pathname;

  const navItems = [
    { path: '/js/auth/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/js/auth/insights', label: 'Insights', icon: '🔍' },
    { path: '/js/auth/notes', label: 'Notes', icon: '📝' },
    { path: '/js/auth/reservations', label: 'Reservations', icon: '📅' },
    { path: '/js/auth/zlecenia', label: 'Zlecenia', icon: '📩' },
    { path: '/js/auth/logs/viewer', label: 'Log Viewer', icon: '📜' },
    { path: '/js/auth/crawler_overview', label: 'Crawler Overview', icon: '🕷️' },
    { path: '/js/auth/schedule', label: 'Schedule', icon: '⏰' },
    { path: '/js/auth/crawler', label: 'Crawler', icon: '⚙️' },
    { path: '/js/auth/results', label: 'Results', icon: '📋' },
    { path: '/js/auth/todo', label: 'To Do', icon: '✅' },
    { path: '/js/auth/keywords', label: 'Keywords', icon: '🔑' },
    { path: '/js/auth/logs', label: 'Logs', icon: '📝' },
    { path: '/js/auth/reports', label: 'Reports', icon: '📈' },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile header bar */}
      <header className="admin-mobile-header">
        <button
          className="admin-hamburger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="admin-mobile-brand">
          <span style={{ color: '#fff' }}>Fest</span>
          <span style={{ color: '#D32F2F' }}>Panel</span>
        </div>
      </header>

      {/* Sidebar backdrop */}
      {sidebarOpen && (
        <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar-brand">
          <h2 className="admin-sidebar-logo">
            <span style={{ color: '#fff' }}>Fest</span>
            <span style={{ color: '#D32F2F' }}>Panel</span>
          </h2>
          <p className="admin-sidebar-subtitle">Staff Admin Area</p>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map(item => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {session.user.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p className="admin-user-name">{session.user.name}</p>
              <p className="admin-user-role">Admin</p>
            </div>
          </div>
          <button
            className="admin-signout-btn"
            onClick={() => signOut({ callbackUrl: '/auth' })}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
