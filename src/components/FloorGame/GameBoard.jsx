import { useState, useCallback, useRef } from 'react';
import { useGame } from '../../context/GameContext';

const PANEL_WIDTH_MM = 200;
const PANEL_LENGTH_MM = 1200;

export default function GameBoard() {
  const {
    currentRoom,
    currentLevel,
    placedPanels,
    placePanel,
    removePanel,
    validatePlacement,
    completeLevel,
    resetLevel,
    setCurrentRoom,
  } = useGame();

  const [draggedPanel, setDraggedPanel] = useState(null);
  const boardRef = useRef(null);

  const handleDragStart = (e) => {
    setDraggedPanel({
      width: PANEL_WIDTH_MM,
      length: PANEL_LENGTH_MM,
    });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (!boardRef.current || !currentRoom) return;

    const rect = boardRef.current.getBoundingClientRect();
    const scale = 300 / (Math.max(currentRoom.width, currentRoom.length) * 1000);
    
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const panelLength = PANEL_LENGTH_MM;
    const panelWidth = PANEL_WIDTH_MM;

    const roomWidthMM = currentRoom.width * 1000;
    const roomLengthMM = currentRoom.length * 1000;

    if (x < 0 || x > roomWidthMM || y < 0 || y > roomLengthMM) {
      return;
    }

    const col = Math.floor(x / panelWidth);
    const row = Math.floor(y / panelLength);

    const newPanel = {
      col,
      row,
      width: panelWidth,
      length: panelLength,
      x: col * panelWidth,
      y: row * panelLength,
      hasZakladki: true,
    };

    const issues = validatePlacement(newPanel, placedPanels);
    newPanel.isValid13 = issues.includes('valid_13');
    newPanel.hasError = issues.includes('wrong_offset');

    placePanel(newPanel);
    setDraggedPanel(null);
  }, [currentRoom, placedPanels, placePanel, validatePlacement]);

  const handleComplete = () => {
    completeLevel();
  };

  const handleBack = () => {
    setCurrentRoom(null);
  };

  const scale = 300 / (Math.max(currentRoom.width, currentRoom.length) * 1000);
  const boardWidth = currentRoom.width * 1000 * scale;
  const boardHeight = currentRoom.length * 1000 * scale;

  return (
    <div className="game-board">
      <div className="game-controls" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn-game btn-secondary" onClick={handleBack}>
          ← Wybór pokoju
        </button>
        <button className="btn-game btn-primary" onClick={handleComplete}>
          ✅ Zakończ
        </button>
      </div>

      <div 
        className="room-container"
        ref={boardRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          width: boardWidth + 40,
          height: boardHeight + 40,
          margin: '0 auto',
        }}
      >
        <div 
          className="room-floor"
          style={{
            width: boardWidth,
            height: boardHeight,
          }}
        >
          <div 
            className="room-window"
            data-position={currentRoom.window}
          ></div>

          {currentRoom.obstacles?.map((obs, i) => (
            <div
              key={i}
              className="room-obstacle"
              style={{
                left: obs.x * 1000 * scale,
                top: obs.y * 1000 * scale,
                width: obs.w * 1000 * scale,
                height: obs.h * 1000 * scale,
              }}
            ></div>
          ))}

          {placedPanels.map((panel) => (
            <div
              key={panel.id}
              className={`floor-panel placed ${panel.hasError ? 'error' : ''} ${panel.isValid13 ? 'correct' : ''}`}
              style={{
                left: panel.x * scale,
                top: panel.y * scale,
                width: panel.width * scale - 2,
                height: panel.length * scale - 2,
              }}
              onClick={() => removePanel(panel.id)}
              title="Kliknij aby usunąć"
            >
              {panel.hasZakladki && (
                <>
                  <div className="panel-zakladka-left"></div>
                  <div className="panel-zakladka-right"></div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="panel-rack">
        <h3 className="panel-rack-title">Przeciągnij panele na podłogę</h3>
        <div className="panel-source">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="panel-source-item"
              draggable
              onDragStart={handleDragStart}
            >
              📦
            </div>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
          Pozostało: {10 - placedPanels.length} paneli
        </p>
      </div>

      {placedPanels.length > 0 && (
        <button 
          className="btn-game btn-secondary" 
          onClick={resetLevel}
          style={{ marginTop: '15px', width: '100%' }}
        >
          🔄 Resetuj pokój
        </button>
      )}
    </div>
  );
}