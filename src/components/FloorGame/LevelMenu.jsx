import { useState } from 'react';
import { useGame } from '../../context/GameContext';

export default function LevelMenu() {
  const { levels, player, startLevel } = useGame();
  const [activeTab, setActiveTab] = useState(1);

  const getRoomStars = (roomId) => {
    const stats = player.levelStats[roomId];
    return stats?.stars || 0;
  };

  const isRoomCompleted = (roomId) => {
    return player.completedLevels.includes(roomId);
  };

  const renderStars = (count) => {
    return '⭐'.repeat(count) + '☆'.repeat(3 - count);
  };

  return (
    <div className="level-menu">
      <h2 className="level-menu-title">Wybierz pokój</h2>
      
      <div className="level-tabs">
        {Object.values(levels).map((level) => (
          <button
            key={level.id}
            className={`level-tab ${activeTab === level.id ? 'active' : ''}`}
            onClick={() => setActiveTab(level.id)}
          >
            {level.name}
          </button>
        ))}
      </div>

      <div className="level-rooms">
        {levels[activeTab]?.rooms.map((room) => {
          const stars = getRoomStars(`${activeTab}-${room.id}`);
          const completed = isRoomCompleted(`${activeTab}-${room.id}`);
          
          return (
            <button
              key={room.id}
              className={`level-room ${completed ? 'completed' : ''}`}
              onClick={() => startLevel(activeTab, room.id)}
            >
              <div className="level-room-name">{room.name}</div>
              <div className="level-room-info">
                {room.width}m × {room.length}m
              </div>
              <div className="level-room-stars">
                {completed ? renderStars(stars) : '○ ○ ○'}
              </div>
            </button>
          );
        })}
      </div>

      <div className="instructions-panel">
        <h3 className="instructions-title">📐 Technika 1/3</h3>
        <ol className="instructions-list">
          <li>Pierwszy rząd: panele od lewej do prawej (pełne)</li>
          <li>Drugi rząd: zacznij od 1/3 panelu (przesunięcie)</li>
          <li>Trzeci rząd: zacznij od 2/3 panelu</li>
          <li>Czwarty rząd: powtórz od pełnego panelu</li>
          <li>Pamiętaj o zakładkach (ząbki na krawędziach)</li>
        </ol>
        <div className="instructions-diagram">
          <div className="diagram-row">
            <div className="diagram-panel" style={{ width: '80px' }}></div>
          </div>
          <div className="diagram-row">
            <div className="diagram-panel offset-1" style={{ width: '80px' }}></div>
          </div>
          <div className="diagram-row">
            <div className="diagram-panel offset-2" style={{ width: '80px' }}></div>
          </div>
          <div className="diagram-row">
            <div className="diagram-panel" style={{ width: '80px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}