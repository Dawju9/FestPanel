import { useGame } from '../../context/GameContext';

export default function ProfileModal() {
  const { player, setShowProfileModal, getBadgeById } = useGame();

  const handleLogout = () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'floorgame_player=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      window.location.reload();
    }
  };

  const BADGES = [
    { id: 'first_room', name: 'Pierwsze kroki', condition: () => true, icon: '🏠' },
    { id: 'master_13', name: 'Mistrz 1/3', condition: () => true, icon: '📐' },
    { id: 'speed_demon', name: 'Szybki Montaż', condition: () => true, icon: '⚡' },
    { id: 'saver', name: 'Oszczędny', condition: () => true, icon: '🎯' },
    { id: 'streak_5', name: 'Seria', condition: () => true, icon: '🔥' },
    { id: 'professional', name: 'Zawodowiec', condition: () => true, icon: '⭐' },
    { id: 'expert', name: 'Ekspert', condition: () => true, icon: '🌟' },
    { id: 'master_panel', name: 'Mistrz Paneli', condition: () => true, icon: '👑' },
    { id: 'grand_master', name: 'Wielki Mistrz', condition: () => true, icon: '🏆' },
  ];

  const progressPercent = Math.round((player.completedLevels.length / 30) * 100);

  return (
    <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
      <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <div className="profile-avatar">🎮</div>
          <div>
            <div className="profile-name">{player.nickname}</div>
            <div className="profile-points">{player.totalPoints} punktów</div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-value">{player.completedLevels.length}</div>
            <div className="profile-stat-label">Pokoi</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{player.badges.length}</div>
            <div className="profile-stat-label">Odznak</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{player.longestStreak}</div>
            <div className="profile-stat-label">Seria</div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Postęp</span>
            <span style={{ fontSize: '14px', color: '#666' }}>{progressPercent}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="profile-badges">
          <h3 className="profile-badges-title">Odznaki</h3>
          <div className="profile-badges-list">
            {BADGES.map((badge) => {
              const owned = player.badges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`profile-badge ${!owned ? 'locked' : ''}`}
                  title={badge.name}
                >
                  {badge.icon}
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-buttons">
          <button className="btn-game btn-secondary" onClick={handleLogout}>
            Wyloguj
          </button>
          <button className="btn-game btn-primary" onClick={() => setShowProfileModal(false)}>
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}