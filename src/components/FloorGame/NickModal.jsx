import { useState } from 'react';
import { useGame } from '../../context/GameContext';

export default function NickModal() {
  const { setNickname } = useGame();
  const [nickname, setNicknameState] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nickname.trim().length >= 2) {
      setNickname(nickname);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">🎮 Witaj w grze!</h2>
        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
          Wprowadź swój pseudonim, aby zapisać postęp
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="modal-input"
            placeholder="Twój nick..."
            value={nickname}
            onChange={(e) => setNicknameState(e.target.value)}
            minLength={2}
            maxLength={20}
            autoFocus
          />
          <div className="modal-buttons">
            <button type="submit" className="btn-game btn-primary">
              Start!
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}