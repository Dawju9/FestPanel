import { useGame } from '../../context/GameContext';

export default function LevelComplete() {
  const { currentRoom, timer, placedPanels, setCurrentRoom, currentLevel, setCurrentLevel, calculateScore } = useGame();

  const result = calculateScore();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStars = (count) => {
    return '⭐'.repeat(count) + '☆'.repeat(3 - count);
  };

  const handleNextLevel = () => {
    setCurrentRoom(null);
    setCurrentLevel(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content level-complete">
        <h2 className="level-complete-title">🎉 Ukończono!</h2>
        <p className="level-complete-subtitle">{currentRoom?.name}</p>
        
        <div className="level-complete-stars">
          {renderStars(result.stars)}
        </div>

        <div className="level-complete-stats">
          <div className="stat-item">
            <div className="stat-item-value">+{result.points}</div>
            <div className="stat-item-label">Punkty</div>
          </div>
          <div className="stat-item">
            <div className="stat-item-value">{formatTime(timer)}</div>
            <div className="stat-item-label">Czas</div>
          </div>
          <div className="stat-item">
            <div className="stat-item-value">{result.materials}%</div>
            <div className="stat-item-label">Materiał</div>
          </div>
        </div>

        <div className="modal-buttons">
          <button className="btn-game btn-secondary" onClick={handleNextLevel}>
            ← Wybierz inny pokój
          </button>
        </div>
      </div>
    </div>
  );
}