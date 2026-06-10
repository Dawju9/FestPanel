import { useGame } from '../../context/GameContext';

export default function BadgeModal({ badge, onClose }) {
  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 200, 200);

    ctx.fillStyle = '#ff2200';
    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badge.icon, 100, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(badge.name, 100, 130);

    ctx.fillStyle = '#888888';
    ctx.font = '12px sans-serif';
    ctx.fillText(new Date().toLocaleDateString('pl-PL'), 100, 160);

    const link = document.createElement('a');
    link.download = `badge_${badge.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content badge-modal" onClick={(e) => e.stopPropagation()}>
        <div className="badge-modal-icon">{badge.icon}</div>
        <h2 className="badge-modal-name">{badge.name}</h2>
        <p className="badge-modal-desc">
          Gratulacje! Zdobyłeś nową odznakę!
        </p>
        <button className="badge-download-btn" onClick={handleDownload}>
          📥 Pobierz odznakę
        </button>
        <div className="modal-buttons" style={{ marginTop: '15px' }}>
          <button className="btn-game btn-primary" onClick={onClose}>
            Super! 🎉
          </button>
        </div>
      </div>
    </div>
  );
}