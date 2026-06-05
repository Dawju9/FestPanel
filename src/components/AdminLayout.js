import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/js/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a1a',
        color: '#ffffff',
        fontSize: '18px',
      }}>
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
    { path: '/js/auth/logs/viewer', label: 'Log Viewer', icon: '📜' },
    { path: '/js/auth/crawler_overview', label: 'Crawler Overview', icon: '🕷️' },
    { path: '/js/auth/crawler', label: 'Crawler', icon: '⚙️' },
    { path: '/js/auth/results', label: 'Results', icon: '📋' },
    { path: '/js/auth/todo', label: 'To Do', icon: '✅' },
    { path: '/js/auth/keywords', label: 'Keywords', icon: '🔑' },
    { path: '/js/auth/logs', label: 'Logs', icon: '📝' },
    { path: '/js/auth/reports', label: 'Reports', icon: '📈' },
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <aside style={{
        width: '250px',
        background: '#1a1a1a',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #333',
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 800,
            letterSpacing: '-1px',
          }}>
            <span style={{ color: '#ffffff' }}>Fest</span>
            <span style={{ color: '#D32F2F' }}>Panel</span>
          </h2>
          <p style={{
            fontSize: '12px',
            color: '#666',
            marginTop: '4px',
          }}>
            Staff Admin Area
          </p>
        </div>

        <nav style={{
          flex: 1,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {navItems.map(item => {
            const isActive = currentPath === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? '#ffffff' : '#999999',
                  background: isActive ? '#D32F2F' : 'transparent',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.background = '#333';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid #333',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
            padding: '8px 12px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#D32F2F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 700,
              color: '#ffffff',
            }}>
              {session.user.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{session.user.name}</p>
              <p style={{ fontSize: '11px', color: '#666' }}>Admin</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/js/auth/login' })}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #333',
              borderRadius: '8px',
              background: 'transparent',
              color: '#999',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.target.style.background = '#333'; e.target.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#999'; }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main style={{
        flex: 1,
        marginLeft: '250px',
        padding: '32px',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  );
}