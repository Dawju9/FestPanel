import { useState } from 'react';
import { useGame } from '../../context/GameContext';

export default function ProfileWidget() {
  const { player, setShowProfileModal } = useGame();

  if (!player.nickname) return null;

  return (
    <div className="profile-widget">
      <button 
        className="profile-widget-btn"
        onClick={() => setShowProfileModal(true)}
        title="Mój profil"
      >
        🎮
      </button>
    </div>
  );
}